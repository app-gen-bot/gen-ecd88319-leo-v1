import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "./animations.css"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthProvider } from "@/components/providers/auth-provider"
import { CookieConsent } from "@/components/cookie-consent"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Happy Llama - Your Ideas → Enterprise Apps, at AI Speed",
  description: "Transform concepts into production-ready applications without writing code. Happy Llama ensures enterprise-grade quality, complete documentation, and full compliance—regardless of your technical expertise.",
  keywords: "AI development, no-code, enterprise applications, automated development, application builder",
  authors: [{ name: "Happy Llama" }],
  openGraph: {
    title: "Happy Llama - Your Ideas → Enterprise Apps, at AI Speed",
    description: "Transform concepts into production-ready applications without writing code.",
    url: "https://happyllama.ai",
    siteName: "Happy Llama",
    images: [
      {
        url: "https://happyllama.ai/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Happy Llama - Your Ideas → Enterprise Apps, at AI Speed",
    description: "Transform concepts into production-ready applications without writing code.",
    images: ["https://happyllama.ai/og-image.png"],
    creator: "@happyllama",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  )
}