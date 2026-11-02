'use client';

import { useState } from 'react';
import { board } from '@/content/landing';
import { sampleBoardRows } from '@/lib/sampleBoard';
import { BoardTable } from '@/components/ui/BoardTable';
import { ButtonLink } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';

/** 홈의 진행판 미리보기 (예시 데이터). 실제 인증은 /challenge에서 한다 */
export function WeeklyBoard() {
  const [periodIndex, setPeriodIndex] = useState(0);

  return (
    <section id="board" aria-labelledby="board-title" className="scroll-mt-16 bg-sky-50 px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-xl">
        <SectionHeading
          id="board-title"
          eyebrow={board.preview.eyebrow}
          title={board.preview.title}
          description={board.preview.description}
        />
      </div>
      <div className="mx-auto max-w-4xl">
        <BoardTable rows={sampleBoardRows} periodIndex={periodIndex} onPeriodChange={setPeriodIndex} sample />
      </div>
      <div className="mt-8 flex justify-center">
        <ButtonLink href="/challenge">{board.preview.cta}</ButtonLink>
      </div>
    </section>
  );
}
