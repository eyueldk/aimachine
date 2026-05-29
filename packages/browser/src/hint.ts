/** System text for agents using the browser toolkit. Append to your base system instructions. */
export const BROWSER_TOOLKIT_HINT = `## Browser tools

You control real browser pages via Playwright-backed tools. Each page has a **pageId** (UUID). Omit **pageId** to use the default page.

- **Lifecycle:** \`createContext\`, \`createPage\` (optional \`contextId\`), \`listContexts\`, \`closePage\`, \`closeContext\`.
- **Navigation:** \`goto\` with a full URL.
- **Understanding the page:** \`viewPage\` (\`mode\`: \`simplified\` or \`accessibility\`), \`inspectHTML\`, \`getScreenshot\` (multimodal).
- **Interaction:** \`click\` and \`type\` with CSS selectors. Use \`evaluate\` only for small, scoped scripts.
- **Diagnostics:** \`inspectConsole\` and \`inspectNetwork\` read **recent ring buffers** (not full history); tool output may truncate large fields.
- **Cookies:** \`getCookies\` for the page's context.

Several tools support \`viewAfter: { mode: "simplified" | "accessibility" }\` to append a page view after the action.

Call \`listContexts\` after opening pages to discover **pageId** values. The host app should call \`await browser.close()\` when the run ends.`;
