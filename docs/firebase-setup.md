# Firebase 연결 가이드

사전 등록, 기술 Q&A, 정보 공유 게시판을 Firebase에 저장하는 방법이에요. 코드는 준비돼 있고, **설정값만 넣으면** 바로 동작해요.
설정값이 없으면 사전 등록은 1초 뒤 "완료"만 뜨는 연습용(mock)으로, 게시판은 예시 글만 보이고 글쓰기는 막힌 채로 동작해요.

## 1. Firebase 프로젝트 만들기
1. [Firebase 콘솔](https://console.firebase.google.com)에서 **프로젝트 추가**
2. 왼쪽 메뉴 **빌드 → Firestore Database → 데이터베이스 만들기**
   - 위치: `asia-northeast3 (서울)` 추천
   - "프로덕션 모드로 시작" 선택 (보안 규칙은 3단계에서 넣어요)

## 2. 웹 앱 설정값 넣기
1. 프로젝트 설정(톱니바퀴) → 일반 → 내 앱 → **웹(`</>`) 앱 추가**
2. 나오는 `firebaseConfig`의 값을 복사
3. 프로젝트 폴더에서 `.env.example`을 복사해 `.env.local`로 저장하고 값을 채우기

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=내프로젝트.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=내프로젝트
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=내프로젝트.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abc...
```

4. `npm run dev`를 다시 실행 (설정값은 시작할 때 읽어요)

> 웹 앱 설정값은 브라우저에 공개되는 값이라 비밀번호가 아니에요. 데이터는 3단계의 **보안 규칙**이 지켜요.
> `.env.local`은 git에 올라가지 않아요. 배포용 값은 저장소의 `.env.production`에 들어 있어서,
> Netlify 같은 배포 서비스에서 빌드하면 자동으로 쓰여요 (배포 서비스 환경 변수에 같은 이름을 넣으면 그 값이 우선).

## 3. 보안 규칙 넣기 (꼭!)
`firestore.rules` 내용을 그대로 쓰면 돼요. 둘 중 편한 방법으로:
- 콘솔: **Firestore → 규칙** 탭에 붙여넣고 **게시**
- 터미널: `npx firebase-tools login` → `npx firebase-tools deploy --only firestore:rules --project 내프로젝트`

규칙이 하는 일
- `signups`(사전 신청): 누구나 **새로 쓰기만** 가능. 읽기·수정·삭제는 막혀 있어요 (휴대폰 번호 보호).
  이름 20자 이하, 휴대폰 형식, 이메일 형식, 동의 여부, 허용된 항목만 저장되도록 한 번 더 검사해요.
- `participants`(챌린지 시작 후 인증 기록): 진행판은 누구나 보고, 기록은 로그인한 본인만 써요.
- `questions`(기술 Q&A): 누구나 읽고, Google 로그인한 사람만 질문을 써요. 답변은 운영자만 쓰고 고쳐요.
  삭제는 쓴 사람 또는 운영자만 할 수 있어요.
- `tips`(정보 공유): 누구나 읽고, Google 로그인한 사람만 써요. 링크는 `http://`, `https://` 주소만 받아요.
  삭제는 쓴 사람 또는 운영자만 할 수 있어요.
- `admins`(운영자 목록): 콘솔에서만 바꿀 수 있어요. 사이트는 로그인한 본인이 운영자인지만 확인해요.

## 4. Google 로그인 켜기 (기술 Q&A·정보 공유 게시판)
게시판 글쓰기는 Google 로그인한 사람만 할 수 있어요.
1. 왼쪽 메뉴 **빌드 → Authentication → 시작하기**
2. **로그인 방법** 탭 → **Google** → 사용 설정 → 프로젝트 지원 이메일 고르고 **저장**
3. 사이트를 배포했다면 **Authentication → 설정 → 승인된 도메인**에 사이트 주소(예: `내사이트.netlify.app`)를 추가
   (`localhost`는 처음부터 들어 있어요)

## 5. 운영자 등록하기 (질문에 답변 달기)
운영자는 Q&A 질문에 답변을 쓰고 고칠 수 있고, 게시판의 어떤 글이든 지울 수 있어요.
1. 운영자로 쓸 Google 계정으로 사이트의 **기술 Q&A**(`/qna`) 페이지에서 한 번 로그인
2. 콘솔 **Authentication → 사용자** 탭에서 그 계정의 **사용자 UID**를 복사
3. **Firestore → 데이터 → 컬렉션 시작** → 컬렉션 ID `admins` → 문서 ID에 복사한 UID를 붙여넣기
   → 필드는 아무거나 하나 (예: `name` / 문자열 / `운영자`) → **저장**
4. 사이트를 새로 고치면 로그인 정보 옆에 **운영자** 표시가 붙고, 질문마다 답변 쓰기 칸이 보여요

운영자를 빼려면 `admins`에서 그 문서를 지우면 돼요. 이 목록은 콘솔에서만 바꿀 수 있어요.

## 6. 확인하기
1. 사이트에서 사전 신청을 제출
2. 콘솔 **Firestore → 데이터 → signups**에 문서가 생겼는지 확인
3. 신청 목록은 이 화면에서 보거나, 필요하면 내보내기(Export)를 써요
4. `/qna`에서 Google 로그인 → 질문을 올리면 **questions**에, `/tips`에서 글을 올리면 **tips**에 문서가 생겨요

제출이 실패하면 브라우저 개발자 도구 콘솔에 `사전 등록 저장 실패`(게시판은 `질문 저장 실패` 등)와 원인이 찍혀요.
`permission-denied`면 보안 규칙이 게시됐는지, 입력값이 규칙에 맞는지 확인해 주세요.
Google 로그인 창이 바로 닫히고 `auth/unauthorized-domain`이 찍히면 4단계의 승인된 도메인을 확인해 주세요.

## (선택) 내 컴퓨터에서 연습하기: 에뮬레이터
실제 프로젝트를 건드리지 않고 연습할 수 있어요. Java가 설치돼 있어야 해요.
1. `.env.local`에 아무 값이나 넣고(`PROJECT_ID`는 `demo-waterlog`처럼 `demo-`로 시작) 아래 두 줄을 추가
   `NEXT_PUBLIC_FIREBASE_EMULATOR_HOST=127.0.0.1:8080`
   `NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099`
2. 터미널 1: `npx firebase-tools emulators:start --only firestore,auth --project demo-waterlog`
3. 터미널 2: `npm run dev` → 사전 신청 제출, 게시판 로그인(가짜 Google 계정 화면이 떠요)
   → 에뮬레이터 화면(http://127.0.0.1:4000)에서 저장된 문서 확인. 운영자 연습은 여기서 `admins` 문서를 만들면 돼요

## 코드 위치
| 파일 | 하는 일 |
|---|---|
| `src/lib/firebase/config.ts` | `.env.local` 값 읽기. 값이 없으면 연습용 모드 |
| `src/lib/firebase/client.ts` | Firebase 앱·Firestore 준비 (한 번만) |
| `src/lib/firebase/signups.ts` | 사전 신청을 `signups`에 저장 |
| `src/lib/signup.ts` | 폼이 부르는 `submitSignup`. 설정값이 있으면 Firestore, 없으면 mock |
| `src/lib/firebase/auth.ts` | Google 로그인, 운영자(`admins/{uid}`) 확인 |
| `src/lib/firebase/posts.ts` | 기술 Q&A·정보 공유 글 저장/불러오기/답변/삭제 |
| `src/lib/firebase/checkins.ts` | (챌린지 시작 후) 참여자·하루 인증 저장/불러오기 뼈대. 아직 화면에 연결 안 됨 |
| `firestore.rules` | 보안 규칙 |

## 다음 단계: 인증·진행판 연결 (챌린지 시작 전까지)
1. Google 로그인은 게시판에 이미 붙어 있어요 (`src/components/community/useAuth.ts`)
2. 로그인한 사용자의 `uid`로 `saveParticipant`, `saveDay` 호출
3. 진행판은 `loadParticipants()` 결과를 `BoardTable`의 `rows`로 넘기기
   (`src/components/sections/WeeklyBoard.tsx`의 `myLogs` 상태와 예시 데이터를 이것으로 교체)
