import type { Readable, Writable } from "node:stream";
import { Writable as WritableStream } from "node:stream";

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  onTimeout?: () => void,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      onTimeout?.();
      reject(new Error(`Command timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

export function mergeEnvLayers(
  ...layers: (Record<string, string> | undefined)[]
): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const layer of layers) {
    if (layer) {
      Object.assign(merged, layer);
    }
  }
  return merged;
}

export function toDockerEnvList(env: Record<string, string>): string[] {
  return Object.entries(env).map(([key, value]) => `${key}=${value}`);
}

export function toBuffer(chunk: Buffer | string): Buffer {
  return Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
}

export function writeChunk(
  sink: Writable | undefined,
  chunks: Buffer[],
  chunk: Buffer | string,
): void {
  if (sink) {
    sink.write(chunk);
    return;
  }
  chunks.push(toBuffer(chunk));
}

export function bufferedUtf8(chunks: Buffer[]): string {
  return Buffer.concat(chunks).toString("utf8");
}

export function attachStdin(
  stdin: string | Readable | undefined,
  target: NodeJS.WritableStream | null | undefined,
): void {
  if (!target) {
    return;
  }
  if (stdin === undefined) {
    target.end();
    return;
  }
  if (typeof stdin === "string") {
    target.write(stdin);
    target.end();
    return;
  }
  stdin.pipe(target);
}

export class CollectStream extends WritableStream {
  private readonly chunks: Buffer[] = [];

  override _write(
    chunk: Buffer | string,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    this.chunks.push(toBuffer(chunk));
    callback();
  }

  text(): string {
    return Buffer.concat(this.chunks).toString("utf8");
  }
}
