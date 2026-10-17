import * as Effect from "effect/Effect";

import { AppleSignIn } from "@/features/authentication/services/apple-sign-in";

export const checkAppleSignInAvailability = Effect.fn(
  "checkAppleSignInAvailability",
)(function* () {
  const appleSignIn = yield* AppleSignIn;

  return yield* appleSignIn.checkAvailability();
});
