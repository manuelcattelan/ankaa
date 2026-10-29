import * as ExpoAppleAuthentication from "expo-apple-authentication";

/**
 * The credential of a Sign in with Apple that shares no name, no email
 * address and no authorization code.
 */
export const APPLE_AUTHENTICATION_CREDENTIAL: ExpoAppleAuthentication.AppleAuthenticationCredential =
  {
    authorizationCode: null,
    email: null,
    fullName: null,
    identityToken: "apple-identity-token",
    realUserStatus:
      ExpoAppleAuthentication.AppleAuthenticationUserDetectionStatus
        .LIKELY_REAL,
    ["state"]: null,
    user: "apple-user-1",
  };
