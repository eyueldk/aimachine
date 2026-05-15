import type { Session } from "../session";
import { createGotoTool } from "./goto-tool";
import { createClickTool } from "./click-tool";
import { createEvaluateTool } from "./evaluate-tool";
import { createGetCookiesTool } from "./get-cookies-tool";
import { createInspectHTMLTool } from "./inspect-html-tool";
import { createGetScreenshotTool } from "./get-screenshot-tool";
import { createInspectConsoleTool } from "./inspect-console-tool";
import { createInspectNetworkTool } from "./inspect-network-tool";
import { createTypeTool } from "./type-tool";
import { createViewPageTool } from "./view-page-tool";

/**
 * Builds browser {@link https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling tools}
 * for the Vercel AI SDK (`generateText`, `streamText`, `ToolLoopAgent`, etc.) from a {@link Session}.
 * Inspectors are already active on the session from construction.
 */
export function createBrowserTools({ session }: { session: Session }) {
  const tools = {
    goto: createGotoTool({ session }),
    click: createClickTool({ session }),
    type: createTypeTool({ session }),
    evaluate: createEvaluateTool({ session }),
    inspectConsole: createInspectConsoleTool({ session }),
    getCookies: createGetCookiesTool({ session }),
    viewPage: createViewPageTool({ session }),
    inspectHTML: createInspectHTMLTool({ session }),
    getScreenshot: createGetScreenshotTool({ session }),
    inspectNetwork: createInspectNetworkTool({ session }),
  };
  return { ...tools } as const;
}
