'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';

export const labelClass = 'block font-bold text-slate-900';
const inputClass =
  'mt-2 w-full rounded-xl border-2 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 focus:border-teal-600';
const borderFor = (error?: string) => (error ? 'border-red-600' : 'border-slate-300');

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder?: string;
  error?: string;
  /** 여러 줄 입력이면 줄 수 */
  rows?: number;
  type?: 'text' | 'url';
};

/** 라벨 + 입력칸 + 글자 수 + 에러 메시지. 에러가 난 칸으로 포커스를 옮길 땐 focusField(id)를 쓴다 */
export function TextField({ id, label, value, onChange, maxLength, placeholder, error, rows, type = 'text' }: TextFieldProps) {
  const errorId = `${id}-error`;
  const shared = {
    id,
    value,
    maxLength,
    placeholder,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? errorId : undefined,
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
    className: `${inputClass} ${borderFor(error)} ${rows ? 'resize-y' : ''}`,
  };
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {rows ? <textarea rows={rows} {...shared} /> : <input type={type} {...shared} />}
      <div className="mt-1 flex items-start justify-between gap-3 text-sm">
        <span>
          {error ? (
            <span id={errorId} className="font-medium text-red-700">
              {error}
            </span>
          ) : null}
        </span>
        <span className="shrink-0 text-slate-500" aria-hidden="true">
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
}

/** 라디오 보기를 알약 모양으로 (영법·분류 고르기, 목록 거르기에 같이 쓴다) */
export function Pill({ children, ...input }: { children: ReactNode } & ComponentPropsWithRef<'input'>) {
  return (
    <label className="cursor-pointer rounded-full border-2 border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 has-checked:border-teal-700 has-checked:bg-teal-700 has-checked:text-white has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent">
      <input type="radio" className="sr-only" {...input} />
      {children}
    </label>
  );
}

type PillGroupProps<T extends string> = {
  name: string;
  legend: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  /** 목록 위 거르기처럼 제목을 작게 보여 줄 때 */
  compact?: boolean;
};

export function PillGroup<T extends string>({ name, legend, options, value, onChange, compact }: PillGroupProps<T>) {
  return (
    <fieldset>
      <legend className={compact ? 'text-sm font-bold text-slate-700' : labelClass}>{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <Pill
            key={option.value}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          >
            {option.label}
          </Pill>
        ))}
      </div>
    </fieldset>
  );
}

export function focusField(id: string) {
  document.getElementById(id)?.focus();
}
