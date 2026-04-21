import { AdminModerationList } from "@/components/community/admin-moderation-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modération",
  robots: { index: false, follow: false },
};

export default function AdminModerationPage() {
  return <AdminModerationList />;
}
