import { describe, expect, it } from 'vitest';
import {
  addDays,
  buildSampleLogs,
  formatShortDate,
  getChallengeDates,
  getDayLogs,
  getPeriods,
  getWeekDates,
  rankByWeek,
  replaceDayLogs,
  summarizeWeek,
  todayInKorea,
} from '@/lib/board';
import { getChallengePhase } from '@/lib/phase';
import type { SwimLog } from '@/lib/types';

const START = '2026-11-02'; // 월요일

describe('주차 날짜', () => {
  it('월말을 넘어가도 날짜를 더한다', () => {
    expect(addDays('2026-11-30', 2)).toBe('2026-12-02');
  });

  it('n주차의 월~금 5일을 반환한다', () => {
    expect(getWeekDates(START, 0)).toEqual(['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06']);
    expect(getWeekDates(START, 3)[4]).toBe('2026-11-27');
  });

  it('짧은 날짜로 표시한다', () => {
    expect(formatShortDate('2026-11-02')).toBe('11/2');
  });
});

const dist = (date: string): SwimLog => ({ type: 'distance', date, laneLength: 25, laps: 6 });
const learn = (date: string): SwimLog => ({ type: 'learning', date, note: '호흡' });

describe('summarizeWeek / rankByWeek', () => {
  const week = getWeekDates(START, 0);

  it('그 주의 기록 수와 인증한 날 수를 센다 (다른 주 기록 제외)', () => {
    const logs = [dist('2026-11-02'), learn('2026-11-02'), dist('2026-11-04'), dist('2026-11-09')];
    expect(summarizeWeek(logs, week)).toEqual({ logs: 3, days: 2 });
  });

  it('기록이 많은 참여자가 위로, 같으면 인증한 날이 많은 순, 그래도 같으면 원래 순서', () => {
    const rows = [
      { id: 'few', logs: [dist('2026-11-02')] },
      { id: 'tieDaysLess', logs: [dist('2026-11-03'), learn('2026-11-03')] },
      { id: 'many', logs: [dist('2026-11-02'), learn('2026-11-02'), dist('2026-11-03')] },
      { id: 'tieDaysMore', logs: [dist('2026-11-03'), dist('2026-11-04')] },
      { id: 'none', logs: [] },
    ];
    expect(rankByWeek(rows, week).map((r) => r.id)).toEqual(['many', 'tieDaysMore', 'tieDaysLess', 'few', 'none']);
  });

  it('주간 목표를 달성한 참여자가 기록 수와 상관없이 위로 온다', () => {
    const rows = [
      { id: 'manyLogsNotMet', goal: 4, logs: [dist('2026-11-02'), learn('2026-11-02'), dist('2026-11-03'), learn('2026-11-03'), dist('2026-11-04')] },
      { id: 'met', goal: 3, logs: [dist('2026-11-02'), dist('2026-11-03'), dist('2026-11-04')] },
    ];
    expect(rankByWeek(rows, week).map((r) => r.id)).toEqual(['met', 'manyLogsNotMet']);
  });
});

describe('getDayLogs / replaceDayLogs', () => {
  it('그날의 거리·배운 점 기록을 찾는다', () => {
    const day = getDayLogs([dist('2026-11-02'), learn('2026-11-02'), dist('2026-11-03')], '2026-11-02');
    expect(day.distance?.type).toBe('distance');
    expect(day.learning?.type).toBe('learning');
  });

  it('그날 기록을 바꾸거나 지운다', () => {
    const logs = [dist('2026-11-02'), learn('2026-11-03')];
    const replaced = replaceDayLogs(logs, '2026-11-02', { learning: { type: 'learning', date: '2026-11-02', note: '새 기록' } });
    expect(replaced).toHaveLength(2);
    expect(getDayLogs(replaced, '2026-11-02').distance).toBeUndefined();
    expect(replaceDayLogs(logs, '2026-11-03', {})).toEqual([dist('2026-11-02')]);
  });
});

