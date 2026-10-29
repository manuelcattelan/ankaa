import type * as ManagedRuntime from "effect/ManagedRuntime";

import * as Effect from "effect/Effect";

import { AuthenticationTestHelpers } from "#/testing/authentication-test-helpers.ts";

export async function createTestUser(
  runtime: ManagedRuntime.ManagedRuntime<AuthenticationTestHelpers, unknown>,
) {
  return runtime.runPromise(
    Effect.gen(function* () {
      const test = yield* AuthenticationTestHelpers;

      return yield* Effect.promise(() => saveTestUser(test));
    }),
  );
}

async function saveTestUser(test: AuthenticationTestHelpers["Service"]) {
  const user = await test.saveUser(test.createUser());

  const headers = await test.getAuthHeaders({
    userId: user.id,
  });

  return { headers, user };
}
