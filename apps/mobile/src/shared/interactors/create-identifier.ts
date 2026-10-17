import * as Effect from "effect/Effect";

import { Crypto } from "@/shared/services/crypto";

export const createIdentifier = Effect.fn("createIdentifier")(function* () {
  const crypto = yield* Crypto;

  return yield* crypto.createIdentifier();
});
