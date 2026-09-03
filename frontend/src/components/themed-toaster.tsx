"use client";

import { useTheme } from "next-themes";
import { Toaster, type ToasterProps } from "sonner";

export function ThemedToaster(props: ToasterProps) {
  const { theme = "system" } = useTheme();

  return <Toaster theme={theme as ToasterProps["theme"]} {...props} />;
}
