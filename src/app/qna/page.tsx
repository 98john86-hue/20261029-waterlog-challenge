import type { Metadata } from 'next';
import { qna } from '@/content/landing';
import { QuestionBoard } from '@/components/community/QuestionBoard';
import { Footer } from '@/components/sections/Footer';
import { SiteHeader } from '@/components/sections/SiteHeader';

export const metadata: Metadata = {
  title: qna.pageTitle,
  description: qna.pageDescription,
};

export default function QuestionBoardPage() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <QuestionBoard />
      </main>
      <Footer />
    </>
  );
}
