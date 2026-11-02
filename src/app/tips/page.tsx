import type { Metadata } from 'next';
import { tips } from '@/content/landing';
import { TipBoard } from '@/components/community/TipBoard';
import { Footer } from '@/components/sections/Footer';
import { SiteHeader } from '@/components/sections/SiteHeader';

export const metadata: Metadata = {
  title: tips.pageTitle,
  description: tips.pageDescription,
};

export default function TipBoardPage() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <TipBoard />
      </main>
      <Footer />
    </>
  );
}
