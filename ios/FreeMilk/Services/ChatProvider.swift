import Foundation

/// Anything that can produce an assistant reply as a stream of text chunks.
/// Swap in a different implementation to support another AI backend.
protocol ChatProvider: Sendable {
    func streamReply(to messages: [ChatMessage]) -> AsyncThrowingStream<String, Error>
}

/// User-configurable connection details for the AI provider.
struct ProviderSettings: Sendable, Equatable {
    static let baseURLKey = "freemilk.provider.baseURL"
    static let modelKey = "freemilk.provider.model"
    static let apiKeyAccount = "freemilk.provider.apiKey"

    static let defaultBaseURL = "https://api.openai.com/v1"
    static let defaultModel = "gpt-4o-mini"

    var baseURL: String
    var model: String
    var apiKey: String

    /// Reads the current settings. The API key comes from the Keychain, everything else from UserDefaults.
    static func load(defaults: UserDefaults = .standard) -> ProviderSettings {
        ProviderSettings(
            baseURL: defaults.string(forKey: baseURLKey) ?? defaultBaseURL,
            model: defaults.string(forKey: modelKey) ?? defaultModel,
            apiKey: KeychainStore.read(account: apiKeyAccount) ?? ""
        )
    }
}

enum ProviderError: LocalizedError, Equatable {
    case missingAPIKey
    case missingModel
    case invalidBaseURL
    case invalidResponse
    case httpStatus(Int, String)
    case streamFailed(String)

    var errorDescription: String? {
        switch self {
        case .missingAPIKey:
            "No API key set. Add one in Settings."
        case .missingModel:
            "No model set. Enter a model name in Settings."
        case .invalidBaseURL:
            "The base URL in Settings is not valid. Use a full URL such as https://api.openai.com/v1."
        case .invalidResponse:
            "The server returned an unexpected response."
        case let .httpStatus(code, message):
            "Request failed (\(code)): \(message)"
        case let .streamFailed(message):
            "The reply was interrupted: \(message)"
        }
    }
}
