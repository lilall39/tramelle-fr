import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publications",
  description: "Petites annonces, services, ventes, dons et articles — communauté Tramelle.",
};

export default function PublicationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
