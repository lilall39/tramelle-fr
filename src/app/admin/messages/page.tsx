import { AdminMessagesList } from "@/components/community/admin-messages-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages (admin)",
  robots: { index: false, follow: false },
};

export default function AdminMessagesPage() {
  return <AdminMessagesList />;
}
