import type { Metadata } from "next";

import "./globals.css";

import { ToastProvider } from "@/components/providers/toast-provider";

export const metadata: Metadata = {
  title: "RachaConta",
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
      </body>
    </html>
  );
}
