import { Authentication } from "@ankaa/authentication/authentication";
import { createTestUser } from "@ankaa/authentication/testing/create-test-user";
import * as Effect from "effect/Effect";

import type { TestRuntime } from "#/shared/testing/create-test-runtime.ts";

import { createCaller } from "#/shared/testing/create-caller.ts";
import { createInnerContext } from "#/trpc/context.ts";

/**
 * Returns a caller with the session of `testUser`, or of a new User when the
 * test doesn't need to know who is signed in.
 */
export async function createSignedInCaller({
  runtime,
  testUser,
  ...callerOptions
}: {
  runtime: TestRuntime;
  signal?: AbortSignal;
  testUser?: Awaited<ReturnType<typeof createTestUser>>;
}) {
  const signedInTestUser = testUser ?? (await createTestUser(runtime));
  const session = await runtime.runPromise(
    Effect.gen(function* () {
      const authentication = yield* Authentication;

      return yield* authentication.getSession(signedInTestUser.headers);
    }),
  );

  return createCaller(createInnerContext({ runtime, session }), callerOptions);
}
