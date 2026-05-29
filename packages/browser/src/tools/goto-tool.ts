import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";
import { getPageView } from "../utils";
import { PageIdSchema, ViewAfterSchema } from "../schema";

export function createGotoTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description: "Navigate to a URL in the selected browser page",
    inputSchema: z.object({
      pageId: PageIdSchema,
      url: z.string().describe("The URL to navigate to"),
      viewAfter: ViewAfterSchema,
    }),
    execute: async ({ pageId, url, viewAfter }) => {
      try {
        return await browser.withPage(pageId, async (page) => {
          await page.goto(url, { waitUntil: "load" });
          const base = `Navigated to URL: ${url}`;
          const output: string[] = [base];
          if (viewAfter) {
            output.push(await getPageView(page, viewAfter.mode));
          }
          return output.join("\n\n");
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return `Error navigating to ${url}: ${errorMessage}`;
      }
    },
  });
}
