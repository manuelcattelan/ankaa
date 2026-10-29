import { EmailError } from "#/email-error.ts";

export function buildEmailError({
  cause,
  subject,
}: {
  cause: unknown;
  subject: string;
}) {
  return new EmailError({
    cause,
    message: `Failed to send email with subject "${subject}"`,
  });
}
