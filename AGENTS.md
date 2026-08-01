# AGENTS.md

## Cursor Cloud specific instructions

This repo is a monorepo with two independent products. Standard commands live in
`README.md` (web) and `mobile/README.md` (mobile); only non-obvious caveats are noted here.

### Node / package managers
- Use **Node 20.19.4**. The web app pins `nodejs 20.15.1` in `.tool-versions`, but the
  mobile app (`react-native@0.86.2`) requires `^20.19.4`, so 20.19.4 is the one version
  that satisfies both. It is provisioned via `nvm` and preferred automatically in
  interactive shells (see `~/.bashrc`).
- If a shell has the wrong `node` (the base image ships a bare Node 22 at `/exec-daemon`
  with **no npm/pnpm**), run: `nvm use 20.19.4`. `pnpm@9.4.0` is provided through
  `corepack` (already activated); the web app uses **pnpm**, the mobile app uses **npm**.

### Web app (root — Bolt.new, Remix + Vite)
- Dev server: `pnpm dev` → http://localhost:5173. Commands: see `README.md`.
- Live AI chat needs `ANTHROPIC_API_KEY` in a git-ignored `.env.local` at the repo root.
  Without it the UI renders and is fully interactive, but `POST /api/chat` returns HTTP
  500 with `AI_LoadAPIKeyError: Anthropic API key is missing` (expected).
- The in-browser run/preview uses StackBlitz **WebContainers**, which require a
  Chromium browser with cross-origin isolation; they do not run headlessly/server-side.
- Gotcha: after restarting `pnpm dev`, the browser may show Vite `504 (Outdated Optimize
  Dep)` errors and the UI won't fully hydrate. Fix with a hard reload, or
  `rm -rf node_modules/.vite` then restart the dev server.
- Gotcha: `pnpm dev` and `pnpm test` print noisy `tsconfig-paths` parse errors about
  `mobile/tsconfig.json` (it extends `expo/tsconfig.base`, not installed at the root).
  These are non-fatal warnings — the server and tests still work.
- Checks: `pnpm run typecheck` and `pnpm test` (Vitest) are the gating checks and pass.
  `pnpm lint` currently reports pre-existing style errors (mostly under `mobile/` and in
  `tsconfig.json`); ESLint is intentionally disabled in CI (commented out in
  `.github/workflows/ci.yaml`), so a non-zero `pnpm lint` is expected, not a regression.

### Mobile app (`mobile/` — Expo / React Native)
- Setup + run: see `mobile/README.md`. For a browser demo use `npm run web`
  (Expo web / Metro) → http://localhost:8081; `npm run typecheck` runs `tsc`.
- It runs **fully standalone**: scaffolding responses and preview HTML execute on-device
  (no backend, no `ANTHROPIC_API_KEY`, no WebContainers), so it is the easiest product to
  exercise end-to-end. Point `sendMessage` at a real `/api/chat` backend for live LLM
  responses.
