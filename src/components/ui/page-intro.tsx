type Props = {
  title: string;
  intro: string;
  /** Libellé de rubrique au-dessus du titre (optionnel). */
  eyebrow?: string;
};

export function PageIntro({ title, intro, eyebrow }: Props) {
  return (
    <header className="space-y-6 border-b border-ink/[0.08] pb-12">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
      ) : null}
      <h1 className="font-editorial-serif text-[2.1rem] font-medium leading-tight tracking-tight text-ink sm:text-5xl sm:leading-[1.08]">
        {title}
      </h1>
      <p className="max-w-2xl text-lg leading-relaxed text-ink/75">{intro}</p>
    </header>
  );
}
