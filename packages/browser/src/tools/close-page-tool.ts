import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";

export function createClosePageTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description: "Close the active browser page.",
    inputSchema: z.object({}),
    execute: async () => {
      const pageId = browser.getActivePageId();
      await browser.closeActivePage();
      return `Closed page ${pageId ?? "(unknown)"}.`;
    },
  });
}
