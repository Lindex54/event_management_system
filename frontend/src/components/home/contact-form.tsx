"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [loading, setLoading] = React.useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    toast.info("Message queuing will be connected to the backend.");
    event.currentTarget.reset();
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="contact-name">Full Name</Label><Input id="contact-name" name="name" required className="h-11" /></div>
        <div className="space-y-2"><Label htmlFor="contact-email">Email Address</Label><Input id="contact-email" name="email" type="email" required className="h-11" /></div>
      </div>
      <div className="space-y-2"><Label htmlFor="contact-subject">Subject</Label><Input id="contact-subject" name="subject" required className="h-11" /></div>
      <div className="space-y-2"><Label htmlFor="contact-message">Message</Label><Textarea id="contact-message" name="message" required rows={5} /></div>
      <Button type="submit" disabled={loading} className="h-11 w-full bg-primary font-semibold hover:bg-primary-dark sm:w-auto">
        {loading ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
