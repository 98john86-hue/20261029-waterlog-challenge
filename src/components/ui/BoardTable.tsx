'use client';

import { useMemo, useState } from 'react';
import { board, challenge, weekdays } from '@/content/landing';
import { formatShortDate, getDayLogs, getPeriods, rankByWeek, summarizeWeek, type DayLogs } from '@/lib/board';
import { formatMeters, getTotalDistance } from '@/lib/distance';
import type { SwimLog } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

export type BoardRow = { id: string; name: string; isMe: boolean; goal: number; logs: readonly SwimLog[] };

type BoardTableProps = {
  rows: readonly BoardRow[];
  /** 몇 번째 탭인지 (1~3주차, 마무리 날 순서) */
  periodIndex: number;
  onPeriodChange: (index: number) => void;
  /** 예시 데이터면 표 위에 '예시 데이터' 표시 */
  sample?: boolean;
};

export const boardPeriods = getPeriods(challenge);

const periodLabel = (index: number) => {
  const period = boardPeriods[index];
  return period?.kind === 'week' ? board.weekLabel(period.week) : board.bonusLabel;
};

/** 'YYYY-MM-DD'의 요일 한 글자 */
const weekdayOf = (date: string) => {
  const [y = 0, m = 1, d = 1] = date.split('-').map(Number);
  return weekdays[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
};

// 글자 크기 단계: 표 전체 글자 크기와 칸 너비를 함께 키운다
const zoomStyles = [
  { text: 'text-xs', table: 'min-w-[560px]', clamp: 'line-clamp-3' },
  { text: 'text-sm', table: 'min-w-[680px]', clamp: 'line-clamp-4' },
  { text: 'text-base', table: 'min-w-[860px]', clamp: '' },
] as const;

function DayCell({ day, clamp }: { day: DayLogs; clamp: string }) {
  if (!day.distance && !day.learning) {
    return (
      <span className="block text-slate-500">
        <span className="sr-only">{board.emptyCell}</span>
        <span aria-hidden="true">–</span>
      </span>
    );
  }
  return (
    <span className="flex flex-col gap-1">
      {day.distance ? (
        <span className="font-extrabold text-sky-800">{formatMeters(getTotalDistance(day.distance))}</span>
      ) : null}
      {day.learning ? (
        <span className={`text-slate-800 ${clamp}`}>
          {day.learning.stroke ? <strong className="font-bold text-teal-800">{day.learning.stroke} </strong> : null}
          {day.learning.note}
        </span>
      ) : null}
    </span>
  );
}

/** 전체 진행판: 가로 월~금(마무리 날은 하루), 세로 참여자. 그 주에 기록이 많은 순으로 정렬 */
export function BoardTable({ rows, periodIndex, onPeriodChange, sample = false }: BoardTableProps) {
  // 모바일에서 월~금이 더 많이 보이도록 기본은 작은 글자
  const [zoom, setZoom] = useState(0);
  const period = boardPeriods[periodIndex] ?? boardPeriods[0];
  const dates = useMemo(() => period?.dates ?? [], [period]);
  const isWeek = period?.kind === 'week';
  const ranked = useMemo(() => rankByWeek(rows, dates, isWeek), [rows, dates, isWeek]);
  const style = zoomStyles[zoom] ?? zoomStyles[1];

  return (
    <div>
      <div className="px-4 text-center">
        <h3 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{board.boardTitle}</h3>
        <p className="mt-2 text-sm text-slate-600">{board.boardDescription}</p>
        {sample ? (
          <div className="mt-2 flex justify-center">
            <Badge tone="sample">{board.sampleNotice}</Badge>
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label={board.weekTabsLabel} className="grid grid-cols-4 gap-1 rounded-2xl bg-white p-1 shadow-sm">
          {boardPeriods.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-pressed={i === periodIndex}
              onClick={() => onPeriodChange(i)}
              className={`rounded-xl px-3 py-2 text-sm font-bold ${
                i === periodIndex ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {periodLabel(i)}
            </button>
          ))}
        </div>
        <div role="group" aria-label={board.zoomLabel} className="flex items-center justify-end gap-1">
          <span className="mr-1 text-sm font-bold text-slate-700" aria-hidden="true">
            {board.zoomLabel}
          </span>
          {board.zoomOptions.map((label, i) => (
            <button
              key={label}
              type="button"
              aria-pressed={i === zoom}
              onClick={() => setZoom(i)}
              className={`rounded-full border-2 px-3 py-1 font-bold ${['text-xs', 'text-sm', 'text-base'][i]} ${
                i === zoom ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-300 bg-white text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-2 px-4 text-xs text-slate-600">
        {isWeek
          ? `${formatShortDate(dates[0] ?? '')}~${formatShortDate(dates.at(-1) ?? '')} · ${board.goalHint}`
          : `${formatShortDate(dates[0] ?? '')} · ${board.bonusHint}`}
      </p>

      <div className="relative mx-4 mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* 마무리 날은 한 칸뿐이라 최소 너비 없이 화면에 맞춘다 */}
        <table className={`w-full table-fixed border-collapse ${style.text} ${isWeek ? style.table : ''}`}>
          <caption className="sr-only">
            {period?.kind === 'week' ? board.tableCaption(period.week) : board.bonusCaption}
          </caption>
          <colgroup>
            <col className="w-[7.5em]" />
            {dates.map((date) => (
              <col key={date} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th scope="col" className="sticky left-0 z-10 bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-700">
                {board.participantHeader}
              </th>
              {dates.map((date) => (
                <th key={date} scope="col" className="px-2 py-2.5 text-left font-bold text-slate-700">
                  {weekdayOf(date)} <span className="font-medium text-slate-500">{formatShortDate(date)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranked.map((row) => {
              const summary = summarizeWeek(row.logs, dates);
              return (
                <tr key={row.id} className={`border-b border-slate-100 last:border-0 ${row.isMe ? 'bg-amber-50' : ''}`}>
                  <th
                    scope="row"
                    className={`sticky left-0 z-10 px-3 py-3 text-left align-top font-normal ${row.isMe ? 'bg-amber-50' : 'bg-white'}`}
                  >
                    <span className="block font-bold break-all text-slate-900">
                      {row.name}
                      {row.isMe ? <span className="ml-1 font-medium text-amber-800">({board.meTag})</span> : null}
                    </span>
                    {isWeek ? (
                      <span className="mt-1 flex flex-wrap items-center gap-1">
                        <span className="text-slate-600" aria-label={board.goalProgressLabel(summary.days, row.goal)}>
                          {board.weeklyCount(summary.days, row.goal)}
                        </span>
                        {summary.days >= row.goal ? (
                          <span role="img" aria-label={board.goalMetLabel} className="text-lg leading-none">
                            {board.goalMedal}
                          </span>
                        ) : null}
                      </span>
                    ) : summary.days > 0 ? (
                      <span className="mt-1 block font-bold text-emerald-800">{board.bonusDone}</span>
                    ) : null}
                  </th>
                  {dates.map((date) => (
                    <td key={date} className="px-2 py-3 align-top leading-snug">
                      <DayCell day={getDayLogs(row.logs, date)} clamp={style.clamp} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {isWeek ? <p className="mt-2 px-4 text-xs text-slate-600">{board.zoomHint}</p> : null}
    </div>
  );
}
