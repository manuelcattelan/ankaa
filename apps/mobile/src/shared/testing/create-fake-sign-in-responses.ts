import { signedInSession } from "#/shared/testing/signed-in-session.ts";

const signedInSessionCookie = `better-auth.session_token=${signedInSession.session.token}; Path=/; HttpOnly`;

export function createFakeSignInResponses(signInPath: string) {
  let currentSession: null | typeof signedInSession = null;

  return {
    "/get-session": () => Response.json(currentSession),
    [signInPath]: () => {
      currentSession = signedInSession;

      return Response.json(
        { token: signedInSession.session.token, user: signedInSession.user },
        { headers: { "Set-Cookie": signedInSessionCookie } },
      );
    },
  };
}
