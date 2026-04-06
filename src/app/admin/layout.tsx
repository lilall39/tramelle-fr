import { AdminGuard } from "@/components/community/admin-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
