"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/lib/api/config";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<{ username?: string; password?: string }>({});
  const [locked, setLocked] = React.useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!username.trim()) nextErrors.username = "Username is required.";
    if (!password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true); setLocked(false);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const result = await response.json() as { success: boolean; message?: string; locked?: boolean };
      if (!response.ok || !result.success) {
        if (result.locked) { setLocked(true); return; }
        setErrors({ password: result.message ?? "Invalid administrator credentials." });
        return;
      }
      toast.success("Welcome to the administrator dashboard");
      router.replace("/admin");
      router.refresh();
    } catch {
      toast.error("The authentication server is unavailable. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <ShieldCheck className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-6 text-sm font-semibold text-primary">Restricted access</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Administrator sign in</h1>
      <p className="mt-3 text-sm leading-6 text-text-secondary">Sign in with your administrator credentials to continue.</p>

      <form onSubmit={submit} noValidate className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="admin-username" className="font-semibold text-text-primary">Username</Label>
          <Input
            id="admin-username"
            name="username"
            value={username}
            onChange={(event) => { setUsername(event.target.value); setErrors((current) => ({ ...current, username: undefined })); }}
            placeholder="Enter your username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? "admin-username-error" : undefined}
            className="h-11"
          />
          {errors.username && <p id="admin-username-error" className="text-xs text-danger" role="alert">{errors.username}</p>}
        </div>

        <PasswordField
          id="admin-password"
          label="Password"
          value={password}
          onChange={(value) => { setPassword(value); setErrors((current) => ({ ...current, password: undefined })); }}
          autoComplete="current-password"
          placeholder="Enter your password"
          error={errors.password}
        />

        <div className="text-right">
          <Link href="/forgot-password" className="text-sm font-semibold text-primary hover:underline">Forgot password?</Link>
        </div>

        {locked && (
          <div className="rounded-lg bg-danger/10 p-3 text-sm text-danger" role="alert">
            Too many failed attempts. Your account is locked.{" "}
            <Link href="/forgot-password" className="font-semibold underline">Reset your password</Link> to sign in again.
          </div>
        )}

        <Button type="submit" disabled={loading} className="h-11 w-full bg-primary font-semibold hover:bg-primary-dark">
          {loading ? "Signing in..." : "Sign In as Administrator"}
        </Button>
      </form>

      <p className="mt-6 border-t border-border pt-5 text-xs leading-5 text-text-secondary">
        This portal is reserved for authorized system administrators.
      </p>
    </motion.div>
  );
}
