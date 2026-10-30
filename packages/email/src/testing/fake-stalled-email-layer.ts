import * as Effect from "effect/Effect";
import { constVoid } from "effect/Function";
import * as Layer from "effect/Layer";

import type { SentEmail } from "#/testing/fake-email-layer.ts";

import { Email } from "#/email.ts";
import { buildFakeResend } from "#/testing/build-fake-resend.ts";

/**
 * Records each email it's asked to send, then never finishes sending it, like
 * a provider that doesn't answer, so a test shows that nothing waits for it.
 */
export function fakeStalledEmailLayer(sentEmails: SentEmail[]) {
  return Layer.sync(Email, () => {
    const resend = buildFakeResend({
      send: (sentEmail) => {
        sentEmails.push(sentEmail);

        return new Promise(constVoid);
      },
    });

    return Email.of({
      request: (call) =>
        Effect.promise(() =>
          call({ from: "Ankaa <ankaa@example.com>", resend }),
        ).pipe(Effect.andThen(Effect.never)),
    });
  });
}
