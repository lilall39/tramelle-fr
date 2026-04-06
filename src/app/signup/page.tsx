import { SignupForm } from "@/components/community/signup-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription",
  description: "Créer un compte gratuit pour publier sur la communauté Tramelle.",
};

export default function SignupPage() {
  return <SignupForm />;
}
