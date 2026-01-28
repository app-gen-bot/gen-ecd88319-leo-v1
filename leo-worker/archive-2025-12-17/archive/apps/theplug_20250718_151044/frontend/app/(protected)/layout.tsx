import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="pt-16 md:pl-60">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}