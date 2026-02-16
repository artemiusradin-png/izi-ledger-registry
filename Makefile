# IZI German Sanctions Analysis - Build targets

# Render all documents (English + Ukrainian HTML)
all:
	quarto render German_Sanction_Mechanism_Analysis.qmd
	quarto render German_Sanctions_3Page_Summary.qmd
	quarto render German_Sanctions_3Page_Summary_UKR.qmd --to html
	quarto render German_Sanction_Mechanism_Analysis_UKR.qmd --to html

# Ukrainian PDFs: HTML first, then Chrome prints to PDF (same rendering as HTML)
pdf-ukr:
	./render_ukr_pdf.sh

.PHONY: all pdf-ukr
