import * as Data from "effect/Data";

type AuthenticationErrorFields = {
  readonly cause: unknown;
};

export class AuthenticationError extends Data.TaggedError(
  "AuthenticationError",
)<AuthenticationErrorFields> {}
