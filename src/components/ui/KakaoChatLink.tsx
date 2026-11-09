import { hero } from '@/content/landing';

/** 참여자 톡방(카카오톡 오픈채팅) 버튼. 카카오톡 노란색이고, 외부 사이트라 새 창으로 연다 */
export function KakaoChatLink({ className = '' }: { className?: string }) {
  return (
    <a
      href={hero.chatUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FEE500] px-6 py-3 font-bold text-[#191919] shadow-md transition hover:-translate-y-0.5 hover:brightness-95 sm:w-auto ${className}`}
    >
      <span aria-hidden="true">💬</span>
      {hero.chatCta}
      <span className="sr-only">{hero.newWindow}</span>
    </a>
  );
}
