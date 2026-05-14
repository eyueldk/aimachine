# @aimachine/browser

[![npm](https://img.shields.io/npm/v/@aimachine/browser)](https://www.npmjs.com/package/@aimachine/browser)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

[**Puppeteer**](https://www.npmjs.com/package/puppeteer) tools for the [Vercel AI SDK](https://ai-sdk.dev) (`generateText`, `streamText`, `ToolLoopAgent`, …). Types and tooling align with the `puppeteer` package (it bundles Chromium via install scripts unless you configure otherwise).

**Repository:** [github.com/eyueldk/aimachine](https://github.com/eyueldk/aimachine) (`packages/browser`)

## Install

```bash
pnpm add @aimachine/browser puppeteer
# or: npm install @aimachine/browser puppeteer
```

**Node 20+.** **`puppeteer` is a peer dependency** — install it next to this package so types and `launch` / `Page` resolve.

## Usage

1. `launch` and open a `Page`.
2. `new Session({ page })` (enables console + network capture).
3. `createBrowserTools({ session })` → pass as `tools` to the AI SDK.
4. `await session.close()` (stops inspectors and closes the page), then `await browser.close()`.

```ts
import { generateText, stepCountIs } from "ai";
import { launch } from "puppeteer";
import { createBrowserTools, Session } from "@aimachine/browser";

const browser = await launch({ headless: true });
const page = await browser.newPage();
const session = new Session({ page });
const tools = createBrowserTools({ session });

try {
  await generateText({
    model: yourLanguageModel,
    tools,
    stopWhen: stepCountIs(10),
    prompt: "Open https://example.com and return the visible h1 text.",
  });
} finally {
  await session.close();
  await browser.close();
}
```

Bring your own model provider (e.g. `@ai-sdk/openai`). Use **`createBrowserTools` once per `Session`**.

### Tools

`goto`, `click`, `type`, `evaluate`, `viewPage`, `inspectHTML`, `getScreenshot`, `inspectConsole`, `inspectNetwork`, `getCookies`. Several accept **`viewAfter: true`** to append a simplified page view after the action.

Individual factories (`createGotoTool`, `createClickTool`, …) are available if you want a custom tool set.

`getScreenshot` returns base64 JPEG and **`toModelOutput`** for multimodal models.

**Install note:** with pnpm 10.1+, you may need `pnpm approve-builds --all` so Puppeteer’s postinstall can download Chromium.

## Scripts

`pnpm build` · `pnpm check` · `pnpm test` (agent tests need `OPENROUTER_API_KEY` in `.env`).

## License

MIT — see [LICENSE](./LICENSE).
