import { AuthenticationClientError } from "#/shared/errors/authentication-client-error.ts";

export type AuthenticationResponseError = {
  code?: string | undefined;
  message?: string | undefined;
  status: number;
  statusText: string;
};

/**
 * Maps the error that better-auth's client returns for a failed response to
 * an `AuthenticationClientError`.
 */
export function buildAuthenticationClientError({
  error,
  retryAfterHeader,
}: {
  error: AuthenticationResponseError;
  retryAfterHeader: null | string;
}) {
  return new AuthenticationClientError({
    cause: null,
    code: error.code ?? null,
    message: error.message ?? error.statusText,
    retryAfterSeconds:
      retryAfterHeader === null || retryAfterHeader === ""
        ? null
        : Number(retryAfterHeader),
    status: error.status,
  });
}
