import { footer, site } from '@/content/landing';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-slate-900 py-10 text-slate-300">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 text-sm sm:px-6">
        <p className="text-base font-bold text-white">{site.name}</p>
        <p>
          {footer.contactLabel}:{' '}
          <a href={`mailto:${footer.contactEmail}`} className="text-cyan-300 underline underline-offset-4">
            {footer.contactEmail}
          </a>
        </p>
        <p>{footer.safety}</p>
        <p className="text-slate-400">{footer.copyright(year)}</p>
      </div>
    </footer>
  );
}
