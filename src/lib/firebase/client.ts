import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';
import { readFirebaseConfig } from '@/lib/firebase/config';

/** 앱은 한 번만 초기화한다 (개발 중 화면이 다시 그려져도 중복 생성 방지) */
export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  const config = readFirebaseConfig();
  if (!config) throw new Error('Firebase 설정값이 없어요. .env.local을 확인해 주세요.');
  return initializeApp(config);
}

let db: Firestore | null = null;

export function getDb(): Firestore {
  if (db) return db;
  db = getFirestore(getFirebaseApp());
  // 연습용: NEXT_PUBLIC_FIREBASE_EMULATOR_HOST=127.0.0.1:8080 이면 내 컴퓨터의 Firestore 에뮬레이터에 저장
  const emulator = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST;
  if (emulator) {
    const [host = '127.0.0.1', port = '8080'] = emulator.split(':');
    connectFirestoreEmulator(db, host, Number(port));
  }
  return db;
}
