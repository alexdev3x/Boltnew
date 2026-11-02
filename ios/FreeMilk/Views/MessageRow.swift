import SwiftUI

struct MessageRow: View {
    let message: ChatMessage
    let isStreaming: Bool

    private var isUser: Bool { message.role == .user }

    var body: some View {
        HStack {
            if isUser { Spacer(minLength: 40) }

            bubbleContent
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(
                    isUser ? Color.accentColor.opacity(0.18) : Color(uiColor: .secondarySystemBackground),
                    in: RoundedRectangle(cornerRadius: 18)
                )
                .textSelection(.enabled)

            if !isUser { Spacer(minLength: 40) }
        }
        .frame(maxWidth: .infinity)
    }

    @ViewBuilder
    private var bubbleContent: some View {
        if message.content.isEmpty && isStreaming {
            ProgressView()
                .frame(minHeight: 20)
        } else {
            Text(Self.markdown(message.content))
        }
    }

    /// Renders inline Markdown (bold, italics, code, links) while keeping line breaks.
    static func markdown(_ text: String) -> AttributedString {
        let options = AttributedString.MarkdownParsingOptions(
            interpretedSyntax: .inlineOnlyPreservingWhitespace
        )
        return (try? AttributedString(markdown: text, options: options)) ?? AttributedString(text)
    }
}
