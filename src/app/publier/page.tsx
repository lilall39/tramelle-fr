import { RequireAuth } from "@/components/community/require-auth";
import { PublierForm } from "@/components/community/publier-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publier",
  description: "Soumettre une annonce ou un contenu pour modération.",
};

export default function PublierPage() {
  return (
    <RequireAuth>
      <PublierForm />
    </RequireAuth>
  );
}
