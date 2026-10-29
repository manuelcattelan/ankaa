import * as Schema from "effect/Schema";

/**
 * The server can't be reached. A failed response maps to an error of its own
 * through `getAuthenticationResponseError` instead.
 */
export class AuthenticationClientError extends Schema.TaggedError<AuthenticationClientError>()(
  "AuthenticationClientError",
  { cause: Schema.Defect() },
) {}
