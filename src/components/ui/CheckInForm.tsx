'use client';

import { useState, type FormEvent } from 'react';
import { board, challenge, strokeOptions } from '@/content/landing';
import { getDayLogs, type DayLogs } from '@/lib/board';
import { formatLogDate } from '@/lib/date';
import { formatMeters, getTotalDistance } from '@/lib/distance';
import type { Stroke, SwimLog } from '@/lib/types';
import { buttonStyles } from '@/components/ui/Button';

export type DateOption = { date: string; label: string };

/** 질문을 함께 보냈는지: 'none' 질문 없음, 'sent' 보냄, 'failed' 인증만 저장되고 질문은 실패 */
export type CheckInSaveResult = { question: 'none' | 'sent' | 'failed' };

type CheckInFormProps = {
  /** 인증할 수 있는 날짜 (비어 있지 않아야 한다) */
  dateOptions: readonly DateOption[];
  /** 처음 고를 날짜 (보통 오늘) */
  initialDate: string;
  myLogs: readonly SwimLog[];
  name: string;
  onNameChange: (name: string) => void;
  goal: number;
  onGoalChange: (goal: number) => void;
  /**
   * 빈 DayLogs면 그날 인증을 지운다. 인증 저장에 실패하면 throw.
   * question이 있으면 Q&A 질문으로도 올리고, 그 결과를 돌려준다 (질문이 실패해도 인증은 저장된 상태).
   */
  onSave: (date: string, next: DayLogs, question: string) => Promise<CheckInSaveResult>;
};

const copy = board.form;

export const NAME_MAX = 12;
export const LAPS_MAX = 200;
export const NOTE_MAX = 200;
export const QUESTION_MAX = 500;

const labelClass = 'block font-bold text-slate-900';
const hintClass = 'mt-0.5 text-sm text-slate-600';
const fieldClass =
  'mt-2 w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 focus:border-teal-600';

const goalOptions = Array.from(
  { length: challenge.weeklyMax - challenge.weeklyMin + 1 },
  (_, i) => challenge.weeklyMin + i,
);

const isStroke = (value: string): value is Stroke => (strokeOptions as readonly string[]).includes(value);

