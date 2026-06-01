import { chromium, type Browser, type Page } from "playwright";
import type { ActiveTarget } from "../schema";
import { ContextInstance } from "./context-instance";
import { PageInstance } from "./page-instance";

export type ContextInfo = {
  contextId: string;
  pageIds: string[];
};

export type BrowserInstanceOptions = {
  browserWsEndpoint?: string;
};

export class BrowserInstance {
  private readonly browserWsEndpoint?: string;
  private browserPromise: Promise<Browser> | undefined;
  private readonly pages = new Map<string, PageInstance>();
  private readonly contexts = new Map<string, ContextInstance>();
  private activeContextId: string | undefined;
  private activePageId: string | undefined;

  constructor(options?: BrowserInstanceOptions) {
    this.browserWsEndpoint = options?.browserWsEndpoint;
  }

  getActiveContextId(): string | undefined {
    return this.activeContextId;
  }

  getActivePageId(): string | undefined {
    return this.activePageId;
  }

  async newContext(): Promise<string> {
    const playwrightBrowser = await this.getBrowser();
    const context = await playwrightBrowser.newContext();
    const contextId = crypto.randomUUID();
    this.contexts.set(
      contextId,
      new ContextInstance({ contextId, context }),
    );
    this.activeContextId = contextId;
    this.activePageId = undefined;
    return contextId;
  }

  async newPage(): Promise<string> {
    const contextId = await this.ensureActiveContext();
    const ctx = this.contexts.get(contextId);
    if (!ctx) {
      throw new Error(`Unknown contextId: ${contextId}`);
    }
    const page = await ctx.context.newPage();
    const pageId = crypto.randomUUID();
    const instance = new PageInstance({
      pageId,
      contextId,
      context: ctx.context,
      page,
    });
    this.pages.set(pageId, instance);
    ctx.pageIds.add(pageId);
    this.activePageId = pageId;
    return pageId;
  }

  selectContext(contextId: string): void {
    if (!this.contexts.has(contextId)) {
      throw new Error(`Unknown contextId: ${contextId}`);
    }
    this.activeContextId = contextId;
    const activePage = this.activePageId
      ? this.pages.get(this.activePageId)
      : undefined;
    if (!activePage || activePage.contextId !== contextId) {
      const ctx = this.contexts.get(contextId);
      this.activePageId = ctx?.pageIds.values().next().value;
    }
  }

  selectPage(pageId: string): void {
    const instance = this.pages.get(pageId);
    if (!instance) {
      throw new Error(`Unknown pageId: ${pageId}`);
    }
    this.activePageId = pageId;
    this.activeContextId = instance.contextId;
  }

  listContexts(): ContextInfo[] {
    return [...this.contexts.values()].map((ctx) => ({
      contextId: ctx.contextId,
      pageIds: [...ctx.pageIds],
    }));
  }

  async closeActivePage(): Promise<void> {
    const pageId = this.activePageId;
    if (!pageId) {
      throw new Error("No active page to close.");
    }
    await this.closePage(pageId);
  }

  async closeActiveContext(): Promise<void> {
    const contextId = this.activeContextId;
    if (!contextId) {
      throw new Error("No active context to close.");
    }
    await this.closeContext(contextId);
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
    if (this.activePageId === pageId) {
      this.activePageId = ctx?.pageIds.values().next().value;
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
    if (this.activeContextId === contextId) {
      this.activeContextId = this.contexts.keys().next().value;
      const nextCtx = this.activeContextId
        ? this.contexts.get(this.activeContextId)
        : undefined;
      this.activePageId = nextCtx?.pageIds.values().next().value;
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
    this.activeContextId = undefined;
    this.activePageId = undefined;
    if (!this.browserPromise) {
      return;
    }
    const browser = await this.browserPromise;
    this.browserPromise = undefined;
    await browser.close();
  }

  applyActiveTarget(target?: ActiveTarget): void {
    if (target?.contextId) {
      this.selectContext(target.contextId);
    }
    if (target?.pageId) {
      this.selectPage(target.pageId);
    }
  }

  async withPage<T>(
    fn: (page: Page, instance: PageInstance) => Promise<T>,
    target?: ActiveTarget,
  ): Promise<T> {
    this.applyActiveTarget(target);
    const pageId = await this.ensureActivePage();
    const instance = this.pages.get(pageId);
    if (!instance) {
      throw new Error(`Unknown pageId: ${pageId}`);
    }
    return fn(instance.page, instance);
  }

  private getBrowser(): Promise<Browser> {
    if (!this.browserPromise) {
      this.browserPromise = this.connectOrLaunch();
    }
    return this.browserPromise;
  }

  private async ensureActivePage(): Promise<string> {
    if (this.activePageId && this.pages.has(this.activePageId)) {
      return this.activePageId;
    }
    await this.ensureActiveContext();
    return this.newPage();
  }

  private async ensureActiveContext(): Promise<string> {
    if (this.activeContextId && this.contexts.has(this.activeContextId)) {
      return this.activeContextId;
    }
    return this.newContext();
  }

  private async connectOrLaunch(): Promise<Browser> {
    if (this.browserWsEndpoint) {
      return chromium.connect(this.browserWsEndpoint);
    }
    return chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
}
