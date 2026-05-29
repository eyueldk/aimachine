import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";
import { PageIdSchema } from "../schema";

export function createInspectHTMLTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description:
      "Return HTML for the full page or a slice matched by a CSS selector",
    inputSchema: z.object({
      pageId: PageIdSchema,
      cssSelector: z
        .string()
        .optional()
        .describe(
          "Optional CSS selector. If omitted, returns the full page HTML.",
        ),
    }),
    execute: async ({ pageId, cssSelector }) => {
      try {
        return await browser.withPage(pageId, async (page) => {
          if (!cssSelector) {
            return await page.content();
          }
          return page.locator(cssSelector).evaluate((el) => el.outerHTML);
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return `Error inspecting HTML: ${errorMessage}`;
      }
    },
  });
}
