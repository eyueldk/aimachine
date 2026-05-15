import type { Page } from "puppeteer";
import { Session } from "./session";
import { BROWSER_TOOLKIT_HINT } from "./hint";
import { createBrowserTools } from "./tools";

export type BrowserTools = ReturnType<typeof createBrowserTools>;

export type BrowserToolkit = {
  tools: BrowserTools;
  hint: string;
  session: Session;
};

export interface CreateBrowserToolkitOptions {
  page: Page;
}

/**
 * Primary entry point: constructs a {@link Session} for the page, AI SDK `tools`, and a
 * `hint` for your system prompt. Pass `tools` / `hint` into `generateText` (etc.); call
 * `await session.close()` when finished (then close the browser if you own it).
 */
export function createBrowserToolkit(
  options: CreateBrowserToolkitOptions,
): BrowserToolkit {
  const session = new Session({ page: options.page });
  const tools = createBrowserTools({ session });
  return { tools, hint: BROWSER_TOOLKIT_HINT, session };
}
