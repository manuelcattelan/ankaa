import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import { Resend } from "resend";

import type { EmailError } from "#/email-error.ts";

import { buildEmailError } from "#/build-email-error.ts";

/**
 * A call to the Resend client, given the client and the sender address that
 * the `RESEND_EMAIL_FROM` setting holds.
 */
export type ResendCall<TData> = (client: {
  from: string;
  resend: Resend;
}) => Promise<{ data: null; error: object } | { data: TData; error: null }>;

export class Email extends Context.Service<
  Email,
  {
    readonly request: <TData>(
      call: ResendCall<TData>,
    ) => Effect.Effect<TData, EmailError>;
  }
>()("@ankaa/email/Email") {
  static readonly layer = Layer.effect(
    Email,
    Effect.gen(function* () {
      const resendApiKey = yield* Config.schema(
        Schema.Redacted(Schema.NonEmptyString),
        "RESEND_API_KEY",
      );
      const from = yield* Config.NonEmptyString("RESEND_EMAIL_FROM");

      const resend = new Resend(Redacted.value(resendApiKey));

      function request<TData>(call: ResendCall<TData>) {
        return Effect.tryPromise({
          catch: (cause) => buildEmailError({ cause }),
          try: () => call({ from, resend }),
        }).pipe(
          Effect.flatMap((response) =>
            response.error === null
              ? Effect.succeed(response.data)
              : Effect.fail(buildEmailError({ cause: response.error })),
          ),
        );
      }

      return Email.of({ request });
    }),
  );
}
