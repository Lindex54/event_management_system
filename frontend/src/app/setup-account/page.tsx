import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/auth-layout";
import { SetupAccountForm } from "@/components/auth/setup-account-form";

export const metadata: Metadata = {
  title: "Set Up Your Account | Evently",
  description: "Create your password to activate your Evently account.",
};

export default function SetupAccountPage() {
  return (
    <AuthLayout>
      <Suspense>
        <SetupAccountForm />
      </Suspense>
    </AuthLayout>
  );
}
