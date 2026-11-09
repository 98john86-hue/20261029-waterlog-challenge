'use client';

import { useEffect, useRef } from 'react';
import { board } from '@/content/landing';
import type { DayLogs } from '@/lib/board';
import { formatLogDate } from '@/lib/date';
import { formatMeters, getTotalDistance } from '@/lib/distance';
import type { HostComment } from '@/lib/feedback';
import { buttonStyles } from '@/components/ui/Button';

type RecordDialogProps = {
  name: string;
  date: string;
  day: DayLogs;
  comment?: HostComment;
  cheerCount: number;
  onClose: () => void;
};

/** 진행판 칸은 좁아서 글이 잘리므로, 기록을 누르면 전체 내용을 이 창에서 보여 준다 (Esc나 바깥 누르기로 닫힘) */
export function RecordDialog({ name, date, day, comment, cheerCount, onClose }: RecordDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // 창 바깥(어두운 부분)을 누르면 닫는다
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
      aria-labelledby="record-dialog-title"
      className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-3xl bg-white p-0 text-left shadow-xl backdrop:bg-slate-900/50"
    >
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <h2 id="record-dialog-title" className="text-lg font-extrabold text-slate-900">
          {board.recordDialogTitle(name, formatLogDate(date))}
        </h2>
        {day.distance ? (
          <div>
            <p className="text-sm font-bold text-slate-600">{board.form.distanceLabel}</p>
            <p className="mt-1 text-xl font-extrabold text-sky-800">
              {board.recordDistance(day.distance.laneLength, day.distance.laps, formatMeters(getTotalDistance(day.distance)))}
            </p>
          </div>
        ) : null}
        {day.learning ? (
          <div>
            <p className="text-sm font-bold text-slate-600">{board.form.skillLabel}</p>
            <p className="mt-1 leading-relaxed whitespace-pre-line text-slate-900">
              {day.learning.stroke ? <strong className="font-bold text-teal-800">{day.learning.stroke} </strong> : null}
              {day.learning.note}
            </p>
          </div>
        ) : null}
        {comment ? (
          <div className="rounded-2xl border-l-4 border-teal-600 bg-teal-50 p-4">
            <p className="text-sm font-bold text-teal-900">💬 {board.hostComment}</p>
            <p className="mt-1 leading-relaxed whitespace-pre-line text-slate-800">{comment.body}</p>
          </div>
        ) : null}
        {cheerCount > 0 ? (
          <p className="font-bold text-amber-800">
            {board.cheer} {board.cheerCount(cheerCount)}
          </p>
        ) : null}
        <button type="button" onClick={() => ref.current?.close()} className={`${buttonStyles('outline', 'sm')} self-end`}>
          {board.commentClose}
        </button>
      </div>
    </dialog>
  );
}
