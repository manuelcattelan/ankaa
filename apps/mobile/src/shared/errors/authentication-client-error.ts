import * as Data from "effect/Data";

type AuthenticationClientErrorFields = {
  readonly cause?: unknown;
  readonly code?: string;
  readonly message?: string;
  readonly retryAfterSeconds?: number;
  readonly status?: number;
};

export class AuthenticationClientError extends Data.TaggedError(
  "AuthenticationClientError",
)<AuthenticationClientErrorFields> {}
