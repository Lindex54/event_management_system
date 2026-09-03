"use client";

import * as React from "react";
import { FileText, Mail, Save, Send } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/admin/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { emailTemplates, managementEvents, sentEmails } from "@/data/admin-management";

export function EmailPage() {
  const [audience, setAudience] = React.useState("All Attendees"); const [event, setEvent] = React.useState(""); const [subject, setSubject] = React.useState(""); const [message, setMessage] = React.useState("");
  function send() { if (!subject.trim() || !message.trim()) { toast.error("Subject and message are required"); return; } toast.success("Email mock sent", { description: "Real delivery will be connected to the backend." }); setSubject(""); setMessage(""); }
  return <div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6"><PageHeader title="Email" description="Prepare and manage event communication." /><Tabs defaultValue="compose"><TabsList><TabsTrigger value="compose">Compose</TabsTrigger><TabsTrigger value="sent">Sent</TabsTrigger><TabsTrigger value="templates">Templates</TabsTrigger></TabsList>
    <TabsContent value="compose" className="mt-4"><Card className="shadow-none"><CardHeader><CardTitle>Compose message</CardTitle><CardDescription>Messages are simulated until email delivery is connected.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label>Audience</Label><Select value={audience} onValueChange={setAudience}><SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger><SelectContent>{["All Attendees", "Registered Attendees of an Event", "Organizers", "Individual Recipient"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Event</Label><Select value={event} onValueChange={setEvent}><SelectTrigger className="h-10 w-full"><SelectValue placeholder="Select event" /></SelectTrigger><SelectContent>{managementEvents.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div></div><div className="space-y-2"><Label htmlFor="email-subject">Subject</Label><Input id="email-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="h-10" placeholder="Enter message subject" /></div><div className="space-y-2"><Label htmlFor="email-message">Message</Label><Textarea id="email-message" value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-52" placeholder="Write your message..." /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => toast.success("Message saved as a template")}><Save /> Save as Template</Button><Button onClick={send}><Send /> Send</Button></div></CardContent></Card></TabsContent>
    <TabsContent value="sent" className="mt-4 space-y-3">{sentEmails.map((email) => <Card key={email.id} className="py-0 shadow-none"><CardContent className="flex items-center gap-3 p-4"><span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Mail className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate font-semibold text-text-primary">{email.subject}</p><p className="text-xs text-text-secondary">{email.audience} · {email.sentAt}</p></div><Badge variant="outline">{email.recipients} recipients</Badge></CardContent></Card>)}</TabsContent>
    <TabsContent value="templates" className="mt-4 grid gap-4 sm:grid-cols-2">{emailTemplates.map((template) => <Card key={template.id} className="shadow-none"><CardHeader><span className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileText className="size-4" /></span><CardTitle>{template.name}</CardTitle><CardDescription>{template.description}</CardDescription></CardHeader><CardContent><p className="text-xs text-text-secondary">Subject</p><p className="mt-1 text-sm font-medium">{template.subject}</p><Button variant="outline" className="mt-4" onClick={() => { setSubject(template.subject); setMessage(template.description); toast.success("Template loaded into compose"); }}>Use template</Button></CardContent></Card>)}</TabsContent>
  </Tabs></div>;
}
