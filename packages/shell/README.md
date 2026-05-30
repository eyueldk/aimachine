# @eyueldk/aisdk-toolkit-shell

[![npm](https://img.shields.io/npm/v/@eyueldk/aisdk-toolkit-shell)](https://www.npmjs.com/package/@eyueldk/aisdk-toolkit-shell)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/eyueldk/aisdk-toolkit/blob/main/LICENSE)

**Version:** `1.1.0` (also in `package.json` `"version"`).

**Shell command tools** for the [Vercel AI SDK](https://ai-sdk.dev) (`generateText`, `streamText`, `ToolLoopAgent`, …): **`createShellToolkit({ adapter })`** returns **`{ tools, hint, state }`**. Pass **`tools`** and **`hint`** (`SHELL_HINT`) into the AI SDK. **`state`** holds the same **`adapter`** you passed in.

Bundled backends: **`LocalShell`** (host shell), **`DockerShell`** ([dockerode](https://github.com/apocas/dockerode), commands in a running container), **`SshShell`** ([ssh2](https://github.com/mscdex/ssh2), remote host over SSH). Subclass **`ShellAdapter`** for custom runtimes.

**Repository:** [github.com/eyueldk/aisdk-toolkit](https://github.com/eyueldk/aisdk-toolkit) (`packages/shell`)

## Requirements

| | |
| --- | --- |
| **Node** | 20+ (`engines.node`) |
| **Runtime deps** | `ai` ^6, `zod` ^4, `dockerode` ^4, `shell-quote` ^1, `ssh2` ^1 |

**Local adapter:** uses the system shell (`shell: true`). Supports **`stdin`** on **`exec`**.

**Docker adapter:** a running container and local Docker engine. Commands run as `sh -c` inside the container. **`stdin`** is not supported.

**SSH adapter:** network access to the host; authenticate with password and/or private key. Supports **`stdin`**. Call **`await adapter.dispose()`** when finished to close the connection.

## Install

```bash
pnpm add @eyueldk/aisdk-toolkit-shell
```

## Usage

1. Create an adapter (e.g. **`await LocalShell.create()`**).
2. **`createShellToolkit({ adapter })`** → `{ tools, hint, state }`.
3. Pass **`tools`** and **`hint`** into the AI SDK.

```ts
import { generateText, stepCountIs } from "ai";
import {
  createShellToolkit,
  LocalShell,
} from "@eyueldk/aisdk-toolkit-shell";

const adapter = await LocalShell.create({ cwd: "/path/to/project" });
const { tools, hint } = createShellToolkit({ adapter });

await generateText({
  model: yourLanguageModel,
  tools,
  stopWhen: stepCountIs(15),
  system: `You can run shell commands.\n\n${hint}`,
  prompt: "Run `node -v` and report the version.",
});
```

### Adapters

| Adapter | Factory | Notes |
| --- | --- | --- |
| **LocalShell** | `await LocalShell.create({ cwd?, env? })` | Host `shell: true` execution |
| **DockerShell** | `await DockerShell.create({ container, cwd?, docker?, env? })` | `sh -c` in a running container |
| **SshShell** | `await SshShell.create({ host, username, password?, privateKey?, cwd?, env? })` | Persistent SSH session; **`dispose()`** when finished |

```ts
import {
  DockerShell,
  LocalShell,
  SshShell,
} from "@eyueldk/aisdk-toolkit-shell";

const local = await LocalShell.create();
const docker = await DockerShell.create({ container: "my-container", cwd: "/app" });
const remote = await SshShell.create({
  host: "10.0.0.5",
  username: "deploy",
  privateKey: process.env.SSH_PRIVATE_KEY,
  cwd: "/var/www",
});
try {
  const { tools, hint } = createShellToolkit({ adapter: remote });
  // …
} finally {
  await remote.dispose();
}
```

### Tools

**`runCommand`** — run a shell command string; optional per-call **`cwd`** and **`timeoutMs`**. Returns exit code, stdout, and stderr (large output is truncated in the tool response). For programmatic use, **`adapter.exec`** also accepts **`stdin`** (`string` or **`Readable`**) and **`stdout`** / **`stderr`** **`Writable`** streams (see Configuration).

**`createShellTools`** is the same **`{ adapter }`** object without **`hint`** / **`state`**. **`createRunCommandTool`** is exported for custom tool sets.

## Configuration

| Option | Where | Default |
| --- | --- | --- |
| **`timeoutMs`** | `adapter.exec` / `runCommand` | `120_000` (`DEFAULT_SHELL_TIMEOUT_MS`) |
| **`cwd`** | adapter factory or per `exec` | adapter-specific |
| **`env`** | adapter factory or per `exec` | merged into the command environment |
| **`stdin`** | `adapter.exec` | string (local/SSH); optional **`Readable`** stream |
| **`stdout`** / **`stderr`** | `adapter.exec` | optional **`Writable`** streams; result strings empty when streaming |

## Scripts

`pnpm build` · `pnpm check` (`tsc --noEmit`) · `pnpm test`. When Docker is available, **`DockerShell`** tests use **Testcontainers** (`alpine`) and **`SshShell`** tests use **`testcontainers/sshd`**; otherwise those suites are skipped. **`prepublishOnly`** runs `pnpm check && pnpm build` before publish.

## Publishing

CI publishes this package when **`packages/shell/**`** changes on **`main`** (see [`.github/workflows/publish.shell.yml`](https://github.com/eyueldk/aisdk-toolkit/blob/main/.github/workflows/publish.shell.yml)) or via **workflow_dispatch**. Configure [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) for that workflow on the **`@eyueldk/aisdk-toolkit-shell`** package.

## License

MIT — see [repository LICENSE](https://github.com/eyueldk/aisdk-toolkit/blob/main/LICENSE).
