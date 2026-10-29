import * as Layer from "effect/Layer";

import type { AppleSignIn } from "#/features/authentication/services/apple-sign-in.ts";
import type { Accessibility } from "#/shared/services/accessibility.ts";
import type { AuthenticationClient } from "#/shared/services/authentication-client.ts";
import type { TrpcClient } from "#/shared/services/trpc-client.ts";

import { GoogleSignIn } from "#/features/authentication/services/google-sign-in.ts";
import { fakeAppleSignInLayer } from "#/features/authentication/testing/fake-apple-sign-in-layer.ts";
import { createRuntime } from "#/layer.ts";
import { ExerciseApplicationService } from "#/shared/exercise-application-service.ts";
import { Crypto } from "#/shared/services/crypto.ts";
import { fakeAccessibilityLayer } from "#/shared/testing/fake-accessibility-layer.ts";
import { fakeAuthenticationClientLayer } from "#/shared/testing/fake-authentication-client-layer.ts";
import { fakeTrpcClientLayer } from "#/shared/testing/fake-trpc-client-layer.ts";

export type TestRuntimeLayers = {
  accessibilityLayer?: Layer.Layer<Accessibility>;
  appleSignInLayer?: Layer.Layer<AppleSignIn>;
  authenticationClientLayer?: Layer.Layer<AuthenticationClient>;
  cryptoLayer?: Layer.Layer<Crypto>;
  googleSignInLayer?: Layer.Layer<GoogleSignIn>;
  trpcClientLayer?: Layer.Layer<TrpcClient, never, AuthenticationClient>;
};

/**
 * Builds the app's Runtime from fakes that behave like an idle device, and
 * from `Layer.mock` for every Service that no default scenario reaches, so
 * an unexpected use fails loudly.
 */
export function createTestRuntime({
  accessibilityLayer = fakeAccessibilityLayer([]),
  appleSignInLayer = fakeAppleSignInLayer({ isAvailable: false }),
  authenticationClientLayer = fakeAuthenticationClientLayer({}),
  cryptoLayer = Layer.mock(Crypto, {}),
  googleSignInLayer = Layer.mock(GoogleSignIn, {}),
  trpcClientLayer = fakeTrpcClientLayer({}),
}: TestRuntimeLayers) {
  return createRuntime(
    Layer.mergeAll(
      accessibilityLayer,
      appleSignInLayer,
      cryptoLayer,
      googleSignInLayer,
      ExerciseApplicationService.layerNoDeps.pipe(
        Layer.provideMerge(trpcClientLayer),
      ),
    ).pipe(Layer.provideMerge(authenticationClientLayer)),
  );
}
