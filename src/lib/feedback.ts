import { isRecord, toMillis } from '@/lib/posts';

/**
 * 진행판 기록에 붙는 소통: 운영자 한마디와 참여자 응원(👏).
 * 기록(participants/{uid}/days/{date})은 참여자 본인만 쓰므로, 둘 다 따로 모아 둔다.
 *   hostComments/{uid}_{date}        { uid, date, body, updatedAt }   운영자만 쓴다
 *   cheers/{target}_{date}_{from}    { target, date, from, createdAt } 로그인한 사람이 남의 기록에
 */
export type HostComment = { uid: string; date: string; body: string; updatedAt: number };
export type Cheer = { target: string; date: string; from: string };
export type CheerSummary = { count: number; mine: boolean };

export const HOST_COMMENT_MAX = 300;

/** 기록 하나(참여자 + 날짜)를 가리키는 키. Firebase uid에는 '_'가 없다 */
export const recordKey = (uid: string, date: string): string => `${uid}_${date}`;
export const cheerId = (target: string, date: string, from: string): string => `${target}_${date}_${from}`;

const isText = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

export function toHostComment(value: unknown): HostComment | null {
  if (!isRecord(value)) return null;
  const { uid, date, body, updatedAt } = value;
  if (!isText(uid) || !isText(date) || !isText(body)) return null;
  return { uid, date, body, updatedAt: toMillis(updatedAt) };
}

export function toCheer(value: unknown): Cheer | null {
  if (!isRecord(value)) return null;
  const { target, date, from } = value;
  if (!isText(target) || !isText(date) || !isText(from)) return null;
  return { target, date, from };
}

/** 기록별 응원 수와, 보는 사람이 응원했는지 */
export function summarizeCheers(cheers: readonly Cheer[], viewerUid?: string): Map<string, CheerSummary> {
  const summary = new Map<string, CheerSummary>();
  for (const cheer of cheers) {
    const key = recordKey(cheer.target, cheer.date);
    const prev = summary.get(key) ?? { count: 0, mine: false };
    summary.set(key, { count: prev.count + 1, mine: prev.mine || cheer.from === viewerUid });
  }
  return summary;
}

/** 응원을 켜거나 끈 결과 (화면에 바로 반영하고, 저장은 뒤에서) */
export function toggleCheer(cheers: readonly Cheer[], target: string, date: string, from: string): Cheer[] {
  const exists = cheers.some((c) => c.target === target && c.date === date && c.from === from);
  return exists
    ? cheers.filter((c) => !(c.target === target && c.date === date && c.from === from))
    : [...cheers, { target, date, from }];
}
