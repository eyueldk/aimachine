import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";
import { getPageView } from "../utils";
import { PageIdSchema, ViewAfterSchema } from "../schema";

export function createTypeTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description:
      "Type text into an input element on the selected page using a CSS selector",
    inputSchema: z.object({
      pageId: PageIdSchema,
      cssSelector: z
        .string()
        .describe("The CSS selector for the input element"),
      text: z.string().describe("Text to type"),
      viewAfter: ViewAfterSchema,
    }),
    execute: async ({ pageId, cssSelector, text, viewAfter }) => {
      try {
        return await browser.withPage(pageId, async (page) => {
          await page.locator(cssSelector).waitFor({ state: "visible" });
          await page.fill(cssSelector, text);
          const base = `Typed text into CSS selector: ${cssSelector}`;
          const output: string[] = [base];
          if (viewAfter) {
            output.push(await getPageView(page, viewAfter.mode));
          }
          return output.join("\n\n");
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return `Error typing into ${cssSelector}: ${errorMessage}`;
      }
    },
  });
}
