/** 운영자 한마디(hostComments)와 응원(cheers) 저장/불러오기. 구조는 src/lib/feedback.ts 참고 */
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase/client';
import { cheerId, recordKey, toCheer, toHostComment, type Cheer, type HostComment } from '@/lib/feedback';

export const HOST_COMMENTS_COLLECTION = 'hostComments';
export const CHEERS_COLLECTION = 'cheers';

export async function loadHostComments(): Promise<HostComment[]> {
  const snapshot = await getDocs(collection(getDb(), HOST_COMMENTS_COLLECTION));
  return snapshot.docs.map((d) => toHostComment(d.data())).filter((c): c is HostComment => c !== null);
}

/** [운영자] 한마디 쓰기/고치기 */
export async function saveHostComment(uid: string, date: string, body: string): Promise<void> {
  await setDoc(doc(getDb(), HOST_COMMENTS_COLLECTION, recordKey(uid, date)), {
    uid,
    date,
    body,
    updatedAt: serverTimestamp(),
  });
}

/** [운영자] 한마디 지우기 */
export async function deleteHostComment(uid: string, date: string): Promise<void> {
  await deleteDoc(doc(getDb(), HOST_COMMENTS_COLLECTION, recordKey(uid, date)));
}

export async function loadCheers(): Promise<Cheer[]> {
  const snapshot = await getDocs(collection(getDb(), CHEERS_COLLECTION));
  return snapshot.docs.map((d) => toCheer(d.data())).filter((c): c is Cheer => c !== null);
}

export async function addCheer(target: string, date: string, from: string): Promise<void> {
  await setDoc(doc(getDb(), CHEERS_COLLECTION, cheerId(target, date, from)), {
    target,
    date,
    from,
    createdAt: serverTimestamp(),
  });
}

export async function removeCheer(target: string, date: string, from: string): Promise<void> {
  await deleteDoc(doc(getDb(), CHEERS_COLLECTION, cheerId(target, date, from)));
}
