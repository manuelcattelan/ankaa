import * as Data from "effect/Data";

type AuthenticationErrorFields = {
  readonly cause?: unknown;
  readonly code?: string;
  readonly message?: string;
  readonly retryAfterSeconds?: number;
  readonly status?: number;
};

export class AuthenticationError extends Data.TaggedError(
  "AuthenticationError",
)<AuthenticationErrorFields> {}
