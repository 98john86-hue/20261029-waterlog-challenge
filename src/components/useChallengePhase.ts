'use client';

import { useEffect, useState } from 'react';
import { challenge } from '@/content/landing';
import { todayInKorea } from '@/lib/board';
import { getChallengePhase, type ChallengePhase } from '@/lib/phase';

/** 빌드한 날 (next.config.ts). 정적 HTML은 이 날짜 기준으로 미리 그려 둔다 */
const BUILD_DATE = process.env.NEXT_PUBLIC_BUILD_DATE ?? challenge.startDate;

/**
 * 오늘 한국 날짜 기준 챌린지 단계.
 * 처음엔 빌드한 날 기준(서버에서 그린 HTML과 같게)으로 그리고, 브라우저에서 오늘 날짜로 다시 맞춘다.
 * 그래서 다시 배포하지 않아도 날짜가 바뀌면 홈 화면이 저절로 바뀐다.
 */
export function useChallengePhase(): ChallengePhase {
  const [phase, setPhase] = useState<ChallengePhase>(() => getChallengePhase(BUILD_DATE, challenge));
  useEffect(() => {
    setPhase(getChallengePhase(todayInKorea(), challenge));
  }, []);
  return phase;
}
