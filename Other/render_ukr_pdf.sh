#!/bin/bash
# Render Ukrainian documents: HTML first (works), then Chrome prints to PDF
set -e
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

echo "Rendering Ukrainian documents to HTML..."
quarto render quarto/German_Sanctions_3Page_Summary_UKR.qmd --to html
quarto render quarto/German_Sanction_Mechanism_Analysis_UKR.qmd --to html

echo "Converting HTML to PDF via Chrome..."
OUTPUT_DIR="$(pwd)/_output"
HTML_DIR="quarto"
[ -f "$OUTPUT_DIR/German_Sanctions_3Page_Summary_UKR.html" ] && HTML_DIR=""
BASE="${OUTPUT_DIR}/${HTML_DIR}"
"$CHROME" --headless --disable-gpu --no-pdf-header-footer --virtual-time-budget=5000 --print-to-pdf="$BASE/German_Sanctions_3Page_Summary_UKR.pdf" "file://$BASE/German_Sanctions_3Page_Summary_UKR.html" 2>/dev/null
"$CHROME" --headless --disable-gpu --no-pdf-header-footer --virtual-time-budget=5000 --print-to-pdf="$BASE/German_Sanction_Mechanism_Analysis_UKR.pdf" "file://$BASE/German_Sanction_Mechanism_Analysis_UKR.html" 2>/dev/null

echo "Done. PDFs in _output/"
