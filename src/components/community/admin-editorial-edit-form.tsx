"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ArticleFrontMatter, BilletFrontMatter } from "@/lib/content/types";
import { blocksToPlainForEdit } from "@/lib/content/editorial-merge";
import { saveArticleOverride, saveBilletOverride } from "@/lib/community/editorial-pages";
import { firebaseErrorHint } from "@/lib/firebase/error-hint";

const inputClass =
  "mt-1 w-full rounded-md border border-ink/[0.12] bg-white px-3 py-2 text-sm dark:bg-paper-elevated";

export function AdminArticleEditForm({ slug, merged }: { slug: string; merged: ArticleFrontMatter }) {
  const router = useRouter();
  const [title, setTitle] = useState(merged.title);
  const [deck, setDeck] = useState(merged.deck);
  const [lede, setLede] = useState(merged.lede);
  const [readingMinutes, setReadingMinutes] = useState(String(merged.readingMinutes));
  const [tags, setTags] = useState(merged.tags.join(", "));
  const [plainBody, setPlainBody] = useState(blocksToPlainForEdit(merged.blocks));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    const rm = Number.parseInt(readingMinutes.replace(/\s/g, ""), 10);
    const tagsArr = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      await saveArticleOverride(slug, {
        title: title.trim(),
        deck: deck.trim(),
        lede: lede.trim(),
        readingMinutes: Number.isFinite(rm) && rm >= 1 ? rm : merged.readingMinutes,
        tags: tagsArr.length ? tagsArr : merged.tags,
        plainBody,
      });
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(firebaseErrorHint(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-terracotta">Article</p>
        <h1 className="mt-2 font-editorial-serif text-3xl font-bold text-ink">Modifier le texte</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          Ce contenu est enregistré dans la base du site et remplace la version du fichier source pour les visiteurs,
          lorsque la page est « en ligne ». Les paragraphes sont séparés par une ligne vide ; titres et listes du fichier
          d’origine sont convertis en texte simple dans la zone ci-dessous — vous pouvez les réorganiser à la main.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold">
          <Link href={`/admin/editorial/article/${slug}`} className="text-terracotta underline underline-offset-2">
            ← Aperçu admin
          </Link>
          <Link href="/admin/editorial" className="text-ink/65 underline underline-offset-2 hover:text-terracotta">
            Liste articles & billets
          </Link>
        </div>
      </div>

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
        <label className="block text-sm font-bold text-ink">
          Titre
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm font-bold text-ink">
          Chapô (sous le titre)
          <textarea required rows={3} value={deck} onChange={(e) => setDeck(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm font-bold text-ink">
          Entrée (accroche avant le corps)
          <textarea required rows={4} value={lede} onChange={(e) => setLede(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm font-bold text-ink">
          Durée de lecture (minutes)
          <input value={readingMinutes} onChange={(e) => setReadingMinutes(e.target.value)} className={inputClass} inputMode="numeric" />
        </label>
        <label className="block text-sm font-bold text-ink">
          Étiquettes (séparées par des virgules)
          <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm font-bold text-ink">
          Corps du texte
          <textarea
            required
            rows={18}
            value={plainBody}
            onChange={(e) => setPlainBody(e.target.value)}
            className={inputClass}
          />
        </label>

        {error ? (
          <p className="text-sm font-bold text-red-700 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Enregistré. Les visiteurs voient cette version si la page est publique.</p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-ink px-6 py-2.5 text-sm font-bold text-paper transition hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}

export function AdminBilletEditForm({ slug, merged }: { slug: string; merged: BilletFrontMatter }) {
  const router = useRouter();
  const [title, setTitle] = useState(merged.title);
  const [mood, setMood] = useState(merged.mood ?? "");
  const [plainBody, setPlainBody] = useState(blocksToPlainForEdit(merged.blocks));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await saveBilletOverride(slug, {
        title: title.trim(),
        mood: mood.trim() || undefined,
        plainBody,
      });
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(firebaseErrorHint(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-terracotta">Billet</p>
        <h1 className="mt-2 font-editorial-serif text-3xl font-bold text-ink">Modifier le texte</h1>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          Enregistré dans la base du site pour les visiteurs lorsque la page est en ligne. Paragraphes séparés par une
          ligne vide.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold">
          <Link href={`/admin/editorial/billet/${slug}`} className="text-terracotta underline underline-offset-2">
            ← Aperçu admin
          </Link>
          <Link href="/admin/editorial" className="text-ink/65 underline underline-offset-2 hover:text-terracotta">
            Liste articles & billets
          </Link>
        </div>
      </div>

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
        <label className="block text-sm font-bold text-ink">
          Titre
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm font-bold text-ink">
          Ambiance / ton (optionnel)
          <input value={mood} onChange={(e) => setMood(e.target.value)} className={inputClass} placeholder="Ex. Note du soir"
          />
        </label>
        <label className="block text-sm font-bold text-ink">
          Corps du texte
          <textarea
            required
            rows={18}
            value={plainBody}
            onChange={(e) => setPlainBody(e.target.value)}
            className={inputClass}
          />
        </label>

        {error ? (
          <p className="text-sm font-bold text-red-700 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Enregistré.</p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-ink px-6 py-2.5 text-sm font-bold text-paper transition hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
