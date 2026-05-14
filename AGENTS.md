## Learned User Preferences

- Prefer concise, complete package READMEs (install, usage, tools, scripts, migration notes when relevant).
- Use `puppeteer-core` for library/runtime so consumers are not forced to download Chromium; reserve full `puppeteer` for dev/tests when a managed browser is needed.
- In GitHub Actions, do not add a separate global npm upgrade for OIDC trusted publishing; rely on the npm shipped with the selected Node version.
- Prefer [pnpm/action-setup](https://github.com/pnpm/action-setup) for installs after `actions/setup-node`, using `run_install` (e.g. frozen lockfile) and caching when useful.
- Publish automation: reusable workflow parameterized by workspace package name; concrete workflow for the browser package on pushes to `main`.
- Limit publish workflow path filters to the package directory (e.g. `packages/browser/**`), not repo-wide lockfile/workspace files, unless explicitly requested.
- Keep the root `.cursor/hooks` tree out of version control (gitignore).

## Learned Workspace Facts

- Private monorepo root package is `aimachine`; the browser library is `@aimachine/browser` in `packages/browser`.
- Package and docs use GitHub `https://github.com/aimachine/aimachine` for repository, issues, and homepage links.
- `.github/workflows/publish.browser.yml` runs on `main` when `packages/browser/**` changes (and via `workflow_dispatch`); it calls `.github/workflows/reusable.publish.yml` with package `@aimachine/browser`.
- Reusable publish runs checkout, Node 24, `pnpm/action-setup@v6` with cache and frozen-lockfile install, then `build`, `test`, and `publish --no-git-checks` for the filtered package.
