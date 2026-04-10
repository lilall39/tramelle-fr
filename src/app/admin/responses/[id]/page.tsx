import { AdminResponseDetail } from "@/components/community/admin-response-detail";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modération — réponse",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ id: string }> };

export default async function AdminResponseDetailPage({ params }: Props) {
  const { id } = await params;
  return <AdminResponseDetail id={id} />;
}
