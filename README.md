# @aitoolkit/browser

[![npm](https://img.shields.io/npm/v/@aitoolkit/browser)](https://www.npmjs.com/package/@aitoolkit/browser)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Puppeteer-backed **browser tools** for the [Vercel AI SDK](https://ai-sdk.dev) (`generateText`, `streamText`, `ToolLoopAgent`, …). Each interaction (navigate, click, type, evaluate, screenshots, DOM/network/console inspection) is exposed as an AI SDK `tool()` you can pass straight into your model calls.

Source: **[github.com/eyueldk/aitoolkit](https://github.com/eyueldk/aitoolkit)**.

## Install

```bash
pnpm add @aitoolkit/browser
# or
npm install @aitoolkit/browser
```

**Runtime:** Node.js **20+**. [Puppeteer](https://pptr.dev/) is included as a dependency (Chromium download may run on first use unless you point `PUPPETEER_*` env vars at an existing browser).

On **pnpm 10.1+**, if install reports ignored build scripts for `puppeteer` / `esbuild`:

```bash
pnpm approve-builds --all
pnpm install
```

## Quick start

```ts
import { generateText, stepCountIs } from "ai";
import { launch } from "puppeteer";
import { createBrowserTools, Session } from "@aitoolkit/browser";

const browser = await launch({ headless: true });
const page = await browser.newPage();
const session = new Session({ page });
const tools = createBrowserTools({ session });

try {
  await generateText({
    model: yourLanguageModel, // any AI SDK language model, e.g. OpenRouter below
    tools,
    stopWhen: stepCountIs(10),
    prompt: "Open https://example.com and return the visible h1 text.",
  });
} finally {
  session.close();
  await browser.close();
}
```

### OpenRouter

```ts
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, stepCountIs } from "ai";
import { launch } from "puppeteer";
import { createBrowserTools, Session } from "@aitoolkit/browser";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  appName: "my-app",
});

const browser = await launch({ headless: true });
const page = await browser.newPage();
const session = new Session({ page });
const tools = createBrowserTools({ session });

await generateText({
  model: openrouter.chat("openai/gpt-4o-mini"),
  tools,
  stopWhen: stepCountIs(10),
  prompt: "...",
});
```

Install the provider next to this package:

```bash
pnpm add @openrouter/ai-sdk-provider
```

See [OpenRouter + AI SDK](https://ai-sdk.dev/providers/community-providers/openrouter) and [models](https://openrouter.ai/models).

## API

### `createBrowserTools({ session })`

- **`session`**: a {@link Session} built with `new Session({ page })` from the exported **`Session`** class.

Returns **`{ ...tools } as const`**: the object **is** the AI SDK `tools` map (e.g. `generateText({ tools: createBrowserTools({ session }) })`). Inspectors are already running on the session from **`new Session({ page })`**.

Call **`createBrowserTools` once per `Session`** so tool instances stay aligned with that session’s page.

### `Session`

On construction, **`Session`** attaches console and network listeners. Call **`session.close()`** when you are done (e.g. before **`browser.close()`**) to detach them.

Export **`Session`** so you can **`new Session({ page })`**, then either pass it to **`createBrowserTools`** or pass the same instance into individual **`createXTool({ session })`** factories for a custom tool set.

### Individual tool factories

You can compose tools yourself. Each factory takes **`{ session }`** (e.g. `createGotoTool({ session })`):

`createGotoTool`, `createClickTool`, `createTypeTool`, `createEvaluateTool`, `createGetCookiesTool`, `createViewPageTool`, `createGetScreenshotTool`, `createInspectHTMLTool`, `createInspectConsoleTool`, `createInspectNetworkTool`

### Screenshots

`getScreenshot` returns JPEG bytes as base64 from `execute` and uses **`toModelOutput`** so multimodal models receive **`image-data`** content parts.

## Agent test

`tests/agent.test.ts` runs **`generateText`** with **`@openrouter/ai-sdk-provider`**, the bundled browser tools, and model **`google/gemini-2.5-flash-lite`**. The whole suite is **skipped** when **`OPENROUTER_API_KEY`** is missing or empty.

From the package root, set your key (e.g. copy [`.env.example`](./.env.example) to `.env` and fill it, or export in the shell), then:

```bash
pnpm test
```

| Variable | Required for agent test | Description |
|----------|------------------------|-------------|
| `OPENROUTER_API_KEY` | Yes (otherwise skipped) | API key from [openrouter.ai/keys](https://openrouter.ai/keys) |

The devDependency **`@openrouter/ai-sdk-provider`** powers that test; **`dotenv`** is used in **`vitest.config.ts`** so a local **`.env`** (from **`.env.example`**) is loaded when you run **`pnpm test`**.

## Scripts (maintainers)

| Script | Purpose |
|--------|---------|
| `pnpm build` | Production bundle to `dist/` via [tsdown](https://github.com/rolldown/tsdown) |
| `pnpm check` | `tsc --noEmit` |
| `pnpm test` | Vitest + Puppeteer (includes optional agent test when `OPENROUTER_API_KEY` is set) |

## Publishing

```bash
pnpm build
npm publish
```

`prepublishOnly` runs `pnpm build`. Published tarball includes **`dist/`**, **`README.md`**, **`LICENSE`**, and **`package.json`** only (test sources and fixtures are not published).

## Migration from LangChain (`langchainjs-browsing`)

If you used the older LangChain-only package, adopt this AI SDK toolkit instead:

- `createBrowsingMiddleware({ page })` → **`new Session({ page })`** + **`createBrowserTools({ session })`** (inspectors attach in the `Session` constructor).
- Pass the tools object as **`tools`** into AI SDK calls; call **`session.close()`** when tearing down before closing the browser.
- LangChain `ToolMessage` images → AI SDK **`tool()`** + **`toModelOutput`** (`image-data`).

## License

MIT — see [LICENSE](./LICENSE).
