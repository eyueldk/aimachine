import { describe, test, expect, beforeAll, afterAll } from "vitest";
import {
  createBrowserToolkit,
  type BrowserToolkit,
  type BrowserTools,
} from "../src/index";

const toolOpts = { toolCallId: "test", messages: [] } as const;

describe("Browser Tools Integration Tests", () => {
  let kit: BrowserToolkit;
  let tools: BrowserTools;
  let defaultPageId: string;

  beforeAll(async () => {
    kit = createBrowserToolkit();
    tools = kit.tools;
    defaultPageId = await kit.browser.createPage();
    await tools.goto.execute!(
      { pageId: defaultPageId, url: "https://example.com" },
      { ...toolOpts, messages: [] },
    );
  });

  afterAll(async () => {
    await kit.browser.close();
  });

  test("createBrowserToolkit returns tools, hint, and browser", () => {
    expect(kit.tools.goto).toBeDefined();
    expect(kit.hint).toContain("pageId");
    expect(kit.browser).toBeDefined();
  });

  test("goto tool should navigate to a URL", async () => {
    const result = await tools.goto.execute!(
      { url: "https://example.com" },
      { ...toolOpts, messages: [] },
    );

    expect(typeof result).toBe("string");
    expect((result as string).length).toBeGreaterThan(0);

    const url = await kit.browser.withPage(undefined, async (page) => page.url());
    expect(url).toBe("https://example.com/");
  });

  test("goto with explicit pageId", async () => {
    const result = await tools.goto.execute!(
      { pageId: defaultPageId, url: "https://example.org" },
      { ...toolOpts, messages: [] },
    );
    expect(typeof result).toBe("string");
    const url = await kit.browser.withPage(defaultPageId, async (page) =>
      page.url(),
    );
    expect(url).toBe("https://example.org/");
  });

  test("inspectHTML tool should return HTML content", async () => {
    const result = await tools.inspectHTML.execute!(
      { cssSelector: "h1" },
      { ...toolOpts, messages: [] },
    );

    expect(typeof result).toBe("string");
    expect((result as string).length).toBeGreaterThan(0);
  });

  test("evaluate tool should execute JavaScript", async () => {
    const result = await tools.evaluate.execute!(
      { script: "1 + 1" },
      { ...toolOpts, messages: [] },
    );

    expect(typeof result).toBe("string");
    expect(result).toContain("2");
  });

  test("type tool should type text into an input", async () => {
    await kit.browser.withPage(undefined, async (page) => {
      await page.setContent(`
      <html>
        <body>
          <input id="test-input" type="text" />
        </body>
      </html>
    `);
    });

    const result = await tools.type.execute!(
      {
        cssSelector: "#test-input",
        text: "Hello World",
      },
      { ...toolOpts, messages: [] },
    );

    expect(typeof result).toBe("string");

    const inputValue = await kit.browser.withPage(undefined, async (page) =>
      page.locator("#test-input").inputValue(),
    );
    expect(inputValue).toBe("Hello World");
  });

  test("click tool should click an element", async () => {
    await kit.browser.withPage(undefined, async (page) => {
      await page.setContent(`
      <html>
        <body>
          <button id="test-button" onclick="document.body.style.backgroundColor = 'red'">Click Me</button>
        </body>
      </html>
    `);
    });

    const result = await tools.click.execute!(
      { cssSelector: "#test-button" },
      { ...toolOpts, messages: [] },
    );

    expect(typeof result).toBe("string");

    const bgColor = await kit.browser.withPage(undefined, async (page) =>
      page.evaluate(() => document.body.style.backgroundColor),
    );
    expect(bgColor).toBe("red");
  });

  test("getScreenshot tool should return base64 JPEG data", async () => {
    const result = await tools.getScreenshot.execute!(
      {},
      { ...toolOpts, messages: [] },
    );

    expect(typeof result).toBe("string");
    expect((result as string).length).toBeGreaterThan(0);
  });

  test("viewPage tool should return simplified page content by default", async () => {
    await kit.browser.withPage(undefined, async (page) => {
      await page.setContent(`
      <html>
        <body>
          <h1>Test Title</h1>
          <p>Test Paragraph</p>
          <a href="#">Test Link</a>
        </body>
      </html>
    `);
    });

    const result = await tools.viewPage.execute!(
      {},
      { ...toolOpts, messages: [] },
    );

    expect(typeof result).toBe("string");
    expect((result as string)).toContain("Test Title");
    expect((result as string)).toContain("## View: simplified");
  });

  test("viewPage accessibility mode returns ARIA snapshot", async () => {
    await kit.browser.withPage(undefined, async (page) => {
      await page.setContent(`
      <html>
        <body>
          <h1>Accessible Title</h1>
        </body>
      </html>
    `);
    });

    const result = await tools.viewPage.execute!(
      { mode: "accessibility" },
      { ...toolOpts, messages: [] },
    );

    expect(typeof result).toBe("string");
    expect((result as string)).toContain("## View: accessibility");
    expect((result as string)).toContain("Accessible Title");
  });

  test("createContext and createPage open a second page", async () => {
    const ctxResult = await tools.createContext.execute!(
      {},
      { ...toolOpts, messages: [] },
    );
    const { contextId } = JSON.parse(ctxResult as string) as {
      contextId: string;
    };

    const pageResult = await tools.createPage.execute!(
      { contextId },
      { ...toolOpts, messages: [] },
    );
    const { pageId } = JSON.parse(pageResult as string) as { pageId: string };

    await tools.goto.execute!(
      { pageId, url: "https://example.com" },
      { ...toolOpts, messages: [] },
    );

    const list = await tools.listContexts.execute!(
      {},
      { ...toolOpts, messages: [] },
    );
    expect(list).toContain(contextId);
    expect(list).toContain(pageId);

    await tools.closePage.execute!({ pageId }, { ...toolOpts, messages: [] });
    await tools.closeContext.execute!(
      { contextId },
      { ...toolOpts, messages: [] },
    );
  });
});
