import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { GooglePlayServicesMissingError } from "#/features/authentication/errors/google-play-services-missing-error.ts";
import { GoogleSignInInProgressError } from "#/features/authentication/errors/google-sign-in-in-progress-error.ts";

export class GoogleSignIn extends Context.Service<GoogleSignIn>()(
  "@ankaa/mobile/features/authentication/services/GoogleSignIn",
  {
    make: Effect.gen(function* () {
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

      return { checkPlayServices, signIn };
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make);
}

function failWithGoogleSignInError(defect: unknown) {
  const googleSignInError = getGoogleSignInError(defect);

  return googleSignInError
    ? Effect.fail(googleSignInError)
    : Effect.die(defect);
}

function getGoogleSignInError(defect: unknown) {
  if (!isErrorWithCode(defect)) {
    return undefined;
  }

  if (defect.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    return new GooglePlayServicesMissingError();
  }

  if (defect.code === statusCodes.IN_PROGRESS) {
    return new GoogleSignInInProgressError();
  }

  return undefined;
}
