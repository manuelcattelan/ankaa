import { AuthenticationClient } from "@/shared/services/authentication-client";
import { signedInSession } from "@/shared/testing/signed-in-session";

export const signedInAuthenticationClientLayer = AuthenticationClient.layerTest(
  { "/get-session": () => Response.json(signedInSession) },
);
