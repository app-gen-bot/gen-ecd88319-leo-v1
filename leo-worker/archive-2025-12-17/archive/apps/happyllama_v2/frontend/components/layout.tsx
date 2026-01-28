import Header from './header'
import Footer from './footer'
import CookieBanner from './cookie-banner'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>{children}</main>
      <Footer />
      <CookieBanner />
    </div>
  )
}