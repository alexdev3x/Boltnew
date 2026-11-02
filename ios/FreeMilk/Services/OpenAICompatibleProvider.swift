import Foundation

/// Streams chat completions from any OpenAI-compatible `/chat/completions` endpoint
/// (OpenAI, OpenRouter, xAI, a local Ollama/LM Studio server, and similar).
struct OpenAICompatibleProvider: ChatProvider {
    let settings: ProviderSettings
    var session: URLSession = .shared

    func streamReply(to messages: [ChatMessage]) -> AsyncThrowingStream<String, Error> {
        let settings = self.settings
        let session = self.session

        return AsyncThrowingStream { continuation in
            let task = Task {
                do {
                    let request = try Self.makeRequest(settings: settings, messages: messages)
                    let (bytes, response) = try await session.bytes(for: request)

                    guard let http = response as? HTTPURLResponse else {
                        throw ProviderError.invalidResponse
                    }
                    guard (200..<300).contains(http.statusCode) else {
                        var body = ""
                        for try await line in bytes.lines {
                            body += line
                            if body.count > 4_000 { break }
                        }
                        throw ProviderError.httpStatus(http.statusCode, Self.errorMessage(from: body))
                    }

                    for try await line in bytes.lines {
                        try Task.checkCancellation()
                        guard let payload = ServerSentEvents.payload(fromLine: line) else { continue }
                        if payload == "[DONE]" { break }

                        let data = Data(payload.utf8)
                        if let envelope = try? JSONDecoder().decode(APIErrorEnvelope.self, from: data) {
                            throw ProviderError.streamFailed(envelope.error.message)
                        }
                        let chunk = try JSONDecoder().decode(ChatCompletionChunk.self, from: data)
                        if let text = chunk.choices.first?.delta?.content, !text.isEmpty {
                            continuation.yield(text)
                        }
                    }
                    continuation.finish()
                } catch {
                    continuation.finish(throwing: error)
                }
            }
            continuation.onTermination = { _ in task.cancel() }
        }
    }

    // MARK: - Request construction

    private static func makeRequest(settings: ProviderSettings, messages: [ChatMessage]) throws -> URLRequest {
        let apiKey = settings.apiKey.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !apiKey.isEmpty else { throw ProviderError.missingAPIKey }

        let model = settings.model.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !model.isEmpty else { throw ProviderError.missingModel }

        guard let base = URL(string: settings.baseURL.trimmingCharacters(in: .whitespacesAndNewlines)),
              let scheme = base.scheme?.lowercased(), scheme == "https" || scheme == "http",
              base.host != nil
        else { throw ProviderError.invalidBaseURL }

        var request = URLRequest(url: base.appendingPathComponent("chat/completions"))
        request.httpMethod = "POST"
        request.timeoutInterval = 120
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("text/event-stream", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.httpBody = try JSONEncoder().encode(
            RequestBody(model: model, messages: messages.map(WireMessage.init), stream: true)
        )
        return request
    }

    private static func errorMessage(from body: String) -> String {
        if let data = body.data(using: .utf8),
           let envelope = try? JSONDecoder().decode(APIErrorEnvelope.self, from: data) {
            return envelope.error.message
        }
        return body.isEmpty ? "No details returned." : String(body.prefix(300))
    }
}

// MARK: - Wire types

private struct RequestBody: Encodable {
    let model: String
    let messages: [WireMessage]
    let stream: Bool
}

private struct WireMessage: Encodable {
    let role: String
    let content: String

    init(_ message: ChatMessage) {
        role = message.role.rawValue
        content = message.content
    }
}

/// One streamed `data:` payload from a chat completion.
struct ChatCompletionChunk: Decodable, Sendable {
    struct Choice: Decodable, Sendable {
        struct Delta: Decodable, Sendable {
            let content: String?
        }
        let delta: Delta?
    }
    let choices: [Choice]
}

/// Error body shape used by OpenAI-compatible servers.
struct APIErrorEnvelope: Decodable, Sendable {
    struct Detail: Decodable, Sendable {
        let message: String
    }
    let error: Detail
}
