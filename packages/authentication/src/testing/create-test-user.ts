import type * as ManagedRuntime from "effect/ManagedRuntime";

import * as Effect from "effect/Effect";

import { AuthenticationTestHelpers } from "#/testing/authentication-test-helpers.ts";

export async function createTestUser(
  runtime: ManagedRuntime.ManagedRuntime<AuthenticationTestHelpers, unknown>,
) {
  return runtime.runPromise(
    Effect.gen(function* () {
      const authenticationTestHelpers = yield* AuthenticationTestHelpers;

      return yield* Effect.promise(() =>
        saveTestUser(authenticationTestHelpers),
      );
    }),
  );
}

async function saveTestUser(
  authenticationTestHelpers: AuthenticationTestHelpers["Service"],
) {
  const user = await authenticationTestHelpers.saveUser(
    authenticationTestHelpers.createUser(),
  );

  const headers = await authenticationTestHelpers.getAuthHeaders({
    userId: user.id,
  });

  return { headers, user };
}
