"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

export function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "peer flex size-4 shrink-0 items-center justify-center rounded border border-input bg-background outline-none focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator><Check className="size-3" /></CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
