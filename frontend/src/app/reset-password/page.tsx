import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password | Evently",
  description: "Choose a new password for your Evently account.",
};

export default function ResetPasswordPage() {
  return <AuthLayout><Suspense><ResetPasswordForm /></Suspense></AuthLayout>;
}
