import type { TestRuntime } from "@ankaa/vitest/create-test-runtime";

import { Authentication } from "@ankaa/authentication";
import { createTestUser } from "@ankaa/vitest/create-test-user";

import { createInnerContext } from "../../trpc/context.ts";
import { createCaller } from "./create-caller.ts";

export async function createSignedInCaller(runtime: TestRuntime) {
  const testUser = await createTestUser(runtime);
  const session = await runtime.runPromise(
    Authentication.use((authentication) =>
      authentication.getSession(testUser.headers),
    ),
  );

  return createCaller(createInnerContext({ runtime, session }));
}
