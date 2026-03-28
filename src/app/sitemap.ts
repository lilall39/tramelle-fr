import { articles } from "@/lib/content/articles";
import { billets } from "@/lib/content/billets";
import { outils } from "@/lib/content/outils";
import { getSiteUrl } from "@/lib/site";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const staticPaths = ["", "/outils", "/articles", "/billets", "/a-propos"];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));

  const outilEntries: MetadataRoute.Sitemap = outils.map((o) => ({
    url: `${base}/outils/${o.slug}`,
    lastModified: new Date(o.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/articles/${a.slug}`,
    lastModified: new Date(a.updatedAt ?? a.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const billetEntries: MetadataRoute.Sitemap = billets.map((b) => ({
    url: `${base}/billets/${b.slug}`,
    lastModified: new Date(b.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  return [...staticEntries, ...outilEntries, ...articleEntries, ...billetEntries];
}
