import { z } from "zod";

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

export const ContextIdSchema = z
  .string()
  .describe("Context UUID from newContext or listContexts.");

export const PageIdSchema = z
  .string()
  .describe("Page UUID from newPage or listContexts.");

/** Optional shortcuts on action tools — selects target before the action runs. */
export const ActiveTargetSchema = z.object({
  contextId: ContextIdSchema.optional().describe(
    "Shortcut: switch to this context before the action (from newContext or listContexts).",
  ),
  pageId: PageIdSchema.optional().describe(
    "Shortcut: switch to this page before the action (from newPage or listContexts).",
  ),
});

export type ActiveTarget = z.infer<typeof ActiveTargetSchema>;
