/** Bloc d’aide au-dessus de l’iframe — consigne + exemples de formulations. */
export function SurConsigneIntro() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-ink">
      <p>
        <span className="font-medium text-ink">Écris ta demande ici</span>, mets deux petits points, et pose tes mots.
      </p>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">Ex. :</p>
        <ul className="space-y-1.5 border-l-2 border-ink/[0.15] pl-4 font-mono text-[0.8125rem] text-ink">
          <li>Avec ces mots, écris une poésie en ... lignes :</li>
          <li>Traduis en ... :</li>
          <li>En ... lignes, fais une dissert sur :</li>
          <li>Résous cette opération :</li>
          <li>En ... lignes, développe l’idée de :</li>
          <li>Corrige ce texte :</li>
        </ul>
      </div>
      <p className="text-xs font-bold leading-relaxed text-terracotta">
        Relecture, rédaction, traduction, explication, calculs… l’outil s’ajuste à ta consigne. La zone de correction
        ci-dessous tourne sur Tramelle (LanguageTool).
      </p>
    </div>
  );
}
