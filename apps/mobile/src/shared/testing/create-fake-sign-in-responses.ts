import { signedInSession } from "#/shared/testing/signed-in-session.ts";

const signedInSessionCookie = `better-auth.session_token=${signedInSession.session.token}; Path=/; HttpOnly`;

/**
 * Answers `signInPath` by signing the User in, and records each request to it
 * into `receivedSignInRequests`.
 */
export function createFakeSignInResponses({
  receivedSignInRequests = [],
  signInPath,
}: {
  receivedSignInRequests?: Request[];
  signInPath: string;
}) {
  let currentSession: null | typeof signedInSession = null;

  return {
    "/get-session": () => Response.json(currentSession),
    [signInPath]: (request: Request) => {
      receivedSignInRequests.push(request);
      currentSession = signedInSession;

      return Response.json(
        { token: signedInSession.session.token, user: signedInSession.user },
        { headers: { "Set-Cookie": signedInSessionCookie } },
      );
    },
  };
}
