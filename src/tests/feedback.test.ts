import { describe, expect, it } from 'vitest';
import { cheerId, recordKey, summarizeCheers, toCheer, toggleCheer, toHostComment, type Cheer } from '@/lib/feedback';
import { questionFromCheckIn } from '@/lib/posts';
import { newAnswers, newComments, readSeen, writeSeen } from '@/lib/seen';
import type { Question } from '@/lib/types';

const D = '2026-11-09';

describe('운영자 한마디·응원 변환', () => {
  it('Firestore 문서를 한마디로 바꾼다 (Timestamp → ms), 모양이 다르면 null', () => {
    expect(toHostComment({ uid: 'u1', date: D, body: '좋아요', updatedAt: { toMillis: () => 5 } })).toEqual({
      uid: 'u1',
      date: D,
      body: '좋아요',
      updatedAt: 5,
    });
    expect(toHostComment({ uid: 'u1', date: D, body: '' })).toBeNull();
    expect(toCheer({ target: 'a', date: D, from: 'b' })).toEqual({ target: 'a', date: D, from: 'b' });
    expect(toCheer({ target: 'a', date: D })).toBeNull();
  });

  it('문서 ID 규칙 (firestore.rules와 같게)', () => {
    expect(recordKey('u1', D)).toBe('u1_2026-11-09');
    expect(cheerId('u1', D, 'u2')).toBe('u1_2026-11-09_u2');
  });
});

describe('응원 집계', () => {
  const cheers: Cheer[] = [
    { target: 'a', date: D, from: 'b' },
    { target: 'a', date: D, from: 'c' },
    { target: 'a', date: '2026-11-10', from: 'b' },
  ];

  it('기록별 응원 수와 내가 응원했는지', () => {
    const summary = summarizeCheers(cheers, 'c');
    expect(summary.get(recordKey('a', D))).toEqual({ count: 2, mine: true });
    expect(summary.get(recordKey('a', '2026-11-10'))).toEqual({ count: 1, mine: false });
    expect(summarizeCheers(cheers).get(recordKey('a', D))?.mine).toBe(false);
  });

  it('응원 켜기/끄기', () => {
    expect(toggleCheer(cheers, 'a', D, 'b')).toHaveLength(2);
    expect(toggleCheer(cheers, 'a', D, 'd')).toHaveLength(4);
  });
});

describe('인증하며 남긴 질문 → Q&A 질문', () => {
  it('첫 줄이 제목, 전체가 내용', () => {
    expect(questionFromCheckIn(' 물개 ', '평영', '  무릎이 아파요\n발차기를 어떻게 해야 하나요?  ')).toEqual({
      authorName: '물개',
      stroke: '평영',
      title: '무릎이 아파요',
      body: '무릎이 아파요\n발차기를 어떻게 해야 하나요?',
    });
  });

  it('첫 줄이 60자를 넘으면 줄임표로 60자에 맞춘다', () => {
    const { title } = questionFromCheckIn('물개', '자유형', '가'.repeat(80));
    expect(title).toHaveLength(60);
    expect(title.endsWith('…')).toBe(true);
  });
});

describe('새 소식', () => {
  const memory = () => {
    const store = new Map<string, string>();
    return { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
  };

  it('처음엔 0, 저장한 시각을 기억하고 일부만 바꿀 수 있다', () => {
    const storage = memory();
    expect(readSeen('u1', storage)).toEqual({ answers: 0, comments: 0 });
    writeSeen('u1', { answers: 100 }, storage);
    writeSeen('u1', { comments: 200 }, storage);
    expect(readSeen('u1', storage)).toEqual({ answers: 100, comments: 200 });
    expect(readSeen('u2', storage)).toEqual({ answers: 0, comments: 0 });
  });

  it('깨진 값이나 저장소가 없으면 처음 보는 것으로', () => {
    expect(readSeen('u1', { getItem: () => '{', setItem: () => {} })).toEqual({ answers: 0, comments: 0 });
    expect(readSeen('u1', null)).toEqual({ answers: 0, comments: 0 });
  });

  it('내 질문 중 확인한 뒤에 답변이 달린 것만', () => {
    const q = (id: string, authorUid: string, answeredAt?: number): Question => ({
      id,
      authorUid,
      authorName: '물개',
      stroke: '자유형',
      title: 't',
      body: 'b',
      createdAt: 1,
      ...(answeredAt ? { answer: { body: 'a', answeredAt } } : {}),
    });
    const list = [q('old', 'u1', 50), q('new', 'u1', 150), q('none', 'u1'), q('other', 'u2', 150)];
    expect(newAnswers(list, 'u1', 100).map((x) => x.id)).toEqual(['new']);
  });

  it('내 기록에 확인한 뒤 달린 한마디만', () => {
    const comments = [
      { uid: 'u1', date: D, body: 'a', updatedAt: 50 },
      { uid: 'u1', date: '2026-11-10', body: 'b', updatedAt: 150 },
      { uid: 'u2', date: D, body: 'c', updatedAt: 150 },
    ];
    expect(newComments(comments, 'u1', 100).map((c) => c.date)).toEqual(['2026-11-10']);
  });
});
