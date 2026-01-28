'use client'

import { AuthCheck } from '@/contexts/auth-context'
import { Header } from '@/components/layout/header'
import { BottomNav } from '@/components/layout/bottom-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthCheck>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-6 pb-20 md:pb-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </AuthCheck>
  )
}