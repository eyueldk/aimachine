import { describe, expect, test } from "vitest";
import { truncateHeaders, truncateString } from "../src/utils";

describe("truncateString", () => {
  test("truncates long strings", () => {
    const s = "a".repeat(100);
    expect(truncateString(s, 10)).toBe(`${"a".repeat(10)}…`);
  });

  test("caps console output length", () => {
    const long = "x".repeat(5_000);
    const truncated = truncateString(long, 2_000);
    expect(truncated.length).toBe(2_001);
  });

  test("caps network post data length", () => {
    const long = "a".repeat(10_000);
    const truncated = truncateString(long, 4_096);
    expect(truncated.length).toBe(4_097);
  });
});

describe("truncateHeaders", () => {
  test("truncates header values", () => {
    const headers = { "x-test": "b".repeat(1_000) };
    const out = truncateHeaders(headers, 10);
    expect(out["x-test"]).toBe(`${"b".repeat(10)}…`);
  });
});
