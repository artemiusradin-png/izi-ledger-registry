import fs from "node:fs";
import path from "node:path";

const [, , targetDir, rawBasePath] = process.argv;

if (!targetDir || !rawBasePath) {
  console.error("Usage: node scripts/fix-export-base-path.mjs <targetDir> <basePath>");
  process.exit(1);
}

const basePath = rawBasePath.endsWith("/") ? rawBasePath.slice(0, -1) : rawBasePath;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!fullPath.endsWith(".html") && !fullPath.endsWith(".txt")) {
      continue;
    }

    let content = fs.readFileSync(fullPath, "utf8");

    const replacements = [
      ['href="/_next/', `href="${basePath}/_next/`],
      ['src="/_next/', `src="${basePath}/_next/`],
      ['"/_next/', `"${basePath}/_next/`],
      ["('/_next/", `('${basePath}/_next/`],
      ['href="/work/', `href="${basePath}/work/`],
      ['src="/work/', `src="${basePath}/work/`],
      ['"/work/', `"${basePath}/work/`],
      ['href="/rendered/', `href="${basePath}/rendered/`],
      ['src="/rendered/', `src="${basePath}/rendered/`],
      ['"/rendered/', `"${basePath}/rendered/`],
      ['href="/"', `href="${basePath}/"`],
      ['"href":"/"', `"href":"${basePath}/"`],
      ['"p":""', `"p":"${basePath}"`]
    ];

    for (const [from, to] of replacements) {
      content = content.split(from).join(to);
    }

    fs.writeFileSync(fullPath, content);
  }
}

walk(path.resolve(targetDir));

