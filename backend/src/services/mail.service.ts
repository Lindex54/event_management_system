import type { SendMailOptions } from "nodemailer";

import { mailFrom, mailTransporter } from "../config/mail";

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: SendMailOptions["attachments"];
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const { to, subject, text, html, attachments } = options;
  if (!text && !html) throw new Error("sendEmail requires either text or html content");

  await mailTransporter.sendMail({
    from: mailFrom,
    to,
    subject,
    ...(text !== undefined ? { text } : {}),
    ...(html !== undefined ? { html } : {}),
    ...(attachments !== undefined ? { attachments } : {}),
  });
}
