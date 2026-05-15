import type { TodoState } from "./state";
import { TODOS_HINT } from "./hint";
import { createTodoTools, type CreateTodoToolsOptions } from "./tools";

export type Toolkit<TTools extends Record<string, unknown>, TState> = {
  tools: TTools;
  hint: string;
  state: TState;
};

export type TodoTools = ReturnType<typeof createTodoTools>;

export type TodosToolkit = Toolkit<TodoTools, TodoState>;

export type CreateTodosToolkitOptions = CreateTodoToolsOptions;

/**
 * Primary entry point: AI SDK `tools`, a `hint` string for your system prompt, and the
 * mutable `TodoState` as `state`. Pass `tools` / `hint` into `generateText` (etc.); read
 * `state.todos` after the run.
 */
export function createTodosToolkit(
  options: CreateTodosToolkitOptions,
): TodosToolkit {
  const tools = createTodoTools(options);
  return {
    tools,
    hint: TODOS_HINT,
    state: options.state,
  };
}
