import { fakeAuthenticationClientLayer } from "#/shared/testing/fake-authentication-client-layer.ts";
import { signedInSession } from "#/shared/testing/signed-in-session.ts";

export const fakeSignedInAuthenticationClientLayer =
  fakeAuthenticationClientLayer({
    "/get-session": () => Response.json(signedInSession),
  });
