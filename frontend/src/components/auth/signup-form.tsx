"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { toast } from "sonner";

import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const telephonePattern = /^\+?[\d\s()-]{7,20}$/;

type SignupValues = {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  password: string;
  confirmPassword: string;
};

type SignupErrors = Partial<Record<keyof SignupValues | "terms", string>>;

const initialValues: SignupValues = { firstName: "", lastName: "", email: "", telephone: "", password: "", confirmPassword: "" };

export function SignupForm() {
  const [values, setValues] = React.useState(initialValues);
  const [terms, setTerms] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<SignupErrors>({});

  function update(field: keyof SignupValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: SignupErrors = {};
    if (!values.firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!values.lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!values.email.trim()) nextErrors.email = "Email address is required.";
    else if (!emailPattern.test(values.email.trim())) nextErrors.email = "Enter a valid email address.";
    if (!values.telephone.trim()) nextErrors.telephone = "Telephone number is required.";
    else if (!telephonePattern.test(values.telephone.trim())) nextErrors.telephone = "Enter a valid telephone number.";
    if (!values.password) nextErrors.password = "Password is required.";
    else if (values.password.length < 8) nextErrors.password = "Password must contain at least 8 characters.";
    if (!values.confirmPassword) nextErrors.confirmPassword = "Please confirm your password.";
    else if (values.confirmPassword !== values.password) nextErrors.confirmPassword = "Passwords do not match.";
    if (!terms) nextErrors.terms = "You must agree to the Terms and Privacy Policy.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    toast.info("Account creation will be connected to the backend.");
    setLoading(false);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      <div>
        <p className="text-sm font-semibold text-primary">Join Evently</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">Create your account</h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">Join and start discovering and registering for events.</p>
      </div>

      <form onSubmit={submit} noValidate className="mt-7 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="signup-first-name" label="First Name" value={values.firstName} onChange={(value) => update("firstName", value)} autoComplete="given-name" error={errors.firstName} />
          <TextField id="signup-last-name" label="Last Name" value={values.lastName} onChange={(value) => update("lastName", value)} autoComplete="family-name" error={errors.lastName} />
        </div>
        <TextField id="signup-email" label="Email Address" value={values.email} onChange={(value) => update("email", value)} type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" error={errors.email} />
        <TextField id="signup-telephone" label="Telephone Number" value={values.telephone} onChange={(value) => update("telephone", value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="e.g. +256 700 000 000" error={errors.telephone} />
        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordField id="signup-password" label="Password" value={values.password} onChange={(value) => update("password", value)} autoComplete="new-password" placeholder="At least 8 characters" error={errors.password} />
          <PasswordField id="signup-confirm-password" label="Confirm Password" value={values.confirmPassword} onChange={(value) => update("confirmPassword", value)} autoComplete="new-password" placeholder="Repeat your password" error={errors.confirmPassword} />
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-5 text-text-secondary">
            <Checkbox checked={terms} onCheckedChange={(checked) => { setTerms(checked === true); setErrors((current) => ({ ...current, terms: undefined })); }} aria-invalid={Boolean(errors.terms)} className="mt-0.5" />
            <span>I agree to the <span className="font-semibold text-text-primary">Terms</span> and <span className="font-semibold text-text-primary">Privacy Policy</span>.</span>
          </label>
          {errors.terms && <p className="mt-1.5 text-xs text-danger" role="alert">{errors.terms}</p>}
        </div>

        <Button type="submit" disabled={loading} className="h-11 w-full bg-primary font-semibold hover:bg-primary-dark">
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
      </p>
    </motion.div>
  );
}

function TextField({ id, label, value, onChange, error, ...inputProps }: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
} & Omit<React.ComponentProps<typeof Input>, "id" | "value" | "onChange">) {
  const errorId = `${id}-error`;
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-semibold text-text-primary">{label}</Label>
      <Input id={id} name={id} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className="h-11" {...inputProps} />
      {error && <p id={errorId} className="text-xs text-danger" role="alert">{error}</p>}
    </div>
  );
}
