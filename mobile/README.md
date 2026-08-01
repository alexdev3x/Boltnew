# Bolt Mobile

Exact Bolt.new experience from this repository, rebuilt as a React Native (Expo) mobile app.

## What you get

- Same Bolt branding, colors, and copy (“Where ideas begin”)
- Prompt box with enhance + send/stop controls
- Example prompts from the web app
- Chat transcript UI
- Code workbench for editing generated files
- **Preview mode** with a phone-frame device preview, reload control, and address bar
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

This mobile client mirrors the Bolt.new product UI from the open-source repo. Scaffolding responses run on-device so the app works without WebContainers (which require a desktop Chromium environment). Point `sendMessage` at your own `/api/chat` backend if you want live LLM responses.

### How the device preview works

Preview mode doesn't just show a canned screenshot — it actually compiles and runs the generated project's files:

- `src/utils/generatePreviewHtml.ts` builds a self-contained HTML document containing every `.tsx`/`.ts`/`.jsx`/`.js` file from the workbench, plus a tiny in-browser CommonJS module loader, a Babel (TypeScript + JSX) transpiler, and a minimal `react-native` → DOM shim (`View`, `Text`, `TextInput`, `Pressable`, `ScrollView`, `FlatList`, `Image`, `StyleSheet`, etc).
- The document is handed to `react-native-webview` (on-device) or an `<iframe>` (on web) and transpiles/executes the entry file (`App.tsx` by convention) live, so edits made in the Code pane show up in Preview after a short debounce.
- React, ReactDOM, and Babel standalone are bundled into `src/utils/vendor/*.ts` ahead of time (`node scripts/generate-preview-vendor.js`) so the preview never needs network access to a CDN — it works fully offline. Re-run that script after bumping the `react`/`react-dom` dependency versions.
- Compile or runtime errors in the previewed app are caught and rendered inline instead of leaving a blank screen.
