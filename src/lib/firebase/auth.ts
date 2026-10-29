/**
 * Google 로그인. 글쓰기는 로그인한 사람만 할 수 있다.
 * 로그인한 계정의 uid로 `admins/{uid}` 문서가 있으면 운영자다. 이 문서는 Firebase 콘솔에서 직접 만든다
 * (docs/firebase-setup.md). 화면은 이 결과로 답변·삭제 버튼만 보여 주고, 실제 권한은 보안 규칙이 지킨다.
 */
import {
  connectAuthEmulator,
  getAuth as getFirebaseAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type Auth,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getDb, getFirebaseApp } from '@/lib/firebase/client';

export const ADMINS_COLLECTION = 'admins';

let auth: Auth | null = null;

function getAuth(): Auth {
  if (auth) return auth;
  auth = getFirebaseAuth(getFirebaseApp());
  // 연습용: NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 이면 내 컴퓨터의 로그인 에뮬레이터를 쓴다
  const emulator = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
  if (emulator) connectAuthEmulator(auth, `http://${emulator}`, { disableWarnings: true });
  return auth;
}

export type AuthUser = { uid: string; email: string; isOperator: boolean };
export type AuthState = { status: 'signed-out' } | { status: 'signed-in'; user: AuthUser };

/** 로그인 상태가 바뀔 때마다 알려 준다. 돌려받은 함수로 구독을 끝낸다 */
export function watchAuth(onChange: (state: AuthState) => void): () => void {
  return onAuthStateChanged(getAuth(), (user) => {
    if (!user) {
      onChange({ status: 'signed-out' });
      return;
    }
    const base = { uid: user.uid, email: user.email ?? '' };
    getDoc(doc(getDb(), ADMINS_COLLECTION, user.uid))
      .then((snapshot) => onChange({ status: 'signed-in', user: { ...base, isOperator: snapshot.exists() } }))
      .catch(() => onChange({ status: 'signed-in', user: { ...base, isOperator: false } }));
  });
}

export async function signInWithGoogle(): Promise<void> {
  await signInWithPopup(getAuth(), new GoogleAuthProvider());
}

export async function signOutUser(): Promise<void> {
  await signOut(getAuth());
}
