# @aimachine/browser

[![npm](https://img.shields.io/npm/v/@aimachine/browser)](https://www.npmjs.com/package/@aimachine/browser)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**puppeteer-core** tools for the [Vercel AI SDK](https://ai-sdk.dev) (`generateText`, `streamText`, `ToolLoopAgent`, …). No bundled browser—pass `executablePath` (or `channel`) to `launch`, or add [`puppeteer`](https://www.npmjs.com/package/puppeteer) in your app if you want Chromium downloads.

**Repository:** [github.com/eyueldk/aimachine](https://github.com/eyueldk/aimachine) (`packages/browser`)

## Install

```bash
pnpm add @aimachine/browser
```

**Node 20+.** Runtime depends on **`puppeteer-core`** only.

## Usage

1. `launch` and open a `Page`.
2. `new Session({ page })` (enables console + network capture).
3. `createBrowserTools({ session })` → pass as `tools` to the AI SDK.
4. `await session.close()` (stops inspectors and closes the page), then `await browser.close()`.

```ts
import { generateText, stepCountIs } from "ai";
import { launch } from "puppeteer-core";
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

**Dev in this repo:** `puppeteer` is a devDependency for tests; with pnpm 10.1+, you may need `pnpm approve-builds --all` for Puppeteer’s postinstall.

## Scripts

`pnpm build` · `pnpm check` · `pnpm test` (agent tests need `OPENROUTER_API_KEY` in `.env`).

## License

MIT — see [LICENSE](./LICENSE).
