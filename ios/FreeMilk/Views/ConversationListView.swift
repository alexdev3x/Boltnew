import SwiftUI

struct ConversationListView: View {
    @Environment(ChatStore.self) private var store
    @State private var showingSettings = false

    var body: some View {
        @Bindable var store = store

        List(selection: $store.selectedID) {
            ForEach(store.sortedConversations) { conversation in
                VStack(alignment: .leading, spacing: 2) {
                    Text(conversation.title)
                        .lineLimit(1)
                    Text(conversation.updatedAt, style: .relative)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .tag(conversation.id)
            }
            .onDelete { offsets in
                let ids = offsets.map { store.sortedConversations[$0].id }
                ids.forEach { store.deleteConversation($0) }
            }
        }
        .overlay {
            if store.conversations.isEmpty {
                ContentUnavailableView(
                    "No chats yet",
                    systemImage: "square.and.pencil",
                    description: Text("Tap the compose button to begin.")
                )
            }
        }
        .navigationTitle("FreeMilk")
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button {
                    showingSettings = true
                } label: {
                    Label("Settings", systemImage: "gearshape")
                }
            }
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    store.newConversation()
                } label: {
                    Label("New Chat", systemImage: "square.and.pencil")
                }
            }
        }
        .sheet(isPresented: $showingSettings) {
            SettingsView()
        }
    }
}
