import * as Effect from "effect/Effect";

import { Crypto } from "#/shared/services/crypto.ts";

export const createId = Effect.fn("createId")(function* () {
  const crypto = yield* Crypto;

  return yield* crypto.createId();
});
