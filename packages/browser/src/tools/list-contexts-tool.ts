import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";

export function createListContextsTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description:
      "List browser contexts and page UUIDs, including which context and page are active.",
    inputSchema: z.object({}),
    execute: async () => {
      const contexts = browser.listContexts();
      const activeContextId = browser.getActiveContextId();
      const activePageId = browser.getActivePageId();
      if (contexts.length === 0) {
        return "No contexts yet.";
      }
      const header = [
        `Active context: ${activeContextId ?? "(none)"}`,
        `Active page: ${activePageId ?? "(none)"}`,
        "",
      ];
      const lines = contexts.map((ctx) => {
        const contextLabel =
          ctx.contextId === activeContextId
            ? `${ctx.contextId} (active context)`
            : ctx.contextId;
        const pages =
          ctx.pageIds.length === 0
            ? "(none)"
            : ctx.pageIds
                .map((id) =>
                  id === activePageId ? `${id} (active page)` : id,
                )
                .join(", ");
        return `- contextId: ${contextLabel}\n  pageIds: ${pages}`;
      });
      return [...header, ...lines].join("\n");
    },
  });
}
