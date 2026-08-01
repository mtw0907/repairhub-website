import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const TYPE_PATH: Record<string, string> = {
  REGION: "regions",
  BRAND: "brands",
  SYMPTOM: "symptoms",
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [companies, seoPages] = await Promise.all([
    prisma.company.findMany({
      where: { status: "APPROVED" },
      select: { id: true, updatedAt: true },
    }),
    prisma.seoPage.findMany({ select: { type: true, keyword: true, updatedAt: true } }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/companies`, changeFrequency: "daily", priority: 0.9 },
  ];

  const companyEntries: MetadataRoute.Sitemap = companies.map((c) => ({
    url: `${BASE_URL}/companies/${c.id}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const seoEntries: MetadataRoute.Sitemap = seoPages.map((p) => ({
    url: `${BASE_URL}/${TYPE_PATH[p.type]}/${encodeURIComponent(p.keyword)}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...companyEntries, ...seoEntries];
}
