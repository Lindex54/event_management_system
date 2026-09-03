"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  error?: string;
  placeholder?: string;
}

export function PasswordField({ id, label, value, onChange, autoComplete, error, placeholder }: PasswordFieldProps) {
  const [visible, setVisible] = React.useState(false);
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-semibold text-text-primary">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="h-11 pr-11"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-1.5 -translate-y-1/2 text-text-secondary hover:text-text-primary"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      </div>
      {error && <p id={errorId} className="text-xs text-danger" role="alert">{error}</p>}
    </div>
  );
}
