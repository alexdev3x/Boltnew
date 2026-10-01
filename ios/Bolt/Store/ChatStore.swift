import Foundation
import SwiftUI

@MainActor
final class ChatStore: ObservableObject {
    @Published var chats: [ChatHistoryItem] = []
    @Published var activeChatId: String?
    @Published var messages: [ChatMessage] = []
    @Published var files: [ProjectFile] = []
    @Published var previewHtml = ""
    @Published var input = ""
    @Published var chatStarted = false
    @Published var isStreaming = false
    @Published var activePane: AppPane = .chat
    @Published var selectedFile: String?
    @Published var enhancingPrompt = false
    @Published var promptEnhanced = false
    @Published var sidebarOpen = false
    @Published var descriptionText = ""

    private var streamTask: Task<Void, Never>?
    private var enhanceTask: Task<Void, Never>?
    private static let historyKey = "bolt_mobile_chats"

    init() {
        loadHistory()
    }

    var hasProject: Bool {
        !files.isEmpty || !previewHtml.isEmpty
    }

    func setActivePane(_ pane: AppPane) {
        activePane = pane
    }

    func startNewChat() {
        streamTask?.cancel()
        streamTask = nil
        cancelEnhanceTask()
        activeChatId = nil
        messages = []
        files = []
        previewHtml = ""
        input = ""
        chatStarted = false
        isStreaming = false
        activePane = .chat
        selectedFile = nil
        promptEnhanced = false
        descriptionText = ""
        sidebarOpen = false
    }

    func loadChat(_ id: String) {
        guard let chat = chats.first(where: { $0.id == id }) else { return }
        streamTask?.cancel()
        streamTask = nil
        isStreaming = false
        cancelEnhanceTask()
        activeChatId = chat.id
        messages = chat.messages
        files = chat.files
        previewHtml = chat.previewHtml
        chatStarted = true
        selectedFile = chat.files.first?.path
        descriptionText = chat.description
        sidebarOpen = false
        activePane = chat.previewHtml.isEmpty ? .chat : .preview
    }

    func deleteChat(_ id: String) {
        chats.removeAll { $0.id == id }
        persistChats()
        if activeChatId == id {
            startNewChat()
        }
    }

    func enhancePrompt() {
        let trimmed = input.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, !enhancingPrompt else { return }
        enhancingPrompt = true
        enhanceTask = Task {
            try? await Task.sleep(nanoseconds: 900_000_000)
            guard !Task.isCancelled else { return }
            input = "Build a polished mobile-friendly version of: \(trimmed). Use SwiftUI with clear hierarchy and a working interactive preview."
            promptEnhanced = true
            enhancingPrompt = false
        }
    }

    private func cancelEnhanceTask() {
        enhanceTask?.cancel()
        enhanceTask = nil
        enhancingPrompt = false
    }

    func stopStreaming() {
        streamTask?.cancel()
        streamTask = nil
        isStreaming = false
    }

    func updateFileContent(path: String, content: String) {
        guard let index = files.firstIndex(where: { $0.path == path }) else { return }
        files[index].content = content
    }

    func sendMessage(_ text: String? = nil) {
        let messageText = (text ?? input).trimmingCharacters(in: .whitespacesAndNewlines)
        guard !messageText.isEmpty, !isStreaming else { return }

        let userMessage = ChatMessage(id: Self.makeId(), role: .user, content: messageText)
        var nextMessages = messages + [userMessage]
        let chatId = activeChatId ?? Self.makeId()
        let chatDescription = descriptionText.isEmpty ? Self.summarize(messageText) : descriptionText

        cancelEnhanceTask()
        input = ""
        promptEnhanced = false
        chatStarted = true
        isStreaming = true
        activeChatId = chatId
        descriptionText = chatDescription
        messages = nextMessages
        activePane = .chat

        let assistantId = Self.makeId()
        let fullReply = """
        I'll create that for you.

        **Bolt Artifact**
        - Scaffold a SwiftUI todo app
        - Add interactive device preview
        - Open Preview mode so you can try the app on a phone frame

        Your prompt: "\(messageText)"

        The project is ready. Use **Code** to edit files or **Preview** for device preview mode.
        """

        messages.append(ChatMessage(id: assistantId, role: .assistant, content: ""))

        streamTask = Task {
            var index = 0
            while index < fullReply.count {
                if Task.isCancelled { return }
                index = min(fullReply.count, index + max(3, fullReply.count / 40))
                let end = fullReply.index(fullReply.startIndex, offsetBy: index)
                let partial = String(fullReply[..<end])
                if let msgIndex = messages.firstIndex(where: { $0.id == assistantId }) {
                    messages[msgIndex].content = partial
                }
                try? await Task.sleep(nanoseconds: 40_000_000)
            }

            guard !Task.isCancelled else { return }

            files = SampleProject.files
            previewHtml = SampleProject.previewHTML
            selectedFile = SampleProject.files.first?.path
            activePane = .preview
            isStreaming = false
            streamTask = nil

            nextMessages.append(ChatMessage(id: assistantId, role: .assistant, content: fullReply))
            let item = ChatHistoryItem(
                id: chatId,
                description: chatDescription,
                createdAt: Date(),
                messages: nextMessages,
                files: SampleProject.files,
                previewHtml: SampleProject.previewHTML
            )
            chats.removeAll { $0.id == chatId }
            chats.insert(item, at: 0)
            persistChats()
        }
    }

    private func loadHistory() {
        guard let data = UserDefaults.standard.data(forKey: Self.historyKey) else { return }
        do {
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            chats = try decoder.decode([ChatHistoryItem].self, from: data)
        } catch {
            chats = []
        }
    }

    private func persistChats() {
        do {
            let encoder = JSONEncoder()
            encoder.dateEncodingStrategy = .iso8601
            let data = try encoder.encode(chats)
            UserDefaults.standard.set(data, forKey: Self.historyKey)
        } catch {
            // Ignore persistence failures; in-memory state still updates.
        }
    }

    private static func makeId() -> String {
        "\(Int(Date().timeIntervalSince1970 * 1000))-\(UUID().uuidString.prefix(6))"
    }

    private static func summarize(_ text: String) -> String {
        let cleaned = text.replacingOccurrences(of: "\\s+", with: " ", options: .regularExpression)
            .trimmingCharacters(in: .whitespacesAndNewlines)
        if cleaned.count > 48 {
            return String(cleaned.prefix(48)) + "…"
        }
        return cleaned.isEmpty ? "New chat" : cleaned
    }
}
