import { signedInSession } from "#/shared/testing/signed-in-session.ts";

const signedInSessionCookie = `better-auth.session_token=${signedInSession.session.token}; Path=/; HttpOnly`;

/**
 * Answers `signInPath` by signing the User in, and records each request to it
 * into `receivedSignInRequests`. Like the server, `/get-session` answers with
 * the session only while a request carries its cookie, which signing out
 * removes from the device.
 */
export function createFakeSignInResponses({
  receivedSignInRequests = [],
  signInPath,
}: {
  receivedSignInRequests?: Request[];
  signInPath: string;
}) {
  return {
    "/get-session": (request: Request) =>
      Response.json(
        request.headers
          .get("cookie")
          ?.includes(signedInSession.session.token) === true
          ? signedInSession
          : null,
      ),
    [signInPath]: (request: Request) => {
      receivedSignInRequests.push(request);

      return Response.json(
        { token: signedInSession.session.token, user: signedInSession.user },
        { headers: { "Set-Cookie": signedInSessionCookie } },
      );
    },
  };
}
