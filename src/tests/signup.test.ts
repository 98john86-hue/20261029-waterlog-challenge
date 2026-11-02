import { afterEach, describe, expect, it, vi } from 'vitest';
import { MOCK_DELAY_MS, submitSignup } from '@/lib/signup';
import type { SignupData } from '@/lib/types';

const valid: SignupData = {
  name: '물개',
  phone: '01012345678',
  email: 'swimmer@example.com',
  frequency: 'five',
  agreed: true,
};

describe('submitSignup', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('1초 지연 후 성공을 반환한다', async () => {
    vi.useFakeTimers();
    let settled = false;
    const promise = submitSignup({
      name: '물개',
      phone: '010-1234-5678',
      email: 'swimmer@example.com',
      frequency: 'two-three',
      level: 'beginner',
      agreed: true,
    }).then((r) => {
      settled = true;
      return r;
    });

    await vi.advanceTimersByTimeAsync(MOCK_DELAY_MS - 1);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await expect(promise).resolves.toEqual({ ok: true });
  });

  it('잘못된 입력은 실패와 메시지를 반환한다', async () => {
    const result = await submitSignup({ name: '물개', phone: '010-1234-5678', email: 'bad', frequency: 'once', agreed: true });
    expect(result.ok).toBe(false);
  });

  it('저장 함수에 신청 데이터를 넘기고 성공을 반환한다', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    await expect(submitSignup(valid, save)).resolves.toEqual({ ok: true });
    expect(save).toHaveBeenCalledWith(valid);
  });

  it('입력이 잘못되면 저장하지 않는다', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    await submitSignup({ ...valid, agreed: false }, save);
    expect(save).not.toHaveBeenCalled();
  });

  it('저장 중 오류가 나면 실패와 안내 문구를 반환한다', async () => {
    const save = vi.fn().mockRejectedValue(new Error('permission-denied'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await submitSignup(valid, save);
    expect(result).toEqual({ ok: false, message: expect.any(String) });
  });
});
