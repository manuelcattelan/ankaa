import * as Effect from "effect/Effect";

import { useRuntime } from "#/shared/hooks/use-runtime.ts";
import { Accessibility } from "#/shared/services/accessibility.ts";

const program = Effect.fn("announceMessage")(function* (message: string) {
  const accessibility = yield* Accessibility;

  yield* accessibility.announceMessage(message);
});

/**
 * Gives a function that announces a message to the screen reader, for an
 * event handler, a mutation callback or a React effect to call.
 */
export function useAnnounceMessage() {
  const runtime = useRuntime();

  return (message: string) => {
    runtime.runSync(program(message));
  };
}
