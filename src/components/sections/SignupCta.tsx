'use client';

import { useRef, useState, type ComponentPropsWithRef, type FormEvent, type ReactNode } from 'react';
import { levelOrder, signup, story } from '@/content/landing';
import { submitSignup } from '@/lib/signup';
import type { Level, ReferralSource, SignupData, SwimFrequency } from '@/lib/types';
import {
  formatPhone,
  normalizePhone,
  signupFieldOrder,
  validateSignup,
  type SignupDraft,
  type SignupErrors,
  type SignupField,
} from '@/lib/validation';
import { ButtonLink, buttonStyles } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { KakaoChatLink } from '@/components/ui/KakaoChatLink';
import { useChallengePhase } from '@/components/useChallengePhase';

type Status = 'idle' | 'loading' | 'success' | 'error';

type FormValues = {
  name: string;
  phone: string;
  email: string;
  frequency: SwimFrequency | '';
  level: Level | '';
  goal: string;
  referral: ReferralSource | '';
  agreed: boolean;
};

const emptyValues: FormValues = { name: '', phone: '', email: '', frequency: '', level: '', goal: '', referral: '', agreed: false };

const referralKeys = Object.keys(signup.referralOptions) as ReferralSource[];
const frequencyKeys = Object.keys(signup.frequencyOptions) as SwimFrequency[];

const inputClass =
  'mt-2 w-full rounded-xl border-2 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 focus:border-teal-600';
const labelClass = 'block font-bold text-slate-900';
const borderFor = (error?: string) => (error ? 'border-red-600' : 'border-slate-300');

/**
 * 라디오 보기를 버튼처럼 보이는 알약 모양으로 (한 줄에 여러 개 배치해 폼 길이를 줄인다).
 * 선택 질문은 onClick에서 이미 고른 보기를 다시 누르면 선택을 푼다 (라디오는 원래 해제가 안 됨).
 */
function Pill({ children, ...input }: { children: ReactNode } & ComponentPropsWithRef<'input'>) {
  return (
    <label className="cursor-pointer rounded-full border-2 border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 has-checked:border-teal-700 has-checked:bg-teal-700 has-checked:text-white has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent">
      <input type="radio" className="sr-only" {...input} />
      {children}
    </label>
  );
}

function RequiredMark() {
  return (
    <span className="ml-0.5 text-red-700" aria-hidden="true">
      *
    </span>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 flex items-center gap-1.5 text-sm font-medium text-red-700">
      <span aria-hidden="true">!</span>
      {message}
    </p>
  );
}

const errorId = (field: SignupField) => `signup-${field}-error`;

