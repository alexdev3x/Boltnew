import SwiftUI

struct WorkbenchView: View {
    @EnvironmentObject private var store: ChatStore
    @EnvironmentObject private var themeStore: ThemeStore

    private var theme: BoltTheme { themeStore.theme }

    private var currentFile: ProjectFile? {
        store.files.first(where: { $0.path == store.selectedFile }) ?? store.files.first
    }

    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Text("Code")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(theme.textPrimary)
                Spacer()
                Button {
                    store.setActivePane(.preview)
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "iphone")
                        Text("Preview")
                            .font(.system(size: 12, weight: .semibold))
                    }
                    .foregroundStyle(theme.itemContentAccent)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(theme.itemBackgroundAccent)
                    .clipShape(Capsule())
                }
                Button {
                    store.setActivePane(.chat)
                } label: {
                    Image(systemName: "xmark.circle")
                        .font(.system(size: 20))
                        .foregroundStyle(theme.textSecondary)
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .overlay(alignment: .bottom) {
                Rectangle().fill(theme.borderColor).frame(height: 1)
            }

            HStack(spacing: 0) {
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
                        ForEach(store.files) { file in
                            let active = file.path == currentFile?.path
                            Button {
                                store.selectedFile = file.path
                            } label: {
                                Text(file.path.trimmingCharacters(in: CharacterSet(charactersIn: "/")))
                                    .font(.system(size: 12, design: .monospaced))
                                    .foregroundStyle(active ? theme.textPrimary : theme.textSecondary)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 10)
                                    .background(active ? theme.itemBackgroundActive : Color.clear)
                            }
                        }
                    }
                }
                .frame(width: 128)
                .background(theme.backgroundDepth1)
                .overlay(alignment: .trailing) {
                    Rectangle().fill(theme.borderColor).frame(width: 1)
                }

                VStack(alignment: .leading, spacing: 0) {
                    Text(currentFile?.path ?? "No file selected")
                        .font(.system(size: 12, design: .monospaced))
                        .foregroundStyle(theme.textSecondary)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(theme.backgroundDepth1)
                        .overlay(alignment: .bottom) {
                            Rectangle().fill(theme.borderColor).frame(height: 1)
                        }

                    TextEditor(text: Binding(
                        get: { currentFile?.content ?? "" },
                        set: { newValue in
                            if let path = currentFile?.path {
                                store.updateFileContent(path: path, content: newValue)
                            }
                        }
                    ))
                    .font(.system(size: 12, design: .monospaced))
                    .scrollContentBackground(.hidden)
                    .foregroundStyle(theme.codeText)
                    .padding(8)
                    .background(theme.codeBackground)
                }
            }
        }
        .background(theme.backgroundDepth2)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(theme.borderColor, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .padding(12)
    }
}
