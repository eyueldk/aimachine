import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";

export function createCloseContextTool({
  browser,
}: {
  browser: BrowserInstance;
}) {
  return tool({
    description: "Close the active browser context and all pages within it.",
    inputSchema: z.object({}),
    execute: async () => {
      const contextId = browser.getActiveContextId();
      await browser.closeActiveContext();
      return `Closed context ${contextId ?? "(unknown)"}.`;
    },
  });
}
