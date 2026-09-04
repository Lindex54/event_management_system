import "dotenv/config";

import { mailConfig } from "../config/mail";
import { sendEmail } from "../services/mail.service";

async function sendTestEmail(): Promise<void> {
  const to = process.argv[2] ?? mailConfig.user;

  try {
    await sendEmail({
      to,
      subject: "Event Management System - Test Email",
      text: "This is a test email confirming Gmail SMTP is configured correctly.",
      html: "<p>This is a test email confirming Gmail SMTP is configured correctly.</p>",
    });
    console.log(`Test email sent to ${to}`);
  } catch (error) {
    console.error("Failed to send test email:", error);
    process.exitCode = 1;
  }
}

void sendTestEmail();
