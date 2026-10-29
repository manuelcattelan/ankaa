import { EmailError } from "#/email-error.ts";

/**
 * Maps a failed request to Resend, whether its promise rejected or Resend
 * answered with an error, to an `EmailError` that keeps the failure as its
 * cause.
 */
export function buildEmailError({ cause }: { cause: unknown }) {
  return new EmailError({ cause, message: "A request to Resend failed" });
}
