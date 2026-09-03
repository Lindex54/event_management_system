import * as React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("grid gap-4", className)} {...props} />;
}

export function Field({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return <Label className={cn("text-xs font-semibold", className)} {...props} />;
}
