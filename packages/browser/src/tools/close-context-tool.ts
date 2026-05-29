import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";

export function createCloseContextTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description: "Close a browser context and all pages within it.",
    inputSchema: z.object({
      contextId: z.string().describe("Context id to close."),
    }),
    execute: async ({ contextId }) => {
      await browser.closeContext(contextId);
      return `Closed context ${contextId}.`;
    },
  });
}
