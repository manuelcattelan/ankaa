import type { TestAuthentication } from "@ankaa/authentication/testing/create-test-authentication";

import { createTestAuthentication } from "@ankaa/authentication/testing/create-test-authentication";
import * as Effect from "effect/Effect";

import type { TestRuntime } from "#/create-test-runtime.ts";

export async function createTestUser(runtime: TestRuntime) {
  return runtime.runPromise(
    Effect.scoped(
      Effect.gen(function* () {
        const testAuthentication = yield* createTestAuthentication();

        return yield* Effect.promise(() => saveTestUser(testAuthentication));
      }),
    ),
  );
}

async function saveTestUser(testAuthentication: TestAuthentication) {
  const testAuthenticationContext = await testAuthentication.$context;

  const user = await testAuthenticationContext.test.saveUser(
    testAuthenticationContext.test.createUser(),
  );

  const headers = await testAuthenticationContext.test.getAuthHeaders({
    userId: user.id,
  });

  return { headers, user };
}
