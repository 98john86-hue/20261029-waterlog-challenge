import { signup } from '@/content/landing';
import type { SignupData } from '@/lib/types';

/** public/__forms.html에 적어 둔 넷리파이 폼 */
export const SIGNUP_ALERT_FORM = 'signup-alert';
const FORM_PATH = '/__forms.html';

/** 넷리파이 폼으로 보낼 값: 이름과 수영 빈도만 (휴대폰 번호·이메일은 넣지 않는다) */
export function toAlertFields(data: SignupData): Record<string, string> {
  return {
    'form-name': SIGNUP_ALERT_FORM,
    name: data.name,
    frequency: signup.frequencyOptions[data.frequency],
  };
}

/**
 * 운영자에게 "새 사전 신청" 알림 메일이 가도록 넷리파이 폼에 보낸다.
 * 알림은 부가 기능이라 실패해도 신청은 성공으로 둔다 (넷리파이가 아닌 곳에서 실행하면 늘 실패한다).
 */
export async function notifySignup(data: SignupData): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const response = await fetch(FORM_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(toAlertFields(data)).toString(),
    });
    if (!response.ok) console.warn('신청 알림 보내기 실패', response.status);
  } catch (error) {
    console.warn('신청 알림 보내기 실패', error);
  }
}
