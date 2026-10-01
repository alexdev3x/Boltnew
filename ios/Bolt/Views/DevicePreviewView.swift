import SwiftUI
import WebKit

struct DevicePreviewView: View {
    @EnvironmentObject private var store: ChatStore
    @EnvironmentObject private var themeStore: ThemeStore

    @State private var url = "https://preview.bolt.mobile/app"
    @State private var committedUrl = "https://preview.bolt.mobile/app"
    @State private var reloadToken = 0

    private let baseUrl = "https://preview.bolt.mobile/app"
    private var theme: BoltTheme { themeStore.theme }

    private var canNavigate: Bool {
        if url == baseUrl { return true }
        guard url.hasPrefix(baseUrl), url.count > baseUrl.count else { return false }
        let next = url[url.index(url.startIndex, offsetBy: baseUrl.count)]
        return ["/", "?", "#"].contains(next)
    }

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 8) {
                Button {
                    reloadToken += 1
                } label: {
                    Image(systemName: "arrow.clockwise")
                        .foregroundStyle(theme.textPrimary)
                        .frame(width: 34, height: 34)
                        .background(theme.itemBackgroundActive)
                        .clipShape(Circle())
                }
                .accessibilityLabel("Reload preview")

                TextField("Preview URL", text: $url)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .font(.system(size: 13))
                    .foregroundStyle(theme.textPrimary)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(theme.previewAddressBar)
                    .overlay(
                        Capsule().stroke(theme.borderColor, lineWidth: 1)
                    )
                    .clipShape(Capsule())
                    .onSubmit {
                        guard canNavigate else { return }
                        committedUrl = url
                        reloadToken += 1
                    }

                Button {
                    store.setActivePane(.code)
                } label: {
                    Image(systemName: "xmark.circle")
                        .font(.system(size: 20))
                        .foregroundStyle(theme.textSecondary)
                }
                .accessibilityLabel("Close preview mode")
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(theme.backgroundDepth2)
            .overlay(alignment: .bottom) {
                Rectangle().fill(theme.borderColor).frame(height: 1)
            }

            Text(store.descriptionText.isEmpty ? "Device Preview" : "Device Preview · \(store.descriptionText)")
                .font(.system(size: 12))
                .foregroundStyle(theme.textTertiary)
                .padding(.top, 10)
                .padding(.bottom, 4)

            GeometryReader { geo in
                let width = min(geo.size.width - 36, 360)
                let height = min(geo.size.height - 24, 720)

                VStack {
                    Spacer(minLength: 0)
                    ZStack {
                        RoundedRectangle(cornerRadius: 36, style: .continuous)
                            .fill(Color.black)
                            .frame(width: width, height: height)
                            .shadow(color: .black.opacity(0.35), radius: 24, y: 12)

                        VStack(spacing: 0) {
                            Capsule()
                                .fill(Color(red: 0.09, green: 0.09, blue: 0.09))
                                .frame(width: 96, height: 10)
                                .padding(.top, 10)
                                .padding(.bottom, 8)
                                .frame(maxWidth: .infinity)
                                .background(Color(red: 0.039, green: 0.039, blue: 0.039))

                            Group {
                                if store.previewHtml.isEmpty {
                                    VStack(spacing: 12) {
                                        Image(systemName: "iphone")
                                            .font(.system(size: 36))
                                            .foregroundStyle(theme.textTertiary)
                                        Text("No preview available yet. Ask Bolt to scaffold an app, then open Preview mode.")
                                            .font(.system(size: 14))
                                            .foregroundStyle(theme.textTertiary)
                                            .multilineTextAlignment(.center)
                                            .padding(.horizontal, 24)
                                    }
                                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                                    .background(theme.backgroundDepth1)
                                } else {
                                    HTMLWebView(html: store.previewHtml)
                                        .id(reloadToken)
                                }
                            }
                            .frame(maxWidth: .infinity, maxHeight: .infinity)

                            Capsule()
                                .fill(Color(red: 0.149, green: 0.149, blue: 0.149))
                                .frame(width: 108, height: 4)
                                .padding(.vertical, 8)
                                .frame(maxWidth: .infinity)
                                .background(Color(red: 0.039, green: 0.039, blue: 0.039))
                        }
                        .frame(width: width - 20, height: height - 20)
                        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
                    }
                    .frame(width: width, height: height)

                    Text(committedUrl)
                        .font(.system(size: 11))
                        .foregroundStyle(theme.textTertiary)
                        .lineLimit(1)
                        .padding(.top, 10)

                    Spacer(minLength: 0)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
            .padding(.horizontal, 18)
            .padding(.bottom, 12)
        }
        .background(theme.backgroundDepth1)
    }
}

struct HTMLWebView: UIViewRepresentable {
    let html: String

    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView(frame: .zero)
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.backgroundColor = .clear
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        guard context.coordinator.lastHtml != html else { return }
        context.coordinator.lastHtml = html
        webView.loadHTMLString(html, baseURL: URL(string: "https://preview.bolt.mobile"))
    }

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    final class Coordinator {
        var lastHtml: String?
    }
}
