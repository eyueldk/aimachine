import { z } from "zod";

export const PageIdSchema = z
  .string()
  .optional()
  .describe(
    "Page UUID from createPage or listContexts. Omit for the default page.",
  );

export const PageViewFormatSchema = z
  .enum(["simplified", "accessibility", "markdown"])
  .describe(
    "simplified: structural HTML; accessibility: Playwright ARIA snapshot (YAML); markdown: readable page content as Markdown.",
  );

export const ViewAfterSchema = z
  .object({
    format: PageViewFormatSchema.describe(
      "Page view to append after the action",
    ),
  })
  .optional()
  .describe("Append a page view after the action");
