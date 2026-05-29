import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";

export function createCreateContextTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description: "Create a new isolated browser context (incognito-like).",
    inputSchema: z.object({}),
    execute: async () => {
      const contextId = await browser.createContext();
      return JSON.stringify({ contextId });
    },
  });
}
