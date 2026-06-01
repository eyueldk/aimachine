import { BrowserInstance } from "./browser/browser-instance";
import { BROWSER_TOOLKIT_HINT } from "./hint";
import { createBrowserTools } from "./tools";

export type Toolkit<TTools extends Record<string, unknown>, TState> = {
  tools: TTools;
  hint: string;
  state: TState;
};

export type BrowserTools = ReturnType<typeof createBrowserTools>;

export type BrowserToolkitState = {
  browser: BrowserInstance;
};

export type BrowserToolkit = Toolkit<BrowserTools, BrowserToolkitState>;

export type CreateBrowserToolkitOptions = {
  /** Chrome DevTools Protocol endpoint (`http://` or `ws://`) to attach via `connectOverCDP` instead of launching Chromium locally. */
  browserWsEndpoint?: string;
};

/**
 * Primary entry point: AI SDK `tools`, bundled `hint`, and `{ browser }` on `state`.
 * Pass `tools` and `hint` into the AI SDK; call `await state.browser.close()` when finished.
 */
export function createBrowserToolkit(
  options?: CreateBrowserToolkitOptions,
): BrowserToolkit {
  const browser = new BrowserInstance({
    browserWsEndpoint: options?.browserWsEndpoint,
  });
  const tools = createBrowserTools({ browser });
  return {
    tools,
    hint: BROWSER_TOOLKIT_HINT,
    state: { browser },
  };
}
