import { EmailError } from "#/email-error.ts";

type BuildEmailErrorOptions = {
  cause: unknown;
  subject: string;
};

export function buildEmailError({ cause, subject }: BuildEmailErrorOptions) {
  return new EmailError({
    cause,
    message: `Failed to send email with subject "${subject}"`,
  });
}
