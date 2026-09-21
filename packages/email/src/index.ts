import { Resend } from "resend";

import { env } from "./env.ts";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendEmail({
  subject,
  text,
  to,
}: {
  subject: string;
  text: string;
  to: string;
}): Promise<void> {
  const { error } = await resend.emails.send({
    from: env.RESEND_EMAIL_FROM,
    subject,
    text,
    to,
  });
  if (error) {
    console.error("Failed to send email:", error);
  }
}
