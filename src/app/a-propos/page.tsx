import { PageContainer } from "@/components/layout/page-container";
import { PageIntro } from "@/components/ui/page-intro";
import { brand } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Pourquoi Tramelle existe, comment le site est pensé, et ce qu’on y trouve — outils, articles et billets.",
  alternates: { canonical: "/a-propos" },
};

export default function AboutPage() {
  return (
    <PageContainer>
      <PageIntro
        title="À propos"
        intro={`${brand.kicker} se présente comme une petite revue : ${brand.subtitle}. Modeste sur la forme, exigeant sur l’intention — à la fois boîte à outils et espace d’écriture.`}
      />
      <div className="prose-tramelle mx-auto max-w-2xl space-y-6 pb-8 text-[1.05rem] leading-[1.75] text-ink/88">
        <p>
          J’ai voulu éviter deux écueils : la page « startup » qui promet une transformation totale en trois étapes, et
          le blog figé qui n’ose plus publier tant que le texte n’est pas parfait. D’un côté, des outils qui répondent à
          des besoins concrets ; de l’autre, des textes qui assument d’être en mouvement.
        </p>
        <p>
          Les{" "}
          <Link href="/outils" className="font-medium text-ink underline-offset-4 transition-colors hover:text-accent hover:underline">
            outils
          </Link>{" "}
          sont pensés pour rester simples : pas de compte, pas de collecte inutile de données côté navigateur au-delà de
          ce que vous y tapez — tout se passe dans votre page.
        </p>
        <p>
          Les{" "}
          <Link href="/articles" className="font-medium text-ink underline-offset-4 transition-colors hover:text-accent hover:underline">
            articles
          </Link>{" "}
          explorent des sujets plus larges (attention, habitudes, manière de travailler avec le web). Les{" "}
          <Link href="/billets" className="font-medium text-ink underline-offset-4 transition-colors hover:text-accent hover:underline">
            billets
          </Link>{" "}
          sont plus subjectifs : notes d’atelier, opinions, fragments d’expérience.
        </p>
        <p className="text-ink/65">
          Le site est construit avec Next.js et hébergé de façon statique autant que possible — pour la rapidité, la
          clarté, et une base technique qui vieillira correctement si on continue d’y publier avec régularité.
        </p>
      </div>
    </PageContainer>
  );
}
