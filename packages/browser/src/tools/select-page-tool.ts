import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";
import { PageIdSchema } from "../schema";

export function createSelectPageTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description:
      "Select the active browser page. Navigation and interaction tools run on this page.",
    inputSchema: z.object({
      pageId: PageIdSchema,
    }),
    execute: async ({ pageId }) => {
      browser.selectPage(pageId);
      return JSON.stringify({
        pageId,
        contextId: browser.getActiveContextId(),
      });
    },
  });
}
