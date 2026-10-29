import type { Level, Question, ReferralSource, Stroke, SwimFrequency, Tip, TipCategory } from '@/lib/types';

/** 페이지의 모든 문구와 예시 데이터. 컴포넌트에는 문구를 하드코딩하지 않는다. */

export const site = {
  name: '나만의 워터로그 챌린지',
  title: '나만의 워터로그 챌린지 | 한 달, 매일 한 줄씩 쌓이는 나의 수영',
  description:
    '한 달(4주) 동안 평일 주 3~5회, 수영 거리나 배운 점을 기록하는 챌린지. 많이 못 헤엄친 날도 배운 점 한 줄이면 성공이에요. 지금 사전 등록하세요.',
  ogDescription: '거리 또는 배운 점, 하나만 기록하면 오늘도 성공. 나만의 워터로그 챌린지 사전 등록 중.',
  locale: 'ko_KR',
} as const;

export const header = {
  homeLabel: '나만의 워터로그 챌린지 홈',
  // 다른 페이지(Q&A, 정보 공유)에서도 홈 섹션으로 갈 수 있게 '/#...' 형태로 쓴다
  nav: [
    { href: '/#how', label: '참여 방법' },
    { href: '/#board', label: '인증·진행판' },
    { href: '/qna', label: '기술 Q&A' },
    { href: '/tips', label: '정보 공유' },
    { href: '/#faq', label: 'FAQ' },
  ],
  navLabel: '주요 메뉴',
  cta: '사전 등록',
} as const;

export const hero = {
  eyebrow: '사전 등록 중',
  headlineLines: ['한 달, 매일 한 줄씩', '쌓이는 나의 수영'],
  subcopy: '오늘 익힌 기술은 한 줄로 남기고, 내일 물속에서 다시 꺼내 써요.',
  body: '거리 또는 기술, 하나만 기록해도 인증 완료. 4주 동안 평일 주 3~5회, 주말은 쉬어요.',
  primaryCta: '챌린지 사전 등록하기',
} as const;

export const howItWorks = {
  eyebrow: '참여 방법',
  title: '수영하고, 한 줄 남기면 끝',
  steps: [
    { title: '사전 등록', description: '시작 전에 일정과 참여 방법을 알려드려요.' },
    {
      title: '평일 주 3~5회 인증',
      description: '거리나 습득한 기술, 하나만 남겨도 인증돼요.',
      examples: ['거리: 25m × 6바퀴 = 300m', '기술: 자유형 팔은 옆으로 돌린다'],
    },
    { title: '4주 완주', description: '한 달의 기록이 나만의 수영 노트가 돼요.' },
  ],
  lapNote: '1바퀴는 왕복 기준(25m 레인 = 50m)이에요.',
} as const;

export const levelOrder: readonly Level[] = ['beginner', 'intermediate', 'advanced'];


/** 챌린지 일정 (예시 일정: 시작일은 1주차 월요일) */
export const challenge = {
  startDate: '2026-11-02',
  weeks: 4,
  weeklyMin: 3,
  weeklyMax: 5,
} as const;

export type SampleParticipant = {
  id: string;
  name: string;
  /** 참여자가 정한 주간 목표 인증 횟수 (3~5) */
  goal: number;
  /** 주차별 월~금 기록 패턴. D=거리, L=배운 점, B=둘 다, -=없음 */
  weeks: readonly string[];
};

