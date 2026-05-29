# @eyueldk/aisdk-toolkit-todos

[![npm](https://img.shields.io/npm/v/@eyueldk/aisdk-toolkit-todos)](https://www.npmjs.com/package/@eyueldk/aisdk-toolkit-todos)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/eyueldk/aimachine/blob/main/LICENSE)

**Version:** `1.2.0` (also in `package.json` `"version"`).

**`writeTodos`** and **`readTodos`** for the [Vercel AI SDK](https://ai-sdk.dev) (`generateText`, `streamText`, `ToolLoopAgent`, …). **`createTodosToolkit({ state })`** returns **`{ tools, hint, state }`** — merge **`tools`**, append **`hint`** (`TODOS_HINT`) to your system prompt, and read **`state.todos`**. **`state`** is a plain **`TodoState`** object (`{ todos: Todo[] }`); `writeTodos` replaces **`state.todos`**. **`readTodos`** returns a Markdown bullet list (read-only). Status values: **`pending`**, **`in_progress`**, **`completed`**.

**Repository:** [github.com/eyueldk/aimachine](https://github.com/eyueldk/aimachine) (`packages/todos`)

## Requirements

| | |
| --- | --- |
| **Node** | 20+ (`engines.node`) |
| **Runtime deps** | `ai` ^6, `zod` ^4 |

## Install

```bash
pnpm add @eyueldk/aisdk-toolkit-todos
```

## Usage

1. Hold todo data in a **`TodoState`** object: **`{ todos: [] }`** (or hydrate from JSON).
2. **`createTodosToolkit({ state })`** → `{ tools, hint, state }`. Pass **`tools`** and **`hint`** into the AI SDK. **`state`** is the same object you passed in—read **`state.todos`** after the run.

```ts
import { generateText, stepCountIs } from "ai";
import { createTodosToolkit, type TodoState } from "@eyueldk/aisdk-toolkit-todos";

const state: TodoState = { todos: [] };
const { tools, hint } = createTodosToolkit({ state });

await generateText({
  model: yourLanguageModel,
  tools,
  stopWhen: stepCountIs(20),
  system: `You are a helpful assistant.\n\n${hint}`,
  prompt: "Plan and execute: summarize why tests matter in 3 steps, using writeTodos.",
});

console.log(state.todos);
```

**`createTodoTools`** remains available for advanced cases (tools only, no bundled hint). **`createWriteTodosTool`** / **`createReadTodosTool`** take **`{ state }`** with the same bundled descriptions as the toolkit.

## Behavior notes

- **Parallel calls:** The bundled **`hint`** tells the model to call **`writeTodos` at most once per turn** (each call replaces the full list). **`readTodos`** is read-only and safe to call anytime. Nothing here enforces write concurrency server-side—add orchestration if you need it.

## Migration

### 1.2.0

- **`viewTodos`** was renamed to **`readTodos`** (tool key and exports **`createReadTodosTool`**, **`READ_TODOS_DESCRIPTION`**). Update prompts, tool routing, and any code that referenced **`tools.viewTodos`** or **`createViewTodosTool`**.

## Scripts

`pnpm build` · `pnpm check` (`tsc --noEmit`) · `pnpm test`. **`prepublishOnly`** runs `pnpm check && pnpm build` before publish.

## Publishing

CI publishes when **`packages/todos/**`** changes on **`main`** ([`publish.todos.yml`](https://github.com/eyueldk/aimachine/blob/main/.github/workflows/publish.todos.yml)) or via **workflow_dispatch**. Configure [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) for that workflow.

## License

MIT — see [repository LICENSE](https://github.com/eyueldk/aimachine/blob/main/LICENSE).
