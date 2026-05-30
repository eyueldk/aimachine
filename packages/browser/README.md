# @eyueldk/aisdk-toolkit-browser

[![npm](https://img.shields.io/npm/v/@eyueldk/aisdk-toolkit-browser)](https://www.npmjs.com/package/@eyueldk/aisdk-toolkit-browser)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/eyueldk/aisdk-toolkit/blob/main/LICENSE)

**Version:** `2.0.0` (also in `package.json` `"version"`).

**Playwright-backed browser toolkit** for the [Vercel AI SDK](https://ai-sdk.dev): **`createBrowserToolkit({ browserWSEndpoint? })`** returns **`{ tools, hint, state }`** where **`state.browser`** is the **`BrowserInstance`**. Pages are identified by **`pageId`** (UUID). Playwright is bundled — consumers do not install it.

**Repository:** [github.com/eyueldk/aisdk-toolkit](https://github.com/eyueldk/aisdk-toolkit) (`packages/browser`)

## Requirements

| | |
| --- | --- |
| **Node** | 20+ (`engines.node`) |
| **Runtime deps** | `ai` ^6, `zod` ^4, `playwright` (transitive), `turndown` ^7, `@truto/turndown-plugin-gfm` ^1 |

## Install

```bash
pnpm add @eyueldk/aisdk-toolkit-browser
```

## Usage

**Self-launch** (local dev / tests — Chromium via Playwright):

```ts
import { generateText, stepCountIs } from "ai";
import { createBrowserToolkit } from "@eyueldk/aisdk-toolkit-browser";

const { tools, hint, state } = createBrowserToolkit();

try {
  await generateText({
    model: yourLanguageModel,
    tools,
    stopWhen: stepCountIs(10),
    system: `You control browser pages.\n\n${hint}`,
    prompt: "Open https://example.com and return the visible h1 text.",
  });
} finally {
  await state.browser.close();
}
```

**Attach to your browser** (production — pass a WebSocket endpoint from your own Playwright/Browserless setup):

```ts
const { tools, hint, state } = createBrowserToolkit({
  browserWSEndpoint: process.env.BROWSER_WS,
});
// await state.browser.close() when finished
```

### Pages and contexts

- Omit **`pageId`** on tools to use the **default page** (created on first use).
- **`createContext`**, **`createPage`**, **`listContexts`**, **`closePage`**, **`closeContext`** manage isolation.
- **`createPage`** returns a **`pageId`** — use that on all other tools.

```ts
const pageResult = await tools.createPage.execute({ contextId }, opts);
const { pageId } = JSON.parse(pageResult);
await tools.goto.execute({ pageId, url: "https://example.com" }, opts);
```

### Tools

`goto`, `click`, `type`, `evaluate`, `viewPage`, `inspectHTML`, `getScreenshot`, `inspectConsole`, `inspectNetwork`, `getCookies`, plus lifecycle tools above.

**`viewPage`** accepts optional **`format`**: `simplified` (default, structural HTML), `accessibility` (Playwright ARIA snapshot YAML), or `markdown` ([Turndown](https://github.com/mixmark-io/turndown) + GFM). **`goto`**, **`click`**, **`type`**, and **`evaluate`** accept optional **`viewAfter: { format }`** to append the same view after the action.

`inspectConsole` / `inspectNetwork` use **ring buffers** (recent history only); tool output truncates large fields.

`getScreenshot` returns base64 JPEG with **`toModelOutput`** for multimodal models.

## Migration (1.x → 2.0)

- **`createBrowserToolkit()`** returns **`state.browser`** instead of a top-level **`browser`**. Use **`await state.browser.close()`** on teardown.
- **`viewPage`** and **`viewAfter`** use **`format`** (`simplified` | `accessibility` | `markdown`), not **`mode`**. Example: **`viewAfter: { format: "markdown" }`**.

## Scripts

`pnpm build` · `pnpm check` (`tsc --noEmit`) · `pnpm test`. **`prepublishOnly`** runs `pnpm check && pnpm build` before publish.

Before running tests locally, install Chromium once:

```bash
cd packages/browser && pnpm exec playwright install chromium
```

Optional live agent smoke test: `tests/integration.test.ts` (skipped unless repo-root `.env` has non-empty `OPENROUTER_API_KEY` and `OPENROUTER_MODEL`; copy [`.env.example`](https://github.com/eyueldk/aisdk-toolkit/blob/main/.env.example)). Uses [OpenRouter](https://openrouter.ai/) with AI SDK `ToolLoopAgent` and requires Chromium when enabled.

## Publishing

CI publishes when **`packages/browser/**`** changes on **`main`** ([`publish.browser.yml`](https://github.com/eyueldk/aisdk-toolkit/blob/main/.github/workflows/publish.browser.yml)) or via **workflow_dispatch**. Configure [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) for that workflow.

## License

MIT — see [repository LICENSE](https://github.com/eyueldk/aisdk-toolkit/blob/main/LICENSE).
