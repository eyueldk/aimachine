import { tool } from "ai";
import { z } from "zod";
import type { NetworkItem } from "../browser/network-inspector";
import type { BrowserInstance } from "../browser/browser-instance";
import { truncateHeaders, truncateString } from "../utils";
import { PageIdSchema } from "../schema";

const MAX_NETWORK_POST_DATA = 4_096;
const MAX_NETWORK_HEADER_VALUE = 512;

const ResourceTypeSchema = z.enum([
  "document",
  "stylesheet",
  "image",
  "media",
  "font",
  "script",
  "texttrack",
  "xhr",
  "fetch",
  "prefetch",
  "eventsource",
  "websocket",
  "manifest",
  "other",
]);

export function createInspectNetworkTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description:
      "Inspect recent network activity for the selected page (ring buffer; large fields truncated in output). Optionally filter by Playwright resource types.",
    inputSchema: z.object({
      pageId: PageIdSchema,
      limit: z
        .number()
        .optional()
        .describe(
          "Maximum number of recent network events. Omit for all buffered events.",
        ),
      resourceTypes: z
        .array(ResourceTypeSchema)
        .optional()
        .describe(
          "Lower-case Playwright resource types. If omitted, returns all types.",
        ),
    }),
    execute: async ({ pageId, limit, resourceTypes }) => {
      return browser.withPage(pageId, async (_page, entry) => {
        const allowed =
          resourceTypes == null ? null : new Set<string>(resourceTypes);
        const entries = entry.networkInspector
          .getRecent(limit)
          .filter((e) => allowed === null || allowed.has(e.resourceType));
        return JSON.stringify(
          entries.map(truncateNetworkItemForOutput),
          null,
          2,
        );
      });
    },
  });
}

function truncateNetworkItemForOutput(item: NetworkItem): NetworkItem {
  if (item.type === "request") {
    return {
      ...item,
      postData:
        item.postData === undefined
          ? undefined
          : truncateString(item.postData, MAX_NETWORK_POST_DATA),
      headers: truncateHeaders(item.headers, MAX_NETWORK_HEADER_VALUE),
    };
  }
  return {
    ...item,
    headers: truncateHeaders(item.headers, MAX_NETWORK_HEADER_VALUE),
  };
}
