/**
 * 오늘의 인증·진행판 저장 (/challenge 페이지의 ChallengeBoard에서 쓴다).
 * 쓰기는 Google 로그인한 본인 uid로만 할 수 있다 (firestore.rules).
 *
 * 데이터 구조
 *   participants/{uid}               { name, goal, updatedAt }
 *   participants/{uid}/days/{date}   { distance?: { laneLength, laps }, learning?: { stroke?, note }, updatedAt }
 */
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { strokeOptions } from '@/content/landing';
import type { DayLogs } from '@/lib/board';
import { getDb } from '@/lib/firebase/client';
import type { Stroke, SwimLog } from '@/lib/types';

export const PARTICIPANTS_COLLECTION = 'participants';

export type Participant = { uid: string; name: string; goal: number; logs: SwimLog[] };

/** 참여 아이디와 주간 목표 저장 */
export async function saveParticipant(uid: string, name: string, goal: number): Promise<void> {
  await setDoc(
    doc(getDb(), PARTICIPANTS_COLLECTION, uid),
    { name, goal, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

/** 하루 인증 저장. 거리·기술이 모두 비어 있으면 그날 인증을 지운다 */
export async function saveDay(uid: string, date: string, day: DayLogs): Promise<void> {
  const ref = doc(getDb(), PARTICIPANTS_COLLECTION, uid, 'days', date);
  if (!day.distance && !day.learning) {
    await deleteDoc(ref);
    return;
  }
  await setDoc(ref, {
    ...(day.distance ? { distance: { laneLength: day.distance.laneLength, laps: day.distance.laps } } : {}),
    ...(day.learning
      ? { learning: { note: day.learning.note, ...(day.learning.stroke ? { stroke: day.learning.stroke } : {}) } }
      : {}),
    updatedAt: serverTimestamp(),
  });
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isStroke = (value: unknown): value is Stroke => (strokeOptions as readonly unknown[]).includes(value);

/** Firestore 문서(타입 정보 없음)를 SwimLog로 바꾼다. 모양이 다르면 건너뛴다 */
export function toSwimLogs(date: string, value: unknown): SwimLog[] {
  if (!isRecord(value)) return [];
  const logs: SwimLog[] = [];
  const { distance, learning } = value;
  if (isRecord(distance) && typeof distance.laneLength === 'number' && typeof distance.laps === 'number') {
    logs.push({ type: 'distance', date, laneLength: distance.laneLength, laps: distance.laps });
  }
  if (isRecord(learning) && typeof learning.note === 'string') {
    logs.push({ type: 'learning', date, note: learning.note, ...(isStroke(learning.stroke) ? { stroke: learning.stroke } : {}) });
  }
  return logs;
}

/** 진행판에 보여 줄 전체 참여자와 기록을 불러온다 (참여 인원이 많아지면 주 단위 조회로 바꾸기) */
export async function loadParticipants(): Promise<Participant[]> {
  const db = getDb();
  const people = await getDocs(collection(db, PARTICIPANTS_COLLECTION));
  return Promise.all(
    people.docs.map(async (person) => {
      const days = await getDocs(collection(db, PARTICIPANTS_COLLECTION, person.id, 'days'));
      const logs = days.docs.flatMap((day) => toSwimLogs(day.id, day.data()));
      const data: unknown = person.data();
      const name = isRecord(data) && typeof data.name === 'string' ? data.name : '';
      const goal = isRecord(data) && typeof data.goal === 'number' ? data.goal : 3;
      return { uid: person.id, name, goal, logs };
    }),
  );
}
