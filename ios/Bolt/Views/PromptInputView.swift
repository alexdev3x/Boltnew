import SwiftUI

struct PromptInputView: View {
    @EnvironmentObject private var store: ChatStore
    @EnvironmentObject private var themeStore: ThemeStore

    private var theme: BoltTheme { themeStore.theme }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            ZStack(alignment: .topTrailing) {
                TextEditor(text: $store.input)
                    .scrollContentBackground(.hidden)
                    .font(.system(size: 16))
                    .foregroundStyle(theme.textPrimary)
                    .frame(minHeight: store.chatStarted ? 76 : 90, maxHeight: store.chatStarted ? 160 : 200)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .padding(.trailing, 48)
                    .overlay(alignment: .topLeading) {
                        if store.input.isEmpty {
                            Text("How can Bolt help you today?")
                                .font(.system(size: 16))
                                .foregroundStyle(theme.textTertiary)
                                .padding(.horizontal, 16)
                                .padding(.top, 18)
                                .allowsHitTesting(false)
                        }
                    }

                if !store.input.isEmpty || store.isStreaming {
                    Button {
                        if store.isStreaming {
                            store.stopStreaming()
                        } else {
                            store.sendMessage()
                        }
                    } label: {
                        Image(systemName: store.isStreaming ? "stop.fill" : "arrow.up")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundStyle(.white)
                            .frame(width: 36, height: 36)
                            .background(theme.accent)
                            .clipShape(Circle())
                    }
                    .padding(.top, 12)
                    .padding(.trailing, 12)
                }
            }

            HStack {
                Button {
                    store.enhancePrompt()
                } label: {
                    HStack(spacing: 6) {
                        if store.enhancingPrompt {
                            ProgressView()
                                .controlSize(.small)
                                .tint(theme.loaderProgress)
                            Text("Enhancing prompt...")
                                .font(.system(size: 13))
                                .foregroundStyle(theme.textSecondary)
                        } else {
                            Image(systemName: "sparkles")
                                .foregroundStyle(store.promptEnhanced ? theme.itemContentAccent : theme.textSecondary)
                            if store.promptEnhanced {
                                Text("Prompt enhanced")
                                    .font(.system(size: 13))
                                    .foregroundStyle(theme.itemContentAccent)
                            }
                        }
                    }
                    .padding(.horizontal, store.promptEnhanced ? 8 : 4)
                    .padding(.vertical, 6)
                    .background(store.promptEnhanced ? theme.itemBackgroundAccent : Color.clear)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }
                .disabled(store.input.isEmpty || store.enhancingPrompt)
                .opacity(store.input.isEmpty ? 0.4 : 1)

                Spacer()

                if store.input.count > 3 {
                    Text("Tap ↑ to send")
                        .font(.system(size: 11))
                        .foregroundStyle(theme.textTertiary)
                }
            }
            .padding(.horizontal, 12)
            .padding(.bottom, 12)
        }
        .background(theme.promptBackground)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(theme.borderColor, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

struct ExamplePromptsView: View {
    @EnvironmentObject private var store: ChatStore
    @EnvironmentObject private var themeStore: ThemeStore

    private let prompts = [
        "Build a todo app in React using Tailwind",
        "Build a simple blog using Astro",
        "Create a cookie consent form using Material UI",
        "Make a space invaders game",
        "How do I center a div?"
    ]

    var body: some View {
        VStack(spacing: 8) {
            ForEach(prompts, id: \.self) { prompt in
                Button {
                    store.sendMessage(prompt)
                } label: {
                    HStack(spacing: 8) {
                        Text(prompt)
                            .font(.system(size: 15))
                            .foregroundStyle(themeStore.theme.textTertiary)
                            .multilineTextAlignment(.center)
                        Image(systemName: "return")
                            .font(.system(size: 12))
                            .foregroundStyle(themeStore.theme.textTertiary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                }
            }
        }
        .padding(.top, 8)
    }
}
