import { HTTP_STATUS_TOO_MANY_REQUESTS } from "#/features/authentication/constants/http-status-too-many-requests.ts";
import { AuthenticationClientError } from "#/shared/errors/authentication-client-error.ts";

type RateLimitedAuthenticationClientError = AuthenticationClientError &
  RateLimitedAuthenticationClientErrorStatus;

type RateLimitedAuthenticationClientErrorStatus = {
  readonly status: typeof HTTP_STATUS_TOO_MANY_REQUESTS;
};

export function isAuthenticationRateLimited(
  error: unknown,
): error is RateLimitedAuthenticationClientError {
  return (
    error instanceof AuthenticationClientError &&
    error.status === HTTP_STATUS_TOO_MANY_REQUESTS
  );
}
