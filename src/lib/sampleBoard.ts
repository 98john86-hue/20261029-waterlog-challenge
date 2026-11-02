import { board, challenge } from '@/content/landing';
import { buildSampleLogs } from '@/lib/board';
import type { BoardRow } from '@/components/ui/BoardTable';

/** 진행판 예시 참여자 (홈 미리보기, 게시판이 연결되기 전의 /challenge). 고정값이라 모듈에서 한 번만 만든다 */
export const sampleBoardRows: BoardRow[] = board.participants.map((p, i) => ({
  id: p.id,
  name: p.name,
  isMe: false,
  goal: p.goal,
  logs: buildSampleLogs(p.weeks, challenge.startDate, board.samplePools, i * 3),
}));
