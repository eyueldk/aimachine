import type { BrowserContext, Page } from "playwright";
import { ConsoleInspector } from "./console-inspector";
import { NetworkInspector } from "./network-inspector";

export class PageInstance {
  readonly pageId: string;
  readonly contextId: string;
  readonly context: BrowserContext;
  readonly page: Page;
  readonly consoleInspector: ConsoleInspector;
  readonly networkInspector: NetworkInspector;

  constructor(options: {
    pageId: string;
    contextId: string;
    context: BrowserContext;
    page: Page;
  }) {
    this.pageId = options.pageId;
    this.contextId = options.contextId;
    this.context = options.context;
    this.page = options.page;
    this.consoleInspector = new ConsoleInspector(this.page);
    this.networkInspector = new NetworkInspector(this.page);
  }

  async close(): Promise<void> {
    if (!this.page.isClosed()) {
      await this.page.close();
    }
  }
}
