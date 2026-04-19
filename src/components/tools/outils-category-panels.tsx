"use client";

import Link from "next/link";
import { useState } from "react";
import {
  getToolsByCategory,
  outilCategories,
  type OutilCategory,
} from "@/lib/content/outils";
import { homeBodyProseSizeClass } from "@/lib/home-body-prose";

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M5 8l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CategoryAccordion({ category }: { category: OutilCategory }) {
  const tools = getToolsByCategory(category.id);
  const [open, setOpen] = useState(category.id === "utilitaires");
  const countLabel =
    tools.length === 0
      ? "Aucun outil"
      : `${tools.length} outil${tools.length > 1 ? "s" : ""}`;

  return (
    <details
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className="group overflow-hidden rounded-2xl border border-ink/[0.08] bg-paper shadow-sm shadow-ink/[0.03] transition-[border-color,box-shadow] open:border-accent/25 open:shadow-md open:shadow-ink/[0.04]"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 sm:px-6 sm:py-5 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1 space-y-1 pr-2 text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terracotta">{countLabel}</p>
          <h2 className="font-editorial-serif text-xl font-bold tracking-tight text-ink sm:text-[1.35rem]">
            {category.label}
          </h2>
        </div>
        <span className="shrink-0 text-ink/45 transition-transform duration-200 ease-out group-open:rotate-180">
          <ChevronIcon />
        </span>
      </summary>
      <div className="border-t border-ink/[0.08] px-5 pb-6 pt-5 sm:px-6">
        <p className={`mb-5 max-w-2xl ${homeBodyProseSizeClass} text-ink/70`}>{category.description}</p>
        {tools.length === 0 ? (
          <p className={`${homeBodyProseSizeClass} text-ink/55`}>Rien ici pour le moment — revenez plus tard.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {tools.map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={`/outils/${tool.slug}`}
                  className="util-outil-card-surface group/card block rounded-xl border border-outil-title/22 px-3.5 py-3 shadow-sm shadow-black/[0.03] transition-[border-color,box-shadow] hover:border-outil-title/40 hover:shadow-md hover:shadow-black/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outil-title/35 sm:px-4 sm:py-3.5"
                >
                  <span className="font-editorial-serif text-lg font-bold leading-snug tracking-tight text-outil-title underline decoration-outil-title/25 decoration-1 underline-offset-[0.28em] transition-[text-decoration-color] group-hover/card:decoration-outil-title/50">
                    {tool.title}
                  </span>
                  <span className={`mt-1 block text-base leading-snug text-ink/68 sm:text-[1.05rem] sm:leading-snug`}>
                    {tool.tagline}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <p className={`mt-6 ${homeBodyProseSizeClass} text-ink/50`}>
          <Link
            href={`/outils/${category.id}`}
            className="font-bold text-terracotta underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Ouvrir la page « {category.label} »
          </Link>
        </p>
      </div>
    </details>
  );
}

export function OutilsCategoryPanels() {
  return (
    <div className="space-y-4">
      {outilCategories.map((category) => (
        <CategoryAccordion key={category.id} category={category} />
      ))}
    </div>
  );
}
