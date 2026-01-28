// Force dynamic rendering to avoid SSR issues with contexts
export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextAuthProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { ClientProviders } from "@/components/providers/client-providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Identfy - Customer Portal",
  description: "Advanced identity verification and risk management platform",
  keywords: "identity verification, KYC, AML, risk management, compliance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextAuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <ClientProviders>
              {children}
            </ClientProviders>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}