import SwiftUI

@main
struct FreeMilkApp: App {
    @State private var store = ChatStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(store)
        }
    }
}
