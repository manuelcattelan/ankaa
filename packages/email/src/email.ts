import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import { Resend } from "resend";

import type { EmailError } from "#/email-error.ts";

import { buildEmailError } from "#/core/build-email-error.ts";

export type SendEmailOptions = {
  subject: string;
  text: string;
  to: string;
};

export class Email extends Context.Service<
  Email,
  {
    readonly send: (
      options: SendEmailOptions,
    ) => Effect.Effect<void, EmailError>;
  }
>()("@ankaa/email/Email") {
  static readonly layer = Layer.effect(
    Email,
    Effect.gen(function* () {
      const resendApiKey = yield* Config.schema(
        Schema.Redacted(Schema.NonEmptyString),
        "RESEND_API_KEY",
      );
      const resendEmailFrom = yield* Config.NonEmptyString("RESEND_EMAIL_FROM");

      const resend = new Resend(Redacted.value(resendApiKey));

      const send = Effect.fn("Email.send")(function* ({
        subject,
        text,
        to,
      }: SendEmailOptions) {
        const sendEmailResponse = yield* Effect.tryPromise({
          catch: (cause) => buildEmailError({ cause, subject }),
          try: () =>
            resend.emails.send({ from: resendEmailFrom, subject, text, to }),
        });

        if (sendEmailResponse.error) {
          return yield* buildEmailError({
            cause: sendEmailResponse.error,
            subject,
          });
        }
      }, Effect.asVoid);

      return Email.of({ send });
    }),
  );
}
