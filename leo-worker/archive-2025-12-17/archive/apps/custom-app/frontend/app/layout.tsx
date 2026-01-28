import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/contexts/auth-context"
import { WebSocketProvider } from "@/lib/contexts/websocket-context"
import { ErrorBoundary } from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Tenant Rights Advisor - Know Your Rights. Protect Your Home.",
  description: "AI-powered legal guidance for California tenants and landlords. Get instant answers, document issues, and protect your rights.",
  keywords: "tenant rights, California rental law, legal advice, AI lawyer, rental disputes, security deposit, eviction protection",
  openGraph: {
    title: "AI Tenant Rights Advisor",
    description: "Know Your Rights. Protect Your Home.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <WebSocketProvider>
              {children}
              <Toaster />
            </WebSocketProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}