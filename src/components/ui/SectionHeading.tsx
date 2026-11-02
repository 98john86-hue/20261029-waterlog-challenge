import type { ReactNode } from 'react';

type SectionHeadingProps = {
  id: string;
  eyebrow: string;
  /** 줄을 바꿀 곳에 \n */
  title: string;
  description?: string;
  badge?: ReactNode;
  tone?: 'default' | 'inverse';
};

export function SectionHeading({ id, eyebrow, title, description, badge, tone = 'default' }: SectionHeadingProps) {
  const inverse = tone === 'inverse';
  return (
    <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
      <p className={`text-sm font-bold tracking-wider ${inverse ? 'text-cyan-100' : 'text-teal-700'}`}>{eyebrow}</p>
      <h2
        id={id}
        className={`mt-2 text-2xl font-extrabold tracking-tight whitespace-pre-line sm:text-4xl ${inverse ? 'text-white' : 'text-slate-900'}`}
      >
        {title}
      </h2>
      {badge ? <div className="mt-3 flex justify-center">{badge}</div> : null}
      {description ? (
        <p className={`mt-4 text-base sm:text-lg ${inverse ? 'text-cyan-50' : 'text-slate-600'}`}>{description}</p>
      ) : null}
    </div>
  );
}
