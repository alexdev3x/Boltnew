# FreeMilk (iOS)

A native SwiftUI chat assistant written in Swift 6. It streams replies token by token, keeps a
history of conversations on the device, and can connect to any OpenAI-compatible chat endpoint
(OpenAI, OpenRouter, xAI, or a local server such as Ollama or LM Studio). You bring your own API key.

## Features

- Streaming replies with a Stop button that keeps the partial answer
- Multiple conversations, most recent first, with swipe-to-delete
- Inline Markdown rendering (bold, italics, code, links)
- Provider settings: base URL, model name, and API key
- API key stored in the iOS Keychain (this device only), never in plain files
- Conversation history saved locally as JSON in Application Support

## Requirements

- Xcode 16 or later (Swift 6 toolchain)
- iOS 17 or later
- [XcodeGen](https://github.com/yonaskolb/XcodeGen) to generate the Xcode project

## Setup

```bash
brew install xcodegen
cd ios
xcodegen generate
open FreeMilk.xcodeproj
```

Before running on a device:

1. In the FreeMilk target, pick your **Team** under Signing & Capabilities.
2. Change `PRODUCT_BUNDLE_IDENTIFIER` in `project.yml` (currently `ai.freemilk.app`) if needed,
   then run `xcodegen generate` again.
3. Add an app icon in an asset catalog before submitting to the App Store.

Then run the app, open **Settings** (gear icon), and enter:

- **Base URL**, for example `https://api.openai.com/v1`
- **Model**, a chat model ID your provider currently offers. The default `gpt-4o-mini` is only a
  placeholder; check your provider's model list.
- **API key**

## Project layout

```
ios/
├── project.yml                  XcodeGen spec (app + unit test targets)
├── FreeMilk/
│   ├── FreeMilkApp.swift        App entry point
│   ├── Models/                  ChatMessage, Conversation
│   ├── Services/
│   │   ├── ChatProvider.swift          Provider protocol, settings, error types
│   │   ├── OpenAICompatibleProvider.swift  Streaming chat client
│   │   ├── ServerSentEvents.swift      SSE line parser
│   │   ├── KeychainStore.swift         API key storage
│   │   └── ConversationStorage.swift   JSON persistence
│   ├── Stores/ChatStore.swift   @Observable state, send/stream/stop logic
│   └── Views/                   Content, list, conversation, message row, settings
└── FreeMilkTests/               Swift Testing unit tests
```

To add another AI backend, implement `ChatProvider` (one `streamReply(to:)` method) and
construct it in `ChatStore.send`.

## Tests

In Xcode, press **⌘U**, or from the command line:

```bash
xcodebuild test -scheme FreeMilk -destination 'platform=iOS Simulator,name=iPhone 16'
```

## Notes and limits

- Requests go directly from the device to the base URL you configure. FreeMilk runs no server of its own.
- Plain `http://` is accepted for local endpoints, but iOS App Transport Security may block it on
  devices. Use `https://` for remote hosts.
- Conversations are not synced across devices.
