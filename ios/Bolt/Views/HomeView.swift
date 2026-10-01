import SwiftUI

struct HomeView: View {
    @EnvironmentObject private var store: ChatStore
    @EnvironmentObject private var themeStore: ThemeStore

    private var theme: BoltTheme { themeStore.theme }

    var body: some View {
        ZStack {
            theme.backgroundDepth1.ignoresSafeArea()

            VStack(spacing: 0) {
                HeaderView()

                Group {
                    switch store.activePane {
                    case .chat:
                        chatPane
                    case .code:
                        if store.chatStarted {
                            WorkbenchView()
                        } else {
                            chatPane
                        }
                    case .preview:
                        if store.chatStarted {
                            DevicePreviewView()
                        } else {
                            chatPane
                        }
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .sheet(isPresented: $store.sidebarOpen) {
            SidebarView()
                .environmentObject(store)
                .environmentObject(themeStore)
                .presentationDetents([.large])
        }
    }

    @ViewBuilder
    private var chatPane: some View {
        if !store.chatStarted {
            ScrollView {
                VStack(spacing: 20) {
                    Spacer(minLength: 48)

                    Text("Where ideas begin")
                        .font(.system(size: 34, weight: .bold))
                        .foregroundStyle(theme.textPrimary)
                        .multilineTextAlignment(.center)

                    Text("Bring ideas to life in seconds or get help on existing projects.")
                        .font(.system(size: 15))
                        .foregroundStyle(theme.textSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 8)

                    PromptInputView()
                        .padding(.horizontal, 4)

                    ExamplePromptsView()
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 32)
            }
        } else {
            VStack(spacing: 0) {
                MessagesView()
                PromptInputView()
                    .padding(.horizontal, 16)
                    .padding(.bottom, 12)
            }
        }
    }
}

#Preview {
    HomeView()
        .environmentObject(ChatStore())
        .environmentObject(ThemeStore())
}
