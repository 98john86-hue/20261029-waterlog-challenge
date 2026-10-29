/**
 * 기술 Q&A(`questions`)와 정보 공유(`tips`)를 Firestore에 저장/불러오기.
 *
 * 데이터 구조
 *   questions/{id}  { authorUid, authorName, stroke, title, body, createdAt, answer?: { body, answeredAt } }
 *   tips/{id}       { authorUid, authorName, category, title, body, link?, createdAt }
 *   admins/{uid}    운영자 표시용 빈 문서 (Firebase 콘솔에서 직접 만든다)
 * 글쓰기는 Google 로그인한 사람만, 답변은 운영자만, 삭제는 쓴 사람이나 운영자만 할 수 있다 (firestore.rules)
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase/client';
import { toQuestion, toTip } from '@/lib/posts';
import type { Question, QuestionDraft, Tip, TipDraft } from '@/lib/types';

export const QUESTIONS_COLLECTION = 'questions';
export const TIPS_COLLECTION = 'tips';

/** 한 번에 불러오는 글 수 (많아지면 페이지 나누기로 바꾸기) */
const PAGE_SIZE = 100;

async function loadNewest<T>(name: string, convert: (id: string, value: unknown) => T | null): Promise<T[]> {
  const snapshot = await getDocs(query(collection(getDb(), name), orderBy('createdAt', 'desc'), limit(PAGE_SIZE)));
  return snapshot.docs.map((d) => convert(d.id, d.data())).filter((item): item is T => item !== null);
}

export const loadQuestions = (): Promise<Question[]> => loadNewest(QUESTIONS_COLLECTION, toQuestion);
export const loadTips = (): Promise<Tip[]> => loadNewest(TIPS_COLLECTION, toTip);

/** 정리·검증을 마친 값과 로그인한 사람의 uid를 넘긴다 */
export async function addQuestion(authorUid: string, draft: QuestionDraft): Promise<void> {
  await addDoc(collection(getDb(), QUESTIONS_COLLECTION), { ...draft, authorUid, createdAt: serverTimestamp() });
}

/** 비어 있는 링크는 넣지 않는다 (Firestore는 undefined 값을 거부함) */
export async function addTip(authorUid: string, draft: TipDraft): Promise<void> {
  const { link, ...rest } = draft;
  await addDoc(collection(getDb(), TIPS_COLLECTION), {
    ...rest,
    ...(link ? { link } : {}),
    authorUid,
    createdAt: serverTimestamp(),
  });
}

/** [운영자] 답변 쓰기/고치기 */
export async function answerQuestion(id: string, body: string): Promise<void> {
  await updateDoc(doc(getDb(), QUESTIONS_COLLECTION, id), { answer: { body, answeredAt: serverTimestamp() } });
}

/** 글 삭제 (쓴 사람 또는 운영자) */
export async function deleteQuestion(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), QUESTIONS_COLLECTION, id));
}

export async function deleteTip(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), TIPS_COLLECTION, id));
}
