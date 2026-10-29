import type { KeyObject } from "node:crypto";

import * as Clock from "effect/Clock";
import * as Effect from "effect/Effect";
import * as HttpClient from "effect/http/HttpClient";
import * as HttpClientRequest from "effect/http/HttpClientRequest";
import * as HttpClientResponse from "effect/http/HttpClientResponse";
import * as Match from "effect/Match";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import { sign } from "node:crypto";

/**
 * The exchange of the authorization code of an Apple or Google sign-in for
 * the provider's refresh token.
 */
export type RefreshTokenRequest = {
  authorizationCode: string;
  providerId: SocialProviderId;
};

/**
 * The revocation of a refresh token that Apple or Google issued.
 */
export type RefreshTokenRevocation = {
  providerId: SocialProviderId;
  refreshToken: string;
};

type SocialProviderId = typeof socialProviderIdSchema.Type;

const APPLE_CLIENT_SECRET_LIFETIME_SECONDS = 300;

const APPLE_REVOCATION_URL = "https://appleid.apple.com/auth/revoke";

const APPLE_TOKEN_URL = "https://appleid.apple.com/auth/token";

const AUTHORIZATION_CODE_GRANT_TYPE = "authorization_code";

const GOOGLE_REVOCATION_URL = "https://oauth2.googleapis.com/revoke";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

const MILLISECONDS_PER_SECOND = 1000;

export const socialProviderIdSchema = Schema.Literals(["apple", "google"]);

// Google returns a refresh token only for the first authorization code of a
// User (https://developers.google.com/identity/protocols/oauth2/web-server).
const tokenResponseSchema = Schema.Struct({
  ["refresh_token"]: Schema.NullOr(Schema.String).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed(null)),
  ),
});

/**
 * Builds the calls that the server makes to Apple's and Google's OAuth
 * endpoints, which better-auth doesn't make for a sign-in with an id token.
 */
export const makeSocialProviderClient = Effect.fn("makeSocialProviderClient")(
  function* ({
    appleAppBundleId,
    appleKeyId,
    applePrivateKey,
    appleTeamId,
    googleClientSecret,
    googleWebClientId,
  }: {
    appleAppBundleId: string;
    appleKeyId: string;
    applePrivateKey: KeyObject;
    appleTeamId: string;
    googleClientSecret: Redacted.Redacted;
    googleWebClientId: string;
  }) {
    const httpClient = (yield* HttpClient.HttpClient).pipe(
      HttpClient.filterStatusOk,
    );

    const createAppleClientSecret = Effect.fn(
      "SocialProviderClient.createAppleClientSecret",
    )(function* () {
      const issuedAtSeconds = Math.floor(
        (yield* Clock.currentTimeMillis) / MILLISECONDS_PER_SECOND,
      );

      return signAppleClientSecret({
        appleAppBundleId,
        appleKeyId,
        applePrivateKey,
        appleTeamId,
        issuedAtSeconds,
      });
    });

    const requestRefreshToken = Effect.fn(
      "SocialProviderClient.requestRefreshToken",
    )(function* ({ authorizationCode, providerId }: RefreshTokenRequest) {
      const tokenRequest = yield* Match.value(providerId).pipe(
        Match.when("apple", () =>
          Effect.map(createAppleClientSecret(), (appleClientSecret) =>
            HttpClientRequest.post(APPLE_TOKEN_URL).pipe(
              HttpClientRequest.bodyUrlParams({
                ["client_id"]: appleAppBundleId,
                ["client_secret"]: appleClientSecret,
                code: authorizationCode,
                ["grant_type"]: AUTHORIZATION_CODE_GRANT_TYPE,
              }),
            ),
          ),
        ),
        Match.when("google", () =>
          Effect.succeed(
            HttpClientRequest.post(GOOGLE_TOKEN_URL).pipe(
              HttpClientRequest.bodyUrlParams({
                ["client_id"]: googleWebClientId,
                ["client_secret"]: Redacted.value(googleClientSecret),
                code: authorizationCode,
                ["grant_type"]: AUTHORIZATION_CODE_GRANT_TYPE,
                // The mobile app's code was issued for the web client, which
                // has no redirect URI here, so Google takes an empty one
                // (https://developers.google.com/identity/sign-in/ios/offline-access).
                ["redirect_uri"]: "",
              }),
            ),
          ),
        ),
        Match.exhaustive,
      );

      const tokenResponse = yield* httpClient
        .execute(tokenRequest)
        .pipe(
          Effect.flatMap(
            HttpClientResponse.schemaBodyJson(tokenResponseSchema),
          ),
        );

      return tokenResponse.refresh_token;
    });

    const revokeRefreshToken = Effect.fn(
      "SocialProviderClient.revokeRefreshToken",
    )(function* ({ providerId, refreshToken }: RefreshTokenRevocation) {
      const revocationRequest = yield* Match.value(providerId).pipe(
        Match.when("apple", () =>
          Effect.map(createAppleClientSecret(), (appleClientSecret) =>
            HttpClientRequest.post(APPLE_REVOCATION_URL).pipe(
              HttpClientRequest.bodyUrlParams({
                ["client_id"]: appleAppBundleId,
                ["client_secret"]: appleClientSecret,
                token: refreshToken,
                ["token_type_hint"]: "refresh_token",
              }),
            ),
          ),
        ),
        Match.when("google", () =>
          Effect.succeed(
            HttpClientRequest.post(GOOGLE_REVOCATION_URL).pipe(
              HttpClientRequest.bodyUrlParams({ token: refreshToken }),
            ),
          ),
        ),
        Match.exhaustive,
      );

      yield* httpClient.execute(revocationRequest);
    });

    return { requestRefreshToken, revokeRefreshToken };
  },
);

function encodeJsonAsBase64Url(json: Record<string, unknown>) {
  return Buffer.from(JSON.stringify(json)).toString("base64url");
}

// Apple takes a client secret only as a JWT signed with ES256, whose signature
// is the raw pair of integers that Node writes with `ieee-p1363`, never the
// DER that it writes by default
// (https://developer.apple.com/documentation/accountorganizationaldatasharing/creating-a-client-secret,
// https://www.rfc-editor.org/rfc/rfc7518#section-3.4).
function signAppleClientSecret({
  appleAppBundleId,
  appleKeyId,
  applePrivateKey,
  appleTeamId,
  issuedAtSeconds,
}: {
  appleAppBundleId: string;
  appleKeyId: string;
  applePrivateKey: KeyObject;
  appleTeamId: string;
  issuedAtSeconds: number;
}) {
  const unsignedAppleClientSecret = `${encodeJsonAsBase64Url({
    alg: "ES256",
    kid: appleKeyId,
  })}.${encodeJsonAsBase64Url({
    aud: "https://appleid.apple.com",
    exp: issuedAtSeconds + APPLE_CLIENT_SECRET_LIFETIME_SECONDS,
    iat: issuedAtSeconds,
    iss: appleTeamId,
    sub: appleAppBundleId,
  })}`;

  const signature = sign("sha256", Buffer.from(unsignedAppleClientSecret), {
    dsaEncoding: "ieee-p1363",
    key: applePrivateKey,
  }).toString("base64url");

  return `${unsignedAppleClientSecret}.${signature}`;
}
