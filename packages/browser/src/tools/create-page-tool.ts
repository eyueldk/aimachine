import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";

export function createCreatePageTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description:
      "Open a new page in an existing or default browser context. Returns pageId for other tools.",
    inputSchema: z.object({
      contextId: z
        .string()
        .optional()
        .describe(
          "Context UUID from createContext or listContexts. Omit for the default context.",
        ),
    }),
    execute: async ({ contextId }) => {
      const pageId = await browser.createPage(contextId);
      const contexts = browser.listContexts();
      const ctx = contexts.find((c) => c.pageIds.includes(pageId));
      return JSON.stringify({
        pageId,
        contextId: ctx?.contextId,
      });
    },
  });
}
