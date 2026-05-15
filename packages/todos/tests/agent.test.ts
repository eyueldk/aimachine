import "dotenv/config";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, stepCountIs } from "ai";
import { describe, expect, test } from "vitest";
import { createTodosToolkit, type TodoState } from "../src/index";

const hasOpenRouterKey =
  typeof process.env.OPENROUTER_API_KEY === "string" &&
  process.env.OPENROUTER_API_KEY.trim().length > 0;

const OPENROUTER_MODEL = "google/gemini-2.5-flash-lite";

describe.skipIf(!hasOpenRouterKey)("Agent with todo tools", () => {
  test(
    "uses writeTodos to record a short task list",
    async () => {
      const state: TodoState = { todos: [] };
      const { tools, hint } = createTodosToolkit({ state });

      const openrouter = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY!,
        appName: "@aimachine/todos",
      });

      const result = await generateText({
        model: openrouter.chat(OPENROUTER_MODEL),
        tools,
        stopWhen: stepCountIs(15),
        system: `You are a helpful assistant.\n\n${hint}`,
        prompt: `Use the writeTodos tool exactly once to set a todo list with at least 3 items for planning, doing, and checking a one-sentence summary of "hello world".
Mark the first task inProgress and the others pending. Then briefly confirm in your final message that the list was saved.`,
      });

      expect(result.text?.length ?? 0).toBeGreaterThan(0);
      expect(state.todos.length).toBeGreaterThanOrEqual(2);

      for (const t of state.todos) {
        expect(["pending", "inProgress", "completed"]).toContain(t.status);
        expect(t.content.length).toBeGreaterThan(0);
      }
    },
    120_000,
  );
});
