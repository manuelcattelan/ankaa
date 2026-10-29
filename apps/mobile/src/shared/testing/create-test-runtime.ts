import * as Layer from "effect/Layer";

import { AppleSignIn } from "#/features/authentication/services/apple-sign-in.ts";
import { GoogleSignIn } from "#/features/authentication/services/google-sign-in.ts";
import { createRuntime } from "#/layer.ts";
import { ExerciseApplicationService } from "#/shared/exercise-application-service.ts";
import { Accessibility } from "#/shared/services/accessibility.ts";
import { AuthenticationClient } from "#/shared/services/authentication-client.ts";
import { Crypto } from "#/shared/services/crypto.ts";
import { TrpcClient } from "#/shared/services/trpc-client.ts";

export type TestRuntimeLayers = {
  accessibilityLayer?: Layer.Layer<Accessibility>;
  appleSignInLayer?: Layer.Layer<AppleSignIn>;
  authenticationClientLayer?: Layer.Layer<AuthenticationClient>;
  cryptoLayer?: Layer.Layer<Crypto>;
  googleSignInLayer?: Layer.Layer<GoogleSignIn>;
  trpcClientLayer?: Layer.Layer<TrpcClient, never, AuthenticationClient>;
};

export function createTestRuntime({
  accessibilityLayer = Accessibility.layerTest([]),
  appleSignInLayer = AppleSignIn.layerTest({ isAvailable: false }),
  authenticationClientLayer = AuthenticationClient.layerTest({}),
  cryptoLayer = Crypto.layerTest,
  googleSignInLayer = Layer.mock(GoogleSignIn, {}),
  trpcClientLayer = TrpcClient.layerTest({}),
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
