import type { SignInResponse } from "@react-native-google-signin/google-signin";

import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import type { GooglePlayServicesMissingError } from "#/features/authentication/errors/google-play-services-missing-error.ts";
import type { GoogleSignInInProgressError } from "#/features/authentication/errors/google-sign-in-in-progress-error.ts";

import { getGoogleSignInError } from "#/features/authentication/core/get-google-sign-in-error.ts";

export class GoogleSignIn extends Context.Service<
  GoogleSignIn,
  {
    readonly checkPlayServices: () => Effect.Effect<
      boolean,
      GooglePlayServicesMissingError | GoogleSignInInProgressError
    >;
    readonly signIn: () => Effect.Effect<
      SignInResponse,
      GooglePlayServicesMissingError | GoogleSignInInProgressError
    >;
    readonly signOut: () => Effect.Effect<void>;
  }
>()("@ankaa/mobile/features/authentication/services/GoogleSignIn") {
  static readonly layer = Layer.effect(
    GoogleSignIn,
    Effect.gen(function* () {
      const googleSignInConfiguration = yield* Config.all({
        iosClientId: Config.NonEmptyString("EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID"),
        webClientId: Config.NonEmptyString("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID"),
      });

      GoogleSignin.configure(googleSignInConfiguration);

      function checkPlayServices() {
        return Effect.promise(() => GoogleSignin.hasPlayServices()).pipe(
          Effect.catchDefect(failWithGoogleSignInError),
        );
      }

      function signIn() {
        return Effect.promise(() => GoogleSignin.signIn()).pipe(
          Effect.catchDefect(failWithGoogleSignInError),
        );
      }

      function signOut() {
        return Effect.promise(() => GoogleSignin.signOut());
      }

      return GoogleSignIn.of({ checkPlayServices, signIn, signOut });
    }),
  );
}

function failWithGoogleSignInError(defect: unknown) {
  const googleSignInError = getGoogleSignInError({
    defect,
    inProgressCode: statusCodes.IN_PROGRESS,
    playServicesNotAvailableCode: statusCodes.PLAY_SERVICES_NOT_AVAILABLE,
  });

  return googleSignInError === null
    ? Effect.die(defect)
    : Effect.fail(googleSignInError);
}
