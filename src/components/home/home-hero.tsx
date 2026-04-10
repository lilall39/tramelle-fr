import Link from "next/link";
import { brand } from "@/lib/site";

const sommaire = [
  { href: "#offres-et-services", num: "01", label: "Annonces" },
  { href: "#articles", num: "02", label: "Articles" },
  { href: "/login", num: "03", label: "Écrire" },
  { href: "#outils", num: "04", label: "Outils" },
  { href: "/login?next=/publier", num: "05", label: "Publier" },
] as const;

export function HomeHero() {
  return (
    <section
      className="home-hero-gradient relative border-b border-ink/[0.08] px-5 py-14 sm:px-8 sm:py-20"
      aria-labelledby="hero-title"
    >
      <div className="relative mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-lg font-bold text-terracotta/85">{brand.heroKickerLine}</p>
          <h1
            id="hero-title"
            className="font-editorial-serif mx-auto mt-12 max-w-[18ch] text-[2.4rem] font-medium leading-[1.08] tracking-tight text-ink sm:max-w-none sm:text-6xl sm:leading-[1.05]"
          >
            {brand.heroTitle}
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-[1.65] text-ink/78 sm:text-xl sm:leading-[1.6]">
            {brand.heroLead}
          </p>
        </div>

        <div className="mt-12 rounded-xl border-2 border-emerald-200/80 bg-[#eff3f1] px-4 pt-10 pb-6 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">{brand.sommaireLabel}</p>
          <ul className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-3">
            {sommaire.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group inline-flex items-baseline gap-2 text-lg text-ink transition-colors hover:text-accent"
                >
                  <span className="font-mono text-sm tabular-nums text-ink/35 group-hover:text-accent">
                    {item.num}
                  </span>
                  <span className="font-medium underline decoration-ink/[0.12] underline-offset-[0.25em] transition-[text-decoration-color] group-hover:decoration-accent/55">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
