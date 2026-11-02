'use client';

import { useCallback, useEffect, useState } from 'react';
import { board, challenge } from '@/content/landing';
import { getPeriods, todayInKorea, type DayLogs } from '@/lib/board';
import { formatLogDate } from '@/lib/date';
import type { Participant } from '@/lib/firebase/checkins';
import { sampleBoardRows } from '@/lib/sampleBoard';
import { AuthPanel } from '@/components/community/AuthPanel';
import { useAuth } from '@/components/community/useAuth';
import { BoardTable, type BoardRow } from '@/components/ui/BoardTable';
import { CheckInForm, type DateOption } from '@/components/ui/CheckInForm';
import { SectionHeading } from '@/components/ui/SectionHeading';

/** Firebase 코드는 실제로 쓸 때만 불러온다 */
const loadCheckinsApi = () => import('@/lib/firebase/checkins');

const periods = getPeriods(challenge);

/** 모든 인증 날짜와 보기 이름 (1주차 · 11월 9일 (월) …, 마무리 날 · 11월 30일 (월)) */
const allDateOptions: DateOption[] = periods.flatMap((period) =>
  period.dates.map((date) => ({
    date,
    label:
      period.kind === 'week'
        ? board.form.dateOption(period.week, formatLogDate(date))
        : board.form.bonusOption(formatLogDate(date)),
  })),
);

/** 그 날짜가 들어 있는 진행판 탭. 없으면 기간 전이면 첫 탭, 기간 후면 마지막 탭 */
function periodIndexFor(date: string): number {
  const found = periods.findIndex((p) => p.dates.includes(date));
  if (found >= 0) return found;
  return date < challenge.startDate ? 0 : periods.length - 1;
}

type BoardState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; participants: Participant[] };

/** /challenge: 위는 로그인 + 오늘의 인증, 아래는 모든 참여자의 진행판 */
export function ChallengeBoard() {
  const auth = useAuth();
  const { connected, user } = auth;
  const [boardState, setBoardState] = useState<BoardState>({ status: 'loading' });
  const [periodIndex, setPeriodIndex] = useState(0);
  // 오늘 날짜는 정적 페이지라 빌드 때가 아닌 브라우저에서 정한다
  const [today, setToday] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<number>(challenge.weeklyMin);
  const [profileFor, setProfileFor] = useState<string | null>(null);

  useEffect(() => {
    const now = todayInKorea();
    setToday(now);
    setPeriodIndex(periodIndexFor(now));
  }, []);

  const reload = useCallback(async () => {
    try {
      const participants = await (await loadCheckinsApi()).loadParticipants();
      setBoardState({ status: 'ready', participants });
    } catch (e) {
      console.error('진행판 불러오기 실패', e);
      setBoardState({ status: 'error' });
    }
  }, []);

  useEffect(() => {
    if (connected) void reload();
  }, [connected, reload]);

  // 로그인한 사람이 이미 참여 중이면 참여 아이디와 목표를 한 번 채워 둔다
  const participants = boardState.status === 'ready' ? boardState.participants : null;
  useEffect(() => {
    if (!user || !participants || profileFor === user.uid) return;
    const me = participants.find((p) => p.uid === user.uid);
    if (me) {
      setName(me.name);
      setGoal(me.goal);
    }
    setProfileFor(user.uid);
  }, [user, participants, profileFor]);

  const me = user && participants ? participants.find((p) => p.uid === user.uid) : undefined;
  const openDates = today ? allDateOptions.filter((option) => option.date <= today) : [];
  const initialDate = openDates.some((o) => o.date === today) ? (today ?? '') : (openDates.at(-1)?.date ?? '');

  const saveDay = async (date: string, next: DayLogs) => {
    if (!user) return;
    const api = await loadCheckinsApi();
    await api.saveParticipant(user.uid, name.trim(), goal);
    await api.saveDay(user.uid, date, next);
    await reload();
    setPeriodIndex(periodIndexFor(date));
  };

  const rows: BoardRow[] = connected
    ? (participants ?? []).map((p) => ({ id: p.uid, name: p.name, isMe: p.uid === user?.uid, goal: p.goal, logs: p.logs }))
    : sampleBoardRows;

  return (
    <section aria-labelledby="challenge-title" className="bg-sky-50 px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-xl">
        <SectionHeading id="challenge-title" eyebrow={board.eyebrow} title={board.title} description={board.description} />
        <AuthPanel controls={auth} prompt={board.signInPrompt} />
        {user && profileFor === user.uid ? (
          openDates.length > 0 ? (
            <div className="mt-6">
              <CheckInForm
                key={user.uid}
                dateOptions={openDates}
                initialDate={initialDate}
                myLogs={me?.logs ?? []}
                name={name}
                onNameChange={setName}
                goal={goal}
                onGoalChange={setGoal}
                onSave={saveDay}
              />
            </div>
          ) : (
            <p className="mt-6 rounded-3xl bg-white p-5 text-center font-bold text-teal-800 shadow-sm">
              {board.notOpenYet(formatLogDate(challenge.startDate))}
            </p>
          )
        ) : null}
      </div>

      <div className="mx-auto mt-12 max-w-4xl" aria-live="polite">
        {connected && boardState.status === 'loading' ? <p className="text-center text-slate-600">{board.loading}</p> : null}
        {connected && boardState.status === 'error' ? (
          <p className="text-center font-medium text-red-700">{board.loadError}</p>
        ) : null}
        {!connected || boardState.status === 'ready' ? (
          <>
            <BoardTable rows={rows} periodIndex={periodIndex} onPeriodChange={setPeriodIndex} sample={!connected} />
            {connected && rows.length === 0 ? <p className="mt-4 text-center text-slate-600">{board.emptyBoard}</p> : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
