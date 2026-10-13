# AAA Chapter 14 — Special Features of Audit of Banks & Non-Banking Financial Companies

Built from `inbox/Bank audit unit 1.pdf` (Unit 1: Special Features of Audit of Banks, 82 pages) and
`inbox/Bank audit unit 2.pdf` (Unit 2: Special Features of Audit of Non-Banking Financial Companies,
49 pages). Target attempt: **Nov 2026** (consistent with aaa-ch15/aaa-ch19). Neither unit's study
material has a tagged "Illustration"; both have inline "Test Your Understanding" fact patterns plus
a "Test Your Knowledge" block of theoretical questions at the end (no MCQs in either unit's SM — all
chapter MCQs come from RTP/PYQ or are app-written).

## Sources swept (full list and URLs: `work/aaa-ch14/sources.md`)

ICAI has moved to a **tri-annual exam cycle (Jan / May / Sept)** since 2025 — two files from the
vsijaipur index were mislabelled with the old May/Nov convention and are cited here under their
**actual printed attempt**:

- **RTP:** May 2026 (has the only Chapter 14 academic update), September 2025 (vsijaipur listed this
  as "Nov 2025"), May 2025.
- **PYQ suggested answers (ICAI):** January 2026, September 2025, May 2025, November 2024, May 2024,
  May 2023, November 2022 (swept, no Ch.14 content), May 2022 (swept, no usable Ch.14 content —
  one hit belonged to the CARO/borrower's-auditor chapter, not this one), December 2021 (vsijaipur
  listed this as "Nov 2021").

**Could not fetch / not used:**
- MTP November 2026 (Series I & II, conducted 15 & 28 Sept 2026): not yet indexed on any mirror
  checked as of 2026-10-11; ICAI's own boslive portal 403s from this environment.
- MTP May 2026 / September 2025: Google Drive links located but not pulled into this build pass
  (time-boxed; the RTP+PYQ sweep already gave 8 genuine ICAI attempts with Chapter 14 content).
- PYQ November 2023: the only "suggested answer" locatable was a **third-party coaching-institute
  key** (Vidya Sagar Career Institute), not an ICAI document — excluded per the no-invented-sources
  rule; its question paper may be genuine ICAI but isn't used without ICAI's own answer.

## Currency (full detail: `work/aaa-ch14/currency.md`)

Three points from ICAI's own RTP May 2026 academic update, none stated in the printed SM:
1. **NBFC-MFI 60% asset test** (RBI circular, 6 June 2025) — ongoing 60%-of-total-assets microfinance
   test, with a 4-consecutive-quarter remediation trigger.
2. **Gold-loan NBFC Tier 1** now explicitly follows the RBI (Lending Against Gold and Silver
   Collateral) Directions, 2025 — compliance deadline 1 April 2026 **has already passed**.
3. **ROU assets** added to the risk-weighted-assets table's "Others" line.

Plus one fact worth flagging even though it isn't a change: the SM's own **NBFC NPA glide path**
(>150 days → >120 days → >90 days by 31.3.2026) **has now run its course** — treat >90 days as the
settled rule for Nov 2026, not a transition.

## Exam priority (5-year sweep, `npm run priority -- aaa-ch14 --latest "May 2026"`)

Score = 2×PYQ + RTP/MTP appearances + 1 if in the latest RTP. High ≥5, Medium 2–4, Low 0–1.

| Provision | Score | Priority |
|---|---|---|
| Asset classification (NPA norms, banks) | 5 | **High** |
| Verification — advances (audit approach) | 4 | Medium |
| NBFC capital requirements | 4 | Medium |
| Drawing power calculation | 2 | Medium |
| DTL computation | 2 | Medium |
| NBFC audit — general procedure | 2 | Medium |
| NBFC asset classification | 2 | Medium |
| NBFC definition (principal-business test) | 2 | Medium |
| NBFC 4 layers (scale-based regulation) | 2 | Medium |
| NBFC registration & NOF | 2 | Medium |
| Internal control — advances; Sale/purchase of NPAs | 1 each | Low |
| All remaining 50 provisions | 0 | Low |

