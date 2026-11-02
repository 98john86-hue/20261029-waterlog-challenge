import { header, site } from '@/content/landing';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-sky-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="/" aria-label={header.homeLabel} className="flex items-center gap-2 font-extrabold text-teal-800">
          <span className="grid size-9 place-items-center rounded-full bg-teal-700 text-white">
            <Icon name="wave" className="size-5" />
          </span>
          <span className="text-sm sm:text-base">{site.name}</span>
        </a>
        <nav aria-label={header.navLabel} className="flex items-center gap-5">
          <ul className="hidden items-center gap-5 md:flex">
            {header.nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="text-sm font-medium text-slate-700 hover:text-teal-700">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <ButtonLink href="/#signup" size="sm">
            {header.cta}
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}
