import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PlanetScale AI App Factory - From Prompt to Planet Scale',
  description: 'Transform your ideas into production-ready applications with AI. Build, deploy, and scale applications instantly with our revolutionary Adaptive Code Evolution system.',
  keywords: 'AI, app development, no-code, low-code, application factory, PlanetScale, ACE system',
  authors: [{ name: 'PlanetScale AI' }],
  openGraph: {
    title: 'PlanetScale AI App Factory - From Prompt to Planet Scale',
    description: 'Transform your ideas into production-ready applications with AI',
    type: 'website',
    url: 'https://planetscale-ai.com',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PlanetScale AI App Factory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PlanetScale AI App Factory',
    description: 'Transform your ideas into production-ready applications with AI',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}