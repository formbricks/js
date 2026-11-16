# Repository Guidelines

## Project Structure & Module Organization

- This repository is a `pnpm` workspace managed with Turborepo.
- The published SDK lives in `packages/js`.
- SDK source, helpers, and shared types live in `packages/js/src`, `packages/js/src/lib`, and `packages/js/src/types`.
- The demo app lives in `apps/playground` and exercises SDK behavior locally with Vite + React.
- Generated output such as `dist/`, `temp/`, `coverage/`, `.turbo/`, and the API report `packages/js/etc/js.api.md` should not be edited by hand.

## Build, Test, and Development Commands

Run commands from the repo root unless you are working on a single package.

- `pnpm install` installs workspace dependencies.
- `pnpm dev` runs workspace dev tasks through Turbo; for interactive UI work, use `pnpm --filter playground dev`.
- `pnpm build` builds all packages; `pnpm --filter @formbricks/js build` rebuilds only the SDK.
- `pnpm test` runs workspace tests; `pnpm test:coverage` collects coverage via Vitest.
- `pnpm lint` runs Biome's lint rules and import sorting; warnings fail it.
- `pnpm format:check` checks formatting with Biome; `pnpm format` fixes it.
- `pnpm check-types` runs TypeScript without emitting output.
- `pnpm api:check` compares the SDK's public API with the committed report in `packages/js/etc/js.api.md`. After an intended API change, run `pnpm api:update` (or `pnpm build`) and commit the updated report.
- `pnpm package-check` runs publint and attw on the built SDK, then installs the packed tarball into a scratch consumer (`scripts/consumer-check.sh`). Run `pnpm build` first.
- `pnpm test:scripts` runs the Node tests for the repo scripts in `scripts/` (release and PR Check Summary).
- E2E (`.github/workflows/e2e.yml`, job `e2e-tests`): `e2e/server/up.sh` boots a published Formbricks image with Docker and bootstraps a tenant, `e2e/server/seed.sh` seeds the survey (needs `ENTERPRISE_LICENSE_KEY`), `pnpm --filter e2e test:e2e` runs the Playwright golden journey on the playground, then `e2e/server/assert-response.sh`, `cleanup.sh` and `down.sh`. `e2e/server/test/lib.test.sh` unit-tests the harness. `e2e/server` is plain bash + curl + jq so the other SDK repos copy it unchanged.
- `pnpm clean` removes local build artifacts.

## Coding Style & Naming Conventions

- Biome is the formatter and linter.
- CI runs every check in `.github/workflows/ci.yml`; `PR Check Summary` is the one required check.
- The repository uses 2-space indentation, double quotes, trailing commas, and semicolons.
- Prefer TypeScript modules and keep public exports in `packages/js/src/index.ts`.
- Use `camelCase` for variables and functions.
- Use `PascalCase` for types and components.
- Keep filenames descriptive; tests follow the source name, for example `load-formbricks.test.ts`.

## Testing Guidelines

- SDK tests use Vitest and currently live beside the implementation under `packages/js/src`.
- Add or update `*.test.ts` files when changing SDK behavior, especially proxy/loading logic in `src/lib`.
- Run `pnpm --filter @formbricks/js test` before opening a PR.
- Use `pnpm --filter @formbricks/js test:coverage` when touching core runtime paths.
- No explicit coverage threshold is configured, so contributors should cover new branches and regressions directly.

## Commit & Pull Request Guidelines

- Recent history follows Conventional Commits such as `fix: restore eslint 9` and `chore: bump minor dependencies`.
- Keep commit subjects short, imperative, and prefixed with `fix:`, `feat:`, `chore:`, or similar.
- PRs should explain the behavioral change and note affected packages (`packages/js`, `apps/playground`, or both).
- Link related issues when applicable.
- Include screenshots or short recordings for playground UI changes.
- Mention any required environment setup, such as `apps/playground/.env` variables, in the PR description.
