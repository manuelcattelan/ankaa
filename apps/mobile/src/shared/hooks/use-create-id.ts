import * as Effect from "effect/Effect";

import { useRuntime } from "#/shared/hooks/use-runtime.ts";
import { Crypto } from "#/shared/services/crypto.ts";

const program = Effect.fn("createId")(function* () {
  const crypto = yield* Crypto;

  return yield* crypto.createId();
});

/**
 * Gives a function that creates the id of a new row, for an event handler to
 * call.
 */
export function useCreateId() {
  const runtime = useRuntime();

  return () => runtime.runSync(program());
}
