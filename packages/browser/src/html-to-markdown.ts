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
  const trimmed = html.trim();
  if (!trimmed) {
    return "";
  }
  return getTurndownService().turndown(trimmed).trim();
}
