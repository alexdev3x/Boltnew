import SwiftUI

struct SidebarView: View {
    @EnvironmentObject private var store: ChatStore
    @EnvironmentObject private var themeStore: ThemeStore
    @Environment(\.dismiss) private var dismiss

    @State private var pendingDelete: ChatHistoryItem?

    private var theme: BoltTheme { themeStore.theme }

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 0) {
                Button {
                    store.startNewChat()
                    dismiss()
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "bubble.left.and.bubble.right")
                        Text("Start new chat")
                            .fontWeight(.semibold)
                    }
                    .foregroundStyle(theme.sidebarButtonText)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(12)
                    .background(theme.sidebarButtonBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)

                Text("Your Chats")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(theme.textPrimary)
                    .padding(.horizontal, 24)
                    .padding(.top, 16)
                    .padding(.bottom, 8)

                if store.chats.isEmpty {
                    Text("No previous conversations")
                        .foregroundStyle(theme.textTertiary)
                        .padding(.horizontal, 24)
                    Spacer()
                } else {
                    List {
                        ForEach(binDates(store.chats), id: \.category) { section in
                            Section(section.category) {
                                ForEach(section.items) { item in
                                    HStack {
                                        Button {
                                            store.loadChat(item.id)
                                            dismiss()
                                        } label: {
                                            Text(item.description)
                                                .foregroundStyle(theme.textPrimary)
                                                .lineLimit(1)
                                                .frame(maxWidth: .infinity, alignment: .leading)
                                        }

                                        Button {
                                            pendingDelete = item
                                        } label: {
                                            Image(systemName: "trash")
                                                .foregroundStyle(theme.textTertiary)
                                        }
                                        .buttonStyle(.plain)
                                        .accessibilityLabel("Delete \(item.description)")
                                    }
                                    .listRowBackground(
                                        item.id == store.activeChatId
                                            ? theme.itemBackgroundActive
                                            : theme.backgroundDepth2
                                    )
                                }
                            }
                        }
                    }
                    .listStyle(.plain)
                    .scrollContentBackground(.hidden)
                }

                Divider().overlay(theme.borderColor)

                HStack {
                    Spacer()
                    Button {
                        themeStore.toggle()
                    } label: {
                        HStack(spacing: 8) {
                            Image(systemName: themeStore.themeName == .dark ? "sun.max" : "moon")
                            Text(themeStore.themeName == .dark ? "Light" : "Dark")
                        }
                        .foregroundStyle(theme.textPrimary)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 8)
                        .background(theme.itemBackgroundActive)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                    }
                }
                .padding(16)
            }
            .background(theme.backgroundDepth2)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
            .alert("Delete Chat?", isPresented: Binding(
                get: { pendingDelete != nil },
                set: { if !$0 { pendingDelete = nil } }
            )) {
                Button("Cancel", role: .cancel) { pendingDelete = nil }
                Button("Delete", role: .destructive) {
                    if let item = pendingDelete {
                        store.deleteChat(item.id)
                    }
                    pendingDelete = nil
                }
            } message: {
                if let item = pendingDelete {
                    Text("You are about to delete \(item.description). Are you sure you want to delete this chat?")
                }
            }
        }
    }
}

private struct DateBin {
    let category: String
    let items: [ChatHistoryItem]
}

private func binDates(_ list: [ChatHistoryItem]) -> [DateBin] {
    let calendar = Calendar.current
    let now = calendar.startOfDay(for: Date())
    var bins: [(String, [ChatHistoryItem])] = []
    var map: [String: [ChatHistoryItem]] = [:]
    let order = ["Today", "Yesterday", "Last 7 Days", "Last 30 Days", "Older"]

    let sorted = list.sorted { $0.createdAt > $1.createdAt }
    for item in sorted {
        let created = calendar.startOfDay(for: item.createdAt)
        let days = calendar.dateComponents([.day], from: created, to: now).day ?? 0
        let category: String
        switch days {
        case 0: category = "Today"
        case 1: category = "Yesterday"
        case 2..<7: category = "Last 7 Days"
        case 7..<30: category = "Last 30 Days"
        default: category = "Older"
        }
        map[category, default: []].append(item)
    }

    for key in order where map[key] != nil {
        bins.append((key, map[key]!))
    }
    return bins.map { DateBin(category: $0.0, items: $0.1) }
}