export const board = {
  eyebrow: '오늘의 인증',
  title: '수영하고, 바로 인증해요',
  description: '평일(월~금) 23:59까지 인증해요. 예전 날짜를 골라 이미 낸 인증도 고칠 수 있어요.',
  sampleBadge: '체험용',
  form: {
    dateLabel: '인증할 날짜',
    dateOption: (week: number, date: string) => `${week}주차 · ${date}`,
    nameLabel: '참여 아이디',
    nameHint: '진행판에 보일 이름이에요. 비워 두면 “나”로 보여요.',
    namePlaceholder: '예: 물개',
    goalLabel: '나의 주간 목표',
    goalHint: '한 주에 몇 번 인증할지 정해요. 채우면 진행판에 🏅가 붙어요.',
    goalOption: (n: number) => `주 ${n}회`,
    distanceLabel: '오늘의 거리 기록',
    laneLabel: '레인 길이',
    laneOptions: [25, 50] as const,
    lapsLabel: '바퀴 수 (왕복)',
    lapsPlaceholder: '예: 6',
    skillLabel: '오늘 습득한 기술',
    strokeLabel: '영법',
    skillPlaceholder: '예: 자유형 팔을 뒤로 돌리지 말고 옆으로 돌리니 균형이 잡혔다',
    oneIsEnough: '거리나 기술 중 하나만 적어도 인증돼요.',
    submit: '인증하기',
    update: '인증 수정하기',
    remove: '이 날 인증 지우기',
    emptyError: '거리(바퀴 수)나 습득한 기술 중 하나는 적어 주세요.',
    success: (date: string) => `${date} 인증 완료! 아래 진행판에 반영됐어요.`,
    removed: (date: string) => `${date} 인증을 지웠어요.`,
    notSaved: '체험용이라 입력한 기록은 저장되지 않아요.',
  },
  boardTitle: '전체 진행판',
  boardDescription: '주간 목표를 달성한 참여자부터, 기록이 많은 순으로 보여요. 다른 참여자 이름과 기록은 예시예요.',
  sampleNotice: '예시 데이터',
  weekTabsLabel: '주차 선택',
  weekLabel: (n: number) => `${n}주차`,
  tableCaption: (n: number) => `${n}주차 참여자별 인증 기록 (월~금, 목표 달성자와 기록이 많은 순)`,
  participantHeader: '참여자',
  weekdayHeaders: ['월', '화', '수', '목', '금'],
  meName: '나',
  meTag: '나',
  weeklyCount: (count: number, goal: number) => `${count}/${goal}회`,
  goalMedal: '🏅',
  goalMetLabel: '주간 목표 달성',
  goalProgressLabel: (count: number, goal: number) => `주간 목표 ${goal}회 중 ${count}회 인증`,
  goalHint: '각자 정한 주간 목표(주 3~5회)를 채우면 🏅',
  emptyCell: '기록 없음',
  zoomLabel: '글자 크기',
  zoomOptions: ['작게', '보통', '크게'] as const,
  zoomHint: '표는 옆으로 밀어 월~금을 볼 수 있어요. 글자가 작으면 “크게”를 누르거나 두 손가락으로 확대해 보세요.',
  samplePools: {
    distances: [
      [25, 8],
      [25, 12],
      [50, 10],
      [25, 6],
      [50, 16],
      [25, 20],
      [50, 8],
    ] as const satisfies ReadonlyArray<readonly [number, number]>,
    notes: [
      { stroke: '자유형', note: '호흡할 때 고개를 너무 들지 않기' },
      { stroke: '평영', note: '발차기는 팔을 뻗은 뒤에 차야 앞으로 나간다' },
      { stroke: '배영', note: '귀가 물에 잠길 만큼 머리를 뒤로 눕힌다' },
      { stroke: '자유형', note: '팔 입수는 어깨 너비로' },
      { stroke: '접영', note: '웨이브는 가슴으로 누르는 느낌에서 시작' },
      { stroke: '기타', note: '킥판 잡고 발차기만 해도 다리 힘이 많이 든다' },
      { stroke: '자유형', note: '글라이드를 1초 더 길게 하니 덜 지친다' },
      { stroke: '평영', note: '당기고-숨-차고-뻗기 순서를 지키기' },
    ] as const satisfies ReadonlyArray<{ stroke: Stroke; note: string }>,
  },
  participants: [
    { id: 'a', name: '참가자 A', goal: 4, weeks: ['DLB-L', 'BLD-B', 'D-L-D', 'LB---'] },
    { id: 'b', name: '참가자 B', goal: 5, weeks: ['BBDBL', 'BDBLB', 'DBBDL', 'BB---'] },
    { id: 'c', name: '참가자 C', goal: 3, weeks: ['L-L-D', '-L-D-', 'LD-L-', 'L----'] },
    { id: 'd', name: '참가자 D', goal: 4, weeks: ['D-D-D', 'DDL-D', 'B-D-D', 'D-D--'] },
    { id: 'e', name: '참가자 E', goal: 3, weeks: ['-L---', 'L-L-L', '-BL-B', '-L---'] },
  ] as const satisfies ReadonlyArray<SampleParticipant>,
} as const;

/** 사전 등록 폼 위에 들어가는 이야기. 한 항목이 화면에서 한 줄 */
export const story = {
  title: '나만의 워터로그 챌린지',
  stanzas: [
    ['평생 일만 하고 돈만 버는,', '수동적인 사람으로 살아왔어요.'],
    ['그런데 수영을 하며 건강해지면서,', '내가 좋아하는 게 무엇인지 알게 되었습니다.'],
    ['거창한 목표는 필요 없어요.', '매일의 수영 기록, 그 작은 성취가 쌓이면,', '자신감은 반드시 따라옵니다.'],
  ],
  closing: ['당신의 변화도,', '오늘도 한 걸음 나아가며 시작돼요.'],
} as const;

