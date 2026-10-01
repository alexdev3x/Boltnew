import SwiftUI

enum ThemeName: String, CaseIterable, Codable {
    case light
    case dark
}

struct BoltTheme {
    let backgroundDepth1: Color
    let backgroundDepth2: Color
    let backgroundDepth3: Color
    let borderColor: Color
    let textPrimary: Color
    let textSecondary: Color
    let textTertiary: Color
    let promptBackground: Color
    let messagesBackground: Color
    let itemBackgroundAccent: Color
    let itemContentAccent: Color
    let itemBackgroundActive: Color
    let sidebarButtonBackground: Color
    let sidebarButtonText: Color
    let codeBackground: Color
    let codeText: Color
    let previewAddressBar: Color
    let loaderProgress: Color
    let accent: Color
}

enum BoltColors {
    static let accent = Color(red: 0.169, green: 0.651, blue: 1.0) // #2BA6FF
    static let accent700 = Color(red: 0.051, green: 0.435, blue: 0.910) // #0D6FE8
    static let gray50 = Color(red: 0.980, green: 0.980, blue: 0.980)
    static let gray100 = Color(red: 0.961, green: 0.961, blue: 0.961)
    static let gray200 = Color(red: 0.898, green: 0.898, blue: 0.898)
    static let gray400 = Color(red: 0.639, green: 0.639, blue: 0.639)
    static let gray500 = Color(red: 0.451, green: 0.451, blue: 0.451)
    static let gray600 = Color(red: 0.322, green: 0.322, blue: 0.322)
    static let gray800 = Color(red: 0.149, green: 0.149, blue: 0.149)
    static let gray900 = Color(red: 0.090, green: 0.090, blue: 0.090)
    static let gray950 = Color(red: 0.039, green: 0.039, blue: 0.039)

    static let light = BoltTheme(
        backgroundDepth1: .white,
        backgroundDepth2: gray50,
        backgroundDepth3: gray200,
        borderColor: Color.black.opacity(0.10),
        textPrimary: gray950,
        textSecondary: gray600,
        textTertiary: gray500,
        promptBackground: Color.white.opacity(0.80),
        messagesBackground: gray100,
        itemBackgroundAccent: accent.opacity(0.10),
        itemContentAccent: accent700,
        itemBackgroundActive: Color.black.opacity(0.05),
        sidebarButtonBackground: accent.opacity(0.10),
        sidebarButtonText: accent700,
        codeBackground: gray100,
        codeText: gray950,
        previewAddressBar: gray100,
        loaderProgress: accent,
        accent: accent
    )

    static let dark = BoltTheme(
        backgroundDepth1: gray950,
        backgroundDepth2: gray900,
        backgroundDepth3: gray800,
        borderColor: Color.white.opacity(0.10),
        textPrimary: .white,
        textSecondary: gray400,
        textTertiary: gray500,
        promptBackground: gray950.opacity(0.80),
        messagesBackground: gray800,
        itemBackgroundAccent: accent.opacity(0.10),
        itemContentAccent: accent,
        itemBackgroundActive: Color.white.opacity(0.05),
        sidebarButtonBackground: accent.opacity(0.10),
        sidebarButtonText: accent,
        codeBackground: gray800,
        codeText: .white,
        previewAddressBar: gray800,
        loaderProgress: accent,
        accent: accent
    )
}

@MainActor
final class ThemeStore: ObservableObject {
    @Published var themeName: ThemeName {
        didSet {
            UserDefaults.standard.set(themeName.rawValue, forKey: Self.storageKey)
        }
    }

    private static let storageKey = "bolt_theme"

    init() {
        if let stored = UserDefaults.standard.string(forKey: Self.storageKey),
           let name = ThemeName(rawValue: stored) {
            themeName = name
        } else {
            themeName = .dark
        }
    }

    var theme: BoltTheme {
        themeName == .dark ? BoltColors.dark : BoltColors.light
    }

    var colorScheme: ColorScheme {
        themeName == .dark ? .dark : .light
    }

    func toggle() {
        themeName = themeName == .dark ? .light : .dark
    }
}
