/** System text for agents using the browser toolkit. Append to your base system instructions (or merge with other toolkit hints). */
export const BROWSER_TOOLKIT_HINT = `## Browser tools

You control a real browser tab via Puppeteer-backed tools on the current session.

- **Navigation:** Use \`goto\` with a full URL when you need to load or change pages.
- **Understanding the page:** Prefer \`viewPage\` for a compact structural summary. Use \`inspectHTML\` when you need a DOM slice (CSS selector). Use \`getScreenshot\` when layout, color, or non-text UI matters (returns image for multimodal models).
- **Interaction:** Use \`click\` and \`type\` with reliable CSS selectors. Use \`evaluate\` only for small, read-only or tightly-scoped scripts when other tools are insufficient.
- **Diagnostics:** \`inspectConsole\` and \`inspectNetwork\` surface recent console logs and network activity already captured for this session.
- **Cookies:** \`getCookies\` reads cookies for the current page when auth or state debugging is needed.

Several tools support \`viewAfter: true\` to append a simplified page view after the action—useful to confirm the UI state changed.

Be explicit about which page you expect to be on before acting. Avoid destructive or unbounded \`evaluate\` scripts. Close sessions from the host app when the run is finished (this package does not close the browser for you).`;
