import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";
import { getPageView } from "../utils";
import { ActiveTargetSchema, ViewAfterSchema } from "../schema";

export function createEvaluateTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description: "Execute JavaScript on the active browser page",
    inputSchema: z
      .object({
        script: z
          .string()
          .describe(
            "JavaScript expression or statements to run in the page; the last expression value is returned.",
          ),
        viewAfter: ViewAfterSchema,
      })
      .extend(ActiveTargetSchema.shape),
    execute: async ({ script, viewAfter, contextId, pageId }) => {
      try {
        return await browser.withPage(async (page) => {
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
        }, { contextId, pageId });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return `Execution failed with error: ${errorMessage}`;
      }
    },
  });
}
