import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import type { SendEmailOptions } from "#/email.ts";

import { Email } from "#/email.ts";

/**
 * Records each email it's asked to send, then never finishes sending it, like
 * a provider that doesn't answer, so a test shows that nothing waits for it.
 */
export function fakeStalledEmailLayer(sentEmails: SendEmailOptions[]) {
  return Layer.succeed(
    Email,
    Email.of({
      send: (sendEmailOptions: SendEmailOptions) =>
        Effect.sync(() => {
          sentEmails.push(sendEmailOptions);
        }).pipe(Effect.andThen(Effect.never)),
    }),
  );
}
