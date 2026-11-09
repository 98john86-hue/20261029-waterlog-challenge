'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { board, challenge } from '@/content/landing';
import { getPeriods, todayInKorea, type DayLogs } from '@/lib/board';
import { loadPostsApi } from '@/lib/community';
import { formatLogDate } from '@/lib/date';
import { recordKey, summarizeCheers, toggleCheer, type Cheer, type HostComment } from '@/lib/feedback';
import type { Participant } from '@/lib/firebase/checkins';
import { firstPostError, questionFromCheckIn, validateQuestion } from '@/lib/posts';
import { sampleBoardRows } from '@/lib/sampleBoard';
import { newAnswers, newComments, readSeen, writeSeen, type Seen } from '@/lib/seen';
import type { Question } from '@/lib/types';
import { CommentDialog } from '@/components/challenge/CommentDialog';
import { AuthPanel } from '@/components/community/AuthPanel';
import { useAuth } from '@/components/community/useAuth';
import { BoardTable, type BoardFeedback, type BoardRow } from '@/components/ui/BoardTable';
import { buttonStyles } from '@/components/ui/Button';
import { CheckInForm, type CheckInSaveResult, type DateOption } from '@/components/ui/CheckInForm';
import { SectionHeading } from '@/components/ui/SectionHeading';

/** Firebase 코드는 실제로 쓸 때만 불러온다 */
const loadCheckinsApi = () => import('@/lib/firebase/checkins');
const loadFeedbackApi = () => import('@/lib/firebase/feedback');

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

/** 한마디·응원은 부가 기능이라 못 불러와도 진행판은 보여 준다 */
async function loadOrEmpty<T>(load: () => Promise<T[]>, label: string): Promise<T[]> {
  try {
    return await load();
  } catch (e) {
    console.warn(`${label} 불러오기 실패`, e);
    return [];
  }
}

type BoardState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; participants: Participant[]; comments: HostComment[]; cheers: Cheer[] };

type CommentTarget = { row: BoardRow; date: string };

