import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { ProcessSection } from '@/components/process-section'
import { ACESystemSection } from '@/components/ace-system-section'
import { AgentShowcaseSection } from '@/components/agent-showcase-section'
import { ApplicationGridSection } from '@/components/application-grid-section'
import { BetaAccessSection } from '@/components/beta-access-section'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="smooth-scroll">
        <HeroSection />
        <ProcessSection />
        <ACESystemSection />
        <AgentShowcaseSection />
        <ApplicationGridSection />
        <BetaAccessSection />
      </main>
      <Footer />
    </div>
  )
}