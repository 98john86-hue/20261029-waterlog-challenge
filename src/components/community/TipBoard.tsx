'use client';

import { useState, type FormEvent } from 'react';
import { posts as copy, tips } from '@/content/landing';
import { loadPostsApi, sampleTips } from '@/lib/community';
import type { AuthUser } from '@/lib/firebase/auth';
import { cleanTip, firstPostError, formatPostDate, validateTip, type PostErrors } from '@/lib/posts';
import type { Tip, TipCategory } from '@/lib/types';
import { AuthPanel } from '@/components/community/AuthPanel';
import { focusField, PillGroup, TextField } from '@/components/community/fields';
import { useAuth } from '@/components/community/useAuth';
import { usePosts } from '@/components/community/usePosts';
import { Badge } from '@/components/ui/Badge';
import { buttonStyles } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';

const loadTips = async () => (await loadPostsApi()).loadTips();

const categoryChoices = (Object.keys(tips.categoryOptions) as TipCategory[]).map((value) => ({
  value,
  label: tips.categoryOptions[value],
}));
const categoryFilters: ReadonlyArray<{ value: TipCategory | 'all'; label: string }> = [
  { value: 'all', label: copy.allFilter },
  ...categoryChoices,
];

/** 정보 공유 게시판: 위는 로그인 + 글쓰기, 아래는 공유된 글 목록 */
export function TipBoard() {
  const auth = useAuth();
  const { state, reload } = usePosts(loadTips, sampleTips);
  const [filter, setFilter] = useState<TipCategory | 'all'>('all');

  const visible = state.status === 'ready' ? state.items.filter((t) => filter === 'all' || t.category === filter) : [];

  return (
    <section aria-labelledby="tips-title" className="bg-sky-50 px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-xl">
        <SectionHeading id="tips-title" eyebrow={tips.eyebrow} title={tips.title} description={tips.description} />
        <AuthPanel controls={auth} />
        {auth.user ? <TipForm user={auth.user} onPosted={reload} /> : null}
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{tips.listTitle}</h2>
          {state.status === 'ready' ? <span className="text-sm text-slate-600">{tips.count(visible.length)}</span> : null}
        </div>
        <div className="mt-4 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
          <PillGroup name="tips-filter" legend={copy.filterLabel} compact options={categoryFilters} value={filter} onChange={setFilter} />
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
            {visible.map((tip) => (
              <li key={tip.id}>
                <TipCard tip={tip} user={auth.user} onChanged={reload} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function TipForm({ user, onPosted }: { user: AuthUser; onPosted: () => Promise<void> }) {
  const [authorName, setAuthorName] = useState('');
  const [category, setCategory] = useState<TipCategory>('technique');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [link, setLink] = useState('');
  const [errors, setErrors] = useState<PostErrors>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving) return;
    const draft = cleanTip({ authorName, category, title, body, link });
    const nextErrors = validateTip(draft);
    setErrors(nextErrors);
    setMessage('');
    const first = firstPostError(nextErrors);
    if (first) {
      focusField(`tip-${first}`);
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      await (await loadPostsApi()).addTip(user.uid, draft);
      // 참여 아이디와 분류는 다음 글을 위해 남겨 둔다
      setTitle('');
      setBody('');
      setLink('');
      setMessage(tips.submitted);
      await onPosted();
    } catch (error) {
      console.error('정보 글 저장 실패', error);
      setSaveError(copy.saveError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5 rounded-3xl bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-lg font-extrabold text-slate-900">{tips.formTitle}</h2>
      <TextField
        id="tip-authorName"
        label={copy.nameLabel}
        value={authorName}
        onChange={setAuthorName}
        maxLength={copy.limits.name}
        placeholder={copy.namePlaceholder}
        error={errors.authorName}
      />
      <PillGroup name="tip-category" legend={tips.categoryLabel} options={categoryChoices} value={category} onChange={setCategory} />
      <TextField
        id="tip-title"
        label={copy.titleLabel}
        value={title}
        onChange={setTitle}
        maxLength={copy.limits.title}
        placeholder={tips.titlePlaceholder}
        error={errors.title}
      />
      <TextField
        id="tip-body"
        label={copy.bodyLabel}
        value={body}
        onChange={setBody}
        maxLength={copy.limits.body}
        placeholder={tips.bodyPlaceholder}
        error={errors.body}
        rows={5}
      />
      <TextField
        id="tip-link"
        type="url"
        label={tips.linkLabel}
        value={link}
        onChange={setLink}
        maxLength={copy.limits.link}
        placeholder={tips.linkPlaceholder}
        error={errors.link}
      />
      <p className="text-sm text-slate-600">{copy.privacyNote}</p>
      <p role="alert" className="text-sm font-medium text-red-700 empty:hidden">
        {saveError}
      </p>
      <button type="submit" disabled={saving} className={`${buttonStyles()} w-full`}>
        {saving ? copy.submitting : tips.submit}
      </button>
      <p role="status" className="text-center font-bold text-emerald-800 empty:hidden">
        {message}
      </p>
    </form>
  );
}

function TipCard({ tip, user, onChanged }: { tip: Tip; user: AuthUser | null; onChanged: () => Promise<void> }) {
  const [error, setError] = useState('');
  const isMine = user?.uid === tip.authorUid;
  const canDelete = isMine || (user?.isOperator ?? false);

  const handleDelete = async () => {
    if (!window.confirm(copy.deleteConfirm)) return;
    setError('');
    try {
      await (await loadPostsApi()).deleteTip(tip.id);
      await onChanged();
    } catch (e) {
      console.error('정보 글 삭제 실패', e);
      setError(copy.saveError);
    }
  };

  return (
    <article className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="tag">{tips.categoryOptions[tip.category]}</Badge>
        {isMine ? <Badge tone="muted">{copy.mineTag}</Badge> : null}
      </div>
      <h3 className="mt-3 text-lg font-extrabold text-slate-900">{tip.title}</h3>
      <p className="mt-1 text-sm text-slate-600">
        {tip.authorName} · {formatPostDate(tip.createdAt)}
      </p>
      <p className="mt-3 leading-relaxed whitespace-pre-line text-slate-800">{tip.body}</p>
      {tip.link ? (
        <a
          href={tip.link}
          target="_blank"
          rel="noopener noreferrer nofollow ugc"
          className="mt-3 inline-block text-sm font-bold break-all text-teal-800 underline underline-offset-4"
        >
          {tips.linkOpen}
        </a>
      ) : null}
      {canDelete ? (
        <div className="mt-4 flex justify-end">
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
