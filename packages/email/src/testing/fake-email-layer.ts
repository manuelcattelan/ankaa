import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import type { SendEmailOptions } from "#/email.ts";

import { Email } from "#/email.ts";

export function fakeEmailLayer(sentEmails: SendEmailOptions[]) {
  return Layer.succeed(
    Email,
    Email.of({
      send: (sendEmailOptions: SendEmailOptions) =>
        Effect.sync(() => {
          sentEmails.push(sendEmailOptions);
        }),
    }),
  );
}
