import { AdminArticleEditForm, AdminBilletEditForm } from "@/components/community/admin-editorial-edit-form";
import { PageContainer } from "@/components/layout/page-container";
import { mergeArticleWithOverride, mergeBilletWithOverride } from "@/lib/content/editorial-merge";
import { getArticleBySlug } from "@/lib/content/articles";
import { getBilletBySlug } from "@/lib/content/billets";
import {
  getArticleOverrideServer,
  getBilletOverrideServer,
} from "@/lib/server/editorial-pages";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Modifier — éditorial",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ kind: string; slug: string }> };

export default async function AdminEditorialEditPage({ params }: Props) {
  const { kind, slug } = await params;

  if (kind === "article") {
    const base = getArticleBySlug(slug);
    if (!base) notFound();
    const override = await getArticleOverrideServer(slug);
    const merged = mergeArticleWithOverride(base, override);
    return (
      <PageContainer className="max-w-3xl pb-16">
        <AdminArticleEditForm slug={slug} merged={merged} />
      </PageContainer>
    );
  }

  if (kind === "billet") {
    const base = getBilletBySlug(slug);
    if (!base) notFound();
    const override = await getBilletOverrideServer(slug);
    const merged = mergeBilletWithOverride(base, override);
    return (
      <PageContainer className="max-w-3xl pb-16">
        <AdminBilletEditForm slug={slug} merged={merged} />
      </PageContainer>
    );
  }

  notFound();
}
