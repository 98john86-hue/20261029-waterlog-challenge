import { samplePosts } from '@/content/landing';
import { readFirebaseConfig } from '@/lib/firebase/config';
import type { Question, Tip } from '@/lib/types';

/**
 * 기술 Q&A·정보 공유 게시판.
 * Firebase 설정값(.env.local)이 있으면 Firestore에서 글을 불러오고 Google 로그인으로 글을 쓴다.
 * 없으면 예시 글만 보여 주고 글쓰기는 막는다.
 */
export const isCommunityConnected = (): boolean => readFirebaseConfig() !== null;

/** Firebase 코드는 실제로 쓸 때만 불러온다 (첫 화면 JS를 가볍게 유지) */
export const loadPostsApi = () => import('@/lib/firebase/posts');
export const loadAuthApi = () => import('@/lib/firebase/auth');

export const sampleQuestions: readonly Question[] = samplePosts.questions;
export const sampleTips: readonly Tip[] = samplePosts.tips;
