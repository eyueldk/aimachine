import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";

export function createNewPageTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description:
      "Open a new page in the active browser context and make it the active page.",
    inputSchema: z.object({}),
    execute: async () => {
      const pageId = await browser.newPage();
      return JSON.stringify({
        pageId,
        contextId: browser.getActiveContextId(),
        active: true,
      });
    },
  });
}
