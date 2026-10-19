import { createTestAuthentication } from "@ankaa/authentication/testing/create-test-authentication";

import type { TestRuntime } from "./create-test-runtime.ts";

export async function createTestUser(runtime: TestRuntime) {
  const testAuthentication = await runtime.runPromise(
    createTestAuthentication(),
  );
  const testAuthenticationContext = await testAuthentication.$context;

  const user = await testAuthenticationContext.test.saveUser(
    testAuthenticationContext.test.createUser(),
  );

  const headers = await testAuthenticationContext.test.getAuthHeaders({
    userId: user.id,
  });

  return { headers, user };
}
