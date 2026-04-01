import type { Metadata } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip"
const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  variable: "--font-atkinson",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Character Flow",
  description: "Build characters, worlds, and AI storytelling workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${atkinson.variable} dark`}>
      <body className={`${atkinson.className} relative antialiased bg-background text-foreground w-screen h-screen flex flex-col`}>
        <QueryProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
