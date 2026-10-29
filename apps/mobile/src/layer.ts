import * as Cause from "effect/Cause";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";

import { AuthenticationApplicationService } from "#/features/authentication/authentication-application-service.ts";
import { AppleSignIn } from "#/features/authentication/services/apple-sign-in.ts";
import { GoogleSignIn } from "#/features/authentication/services/google-sign-in.ts";
import { RoutineApplicationService } from "#/features/routine/routine-application-service.ts";
import { ExerciseApplicationService } from "#/shared/exercise-application-service.ts";
import { Accessibility } from "#/shared/services/accessibility.ts";
import { AuthenticationClient } from "#/shared/services/authentication-client.ts";
import { Crypto } from "#/shared/services/crypto.ts";
import { TrpcClient } from "#/shared/services/trpc-client.ts";

export type ApplicationRuntime = ManagedRuntime.ManagedRuntime<
  Layer.Success<typeof applicationLayer>,
  Layer.Error<typeof applicationLayer>
>;

export const applicationLayer = Layer.mergeAll(
  Accessibility.layer,
  AppleSignIn.layer,
  AuthenticationApplicationService.layer,
  AuthenticationClient.layer,
  Crypto.layer,
  ExerciseApplicationService.layer,
  GoogleSignIn.layer,
  RoutineApplicationService.layer,
  TrpcClient.layer,
).pipe(
  Layer.provide(
    ConfigProvider.layer(
      ConfigProvider.fromUnknown({
        EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
        EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID:
          process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:
          process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      }),
    ),
  ),
);

export function createRuntime<TServices, TError>(
  layer: Layer.Layer<TServices, TError>,
) {
  const runtime = ManagedRuntime.make(layer);

  const runtimeContextExit = runtime.runSyncExit(runtime.contextEffect);

  if (Exit.isFailure(runtimeContextExit)) {
    throw new Error(Cause.pretty(runtimeContextExit.cause));
  }

  return runtime;
}
