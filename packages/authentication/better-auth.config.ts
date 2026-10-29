import { betterAuth } from "better-auth";

import { createAuthenticationOptions } from "#/create-authentication-options.ts";

export default betterAuth(
  createAuthenticationOptions({
    appleAppBundleId: "apple-bundle-id",
    baseUrl: "http://localhost:3000",
    database: {},
    googleIosClientId: "google-ios-client-id",
    googleWebClientId: "google-web-client-id",
    nodeEnvironment: "development",
    requestRefreshToken: () => Promise.resolve(null),
    revokeRefreshToken: () => Promise.resolve(),
    secret: "better-auth-secret-placeholder-of-32-characters",
    sendAccountDeletionLink: () => Promise.resolve(),
    sendVerificationOtpCode: () => Promise.resolve(),
  }),
);
