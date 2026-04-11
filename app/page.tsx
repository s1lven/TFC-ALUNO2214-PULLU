import {
  LandingFaqSection,
  LandingFeaturesComparisonSection,
  LandingHeroSection,
  LandingHowItWorksSection,
  LandingTryUrlSection,
} from '@/components/web/sections'
import { WebShell } from '@/components/web/web-shell'

export default function Home() {
  return (
    <WebShell>
      <LandingHeroSection />
      <LandingTryUrlSection />
      <LandingHowItWorksSection />
      <LandingFeaturesComparisonSection />
      <LandingFaqSection />
    </WebShell>
  )
}
