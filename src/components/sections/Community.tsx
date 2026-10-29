import Link from 'next/link';
import { community } from '@/content/landing';
import { buttonStyles } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';

/** 홈에서 기술 Q&A·정보 공유 게시판으로 안내 (모바일에서는 헤더 메뉴가 숨겨져 있어 여기서 들어간다) */
export function Community() {
  return (
    <section id="community" aria-labelledby="community-title" className="scroll-mt-16 px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <SectionHeading id="community-title" eyebrow={community.eyebrow} title={community.title} />
        <ul className="grid gap-4 sm:grid-cols-2">
          {community.cards.map((card) => (
            <li key={card.href} className="flex flex-col rounded-3xl bg-sky-50 p-6">
              <h3 className="text-lg font-extrabold text-slate-900">{card.title}</h3>
              <p className="mt-2 flex-1 text-slate-700">{card.description}</p>
              <Link href={card.href} className={`${buttonStyles('outline', 'sm')} mt-5 self-start`}>
                {card.cta}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
