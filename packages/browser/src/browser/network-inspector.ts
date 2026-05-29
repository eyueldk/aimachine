import type { Page, Request, Response } from "playwright";
import { BoundedBuffer } from "./bounded-buffer";

const MAX_NETWORK_ENTRIES = 400;

const requestIds = new WeakMap<Request, string>();

function requestId(request: Request): string {
  let id = requestIds.get(request);
  if (!id) {
    id = crypto.randomUUID();
    requestIds.set(request, id);
  }
  return id;
}

export type NetworkItem = NetworkRequest | NetworkResponse;

export interface NetworkRequest {
  type: "request";
  id: string;
  resourceType: string;
  url: string;
  method: string;
  timestamp: Date;
  postData?: string;
  headers: Record<string, string>;
}

export interface NetworkResponse {
  type: "response";
  id: string;
  resourceType: string;
  url: string;
  method: string;
  timestamp: Date;
  statusCode: number;
  headers: Record<string, string>;
}

export class NetworkInspector {
  private readonly buffer = new BoundedBuffer<NetworkItem>(MAX_NETWORK_ENTRIES);

  private readonly onRequest = (request: Request) => {
    void this.captureRequest(request);
  };

  private readonly onResponse = (response: Response) => {
    void this.captureResponse(response);
  };

  constructor(page: Page) {
    page.on("request", this.onRequest);
    page.on("response", this.onResponse);
  }

  getRecent(limit?: number): NetworkItem[] {
    return this.buffer.getRecent(limit);
  }

  clear(): void {
    this.buffer.clear();
  }

  private async captureRequest(req: Request): Promise<void> {
    try {
      let postData: string | undefined;
      if (req.method() !== "GET" && req.postData()) {
        postData = req.postData() ?? undefined;
      }
      this.buffer.push({
        type: "request",
        id: requestId(req),
        timestamp: new Date(),
        url: req.url(),
        method: req.method(),
        resourceType: req.resourceType(),
        headers: { ...req.headers() },
        postData,
      });
    } catch {
      // ignore
    }
  }

  private async captureResponse(response: Response): Promise<void> {
    try {
      const req = response.request();
      this.buffer.push({
        type: "response",
        id: requestId(req),
        timestamp: new Date(),
        url: req.url(),
        method: req.method(),
        resourceType: req.resourceType(),
        headers: { ...response.headers() },
        statusCode: response.status(),
      });
    } catch {
      // ignore
    }
  }
}
