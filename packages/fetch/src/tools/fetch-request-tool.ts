import { tool } from "ai";
import { z } from "zod";
import { buildRequestUrl, performHttpFetch } from "../fetch";
import { htmlToMarkdown, isHtmlResponseBody } from "../html-to-markdown";
import type { CreateFetchToolsOptions } from "./index";

const FETCH_REQUEST_DESCRIPTION =
  "Perform an HTTP request and return status, headers, and response body. Use for APIs, documentation, JSON endpoints, and simple web page retrieval.";

const MAX_TOOL_OUTPUT_CHARS = 32_000;

const httpMethodSchema = z.enum([
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
]);

const FetchResponseFormatSchema = z
  .enum(["raw", "markdown"])
  .describe(
    "raw: plain status/headers/body sections; markdown: structured Markdown output.",
  );

export type FetchResponseFormat = z.infer<typeof FetchResponseFormatSchema>;

export function createFetchRequestTool(options: CreateFetchToolsOptions) {
  return tool({
    description: FETCH_REQUEST_DESCRIPTION,
    inputSchema: z.object({
      path: z
        .string()
        .url()
        .describe(
          "Absolute request URL (existing query string on path is preserved)",
        ),
      query: z
        .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
        .optional()
        .describe("Optional query parameters merged into the URL"),
      method: httpMethodSchema
        .optional()
        .describe("HTTP method (default GET)"),
      headers: z
        .record(z.string(), z.string())
        .optional()
        .describe("Optional request headers"),
      body: z
        .string()
        .optional()
        .describe("Optional request body (e.g. JSON or form data)"),
      timeoutMs: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Optional timeout in milliseconds"),
      format: FetchResponseFormatSchema.optional().describe(
        "Response output format. Defaults to raw.",
      ),
    }),
    execute: async ({
      path,
      query,
      method,
      headers,
      body,
      timeoutMs,
      format = "raw",
    }) => {
      const result = await performHttpFetch(options, {
        url: buildRequestUrl(path, query),
        method,
        headers,
        body,
        timeoutMs,
      });
      return formatFetchResult(result, format);
    },
  });
}

export { FETCH_REQUEST_DESCRIPTION };

function formatFetchResult(
  result: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
  },
  format: FetchResponseFormat,
): string {
  if (format === "markdown") {
    return truncateForTool(formatFetchResultMarkdown(result));
  }
  return truncateForTool(formatFetchResultRaw(result));
}

function formatFetchResultRaw(result: {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
}): string {
  const headerLines = Object.entries(result.headers).map(
    ([key, value]) => `${key}: ${value}`,
  );
  const parts = [
    `Status: ${result.status} ${result.statusText}`,
    "",
    "--- headers ---",
    headerLines.length > 0 ? headerLines.join("\n") : "(none)",
    "",
    "--- body ---",
    result.body,
  ];
  return parts.join("\n");
}

function formatFetchResultMarkdown(result: {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
}): string {
  const headerLines = Object.entries(result.headers);
  const headerSection =
    headerLines.length > 0
      ? headerLines.map(([key, value]) => `- \`${key}\`: ${value}`).join("\n")
      : "_No response headers_";

  const bodySection = formatMarkdownBodySection(result.headers, result.body);

  return [
    `# HTTP ${result.status} ${result.statusText}`,
    "",
    "## Headers",
    "",
    headerSection,
    "",
    "## Body",
    "",
    bodySection,
  ].join("\n");
}

function formatMarkdownBodySection(
  headers: Record<string, string>,
  body: string,
): string {
  if (!body) {
    return "_Empty body_";
  }
  if (isHtmlResponseBody(headers, body)) {
    return htmlToMarkdown(body) || "_Empty body_";
  }
  return body;
}

function truncateForTool(text: string): string {
  if (text.length <= MAX_TOOL_OUTPUT_CHARS) {
    return text;
  }
  const omitted = text.length - MAX_TOOL_OUTPUT_CHARS;
  return `${text.slice(0, MAX_TOOL_OUTPUT_CHARS)}\n\n[truncated ${omitted} characters]`;
}
