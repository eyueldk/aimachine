import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";
import { getPageView } from "../utils";
import { PageIdSchema, ViewAfterSchema } from "../schema";

export function createEvaluateTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description: "Execute JavaScript on the selected browser page",
    inputSchema: z.object({
      pageId: PageIdSchema,
      script: z
        .string()
        .describe(
          "JavaScript expression or statements to run in the page; the last expression value is returned.",
        ),
      viewAfter: ViewAfterSchema,
    }),
    execute: async ({ pageId, script, viewAfter }) => {
      try {
        return await browser.withPage(pageId, async (page) => {
          const result = await page.evaluate((code: string) => {
            const fn = new Function(`return (${code});`);
            return fn();
          }, script);
          const base = `Execution result: ${JSON.stringify(result)}`;
          const output = [base];
          if (viewAfter) {
            output.push(await getPageView(page, viewAfter.format));
          }
          return output.join("\n\n");
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return `Execution failed with error: ${errorMessage}`;
      }
    },
  });
}
