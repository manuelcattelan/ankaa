import type { TestRuntime } from "@ankaa/vitest/create-test-runtime";

import { Authentication } from "@ankaa/authentication";
import { createTestUser } from "@ankaa/vitest/create-test-user";
import * as Effect from "effect/Effect";

import { createInnerContext } from "../../trpc/context.ts";
import { createCaller } from "./create-caller.ts";

type CreateSignedInCallerOptions = {
  runtime: TestRuntime;
  signal?: AbortSignal;
};

export async function createSignedInCaller({
  runtime,
  signal,
}: CreateSignedInCallerOptions) {
  const testUser = await createTestUser(runtime);
  const session = await runtime.runPromise(
    Effect.gen(function* () {
      const authentication = yield* Authentication;

      return yield* authentication.getSession(testUser.headers);
    }),
  );

  return createCaller(createInnerContext({ runtime, session }), { signal });
}
