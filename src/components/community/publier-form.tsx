"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Submission, SubmissionCategory } from "@/types/community";
import { useAuth } from "@/contexts/auth-context";
import { createSubmission } from "@/lib/community/submissions";
import { uploadSubmissionImage } from "@/lib/community/storage";
import { SUBMISSION_IMAGE_ACCEPT, validateSubmissionImage } from "@/lib/community/image-validation";
import { CATEGORY_LABELS } from "@/lib/community/labels";
import { PageContainer } from "@/components/layout/page-container";
import { firebaseErrorHint } from "@/lib/firebase/error-hint";

const CATEGORIES: SubmissionCategory[] = ["annonce", "service", "vente", "don", "article"];

function useImagePreviewUrl(file: File | null): string | null {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);
  return url;
}

export function PublierForm() {
  const { user } = useAuth();
  const router = useRouter();
  const submitLock = useRef(false);
  const [category, setCategory] = useState<SubmissionCategory>("annonce");
  const [privateName, setPrivateName] = useState("");
  const [privateEmail, setPrivateEmail] = useState("");
  const [privatePhone, setPrivatePhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [deliveryMode, setDeliveryMode] = useState("");
  const [availability, setAvailability] = useState("");
  const [pickupInfo, setPickupInfo] = useState("");
  const [rate, setRate] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [serviceMode, setServiceMode] = useState("");
  const [content, setContent] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const mainPreviewForCategory = category === "article" ? null : mainFile;
  const coverPreviewForCategory = category === "article" ? coverFile : null;
  const mainPreviewUrl = useImagePreviewUrl(mainPreviewForCategory);
  const coverPreviewUrl = useImagePreviewUrl(coverPreviewForCategory);
  const uploadDiag = useMemo(() => {
    if (typeof window === "undefined") return false;
    try {
      return new URLSearchParams(window.location.search).has("uploadDiag");
    } catch {
      return false;
    }
  }, []);

  if (!user) return null;

  const dbg = uploadDiag
    ? (label: string, data?: unknown) => {
        if (data === undefined) {
          console.log(label);
        } else {
          console.log(label, data);
        }
      }
    : null;

  function pickMainImage(file: File | null) {
    if (!file) {
      setMainFile(null);
      return;
    }
    const v = validateSubmissionImage(file);
    if (!v.ok) {
      setError(v.message);
      setSuccess(null);
      return;
    }
    setError(null);
    setSuccess(null);
    setMainFile(file);
  }

  function pickCoverImage(file: File | null) {
    if (!file) {
      setCoverFile(null);
      return;
    }
    const v = validateSubmissionImage(file);
    if (!v.ok) {
      setError(v.message);
      setSuccess(null);
      return;
    }
    setError(null);
    setSuccess(null);
    setCoverFile(file);
  }

  /**
   * 1. Validation des images au moment de l’envoi
   * 2. Upload Storage (types MIME normalisés)
   * 3. Création Firestore uniquement après succès des uploads
   */
  async function runSubmitPipeline(uid: string): Promise<void> {
    let imageUrl: string | null = null;
    let coverImage: string | null = null;

    if (category === "article") {
      if (coverFile) {
        dbg?.("[UPLOAD] file received", { name: coverFile.name, size: coverFile.size, type: coverFile.type });
        const v = validateSubmissionImage(coverFile);
        dbg?.("[UPLOAD] file validated", v);
        if (!v.ok) throw new Error(v.message);
        setProgress("Envoi de l’image… 0%");
        const url = await uploadSubmissionImage(uid, coverFile, "submissions", v.contentType, (p) => {
          setProgress(`Envoi de l’image… ${p.percent}%`);
        }, 0, (label, data) => dbg?.(label, data));
        coverImage = url;
        imageUrl = url;
      }
    } else if (mainFile) {
      dbg?.("[UPLOAD] file received", { name: mainFile.name, size: mainFile.size, type: mainFile.type });
      const v = validateSubmissionImage(mainFile);
      dbg?.("[UPLOAD] file validated", v);
      if (!v.ok) throw new Error(v.message);
      setProgress("Envoi de l’image… 0%");
      imageUrl = await uploadSubmissionImage(uid, mainFile, "submissions", v.contentType, (p) => {
        setProgress(`Envoi de l’image… ${p.percent}%`);
      }, 0, (label, data) => dbg?.(label, data));
    }

    const base: Omit<Submission, "createdAt" | "updatedAt"> = {
      userId: uid,
      category,
      status: "pending",
      privateName: privateName.trim(),
      privateEmail: privateEmail.trim(),
      privatePhone: privatePhone.trim(),
      displayName: displayName.trim(),
      title: title.trim(),
      description: description.trim(),
      city: city.trim(),
      imageUrl,
    };

    let payload: Omit<Submission, "createdAt" | "updatedAt"> = base;

    if (category === "vente") {
      const p = price.trim() ? Number.parseFloat(price.replace(",", ".")) : NaN;
      payload = {
        ...base,
        price: Number.isFinite(p) ? p : 0,
        condition: condition.trim(),
        deliveryMode: deliveryMode.trim(),
      };
    } else if (category === "don") {
      payload = {
        ...base,
        availability: availability.trim(),
        pickupInfo: pickupInfo.trim(),
      };
    } else if (category === "service") {
      payload = {
        ...base,
        rate: rate.trim(),
        serviceArea: serviceArea.trim(),
        serviceMode: serviceMode.trim(),
      };
    } else if (category === "article") {
      payload = {
        ...base,
        content: content.trim(),
        subtitle: subtitle.trim(),
        coverImage,
      };
    }

    setProgress("Enregistrement du billet…");
    dbg?.("[UPLOAD] firestore write start");
    await createSubmission(payload);
    dbg?.("[UPLOAD] firestore write ok");
    setProgress("Terminé.");
    router.replace("/mes-publications");
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (submitLock.current || pending) return;
    submitLock.current = true;
    setError(null);
    setSuccess(null);
    setProgress("Vérification…");
    setPending(true);
    try {
      dbg?.("[UPLOAD] submit started", { uid: user.uid, category });
      await runSubmitPipeline(user.uid);
      setSuccess("Votre billet a bien été envoyé (en attente de modération).");
    } catch (err) {
      dbg?.("[UPLOAD] submit error", err);
      setError(firebaseErrorHint(err));
      setProgress(null);
    } finally {
      setPending(false);
      submitLock.current = false;
    }
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-ink/[0.12] bg-white px-3 py-2 text-sm dark:bg-paper-elevated";

  const previewBox = (src: string | null, alt: string) =>
    src ? (
      <div className="mt-3 overflow-hidden rounded-lg border border-ink/[0.12] bg-paper-muted/40">
        {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local blob: pas besoin de Image distant */}
        <img src={src} alt={alt} className="max-h-64 w-full object-contain" />
      </div>
    ) : null;

  return (
    <PageContainer className="max-w-2xl">
      <h1 className="font-editorial-serif text-3xl font-bold text-ink">Publier</h1>
      <p className="mt-2 text-sm text-ink/60">
        Votre texte sera examiné avant publication (statut « en attente »).
      </p>

      <form onSubmit={onSubmit} className="mt-10 space-y-8">
        <fieldset className="space-y-3">
          <legend className="text-sm font-bold uppercase tracking-[0.15em] text-terracotta">Catégorie</legend>
          <select
            value={category}
            onChange={(ev) => setCategory(ev.target.value as SubmissionCategory)}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-ink/[0.08] bg-paper-muted/30 p-4 dark:border-ink/[0.12]">
          <legend className="px-1 text-sm font-bold text-ink/80">Coordonnées privées (modération)</legend>
          <p className="text-xs text-ink/50">Ne sont jamais affichées sur les pages publiques.</p>
          <label className="block text-sm font-bold text-ink">
            Nom complet
            <input required value={privateName} onChange={(e) => setPrivateName(e.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm font-bold text-ink">
            E-mail
            <input type="email" required value={privateEmail} onChange={(e) => setPrivateEmail(e.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm font-bold text-ink">
            Téléphone
            <input type="tel" value={privatePhone} onChange={(e) => setPrivatePhone(e.target.value)} className={inputClass} />
          </label>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-bold uppercase tracking-[0.15em] text-terracotta">Contenu public</legend>
          <label className="block text-sm font-bold text-ink">
            Nom affiché publiquement
            <input required value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm font-bold text-ink">
            Titre
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm font-bold text-ink">
            Description
            <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm font-bold text-ink">
            Ville / lieu
            <input required value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
          </label>
        </fieldset>

        {category === "vente" ? (
          <fieldset className="space-y-3">
            <legend className="text-sm font-bold uppercase tracking-[0.15em] text-terracotta">Vente</legend>
            <label className="block text-sm font-bold text-ink">
              Prix (€)
              <input value={price} onChange={(e) => setPrice(e.target.value)} className={inputClass} inputMode="decimal" />
            </label>
            <label className="block text-sm font-bold text-ink">
              État
              <input value={condition} onChange={(e) => setCondition(e.target.value)} className={inputClass} />
            </label>
            <label className="block text-sm font-bold text-ink">
              Remise / livraison
              <input value={deliveryMode} onChange={(e) => setDeliveryMode(e.target.value)} className={inputClass} />
            </label>
            <label className="block text-sm font-bold text-ink">
              Photo
              <input
                type="file"
                accept={SUBMISSION_IMAGE_ACCEPT}
                onChange={(e) => {
                  pickMainImage(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
                className="mt-1 text-sm"
              />
            </label>
            {previewBox(mainPreviewUrl, "Aperçu de la photo")}
          </fieldset>
        ) : null}

        {category === "don" ? (
          <fieldset className="space-y-3">
            <legend className="text-sm font-bold uppercase tracking-[0.15em] text-terracotta">Don</legend>
            <label className="block text-sm font-bold text-ink">
              Disponibilité
              <input value={availability} onChange={(e) => setAvailability(e.target.value)} className={inputClass} />
            </label>
            <label className="block text-sm font-bold text-ink">
              Infos retrait
              <input value={pickupInfo} onChange={(e) => setPickupInfo(e.target.value)} className={inputClass} />
            </label>
            <label className="block text-sm font-bold text-ink">
              Photo
              <input
                type="file"
                accept={SUBMISSION_IMAGE_ACCEPT}
                onChange={(e) => {
                  pickMainImage(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
                className="mt-1 text-sm"
              />
            </label>
            {previewBox(mainPreviewUrl, "Aperçu de la photo")}
          </fieldset>
        ) : null}

        {category === "service" ? (
          <fieldset className="space-y-3">
            <legend className="text-sm font-bold uppercase tracking-[0.15em] text-terracotta">Service</legend>
            <label className="block text-sm font-bold text-ink">
              Tarif
              <input value={rate} onChange={(e) => setRate(e.target.value)} className={inputClass} />
            </label>
            <label className="block text-sm font-bold text-ink">
              Zone
              <input value={serviceArea} onChange={(e) => setServiceArea(e.target.value)} className={inputClass} />
            </label>
            <label className="block text-sm font-bold text-ink">
              Modalités
              <input value={serviceMode} onChange={(e) => setServiceMode(e.target.value)} className={inputClass} />
            </label>
            <label className="block text-sm font-bold text-ink">
              Photo
              <input
                type="file"
                accept={SUBMISSION_IMAGE_ACCEPT}
                onChange={(e) => {
                  pickMainImage(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
                className="mt-1 text-sm"
              />
            </label>
            {previewBox(mainPreviewUrl, "Aperçu de la photo")}
          </fieldset>
        ) : null}

        {category === "article" ? (
          <fieldset className="space-y-3">
            <legend className="text-sm font-bold uppercase tracking-[0.15em] text-terracotta">Article</legend>
            <label className="block text-sm font-bold text-ink">
              Sous-titre
              <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputClass} />
            </label>
            <label className="block text-sm font-bold text-ink">
              Corps de texte
              <textarea required rows={10} value={content} onChange={(e) => setContent(e.target.value)} className={inputClass} />
            </label>
            <label className="block text-sm font-bold text-ink">
              Image de couverture
              <input
                type="file"
                accept={SUBMISSION_IMAGE_ACCEPT}
                onChange={(e) => {
                  pickCoverImage(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
                className="mt-1 text-sm"
              />
            </label>
            {previewBox(coverPreviewUrl, "Aperçu de la couverture")}
          </fieldset>
        ) : null}

        {category === "annonce" ? (
          <fieldset className="space-y-3">
            <legend className="text-sm font-bold uppercase tracking-[0.15em] text-terracotta">Visuel</legend>
            <label className="block text-sm font-bold text-ink">
              Image (optionnel)
              <input
                type="file"
                accept={SUBMISSION_IMAGE_ACCEPT}
                onChange={(e) => {
                  pickMainImage(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
                className="mt-1 text-sm"
              />
            </label>
            {previewBox(mainPreviewUrl, "Aperçu de l’image")}
          </fieldset>
        ) : null}

        {progress ? <p className="text-sm font-bold text-ink/70">{progress}</p> : null}
        {error ? <p className="text-sm font-bold text-red-700 dark:text-red-400">{error}</p> : null}
        {success ? <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{success}</p> : null}

        <button
          type="submit"
          disabled={pending}
          aria-disabled={pending}
          className="rounded-md bg-ink px-6 py-2.5 text-sm font-bold text-paper transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Envoi…" : "Soumettre pour modération"}
        </button>
      </form>
    </PageContainer>
  );
}
