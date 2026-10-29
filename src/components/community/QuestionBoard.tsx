'use client';

import { useState, type FormEvent } from 'react';
import { posts as copy, qna, strokeOptions } from '@/content/landing';
import { loadPostsApi, sampleQuestions } from '@/lib/community';
import type { AuthUser } from '@/lib/firebase/auth';
import {
  cleanQuestion,
  filterByAnswer,
  firstPostError,
  formatPostDate,
  validateAnswer,
  validateQuestion,
  type AnswerFilter,
  type PostErrors,
} from '@/lib/posts';
import type { Question, Stroke } from '@/lib/types';
import { AuthPanel } from '@/components/community/AuthPanel';
import { focusField, PillGroup, TextField } from '@/components/community/fields';
import { useAuth } from '@/components/community/useAuth';
import { usePosts } from '@/components/community/usePosts';
import { Badge } from '@/components/ui/Badge';
import { buttonStyles } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';

const loadQuestions = async () => (await loadPostsApi()).loadQuestions();

const strokeChoices = strokeOptions.map((s) => ({ value: s, label: s }));
const strokeFilters: ReadonlyArray<{ value: Stroke | 'all'; label: string }> = [
  { value: 'all', label: copy.allFilter },
  ...strokeChoices,
];
const answerFilters = (Object.keys(qna.statusOptions) as AnswerFilter[]).map((value) => ({
  value,
  label: qna.statusOptions[value],
}));

