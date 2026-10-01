import SwiftUI

struct MessagesView: View {
    @EnvironmentObject private var store: ChatStore
    @EnvironmentObject private var themeStore: ThemeStore

    private var theme: BoltTheme { themeStore.theme }

    var body: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 12) {
                    ForEach(Array(store.messages.enumerated()), id: \.element.id) { index, message in
                        messageRow(message, isLast: index == store.messages.count - 1)
                            .id(message.id)
                    }

                    if store.isStreaming {
                        ProgressView()
                            .tint(theme.loaderProgress)
                            .padding(.top, 8)
                            .id("streaming")
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
            }
            .onChange(of: store.messages) { _, _ in
                if let last = store.messages.last?.id {
                    withAnimation {
                        proxy.scrollTo(last, anchor: .bottom)
                    }
                }
            }
            .onChange(of: store.isStreaming) { _, streaming in
                if streaming {
                    withAnimation {
                        proxy.scrollTo("streaming", anchor: .bottom)
                    }
                }
            }
        }
    }

    private func messageRow(_ message: ChatMessage, isLast: Bool) -> some View {
        let isUser = message.role == .user
        let showBackground = isUser || !store.isStreaming || !isLast

        return HStack(alignment: .top, spacing: 12) {
            if isUser {
                ZStack {
                    Circle()
                        .fill(Color.white)
                        .frame(width: 34, height: 34)
                    Image(systemName: "person.fill")
                        .foregroundStyle(Color(red: 0.322, green: 0.322, blue: 0.322))
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                ForEach(Array(message.content.components(separatedBy: "\n").enumerated()), id: \.offset) { _, line in
                    if line.hasPrefix("- ") {
                        Text("• \(String(line.dropFirst(2)))")
                            .font(.system(size: 15))
                            .foregroundStyle(theme.textPrimary)
                    } else {
                        boldAwareText(line)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(16)
        .background(showBackground ? theme.messagesBackground : Color.clear)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private func boldAwareText(_ line: String) -> Text {
        let parts = line.components(separatedBy: "**")
        guard parts.count > 1 else {
            return Text(line)
                .font(.system(size: 15))
                .foregroundStyle(theme.textPrimary)
        }

        var output = Text("")
        for (index, part) in parts.enumerated() {
            if index % 2 == 1 {
                output = output + Text(part).font(.system(size: 15, weight: .bold)).foregroundStyle(theme.accent)
            } else if !part.isEmpty {
                output = output + Text(part).font(.system(size: 15)).foregroundStyle(theme.textPrimary)
            }
        }
        return output
    }
}
