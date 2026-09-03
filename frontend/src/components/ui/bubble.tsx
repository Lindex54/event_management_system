import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const bubbleVariants = cva(
  "w-fit max-w-full rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-sm",
  {
    variants: {
      variant: {
        default: "rounded-br-md bg-primary text-primary-foreground",
        muted: "rounded-bl-md bg-muted text-text-primary ring-1 ring-foreground/8",
        outline: "bg-surface text-text-primary ring-1 ring-border",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Bubble({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof bubbleVariants>) {
  return <div data-slot="bubble" className={cn(bubbleVariants({ variant }), className)} {...props} />;
}

export function BubbleContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="bubble-content" className={cn("whitespace-pre-wrap wrap-break-word", className)} {...props} />;
}
