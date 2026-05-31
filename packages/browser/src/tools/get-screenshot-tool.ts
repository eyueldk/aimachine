import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";
import { ActiveTargetSchema } from "../schema";

export function createGetScreenshotTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description: "Take a JPEG screenshot of the active browser page",
    inputSchema: ActiveTargetSchema,
    execute: async ({ contextId, pageId }) => {
      const screenshot = await browser.withPage(
        async (page) => page.screenshot({ type: "jpeg", quality: 50 }),
        { contextId, pageId },
      );
      return screenshot.toString("base64");
    },
    toModelOutput: async ({ output }) => ({
      type: "content",
      value: [
        { type: "text", text: "Screenshot captured (JPEG)." },
        {
          type: "image-data",
          data: output,
          mediaType: "image/jpeg",
        },
      ],
    }),
  });
}
