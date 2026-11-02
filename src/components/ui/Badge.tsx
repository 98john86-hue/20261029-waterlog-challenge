import type { ReactNode } from 'react';

type BadgeTone = 'sample' | 'success' | 'tag' | 'muted';

const toneClass: Record<BadgeTone, string> = {
  // 실제 데이터로 오해하지 않도록 눈에 띄는 점선 테두리
  sample: 'border-2 border-dashed border-amber-500 bg-amber-50 px-3 py-1 text-amber-900',
  success: 'bg-emerald-50 px-2.5 py-1 text-emerald-800',
  tag: 'bg-teal-700 px-3 py-1 text-white',
  muted: 'bg-slate-100 px-2.5 py-1 text-slate-700',
};

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full text-xs font-bold ${toneClass[tone]}`}>
      {children}
    </span>
  );
}
