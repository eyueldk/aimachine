import { describe, expect, test } from "vitest";
import {
  LocalShell,
  SHELL_HINT,
  createShellToolkit,
} from "../src/index";

const toolOpts = { toolCallId: "test", messages: [] } as const;

describe("createShellToolkit", () => {
  test("returns tools, hint, and state", async () => {
    const adapter = await LocalShell.create();
    const kit = createShellToolkit({ adapter });
    expect(kit.tools.runCommand).toBeDefined();
    expect(kit.hint).toBe(SHELL_HINT);
    expect(kit.state.adapter).toBe(adapter);
  });

  test("runCommand formats adapter output", async () => {
    const adapter = await LocalShell.create();
    const { runCommand } = createShellToolkit({ adapter }).tools;
    const out = await runCommand.execute!(
      { command: "echo hi" },
      { ...toolOpts, messages: [] },
    );
    expect(typeof out).toBe("string");
    expect(out).toContain("Exit code: 0");
    expect(out).toContain("hi");
  });
});
