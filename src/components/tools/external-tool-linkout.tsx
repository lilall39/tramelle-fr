type Props = {
  href: string;
  title: string;
};

export function ExternalToolLinkout({ href, title }: Props) {
  return (
    <div className="space-y-6">
      <p className="text-base font-bold leading-relaxed text-terracotta">
        Cette ressource est proposée en dehors de Tramelle. Le lien ci-dessous s’ouvre dans un nouvel onglet : vous
        quittez notre site pour accéder au catalogue.
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-xl border border-ink/[0.12] bg-paper px-5 py-3.5 text-sm font-bold text-terracotta shadow-sm shadow-ink/[0.03] transition-[border-color,box-shadow,background-color] hover:border-accent/35 hover:shadow-md hover:shadow-ink/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Ouvrir « {title} » — nouvel onglet
      </a>
      <p className="text-xs font-bold leading-relaxed text-terracotta">
        URL :{" "}
        <span className="break-all font-mono text-[0.8rem]" translate="no">
          {href}
        </span>
      </p>
    </div>
  );
}
