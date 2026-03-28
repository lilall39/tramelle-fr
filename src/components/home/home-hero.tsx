import Link from "next/link";
import { brand } from "@/lib/site";

const sommaire = [
  { href: "#outils", num: "01", label: "Outils", hint: "le concret" },
  { href: "#articles", num: "02", label: "Articles", hint: "le long" },
  { href: "#billets", num: "03", label: "Billets", hint: "la voix" },
] as const;

export function HomeHero() {
  return (
    <section
      className="relative overflow-hidden border-b border-ink/10 bg-gradient-to-br from-paper-elevated via-paper to-paper-muted/40 px-5 py-14 sm:px-8 sm:py-20 dark:from-paper-elevated dark:via-paper dark:to-paper-muted/30"
      aria-labelledby="hero-title"
    >
      <div
        className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-accent/[0.07] blur-3xl dark:bg-accent/[0.12]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl">
        <p className="font-editorial-serif text-sm font-medium italic text-sage dark:text-sage-muted">
          {brand.kicker} — {brand.subtitle}
        </p>
        <h1
          id="hero-title"
          className="font-editorial-serif mt-5 max-w-[18ch] text-[2.4rem] font-medium leading-[1.08] tracking-tight text-ink sm:max-w-none sm:text-6xl sm:leading-[1.05]"
        >
          {brand.heroTitle}
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-[1.65] text-ink/78 sm:text-xl sm:leading-[1.6]">
          {brand.heroLead}
        </p>

        <div className="mt-12 flex flex-col gap-6 border-t border-ink/10 pt-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-strong">{brand.sommaireLabel}</p>
            <ul className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-3">
              {sommaire.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-baseline gap-2 text-ink transition-colors hover:text-accent-strong"
                  >
                    <span className="font-mono text-xs tabular-nums text-ink/35 group-hover:text-accent">
                      {item.num}
                    </span>
                    <span className="font-medium underline decoration-ink/15 underline-offset-[0.25em] transition-[text-decoration-color] group-hover:decoration-accent/60">
                      {item.label}
                    </span>
                    <span className="text-sm text-ink/45">— {item.hint}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-ink/50 sm:text-right">
            Une même maison pour trois vitesses : l’instantané, le réfléchi, l’intime. Chaque rubrique a son rythme.
          </p>
        </div>
      </div>
    </section>
  );
}
