import { AUTHORIZATION_CODE_HEADER_NAME } from "@ankaa/core/features/authentication/constants/authorization-code-header-name";

/**
 * Sends the server the authorization code of an Apple or Google sign-in, which
 * it exchanges for the refresh token that it revokes when the Account is
 * deleted, and sends nothing when the provider gave no code.
 */
export function addAuthorizationCodeHeader<TFetchOptions extends object>({
  authorizationCode,
  fetchOptions,
}: {
  authorizationCode: null | string;
  fetchOptions: TFetchOptions;
}) {
  if (authorizationCode === null || authorizationCode === "") {
    return fetchOptions;
  }

  return {
    ...fetchOptions,
    headers: { [AUTHORIZATION_CODE_HEADER_NAME]: authorizationCode },
  };
}
