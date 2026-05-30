import type { PerformHttpFetchOptions } from "../fetch";
import { createFetchRequestTool } from "./fetch-request-tool";

export type CreateFetchToolsOptions = PerformHttpFetchOptions;

/**
 * Builds fetch AI SDK tools (`fetchRequest`) for the Vercel AI SDK.
 */
export function createFetchTools(options: CreateFetchToolsOptions) {
  return {
    fetchRequest: createFetchRequestTool(options),
  } as const;
}
