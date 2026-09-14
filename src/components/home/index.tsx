import {
  Background,
  FAQ,
  Features,
  HeroSection,
  Logos,
  Pricing,
  ResourceAllocation,
  Testimonials,
} from "@/components/landing"
import { useGradientExpand } from "@/hooks/landing/useGradientExpand"

export function HomePage() {
  useGradientExpand(["pricing-gradient-wrap"])

  return (
    <div className="relative">
      <HeroSection />

      <Background className="relative z-20">
        <Logos />
        <Features />
        <ResourceAllocation />
      </Background>

      <Testimonials />
      <Pricing />
      <FAQ />
    </div>
  )
}
