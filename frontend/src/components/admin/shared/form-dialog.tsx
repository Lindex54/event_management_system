"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface FormField {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "number" | "date" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export function FormDialog({ trigger, title, description, fields, submitLabel = "Save", successMessage, onSave }: {
  trigger: React.ReactNode;
  title: string;
  description: string;
  fields: FormField[];
  submitLabel?: string;
  successMessage: string;
  onSave?: (values: Record<string, string>) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [error, setError] = React.useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missing = fields.find((field) => field.required && !values[field.name]?.trim());
    if (missing) {
      setError(`${missing.label} is required.`);
      return;
    }
    const email = fields.find((field) => field.type === "email");
    if (email && values[email.name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[email.name])) {
      setError("Enter a valid email address.");
      return;
    }
    onSave?.(values);
    toast.success(successMessage);
    setValues({});
    setError("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.name} className={field.type === "textarea" ? "space-y-2 sm:col-span-2" : "space-y-2"}>
                <Label htmlFor={`field-${field.name}`}>{field.label}{field.required && " *"}</Label>
                {field.type === "select" ? (
                  <Select value={values[field.name] ?? ""} onValueChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))}>
                    <SelectTrigger id={`field-${field.name}`} className="h-10 w-full"><SelectValue placeholder={field.placeholder ?? `Select ${field.label.toLowerCase()}`} /></SelectTrigger>
                    <SelectContent>{field.options?.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                  </Select>
                ) : field.type === "textarea" ? (
                  <Textarea id={`field-${field.name}`} placeholder={field.placeholder} value={values[field.name] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))} />
                ) : (
                  <Input id={`field-${field.name}`} type={field.type ?? "text"} placeholder={field.placeholder} value={values[field.name] ?? ""} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))} className="h-10" />
                )}
              </div>
            ))}
          </div>
          {error && <p className="text-sm text-danger" role="alert">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">{submitLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
