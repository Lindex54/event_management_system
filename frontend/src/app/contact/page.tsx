import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

import { ContactForm } from "@/components/home/contact-form";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact | Evently",
  description: "Get in touch with the Evently team.",
};

const details = [
  { icon: Mail, label: "Email", value: "hello@evently.example" },
  { icon: Phone, label: "Phone", value: "+256 700 000 000" },
  { icon: MapPin, label: "Office", value: "Kampala, Uganda" },
];

export default function ContactPage() {
  return (
    <>
      <PublicHeader />
      <main className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-[0.12em] text-primary uppercase">Contact Us</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">We&apos;d love to hear from you</h1>
            <p className="mt-3 text-text-secondary">Questions about hosting an event or using Evently? Send us a message and we&apos;ll get back to you.</p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)]">
            <div className="space-y-4">
              {details.map((item) => (
                <Card key={item.label} className="shadow-none">
                  <CardContent className="flex items-center gap-3 p-5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><item.icon className="size-4.5" /></span>
                    <div><p className="text-xs text-text-secondary">{item.label}</p><p className="font-semibold text-text-primary">{item.value}</p></div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="shadow-none">
              <CardContent className="p-6 sm:p-8">
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
