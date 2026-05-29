import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";
import { getPageView } from "../utils";
import { PageIdSchema, ViewAfterSchema } from "../schema";

export function createClickTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description:
      "Click an element on the selected browser page using a CSS selector",
    inputSchema: z.object({
      pageId: PageIdSchema,
      cssSelector: z
        .string()
        .describe("The CSS selector for the element to click"),
      viewAfter: ViewAfterSchema,
    }),
    execute: async ({ pageId, cssSelector, viewAfter }) => {
      try {
        return await browser.withPage(pageId, async (page) => {
          await page.click(cssSelector);
          const base = `Clicked element using CSS selector: ${cssSelector}`;
          const output: string[] = [base];
          if (viewAfter) {
            output.push(await getPageView(page, viewAfter.mode));
          }
          return output.join("\n\n");
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return `Error clicking element ${cssSelector}: ${errorMessage}`;
      }
    },
  });
}
