import { signup } from '@/content/landing';
import { readFirebaseConfig } from '@/lib/firebase/config';
import { notifySignup } from '@/lib/signupAlert';
import type { SignupData, SignupResult } from '@/lib/types';
import { signupFieldOrder, validateSignup } from '@/lib/validation';

export const MOCK_DELAY_MS = 1000;

type SaveSignup = (data: SignupData) => Promise<void>;
type NotifySignup = (data: SignupData) => Promise<void>;

/** Firebase 코드는 실제로 제출할 때만 불러온다 (첫 화면 JS를 가볍게 유지) */
const saveToFirestore: SaveSignup = async (data) => {
  const { saveSignup } = await import('@/lib/firebase/signups');
  await saveSignup(data);
};

/** 연습용: 1초 뒤 성공 */
const saveMock: SaveSignup = () => new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

/**
 * 사전 등록 제출.
 * Firebase 설정값(.env.local)이 있으면 Firestore `signups`에 저장하고, 없으면 연습용 mock으로 동작한다.
 * 실제로 저장했을 때만 운영자 알림(넷리파이 폼)을 보낸다.
 * `save`, `notify`는 테스트에서 바꿔 끼우기 위한 인자다.
 */
export async function submitSignup(
  data: SignupData,
  save: SaveSignup = readFirebaseConfig() ? saveToFirestore : saveMock,
  notify: NotifySignup = readFirebaseConfig() ? notifySignup : async () => {},
): Promise<SignupResult> {
  const errors = validateSignup(data);
  const firstError = signupFieldOrder.map((field) => errors[field]).find(Boolean);
  if (firstError) return { ok: false, message: firstError };

  try {
    await save(data);
  } catch (error) {
    console.error('사전 등록 저장 실패', error);
    return { ok: false, message: signup.genericError };
  }
  // 알림은 실패해도 신청은 성공 (notifySignup이 오류를 삼킨다)
  await notify(data);
  return { ok: true };
}
