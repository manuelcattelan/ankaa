/**
 * The URL scheme of each variant of the mobile app, which better-auth trusts
 * as an origin. Each variant has its own, because iOS leaves undefined which
 * app opens a scheme that two installed apps share
 * (https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app).
 */
export const APPLICATION_SCHEMES = {
  development: "ankaa-development",
  production: "ankaa",
} as const;
