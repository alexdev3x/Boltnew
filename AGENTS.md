# AGENTS.md

## Cursor Cloud specific instructions

This repo is **Bolt** — the open-source core of [bolt.new](https://bolt.new). It contains two products:

- **Bolt web** (repo root): a Remix + Vite single-page app (React 18, UnoCSS) targeting Cloudflare Pages/Workers. Its core feature is an AI agent that generates/edits full-stack apps and runs them in the browser via StackBlitz WebContainers. Package manager is **pnpm** (`pnpm-lock.yaml`).
- **Bolt mobile** (`mobile/`): a standalone **Expo / React Native** app (`bolt-mobile`) with its own `package.json`. Package manager is **npm** (`mobile/package-lock.json`).

There is no server database, no Docker, and no `docker-compose`. Chat history is stored client-side (IndexedDB on web, AsyncStorage on mobile).

Standard commands for the root web app live in `README.md` and `package.json` scripts (`dev`, `build`, `lint`, `typecheck`, `test`, `start`, `preview`). Prefer those; the notes below are only the non-obvious caveats.

### Runtime / tooling

- `.tool-versions` pins Node `20.15.1` / pnpm `9.4.0`, but the cloud VM's default Node is v22, which satisfies `engines` (`>=18.18.0`). Install, lint, typecheck, test, build, and the dev server all work on Node 22 — no Node switch is required. If you hit a Node-version-specific issue, switch with `nvm use 20.15.1`. pnpm `9.4.0` is already available on the VM (the update script runs `pnpm install`).

### Running the apps (dev)

- **Web**: `pnpm run dev` serves the Remix/Vite app on port **5173**. This is the way to run/test end to end (README notes HTTP streaming is unreliable under the `wrangler pages dev` `start`/`preview` flow).
  - On first page load Vite pre-bundles deps and the browser can show transient `504 (Outdated Optimize Dep)` errors that leave the page non-interactive. Fix: hard-reload the page after Vite finishes optimizing. If it persists, stop the server, delete `node_modules/.vite`, and restart `pnpm run dev`.
- **Mobile**: `mobile/` is **not** part of a pnpm workspace (there is no root `pnpm-workspace.yaml`), so the root `pnpm install` and the update script do **not** install it — install its deps separately from inside `mobile/` (`npm install`). Then from `mobile/`: `npm run web` serves the Expo web build on port **8081** (first bundle can take 20-40s), and `npm run start` opens the Expo dev menu (i/a/w for iOS/Android/web). It is independent of the root web app and is not covered by the root CI/CD workflow.

### Required secret for the web AI feature

- The web AI chat and prompt enhancer (`/api/chat`, `/api/enhancer`) require an **`ANTHROPIC_API_KEY`**. In dev it is read from `process.env` (see `app/lib/.server/llm/api-key.ts`); put it in a git-ignored `.env.local` at the repo root (`ANTHROPIC_API_KEY=...`, optionally `VITE_LOG_LEVEL=debug`), or set it as a Cursor secret so it is injected into the VM. Without it the UI loads and is fully interactive, but submitting a prompt makes `POST /api/chat` return HTTP 500 (`AI_LoadAPIKeyError`) and shows a "There was an error processing your request" toast.
- The `pnpm start` / `pnpm preview` (Wrangler) flow additionally requires `.env.local` to exist because `bindings.sh` reads it to build `--binding` flags; it errors if the file is missing.
- **Mobile needs no key**: the mobile app uses on-device mock AI responses, so its full chat → workbench (Code/Preview) flow works end-to-end with no secrets.

### WebContainers

- Generated apps run **client-side** in the browser via `@webcontainer/api` (loaded from StackBlitz at runtime; no key needed for local dev). The preview pane may sit on a loading spinner until a WebContainer boots, and it needs a real browser with cross-origin isolation (SharedArrayBuffer) — it will not work via headless `curl`. Chrome 129 is intercepted by a plugin in `vite.config.ts` and shown a warning page in local dev.

### Known pre-existing lint errors (not an environment problem)

- `pnpm run lint` currently reports pre-existing errors (the lint tooling itself works; these are codebase issues, not setup issues): `'IconButton' is defined but never used` in `app/components/sidebar/Menu.client.tsx`, plus numerous errors across `mobile/**` and one in `tsconfig.json`. ESLint is **intentionally disabled in CI** (`.github/workflows/ci.yaml` has the ESLint step commented out), so treat `pnpm run lint` as informational.

### CI checks

- Two checks run on PRs (see `.github/workflows/`): **CI/CD / Test** (`setup-and-build` → `pnpm run typecheck` → `pnpm run test` via Vitest; ESLint is intentionally commented out — both typecheck and tests pass) and **Semantic Pull Request / Validate PR Title**. The latter enforces Conventional Commits on the *PR title*: it must start with a type prefix (`fix`, `feat`, `chore`, `build`, `ci`, `perf`, `docs`, `refactor`, `revert`, `test`) and the subject must not start with an uppercase letter (`subjectPattern: ^(?![A-Z]).+$`).

### Quality checks

- Web: `pnpm run typecheck`, `pnpm test`, `pnpm run lint` (lint informational only — see above).
- Mobile: `cd mobile && npm run typecheck`.
