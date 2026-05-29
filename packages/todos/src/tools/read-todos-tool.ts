import { tool } from "ai";
import { z } from "zod";
import type { TodoState } from "../state";

/** Bundled AI SDK tool description for `readTodos` (read-only Markdown snapshot). */
export const READ_TODOS_DESCRIPTION =
  "Return the current todo list as Markdown for reading. Does not modify the list. Use when you or the user need a formatted snapshot of tasks and statuses (e.g. after updates or before planning the next step).";

interface CreateReadTodosToolOptions {
  state: TodoState;
}

/**
 * AI SDK tool `readTodos`: returns a Markdown snapshot of the list; read-only.
 */
export function createReadTodosTool(options: CreateReadTodosToolOptions) {
  return tool({
    description: READ_TODOS_DESCRIPTION,
    inputSchema: z.object({}),
    execute: async () => {
      const todos = options.state.todos;
      if (todos.length === 0) {
        return `## Todos

_No tasks yet. Use \`writeTodos\` to add items._`;
      }

      const oneLine = (text: string) => text.replace(/\r?\n/g, " ").trim();

      const lines = todos.map(
        (todo) => `- **${todo.status}:** ${oneLine(todo.content)}`,
      );

      return `## Todos (${todos.length})

${lines.join("\n")}`;
    },
  });
}