/** 기술 Q&A: 위는 로그인 + 질문 폼, 아래는 질문 목록과 운영자 답변 */
export function QuestionBoard() {
  const auth = useAuth();
  const { state, reload } = usePosts(loadQuestions, sampleQuestions);
  const [strokeFilter, setStrokeFilter] = useState<Stroke | 'all'>('all');
  const [answerFilter, setAnswerFilter] = useState<AnswerFilter>('all');

  const visible =
    state.status === 'ready'
      ? filterByAnswer(state.items, answerFilter).filter((q) => strokeFilter === 'all' || q.stroke === strokeFilter)
      : [];

  return (
    <section aria-labelledby="qna-title" className="bg-sky-50 px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-xl">
        <SectionHeading id="qna-title" eyebrow={qna.eyebrow} title={qna.title} description={qna.description} />
        <AuthPanel controls={auth} />
        {auth.user ? <QuestionForm user={auth.user} onPosted={reload} /> : null}
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{qna.listTitle}</h2>
          {state.status === 'ready' ? (
            <span className="text-sm text-slate-600">{qna.count(visible.length)}</span>
          ) : null}
        </div>
        <div className="mt-4 flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
          <PillGroup name="qna-stroke-filter" legend={copy.filterLabel} compact options={strokeFilters} value={strokeFilter} onChange={setStrokeFilter} />
          <PillGroup name="qna-answer-filter" legend={qna.statusLabel} compact options={answerFilters} value={answerFilter} onChange={setAnswerFilter} />
        </div>

        {state.status === 'ready' && state.sample ? (
          <p className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center text-sm text-slate-700">
            <Badge tone="sample">{copy.sampleBadge}</Badge>
            {copy.sampleNotice}
          </p>
        ) : null}

        <div className="mt-6" aria-live="polite">
          {state.status === 'loading' ? <p className="text-center text-slate-600">{copy.loading}</p> : null}
          {state.status === 'error' ? <p className="text-center font-medium text-red-700">{copy.loadError}</p> : null}
          {state.status === 'ready' && visible.length === 0 ? <p className="text-center text-slate-600">{copy.empty}</p> : null}
          <ul className="flex flex-col gap-4">
            {visible.map((question) => (
              <li key={question.id}>
                <QuestionCard question={question} user={auth.user} onChanged={reload} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function QuestionForm({ user, onPosted }: { user: AuthUser; onPosted: () => Promise<void> }) {
  const [authorName, setAuthorName] = useState('');
  const [stroke, setStroke] = useState<Stroke>('자유형');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<PostErrors>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving) return;
    const draft = cleanQuestion({ authorName, stroke, title, body });
    const nextErrors = validateQuestion(draft);
    setErrors(nextErrors);
    setMessage('');
    const first = firstPostError(nextErrors);
    if (first) {
      focusField(`question-${first}`);
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      await (await loadPostsApi()).addQuestion(user.uid, draft);
      // 참여 아이디와 영법은 다음 질문을 위해 남겨 둔다
      setTitle('');
      setBody('');
      setMessage(qna.submitted);
      await onPosted();
    } catch (error) {
      console.error('질문 저장 실패', error);
      setSaveError(copy.saveError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5 rounded-3xl bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-lg font-extrabold text-slate-900">{qna.formTitle}</h2>
      <TextField
        id="question-authorName"
        label={copy.nameLabel}
        value={authorName}
        onChange={setAuthorName}
        maxLength={copy.limits.name}
        placeholder={copy.namePlaceholder}
        error={errors.authorName}
      />
      <PillGroup name="question-stroke" legend={qna.strokeLabel} options={strokeChoices} value={stroke} onChange={setStroke} />
      <TextField
        id="question-title"
        label={copy.titleLabel}
        value={title}
        onChange={setTitle}
        maxLength={copy.limits.title}
        placeholder={qna.titlePlaceholder}
        error={errors.title}
      />
      <TextField
        id="question-body"
        label={copy.bodyLabel}
        value={body}
        onChange={setBody}
        maxLength={copy.limits.body}
        placeholder={qna.bodyPlaceholder}
        error={errors.body}
        rows={5}
      />
      <p className="text-sm text-slate-600">{copy.privacyNote}</p>
      <p role="alert" className="text-sm font-medium text-red-700 empty:hidden">
        {saveError}
      </p>
      <button type="submit" disabled={saving} className={`${buttonStyles()} w-full`}>
        {saving ? copy.submitting : qna.submit}
      </button>
      <p role="status" className="text-center font-bold text-emerald-800 empty:hidden">
        {message}
      </p>
    </form>
  );
}

type QuestionCardProps = { question: Question; user: AuthUser | null; onChanged: () => Promise<void> };

function QuestionCard({ question, user, onChanged }: QuestionCardProps) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const isOperator = user?.isOperator ?? false;
  const isMine = user?.uid === question.authorUid;

  const handleDelete = async () => {
    if (!window.confirm(copy.deleteConfirm)) return;
    setError('');
    try {
      await (await loadPostsApi()).deleteQuestion(question.id);
      await onChanged();
    } catch (e) {
      console.error('질문 삭제 실패', e);
      setError(copy.saveError);
    }
  };

  return (
    <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="tag">{question.stroke}</Badge>
        {question.answer ? <Badge tone="success">{qna.answered}</Badge> : <Badge tone="muted">{qna.waiting}</Badge>}
        {isMine ? <Badge tone="muted">{copy.mineTag}</Badge> : null}
      </div>
      <h3 className="mt-3 text-lg font-extrabold text-slate-900">{question.title}</h3>
      <p className="mt-1 text-sm text-slate-600">
        {question.authorName} · {formatPostDate(question.createdAt)}
      </p>
      <p className="mt-3 leading-relaxed whitespace-pre-line text-slate-800">{question.body}</p>

      {question.answer && !editing ? (
        <div className="mt-5 rounded-2xl border-l-4 border-teal-600 bg-teal-50 p-4">
          <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-teal-900">
            {qna.answerHeading}
            <span className="font-normal text-teal-800">{formatPostDate(question.answer.answeredAt)}</span>
          </p>
          <p className="mt-2 leading-relaxed whitespace-pre-line text-slate-800">{question.answer.body}</p>
        </div>
      ) : null}

      {isOperator && (editing || !question.answer) ? (
        <AnswerForm
          question={question}
          onDone={async () => {
            setEditing(false);
            await onChanged();
          }}
          onCancel={question.answer ? () => setEditing(false) : undefined}
        />
      ) : null}

      {isOperator || isMine ? (
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {isOperator && question.answer && !editing ? (
            <button type="button" onClick={() => setEditing(true)} className="rounded-full px-3 py-1.5 text-sm font-bold text-teal-800 hover:bg-teal-50">
              {qna.answerEdit}
            </button>
          ) : null}
          <button type="button" onClick={handleDelete} className="rounded-full px-3 py-1.5 text-sm font-bold text-red-700 hover:bg-red-50">
            {copy.delete}
          </button>
        </div>
      ) : null}
      <p role="alert" className="mt-2 text-sm font-medium text-red-700 empty:hidden">
        {error}
      </p>
    </article>
  );
}

type AnswerFormProps = { question: Question; onDone: () => Promise<void>; onCancel?: () => void };

/** [운영자] 답변 쓰기·고치기 */
function AnswerForm({ question, onDone, onCancel }: AnswerFormProps) {
  const [body, setBody] = useState(question.answer?.body ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const id = `answer-${question.id}`;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving) return;
    const problem = validateAnswer(body);
    setError(problem);
    if (problem) {
      focusField(id);
      return;
    }
    setSaving(true);
    try {
      await (await loadPostsApi()).answerQuestion(question.id, body.trim());
      await onDone();
    } catch (err) {
      console.error('답변 저장 실패', err);
      setError(copy.saveError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 rounded-2xl border-2 border-dashed border-teal-300 p-4">
      <TextField
        id={id}
        label={qna.answerLabel}
        value={body}
        onChange={setBody}
        maxLength={copy.limits.answer}
        placeholder={qna.answerPlaceholder}
        error={error}
        rows={5}
      />
      <div className="flex flex-wrap justify-end gap-2">
        {onCancel ? (
          <button type="button" onClick={onCancel} className={buttonStyles('outline', 'sm')}>
            {qna.answerCancel}
          </button>
        ) : null}
        <button type="submit" disabled={saving} className={buttonStyles('primary', 'sm')}>
          {saving ? copy.submitting : question.answer ? qna.answerUpdate : qna.answerSubmit}
        </button>
      </div>
    </form>
  );
}
