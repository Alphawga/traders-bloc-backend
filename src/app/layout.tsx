"use client";

import "./globals.css";
import TRPCProvider from "./_providers/trpc-provider";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body >
      <SessionProvider>
          <TRPCProvider>{children}</TRPCProvider>
          <Toaster />
        </SessionProvider>


      </body>
    </html>
  );
} 