import type { DistanceLog, LearningLog, Stroke, SwimLog } from '@/lib/types';

export const WEEKDAY_COUNT = 5;

/** 'YYYY-MM-DD'에 n일을 더한다 (UTC 기준이라 시간대 영향 없음) */
export function addDays(date: string, days: number): string {
  const [y = 0, m = 1, d = 1] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** n주차(0부터)의 월~금 날짜 5개 */
export function getWeekDates(startDate: string, weekIndex: number): string[] {
  return Array.from({ length: WEEKDAY_COUNT }, (_, i) => addDays(startDate, weekIndex * 7 + i));
}

/** 진행판 탭 하나: n주차(월~금) 또는 마무리 날 */
export type BoardPeriod = { kind: 'week'; week: number; dates: string[] } | { kind: 'bonus'; dates: string[] };

type Schedule = { startDate: string; weeks: number; bonusDate?: string };

/** 챌린지 기간: 주차들 + (있으면) 마무리 날 */
export function getPeriods({ startDate, weeks, bonusDate }: Schedule): BoardPeriod[] {
  const periods: BoardPeriod[] = Array.from({ length: weeks }, (_, i) => ({
    kind: 'week',
    week: i + 1,
    dates: getWeekDates(startDate, i),
  }));
  if (bonusDate) periods.push({ kind: 'bonus', dates: [bonusDate] });
  return periods;
}

/** 인증할 수 있는 모든 날짜 (주차 순서대로) */
export function getChallengeDates(schedule: Schedule): string[] {
  return getPeriods(schedule).flatMap((p) => p.dates);
}

/** 지금 한국 날짜 'YYYY-MM-DD' (보는 사람의 시간대와 상관없이) */
export function todayInKorea(now: number = Date.now()): string {
  return new Date(now + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** '2026-11-02' → '11/2' */
export function formatShortDate(date: string): string {
  const [, m, d] = date.split('-').map(Number);
  return `${m}/${d}`;
}

export type DayLogs = { distance?: DistanceLog; learning?: LearningLog };

export function getDayLogs(logs: readonly SwimLog[], date: string): DayLogs {
  const day: DayLogs = {};
  for (const log of logs) {
    if (log.date !== date) continue;
    if (log.type === 'distance') day.distance = log;
    else day.learning = log;
  }
  return day;
}

/** 한 주의 기록 수(거리·배운 점 각각 1개)와 인증한 날 수 */
export function summarizeWeek(logs: readonly SwimLog[], dates: readonly string[]): { logs: number; days: number } {
  const inWeek = logs.filter((log) => dates.includes(log.date));
  return { logs: inWeek.length, days: new Set(inWeek.map((log) => log.date)).size };
}

/**
 * 진행판 순서: 주간 목표 달성자 → 그 주 기록이 많은 순 → 인증한 날이 많은 순.
 * 모두 같으면 원래 순서를 유지한다. 마무리 날처럼 목표가 없는 기간은 withGoal=false.
 */
export function rankByWeek<T extends { logs: readonly SwimLog[]; goal?: number }>(
  rows: readonly T[],
  dates: readonly string[],
  withGoal = true,
): T[] {
  return rows
    .map((row, index) => {
      const summary = summarizeWeek(row.logs, dates);
      const achieved = withGoal && row.goal !== undefined && summary.days >= row.goal ? 1 : 0;
      return { row, index, summary, achieved };
    })
    .sort(
      (a, b) =>
        b.achieved - a.achieved ||
        b.summary.logs - a.summary.logs ||
        b.summary.days - a.summary.days ||
        a.index - b.index,
    )
    .map(({ row }) => row);
}

/** 해당 날짜의 기록을 새 기록으로 바꾼다 (빈 값이면 그날 기록 삭제) */
export function replaceDayLogs(logs: readonly SwimLog[], date: string, next: DayLogs): SwimLog[] {
  const kept = logs.filter((log) => log.date !== date);
  return [...kept, ...[next.distance, next.learning].filter((log): log is SwimLog => Boolean(log))];
}

type SamplePools = {
  distances: ReadonlyArray<readonly [number, number]>;
  notes: ReadonlyArray<{ stroke: Stroke; note: string }>;
};

/** 'DLB-L' 같은 주차별 패턴을 실제 기록 목록으로 바꾼다. 예시 문구는 순서대로 돌려 쓴다 */
export function buildSampleLogs(
  weeks: readonly string[],
  startDate: string,
  pools: SamplePools,
  seed = 0,
): SwimLog[] {
  const logs: SwimLog[] = [];
  let cursor = seed;
  weeks.forEach((pattern, weekIndex) => {
    getWeekDates(startDate, weekIndex).forEach((date, dayIndex) => {
      const code = pattern[dayIndex];
      cursor += 1;
      if (code === 'D' || code === 'B') {
        const [laneLength, laps] = pools.distances[cursor % pools.distances.length] ?? [25, 4];
        logs.push({ type: 'distance', date, laneLength, laps });
      }
      if (code === 'L' || code === 'B') {
        const sample = pools.notes[cursor % pools.notes.length];
        if (sample) logs.push({ type: 'learning', date, stroke: sample.stroke, note: sample.note });
      }
    });
  });
  return logs;
}
