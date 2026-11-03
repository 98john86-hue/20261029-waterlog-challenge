'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { board } from '@/content/landing';
import { HOST_COMMENT_MAX } from '@/lib/feedback';
import { buttonStyles } from '@/components/ui/Button';

type CommentDialogProps = {
  title: string;
  /** 이미 남긴 한마디 (고칠 때) */
  initialBody: string;
  /** 실패하면 throw */
  onSave: (body: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
};

/** [운영자] 진행판 기록 하나에 한마디 남기기. 브라우저 기본 모달(<dialog>)이라 Esc로 닫히고 포커스가 안에 머문다 */
export function CommentDialog({ title, initialBody, onSave, onDelete, onClose }: CommentDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [body, setBody] = useState(initialBody);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const run = async (action: () => Promise<void>) => {
    setSaving(true);
    setError('');
    try {
      await action();
      onClose();
    } catch (e) {
      console.error('운영자 한마디 저장 실패', e);
      setError(board.commentError);
      setSaving(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving) return;
    const trimmed = body.trim();
    if (!trimmed) {
      setError(board.commentRequired);
      return;
    }
    void run(() => onSave(trimmed));
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="comment-dialog-title"
      className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-3xl bg-white p-0 shadow-xl backdrop:bg-slate-900/50"
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 sm:p-6">
        <h2 id="comment-dialog-title" className="text-lg font-extrabold text-slate-900">
          {title}
        </h2>
        <label htmlFor="comment-body" className="sr-only">
          {board.hostComment}
        </label>
        <textarea
          id="comment-body"
          rows={4}
          maxLength={HOST_COMMENT_MAX}
          value={body}
          placeholder={board.commentPlaceholder}
          onChange={(e) => {
            setBody(e.target.value);
            setError('');
          }}
          className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-500 focus:border-teal-600"
        />
        <p className="-mt-2 text-right text-sm text-slate-500" aria-hidden="true">
          {body.length}/{HOST_COMMENT_MAX}
        </p>
        <p role="alert" className="text-sm font-medium text-red-700 empty:hidden">
          {error}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          {initialBody ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => void run(onDelete)}
              className="rounded-full px-3 py-1.5 text-sm font-bold text-red-700 hover:bg-red-50"
            >
              {board.commentDelete}
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={buttonStyles('outline', 'sm')}>
              {board.commentClose}
            </button>
            <button type="submit" disabled={saving} className={buttonStyles('primary', 'sm')}>
              {saving ? board.form.saving : board.commentSave}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}
