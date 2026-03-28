# Repository Guidelines

## Project Structure & Module Organization
This repository is a `pnpm` workspace managed with Turborepo. The published SDK lives in `packages/js`, with source in `packages/js/src`, library helpers in `packages/js/src/lib`, and shared types in `packages/js/src/types`. The demo app lives in `apps/playground` and is used to exercise SDK behavior locally with Vite + React. Generated output such as `dist/`, `coverage/`, and `.turbo/` should not be edited by hand.

## Build, Test, and Development Commands
Run commands from the repo root unless you are working on a single package.

- `pnpm install` installs workspace dependencies.
- `pnpm dev` runs workspace dev tasks through Turbo; for interactive UI work, use `pnpm --filter playground dev`.
- `pnpm build` builds all packages; `pnpm --filter @formbricks/js build` rebuilds only the SDK.
- `pnpm test` runs workspace tests; `pnpm test:coverage` collects coverage via Vitest.
- `pnpm lint` checks formatting and lint rules with Biome.
- `pnpm check-types` runs TypeScript without emitting output.
- `pnpm clean` removes local build artifacts.

## Coding Style & Naming Conventions
Biome is the formatter and linter. The repository uses 2-space indentation, double quotes, trailing commas, and semicolons. Prefer TypeScript modules and keep public exports in `packages/js/src/index.ts`. Use `camelCase` for variables/functions, `PascalCase` for types and components, and keep filenames descriptive; tests follow the source name, for example `load-formbricks.test.ts`.

## Testing Guidelines
SDK tests use Vitest and currently live beside the implementation under `packages/js/src`. Add or update `*.test.ts` files when changing SDK behavior, especially proxy/loading logic in `src/lib`. Run `pnpm --filter @formbricks/js test` before opening a PR, and use `pnpm --filter @formbricks/js test:coverage` when touching core runtime paths. No explicit coverage threshold is configured, so contributors should aim to cover new branches and regressions directly.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commits such as `fix: restore eslint 9` and `chore: bump minor dependencies`. Keep commit subjects short, imperative, and prefixed with `fix:`, `feat:`, `chore:`, or similar. PRs should explain the behavioral change, note affected packages (`packages/js`, `apps/playground`, or both), link related issues when applicable, and include screenshots or short recordings for playground UI changes. Mention any required environment setup, such as `apps/playground/.env` variables, in the PR description.
