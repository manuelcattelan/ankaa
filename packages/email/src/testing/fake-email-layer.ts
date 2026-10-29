import type { CreateEmailOptions } from "resend";

import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { Email } from "#/email.ts";
import { buildFakeResend } from "#/testing/build-fake-resend.ts";

export type SentEmail = CreateEmailOptions;

const FAKE_SENT_EMAIL_ID = "00000000-0000-7000-8000-000000000000";

/**
 * Runs each call against a Resend client that sends nothing, and records
 * each email it's asked to send into `sentEmails`.
 */
export function fakeEmailLayer(sentEmails: SentEmail[]) {
  return Layer.sync(Email, () => {
    const resend = buildFakeResend({
      send: (sentEmail) => {
        sentEmails.push(sentEmail);

        return Promise.resolve({
          data: { id: FAKE_SENT_EMAIL_ID },
          error: null,
          headers: null,
        });
      },
    });

    return Email.of({
      request: (call) =>
        Effect.promise(() =>
          call({ from: "Ankaa <ankaa@example.com>", resend }),
        ).pipe(
          Effect.flatMap((response) =>
            response.error === null
              ? Effect.succeed(response.data)
              : Effect.die(response.error),
          ),
        ),
    });
  });
}
