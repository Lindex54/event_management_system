import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/auth-layout";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create Account | Evently",
  description: "Create an attendee account to discover and register for events.",
};

export default function SignupPage() {
  return <AuthLayout><SignupForm /></AuthLayout>;
}
