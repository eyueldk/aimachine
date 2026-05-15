import type { Todo } from "./tools/write-todos-tool";

/**
 * Mutable todo list for one agent run. Each `writeTodos` call replaces the full list in this `TodoState`.
 */
export class TodoState {
  private _todos: Todo[] = [];

  get todos(): readonly Todo[] {
    return this._todos;
  }

  replace(todos: Todo[]): void {
    this._todos = todos.map((t) => ({ ...t }));
  }

  clear(): void {
    this._todos = [];
  }
}
