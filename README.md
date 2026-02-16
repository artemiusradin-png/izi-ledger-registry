# IZI Ledger Registry (Next.js + Quarto)

This project provides a general ledger-registry website for all analytical works.

## Workflow

1. Author in `.qmd` / `.md`.
2. Render with Quarto into `_output/`.
3. Run ingestion to copy rendered artifacts into `public/rendered/` and build `content/registry.json`.
4. Run Next.js app.

## Commands

```bash
npm install
npm run ingest
npm run dev
```

Full refresh after content updates:

```bash
npm run refresh
```

## Metadata overrides

Use `content/overrides.json` to set custom title, summary, tags, language, kind, and optional slug per rendered document base name.

## Notes

- Source rendered HTML/PDF files are read from `_output/`.
- Registry is generated at `content/registry.json`.
- The site keeps rendered Quarto styling by serving copied HTML directly.
