# Must-do packs (scripts/lastday)

Builds `data/lastday/<subject>.json`, which the `/[subject]/must-do` pages render. Everything shown to the student is
ICAI text (study material, question papers, suggested answers, RTPs, MTPs); the scripts only choose and label it.

Inputs (git-ignored, under `work/`):
- `work/sm/<subject>/*.txt` — ICAI study-material chapters/units, `pdftotext -layout`. Links are in `sources/sm_links.json`
  and `sources/fr_units.json` (from boslive.icai.org; PDFs are on resource.cdn.icai.org).
- `work/smq/` — ICAI "Practice Questions" files (FR modules), assigned to units by ICAI's own unit headers (`PQ_UNITS` in packs.py).
- `work/papers/<subject>_<attempt>_<qp|rtp|mtps1|mtps2>_<n>.txt` — ICAI papers for May 2024 to Nov 2026. `qp_2` = suggested
  answers (with the paper), `mtp*_1` = questions, `mtp*_2` = answers. MTPs are Drive copies from vsijaipur.com checked against
  ICAI's header; the May 2026 question papers are image-only and were read with `ocr.py` (noisy).

Run, per subject (`fr`, `afm`, `aaa`): `python3 scripts/lastday/sweep.py <s>` → `packs.py <s>` → `export.py <s>`; then once: `plan.py`, `weightage.py`, `updates.py`.
`rank.py <s>` prints the chapter ranking. `drop.json` lists questions removed after manual review.

Limits to remember:
- A question is filed under a chapter by matching its wording (BM25) to the SM text, plus the Ind AS number it cites (FR).
  It is a proxy, not ICAI's own mapping; packs show each question's closest SM section so the student can see why.
- "Comprehensive" = the question that touches the most SM sections of the chapter; it is not a guarantee that it covers all of them.
- FR order comes from `research/fr-priority.md` (ICAI papers May 2022 to Nov 2026); AFM and AAA order comes from this sweep.
