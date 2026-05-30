import TurndownService from "turndown";
import { gfm } from "@truto/turndown-plugin-gfm";

let turndownService: TurndownService | undefined;

function getTurndownService(): TurndownService {
  if (!turndownService) {
    const service = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      emDelimiter: "_",
    });
    service.use(gfm);
    turndownService = service;
  }
  return turndownService;
}

export function htmlToMarkdown(html: string): string {
  const prepared = prepareHtmlForMarkdown(html).trim();
  if (!prepared) {
    return "";
  }
  return getTurndownService().turndown(prepared).trim();
}

export function isHtmlResponseBody(
  headers: Record<string, string>,
  body: string,
): boolean {
  const contentType = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === "content-type",
  )?.[1];
  if (contentType?.toLowerCase().includes("html")) {
    return true;
  }
  const trimmed = body.trimStart();
  return trimmed.startsWith("<") && /<\/[a-z][\s\S]*>/i.test(trimmed);
}

function prepareHtmlForMarkdown(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<link\b[^>]*>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "");
}
