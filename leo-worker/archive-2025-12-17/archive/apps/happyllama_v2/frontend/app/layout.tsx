import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

export const dynamic = 'force-dynamic'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Happy Llama - Transform Your Ideas Into Production-Ready Apps with AI',
  description: "Happy Llama's multi-agent AI AppFactory delivers enterprise-grade applications from simple descriptions. No coding required.",
  keywords: 'AI app development, no-code, low-code, application development, AI agents, enterprise software',
  authors: [{ name: 'Happy Llama' }],
  creator: 'Happy Llama',
  publisher: 'Happy Llama',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://happyllama.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://happyllama.com',
    siteName: 'Happy Llama',
    title: 'Happy Llama - Transform Your Ideas Into Production-Ready Apps with AI',
    description: "Happy Llama's multi-agent AI AppFactory delivers enterprise-grade applications from simple descriptions. No coding required.",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Happy Llama AI AppFactory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@happyllama',
    creator: '@happyllama',
    title: 'Happy Llama - Transform Your Ideas Into Production-Ready Apps with AI',
    description: "Happy Llama's multi-agent AI AppFactory delivers enterprise-grade applications from simple descriptions. No coding required.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}