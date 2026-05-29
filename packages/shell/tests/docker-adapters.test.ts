import Dockerode from "dockerode";
import { GenericContainer, type StartedTestContainer } from "testcontainers";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { DockerShell } from "../src/index";

const hasDocker = await (async () => {
  try {
    await new Dockerode().ping();
    return true;
  } catch {
    return false;
  }
})();

describe.skipIf(!hasDocker)("DockerShell", () => {
  let docker: Dockerode;
  let container: StartedTestContainer;

  beforeAll(async () => {
    docker = new Dockerode();
    container = await new GenericContainer("alpine")
      .withCommand(["sh", "-c", "mkdir -p /work && exec sleep infinity"])
      .start();
  }, 120_000);

  afterAll(async () => {
    await container.stop();
  });

  test("runs a command in the container", async () => {
    const shell = await DockerShell.create({
      container: container.getId(),
      cwd: "/work",
      docker,
    });
    const result = await shell.exec("echo from-docker");
    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toBe("from-docker");
  });
});
