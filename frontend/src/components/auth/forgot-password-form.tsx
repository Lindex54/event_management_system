"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/lib/api/config";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!emailPattern.test(email.trim())) { setError("Enter a valid email address."); return; }
    setLoading(true); setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/password/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) { setError(result.message ?? "Unable to send a reset link."); return; }
      setSent(true);
    } catch { setError("The authentication server is unavailable."); }
    finally { setLoading(false); }
  }

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }} className="text-center">
        <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><MailCheck /></span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-text-primary">Check your email</h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">If an account exists for <span className="font-medium text-text-primary">{email.trim()}</span>, we&apos;ve sent a link to reset your password. It expires in 24 hours and can only be used once.</p>
        <Button asChild variant="outline" className="mt-6"><Link href="/login">Back to sign in</Link></Button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      <p className="text-sm font-semibold text-primary">Evently</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Forgot your password?</h1>
      <p className="mt-3 text-sm leading-6 text-text-secondary">Enter the email on your account and we&apos;ll send you a link to reset your password.</p>

      <form onSubmit={submit} noValidate className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="forgot-email" className="font-semibold text-text-primary">Email Address</Label>
          <Input id="forgot-email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(""); }} placeholder="you@example.com" autoComplete="email" inputMode="email" className="h-11" />
        </div>
        {error && <p className="text-xs text-danger" role="alert">{error}</p>}
        <Button type="submit" disabled={loading} className="h-11 w-full bg-primary font-semibold hover:bg-primary-dark">
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-text-secondary">
        Remembered your password?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
      </p>
    </motion.div>
  );
}
