#!/usr/bin/env node
/**
 * Converts Quarto HTML to PDF using Puppeteer (headless Chrome).
 * Use for documents with Cyrillic/Unicode that fail with LaTeX PDF.
 *
 * Usage: node scripts/html-to-pdf.mjs <html-path> [output-pdf-path]
 * Example: node scripts/html-to-pdf.mjs _output/quarto/German_Sanctions_Criminal_Asset_Pipeline_3Page_UKR.html
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

async function main() {
  const htmlArg = process.argv[2];
  const pdfArg = process.argv[3];

  if (!htmlArg) {
    console.error("Usage: node scripts/html-to-pdf.mjs <html-path> [output-pdf-path]");
    process.exit(1);
  }

  const htmlPath = path.isAbsolute(htmlArg) ? htmlArg : path.join(root, htmlArg);
  const htmlDir = path.dirname(htmlPath);
  const baseName = path.basename(htmlPath, ".html");
  const pdfPath = pdfArg
    ? (path.isAbsolute(pdfArg) ? pdfArg : path.join(root, pdfArg))
    : path.join(htmlDir, `${baseName}.pdf`);

  if (!fs.existsSync(htmlPath)) {
    console.error(`HTML file not found: ${htmlPath}`);
    process.exit(1);
  }

  let puppeteer;
  try {
    puppeteer = await import("puppeteer");
  } catch (e) {
    console.error("Puppeteer not installed. Run: npm install puppeteer --save-dev");
    process.exit(1);
  }

  const fileUrl = `file://${htmlPath}`;

  console.log(`Converting ${htmlPath} -> ${pdfPath}`);

  const browser = await puppeteer.default.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.emulateMediaType("print");

    await page.goto(fileUrl, {
      waitUntil: ["load", "networkidle0"],
      timeout: 30000,
    });

    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" },
      preferCSSPageSize: false,
    });

    console.log(`PDF written: ${pdfPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
