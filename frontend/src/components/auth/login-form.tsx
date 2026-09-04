"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/lib/api/config";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!email.trim()) nextErrors.email = "Email address is required.";
    else if (!emailPattern.test(email.trim())) nextErrors.email = "Enter a valid email address.";
    if (!password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), password }) });
      const result = await response.json();
      if (!response.ok || !result.success) { setErrors({ password: result.message ?? "Unable to sign in." }); return; }
      toast.success("Signed in successfully");
      const roles: string[] = result.data.roles ?? [];
      const destination = roles.includes("event-organizer")
        ? "/organizer"
        : roles.includes("event-staff")
        ? "/staff"
        : roles.includes("attendee")
        ? "/attendee"
        : "/home";
      router.replace(destination);
      router.refresh();
    } catch { setErrors({ password: "The authentication server is unavailable." }); }
    finally { setLoading(false); }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      <div>
        <p className="text-sm font-semibold text-primary">Welcome to Evently</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Welcome back</h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">Sign in to continue to your account.</p>
      </div>

      <form onSubmit={submit} noValidate className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="login-email" className="font-semibold text-text-primary">Email Address</Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => { setEmail(event.target.value); setErrors((current) => ({ ...current, email: undefined })); }}
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            className="h-11"
          />
          {errors.email && <p id="login-email-error" className="text-xs text-danger" role="alert">{errors.email}</p>}
        </div>

        <PasswordField
          id="login-password"
          label="Password"
          value={password}
          onChange={(value) => { setPassword(value); setErrors((current) => ({ ...current, password: undefined })); }}
          autoComplete="current-password"
          placeholder="Enter your password"
          error={errors.password}
        />

        <div className="flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
            <Checkbox checked={remember} onCheckedChange={(checked) => setRemember(checked === true)} aria-label="Remember me" />
            Remember me
          </label>
          <button type="button" onClick={() => toast.info("Password recovery will be connected to the backend.")} className="text-sm font-semibold text-primary hover:underline">
            Forgot password?
          </button>
        </div>

        <Button type="submit" disabled={loading} className="h-11 w-full bg-primary font-semibold hover:bg-primary-dark">
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">Create account</Link>
      </p>
    </motion.div>
  );
}
