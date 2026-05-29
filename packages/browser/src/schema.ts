import { z } from "zod";

export const PageIdSchema = z
  .string()
  .optional()
  .describe(
    "Page UUID from createPage or listContexts. Omit for the default page.",
  );

export const PageViewModeSchema = z
  .enum(["simplified", "accessibility"])
  .describe(
    "simplified: structural HTML; accessibility: Playwright ARIA snapshot (YAML).",
  );

export const ViewAfterSchema = z
  .object({
    mode: PageViewModeSchema.describe("Page view to append after the action"),
  })
  .optional()
  .describe("Append a page view after the action");