export const faq = {
  eyebrow: 'FAQ',
  title: '자주 묻는 질문',
  items: [
    {
      question: '하루를 놓치면 어떻게 되나요?',
      answer:
        '괜찮아요. 평일(월~금) 중 주 3~5회만 인증하면 그 주는 성공이에요. 주말은 쉬고, 하루 놓쳐도 같은 주의 다른 평일에 채우면 돼요.',
    },
    {
      question: '다른 참여자가 제 기록을 볼 수 있나요?',
      answer:
        '네. 서로 자극을 주고받을 수 있도록 진행판에 참여 아이디와 기록이 함께 보여요. 공개 범위 등 세부 정책은 시작 전 안내드릴게요. (플레이스홀더 답변)',
    },
    {
      question: '비용이 드나요?',
      answer: '아니요, 사전 등록부터 챌린지 참여까지 모두 무료예요.',
    },
    {
      question: '안전을 위해 주의할 점이 있나요?',
      answer:
        '참여 전 건강 상태를 확인하고, 불편함이 있다면 전문가와 먼저 상담해 주세요. 안전요원이 있는 수영장에서, 컨디션이 좋지 않은 날은 무리하지 말고 쉬어 주세요.',
    },
  ],
} as const;

export const signup = {
  eyebrow: '사전 등록',
  description: '사전 신청하신 분께 챌린지 일정과 참여 방법을 가장 먼저 알려드려요.',
  requiredNotice: '* 표시는 필수 질문이에요',
  requiredMark: '필수',
  answerPlaceholder: '내 답변',
  nameLabel: '이름 또는 닉네임',
  phoneLabel: '연락받을 휴대폰 번호',
  phonePlaceholder: '010-1234-5678',
  emailLabel: '이메일',
  emailPlaceholder: 'you@example.com',
  frequencyLabel: '지금 수영은 어느 정도 하고 계세요?',
  frequencyOptions: {
    once: '주 1회',
    'two-three': '주 2~3회',
    five: '주 5회',
    six: '주 6회',
  } satisfies Record<SwimFrequency, string>,
  levelLabel: '지금 수영 강습 등록을 하셨다면 레벨은?',
  levelHint: '강습을 듣지 않으면 비워 두셔도 돼요.',
  levelOptions: {
    beginner: '초급',
    intermediate: '중급',
    advanced: '상급',
  } satisfies Record<Level, string>,
  goalLabel: '이번 한 달 동안 가장 바꾸고 싶은 건 뭐예요?',
  goalPlaceholder: '예: 자유형 호흡이 편해졌으면 좋겠어요',
  referralLabel: '어디서 보고 오셨어요?',
  referralOptions: {
    youtube: '유튜브 영상',
    threads: '스레드',
    blog: '블로그',
    friend: '지인 소개',
    other: '기타',
  } satisfies Record<ReferralSource, string>,
  agreeLabel: '개인정보 수집·이용에 동의합니다.',
  agreeDetail:
    '수집 항목: 이름(닉네임), 휴대폰 번호, 이메일, 수영 빈도, 강습 레벨, 목표, 유입 경로 · 이용 목적: 챌린지 일정 안내 · 보유 기간: 챌린지 종료 시까지',
  clearLabel: '양식 지우기',
  submit: '사전 신청 제출하기',
  submitting: '등록하는 중…',
  success: '사전 등록이 완료되었어요! 챌린지 시작 전 이메일로 알려드릴게요.',
  resetLabel: '다른 정보로 다시 신청하기',
  genericError: '등록 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.',
  errors: {
    nameRequired: '이름 또는 닉네임을 입력해 주세요.',
    nameTooLong: '이름 또는 닉네임은 20자 이내로 입력해 주세요.',
    phoneRequired: '휴대폰 번호를 입력해 주세요.',
    phoneInvalid: '올바른 휴대폰 번호가 아니에요. 예: 010-1234-5678',
    emailRequired: '이메일을 입력해 주세요.',
    frequencyRequired: '수영하는 빈도를 선택해 주세요.',
    emailInvalid: '올바른 이메일 형식이 아니에요. 예: you@example.com',
    agreeRequired: '개인정보 수집·이용에 동의해 주세요.',
    goalTooLong: '200자 이내로 입력해 주세요.',
  },
  limits: { name: 20, goal: 200 },
} as const;

