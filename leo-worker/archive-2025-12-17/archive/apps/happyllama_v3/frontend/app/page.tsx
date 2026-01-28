import { HeroSection } from "@/components/sections/hero-section"
import { HowItWorksSection } from "@/components/sections/how-it-works-section"
import { PlatformDifferentiators } from "@/components/sections/platform-differentiators"
import { UseCaseGalleryPreview } from "@/components/sections/use-case-gallery-preview"
import { DocumentationPreview } from "@/components/sections/documentation-preview"
import { BetaSignupSection } from "@/components/sections/beta-signup-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <PlatformDifferentiators />
      <UseCaseGalleryPreview />
      <DocumentationPreview />
      <BetaSignupSection />
    </>
  )
}