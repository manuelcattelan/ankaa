/**
 * Builds the identity token that better-auth's Apple sign-in takes, with the
 * User's name when Apple shares it, which it does only at the first sign-in.
 */
export function buildAppleIdToken({
  credential,
  identityToken,
  nonce,
}: {
  credential: {
    fullName: null | { familyName: null | string; givenName: null | string };
  };
  identityToken: string;
  nonce: string;
}) {
  const firstName = credential.fullName?.givenName ?? null;
  const lastName = credential.fullName?.familyName ?? null;
  const appleIdToken = { nonce, token: identityToken };

  if ((firstName ?? lastName ?? "") === "") {
    return appleIdToken;
  }

  return {
    ...appleIdToken,
    user: {
      name: {
        ...(firstName === null ? {} : { firstName }),
        ...(lastName === null ? {} : { lastName }),
      },
    },
  };
}
