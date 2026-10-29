import * as Data from "effect/Data";

type AuthenticationClientErrorFields = {
  readonly cause?: unknown;
  readonly code: null | string;
  readonly message?: string;
  readonly retryAfterSeconds: null | number;
  readonly status: null | number;
};

export class AuthenticationClientError extends Data.TaggedError(
  "AuthenticationClientError",
)<AuthenticationClientErrorFields> {}
