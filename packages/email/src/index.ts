import { Resend } from "resend";

import { environment } from "./environment.ts";

type SendEmailOptions = {
  subject: string;
  text: string;
  to: string;
};

const resend = new Resend(environment.RESEND_API_KEY);

export async function sendEmail({ subject, text, to }: SendEmailOptions) {
  const result = await resend.emails.send({
    from: environment.RESEND_EMAIL_FROM,
    subject,
    text,
    to,
  });

  if (result.error) {
    console.error("Failed to send email", result.error);
  }
}
