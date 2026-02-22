#!/usr/bin/env node
/**
 * Watches the QMD file and re-renders PDF + opens it on every save.
 * Run: npm run watch:pdf
 * Keeps running; each save triggers render and open.
 */
import { watch } from "fs";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const qmd = join(__dirname, "../quarto/German_Sanctions_Criminal_Asset_Pipeline_3Page.qmd");
const pdf = join(__dirname, "../_output/quarto/German_Sanctions_Criminal_Asset_Pipeline_3Page.pdf");

function renderAndOpen() {
  console.log("[%s] Rendering PDF...", new Date().toLocaleTimeString());
  const proc = spawn("quarto", ["render", qmd, "--to", "pdf"], {
    stdio: "inherit",
    cwd: join(__dirname, ".."),
  });
  proc.on("close", (code) => {
    if (code === 0) {
      spawn("open", [pdf], { stdio: "ignore" });
      console.log("PDF updated and opened.");
    } else {
      console.error("Render failed with code", code);
    }
  });
}

console.log("Watching:", qmd);
console.log("Each save will render PDF and open it.\n");
renderAndOpen();

watch(qmd, (eventType, filename) => {
  if (eventType === "change") renderAndOpen();
});
