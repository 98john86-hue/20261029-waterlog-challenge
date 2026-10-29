'use client';

import { useCallback, useEffect, useState } from 'react';
import { isCommunityConnected } from '@/lib/community';
import { sortNewestFirst } from '@/lib/posts';
import type { Question, Tip } from '@/lib/types';

export type PostsState<T> =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; items: T[]; sample: boolean };

/**
 * 게시판 글 목록. 연결돼 있으면 Firestore에서 불러오고, 아니면 예시 글을 보여 준다.
 * `reload`는 글을 쓰거나 지운 뒤 목록을 새로 고칠 때 부른다.
 */
export function usePosts<T extends Question | Tip>(load: () => Promise<T[]>, samples: readonly T[]) {
  const connected = isCommunityConnected();
  const [state, setState] = useState<PostsState<T>>(
    connected ? { status: 'loading' } : { status: 'ready', items: sortNewestFirst(samples), sample: true },
  );

  const reload = useCallback(async () => {
    if (!connected) return;
    try {
      const items = await load();
      setState({ status: 'ready', items: sortNewestFirst(items), sample: false });
    } catch (e) {
      console.error('게시판 글 불러오기 실패', e);
      setState({ status: 'error' });
    }
  }, [connected, load]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { state, reload };
}
