import { BrowserInstance, type BrowserInstanceOptions } from "./browser/browser-instance";
import { BROWSER_TOOLKIT_HINT } from "./hint";
import { createBrowserTools } from "./tools";

export type BrowserTools = ReturnType<typeof createBrowserTools>;

export type BrowserToolkit = {
  tools: BrowserTools;
  hint: string;
  browser: BrowserInstance;
};

export type CreateBrowserToolkitOptions = {
  browser?: BrowserInstance;
} & BrowserInstanceOptions;

/**
 * Primary entry point: AI SDK tools, system hint, and {@link BrowserInstance}.
 * Pass `tools` and `hint` into the AI SDK; call `await browser.close()` when finished.
 */
export function createBrowserToolkit(
  options?: CreateBrowserToolkitOptions,
): BrowserToolkit {
  const { browser: existingBrowser, ...browserOptions } = options ?? {};
  const browser = existingBrowser ?? new BrowserInstance(browserOptions);
  const tools = createBrowserTools({ browser });
  return { tools, hint: BROWSER_TOOLKIT_HINT, browser };
}
