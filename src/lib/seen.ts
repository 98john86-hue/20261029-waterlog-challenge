import type { HostComment } from '@/lib/feedback';
import type { Question } from '@/lib/types';

/**
 * "새 답변·새 한마디" 표시용으로, 마지막으로 확인한 시각을 이 브라우저에 기억한다.
 * 기기마다 따로라 다른 기기에서는 다시 새 소식으로 보일 수 있다 (알림 표시용이라 괜찮다).
 */
export type Seen = { answers: number; comments: number };

type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>;

const storageKey = (uid: string) => `waterlog-seen-${uid}`;

function browserStorage(): KeyValueStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readSeen(uid: string, storage: KeyValueStorage | null = browserStorage()): Seen {
  try {
    const raw = storage?.getItem(storageKey(uid));
    const data: unknown = raw ? JSON.parse(raw) : null;
    if (typeof data === 'object' && data !== null) {
      const { answers, comments } = data as Record<string, unknown>;
      return {
        answers: typeof answers === 'number' ? answers : 0,
        comments: typeof comments === 'number' ? comments : 0,
      };
    }
  } catch {
    // 깨진 값이나 막힌 저장소는 처음 보는 것으로
  }
  return { answers: 0, comments: 0 };
}

export function writeSeen(uid: string, patch: Partial<Seen>, storage: KeyValueStorage | null = browserStorage()): void {
  try {
    storage?.setItem(storageKey(uid), JSON.stringify({ ...readSeen(uid, storage), ...patch }));
  } catch {
    // 저장이 안 되면 다음에 다시 새 소식으로 보일 뿐
  }
}

/** 내 질문 중 since 이후에 답변이 달린 것 */
export function newAnswers(questions: readonly Question[], uid: string, since: number): Question[] {
  return questions.filter((q) => q.authorUid === uid && q.answer && q.answer.answeredAt > since);
}

/** 내 기록에 since 이후 달리거나 고쳐진 운영자 한마디 */
export function newComments(comments: readonly HostComment[], uid: string, since: number): HostComment[] {
  return comments.filter((c) => c.uid === uid && c.updatedAt > since);
}
