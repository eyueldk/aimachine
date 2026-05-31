import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";
import { ActiveTargetSchema } from "../schema";
import { truncateString } from "../utils";

const MAX_CONSOLE_TEXT = 2_000;

export function createInspectConsoleTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description:
      "Retrieve recent console logs for the active page (ring buffer; long lines truncated in output).",
    inputSchema: z
      .object({
        limit: z
          .number()
          .optional()
          .describe(
            "Maximum number of recent logs to return. Omit to return all buffered logs.",
          ),
      })
      .extend(ActiveTargetSchema.shape),
    execute: async ({ limit, contextId, pageId }) => {
      return browser.withPage(async (_page, entry) => {
        const messages = entry.consoleInspector.getRecent(limit);
        const formattedLogs = messages
          .map(
            (msg) =>
              `[${msg.type.toUpperCase()}] ${truncateString(msg.text, MAX_CONSOLE_TEXT)}`,
          )
          .join("\n");
        const output = [`Console logs (${messages.length} messages):`];
        output.push(formattedLogs || "(no logs)");
        return output.join("\n");
      }, { contextId, pageId });
    },
  });
}
