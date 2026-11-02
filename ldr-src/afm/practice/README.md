# AFM notes + practice packs

`public/ldr/afm/AFM_ChNN_<name>_Notes_and_Practice.pdf` = the chapter's LDR notes (`AFM_LDR_ChNN_*.pdf`, unchanged) followed by a practice section built by `buildafm.py`:

1. Past papers: the chapter's questions from Sep 2025, Jan 2026 and May 2026 (labels and marks ICAI's; concept lines app-written), from `data/lastday/weightage.json`.
2. Theory: each SM Test Your Knowledge theory question; ICAI's answer is "Please refer paragraph X", so SM paragraph X is reproduced as a page crop (or ICAI's written answer where it gives one).
3. Every SM illustration with ICAI's solution, grouped by SM section (page crops).
4. Every SM Test Your Knowledge practical question with ICAI's solution (page crops).

Everything in 2–4 is cropped from ICAI's AFM SM chapter PDFs (`scripts/lastday/sources/sm_links.json`, key `100`); nothing is retyped. `runafm.sh N` builds one chapter (paths point at the session scratchpad: SM PDFs in `afm/cNN.pdf`, `crop.py` from `ldr-src/fr/practice/`, `paginate.js` with an AFM footer); run the HTML from `ldr-src/fr/` so `style.css` and fonts resolve.
