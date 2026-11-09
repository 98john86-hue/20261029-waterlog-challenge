import type { NextConfig } from 'next';

// 빌드한 날 (한국 시간). 홈 화면의 챌린지 단계를 정적 HTML에 미리 넣어 두는 데 쓴다 (브라우저에서 오늘 날짜로 다시 맞춤)
const buildDate = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: { NEXT_PUBLIC_BUILD_DATE: buildDate },
  // 모바일에서 CSS 요청 왕복을 없애 첫 화면을 빨리 그린다
  experimental: { inlineCss: true },
};

export default nextConfig;
