import SwiftUI

struct HeaderView: View {
    @EnvironmentObject private var store: ChatStore
    @EnvironmentObject private var themeStore: ThemeStore

    private var theme: BoltTheme { themeStore.theme }

    var body: some View {
        HStack(spacing: 8) {
            Button {
                store.sidebarOpen = true
            } label: {
                Image(systemName: "line.3.horizontal")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundStyle(theme.textPrimary)
                    .frame(width: 32, height: 32)
            }
            .accessibilityLabel("Open chat history")

            BoltWordmark()

            Text(store.chatStarted ? store.descriptionText : "")
                .font(.system(size: 14))
                .foregroundStyle(theme.textPrimary)
                .lineLimit(1)
                .frame(maxWidth: .infinity)

            if store.chatStarted {
                HStack(spacing: 0) {
                    paneButton(pane: .chat, icon: "bubble.left.and.bubble.right", label: "Chat")
                    divider
                    paneButton(pane: .code, icon: "chevron.left.forwardslash.chevron.right", label: "Code", disabled: !store.hasProject)
                    divider
                    paneButton(pane: .preview, icon: "iphone", label: "Preview mode", disabled: !store.hasProject)
                }
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(theme.borderColor, lineWidth: 1)
                )
                .clipShape(RoundedRectangle(cornerRadius: 8))
            } else {
                Color.clear.frame(width: 40, height: 32)
            }
        }
        .padding(.horizontal, 16)
        .frame(height: 56)
        .background(theme.backgroundDepth1)
        .overlay(alignment: .bottom) {
            if store.chatStarted {
                Rectangle()
                    .fill(theme.borderColor)
                    .frame(height: 1)
            }
        }
    }

    private var divider: some View {
        Rectangle()
            .fill(theme.borderColor)
            .frame(width: 1)
    }

    private func paneButton(pane: AppPane, icon: String, label: String, disabled: Bool = false) -> some View {
        let active = store.activePane == pane
        return Button {
            store.setActivePane(pane)
        } label: {
            Image(systemName: icon)
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(active ? theme.itemContentAccent : theme.textTertiary)
                .frame(width: 36, height: 32)
                .background(active ? theme.itemBackgroundAccent : Color.clear)
        }
        .disabled(disabled)
        .opacity(disabled ? 0.4 : 1)
        .accessibilityLabel(label)
    }
}

struct BoltWordmark: View {
    @EnvironmentObject private var themeStore: ThemeStore

    var body: some View {
        HStack(spacing: 8) {
            BoltMark(size: 22)
            Text("Bolt")
                .font(.system(size: 22, weight: .bold))
                .foregroundStyle(themeStore.theme.accent)
                .tracking(-0.4)
        }
    }
}

struct BoltMark: View {
    var size: CGFloat = 28

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: size * 0.22, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [Color(red: 0.169, green: 0.361, blue: 1.0), Color(red: 0.102, green: 0.216, blue: 0.600)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .frame(width: size, height: size)

            Text("b")
                .font(.system(size: size * 0.58, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
                .offset(y: -1)
        }
        .accessibilityHidden(true)
    }
}
