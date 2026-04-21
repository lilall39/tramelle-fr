type Props = {
  href: string;
  title: string;
};

export function ExternalToolLinkout({ href, title }: Props) {
  return (
    <div className="space-y-6">
      <p className="text-base font-bold leading-relaxed text-terracotta">
        Cette ressource est proposée en dehors de Tramelle. Le lien ci-dessous s’ouvre dans un nouvel onglet : vous
        quittez notre site pour y accéder.
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-xl border border-[#4a6078] bg-[#4a6078] px-5 py-3.5 text-sm font-bold text-white shadow-sm shadow-black/15 transition-[border-color,box-shadow,background-color] hover:border-[#556b82] hover:bg-[#556b82] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4a6078]"
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
