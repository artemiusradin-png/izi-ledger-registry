import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "_output");
const publicRenderedDir = path.join(root, "public", "rendered");
const contentDir = path.join(root, "content");
const overridesPath = path.join(contentDir, "overrides.json");
const registryPath = path.join(contentDir, "registry.json");

function safeReadJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function detectLanguage(baseName) {
  return baseName.endsWith("_UKR") ? "Ukrainian" : "English";
}

function detectKind(baseName) {
  if (baseName.includes("3Page") || baseName.includes("Summary")) {
    return "Summary";
  }
  return "Analysis";
}

function detectSummary(baseName) {
  if (baseName.includes("3Page") || baseName.includes("Summary")) {
    return "Short policy summary";
  }
  return "Full analytical paper";
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function cleanRenderedDir(dir) {
  ensureDir(dir);
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
}

function copyRecursive(source, dest) {
  const stat = fs.statSync(source);

  if (stat.isDirectory()) {
    ensureDir(dest);
    for (const child of fs.readdirSync(source)) {
      copyRecursive(path.join(source, child), path.join(dest, child));
    }
    return;
  }

  ensureDir(path.dirname(dest));
  fs.copyFileSync(source, dest);
}

function extractHtmlTitle(htmlText, fallback) {
  const match = htmlText.match(/<title>([^<]+)<\/title>/i);
  if (!match) {
    return fallback;
  }
  return match[1].replace(/\s+/g, " ").trim();
}

function sortWorks(works) {
  return works.sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

function main() {
  if (!fs.existsSync(outputDir)) {
    throw new Error("_output directory not found. Run `quarto render` first.");
  }

  const overrides = safeReadJson(overridesPath, {});
  cleanRenderedDir(publicRenderedDir);

  const htmlFiles = fs
    .readdirSync(outputDir)
    .filter((file) => file.endsWith(".html") && !file.startsWith("."));

  const works = [];

  for (const htmlFile of htmlFiles) {
    const baseName = path.basename(htmlFile, ".html");
    const sourceHtmlPath = path.join(outputDir, htmlFile);
    const sourcePdfPath = path.join(outputDir, `${baseName}.pdf`);
    const sourceAssetsDir = path.join(outputDir, `${baseName}_files`);

    const targetHtmlPath = path.join(publicRenderedDir, htmlFile);
    copyRecursive(sourceHtmlPath, targetHtmlPath);

    if (fs.existsSync(sourceAssetsDir)) {
      copyRecursive(sourceAssetsDir, path.join(publicRenderedDir, `${baseName}_files`));
    }

    if (fs.existsSync(path.join(outputDir, "styles"))) {
      copyRecursive(path.join(outputDir, "styles"), path.join(publicRenderedDir, "styles"));
    }

    if (fs.existsSync(sourcePdfPath)) {
      copyRecursive(sourcePdfPath, path.join(publicRenderedDir, `${baseName}.pdf`));
    }

    const htmlText = fs.readFileSync(sourceHtmlPath, "utf8");
    const defaultTitle = baseName.replace(/_/g, " ");
    const titleFromHtml = extractHtmlTitle(htmlText, defaultTitle);
    const stat = fs.statSync(sourceHtmlPath);

    const override = overrides[baseName] ?? {};

    works.push({
      slug: override.slug ?? slugify(baseName),
      fileName: baseName,
      title: override.title ?? titleFromHtml,
      summary: override.summary ?? detectSummary(baseName),
      kind: override.kind ?? detectKind(baseName),
      language: override.language ?? detectLanguage(baseName),
      updatedAt: stat.mtime.toISOString(),
      htmlPath: `/rendered/${htmlFile}`,
      pdfPath: fs.existsSync(sourcePdfPath) ? `/rendered/${baseName}.pdf` : null,
      tags: Array.isArray(override.tags) ? override.tags : []
    });
  }

  const sortedWorks = sortWorks(works);

  const registry = {
    generatedAt: new Date().toISOString(),
    total: sortedWorks.length,
    works: sortedWorks
  };

  fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");

  console.log(`Ingested ${sortedWorks.length} rendered works.`);
}

main();
