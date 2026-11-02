import { describe, expect, it } from 'vitest';
import {
  cleanTip,
  filterByAnswer,
  firstPostError,
  formatPostDate,
  sortNewestFirst,
  toQuestion,
  toTip,
  validateAnswer,
  validateQuestion,
  validateTip,
} from '@/lib/posts';
import type { Question, Tip } from '@/lib/types';

const question = { authorName: '물개', stroke: '자유형', title: '호흡이 어려워요', body: '물을 먹어요' } as const;
const tip = { authorName: '물개', category: 'gear', title: '수경 관리', body: '안쪽은 만지지 않기' } as const;

describe('validateQuestion / validateTip', () => {
  it('필수 항목이 비어 있으면 화면 순서대로 에러를 낸다', () => {
    const errors = validateQuestion({ ...question, authorName: '', body: '' });
    expect(errors.authorName).toBeTruthy();
    expect(errors.body).toBeTruthy();
    expect(errors.title).toBeUndefined();
    expect(firstPostError(errors)).toBe('authorName');
  });

  it('글자 수 제한을 넘으면 에러', () => {
    expect(validateQuestion({ ...question, authorName: '가'.repeat(13) }).authorName).toBeTruthy();
    expect(validateQuestion({ ...question, title: '가'.repeat(61) }).title).toBeTruthy();
    expect(validateQuestion({ ...question, body: '가'.repeat(1001) }).body).toBeTruthy();
    expect(validateQuestion(question)).toEqual({});
  });

  it('링크는 선택이고, 넣으면 http/https 주소여야 한다', () => {
    expect(validateTip(tip)).toEqual({});
    expect(validateTip({ ...tip, link: 'https://example.com/a' })).toEqual({});
    expect(validateTip({ ...tip, link: 'javascript:alert(1)' }).link).toBeTruthy();
    expect(validateTip({ ...tip, link: 'example.com' }).link).toBeTruthy();
  });

  it('cleanTip은 앞뒤 공백을 지우고 빈 링크는 뺀다', () => {
    expect(cleanTip({ ...tip, title: '  수경 관리 ', link: '   ' })).toEqual(tip);
    expect(cleanTip({ ...tip, link: ' https://a.com ' }).link).toBe('https://a.com');
  });

  it('답변은 비어 있거나 2000자를 넘으면 안 된다', () => {
    expect(validateAnswer('   ')).toBeTruthy();
    expect(validateAnswer('가'.repeat(2001))).toBeTruthy();
    expect(validateAnswer('고개 대신 몸을 굴려요')).toBe('');
  });
});

describe('toQuestion / toTip', () => {
  const timestamp = (ms: number) => ({ toMillis: () => ms });

  it('Firestore 문서를 글로 바꾼다 (Timestamp → ms)', () => {
    expect(
      toQuestion('q1', {
        ...question,
        authorUid: 'u1',
        createdAt: timestamp(1000),
        answer: { body: '몸을 굴려요', answeredAt: timestamp(2000) },
      }),
    ).toEqual({ id: 'q1', authorUid: 'u1', ...question, createdAt: 1000, answer: { body: '몸을 굴려요', answeredAt: 2000 } });
  });

  it('모양이 다르면 null', () => {
    expect(toQuestion('q1', { ...question, createdAt: 1 })).toBeNull(); // authorUid 없음
    expect(toQuestion('q1', { ...question, authorUid: 'u1', stroke: '개헤엄' })).toBeNull();
    expect(toTip('t1', { ...tip, authorUid: 'u1', category: 'toString' })).toBeNull();
    expect(toTip('t1', null)).toBeNull();
  });

  it('http/https가 아닌 링크는 버린다', () => {
    expect(toTip('t1', { ...tip, authorUid: 'u1', createdAt: 1, link: 'javascript:alert(1)' })).not.toHaveProperty('link');
    expect(toTip('t1', { ...tip, authorUid: 'u1', createdAt: 1, link: 'https://a.com' })?.link).toBe('https://a.com');
  });
});

describe('목록 정렬·거르기', () => {
  const make = (id: string, createdAt: number, answered: boolean): Question => ({
    id,
    authorUid: 'u',
    ...question,
    createdAt,
    ...(answered ? { answer: { body: '답', answeredAt: createdAt + 1 } } : {}),
  });
  const list = [make('a', 1, true), make('b', 3, false), make('c', 2, false)];

  it('최신 글이 위로', () => {
    expect(sortNewestFirst(list).map((q) => q.id)).toEqual(['b', 'c', 'a']);
    const tips: Tip[] = [{ id: 'x', authorUid: 'u', ...tip, createdAt: 1 }, { id: 'y', authorUid: 'u', ...tip, createdAt: 2 }];
    expect(sortNewestFirst(tips).map((t) => t.id)).toEqual(['y', 'x']);
  });

  it('답변 상태로 거른다', () => {
    expect(filterByAnswer(list, 'all')).toHaveLength(3);
    expect(filterByAnswer(list, 'answered').map((q) => q.id)).toEqual(['a']);
    expect(filterByAnswer(list, 'waiting').map((q) => q.id)).toEqual(['b', 'c']);
  });

  it('날짜는 한국 시간 기준', () => {
    // UTC 10월 27일 15시 = 한국 10월 28일 0시
    expect(formatPostDate(Date.UTC(2026, 9, 27, 15))).toBe('10월 28일');
    expect(formatPostDate(Date.UTC(2026, 9, 27, 14))).toBe('10월 27일');
  });
});
