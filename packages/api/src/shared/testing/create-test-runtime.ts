import type { Email } from "@ankaa/email/email";
import type * as HttpClient from "effect/http/HttpClient";

import { fakeSocialProviderHttpClientLayer } from "@ankaa/authentication/testing/fake-social-provider-http-client-layer";
import { TEST_APPLE_PRIVATE_KEY } from "@ankaa/authentication/testing/test-apple-private-key";
import { testAuthenticationLayer } from "@ankaa/authentication/testing/test-authentication-layer";
import { Database } from "@ankaa/database/database";
import { testDatabaseLayer } from "@ankaa/database/testing/test-database-layer";
import { fakeEmailLayer } from "@ankaa/email/testing/fake-email-layer";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as ManagedRuntime from "effect/ManagedRuntime";

import { applicationServicesLayer } from "#/application-services-layer.ts";
import { pinoBridge } from "#/shared/pino-bridge.ts";

export type TestRuntime = ReturnType<typeof createTestRuntime>;

const TEST_SETTINGS = {
  APPLE_APP_BUNDLE_ID: "test.apple.app.bundle.identifier",
  APPLE_KEY_ID: "TESTKEY123",
  APPLE_PRIVATE_KEY: TEST_APPLE_PRIVATE_KEY,
  APPLE_TEAM_ID: "TESTTEAM12",
  BETTER_AUTH_SECRET: "test-better-auth-secret-32-chars",
  BETTER_AUTH_URL: "http://localhost:3000",
  GOOGLE_CLIENT_SECRET: "test-google-client-secret",
  GOOGLE_IOS_CLIENT_ID: "test-google-ios-client-id",
  GOOGLE_WEB_CLIENT_ID: "test-google-web-client-id",
  NODE_ENV: "test",
};

export function createTestRuntime({
  emailLayer = fakeEmailLayer([]),
  socialProviderHttpClientLayer = fakeSocialProviderHttpClientLayer({}),
}: {
  emailLayer?: Layer.Layer<Email>;
  socialProviderHttpClientLayer?: Layer.Layer<HttpClient.HttpClient>;
} = {}) {
  return ManagedRuntime.make(
    Layer.mergeAll(
      testAuthenticationLayer.pipe(
        Layer.provideMerge(emailLayer),
        Layer.provide(socialProviderHttpClientLayer),
      ),
      Database.layer,
      applicationServicesLayer,
      Logger.layer([pinoBridge]),
    ).pipe(
      Layer.provideMerge(testDatabaseLayer),
      Layer.provideMerge(
        ConfigProvider.layer(ConfigProvider.fromUnknown(TEST_SETTINGS)),
      ),
    ),
  );
}