/** /challenge: 위는 로그인 + 새 소식 + 오늘의 인증, 아래는 모든 참여자의 진행판 */
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
  const [myQuestions, setMyQuestions] = useState<Question[]>([]);
  const [seen, setSeen] = useState<Seen | null>(null);
  const [commentTarget, setCommentTarget] = useState<CommentTarget | null>(null);
  const [cheerError, setCheerError] = useState('');

  useEffect(() => {
    const now = todayInKorea();
    setToday(now);
    setPeriodIndex(periodIndexFor(now));
  }, []);

  const reload = useCallback(async () => {
    try {
      const [checkins, feedback] = await Promise.all([loadCheckinsApi(), loadFeedbackApi()]);
      const [participants, comments, cheers] = await Promise.all([
        checkins.loadParticipants(),
        loadOrEmpty(feedback.loadHostComments, '운영자 한마디'),
        loadOrEmpty(feedback.loadCheers, '응원'),
      ]);
      setBoardState({ status: 'ready', participants, comments, cheers });
    } catch (e) {
      console.error('진행판 불러오기 실패', e);
      setBoardState({ status: 'error' });
    }
  }, []);

  useEffect(() => {
    if (connected) void reload();
  }, [connected, reload]);

  // 새 소식: 내 질문의 답변과, 마지막으로 확인한 시각
  useEffect(() => {
    if (!user) return;
    setSeen(readSeen(user.uid));
    let cancelled = false;
    void loadOrEmpty(async () => (await loadPostsApi()).loadQuestions(), '질문').then((questions) => {
      if (!cancelled) setMyQuestions(questions.filter((q) => q.authorUid === user.uid));
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  // 로그인한 사람이 이미 참여 중이면 참여 아이디와 목표를 한 번 채워 둔다
  const ready = boardState.status === 'ready' ? boardState : null;
  const participants = ready?.participants ?? null;
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

  const answeredCount = user && seen ? newAnswers(myQuestions, user.uid, seen.answers).length : 0;
  const unseenComments = useMemo(
    () => (user && seen && ready ? newComments(ready.comments, user.uid, seen.comments) : []),
    [user, seen, ready],
  );

  const confirmComments = () => {
    if (!user) return;
    writeSeen(user.uid, { comments: Date.now() });
    setSeen(readSeen(user.uid));
  };

  const saveDay = async (date: string, next: DayLogs, question: string): Promise<CheckInSaveResult> => {
    if (!user) return { question: 'none' };
    const api = await loadCheckinsApi();
    await api.saveParticipant(user.uid, name.trim(), goal);
    await api.saveDay(user.uid, date, next);

    let result: CheckInSaveResult = { question: 'none' };
    if (question) {
      try {
        const draft = questionFromCheckIn(name.trim(), next.learning?.stroke ?? '기타', question);
        if (firstPostError(validateQuestion(draft))) throw new Error('질문 내용이 올바르지 않아요');
        await (await loadPostsApi()).addQuestion(user.uid, draft);
        result = { question: 'sent' };
      } catch (e) {
        console.error('인증하며 남긴 질문 저장 실패', e);
        result = { question: 'failed' };
      }
    }
    await reload();
    setPeriodIndex(periodIndexFor(date));
    return result;
  };

  const handleToggleCheer = async (row: BoardRow, date: string) => {
    if (!user || !ready) return;
    const mine = ready.cheers.some((c) => c.target === row.id && c.date === date && c.from === user.uid);
    const flip = () =>
      setBoardState((prev) =>
        prev.status === 'ready' ? { ...prev, cheers: toggleCheer(prev.cheers, row.id, date, user.uid) } : prev,
      );
    // 누르자마자 화면에 반영하고, 저장에 실패하면 되돌린다
    flip();
    setCheerError('');
    try {
      const api = await loadFeedbackApi();
      await (mine ? api.removeCheer(row.id, date, user.uid) : api.addCheer(row.id, date, user.uid));
    } catch (e) {
      console.error('응원 저장 실패', e);
      flip();
      setCheerError(board.cheerError);
    }
  };

  const rows: BoardRow[] = connected
    ? (participants ?? []).map((p) => ({ id: p.uid, name: p.name, isMe: p.uid === user?.uid, goal: p.goal, logs: p.logs }))
    : sampleBoardRows;

  const feedback: BoardFeedback | undefined = ready
    ? {
        comments: new Map(ready.comments.map((c) => [recordKey(c.uid, c.date), c])),
        newCommentKeys: new Set(unseenComments.map((c) => recordKey(c.uid, c.date))),
        cheers: summarizeCheers(ready.cheers, user?.uid),
        ...(user ? { onToggleCheer: (row: BoardRow, date: string) => void handleToggleCheer(row, date) } : {}),
        ...(user?.isOperator ? { onComment: (row: BoardRow, date: string) => setCommentTarget({ row, date }) } : {}),
      }
    : undefined;

  const editing = commentTarget && ready ? ready.comments.find((c) => c.uid === commentTarget.row.id && c.date === commentTarget.date) : undefined;

  return (
    <section aria-labelledby="challenge-title" className="bg-sky-50 px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-xl">
        <SectionHeading id="challenge-title" eyebrow={board.eyebrow} title={board.title} description={board.description} />
        <div className="-mt-2 flex justify-center">
          <a href="#checkin" className={buttonStyles('outline', 'sm')}>
            {board.jumpToCheckin}
          </a>
        </div>
        {answeredCount > 0 || unseenComments.length > 0 ? (
          <div role="status" className="mt-6 rounded-3xl border-2 border-amber-300 bg-amber-50 p-5 shadow-sm">
            <p className="font-extrabold text-amber-900">💬 {board.newsTitle}</p>
            {answeredCount > 0 ? (
              <p className="mt-2 text-slate-800">
                {board.newAnswers(answeredCount)}{' '}
                <Link href="/qna" className="font-bold text-teal-800 underline underline-offset-4">
                  {board.newAnswersLink}
                </Link>
              </p>
            ) : null}
            {unseenComments.length > 0 ? (
              <p className="mt-2 text-slate-800">
                {board.newComments(unseenComments.length)}{' '}
                <button
                  type="button"
                  onClick={confirmComments}
                  className="font-bold text-teal-800 underline underline-offset-4"
                >
                  {board.newCommentsDone}
                </button>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* 진행판을 맨 위에: 다른 참여자의 기록을 보고 참고한 뒤 아래에서 인증한다 */}
      <div className="mx-auto mt-8 max-w-4xl" aria-live="polite">
        {connected && boardState.status === 'loading' ? <p className="text-center text-slate-600">{board.loading}</p> : null}
        {connected && boardState.status === 'error' ? (
          <p className="text-center font-medium text-red-700">{board.loadError}</p>
        ) : null}
        {!connected || ready ? (
          <>
            <BoardTable
              rows={rows}
              periodIndex={periodIndex}
              onPeriodChange={setPeriodIndex}
              sample={!connected}
              feedback={feedback}
            />
            <p role="alert" className="mt-2 text-center text-sm font-medium text-red-700 empty:hidden">
              {cheerError}
            </p>
            {connected && rows.length === 0 ? <p className="mt-4 text-center text-slate-600">{board.emptyBoard}</p> : null}
          </>
        ) : null}
      </div>

      <div id="checkin" className="mx-auto mt-14 max-w-xl scroll-mt-20">
        <h3 className="mb-4 text-center text-xl font-extrabold text-slate-900 sm:text-2xl">{board.checkinTitle}</h3>
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

      {commentTarget ? (
        <CommentDialog
          key={recordKey(commentTarget.row.id, commentTarget.date)}
          title={board.commentDialogTitle(commentTarget.row.name, formatLogDate(commentTarget.date))}
          initialBody={editing?.body ?? ''}
          onSave={async (body) => {
            await (await loadFeedbackApi()).saveHostComment(commentTarget.row.id, commentTarget.date, body);
            await reload();
          }}
          onDelete={async () => {
            await (await loadFeedbackApi()).deleteHostComment(commentTarget.row.id, commentTarget.date);
            await reload();
          }}
          onClose={() => setCommentTarget(null)}
        />
      ) : null}
    </section>
  );
}
