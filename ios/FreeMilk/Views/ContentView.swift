import SwiftUI

struct ContentView: View {
    @Environment(ChatStore.self) private var store

    var body: some View {
        NavigationSplitView {
            ConversationListView()
        } detail: {
            if let conversation = store.selectedConversation {
                ConversationView(conversation: conversation)
            } else {
                ContentUnavailableView(
                    "No chat selected",
                    systemImage: "bubble.left.and.bubble.right",
                    description: Text("Start a new chat to ask FreeMilk anything.")
                )
            }
        }
    }
}
