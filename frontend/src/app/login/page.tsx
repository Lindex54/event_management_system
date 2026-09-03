import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In | Evently",
  description: "Sign in to your Evently account.",
};

export default function LoginPage() {
  return <AuthLayout><LoginForm /></AuthLayout>;
}
