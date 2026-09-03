"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full bg-input transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:bg-primary disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform data-checked:translate-x-[18px]" />
    </SwitchPrimitive.Root>
  );
}
