import Foundation

/// Minimal parser for the `text/event-stream` format used by streaming AI APIs.
enum ServerSentEvents {
    /// Returns the value of a `data:` field, or `nil` for comments, blank lines and other fields.
    /// A single space after the colon is removed, as the SSE spec requires.
    static func payload(fromLine line: String) -> String? {
        guard line.hasPrefix("data:") else { return nil }
        var value = line.dropFirst(5)
        if value.first == " " {
            value = value.dropFirst()
        }
        return String(value)
    }
}
