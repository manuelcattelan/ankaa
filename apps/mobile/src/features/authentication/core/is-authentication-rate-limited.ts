import { HTTP_STATUS_TOO_MANY_REQUESTS } from "#/features/authentication/constants/http-status-too-many-requests.ts";
import { AuthenticationError } from "#/shared/errors/authentication-error.ts";

type RateLimitedAuthenticationError = AuthenticationError &
  RateLimitedAuthenticationErrorStatus;

type RateLimitedAuthenticationErrorStatus = {
  readonly status: typeof HTTP_STATUS_TOO_MANY_REQUESTS;
};

export function isAuthenticationRateLimited(
  error: unknown,
): error is RateLimitedAuthenticationError {
  return (
    error instanceof AuthenticationError &&
    error.status === HTTP_STATUS_TOO_MANY_REQUESTS
  );
}
