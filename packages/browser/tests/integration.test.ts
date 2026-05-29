import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { ToolLoopAgent, stepCountIs } from "ai";
import { describe, expect, test } from "vitest";
import { createBrowserToolkit } from "../src/index";

const openRouterModel = process.env.OPENROUTER_MODEL?.trim() ?? "";
const openRouterReady = Boolean(
  process.env.OPENROUTER_API_KEY?.trim() && openRouterModel,
);

describe.skipIf(!openRouterReady)(
  "browser toolkit + ToolLoopAgent (OpenRouter)",
  () => {
    test("agent navigates to example.com via goto", async () => {
      const kit = createBrowserToolkit();
      try {
        const { tools, hint } = kit;
        const agent = new ToolLoopAgent({
          model: createOpenRouter()(openRouterModel),
          instructions: `You control a browser. Use only goto.\n\n${hint}`,
          tools,
          activeTools: ["goto"],
          stopWhen: stepCountIs(6),
        });

        await agent.generate({
          prompt: 'Call goto with url "https://example.com/".',
        });

        const url = await kit.browser.withPage(undefined, async (page) =>
          page.url(),
        );
        expect(url).toBe("https://example.com/");
      } finally {
        await kit.browser.close();
      }
    });
  },
);
