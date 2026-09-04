import "dotenv/config";

import nodemailer, { type Transporter } from "nodemailer";

function requiredEnvironmentValue(name: "MAIL_USER" | "MAIL_PASSWORD" | "MAIL_FROM_ADDRESS"): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const port = Number(process.env.MAIL_PORT ?? "465");
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("MAIL_PORT must be a valid TCP port number");
}

export const mailConfig = {
  host: process.env.MAIL_HOST ?? "smtp.gmail.com",
  port,
  secure: (process.env.MAIL_SECURE ?? "true") !== "false",
  user: requiredEnvironmentValue("MAIL_USER"),
  password: requiredEnvironmentValue("MAIL_PASSWORD"),
  fromName: process.env.MAIL_FROM_NAME ?? "Event Management System",
  fromAddress: requiredEnvironmentValue("MAIL_FROM_ADDRESS"),
};

export const mailFrom = `"${mailConfig.fromName}" <${mailConfig.fromAddress}>`;

export const mailTransporter: Transporter = nodemailer.createTransport({
  host: mailConfig.host,
  port: mailConfig.port,
  secure: mailConfig.secure,
  auth: {
    user: mailConfig.user,
    pass: mailConfig.password,
  },
});