This score reflects actual appearance frequency in the located 5-year sweep, not subjective
importance — a large two-unit chapter naturally spreads exam attention thin across ~62 testable
provisions, and the found-paper sweep (8 attempts) genuinely concentrated on NPA/capital/registration
topics. **Chapter weight set to 7** (own estimate from marks actually found across attempts —
Dec 2021 9, May 2023 5, May 2024 4, Nov 2024 ~4, May 2025 11, Sep 2025 9, Jan 2026 6 ≈ 48 marks / 7
attempts ≈ 6.9 — the priority script's own total (14 marks, descriptive-only) undercounts since it
doesn't weight MCQ marks).

## Coverage

| | In source | In app |
|---|---|---|
| SM illustrations | 0 | 0 (none in either unit) |
| SM TYK (MCQ / descriptive) | 0 / 29 TYK + 6 TYU | 0 / 35 |
| RTP / MTP / PYQ questions found (descriptive + MCQ) | 3 rtp, 0 mtp, 3 pyq descriptive + 10 rtp/pyq-sourced MCQs | 3 rtp, 3 pyq, 10 mcq (all used; 3 further SM-repeats noted as "Also asked") |
| App-written (exam-style) | – | 24 mcq + 10 descriptive + 1 upd |
| Formula bank (families / formulas) | – | 5 / 14 |
| Numericals with final figures (`nums`) | – | 8 / 8 |
| Formulas with an exam cue | – | 14 / 14 |

**App totals:** 62 law-library provisions across 15 groups (A–O, the last "Beyond the study
material"), 86 questions (35 sm-tyk, 34 mcq, 3 rtp, 3 pyq, 1 upd, 10 app), 73 flip cards across 15
sections, 9 written-practice questions, and a 5-family / 14-formula bank (CRAR & Tier I, DTL,
Drawing Power, NBFC provisioning, the NBFC principal-business/threshold-test family).

**Notes / judgment calls:**
- **PYQ Sep 2025 MCQ 5** (KLM Bank revenue leakage): ICAI's own answer key accepted two options
  (₹9,50,000 and ₹10,50,000) depending on whether the overdue-interest item is read as the full rate
  or the incremental rate over normal — both workings are given in the app's explanation.
- **PYQ Nov 2024 MCQ 9** (Maha Bank CRAR): ICAI's own answer key says "no correct option" — the
  figures in the located paper don't reconcile (likely a printing error in the original paper, not
  an extraction fault on this build's part). This MCQ was **not used**.
- Two source files were mislabelled by the index used to find them (vsijaipur): "RTP Nov 2025" is
  actually RTP **September** 2025, and "PYQ Nov 2021" is actually PYQ **December** 2021 — every
  `src` field in the data uses the attempt as printed on the paper itself, not the index's label.
- Two PYQ items (May 2022 drawing-power manipulation by a borrower, Nov 2024 TEA Ltd stock-statement
  hike) were swept but **excluded** — both test CARO 2020 clause 3(ii)(b) from the *borrower's*
  auditor's side, which belongs to a CARO chapter, not this one.
- **No conflicts between ICAI's answers and current law** were found; the three RTP May 2026 updates
  above are additions/clarifications, not reversals of any SM answer.

## Build QA
`npm run validate -- aaa-ch14` → **OK: 0 errors, 0 warnings**. `npm run build` succeeds. Headless
Playwright pass (Home/Drill/Hunt/MCQ/Library/Cheat sheet/Flip/Notes + `/aaa/formulas`) at 390×844 and
1280×900: all pages 200, no console errors, no horizontal overflow. Two bugs were caught and fixed in
this pass before sign-off:
1. A React hydration error (#418/#423) on the chapter home page, caused by `extras.json`'s `method`
   and `changes` entries wrapping their HTML in an extra `<p>` that the rendering components already
   supply themselves (invalid nested `<p>`/`<span><p>`) — fixed by stripping the redundant wrapper.
2. A horizontal-overflow bug on the Cheat sheet at mobile width, caused by several provision
   `label`s (the short chip/tile code) running well past the 24-character limit the schema sets —
   fixed by shortening every offending label chapter-wide (35 provisions affected, not just the new
   "Beyond the SM" group).

## Mastery build (added)

- **Mastery path**: 15 sequential levels (bank side 1 to 10, NBFC side 11 to 14, bank vs NBFC and Nov 2026 updates in 15), 75 recall checks.
- **Bank vs NBFC**: 19-row comparison and a 19-statement "which is which" sorter.
- **Games**: 8 (three match-ups, layer sorter, asset-category sorter, report sorter, as-written-or-twisted, ordering puzzles).
- **Step solvers**: 10 problems, 32 versions (base case plus twists), all figures recomputed by `scripts/build-learn.mjs`.
- **New questions**: 8 CFA-style (kind `cfa`) and 12 built from single SM lines (kind `line`), all app-written and labelled so.
  CFA-style items are original questions in that style, not CFA Institute material.
- Beyond-SM content (SMA bands, bank 12-month doubtful clock, CET1/AT1/leverage, LCR, ECL vs IRAC and the Impairment Reserve) is labelled "Beyond the SM" in the text; check current RBI wording before quoting.
