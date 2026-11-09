import { getChallengeDates } from '@/lib/board';

/**
 * 오늘이 챌린지의 어느 단계인지 (홈 화면 문구·버튼을 날짜에 따라 바꾸는 데 쓴다).
 *   before: 시작일 전 → 사전 등록
 *   during: 시작일 ~ 마지막 날(마무리 날) → 오늘의 인증으로 안내. 주말도 진행 중으로 본다
 *   after:  마지막 날 다음 날부터 → 종료
 */
export type ChallengePhase = { kind: 'before' } | { kind: 'during'; week: number | 'bonus' } | { kind: 'after' };

type Schedule = { startDate: string; weeks: number; bonusDate?: string };

const toUtc = (date: string) => {
  const [y = 0, m = 1, d = 1] = date.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

/** today는 한국 날짜 'YYYY-MM-DD' (todayInKorea) */
export function getChallengePhase(today: string, schedule: Schedule): ChallengePhase {
  const dates = getChallengeDates(schedule);
  const last = dates.at(-1) ?? schedule.startDate;
  if (today < schedule.startDate) return { kind: 'before' };
  if (today > last) return { kind: 'after' };
  if (schedule.bonusDate && today >= schedule.bonusDate) return { kind: 'during', week: 'bonus' };
  const week = Math.floor((toUtc(today) - toUtc(schedule.startDate)) / (7 * 24 * 60 * 60 * 1000)) + 1;
  return { kind: 'during', week: Math.min(week, schedule.weeks) };
}
