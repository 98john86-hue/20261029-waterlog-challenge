# 나만의 워터로그 챌린지 랜딩 페이지

3주 동안 평일(월~금) 중 주 3~5회, 수영 거리나 배운 점을 기록하는 챌린지의 사이트입니다.

챌린지 기간: 2026년 11월 9일(월)~27일(금) 평일 3주 + 11월 30일(월) 마무리 날

- `/` 랜딩 페이지 (소개, 진행판 미리보기, 사전 등록)
- `/challenge` 오늘의 인증: Google 로그인 후 매일 인증, 모든 참여자의 진행판
  - 인증하면서 운영자에게 궁금한 점을 남기면 기술 Q&A 질문으로 올라감
  - 기록마다 운영자 한마디(💬)와 참여자 응원(👏), 주간 목표 달성 메달(1주차 돌고래, 2주차 수달, 3주차 고래)
  - 내 질문에 답변이나 내 기록에 한마디가 달리면 '새 소식'으로 알려 줌
- `/qna` 수영 기술 Q&A: 참여자가 질문하고 운영자가 답변
- `/tips` 수영 정보 공유 게시판: 참여자끼리 팁·용품·수영장 정보 공유
- 인증과 게시판 글쓰기는 Google 로그인한 사람만, 답변은 운영자만 (Firebase Authentication + Firestore)

- Next.js (App Router) · TypeScript strict · Tailwind CSS v4 · Vitest

## 실행

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 프로덕션 빌드
npm run typecheck  # 타입 체크
npm test           # 단위 테스트
```

## 구조

```
src/
  app/                 layout(metadata), page, globals.css, challenge/(오늘의 인증), qna/(기술 Q&A), tips/(정보 공유)
  content/landing.ts   페이지의 모든 문구와 예시 데이터
  lib/
    types.ts           Level, SwimLog, SignupData, Question, Tip 등 타입
    distance.ts        총 거리 계산 (레인 길이 × 2 × 바퀴 수, 1바퀴 = 왕복)
    validation.ts      이메일·신청 폼 검증
    signup.ts          submitSignup — Firebase 설정이 있으면 Firestore 저장, 없으면 mock
    posts.ts           게시판 글 검증·정리·정렬, Firestore 문서 → 글 변환
    community.ts       게시판 연결 여부, 예시 글
    feedback.ts        진행판 기록의 운영자 한마디·응원 (변환, 집계)
    seen.ts            새 소식 표시용으로 마지막 확인 시각 기억 (이 브라우저)
    firebase/          config(환경 변수), client, signups(사전 신청 저장), checkins(오늘의 인증 저장),
                       auth(Google 로그인·운영자 확인), posts(Q&A·정보 공유 저장), feedback(한마디·응원 저장)
    date.ts            기록 날짜 표시
    board.ts           진행판: 기간(주차 + 마무리 날), 주간 집계, 기록 많은 순 정렬
    sampleBoard.ts     진행판 예시 참여자
  components/
    sections/          SiteHeader, Hero, HowItWorks, WeeklyBoard(진행판 미리보기),
                       Community(게시판 안내), Faq, SignupCta, Footer
    challenge/         ChallengeBoard(오늘의 인증 + 새 소식 + 전체 진행판), CommentDialog(운영자 한마디)
    community/         QuestionBoard, TipBoard, AuthPanel(로그인), fields(입력칸), useAuth, usePosts
    ui/                CheckInForm, BoardTable, Button, Badge, WaveBackground, Icon, SectionHeading
  tests/               Vitest 단위 테스트
public/medals/         주간 목표 달성 메달 이미지
```

## Firebase 연결

`.env.example`을 `.env.local`로 복사해 Firebase 웹 앱 설정값을 넣으면 사전 신청이 Firestore `signups`에 저장됩니다.
오늘의 인증과 게시판은 Google 로그인 켜기가, Q&A 답변은 운영자 등록이 필요해요.
값이 없으면 사전 등록은 1초 뒤 성공하는 연습용(mock)으로, 진행판과 게시판은 예시만 보이고 쓰기는 막힌 채로 동작합니다.
자세한 순서는 [docs/firebase-setup.md](docs/firebase-setup.md)를 보세요.