/** 홈에서 Q&A·정보 공유 게시판으로 안내하는 섹션 */
export const community = {
  eyebrow: '함께 배워요',
  title: '물어보고, 나눠요',
  cards: [
    {
      href: '/qna',
      title: '수영 기술 Q&A',
      description: '막히는 동작이 있으면 언제든 물어보세요. 운영자가 직접 답해 드려요.',
      cta: '질문하러 가기',
    },
    {
      href: '/tips',
      title: '수영 정보 공유',
      description: '도움이 된 팁, 용품, 수영장 정보를 참여자끼리 나눠요.',
      cta: '게시판 보기',
    },
  ],
} as const;

/** Q&A·정보 공유에서 같이 쓰는 문구 */
export const posts = {
  sampleBadge: '예시',
  sampleNotice: '아직 게시판이 연결되지 않아 예시 글만 보여요. 실제 참여자의 글이 아니에요.',
  nameLabel: '참여 아이디',
  namePlaceholder: '예: 물개',
  titleLabel: '제목',
  bodyLabel: '내용',
  loading: '글을 불러오는 중…',
  loadError: '글을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
  saveError: '저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
  submitting: '올리는 중…',
  allFilter: '전체',
  filterLabel: '분류',
  empty: '아직 글이 없어요. 첫 글을 남겨 주세요!',
  delete: '삭제',
  deleteConfirm: '이 글을 삭제할까요? 되돌릴 수 없어요.',
  operatorTag: '운영자',
  mineTag: '내 글',
  limits: { name: 12, title: 60, body: 1000, answer: 2000, link: 300 },
  errors: {
    nameRequired: '참여 아이디를 입력해 주세요.',
    nameTooLong: '참여 아이디는 12자 이내로 입력해 주세요.',
    titleRequired: '제목을 입력해 주세요.',
    titleTooLong: '제목은 60자 이내로 입력해 주세요.',
    bodyRequired: '내용을 입력해 주세요.',
    bodyTooLong: '내용은 1000자 이내로 입력해 주세요.',
    answerRequired: '답변을 입력해 주세요.',
    answerTooLong: '답변은 2000자 이내로 입력해 주세요.',
    linkInvalid: '링크는 http:// 또는 https://로 시작하는 주소로 입력해 주세요.',
    linkTooLong: '링크는 300자 이내로 입력해 주세요.',
  },
  privacyNote: '전화번호, 이메일 같은 개인정보는 적지 말아 주세요. 모든 참여자에게 공개돼요.',
} as const;

export const qna = {
  pageTitle: '수영 기술 Q&A | 나만의 워터로그 챌린지',
  pageDescription: '수영 기술이 궁금할 때 질문하면 운영자가 답해 드려요.',
  eyebrow: '기술 Q&A',
  title: '수영 기술, 무엇이든 물어보세요',
  description: '막히는 동작이나 궁금한 점을 남기면 운영자가 확인하고 답해 드려요.',
  formTitle: '질문하기',
  strokeLabel: '어떤 영법이에요?',
  titlePlaceholder: '예: 자유형 호흡할 때 물을 자꾸 먹어요',
  bodyPlaceholder: '어떤 상황에서 어떻게 되는지 적어 주시면 더 정확하게 답할 수 있어요.',
  submit: '질문 올리기',
  submitted: '질문을 올렸어요! 운영자가 확인하고 답해 드릴게요.',
  listTitle: '질문 목록',
  statusLabel: '답변 상태',
  statusOptions: { all: '전체', waiting: '답변 대기', answered: '답변 완료' },
  waiting: '답변 대기',
  answered: '답변 완료',
  answerHeading: '운영자 답변',
  answerLabel: '답변 쓰기',
  answerPlaceholder: '참여자가 바로 따라 해 볼 수 있게 구체적으로 적어 주세요.',
  answerSubmit: '답변 올리기',
  answerUpdate: '답변 고치기',
  answerEdit: '답변 수정',
  answerCancel: '취소',
  count: (n: number) => `${n}개`,
} as const;

