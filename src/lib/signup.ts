import { signup } from '@/content/landing';
import { readFirebaseConfig } from '@/lib/firebase/config';
import type { SignupData, SignupResult } from '@/lib/types';
import { signupFieldOrder, validateSignup } from '@/lib/validation';

export const MOCK_DELAY_MS = 1000;

type SaveSignup = (data: SignupData) => Promise<void>;

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
 * `save`는 테스트에서 저장 방식을 바꿔 끼우기 위한 인자다.
 */
export async function submitSignup(
  data: SignupData,
  save: SaveSignup = readFirebaseConfig() ? saveToFirestore : saveMock,
): Promise<SignupResult> {
  const errors = validateSignup(data);
  const firstError = signupFieldOrder.map((field) => errors[field]).find(Boolean);
  if (firstError) return { ok: false, message: firstError };

  try {
    await save(data);
    return { ok: true };
  } catch (error) {
    console.error('사전 등록 저장 실패', error);
    return { ok: false, message: signup.genericError };
  }
}
