import type { Email } from "@ankaa/email/email";

import { testAuthenticationLayer } from "@ankaa/authentication/testing/test-authentication-layer";
import { Database } from "@ankaa/database/database";
import { testDatabaseLayer } from "@ankaa/database/testing/test-database-layer";
import { fakeEmailLayer } from "@ankaa/email/testing/fake-email-layer";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as ManagedRuntime from "effect/ManagedRuntime";

import { ExerciseApplicationService } from "#/features/exercise/exercise-application-service.ts";
import { RoutineApplicationService } from "#/features/routine/routine-application-service.ts";
import { WorkoutApplicationService } from "#/features/workout/workout-application-service.ts";
import { pinoBridge } from "#/shared/pino-bridge.ts";

export type TestRuntime = ReturnType<typeof createTestRuntime>;

const TEST_SETTINGS = {
  APPLE_APP_BUNDLE_IDENTIFIER: "test.apple.app.bundle.identifier",
  BETTER_AUTH_SECRET: "test-better-auth-secret-32-chars",
  BETTER_AUTH_URL: "http://localhost:3000",
  GOOGLE_IOS_CLIENT_ID: "test-google-ios-client-id",
  GOOGLE_WEB_CLIENT_ID: "test-google-web-client-id",
  NODE_ENV: "test",
};

export function createTestRuntime(
  emailLayer: Layer.Layer<Email> = fakeEmailLayer([]),
) {
  return ManagedRuntime.make(
    Layer.mergeAll(
      testAuthenticationLayer.pipe(Layer.provideMerge(emailLayer)),
      Database.layer,
      ExerciseApplicationService.layer,
      RoutineApplicationService.layer,
      WorkoutApplicationService.layer,
      Logger.layer([pinoBridge]),
    ).pipe(
      Layer.provideMerge(testDatabaseLayer),
      Layer.provideMerge(
        ConfigProvider.layer(ConfigProvider.fromUnknown(TEST_SETTINGS)),
      ),
    ),
  );
}
