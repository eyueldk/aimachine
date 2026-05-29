import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";

export function createClosePageTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description: "Close a browser page by pageId.",
    inputSchema: z.object({
      pageId: z.string().describe("Page id to close."),
    }),
    execute: async ({ pageId }) => {
      await browser.closePage(pageId);
      return `Closed page ${pageId}.`;
    },
  });
}
