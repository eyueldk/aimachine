import type { ShellAdapter } from "../adapter";
import { createRunCommandTool } from "./run-command-tool";

export type CreateShellToolsOptions = {
  adapter: ShellAdapter;
};

/**
 * Builds shell AI SDK tools (`runCommand`) for the Vercel AI SDK.
 */
export function createShellTools(options: CreateShellToolsOptions) {
  return {
    runCommand: createRunCommandTool(options),
  } as const;
}
