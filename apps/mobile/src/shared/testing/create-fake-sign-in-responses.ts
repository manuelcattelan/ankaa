import { convertUndefinedToNull } from "#/shared/core/convert-undefined-to-null.ts";
import { signedInSession } from "#/shared/testing/signed-in-session.ts";

const signedInSessionCookie = `better-auth.session_token=${signedInSession.session.token}; Path=/; HttpOnly`;

export function createFakeSignInResponses(signInPath: string) {
  let currentSession: typeof signedInSession | undefined;

  return {
    "/get-session": () => Response.json(convertUndefinedToNull(currentSession)),
    [signInPath]: () => {
      currentSession = signedInSession;

      return Response.json(
        { token: signedInSession.session.token, user: signedInSession.user },
        { headers: { "Set-Cookie": signedInSessionCookie } },
      );
    },
  };
}
