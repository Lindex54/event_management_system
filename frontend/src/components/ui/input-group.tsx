import * as React from "react";

import { cn } from "@/lib/utils";

export function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex h-10 items-center rounded-lg border border-input bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50", className)} {...props} />;
}

export function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn("h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none", className)} {...props} />;
}

export function InputGroupAddon({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center px-3 text-text-secondary [&_svg]:size-4", className)} {...props} />;
}
