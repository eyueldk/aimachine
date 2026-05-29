# @eyueldk/aisdk-toolkit

Private monorepo root for published **[@eyueldk/aisdk-toolkit-browser](packages/browser)**, **[@eyueldk/aisdk-toolkit-todos](packages/todos)**, and **[@eyueldk/aisdk-toolkit-filesystem](packages/filesystem)** workspace packages.

## Packages

| Package | Version | Description |
| --- | --- | --- |
| [@eyueldk/aisdk-toolkit-browser](packages/browser) | **1.0.0** | Playwright browser toolkit (`createBrowserToolkit`, `BrowserInstance`, AI SDK tools) for the [Vercel AI SDK](https://ai-sdk.dev) |
| [@eyueldk/aisdk-toolkit-todos](packages/todos) | **1.2.0** | Task-list toolkit (`writeTodos`, `readTodos`, `createTodosToolkit`) for the [Vercel AI SDK](https://ai-sdk.dev) |
| [@eyueldk/aisdk-toolkit-filesystem](packages/filesystem) | **1.0.0** | FileSystem toolkit (`createFileSystemToolkit`, adapters, `read` / `write` / `edit` / `list` / `glob` / `grep`) for the [Vercel AI SDK](https://ai-sdk.dev) |

Versions are defined in each package’s **`package.json`**; keep this table in sync when you cut a release.

## Development

```bash
pnpm install
pnpm check    # tsc --noEmit in all workspace packages
pnpm build    # build all packages
pnpm test     # browser, then todos, then filesystem (sequential)
```

Package-specific install, API, scripts, and release notes live in each package’s **`README.md`**.

## Publishing

Each package publishes independently from GitHub Actions when **`packages/<name>/**`** changes on **`main`**, or via **workflow_dispatch**:

| Package | Workflow |
| --- | --- |
| `@eyueldk/aisdk-toolkit-browser` | [publish.browser.yml](.github/workflows/publish.browser.yml) |
| `@eyueldk/aisdk-toolkit-todos` | [publish.todos.yml](.github/workflows/publish.todos.yml) |
| `@eyueldk/aisdk-toolkit-filesystem` | [publish.filesystem.yml](.github/workflows/publish.filesystem.yml) |

All three call [reusable.publish.yml](.github/workflows/reusable.publish.yml) (`check` → `build` → `test` → `pnpm publish`). On npm, enable [Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) for the matching workflow file per package.
