import { spawn, type ChildProcess } from "node:child_process";
import {
  DEFAULT_SHELL_TIMEOUT_MS,
  ShellAdapter,
  type ShellExecOptions,
  type ShellExecResult,
} from "../adapter";
import { mergeEnvLayers, toBuffer, withTimeout } from "../utils";

export type LocalShellCreateOptions = {
  /** Default working directory for commands without `cwd`. */
  cwd?: string;
  /** Default environment variables merged into each command. */
  env?: Record<string, string>;
};

/**
 * Runs commands on the local machine via the system shell (`shell: true`).
 */
export class LocalShell extends ShellAdapter {
  private constructor(
    private readonly defaultCwd?: string,
    private readonly defaultEnv?: Record<string, string>,
  ) {
    super();
  }

  static async create(
    options: LocalShellCreateOptions = {},
  ): Promise<LocalShell> {
    return new LocalShell(options.cwd, options.env);
  }

  exec(command: string, options?: ShellExecOptions): Promise<ShellExecResult> {
    const timeoutMs = options?.timeoutMs ?? DEFAULT_SHELL_TIMEOUT_MS;
    const cwd = options?.cwd ?? this.defaultCwd;
    const env = {
      ...process.env,
      ...mergeEnvLayers(this.defaultEnv, options?.env),
    };

    let child: ChildProcess | undefined;
    const run = new Promise<ShellExecResult>((resolve, reject) => {
      child = spawn(command, {
        shell: true,
        cwd,
        env,
        stdio: ["pipe", "pipe", "pipe"],
      });

      const stdoutChunks: Buffer[] = [];
      const stderrChunks: Buffer[] = [];
      let settled = false;

      child.stdout?.on("data", (chunk: Buffer | string) => {
        stdoutChunks.push(toBuffer(chunk));
      });
      child.stderr?.on("data", (chunk: Buffer | string) => {
        stderrChunks.push(toBuffer(chunk));
      });

      child.on("error", (err) => {
        if (settled) {
          return;
        }
        settled = true;
        reject(err);
      });

      child.on("close", (code, signal) => {
        if (settled) {
          return;
        }
        settled = true;
        resolve({
          stdout: Buffer.concat(stdoutChunks).toString("utf8"),
          stderr: Buffer.concat(stderrChunks).toString("utf8"),
          exitCode: code ?? 1,
          signal,
        });
      });

      if (options?.stdin !== undefined) {
        child.stdin?.write(options.stdin);
      }
      child.stdin?.end();
    });

    return withTimeout(run, timeoutMs, () => {
      child?.kill("SIGTERM");
    });
  }
}
