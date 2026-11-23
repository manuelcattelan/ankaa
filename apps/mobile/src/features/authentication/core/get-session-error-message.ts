import * as Schema from "effect/Schema";

import { SHARED_MESSAGES } from "#/shared/messages/shared-messages.ts";

const hasHttpStatus = Schema.is(Schema.Struct({ status: Schema.Number }));

/**
 * Takes only what it reads from a session, because better-auth types a
 * session error as a `BetterFetchError` that it never creates: an HTTP error
 * arrives as a plain object with its `status`, and a request that never
 * reached the server arrives as the `TypeError` that `fetch` threw
 * (`better-auth/dist/client/query.mjs`).
 */
export function getSessionErrorMessage(authenticationSession: {
  data: unknown;
  error: null | object;
}) {
  if (
    authenticationSession.error === null ||
    authenticationSession.data !== null ||
    hasHttpStatus(authenticationSession.error)
  ) {
    return null;
  }

  return SHARED_MESSAGES.serverUnreachableError;
}
