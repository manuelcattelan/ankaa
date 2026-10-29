import * as Layer from "effect/Layer";

import type { Accessibility } from "#/shared/services/accessibility.ts";
import type { AuthenticationClient } from "#/shared/services/authentication-client.ts";
import type { Notifications } from "#/shared/services/notifications.ts";
import type { TrpcClient } from "#/shared/services/trpc-client.ts";

import { AuthenticationApplicationService } from "#/features/authentication/authentication-application-service.ts";
import { AppleSignIn } from "#/features/authentication/services/apple-sign-in.ts";
import { GoogleSignIn } from "#/features/authentication/services/google-sign-in.ts";
import { RoutineApplicationService } from "#/features/routine/routine-application-service.ts";
import { WorkoutApplicationService } from "#/features/workout/workout-application-service.ts";
import { createRuntime } from "#/layer.ts";
import { ExerciseApplicationService } from "#/shared/exercise-application-service.ts";
import { Crypto } from "#/shared/services/crypto.ts";
import { fakeAccessibilityLayer } from "#/shared/testing/fake-accessibility-layer.ts";
import { fakeAuthenticationClientLayer } from "#/shared/testing/fake-authentication-client-layer.ts";
import { fakeNotificationsLayer } from "#/shared/testing/fake-notifications-layer.ts";
import { fakeTrpcClientLayer } from "#/shared/testing/fake-trpc-client-layer.ts";

export type TestRuntimeLayers = {
  accessibility?: Layer.Layer<Accessibility>;
  appleSignIn?: Layer.Layer<AppleSignIn>;
  authenticationClient?: Layer.Layer<AuthenticationClient>;
  crypto?: Layer.Layer<Crypto>;
  googleSignIn?: Layer.Layer<GoogleSignIn>;
  notifications?: Layer.Layer<Notifications>;
  trpcClient?: Layer.Layer<TrpcClient, never, AuthenticationClient>;
};

/**
 * Builds the app's Runtime from fakes that behave like an idle device, and
 * from `Layer.mock` for every Service that no default scenario reaches, so
 * an unexpected use fails loudly.
 */
export function createTestRuntime(layers: TestRuntimeLayers) {
  return createRuntime(
    Layer.mergeAll(
      layers.accessibility ?? fakeAccessibilityLayer([]),
      AuthenticationApplicationService.layerNoDeps.pipe(
        Layer.provideMerge(
          Layer.mergeAll(
            layers.appleSignIn ?? Layer.mock(AppleSignIn, {}),
            layers.crypto ?? Layer.mock(Crypto, {}),
            layers.googleSignIn ?? Layer.mock(GoogleSignIn, {}),
          ),
        ),
      ),
      Layer.mergeAll(
        ExerciseApplicationService.layerNoDeps,
        RoutineApplicationService.layerNoDeps,
        WorkoutApplicationService.layerNoDeps,
      ).pipe(Layer.provideMerge(layers.trpcClient ?? fakeTrpcClientLayer({}))),
    ).pipe(
      Layer.provideMerge(
        Layer.mergeAll(
          layers.authenticationClient ?? fakeAuthenticationClientLayer({}),
          layers.notifications ?? fakeNotificationsLayer({}),
        ),
      ),
    ),
  );
}
