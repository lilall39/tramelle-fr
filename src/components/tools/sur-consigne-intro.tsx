/** Bloc d’aide au-dessus de l’iframe — consigne + exemples de formulations. */
export function SurConsigneIntro() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-ink/70">
      <p className="text-ink/80">
        <span className="font-medium text-ink">Écris ta demande ici</span>, mets deux petits points, et pose tes mots.
      </p>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">Ex. :</p>
        <ul className="space-y-1.5 border-l-2 border-ink/[0.1] pl-4 font-mono text-[0.8125rem] text-ink/85">
          <li>poésie :</li>
          <li>traduis :</li>
          <li>fais une dissert :</li>
          <li>qui était :</li>
        </ul>
      </div>
      <p className="text-xs leading-relaxed text-ink/55">
        Relecture, rédaction, traduction, explication… l’outil s’ajuste à ta consigne. L’interface est hébergée
        séparément ; le premier chargement peut être lent si le serveur était en veille.
      </p>
    </div>
  );
}
