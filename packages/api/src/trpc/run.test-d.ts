import * as Effect from "effect/Effect";
import { describe, it } from "vitest";

import { protectedProcedure, router } from "./procedures.ts";
import { run } from "./run.ts";

describe("run", () => {
  it("rejects a procedure whose Effect can fail with an error outside its list of Wire errors", () => {
    router({
      failing: protectedProcedure.query(({ ctx, signal }) =>
        run({
          context: ctx,
          // @ts-expect-error -- the list holds no Wire error, so the Effect can't fail
          effect: Effect.fail(new Error("Failed outside the list")),
          errors: [],
          signal,
        }),
      ),
    });
  });
});
