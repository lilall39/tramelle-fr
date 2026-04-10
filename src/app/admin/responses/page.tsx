import { AdminResponseList } from "@/components/community/admin-response-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modération des réponses",
  robots: { index: false, follow: false },
};

export default function AdminResponsesPage() {
  return <AdminResponseList />;
}
