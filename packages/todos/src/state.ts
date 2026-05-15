import type { Todo } from "./tools/write-todos-tool";

/**
 * Serializable todo list for one agent run. Mutate **`todos`** (e.g. `writeTodos` replaces
 * the array contents). Safe to `JSON.stringify` / persist when your `Todo` payloads are plain data.
 */
export type TodoState = {
  todos: Todo[];
};
