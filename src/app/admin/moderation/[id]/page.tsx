import { AdminModerationDetail } from "@/components/community/admin-moderation-detail";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Modération — détail",
  robots: { index: false, follow: false },
};

export default async function AdminModerationDetailPage({ params }: Props) {
  const { id } = await params;
  return <AdminModerationDetail id={id} />;
}
