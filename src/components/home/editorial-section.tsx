import type { ReactNode } from "react";

type Props = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function EditorialSection({ id, number, eyebrow, title, description, children, footer }: Props) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="flex flex-col gap-6 border-b border-ink/[0.08] pb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-12">
        <div className="flex gap-6 sm:gap-8">
          <span
            className="font-editorial-serif text-5xl font-light tabular-nums leading-none text-ink/[0.11]"
            aria-hidden
          >
            {number}
          </span>
          <div className="space-y-3 pt-1">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-terracotta">{eyebrow}</p>
            <h2 className="font-editorial-serif text-3xl font-medium tracking-tight text-ink sm:text-[2rem]">{title}</h2>
            <p className="max-w-xl text-base leading-relaxed text-ink/68">{description}</p>
          </div>
        </div>
      </div>
      <div className="pt-10">{children}</div>
      {footer ? <div className="pt-8">{footer}</div> : null}
    </section>
  );
}
