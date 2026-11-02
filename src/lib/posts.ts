import { posts, strokeOptions, tips as tipsCopy } from '@/content/landing';
import type { Question, QuestionDraft, Stroke, Tip, TipCategory, TipDraft } from '@/lib/types';

/** Q&A·정보 공유 글 검증과 정렬. Firestore 보안 규칙(firestore.rules)과 같은 기준을 쓴다. */

export type PostField = 'authorName' | 'title' | 'body' | 'link';
export type PostErrors = Partial<Record<PostField, string>>;

/** 화면에 보이는 순서대로 첫 번째 에러를 찾을 때 사용 */
export const postFieldOrder: readonly PostField[] = ['authorName', 'title', 'body', 'link'];

const LINK_PATTERN = /^https?:\/\/[^\s]+$/;

/** 앞뒤 공백을 지우고, 비어 있는 링크는 아예 뺀다 */
export function cleanQuestion(draft: QuestionDraft): QuestionDraft {
  return { ...draft, authorName: draft.authorName.trim(), title: draft.title.trim(), body: draft.body.trim() };
}

export function cleanTip(draft: TipDraft): TipDraft {
  const { link, ...rest } = draft;
  const trimmedLink = link?.trim();
  return {
    ...rest,
    authorName: rest.authorName.trim(),
    title: rest.title.trim(),
    body: rest.body.trim(),
    ...(trimmedLink ? { link: trimmedLink } : {}),
  };
}

function validateCommon(draft: { authorName: string; title: string; body: string }): PostErrors {
  const errors: PostErrors = {};
  const { errors: msg, limits } = posts;

  if (!draft.authorName) errors.authorName = msg.nameRequired;
  else if (draft.authorName.length > limits.name) errors.authorName = msg.nameTooLong;

  if (!draft.title) errors.title = msg.titleRequired;
  else if (draft.title.length > limits.title) errors.title = msg.titleTooLong;

  if (!draft.body) errors.body = msg.bodyRequired;
  else if (draft.body.length > limits.body) errors.body = msg.bodyTooLong;
  return errors;
}

/** 정리(clean)한 뒤의 값을 넘긴다 */
export function validateQuestion(draft: QuestionDraft): PostErrors {
  return validateCommon(draft);
}

export function validateTip(draft: TipDraft): PostErrors {
  const errors = validateCommon(draft);
  if (draft.link) {
    if (draft.link.length > posts.limits.link) errors.link = posts.errors.linkTooLong;
    else if (!LINK_PATTERN.test(draft.link)) errors.link = posts.errors.linkInvalid;
  }
  return errors;
}

/** 답변 검증. 문제가 없으면 빈 문자열 */
export function validateAnswer(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) return posts.errors.answerRequired;
  if (trimmed.length > posts.limits.answer) return posts.errors.answerTooLong;
  return '';
}

export const firstPostError = (errors: PostErrors): PostField | undefined =>
  postFieldOrder.find((field) => errors[field]);

/** 최신 글이 위로 */
export function sortNewestFirst<T extends Question | Tip>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => b.createdAt - a.createdAt);
}

export type AnswerFilter = 'all' | 'waiting' | 'answered';

export function filterByAnswer(questions: readonly Question[], filter: AnswerFilter): Question[] {
  if (filter === 'all') return [...questions];
  return questions.filter((q) => (filter === 'answered' ? Boolean(q.answer) : !q.answer));
}

/** ms → '10월 27일' (한국 시간 기준, 보는 사람의 시간대와 상관없이 같게) */
export function formatPostDate(ms: number): string {
  const kst = new Date(ms + 9 * 60 * 60 * 1000);
  return `${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일`;
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isStroke = (value: unknown): value is Stroke => (strokeOptions as readonly unknown[]).includes(value);
const isTipCategory = (value: unknown): value is TipCategory =>
  typeof value === 'string' && Object.hasOwn(tipsCopy.categoryOptions, value);

/** Firestore Timestamp(toMillis) 또는 ms 숫자 → ms. 방금 쓴 글처럼 아직 시간이 없으면 지금 */
function toMillis(value: unknown): number {
  if (typeof value === 'number') return value;
  if (isRecord(value) && typeof value.toMillis === 'function') {
    const ms: unknown = value.toMillis();
    if (typeof ms === 'number') return ms;
  }
  return Date.now();
}

const isText = (value: unknown): value is string => typeof value === 'string';

/** Firestore 문서(타입 정보 없음)를 Question으로 바꾼다. 모양이 다르면 null */
export function toQuestion(id: string, value: unknown): Question | null {
  if (!isRecord(value)) return null;
  const { authorUid, authorName, stroke, title, body, createdAt, answer } = value;
  if (!isText(authorUid) || !isText(authorName) || !isStroke(stroke) || !isText(title) || !isText(body)) return null;
  const question: Question = { id, authorUid, authorName, stroke, title, body, createdAt: toMillis(createdAt) };
  if (isRecord(answer) && isText(answer.body)) {
    question.answer = { body: answer.body, answeredAt: toMillis(answer.answeredAt) };
  }
  return question;
}

/** 링크는 http/https만 살린다 (javascript: 같은 주소가 화면의 href로 들어가지 않게) */
export function toTip(id: string, value: unknown): Tip | null {
  if (!isRecord(value)) return null;
  const { authorUid, authorName, category, title, body, link, createdAt } = value;
  if (!isText(authorUid) || !isText(authorName) || !isTipCategory(category) || !isText(title) || !isText(body)) {
    return null;
  }
  return { id, authorUid, authorName, category, title, body, ...(isText(link) && LINK_PATTERN.test(link) ? { link } : {}), createdAt: toMillis(createdAt) };
}
