import { Community } from '@/components/sections/Community';
import { Faq } from '@/components/sections/Faq';
import { Footer } from '@/components/sections/Footer';
import { Hero } from '@/components/sections/Hero';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { SignupCta } from '@/components/sections/SignupCta';
import { SiteHeader } from '@/components/sections/SiteHeader';
import { WeeklyBoard } from '@/components/sections/WeeklyBoard';

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <Hero />
        <HowItWorks />
        <WeeklyBoard />
        <Community />
        <Faq />
        <SignupCta />
      </main>
      <Footer />
    </>
  );
}
