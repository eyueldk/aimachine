# @eyueldk/aisdk-toolkit-fetch

[![npm](https://img.shields.io/npm/v/@eyueldk/aisdk-toolkit-fetch)](https://www.npmjs.com/package/@eyueldk/aisdk-toolkit-fetch)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/eyueldk/aimachine/blob/main/LICENSE)

**Version:** `1.0.0` (also in `package.json` `"version"`).

**HTTP fetch tools** for the [Vercel AI SDK](https://ai-sdk.dev) (`generateText`, `streamText`, `ToolLoopAgent`, …): **`createFetchToolkit()`** returns **`{ tools, hint, state }`**. Pass **`tools`** and **`hint`** (`FETCH_HINT`) into the AI SDK. Uses **`globalThis.fetch`** by default.

**Repository:** [github.com/eyueldk/aimachine](https://github.com/eyueldk/aimachine) (`packages/fetch`)

## Requirements

| | |
| --- | --- |
| **Node** | 20+ (`engines.node`) |
| **Runtime deps** | `ai` ^6, `zod` ^4, `turndown` ^7, `@truto/turndown-plugin-gfm` ^1 |

Uses the environment’s built-in **`fetch`** (Node 18+ / modern runtimes).

## Install

```bash
pnpm add @eyueldk/aisdk-toolkit-fetch
```

## Usage

1. **`createFetchToolkit()`** → `{ tools, hint, state }`.
2. Pass **`tools`** and **`hint`** into the AI SDK.

```ts
import { generateText, stepCountIs } from "ai";
import { createFetchToolkit } from "@eyueldk/aisdk-toolkit-fetch";

const { tools, hint } = createFetchToolkit();

await generateText({
  model: yourLanguageModel,
  tools,
  stopWhen: stepCountIs(10),
  system: `You can fetch HTTP resources.\n\n${hint}`,
  prompt:
    "Call fetchRequest with path https://example.com and format markdown, then summarize the page.",
});
```

**`path`** + **`query`** (optional):

```ts
await tools.fetchRequest.execute({
  path: "https://api.example.com/search",
  query: { q: "cats", limit: 10 },
  format: "markdown",
});
```

Optional config (custom **`fetch`** impl or default timeout):

```ts
const { tools, hint } = createFetchToolkit({
  defaultTimeoutMs: 15_000,
});
```

### Tools

**`fetchRequest`** — HTTP request with **`path`** (absolute URL), optional **`query`** (merged via `URL` search params), **`method`** (default GET), **`headers`**, **`body`**, **`timeoutMs`**, and **`format`** (`raw` default, or `markdown` for structured status/headers plus a body section: HTML is converted with [Turndown](https://github.com/mixmark-io/turndown) + GFM; JSON and other types are returned unchanged). Returns status, response headers, and body (large bodies are truncated in the tool response).

**`createFetchTools`** is the same resolved fetch config without **`hint`** / **`state`**. **`createFetchRequestTool`** and **`performHttpFetch`** are exported for custom tool sets.

## Configuration

| Option | Where | Default |
| --- | --- | --- |
| **`timeoutMs`** | `fetchRequest` | `30_000` (`DEFAULT_FETCH_TIMEOUT_MS`) |
| **`fetch`** | `createFetchToolkit` | `globalThis.fetch` |
| **`defaultTimeoutMs`** | `createFetchToolkit` | `DEFAULT_FETCH_TIMEOUT_MS` |
| **`format`** | `fetchRequest` | `raw` (`markdown` converts HTML only) |
| **`query`** | `fetchRequest` | merged into `path` via `URL` search params |

## Publishing

CI publishes when **`packages/fetch/**`** changes on **`main`** ([`publish.fetch.yml`](https://github.com/eyueldk/aimachine/blob/main/.github/workflows/publish.fetch.yml)) or via **workflow_dispatch**. Configure [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) for that workflow.

## License

MIT — see [repository LICENSE](https://github.com/eyueldk/aimachine/blob/main/LICENSE).
