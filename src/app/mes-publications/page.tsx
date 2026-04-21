import { MesPublicationsClient } from "@/components/community/mes-publications-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mes publications",
  description: "Suivi de vos annonces et contenus soumis à modération.",
};

export default function MesPublicationsPage() {
  return <MesPublicationsClient />;
}
