import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";

import { Analytics } from "@vercel/analytics/react";

import "./globals.css";

import { ToastProvider } from "@/components/providers/toast-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

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
    <html lang="pt-BR" className={`dark ${inter.variable} ${anton.variable}`}>
      <body>
        <ToastProvider />

        {children}

        <Analytics />
      </body>
    </html>
  );
}
