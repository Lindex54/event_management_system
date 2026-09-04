/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { CheckCircle2, Circle, Clock, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api/config";

const requirements = [
  { key: "length", label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { key: "upper", label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { key: "lower", label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { key: "number", label: "One number", test: (v: string) => /[0-9]/.test(v) },
  { key: "special", label: "One special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [checking, setChecking] = React.useState(true);
  const [account, setAccount] = React.useState<{ name: string; email: string } | null>(null);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [pendingMessage, setPendingMessage] = React.useState("");

  React.useEffect(() => {
    if (!token) { setChecking(false); return; }
    void fetch(`${API_BASE_URL}/api/auth/password/reset?token=${encodeURIComponent(token)}`)
      .then((response) => response.json())
      .then((result) => { if (result.success) setAccount(result.data); })
      .catch(() => undefined)
      .finally(() => setChecking(false));
  }, [token]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requirements.every((rule) => rule.test(password))) { setError("Password does not meet all requirements."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/password/reset`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) { setError(result.message ?? "Unable to reset your password."); return; }
      if (result.pending) { setPendingMessage(result.message); return; }
      toast.success("Password reset. You're signed in.");
      router.replace(result.data?.redirectTo ?? "/login");
      router.refresh();
    } catch {
      toast.error("The authentication server is unavailable.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return <p className="text-center text-sm text-text-secondary">Verifying your reset link...</p>;
  }

  if (pendingMessage) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="text-center">
        <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-warning/10 text-amber-600 dark:text-amber-400"><Clock /></span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-text-primary">Awaiting approval</h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">{pendingMessage}</p>
        <Button asChild variant="outline" className="mt-6"><Link href="/login">Go to sign in</Link></Button>
      </motion.div>
    );
  }

  if (!token || !account) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="text-center">
        <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-danger/10 text-danger"><ShieldAlert /></span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-text-primary">Reset link invalid</h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">This reset link is invalid, expired, or has already been used.</p>
        <Button asChild className="mt-6"><Link href="/forgot-password">Request a new link</Link></Button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      <p className="text-sm font-semibold text-primary">Evently</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Hi {account.name}, reset your password</h1>
      <p className="mt-3 text-sm leading-6 text-text-secondary">Choose a new password for {account.email}.</p>

      <form onSubmit={submit} noValidate className="mt-8 space-y-5">
        <PasswordField id="reset-password" label="New Password" value={password} onChange={(value) => { setPassword(value); setError(""); }} autoComplete="new-password" placeholder="Create a strong password" />

        <ul className="grid gap-1.5 sm:grid-cols-2">
          {requirements.map((rule) => {
            const met = rule.test(password);
            return (
              <li key={rule.key} className={`flex items-center gap-2 text-xs ${met ? "text-success" : "text-text-secondary"}`}>
                {met ? <CheckCircle2 className="size-3.5" /> : <Circle className="size-3.5" />}
                {rule.label}
              </li>
            );
          })}
        </ul>

        <PasswordField id="reset-confirm-password" label="Confirm Password" value={confirmPassword} onChange={(value) => { setConfirmPassword(value); setError(""); }} autoComplete="new-password" placeholder="Repeat your password" />

        {error && <p className="text-xs text-danger" role="alert">{error}</p>}

        <Button type="submit" disabled={loading} className="h-11 w-full bg-primary font-semibold hover:bg-primary-dark">
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </motion.div>
  );
}
