import * as React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function MessageGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="message-group" className={cn("flex flex-col gap-5", className)} {...props} />;
}

export function Message({ className, from = "other", ...props }: React.ComponentProps<"div"> & { from?: "other" | "me" }) {
  return <div data-slot="message" data-from={from} className={cn("group/message flex items-end gap-2.5 data-[from=me]:flex-row-reverse", className)} {...props} />;
}

export function MessageAvatar({ className, children, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="message-avatar" className={cn("shrink-0", className)} {...props}>{children ?? <Avatar><AvatarFallback>EV</AvatarFallback></Avatar>}</div>;
}

export function MessageContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="message-content" className={cn("flex max-w-[min(80%,42rem)] flex-col items-start gap-1 group-data-[from=me]/message:items-end", className)} {...props} />;
}
