import { createAuthenticationOptions } from "#/create-authentication-options.ts";

/**
 * The authentication options with placeholder settings and callbacks, from
 * which better-auth's CLI generates the schema and the schema test reads the
 * tables, since neither needs real settings.
 */
export const placeholderAuthenticationOptions = createAuthenticationOptions({
  appleAppBundleId: "apple-app-bundle-id",
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
});
