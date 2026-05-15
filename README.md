# aimachine

pnpm monorepo for **[@aimachine/browser](packages/browser)** and **[@aimachine/todos](packages/todos)**.

## Packages

| Package | Version | Description |
| --- | --- | --- |
| [@aimachine/browser](packages/browser) | **2.1.0** | Puppeteer browser toolkit (`createBrowserToolkit`, AI SDK tools) for the [Vercel AI SDK](https://ai-sdk.dev) |
| [@aimachine/todos](packages/todos) | **1.1.0** | Task-list toolkit (`writeTodos`, `viewTodos`, `createTodosToolkit`) for the [Vercel AI SDK](https://ai-sdk.dev) |

Versions are defined in each package’s **`package.json`**; keep this table in sync when you cut a release.

## Development

```bash
pnpm install
pnpm check    # tsc --noEmit in all workspace packages
pnpm build    # build all packages
pnpm test
```

Package-specific install, API, scripts, and release notes live in each package’s **`README.md`**.
