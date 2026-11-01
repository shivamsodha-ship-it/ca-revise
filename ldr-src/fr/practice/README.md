# Practice sheets (Ind AS 103, Ind AS 110)

`build.py` builds one practice sheet per standard; `crop.py` cuts ICAI's printed pages into question / solution images.

- SM illustrations, SM examples (Ch 12 Ex 1–7), SM Test Your Knowledge and ICAI Practice Questions are page crops from ICAI's PDFs (SM Ch 12, Ch 13 Units 3, 4, 8; `83352bos67375-pq.pdf`), so tables appear exactly as printed.
- RTP, MTP and past-paper items come from `data/fr/ch12-casebook.json` / `ch13-casebook.json` (ICAI text and suggested answers).
- Where ICAI's answer is not in the repo (May 2026 Q1, MCQ 8 for Ind AS 103; MCQ 3 for Ind AS 110), the solution is app-written and labelled so; its figures match ICAI's published key (`research/lastday/fr-last3-analysis.md`). `may26q1.html` is that solution.
- Ind AS 110 sheet leaves out Ind AS 28 / 111 / 27 / 112 items and SM Ch 13 TYK Q3 (associate only).

Run (PDF paths are in the script's working folder): `python3 build.py 103 <out.html>` with the HTML written into `ldr-src/fr/` (it uses `style.css` and `../fonts`), then `node paginate.js <out.html> <paged.html> <out.pdf> "<label>"`. The combined PDFs in `public/ldr/fr/FR_IndAS10{3,10}_Notes_and_Practice.pdf` are the notes PDF followed by the practice PDF.
