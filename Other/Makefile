# IZI German Sanctions Analysis - Build targets

# Render all documents (English + Ukrainian HTML)
all:
	quarto render quarto/German_Sanction_Mechanism_Analysis.qmd
	quarto render quarto/German_Sanctions_3Page_Summary.qmd
	quarto render quarto/German_Sanctions_3Page_Summary_UKR.qmd --to html
	quarto render quarto/German_Sanction_Mechanism_Analysis_UKR.qmd --to html

# Ukrainian PDFs: HTML first, then Chrome prints to PDF (same rendering as HTML)
pdf-ukr:
	./render_ukr_pdf.sh

# Ukrainian PDFs + copy to public/rendered and docs/
pdf-ukr-full: pdf-ukr
	npm run ingest
	$(MAKE) site
site:
	NEXT_PUBLIC_BASE_PATH=/izi-ledger-registry npm run build
	rsync -a --delete out/ docs/
	touch docs/.nojekyll

# Build and push website updates
publish-site: site
	git add docs
	git commit -m "Update published site" || true
	git push

.PHONY: all pdf-ukr pdf-ukr-full site publish-site
