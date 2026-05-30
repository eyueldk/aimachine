export const DEFAULT_FETCH_TIMEOUT_MS = 30_000;

export type FetchRequestInput = {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
};

export type FetchResponseData = {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
};

export type PerformHttpFetchOptions = {
  fetch: typeof globalThis.fetch;
  defaultTimeoutMs: number;
};

export type FetchQueryParams = Record<string, string | number | boolean>;

/**
 * Builds an absolute request URL from `path` and optional query params.
 * Existing search params on `path` are preserved; `query` entries set or override.
 */
export function buildRequestUrl(
  path: string,
  query?: FetchQueryParams,
): string {
  const url = new URL(path);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.href;
}

export async function performHttpFetch(
  config: PerformHttpFetchOptions,
  input: FetchRequestInput,
): Promise<FetchResponseData> {
  const timeoutMs = input.timeoutMs ?? config.defaultTimeoutMs;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await config.fetch(input.url, {
      method: input.method ?? "GET",
      headers: input.headers,
      body: input.body,
      signal: controller.signal,
    });

    const body = await response.text();
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers,
      body,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
