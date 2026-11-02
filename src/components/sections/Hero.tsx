import { hero } from '@/content/landing';
import { ButtonLink } from '@/components/ui/Button';
import { WaveBackground } from '@/components/ui/WaveBackground';

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-linear-to-b from-sky-100 to-cyan-50 px-4 pt-12 pb-28 text-center sm:pt-20 sm:pb-36"
    >
      <div className="relative z-10 mx-auto max-w-2xl">
        <p className="text-sm font-bold text-teal-700">{hero.eyebrow}</p>
        <h1 id="hero-title" className="mt-3 text-[2rem] leading-tight font-black tracking-tight text-slate-900 sm:text-5xl">
          {hero.headlineLines.map((line, i) => (
            <span key={line} className={`block ${i === 1 ? 'text-teal-700' : ''}`}>
              {line}
            </span>
          ))}
        </h1>
        <p className="mt-5 text-lg font-bold text-slate-800 sm:text-xl">
          {hero.subcopyLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
        <p className="mt-3 text-slate-700">
          {hero.bodyLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
        <ButtonLink href="#signup" className="mt-8 w-full sm:w-auto">
          {hero.primaryCta}
        </ButtonLink>
      </div>
      <WaveBackground />
    </section>
  );
}