export function SignupCta() {
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fieldRefs = useRef<Partial<Record<SignupField, HTMLInputElement | HTMLTextAreaElement | null>>>({});
  const successRef = useRef<HTMLDivElement>(null);

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const describedBy = (field: SignupField, extra?: string) =>
    [extra, errors[field] ? errorId(field) : undefined].filter(Boolean).join(' ') || undefined;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'loading') return;

    const goal = values.goal.trim();
    const draft: SignupDraft = {
      name: values.name.trim(),
      phone: normalizePhone(values.phone),
      email: values.email.trim(),
      agreed: values.agreed,
      ...(values.frequency ? { frequency: values.frequency } : {}),
      ...(values.level ? { level: values.level } : {}),
      ...(goal ? { goal } : {}),
      ...(values.referral ? { referral: values.referral } : {}),
    };

    const nextErrors = validateSignup(draft);
    setErrors(nextErrors);
    // 화면 순서상 첫 번째 에러 필드로 포커스 이동
    const firstInvalid = signupFieldOrder.find((field) => nextErrors[field]);
    if (firstInvalid || !draft.frequency) {
      if (firstInvalid) fieldRefs.current[firstInvalid]?.focus();
      return;
    }
    const data: SignupData = { ...draft, frequency: draft.frequency };

    setStatus('loading');
    setErrorMessage('');
    try {
      const result = await submitSignup(data);
      if (result.ok) {
        setStatus('success');
        requestAnimationFrame(() => successRef.current?.focus());
      } else {
        setStatus('error');
        setErrorMessage(result.message);
      }
    } catch {
      setStatus('error');
      setErrorMessage(signup.genericError);
    }
  };

  const clearForm = () => {
    setValues(emptyValues);
    setErrors({});
    setStatus('idle');
    setErrorMessage('');
  };

  const restart = () => {
    clearForm();
    requestAnimationFrame(() => fieldRefs.current.name?.focus());
  };

  const loading = status === 'loading';
  // 챌린지가 시작되면 신청 폼 대신 오늘의 인증으로 안내한다 (src/lib/phase.ts)
  const phase = useChallengePhase();
  const joinCopy = phase.kind === 'before' ? null : signup[phase.kind];

  return (
    <section id="signup" aria-labelledby="signup-title" className="scroll-mt-16 bg-teal-800 px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-xl">
        {/* 워터로그 챌린지 이야기: 한 항목이 한 줄이 되도록 화면 폭에 맞춰 글자 크기를 조절 */}
        <div className="mb-10 text-center text-white">
          <p className="text-sm font-bold tracking-wider text-cyan-100">{joinCopy?.eyebrow ?? signup.eyebrow}</p>
          <h2 id="signup-title" className="mt-2 text-2xl font-extrabold sm:text-4xl">
            {story.title}
          </h2>
          <div className="mt-8 flex flex-col gap-6 text-[clamp(14px,4.1vw,19px)] leading-relaxed text-cyan-50">
            {story.stanzas.map((stanza) => (
              <p key={stanza[0]}>
                {stanza.map((line) => (
                  <span key={line} className="block whitespace-nowrap">
                    {line}
                  </span>
                ))}
              </p>
            ))}
          </div>
          <p className="mt-8 text-[clamp(18px,5.2vw,30px)] leading-snug font-extrabold">
            {story.closing.map((line) => (
              <span key={line} className="block whitespace-nowrap">
                {line}
              </span>
            ))}
          </p>
          {joinCopy ? null : <p className="mt-8 text-sm text-cyan-100">{signup.description}</p>}
        </div>

        {joinCopy ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-8">
            <p className="text-xl font-extrabold text-slate-900">{joinCopy.title}</p>
            <p className="leading-relaxed text-slate-700">{joinCopy.description}</p>
            <ButtonLink href="/challenge" className="mt-3 w-full sm:w-auto">
              {joinCopy.cta}
            </ButtonLink>
            <KakaoChatLink />
          </div>
        ) : status === 'success' ? (
          <div ref={successRef} tabIndex={-1} role="status" className="rounded-3xl bg-white p-8 text-center shadow-2xl">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <Icon name="check" className="size-8" />
            </span>
            <p className="mt-4 text-lg font-bold text-slate-900">{signup.success}</p>
            <button
              type="button"
              onClick={restart}
              className="mt-6 text-sm font-bold text-teal-800 underline underline-offset-4"
            >
              {signup.resetLabel}
            </button>
          </div>
        ) : (
          <form
            noValidate
            onSubmit={handleSubmit}
            aria-busy={loading}
            className="rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
          >
            <p className="text-sm font-medium text-red-700">{signup.requiredNotice}</p>

            <fieldset disabled={loading} className="mt-5 flex flex-col gap-6">
              <div>
                <label htmlFor="signup-name" className={labelClass}>
                  {signup.nameLabel}
                  <RequiredMark />
                </label>
                <input
                  ref={(el) => {
                    fieldRefs.current.name = el;
                  }}
                  id="signup-name"
                  name="name"
                  type="text"
                  autoComplete="nickname"
                  required
                  maxLength={signup.limits.name}
                  placeholder={signup.answerPlaceholder}
                  value={values.name}
                  onChange={(e) => update('name', e.target.value)}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={describedBy('name')}
                  className={`${inputClass} ${borderFor(errors.name)}`}
                />
                <FieldError id={errorId('name')} message={errors.name} />
              </div>

              <div>
                <label htmlFor="signup-phone" className={labelClass}>
                  {signup.phoneLabel}
                  <RequiredMark />
                </label>
                <input
                  ref={(el) => {
                    fieldRefs.current.phone = el;
                  }}
                  id="signup-phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  required
                  placeholder={signup.phonePlaceholder}
                  value={values.phone}
                  onChange={(e) => update('phone', formatPhone(e.target.value))}
                  aria-invalid={errors.phone ? true : undefined}
                  aria-describedby={describedBy('phone')}
                  className={`${inputClass} ${borderFor(errors.phone)}`}
                />
                <FieldError id={errorId('phone')} message={errors.phone} />
              </div>

              <div>
                <label htmlFor="signup-email" className={labelClass}>
                  {signup.emailLabel}
                  <RequiredMark />
                </label>
                <input
                  ref={(el) => {
                    fieldRefs.current.email = el;
                  }}
                  id="signup-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  placeholder={signup.emailPlaceholder}
                  value={values.email}
                  onChange={(e) => update('email', e.target.value)}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={describedBy('email')}
                  className={`${inputClass} ${borderFor(errors.email)}`}
                />
                <FieldError id={errorId('email')} message={errors.email} />
              </div>

              <fieldset aria-describedby={describedBy('frequency')}>
                <legend className={labelClass}>
                  {signup.frequencyLabel}
                  <RequiredMark />
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {frequencyKeys.map((key, i) => (
                    <Pill
                      key={key}
                      ref={
                        i === 0
                          ? (el: HTMLInputElement | null) => {
                              fieldRefs.current.frequency = el;
                            }
                          : undefined
                      }
                      name="frequency"
                      value={key}
                      required
                      checked={values.frequency === key}
                      onChange={() => update('frequency', key)}
                      aria-invalid={errors.frequency ? true : undefined}
                    >
                      {signup.frequencyOptions[key]}
                    </Pill>
                  ))}
                </div>
                <FieldError id={errorId('frequency')} message={errors.frequency} />
              </fieldset>

              <fieldset aria-describedby="signup-level-hint">
                <legend className={labelClass}>{signup.levelLabel}</legend>
                <p id="signup-level-hint" className="mt-0.5 text-sm text-slate-600">
                  {signup.levelHint}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {levelOrder.map((key) => (
                    <Pill
                      key={key}
                      name="level"
                      value={key}
                      checked={values.level === key}
                      onChange={() => update('level', key)}
                      onClick={() => values.level === key && update('level', '')}
                    >
                      {signup.levelOptions[key]}
                    </Pill>
                  ))}
                </div>
              </fieldset>

              <div>
                <label htmlFor="signup-goal" className={labelClass}>
                  {signup.goalLabel}
                </label>
                <textarea
                  ref={(el) => {
                    fieldRefs.current.goal = el;
                  }}
                  id="signup-goal"
                  name="goal"
                  rows={2}
                  maxLength={signup.limits.goal}
                  placeholder={signup.goalPlaceholder}
                  value={values.goal}
                  onChange={(e) => update('goal', e.target.value)}
                  aria-invalid={errors.goal ? true : undefined}
                  aria-describedby={describedBy('goal')}
                  className={`${inputClass} resize-none ${borderFor(errors.goal)}`}
                />
                <FieldError id={errorId('goal')} message={errors.goal} />
              </div>

              <fieldset>
                <legend className={labelClass}>{signup.referralLabel}</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {referralKeys.map((key) => (
                    <Pill
                      key={key}
                      name="referral"
                      value={key}
                      checked={values.referral === key}
                      onChange={() => update('referral', key)}
                      onClick={() => values.referral === key && update('referral', '')}
                    >
                      {signup.referralOptions[key]}
                    </Pill>
                  ))}
                </div>
              </fieldset>

              <div className={`rounded-2xl border-2 p-4 ${errors.agreed ? 'border-red-600' : 'border-slate-200'}`}>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    ref={(el) => {
                      fieldRefs.current.agreed = el;
                    }}
                    id="signup-agree"
                    type="checkbox"
                    name="agreed"
                    required
                    checked={values.agreed}
                    onChange={(e) => update('agreed', e.target.checked)}
                    aria-invalid={errors.agreed ? true : undefined}
                    aria-describedby={describedBy('agreed', 'signup-agree-detail')}
                    className="size-5 shrink-0 accent-teal-700"
                  />
                  <span className="font-bold text-slate-900">
                    {signup.agreeLabel}
                    <RequiredMark />
                  </span>
                </label>
                <p id="signup-agree-detail" className="mt-2 text-xs text-slate-600">
                  {signup.agreeDetail}
                </p>
                <FieldError id={errorId('agreed')} message={errors.agreed} />
              </div>
            </fieldset>

            <button type="submit" disabled={loading} className={`${buttonStyles()} mt-6 w-full`}>
              {loading ? (
                <span
                  className="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  aria-hidden="true"
                />
              ) : null}
              {loading ? signup.submitting : signup.submit}
            </button>
            <p role="alert" className="mt-3 text-center text-sm font-medium text-red-700 empty:hidden">
              {status === 'error' ? errorMessage : ''}
            </p>
            <button
              type="button"
              onClick={clearForm}
              disabled={loading}
              className="mx-auto mt-2 block rounded-full px-4 py-2 text-sm font-bold text-slate-600 hover:underline"
            >
              {signup.clearLabel}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
