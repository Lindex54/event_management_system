import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { ThemedToaster } from "@/components/themed-toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Evently | Discover Events Worth Showing Up For",
  description:
    "Discover upcoming events, conferences, workshops and experiences near you.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
          <ThemedToaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
