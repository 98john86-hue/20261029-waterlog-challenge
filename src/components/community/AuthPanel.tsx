'use client';

import { auth as copy } from '@/content/landing';
import { buttonStyles } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { AuthControls } from '@/components/community/useAuth';

/** 글쓰기 폼 위: 로그인 안내/버튼, 또는 로그인한 계정과 로그아웃 */
export function AuthPanel({ controls }: { controls: AuthControls }) {
  const { connected, state, user, error } = controls;

  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-5 text-center shadow-sm sm:p-6">
      {!connected ? (
        <p className="text-slate-700">{copy.notConnected}</p>
      ) : state === null ? (
        <p role="status" className="text-slate-600">
          {copy.checking}
        </p>
      ) : user ? (
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-700">
          <span>{copy.signedIn(user.email)}</span>
          {user.isOperator ? <Badge tone="tag">{copy.operatorBadge}</Badge> : null}
          <button
            type="button"
            onClick={controls.signOut}
            className="rounded-full px-3 py-1.5 font-bold text-teal-800 underline underline-offset-4 hover:bg-teal-50"
          >
            {copy.signOut}
          </button>
        </div>
      ) : (
        <>
          <p className="text-slate-700">{copy.signInPrompt}</p>
          <button type="button" onClick={controls.signIn} className={buttonStyles('outline', 'sm')}>
            <GoogleMark />
            {copy.signIn}
          </button>
        </>
      )}
      <p role="alert" className="text-sm font-medium text-red-700 empty:hidden">
        {error}
      </p>
    </div>
  );
}

/** Google 로그인 버튼의 G 로고 (장식용) */
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true" focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.5 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.8 6C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.3.8-4.7l-7.8-6C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.8-6z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.9 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.8 6C6.6 42.6 14.6 48 24 48z" />
    </svg>
  );
}
