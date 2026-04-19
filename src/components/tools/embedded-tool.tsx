type Props = {
  src: string;
  title: string;
  /** Fichier servi par Tramelle (même origine) : pas de masque ni message « service externe ». */
  sameOrigin?: boolean;
  /** Formulaires longs : cadre plus haut pour moins scroller dans l’iframe. */
  tall?: boolean;
};

/**
 * Outil en iframe. Pour les domaines tiers, la lenteur au premier chargement dépend de l’hébergeur.
 * Cross-origin : calque pour masquer le titre distant (on ne peut pas modifier le DOM autre domaine).
 */
export function EmbeddedTool({ src, title, sameOrigin = false, tall = false }: Props) {
  if (sameOrigin) {
    const frameClass = tall
      ? "block h-[min(92vh,1100px)] min-h-[min(88vh,960px)] w-full border-0"
      : "block h-[min(80vh,880px)] min-h-[min(76vh,800px)] w-full border-0";
    return (
      <div className="relative overflow-hidden rounded-xl border border-ink/[0.08] bg-paper-muted/40 shadow-sm shadow-ink/[0.04]">
        <iframe title={title} src={src} className={frameClass} loading="eager" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-bold leading-relaxed text-terracotta">
        L’interface ci-dessous provient d’un service externe. Si le chargement semble long, c’est souvent parce que le
        serveur se réveille après une période d’inactivité — attendez un peu ou actualisez la page.
      </p>
      <div className="relative overflow-hidden rounded-xl border border-ink/[0.08] bg-paper-muted/50 shadow-inner shadow-ink/[0.02]">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-[5.75rem] items-end border-b border-ink/[0.06] bg-paper px-4 pb-3 pt-2 sm:h-24 sm:px-5 sm:pb-3.5">
          <p className="font-editorial-serif text-[1.35rem] font-medium leading-tight tracking-tight text-outil-title sm:text-2xl">
            {title}
          </p>
        </div>
        <iframe
          title={title}
          src={src}
          className="block min-h-[min(75vh,820px)] w-full border-0"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <p className="text-xs text-ink/45">
        <a href={src} className="text-accent underline-offset-2 hover:underline" target="_blank" rel="noopener noreferrer">
          Ouvrir l’outil dans un nouvel onglet
        </a>{" "}
        si l’intégration ne s’affiche pas (certains navigateurs ou paramètres de sécurité bloquent les cadres).
      </p>
    </div>
  );
}
