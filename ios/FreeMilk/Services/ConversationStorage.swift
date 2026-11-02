import Foundation

/// Persists conversations as a single JSON file in Application Support.
struct ConversationStorage: Sendable {
    let fileURL: URL

    init(fileURL: URL? = nil) {
        if let fileURL {
            self.fileURL = fileURL
            return
        }
        let directory = FileManager.default
            .urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        try? FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        self.fileURL = directory.appendingPathComponent("conversations.json")
    }

    func load() -> [Conversation] {
        guard let data = try? Data(contentsOf: fileURL) else { return [] }
        return (try? JSONDecoder().decode([Conversation].self, from: data)) ?? []
    }

    func save(_ conversations: [Conversation]) throws {
        let data = try JSONEncoder().encode(conversations)
        try data.write(to: fileURL, options: [.atomic, .completeFileProtection])
    }
}
