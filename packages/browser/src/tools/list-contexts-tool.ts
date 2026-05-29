import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";

export function createListContextsTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description: "List browser contexts and their page UUIDs.",
    inputSchema: z.object({}),
    execute: async () => {
      const contexts = browser.listContexts();
      if (contexts.length === 0) {
        return "No contexts yet.";
      }
      const lines = contexts.map(
        (ctx) =>
          `- contextId: ${ctx.contextId}\n  pageIds: ${ctx.pageIds.join(", ") || "(none)"}`,
      );
      return lines.join("\n");
    },
  });
}
