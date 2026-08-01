# AGENTS.md

## Cursor Cloud specific instructions

This repo is the open-source **Bolt.new** codebase and contains two products:

- **Bolt web** (repo root): Remix + Vite app targeting Cloudflare Pages/Workers. Package manager is **pnpm** (`pnpm-lock.yaml`).
- **Bolt mobile** (`mobile/`): Expo / React Native app. Package manager is **npm** (`mobile/package-lock.json`).

There is no server database, no Docker, and no `docker-compose`. Chat history persists client-side (IndexedDB on web, AsyncStorage on mobile).

### Running the apps (dev)

- Web: `pnpm run dev` (Remix Vite dev server on http://localhost:5173). Standard scripts are in `package.json` / `README.md`.
- Mobile: from `mobile/`, `npm run web` serves the Expo web build on http://localhost:8081 (first bundle can take 20-40s). `npm run start` gives the Expo dev menu (i/a/w for iOS/Android/web).

### Non-obvious caveats

- **Web AI needs a key**: `/api/chat` and `/api/enhancer` call Anthropic and return HTTP 500 with `AI_LoadAPIKeyError` unless `ANTHROPIC_API_KEY` is set (in `.env.local` at repo root, or as an env var). The dev server, routing and UI all load fine without it — only the AI actions fail. See `app/lib/.server/llm/api-key.ts`.
- **Mobile needs no key**: the mobile app uses on-device mock AI responses, so the full chat → workbench (Code/Preview) flow works end-to-end with no secrets.
- **Web run/preview flow requires a real Chromium browser**: generated apps run via StackBlitz WebContainers (in-browser, needs cross-origin isolation / SharedArrayBuffer). Chrome 129 is intercepted by a plugin in `vite.config.ts` and shown a warning page in local dev.
- **Lint is expected to fail** and is intentionally disabled in CI (`.github/workflows/ci.yaml` has the ESLint step commented out). `pnpm run lint` currently reports pre-existing errors in `mobile/**` and `tsconfig.json`. The enforced checks are `pnpm run typecheck` and `pnpm test` (Vitest), both of which pass.
- **Node version**: `.tool-versions` pins `nodejs 20.15.1`, but `engines` allows `>=18.18.0`. The ambient Node 22 in this environment works for install / dev / typecheck / test. If you hit a Node-version-specific issue, switch with `nvm use 20.15.1`.

### Quality checks

- Web: `pnpm run typecheck`, `pnpm test`, `pnpm run lint` (lint informational only — see above).
- Mobile: `cd mobile && npm run typecheck`.
