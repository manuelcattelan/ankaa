import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import { Resend } from "resend";

import { EmailError } from "./error.ts";

export type SendEmailOptions = {
  subject: string;
  text: string;
  to: string;
};

export class Email extends Context.Service<Email>()("@ankaa/email/Email", {
  make: Effect.gen(function* () {
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
      const sendEmailErrorMessage = `Failed to send email with subject "${subject}"`;

      const sendEmailResponse = yield* Effect.tryPromise({
        catch: (cause) =>
          new EmailError({ cause, message: sendEmailErrorMessage }),
        try: () =>
          resend.emails.send({ from: resendEmailFrom, subject, text, to }),
      });

      if (sendEmailResponse.error) {
        return yield* new EmailError({
          cause: sendEmailResponse.error,
          message: sendEmailErrorMessage,
        });
      }
    });

    return { send };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);

  static readonly layerTest = (sentEmails: SendEmailOptions[]) =>
    Layer.succeed(this, {
      send: (sendEmailOptions: SendEmailOptions) =>
        Effect.sync(() => {
          sentEmails.push(sendEmailOptions);

          return undefined;
        }),
    });
}
