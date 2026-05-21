import Hero from '@/components/Hero';
import TheDifference from '@/components/TheDifference';
import WhoWeHelp from '@/components/WhoWeHelp';
import Amenities from '@/components/Amenities';
import HowItWorks from '@/components/HowItWorks';
import Locations from '@/components/Locations';
import FAQ from '@/components/FAQ';
import CTABanner from '@/components/CTABanner';

export default function Home() {
  return (
    <>
      <Hero />
      <TheDifference />
      <WhoWeHelp />
      <Amenities />
      <HowItWorks />
      <Locations />
      <FAQ />
      <CTABanner />
    </>
  );
}
