## Learned User Preferences

- Prefer concise, complete package READMEs (install, usage, tools, scripts, migration notes when relevant).
- `@aimachine/browser` types align with **`puppeteer`**; **`puppeteer` is a peer dependency** (install alongside the package).
- In GitHub Actions, do not add a separate global npm upgrade for OIDC trusted publishing; rely on the npm shipped with the selected Node version.
- Prefer [pnpm/action-setup](https://github.com/pnpm/action-setup) for installs after `actions/setup-node`, using `run_install` (e.g. frozen lockfile) and caching when useful.
- Publish automation: reusable workflow parameterized by workspace package name; concrete workflows for `@aimachine/browser` and `@aimachine/todos` on pushes to `main` (package-scoped path filters).
- Limit publish workflow path filters to the package directory (e.g. `packages/browser/**`), not repo-wide lockfile/workspace files, unless explicitly requested.
- Keep the root `.cursor/hooks` tree out of version control (gitignore).
- Use one MIT `LICENSE` at the repo root only; omit per-package `LICENSE` files from published workspace packages and point README license links at the root file on GitHub.
- Published package READMEs omit LangChain; keep any upstream prompt attribution in source (not marketing copy in READMEs).

## Learned Workspace Facts

- Private monorepo root package is `aimachine`; published workspace packages include `@aimachine/browser` in `packages/browser` and `@aimachine/todos` in `packages/todos`.
- Package and docs use GitHub `https://github.com/eyueldk/aimachine` for repository, issues, and homepage links.
- `.github/workflows/publish.browser.yml` runs on `main` when `packages/browser/**` changes (and via `workflow_dispatch`); it calls `.github/workflows/reusable.publish.yml` with package `@aimachine/browser`. `.github/workflows/publish.todos.yml` does the same for `packages/todos/**` and package `@aimachine/todos`.
- Reusable publish runs checkout, Node 24, `pnpm/action-setup@v6` with cache and frozen-lockfile install, then `check` (`tsc --noEmit`), `build`, `test`, and `publish --no-git-checks` for the filtered package. Each package’s `prepublishOnly` also runs `pnpm check && pnpm build` before npm pack/publish.
- `@aimachine/browser` `Session.close()` is async, stops inspectors, and closes the page; use `await session.close()` in teardown.
- Agent tests under `packages/browser` and `packages/todos` need `OPENROUTER_API_KEY` set in the repo root `.env` (see package READMEs; Vitest loads that file).
- Root `pnpm test` runs `@aimachine/browser` then `@aimachine/todos` in sequence so parallel Vitest plus Puppeteer does not time out.
- `createBrowserToolkit` takes `{ page }`, constructs a `Session`, and returns `{ tools, hint, session }`. `createTodosToolkit` returns `{ tools, hint, state }` where `state` is a serializable `TodoState` (`{ todos }`). Merge `tools` and append `hint` to system/instructions.
- `@aimachine/todos` uses camelCase AI SDK tool names (e.g. `writeTodos`, `viewTodos`) and todo status literals `pending`, `inProgress`, and `completed` (not snake_case).
