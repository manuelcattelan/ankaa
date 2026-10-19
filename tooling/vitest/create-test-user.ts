import type { TestAuthentication } from "@ankaa/authentication/testing/create-test-authentication";

export async function createTestUser(testAuthentication: TestAuthentication) {
  const testAuthenticationContext = await testAuthentication.$context;

  const user = await testAuthenticationContext.test.saveUser(
    testAuthenticationContext.test.createUser(),
  );

  const headers = await testAuthenticationContext.test.getAuthHeaders({
    userId: user.id,
  });

  return { headers, user };
}
