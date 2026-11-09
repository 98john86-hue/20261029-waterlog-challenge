'use client';

import { header } from '@/content/landing';
import { ButtonLink } from '@/components/ui/Button';
import { useChallengePhase } from '@/components/useChallengePhase';

/** 오른쪽 위 버튼: 시작 전에는 사전 등록, 진행 중·종료 후에는 오늘의 인증(진행판)으로 */
export function HeaderCta() {
  const phase = useChallengePhase();
  const { href, label } = phase.kind === 'before' ? { href: '/#signup', label: header.cta } : header.phaseCta[phase.kind];
  return (
    <ButtonLink href={href} size="sm">
      {label}
    </ButtonLink>
  );
}