/** 첨부된 인증 화면처럼 날짜 → 아이디 → 거리 → 습득한 기술 순서의 한 장짜리 폼 */
export function CheckInForm({ dateOptions, initialDate, myLogs, name, onNameChange, goal, onGoalChange, onSave }: CheckInFormProps) {
  const [date, setDate] = useState(initialDate);
  const [laneLength, setLaneLength] = useState<number>(copy.laneOptions[0]);
  const [laps, setLaps] = useState('');
  const [stroke, setStroke] = useState<Stroke>('자유형');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [question, setQuestion] = useState('');

  const existing = getDayLogs(myLogs, date);
  const hasExisting = Boolean(existing.distance || existing.learning);

  // 날짜를 바꾸면 그날 이미 낸 인증으로 입력칸을 채운다
  const changeDate = (next: string, logs: readonly SwimLog[] = myLogs) => {
    const day = getDayLogs(logs, next);
    setDate(next);
    setLaneLength(day.distance?.laneLength ?? copy.laneOptions[0]);
    setLaps(day.distance ? String(day.distance.laps) : '');
    setStroke(day.learning?.stroke ?? '자유형');
    setNote(day.learning?.note ?? '');
    setError('');
    setMessage('');
  };

  const lapCount = Number.parseInt(laps, 10);
  const hasDistance = Number.isFinite(lapCount) && lapCount > 0;
  const trimmedNote = note.trim();

  /** 저장하고 결과 문구를 보여 준다. 실패하면 안내 문구를 보여 주고 false */
  const save = async (next: DayLogs, done: string, questionText = ''): Promise<boolean> => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const result = await onSave(date, next, questionText);
      if (result.question === 'sent') {
        setQuestion('');
        setMessage(`${done} ${copy.questionSent}`);
      } else {
        setMessage(done);
        if (result.question === 'failed') setError(copy.questionFailed);
      }
      return true;
    } catch (e) {
      console.error('인증 저장 실패', e);
      setError(copy.saveError);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving) return;
    const problem = !name.trim()
      ? copy.nameRequired
      : !hasDistance && !trimmedNote
        ? copy.emptyError
        : hasDistance && lapCount > LAPS_MAX
          ? copy.lapsTooMany
          : '';
    if (problem) {
      setError(problem);
      setMessage('');
      return;
    }
    await save(
      {
        ...(hasDistance ? { distance: { type: 'distance', date, laneLength, laps: lapCount } } : {}),
        ...(trimmedNote ? { learning: { type: 'learning', date, stroke, note: trimmedNote } } : {}),
      },
      copy.success(formatLogDate(date)),
      question.trim(),
    );
  };

  const handleRemove = async () => {
    if (saving) return;
    const done = copy.removed(formatLogDate(date));
    if (!(await save({}, done))) return;
    // 지운 뒤에는 빈 칸으로
    changeDate(date, []);
    setMessage(done);
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-3xl bg-white p-5 shadow-sm sm:p-7">
      <div>
        <label htmlFor="checkin-date" className={labelClass}>
          {copy.dateLabel}
        </label>
        <select id="checkin-date" value={date} onChange={(e) => changeDate(e.target.value)} className={fieldClass}>
          {dateOptions.map((option) => (
            <option key={option.date} value={option.date}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="checkin-name" className={labelClass}>
          {copy.nameLabel}
        </label>
        <p id="checkin-name-hint" className={hintClass}>
          {copy.nameHint}
        </p>
        <input
          id="checkin-name"
          type="text"
          maxLength={NAME_MAX}
          autoComplete="nickname"
          value={name}
          placeholder={copy.namePlaceholder}
          onChange={(e) => onNameChange(e.target.value)}
          aria-describedby="checkin-name-hint"
          className={fieldClass}
        />
      </div>

      <fieldset aria-describedby="checkin-goal-hint">
        <legend className={labelClass}>{copy.goalLabel}</legend>
        <p id="checkin-goal-hint" className={hintClass}>
          {copy.goalHint}
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {goalOptions.map((n) => (
            <label
              key={n}
              className="cursor-pointer rounded-xl border-2 border-slate-300 bg-white py-2.5 text-center font-bold text-slate-800 has-checked:border-teal-700 has-checked:bg-teal-700 has-checked:text-white has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
            >
              <input
                type="radio"
                name="checkin-goal"
                value={n}
                checked={goal === n}
                onChange={() => onGoalChange(n)}
                className="sr-only"
              />
              {copy.goalOption(n)}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={labelClass}>{copy.distanceLabel}</legend>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="checkin-lane" className="mt-2 block text-sm text-slate-700">
              {copy.laneLabel}
            </label>
            <select
              id="checkin-lane"
              value={laneLength}
              onChange={(e) => setLaneLength(Number(e.target.value))}
              className={`${fieldClass} mt-1`}
            >
              {copy.laneOptions.map((len) => (
                <option key={len} value={len}>
                  {len}m
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="checkin-laps" className="mt-2 block text-sm text-slate-700">
              {copy.lapsLabel}
            </label>
            <input
              id="checkin-laps"
              type="number"
              inputMode="numeric"
              min={0}
              max={LAPS_MAX}
              value={laps}
              placeholder={copy.lapsPlaceholder}
              onChange={(e) => {
                setLaps(e.target.value);
                setError('');
              }}
              className={`${fieldClass} mt-1`}
            />
          </div>
        </div>
        {hasDistance ? (
          <p className="mt-2 font-bold text-teal-800" aria-live="polite">
            = {formatMeters(getTotalDistance({ laneLength, laps: lapCount }))}
          </p>
        ) : null}
      </fieldset>

      <fieldset>
        <legend className={labelClass}>{copy.skillLabel}</legend>
        <label htmlFor="checkin-stroke" className="mt-2 block text-sm text-slate-700">
          {copy.strokeLabel}
        </label>
        <select
          id="checkin-stroke"
          value={stroke}
          onChange={(e) => {
            if (isStroke(e.target.value)) setStroke(e.target.value);
          }}
          className={`${fieldClass} mt-1`}
        >
          {strokeOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <label htmlFor="checkin-note" className="sr-only">
          {copy.skillLabel}
        </label>
        <textarea
          id="checkin-note"
          rows={4}
          maxLength={NOTE_MAX}
          value={note}
          placeholder={copy.skillPlaceholder}
          onChange={(e) => {
            setNote(e.target.value);
            setError('');
          }}
          className={`${fieldClass} resize-none`}
        />
      </fieldset>

      <div>
        <label htmlFor="checkin-question" className={labelClass}>
          {copy.questionLabel}
        </label>
        <p id="checkin-question-hint" className={hintClass}>
          {copy.questionHint}
        </p>
        <textarea
          id="checkin-question"
          rows={3}
          maxLength={QUESTION_MAX}
          value={question}
          placeholder={copy.questionPlaceholder}
          onChange={(e) => setQuestion(e.target.value)}
          aria-describedby="checkin-question-hint"
          className={`${fieldClass} resize-none`}
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm text-slate-600">{copy.oneIsEnough}</p>
        <p role="alert" className="text-sm font-medium text-red-700 empty:hidden">
          {error}
        </p>
        <button type="submit" disabled={saving} className={`${buttonStyles()} w-full`}>
          {saving ? copy.saving : hasExisting ? copy.update : copy.submit}
        </button>
        {hasExisting ? (
          <button
            type="button"
            onClick={handleRemove}
            disabled={saving}
            className="self-center rounded-full px-3 py-1.5 text-sm font-bold text-red-700 hover:bg-red-50"
          >
            {copy.remove}
          </button>
        ) : null}
        <p role="status" className="text-center font-bold text-emerald-800 empty:hidden">
          {message}
        </p>
      </div>
    </form>
  );
}
