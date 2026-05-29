import { chromium, type Browser, type Page } from "playwright";
import { ContextInstance } from "./context-instance";
import { PageInstance } from "./page-instance";

export type ContextInfo = {
  contextId: string;
  pageIds: string[];
};

export type BrowserInstanceOptions = {
  browserWSEndpoint?: string;
};

export class BrowserInstance {
  private readonly browserWSEndpoint?: string;
  private browserPromise: Promise<Browser> | undefined;
  private readonly pages = new Map<string, PageInstance>();
  private readonly contexts = new Map<string, ContextInstance>();
  private defaultContextId: string | undefined;
  private defaultPageId: string | undefined;

  constructor(options?: BrowserInstanceOptions) {
    this.browserWSEndpoint = options?.browserWSEndpoint;
  }

  async createContext(): Promise<string> {
    const playwrightBrowser = await this.getBrowser();
    const context = await playwrightBrowser.newContext();
    const contextId = crypto.randomUUID();
    this.contexts.set(
      contextId,
      new ContextInstance({ contextId, context }),
    );
    if (!this.defaultContextId) {
      this.defaultContextId = contextId;
    }
    return contextId;
  }

  async createPage(contextId?: string): Promise<string> {
    const resolvedContextId = await this.resolveContextId(contextId);
    const ctx = this.contexts.get(resolvedContextId);
    if (!ctx) {
      throw new Error(`Unknown contextId: ${resolvedContextId}`);
    }
    const page = await ctx.context.newPage();
    const pageId = crypto.randomUUID();
    const instance = new PageInstance({
      pageId,
      contextId: resolvedContextId,
      context: ctx.context,
      page,
    });
    this.pages.set(pageId, instance);
    ctx.pageIds.add(pageId);
    if (!this.defaultPageId) {
      this.defaultPageId = pageId;
    }
    return pageId;
  }

  listContexts(): ContextInfo[] {
    return [...this.contexts.values()].map((ctx) => ({
      contextId: ctx.contextId,
      pageIds: [...ctx.pageIds],
    }));
  }

  async closePage(pageId: string): Promise<void> {
    const instance = this.pages.get(pageId);
    if (!instance) {
      throw new Error(`Unknown pageId: ${pageId}`);
    }
    await instance.close();
    this.pages.delete(pageId);
    const ctx = this.contexts.get(instance.contextId);
    ctx?.pageIds.delete(pageId);
    if (this.defaultPageId === pageId) {
      this.defaultPageId = this.pages.keys().next().value;
    }
  }

  async closeContext(contextId: string): Promise<void> {
    const ctx = this.contexts.get(contextId);
    if (!ctx) {
      throw new Error(`Unknown contextId: ${contextId}`);
    }
    for (const pageId of [...ctx.pageIds]) {
      await this.closePage(pageId);
    }
    await ctx.close();
    this.contexts.delete(contextId);
    if (this.defaultContextId === contextId) {
      this.defaultContextId = this.contexts.keys().next().value;
    }
  }

  async close(): Promise<void> {
    for (const pageId of [...this.pages.keys()]) {
      const instance = this.pages.get(pageId);
      if (instance) {
        await instance.close();
      }
    }
    this.pages.clear();
    for (const ctx of this.contexts.values()) {
      await ctx.close();
    }
    this.contexts.clear();
    this.defaultContextId = undefined;
    this.defaultPageId = undefined;
    if (!this.browserPromise) {
      return;
    }
    const browser = await this.browserPromise;
    this.browserPromise = undefined;
    await browser.close();
  }

  async withPage<T>(
    pageId: string | undefined,
    fn: (page: Page, instance: PageInstance) => Promise<T>,
  ): Promise<T> {
    const resolvedPageId = await this.ensureDefaultPage(pageId);
    const instance = this.pages.get(resolvedPageId);
    if (!instance) {
      throw new Error(`Unknown pageId: ${resolvedPageId}`);
    }
    return fn(instance.page, instance);
  }

  private getBrowser(): Promise<Browser> {
    if (!this.browserPromise) {
      this.browserPromise = this.connectOrLaunch();
    }
    return this.browserPromise;
  }

  private async ensureDefaultPage(pageId?: string): Promise<string> {
    if (pageId) {
      return pageId;
    }
    if (this.defaultPageId) {
      return this.defaultPageId;
    }
    await this.createContext();
    return this.createPage(this.defaultContextId);
  }

  private async resolveContextId(contextId?: string): Promise<string> {
    if (contextId) {
      if (!this.contexts.has(contextId)) {
        throw new Error(`Unknown contextId: ${contextId}`);
      }
      return contextId;
    }
    if (this.defaultContextId) {
      return this.defaultContextId;
    }
    return this.createContext();
  }

  private async connectOrLaunch(): Promise<Browser> {
    if (this.browserWSEndpoint) {
      return chromium.connect(this.browserWSEndpoint);
    }
    return chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
}
