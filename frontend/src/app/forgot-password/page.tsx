import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password | Evently",
  description: "Request a link to reset your Evently password.",
};

export default function ForgotPasswordPage() {
  return <AuthLayout><ForgotPasswordForm /></AuthLayout>;
}
