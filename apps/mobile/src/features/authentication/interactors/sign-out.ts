import * as Effect from "effect/Effect";

import { AuthenticationClient } from "#/shared/services/authentication-client.ts";

export const signOut = Effect.fn("signOut")(function* () {
  const authenticationClient = yield* AuthenticationClient;

  return yield* authenticationClient.request(({ authClient, fetchOptions }) =>
    authClient.signOut({ fetchOptions }),
  );
});
