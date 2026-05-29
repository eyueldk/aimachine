import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";
import { getPageView } from "../utils";
import { PageIdSchema, PageViewModeSchema } from "../schema";

export function createViewPageTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description:
      "Return a page view: simplified structural HTML or an accessibility (ARIA) snapshot",
    inputSchema: z.object({
      pageId: PageIdSchema,
      mode: PageViewModeSchema.optional().describe(
        "View mode. Defaults to simplified.",
      ),
    }),
    execute: async ({ pageId, mode }) => {
      return browser.withPage(pageId, async (page) =>
        getPageView(page, mode ?? "simplified"),
      );
    },
  });
}
