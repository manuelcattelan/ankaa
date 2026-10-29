import * as Layer from "effect/Layer";

import { AppleSignIn } from "@/features/authentication/services/apple-sign-in";
import { GoogleSignIn } from "@/features/authentication/services/google-sign-in";
import { createRuntime } from "@/layer";
import { Accessibility } from "@/shared/services/accessibility";
import { AuthenticationClient } from "@/shared/services/authentication-client";
import { Crypto } from "@/shared/services/crypto";
import { TrpcClient } from "@/shared/services/trpc-client";

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
      trpcClientLayer,
    ).pipe(Layer.provideMerge(authenticationClientLayer)),
  );
}
