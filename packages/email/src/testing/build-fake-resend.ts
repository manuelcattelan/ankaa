import { Resend } from "resend";

/**
 * Builds a Resend client whose `emails.send` is `send`, since the client
 * takes no transport of its own to fake.
 */
export function buildFakeResend({ send }: { send: Resend["emails"]["send"] }) {
  const resend = new Resend("re_fake");

  resend.emails.send = send;

  return resend;
}
