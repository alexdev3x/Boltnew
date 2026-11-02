import SwiftUI

struct SettingsView: View {
    @Environment(\.dismiss) private var dismiss

    @AppStorage(ProviderSettings.baseURLKey) private var baseURL = ProviderSettings.defaultBaseURL
    @AppStorage(ProviderSettings.modelKey) private var model = ProviderSettings.defaultModel

    @State private var apiKey = ""
    @State private var saveError: String?

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Base URL", text: $baseURL)
                        .keyboardType(.URL)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                    TextField("Model", text: $model)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                } header: {
                    Text("Provider")
                } footer: {
                    Text("Any OpenAI-compatible chat endpoint works, for example https://api.openai.com/v1 or a local server such as http://localhost:11434/v1.")
                }

                Section {
                    SecureField("API key", text: $apiKey)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                } header: {
                    Text("API key")
                } footer: {
                    Text("Stored in the iOS Keychain on this device and sent only to the base URL above.")
                }

                if let saveError {
                    Section {
                        Text(saveError)
                            .foregroundStyle(.red)
                    }
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }
                }
            }
            .onAppear {
                apiKey = KeychainStore.read(account: ProviderSettings.apiKeyAccount) ?? ""
            }
        }
    }

    private func save() {
        do {
            try KeychainStore.write(
                apiKey.trimmingCharacters(in: .whitespacesAndNewlines),
                account: ProviderSettings.apiKeyAccount
            )
            dismiss()
        } catch {
            saveError = error.localizedDescription
        }
    }
}
