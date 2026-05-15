import "dotenv/config";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, stepCountIs } from "ai";
import puppeteer, { type Browser } from "puppeteer";
import { afterAll, describe, expect, test } from "vitest";
import { createBrowserToolkit, Session } from "../src/index";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = "google/gemini-2.5-flash-lite";

describe.skipIf(
  !process.env.OPENROUTER_API_KEY
)("Agent with browser tools", () => {
  let browser: Browser | undefined;
  let session: Session | undefined;

  afterAll(async () => {
    await session?.close();
    await browser?.close();
  });

  test(
    "uses browser tools to open example.com",
    async () => {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();
      const { tools, hint, session: toolkitSession } =
        createBrowserToolkit({ page });
      session = toolkitSession;

      const openrouter = createOpenRouter({
        apiKey: OPENROUTER_API_KEY!,
        appName: "@aimachine/browser",
      });

      const result = await generateText({
        model: openrouter.chat(OPENROUTER_MODEL),
        tools,
        stopWhen: stepCountIs(15),
        system: `You are a browser automation assistant.\n\n${hint}`,
        prompt: `Use the goto tool to open https://example.com in the browser.
Then briefly describe what you see on the page in your final answer.`,
      });

      expect(result.text?.length ?? 0).toBeGreaterThan(0);
      expect(page.url()).toMatch(/example\.com/i);

      const heading = await page.$eval("h1", (el) => el.textContent?.trim() ?? "");
      expect(heading).toBe("Example Domain");
    },
    120_000,
  );
});
