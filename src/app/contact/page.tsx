import { ContactSiteForm } from "@/components/community/contact-site-form";
import { PageContainer } from "@/components/layout/page-container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Écrire à l’équipe Tramelle.",
};

export default function ContactPage() {
  return (
    <PageContainer className="max-w-2xl">
      <h1 className="font-editorial-serif text-3xl font-bold text-ink">Contact</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink/65">
        Pour une question générale, laissez un message ci-dessous. Il est stocké de façon sécurisée et visible par les
        administrateurs.
      </p>
      <ContactSiteForm />
    </PageContainer>
  );
}