describe('buildSampleLogs', () => {
  it('패턴 문자를 기록으로 바꾼다 (D=거리, L=배운 점, B=둘 다)', () => {
    const pools = { distances: [[25, 6]] as const, notes: [{ stroke: '자유형', note: '팔 옆으로' }] as const };
    const logs = buildSampleLogs(['DLB--'], START, pools);
    expect(summarizeWeek(logs, getWeekDates(START, 0))).toEqual({ logs: 4, days: 3 });
    expect(getDayLogs(logs, '2026-11-04').distance).toBeDefined();
    expect(getDayLogs(logs, '2026-11-04').learning).toBeDefined();
  });
});

describe('챌린지 기간 (3주 + 마무리 날)', () => {
  const schedule = { startDate: '2026-11-09', weeks: 3, bonusDate: '2026-11-30' };

  it('주차 탭 3개 다음에 마무리 날 탭', () => {
    const periods = getPeriods(schedule);
    expect(periods.map((p) => (p.kind === 'week' ? p.week : 'bonus'))).toEqual([1, 2, 3, 'bonus']);
    expect(periods[2]?.dates).toEqual(['2026-11-23', '2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27']);
    expect(periods[3]?.dates).toEqual(['2026-11-30']);
  });

  it('인증할 수 있는 날짜는 평일 15일 + 마무리 날 = 16일', () => {
    const dates = getChallengeDates(schedule);
    expect(dates).toHaveLength(16);
    expect(dates[0]).toBe('2026-11-09');
    expect(dates.at(-1)).toBe('2026-11-30');
    expect(dates).not.toContain('2026-11-14'); // 토요일
  });

  it('마무리 날이 없으면 주차만', () => {
    expect(getPeriods({ startDate: '2026-11-09', weeks: 2 })).toHaveLength(2);
  });

  it('오늘 날짜는 한국 시간 기준', () => {
    // UTC 11/8 15:00 = 한국 11/9 0:00
    expect(todayInKorea(Date.UTC(2026, 10, 8, 15))).toBe('2026-11-09');
    expect(todayInKorea(Date.UTC(2026, 10, 8, 14, 59))).toBe('2026-11-08');
  });

  it('마무리 날처럼 목표가 없는 기간은 목표 달성으로 먼저 올리지 않는다', () => {
    const bonus = ['2026-11-30'];
    const rows = [
      { id: 'goalLow', goal: 1, logs: [dist('2026-11-30')] },
      { id: 'more', goal: 5, logs: [dist('2026-11-30'), learn('2026-11-30')] },
    ];
    expect(rankByWeek(rows, bonus).map((r) => r.id)).toEqual(['goalLow', 'more']);
    expect(rankByWeek(rows, bonus, false).map((r) => r.id)).toEqual(['more', 'goalLow']);
  });
});

describe('챌린지 단계 (홈 화면)', () => {
  const schedule = { startDate: '2026-11-09', weeks: 3, bonusDate: '2026-11-30' };

  it('시작일 전에는 사전 등록', () => {
    expect(getChallengePhase('2026-11-08', schedule)).toEqual({ kind: 'before' });
  });

  it('시작일부터 주차를 센다 (주말도 진행 중)', () => {
    expect(getChallengePhase('2026-11-09', schedule)).toEqual({ kind: 'during', week: 1 });
    expect(getChallengePhase('2026-11-15', schedule)).toEqual({ kind: 'during', week: 1 }); // 일요일
    expect(getChallengePhase('2026-11-16', schedule)).toEqual({ kind: 'during', week: 2 });
    expect(getChallengePhase('2026-11-27', schedule)).toEqual({ kind: 'during', week: 3 });
    expect(getChallengePhase('2026-11-29', schedule)).toEqual({ kind: 'during', week: 3 }); // 마무리 날 전 주말
  });

  it('마무리 날, 그다음 날부터는 종료', () => {
    expect(getChallengePhase('2026-11-30', schedule)).toEqual({ kind: 'during', week: 'bonus' });
    expect(getChallengePhase('2026-12-01', schedule)).toEqual({ kind: 'after' });
  });

  it('마무리 날이 없으면 마지막 주 금요일까지', () => {
    expect(getChallengePhase('2026-11-27', { startDate: '2026-11-09', weeks: 3 })).toEqual({ kind: 'during', week: 3 });
    expect(getChallengePhase('2026-11-28', { startDate: '2026-11-09', weeks: 3 })).toEqual({ kind: 'after' });
  });
});
