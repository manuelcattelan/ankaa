import { getAuthTables } from "better-auth/db";
import { describe, expect, it } from "vitest";

import { createAuthenticationOptions } from "#/create-authentication-options.ts";
import { listTableMismatches } from "#/testing/list-table-mismatches.ts";

const models = getAuthTables(
  createAuthenticationOptions({
    appleBundleId: "apple-bundle-id",
    baseUrl: "http://localhost:3000",
    database: {},
    googleIosClientId: "google-ios-client-id",
    googleWebClientId: "google-web-client-id",
    nodeEnvironment: "test",
    requestRefreshToken: () => Promise.resolve(null),
    revokeRefreshToken: () => Promise.resolve(),
    secret: "better-auth-secret-placeholder-of-32-characters",
    sendAccountDeletionLink: () => Promise.resolve(),
    sendVerificationOtpCode: () => Promise.resolve(),
  }),
);

describe("createAuthenticationOptions", () => {
  it.for(Object.values(models))(
    "gives the $modelName model a Drizzle table whose columns match its fields",
    (model) => {
      expect(listTableMismatches(model)).toStrictEqual([]);
    },
  );
});
