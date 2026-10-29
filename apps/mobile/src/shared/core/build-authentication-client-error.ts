import { AuthenticationClientError } from "#/shared/errors/authentication-client-error.ts";

export type AuthenticationResponseError = {
  code?: string | undefined;
  message?: string | undefined;
  status: number;
  statusText: string;
};

type BuildAuthenticationClientErrorOptions = {
  error: AuthenticationResponseError;
  retryAfterHeader: null | string;
};

/**
 * Maps the error that better-auth's client returns for a failed response to
 * an `AuthenticationClientError`.
 */
export function buildAuthenticationClientError({
  error,
  retryAfterHeader,
}: BuildAuthenticationClientErrorOptions) {
  return new AuthenticationClientError({
    cause: null,
    code: error.code ?? null,
    message: error.message ?? error.statusText,
    retryAfterSeconds: retryAfterHeader ? Number(retryAfterHeader) : null,
    status: error.status,
  });
}
