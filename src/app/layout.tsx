import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/react";

import "./globals.css";

import { ToastProvider } from "@/components/providers/toast-provider";

export const metadata: Metadata = {
  title: "RachaConta",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <ToastProvider />

        {children}

        <Analytics />
      </body>
    </html>
  );
}
