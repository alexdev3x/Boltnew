import SwiftUI

@main
struct BoltApp: App {
    @StateObject private var store = ChatStore()
    @StateObject private var theme = ThemeStore()

    var body: some Scene {
        WindowGroup {
            HomeView()
                .environmentObject(store)
                .environmentObject(theme)
                .preferredColorScheme(theme.colorScheme)
        }
    }
}
