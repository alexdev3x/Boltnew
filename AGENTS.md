# AGENTS.md

## Cursor Cloud specific instructions

This is **Bolt** — the open-source core of [bolt.new](https://bolt.new): a Remix + Vite single-page app (React 18, UnoCSS) whose core feature is an AI agent that generates/edits full-stack apps and runs them in the browser via StackBlitz WebContainers. The primary web app lives at the repo root (no Docker, no external DB — chat history is stored client-side in IndexedDB). A separate Expo/React Native app lives under `mobile/` (see below).

Standard commands for the root web app live in `README.md` and `package.json` scripts (`dev`, `build`, `lint`, `typecheck`, `test`, `start`, `preview`). Prefer those; notes below are only the non-obvious caveats.

### Runtime / tooling
- `.tool-versions` pins Node `20.15.1` / pnpm `9.4.0`, but the cloud VM's default Node is v22, which satisfies `engines` (`>=18.18.0`). Install, lint, typecheck, test, build, and the dev server all work on Node 22 — no Node switch is required. pnpm `9.4.0` is already available on the VM (the update script runs `pnpm install`).

### Running the app (dev)
- `pnpm run dev` serves the Remix/Vite app on port **5173**. This is the way to run/test end to end (README notes HTTP streaming is unreliable under the `wrangler pages dev` `start`/`preview` flow).
- On first page load Vite pre-bundles deps and the browser can show transient `504 (Outdated Optimize Dep)` errors that leave the page non-interactive. Fix: hard-reload the page after Vite finishes optimizing. If it persists, stop the server, delete `node_modules/.vite`, and restart `pnpm run dev`.

### Required secret for the AI feature
- The AI chat (the core feature) requires an **`ANTHROPIC_API_KEY`**. In dev it is read from `process.env` (see `app/lib/.server/llm/api-key.ts`); put it in a git-ignored `.env.local` at the repo root (`ANTHROPIC_API_KEY=...`, optionally `VITE_LOG_LEVEL=debug`). Without it, the UI loads and is fully interactive but submitting a prompt makes `POST /api/chat` return HTTP 500 and shows a "There was an error processing your request" toast. Set it as a Cursor secret so it is injected into the VM.
- The `pnpm start` / `pnpm preview` (Wrangler) flow additionally requires `.env.local` to exist because `bindings.sh` reads it to build `--binding` flags; it errors if the file is missing.

### WebContainers
- Generated apps run **client-side** in the browser via `@webcontainer/api` (loaded from StackBlitz at runtime; no key needed for local dev). The preview pane may sit on a loading spinner until a WebContainer boots, and it needs a real browser with cross-origin isolation — it will not work via headless `curl`.

### Mobile app (`mobile/`)
- `mobile/` is a standalone **Expo / React Native** app (`bolt-mobile`) with its own `package.json`. It is **not** part of a pnpm workspace (there is no root `pnpm-workspace.yaml`), so the root `pnpm install` and the update script do not install it — install its deps separately from inside `mobile/` (`npm install` / `pnpm install` there) before running `expo start`. It is independent of the root web app and is not covered by the root CI/CD workflow.

### Known pre-existing issue (not an environment problem)
- `pnpm run lint` reports one pre-existing error on `main`: `'IconButton' is defined but never used` in `app/components/sidebar/Menu.client.tsx`. The lint tooling itself works; this is a codebase issue, not a setup issue.

### CI checks
- Two checks run on PRs (see `.github/workflows/`): **CI/CD / Test** (`setup-and-build` → `pnpm run typecheck` → `pnpm run test`; ESLint is intentionally commented out) and **Semantic Pull Request / Validate PR Title**. The latter enforces Conventional Commits on the *PR title*: it must start with a type prefix (`fix`, `feat`, `chore`, `build`, `ci`, `perf`, `docs`, `refactor`, `revert`, `test`) and the subject must not start with an uppercase letter (`subjectPattern: ^(?![A-Z]).+$`).