export const tips = {
  pageTitle: '수영 정보 공유 | 나만의 워터로그 챌린지',
  pageDescription: '도움이 된 수영 팁, 용품, 수영장 정보를 참여자끼리 나눠요.',
  eyebrow: '정보 공유',
  title: '나만 알기 아까운 수영 정보',
  description: '도움이 된 연습법, 용품, 수영장 정보를 서로 나눠요.',
  formTitle: '정보 나누기',
  categoryLabel: '분류',
  categoryOptions: {
    technique: '기술·연습법',
    gear: '용품',
    pool: '수영장',
    health: '건강·회복',
    etc: '기타',
  } satisfies Record<TipCategory, string>,
  titlePlaceholder: '예: 킥판 발차기 10분이 호흡 연습에 좋아요',
  bodyPlaceholder: '어떻게 해 봤고, 무엇이 좋았는지 적어 주세요.',
  linkLabel: '참고 링크 (선택)',
  linkPlaceholder: 'https://',
  linkOpen: '참고 링크 열기',
  submit: '정보 올리기',
  submitted: '글을 올렸어요! 아래 목록에서 확인해 보세요.',
  listTitle: '공유된 정보',
  count: (n: number) => `${n}개`,
} as const;

/** Google 로그인 (글쓰기는 로그인한 사람만, 답변은 운영자만) */
export const auth = {
  signIn: 'Google로 로그인',
  signOut: '로그아웃',
  checking: '로그인 상태를 확인하는 중…',
  signInPrompt: '글을 쓰려면 Google 계정으로 로그인해 주세요. 게시판에는 Google 이름 대신 직접 정한 참여 아이디가 보여요.',
  signedIn: (email: string) => `${email}로 로그인됨`,
  operatorBadge: '운영자',
  signInError: '로그인하지 못했어요. 잠시 후 다시 시도해 주세요.',
  notConnected: '게시판이 아직 연결되지 않아 로그인과 글쓰기를 할 수 없어요. 챌린지 시작 전에 열어 드릴게요.',
} as const;

/** 게시판이 연결되기 전(Firebase 설정값이 없을 때)에만 보여 주는 예시 글 (createdAt은 ms) */
export const samplePosts = {
  questions: [
    {
      id: 'sample-q1',
      authorUid: 'sample',
      authorName: '참가자 A',
      stroke: '자유형',
      title: '호흡할 때 물을 자꾸 먹어요',
      body: '오른쪽으로 숨 쉴 때마다 물이 입으로 들어와요. 고개를 더 들어야 할까요?',
      createdAt: Date.UTC(2026, 9, 27, 3),
      answer: {
        body: '고개를 드는 것보다 몸을 옆으로 굴리는 게 먼저예요. 한쪽 귀는 물에 대고, 입은 어깨 쪽으로 반만 돌려 보세요. 숨은 물속에서 코로 미리 내쉬어 두면 입을 열었을 때 바로 들이마실 수 있어요.',
        answeredAt: Date.UTC(2026, 9, 27, 9),
      },
    },
    {
      id: 'sample-q2',
      authorUid: 'sample',
      authorName: '참가자 C',
      stroke: '평영',
      title: '발차기를 해도 앞으로 안 나가요',
      body: '평영 발차기를 열심히 하는데 제자리에 있는 느낌이에요.',
      createdAt: Date.UTC(2026, 9, 28, 1),
    },
  ],
  tips: [
    {
      id: 'sample-t1',
      authorUid: 'sample',
      authorName: '참가자 B',
      category: 'technique',
      title: '킥판 잡고 호흡만 10분 연습',
      body: '수업 전에 킥판을 잡고 발차기하면서 호흡만 연습했더니 자유형이 훨씬 편해졌어요.',
      createdAt: Date.UTC(2026, 9, 26, 12),
    },
    {
      id: 'sample-t2',
      authorUid: 'sample',
      authorName: '참가자 D',
      category: 'gear',
      title: '김서림 방지는 수경 안쪽을 만지지 않기',
      body: '수경 안쪽을 손가락으로 닦으면 김서림 방지 코팅이 금방 벗겨져요. 물로 헹구기만 하세요.',
      createdAt: Date.UTC(2026, 9, 28, 5),
    },
  ],
} as const satisfies { questions: readonly Question[]; tips: readonly Tip[] };

export const strokeOptions: readonly Stroke[] = ['자유형', '배영', '평영', '접영', '기타'];

export const footer = {
  contactLabel: '문의',
  contactEmail: 'hello@example.com',
  contactNote: '(플레이스홀더)',
  safety: '수영 전 건강 상태를 확인하고, 안전요원이 있는 곳에서 무리하지 않고 수영해 주세요.',
  copyright: (year: number) => `© ${year} 나만의 워터로그 챌린지. All rights reserved.`,
} as const;

export const weekdays = ['일', '월', '화', '수', '목', '금', '토'] as const;
