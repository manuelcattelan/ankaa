import * as Match from "effect/Match";

import type { WireError } from "#/trpc/wire-error-schema.ts";

export function getWireErrorCode(wireError: WireError) {
  return Match.valueTags(wireError, {});
}
