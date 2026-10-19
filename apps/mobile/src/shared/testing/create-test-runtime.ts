import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";

import { AppleSignIn } from "@/features/authentication/services/apple-sign-in";
import { GoogleSignIn } from "@/features/authentication/services/google-sign-in";
import { Notifications } from "@/features/workout/services/notifications";
import { WorkoutDocumentStorage } from "@/features/workout/services/workout-document-storage";
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
  notificationsLayer?: Layer.Layer<Notifications>;
  trpcClientLayer?: Layer.Layer<TrpcClient>;
  workoutDocumentStorageLayer?: Layer.Layer<WorkoutDocumentStorage>;
};

export function createTestRuntime({
  accessibilityLayer = Accessibility.layerTest([]),
  appleSignInLayer = AppleSignIn.layerTest({ isAvailable: false }),
  authenticationClientLayer = AuthenticationClient.layerTest({
    "/get-session": () =>
      new Response("null", {
        headers: { "Content-Type": "application/json" },
      }),
  }),
  cryptoLayer = Crypto.layerTest,
  googleSignInLayer = Layer.mock(GoogleSignIn, {}),
  notificationsLayer = Notifications.layerTest(new Map()),
  trpcClientLayer = TrpcClient.layerTest({}),
  workoutDocumentStorageLayer = WorkoutDocumentStorage.layerTest(new Map()),
}: TestRuntimeLayers) {
  const runtime = ManagedRuntime.make(
    Layer.mergeAll(
      accessibilityLayer,
      appleSignInLayer,
      authenticationClientLayer,
      cryptoLayer,
      googleSignInLayer,
      notificationsLayer,
      trpcClientLayer,
      workoutDocumentStorageLayer,
    ),
  );

  runtime.runSync(runtime.contextEffect);

  return runtime;
}
