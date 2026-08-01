# Bolt Mobile

Exact Bolt.new experience from this repository, rebuilt as a React Native (Expo) mobile app.

## What you get

- Same Bolt branding, colors, and copy (“Where ideas begin”)
- Prompt box with enhance + send/stop controls
- Example prompts from the web app
- Chat transcript UI
- Mobile workbench with **Code** / **Preview** tabs
- History sidebar, delete confirmation, and light/dark theme toggle
- Local chat persistence on device

## Run

```bash
cd mobile
npm install
npm run start
```

Then press:

- `i` for iOS simulator
- `a` for Android emulator
- `w` for web preview

## Notes

This mobile client mirrors the Bolt.new product UI from the open-source repo. Scaffolding responses and preview HTML run on-device so the app works without WebContainers (which require a desktop Chromium environment). Point `sendMessage` at your own `/api/chat` backend if you want live LLM responses.
