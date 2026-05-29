import type { ConsoleMessage, Page } from "playwright";
import { BoundedBuffer } from "./bounded-buffer";

const MAX_CONSOLE_ENTRIES = 200;

export type ConsoleLogEntry = {
  type: string;
  text: string;
  timestamp: Date;
};

export class ConsoleInspector {
  private readonly buffer = new BoundedBuffer<ConsoleLogEntry>(
    MAX_CONSOLE_ENTRIES,
  );

  private readonly onConsole = (message: ConsoleMessage) => {
    this.buffer.push({
      type: message.type(),
      text: message.text(),
      timestamp: new Date(),
    });
  };

  constructor(page: Page) {
    page.on("console", this.onConsole);
  }

  getRecent(limit?: number): ConsoleLogEntry[] {
    return this.buffer.getRecent(limit);
  }

  clear(): void {
    this.buffer.clear();
  }
}
