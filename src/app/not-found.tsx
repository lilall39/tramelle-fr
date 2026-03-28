import { PageContainer } from "@/components/layout/page-container";
import Link from "next/link";

export default function NotFound() {
  return (
    <PageContainer>
      <div className="max-w-xl space-y-6 py-8">
        <h1 className="font-editorial-serif text-4xl font-medium text-ink">Page introuvable</h1>
        <p className="text-lg leading-relaxed text-ink/70">
          Ce n’est pas un bug : cette adresse ne mène nulle part sur Tramelle. Le web est vaste ; heureusement, le site
          est petit.
        </p>
        <p className="text-sm text-ink/55">
          <Link href="/" className="font-medium text-accent underline-offset-4 hover:underline">
            Retour à l’accueil
          </Link>
        </p>
      </div>
    </PageContainer>
  );
}
