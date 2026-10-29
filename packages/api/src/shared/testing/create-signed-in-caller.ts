import { Authentication } from "@ankaa/authentication/authentication";
import { createTestUser } from "@ankaa/authentication/testing/create-test-user";
import * as Effect from "effect/Effect";

import type { TestRuntime } from "#/shared/testing/create-test-runtime.ts";

import { createCaller } from "#/shared/testing/create-caller.ts";
import { createInnerContext } from "#/trpc/context.ts";

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
