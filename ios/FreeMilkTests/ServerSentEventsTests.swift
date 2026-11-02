import Foundation
import Testing
@testable import FreeMilk

@Suite("ServerSentEvents")
struct ServerSentEventsTests {
    @Test func extractsDataPayloadAfterSpace() {
        #expect(ServerSentEvents.payload(fromLine: "data: {\"a\":1}") == "{\"a\":1}")
    }

    @Test func acceptsDataWithoutSpace() {
        #expect(ServerSentEvents.payload(fromLine: "data:[DONE]") == "[DONE]")
    }

    @Test func ignoresCommentsBlankLinesAndOtherFields() {
        #expect(ServerSentEvents.payload(fromLine: ": keep-alive") == nil)
        #expect(ServerSentEvents.payload(fromLine: "") == nil)
        #expect(ServerSentEvents.payload(fromLine: "event: message") == nil)
    }
}

@Suite("ChatCompletionChunk")
struct ChatCompletionChunkTests {
    @Test func decodesDeltaContent() throws {
        let json = #"{"choices":[{"delta":{"content":"Hi"}}]}"#
        let chunk = try JSONDecoder().decode(ChatCompletionChunk.self, from: Data(json.utf8))
        #expect(chunk.choices.first?.delta?.content == "Hi")
    }

    @Test func decodesChunkWithoutContent() throws {
        let json = #"{"choices":[{"delta":{"role":"assistant"}}]}"#
        let chunk = try JSONDecoder().decode(ChatCompletionChunk.self, from: Data(json.utf8))
        #expect(chunk.choices.first?.delta?.content == nil)
    }
}

@Suite("ConversationStorage")
struct ConversationStorageTests {
    @Test func roundTripsConversations() throws {
        let url = FileManager.default.temporaryDirectory
            .appendingPathComponent(UUID().uuidString)
            .appendingPathComponent("conversations.json")
        try FileManager.default.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
        let storage = ConversationStorage(fileURL: url)

        let conversation = Conversation(
            title: "Hello",
            messages: [ChatMessage(role: .user, content: "Hi there")]
        )
        try storage.save([conversation])

        let loaded = storage.load()
        #expect(loaded.count == 1)
        #expect(loaded.first?.id == conversation.id)
        #expect(loaded.first?.messages.first?.content == "Hi there")
    }
}
