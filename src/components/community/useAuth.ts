'use client';

import { useEffect, useState } from 'react';
import { auth as copy } from '@/content/landing';
import { isCommunityConnected, loadAuthApi } from '@/lib/community';
import type { AuthState, AuthUser } from '@/lib/firebase/auth';

export type AuthControls = {
  connected: boolean;
  /** null이면 아직 확인 중 */
  state: AuthState | null;
  user: AuthUser | null;
  error: string;
  signIn: () => void;
  signOut: () => void;
};

const POPUP_CANCELLED = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'];

/** Google 로그인 상태. 게시판이 연결되지 않았으면 아무것도 하지 않는다 */
export function useAuth(): AuthControls {
  const connected = isCommunityConnected();
  const [state, setState] = useState<AuthState | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!connected) return;
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    loadAuthApi()
      .then(({ watchAuth }) => {
        if (!cancelled) unsubscribe = watchAuth(setState);
      })
      .catch((e: unknown) => {
        console.error('로그인 준비 실패', e);
        setError(copy.signInError);
      });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [connected]);

  const signIn = () => {
    setError('');
    loadAuthApi()
      .then(({ signInWithGoogle }) => signInWithGoogle())
      .catch((e: unknown) => {
        // 사용자가 팝업을 닫은 경우는 오류로 보여 주지 않는다
        const code = typeof e === 'object' && e !== null && 'code' in e ? e.code : '';
        if (typeof code === 'string' && POPUP_CANCELLED.includes(code)) return;
        console.error('Google 로그인 실패', e);
        setError(copy.signInError);
      });
  };

  const signOut = () => {
    void loadAuthApi().then(({ signOutUser }) => signOutUser());
  };

  return {
    connected,
    state,
    user: state?.status === 'signed-in' ? state.user : null,
    error,
    signIn,
    signOut,
  };
}
