import registry from "@/content/registry.json";

export type Work = {
  slug: string;
  fileName: string;
  title: string;
  summary: string;
  kind: string;
  language: string;
  updatedAt: string;
  htmlPath: string;
  pdfPath: string | null;
  tags: string[];
};

type Registry = {
  generatedAt: string;
  total: number;
  works: Work[];
};

const data = registry as Registry;

export function getAllWorks(): Work[] {
  return data.works;
}

export function getWorkBySlug(slug: string): Work | undefined {
  return data.works.find((work) => work.slug === slug);
}

export function getRegistryMeta() {
  return { generatedAt: data.generatedAt, total: data.total };
}
