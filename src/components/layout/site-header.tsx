import Link from "next/link";
import { SiteNav } from "@/components/layout/site-nav";
import { brand, siteDomain } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper-elevated/90 shadow-sm shadow-ink/[0.03] backdrop-blur-md dark:bg-paper-elevated/85">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:py-6">
        <Link
          href="/"
          className="group inline-flex max-w-md flex-col gap-1.5 transition-opacity hover:opacity-90"
          aria-label={`${brand.kicker}, accueil`}
        >
          <span className="font-editorial-serif text-[1.65rem] font-semibold leading-none tracking-tight text-ink sm:text-[1.85rem]">
            {brand.kicker}
          </span>
          <span className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-ink/40">
            {siteDomain}
          </span>
          <span className="font-editorial-serif text-sm italic leading-snug text-ink/55 group-hover:text-ink/70">
            {brand.subtitle}
          </span>
        </Link>
        <SiteNav />
      </div>
    </header>
  );
}
