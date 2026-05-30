# @eyueldk/aisdk-toolkit

Private monorepo root for published **[@eyueldk/aisdk-toolkit-*](packages/)** workspace packages.

## Packages

| Package | Version | Description |
| --- | --- | --- |
| [@eyueldk/aisdk-toolkit-browser](packages/browser) | **2.0.0** | Playwright browser toolkit (`createBrowserToolkit`, `BrowserInstance`, AI SDK tools) |
| [@eyueldk/aisdk-toolkit-fetch](packages/fetch) | **1.0.0** | HTTP fetch toolkit (`fetchRequest`, native `fetch`) |
| [@eyueldk/aisdk-toolkit-todos](packages/todos) | **1.2.1** | Task-list toolkit (`writeTodos`, `readTodos`) |
| [@eyueldk/aisdk-toolkit-filesystem](packages/filesystem) | **1.0.1** | Filesystem toolkit (`read` / `write` / `edit` / `list` / `glob` / `grep`) |
| [@eyueldk/aisdk-toolkit-shell](packages/shell) | **1.0.0** | Shell toolkit (`runCommand`, local / Docker / SSH adapters) |

Versions are defined in each package’s **`package.json`**; keep this table in sync when you cut a release.

## Development

```bash
pnpm install
pnpm check    # tsc --noEmit in all workspace packages
pnpm build    # build all packages
pnpm test     # sequential: browser → todos → filesystem → shell → fetch
```

Package-specific install, API, and publishing notes live in each package’s **`README.md`**.

## Publishing

Each package publishes independently from GitHub Actions when **`packages/<name>/**`** changes on **`main`**, or via **workflow_dispatch**:

| Package | Workflow |
| --- | --- |
| `@eyueldk/aisdk-toolkit-browser` | [publish.browser.yml](.github/workflows/publish.browser.yml) |
| `@eyueldk/aisdk-toolkit-fetch` | [publish.fetch.yml](.github/workflows/publish.fetch.yml) |
| `@eyueldk/aisdk-toolkit-todos` | [publish.todos.yml](.github/workflows/publish.todos.yml) |
| `@eyueldk/aisdk-toolkit-filesystem` | [publish.filesystem.yml](.github/workflows/publish.filesystem.yml) |
| `@eyueldk/aisdk-toolkit-shell` | [publish.shell.yml](.github/workflows/publish.shell.yml) |

All call [reusable.publish.yml](.github/workflows/reusable.publish.yml) (`check` → `build` → `test` → `pnpm publish`). On npm, enable [Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) for the matching workflow file per package.
