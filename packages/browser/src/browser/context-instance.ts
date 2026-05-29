import type { BrowserContext } from "playwright";

export class ContextInstance {
  readonly contextId: string;
  readonly context: BrowserContext;
  readonly pageIds = new Set<string>();

  constructor(options: { contextId: string; context: BrowserContext }) {
    this.contextId = options.contextId;
    this.context = options.context;
  }

  async close(): Promise<void> {
    await this.context.close();
  }
}
