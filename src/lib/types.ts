export type Level = 'beginner' | 'intermediate' | 'advanced';

export type Stroke = '자유형' | '배영' | '평영' | '접영' | '기타';

export type DistanceLog = {
  type: 'distance';
  date: string; // 'YYYY-MM-DD'
  laneLength: number; // m 단위, 예: 25
  laps: number; // 예: 6
};

export type LearningLog = {
  type: 'learning';
  date: string;
  stroke?: Stroke;
  note: string;
};

export type SwimLog = DistanceLog | LearningLog;

export type ReferralSource = 'youtube' | 'threads' | 'blog' | 'friend' | 'other';

/** 지금 수영하는 빈도 */
export type SwimFrequency = 'once' | 'two-three' | 'five' | 'six';

export type SignupData = {
  name: string; // 이름 또는 닉네임 (필수)
  phone: string; // 연락받을 휴대폰 번호 (필수)
  email: string; // 필수
  frequency: SwimFrequency; // 지금 수영은 어느 정도 하고 계세요? (필수)
  level?: Level; // 수영 강습 레벨 (강습 등록한 경우만, 선택)
  goal?: string; // 30일 동안 가장 바꾸고 싶은 것 (선택)
  referral?: ReferralSource; // 유입 경로 (선택)
  agreed: boolean; // 개인정보 수집·이용 동의 (필수)
};
export type SignupResult = { ok: true } | { ok: false; message: string };

/** 수영 기술 질문 (참여자가 묻고 운영자가 답한다) */
export type QuestionDraft = {
  authorName: string; // 참여 아이디 (필수)
  stroke: Stroke; // 어떤 영법에 대한 질문인지
  title: string;
  body: string;
};

export type Answer = {
  body: string;
  answeredAt: number; // ms
};

export type Question = QuestionDraft & {
  id: string;
  authorUid: string; // 쓴 사람의 Google 로그인 uid (본인 글 삭제용)
  createdAt: number; // ms
  answer?: Answer;
};

/** 정보 공유 게시판 글 */
export type TipCategory = 'technique' | 'gear' | 'pool' | 'health' | 'etc';

export type TipDraft = {
  authorName: string;
  category: TipCategory;
  title: string;
  body: string;
  link?: string; // 참고 링크 (선택, http/https)
};

export type Tip = TipDraft & {
  id: string;
  authorUid: string;
  createdAt: number; // ms
};
