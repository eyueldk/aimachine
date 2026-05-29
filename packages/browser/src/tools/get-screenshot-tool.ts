import { tool } from "ai";
import { z } from "zod";
import type { BrowserInstance } from "../browser/browser-instance";
import { PageIdSchema } from "../schema";

export function createGetScreenshotTool({ browser }: { browser: BrowserInstance }) {
  return tool({
    description: "Take a JPEG screenshot of the selected browser page",
    inputSchema: z.object({
      pageId: PageIdSchema,
    }),
    execute: async ({ pageId }) => {
      const screenshot = await browser.withPage(pageId, async (page) =>
        page.screenshot({ type: "jpeg", quality: 50 }),
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
