import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";

export function createNewContextTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description:
      "Create a new isolated browser context (incognito-like) and make it active.",
    inputSchema: z.object({}),
    execute: async () => {
      const contextId = await browser.newContext();
      return JSON.stringify({ contextId, active: true });
    },
  });
}
