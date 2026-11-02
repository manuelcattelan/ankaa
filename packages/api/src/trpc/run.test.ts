import * as Effect from "effect/Effect";
import { pino } from "pino";
import { afterAll, describe, expect, it } from "vitest";

import { createTestRuntime } from "#/shared/testing/create-test-runtime.ts";
import { run } from "#/trpc/run.ts";

describe("run", () => {
  const runtime = createTestRuntime();

  afterAll(async () => {
    await runtime.dispose();
  });

  it("writes an Effect log of the procedure to the log of its request", async () => {
    const logLines: unknown[] = [];
    const req = {
      log: pino(
        {},
        {
          write: (logLine: string) => {
            logLines.push(JSON.parse(logLine));
          },
        },
      ),
    };

    await run({
      context: { req, runtime },
      effect: Effect.log("Running the procedure"),
      errors: [],
      signal: new AbortController().signal,
    });

    expect(logLines).toContainEqual(
      expect.objectContaining({ msg: "Running the procedure" }),
    );
  });
});
