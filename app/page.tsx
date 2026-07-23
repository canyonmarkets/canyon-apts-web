import Hero from '@/components/Hero';
import StatBar from '@/components/StatBar';
import TheDifference from '@/components/TheDifference';
import PricingBanner from '@/components/PricingBanner';
import WhoWeHelp from '@/components/WhoWeHelp';
import Marquee from '@/components/Marquee';
import Amenities from '@/components/Amenities';
import PhotoCarousel from '@/components/PhotoCarousel';
import HowItWorks from '@/components/HowItWorks';
import Locations from '@/components/Locations';
import FAQ from '@/components/FAQ';
import CTABanner from '@/components/CTABanner';
import SectionDivider from '@/components/SectionDivider';
import InventoryBanner from '@/components/InventoryBanner';
import LiveInventoryTeaser from '@/components/LiveInventoryTeaser';

// Revalidate every 5 minutes so the live-inventory teaser stays fresh.
export const revalidate = 300;

export default function Home() {
  return (
    <>
      <Hero />
      <StatBar />
      <TheDifference />
      <PricingBanner />
      <InventoryBanner />
      <WhoWeHelp />
      <Marquee />
      <Amenities />
      {/* white → dark gallery */}
      <SectionDivider fromClass="bg-white" toClass="text-iron-900" />
      <PhotoCarousel />
      <LiveInventoryTeaser />
      <HowItWorks />
      {/* dark → light locations */}
      <SectionDivider fromClass="bg-iron-800" toClass="text-stone-50" flip />
      <Locations />
      {/* light → dark FAQ */}
      <SectionDivider fromClass="bg-stone-50" toClass="text-iron-800" />
      <FAQ />
      {/* FAQ and the CTA finale are both dark now — seamless run into the footer */}
      <CTABanner />
    </>
  );
}
