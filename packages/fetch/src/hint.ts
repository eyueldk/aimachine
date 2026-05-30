/** Optional system text when wiring {@link createFetchToolkit}. */
export const FETCH_HINT = `# fetch tools

You can perform HTTP requests with **fetchRequest**. Use it to read public APIs, documentation pages, JSON endpoints, and other web resources.

- Prefer **GET** for read-only retrieval unless the task requires another method.
- Check **status**, **headers**, and **body** in the tool result; non-2xx responses are still returned for inspection.
- Use **\`format: "markdown"\`** for a structured snapshot; HTML bodies are converted to Markdown, other types are left as-is in the body section. Default **\`raw\`** keeps plain sections.
- Large response bodies may be truncated in the tool output; narrow the request or use a more specific URL if you need more detail.
- Only request URLs the user or task legitimately needs; avoid hammering the same host with repeated calls.`;
