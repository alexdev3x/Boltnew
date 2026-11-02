import Foundation
import Observation

/// Owns all conversations and drives streamed replies from the AI provider.
@MainActor
@Observable
final class ChatStore {
    private(set) var conversations: [Conversation]
    var selectedID: Conversation.ID?
    private(set) var isResponding = false
    private(set) var lastError: String?

    private let storage: ConversationStorage
    private var streamingTask: Task<Void, Never>?

    init(storage: ConversationStorage = ConversationStorage()) {
        self.storage = storage
        self.conversations = storage.load()
    }

    /// Conversations, most recently active first.
    var sortedConversations: [Conversation] {
        conversations.sorted { $0.updatedAt > $1.updatedAt }
    }

    var selectedConversation: Conversation? {
        conversations.first { $0.id == selectedID }
    }

    @discardableResult
    func newConversation() -> Conversation.ID {
        let conversation = Conversation()
        conversations.append(conversation)
        selectedID = conversation.id
        persist()
        return conversation.id
    }

    func deleteConversation(_ id: Conversation.ID) {
        conversations.removeAll { $0.id == id }
        if selectedID == id {
            selectedID = sortedConversations.first?.id
        }
        persist()
    }

    /// Sends a user message to the selected conversation (creating one if needed) and streams the reply.
    /// Returns `false` if the message was empty or a reply is already in progress.
    @discardableResult
    func send(_ text: String) -> Bool {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, !isResponding else { return false }

        let conversationID = selectedConversation?.id ?? newConversation()
        let history = (conversations.first { $0.id == conversationID }?.messages ?? [])
            + [ChatMessage(role: .user, content: trimmed)]
        let userMessage = history[history.count - 1]
        let placeholder = ChatMessage(role: .assistant, content: "")

        updateConversation(conversationID) { conversation in
            if conversation.messages.isEmpty {
                conversation.title = String(trimmed.prefix(40))
            }
            conversation.messages.append(userMessage)
            conversation.messages.append(placeholder)
            conversation.updatedAt = .now
        }

        lastError = nil
        isResponding = true

        let provider = OpenAICompatibleProvider(settings: .load())
        let placeholderID = placeholder.id

        streamingTask = Task {
            var failure: String?
            do {
                for try await delta in provider.streamReply(to: history) {
                    self.updateConversation(conversationID) { conversation in
                        guard let index = conversation.messages.firstIndex(where: { $0.id == placeholderID }) else { return }
                        conversation.messages[index].content += delta
                    }
                }
            } catch is CancellationError {
                // The user tapped stop. Keep whatever text has arrived so far.
            } catch {
                failure = error.localizedDescription
            }
            self.finishResponse(conversationID: conversationID, placeholderID: placeholderID, failure: failure)
        }
        return true
    }

    /// Stops the reply currently streaming, keeping the partial text.
    func stopResponding() {
        streamingTask?.cancel()
    }

    // MARK: - Private

    private func finishResponse(conversationID: Conversation.ID, placeholderID: ChatMessage.ID, failure: String?) {
        updateConversation(conversationID) { conversation in
            // Drop an empty placeholder so a failed request doesn't leave a blank bubble behind.
            if let index = conversation.messages.firstIndex(where: { $0.id == placeholderID }),
               conversation.messages[index].content.isEmpty {
                conversation.messages.remove(at: index)
            }
        }
        persist()
        lastError = failure
        isResponding = false
        streamingTask = nil
    }

    private func updateConversation(_ id: Conversation.ID, _ change: (inout Conversation) -> Void) {
        guard let index = conversations.firstIndex(where: { $0.id == id }) else { return }
        change(&conversations[index])
    }

    private func persist() {
        do {
            try storage.save(conversations)
        } catch {
            lastError = "Could not save chats: \(error.localizedDescription)"
        }
    }
}
