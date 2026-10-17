import { betterAuth } from "better-auth";

import { createAuthenticationOptions } from "./src/create-authentication-options.ts";

export default betterAuth(
  createAuthenticationOptions({
    appleAppBundleIdentifier: "apple-app-bundle-identifier",
    baseUrl: "http://localhost:3000",
    database: {},
    googleIosClientId: "google-ios-client-id",
    googleWebClientId: "google-web-client-id",
    nodeEnvironment: "development",
    secret: "better-auth-secret-placeholder-of-32-characters",
    sendVerificationOtpCode: () => Promise.resolve(),
  }),
);
