import type { BrowserInstance } from "../browser/browser-instance";
import { createClickTool } from "./click-tool";
import { createCloseContextTool } from "./close-context-tool";
import { createClosePageTool } from "./close-page-tool";
import { createCreateContextTool } from "./create-context-tool";
import { createCreatePageTool } from "./create-page-tool";
import { createEvaluateTool } from "./evaluate-tool";
import { createGetCookiesTool } from "./get-cookies-tool";
import { createGetScreenshotTool } from "./get-screenshot-tool";
import { createGotoTool } from "./goto-tool";
import { createInspectConsoleTool } from "./inspect-console-tool";
import { createInspectHTMLTool } from "./inspect-html-tool";
import { createInspectNetworkTool } from "./inspect-network-tool";
import { createListContextsTool } from "./list-contexts-tool";
import { createTypeTool } from "./type-tool";
import { createViewPageTool } from "./view-page-tool";

export function createBrowserTools({ browser }: { browser: BrowserInstance }) {
  const tools = {
    goto: createGotoTool({ browser }),
    click: createClickTool({ browser }),
    type: createTypeTool({ browser }),
    evaluate: createEvaluateTool({ browser }),
    inspectConsole: createInspectConsoleTool({ browser }),
    getCookies: createGetCookiesTool({ browser }),
    viewPage: createViewPageTool({ browser }),
    inspectHTML: createInspectHTMLTool({ browser }),
    getScreenshot: createGetScreenshotTool({ browser }),
    inspectNetwork: createInspectNetworkTool({ browser }),
    createContext: createCreateContextTool({ browser }),
    createPage: createCreatePageTool({ browser }),
    listContexts: createListContextsTool({ browser }),
    closePage: createClosePageTool({ browser }),
    closeContext: createCloseContextTool({ browser }),
  };
  return { ...tools } as const;
}
