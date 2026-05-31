import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";
import { getPageView } from "../utils";
import { ActiveTargetSchema, PageViewFormatSchema } from "../schema";

export function createViewPageTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description:
      "Return a page view: simplified structural HTML, accessibility (ARIA) snapshot, or Markdown",
    inputSchema: z
      .object({
        format: PageViewFormatSchema.optional().describe(
          "Output format. Defaults to simplified.",
        ),
      })
      .extend(ActiveTargetSchema.shape),
    execute: async ({ format, contextId, pageId }) => {
      return browser.withPage(
        async (page) => getPageView(page, format ?? "simplified"),
        { contextId, pageId },
      );
    },
  });
}
