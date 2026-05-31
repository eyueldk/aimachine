import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";
import { ContextIdSchema } from "../schema";

export function createSelectContextTool({
  browser,
}: {
  browser: BrowserInstance;
}) {
  return tool({
    description:
      "Select the active browser context. Subsequent page operations use a page in this context when possible.",
    inputSchema: z.object({
      contextId: ContextIdSchema,
    }),
    execute: async ({ contextId }) => {
      browser.selectContext(contextId);
      const activePageId = browser.getActivePageId();
      return JSON.stringify({
        contextId,
        activePageId: activePageId ?? null,
      });
    },
  });
}
