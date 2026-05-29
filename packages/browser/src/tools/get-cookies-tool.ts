import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";
import { PageIdSchema } from "../schema";

export function createGetCookiesTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description: "Return cookies for the selected page's browser context",
    inputSchema: z.object({
      pageId: PageIdSchema,
    }),
    execute: async ({ pageId }) => {
      try {
        return await browser.withPage(pageId, async (page) => {
          const cookies = await page.context().cookies();
          return JSON.stringify(cookies);
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return `Error getting cookies: ${errorMessage}`;
      }
    },
  });
}
