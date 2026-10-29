import { AuthenticationClient } from "#/shared/services/authentication-client.ts";
import { signedInSession } from "#/shared/testing/signed-in-session.ts";

export const signedInAuthenticationClientLayer = AuthenticationClient.layerTest(
  { "/get-session": () => Response.json(signedInSession) },
);
