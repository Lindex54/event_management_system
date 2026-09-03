import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/auth-layout";
import { AdminLoginForm } from "@/components/auth/admin-login-form";

export const metadata: Metadata = {
  title: "Administrator Sign In | Evently",
  description: "Restricted sign-in portal for Evently system administrators.",
};

export default function AdminLoginPage() {
  return <AuthLayout><AdminLoginForm /></AuthLayout>;
}
