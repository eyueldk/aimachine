import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";
import { getPageView } from "../utils";
import { PageIdSchema, PageViewFormatSchema } from "../schema";

export function createViewPageTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description:
      "Return a page view: simplified structural HTML, accessibility (ARIA) snapshot, or Markdown",
    inputSchema: z.object({
      pageId: PageIdSchema,
      format: PageViewFormatSchema.optional().describe(
        "Output format. Defaults to simplified.",
      ),
    }),
    execute: async ({ pageId, format }) => {
      return browser.withPage(pageId, async (page) =>
        getPageView(page, format ?? "simplified"),
      );
    },
  });
}
