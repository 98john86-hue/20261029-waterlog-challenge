import type { Metadata } from 'next';
import { board } from '@/content/landing';
import { ChallengeBoard } from '@/components/challenge/ChallengeBoard';
import { Footer } from '@/components/sections/Footer';
import { SiteHeader } from '@/components/sections/SiteHeader';

export const metadata: Metadata = {
  title: board.pageTitle,
  description: board.pageDescription,
};

export default function ChallengePage() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <ChallengeBoard />
      </main>
      <Footer />
    </>
  );
}
