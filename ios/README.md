# Bolt for iOS (SwiftUI)

Native SwiftUI port of the Bolt.new mobile experience from this repository.

## Features

- Same Bolt branding, colors, and “Where ideas begin” home screen
- Prompt input with enhance + send/stop
- Example prompts
- Chat transcript with streaming replies
- Code workbench (file list + editor)
- **Preview mode** with phone-frame chrome and `WKWebView`
- History sidebar, delete confirmation, light/dark theme
- Local chat persistence via `UserDefaults`

## Open in Xcode

Requires macOS with Xcode 15+ (iOS 17 SDK).

```bash
open ios/Bolt.xcodeproj
```

Then select an iPhone simulator or device and press Run.

## Project layout

```
ios/
  Bolt.xcodeproj/
  Bolt/
    BoltApp.swift
    Theme/
    Models/
    Store/
    Views/
    Assets.xcassets/
    Info.plist
```

## Notes

This Swift client mirrors the Expo mobile UI in `mobile/`. Scaffolding responses and preview HTML run on-device so the app works without WebContainers. Point `ChatStore.sendMessage` at your own API if you want live LLM responses.
