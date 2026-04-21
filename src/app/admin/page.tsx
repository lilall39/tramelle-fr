import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default function AdminHomePage() {
  return (
    <PageContainer>
      <h1 className="font-editorial-serif text-3xl font-bold text-ink">Administration</h1>
      <ul className="mt-8 space-y-3 text-sm font-bold">
        <li>
          <Link href="/admin/moderation" className="text-terracotta underline">
            Modération des publications
          </Link>
        </li>
        <li>
          <Link href="/admin/editorial" className="text-terracotta underline">
            Articles & billets
          </Link>
        </li>
        <li>
          <Link href="/admin/messages" className="text-terracotta underline">
            Messages de contact
          </Link>
        </li>
        <li>
          <Link href="/admin/responses" className="text-terracotta underline">
            Modération des réponses
          </Link>
        </li>
      </ul>
    </PageContainer>
  );
}
