import { describe, expect, test } from "vitest";
import { BoundedBuffer } from "../src/browser/bounded-buffer";

describe("BoundedBuffer", () => {
  test("drops oldest entries when over max", () => {
    const buffer = new BoundedBuffer<number>(3);
    buffer.push(1);
    buffer.push(2);
    buffer.push(3);
    buffer.push(4);
    expect(buffer.length).toBe(3);
    expect(buffer.getRecent()).toEqual([2, 3, 4]);
  });

  test("getRecent respects limit", () => {
    const buffer = new BoundedBuffer<number>(10);
    for (let i = 0; i < 5; i++) buffer.push(i);
    expect(buffer.getRecent(2)).toEqual([3, 4]);
  });
});
