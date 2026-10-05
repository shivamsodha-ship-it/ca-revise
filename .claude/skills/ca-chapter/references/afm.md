# AFM playbook (Paper 2, Advanced Financial Management)

Read this for every AFM chapter, together with subjects.md. It records what the first AFM build (Ch 8 Mutual Funds,
`data/afm/ch08-*.json`, `research/afm-ch08.md`) taught. **Ch 8 is the AFM reference build**: match its depth, its formula
bank and its labelling.

## What "done" looks like for an AFM chapter

| Item | Ch 8 benchmark |
|---|---|
| Concepts (provisions) | ~30–35, one per model/technique, + group H "Beyond the SM" |
| Questions | every SM worked example / illustration and TYK item + every RTP/MTP/PYQ item from 5 years (~100+), + app questions so **every** concept has ≥ 1 |
| MCQs | every ICAI MCQ (case scenarios included) + app MCQs for every theory topic ICAI has not examined (~25) |
| Formula bank | every formula used in the SM or any ICAI answer of the chapter, in families led by a master formula (Ch 8: 13 families, 68 formulas) |
| Flip cards | every concept ≥ 1 card; High concepts 2–4 (Ch 8: 71) |
| Written practice | ≥ 8, from the highest-priority real questions (Ch 8: 11) |
| Validate | 0 errors, 0 warnings |

## AFM chapters (confirm titles and numbers against the applicable SM index)

1 Financial Policy and Corporate Strategy · 2 Risk Management · 3 Advanced Capital Budgeting Decisions · 4 Security Analysis ·
5 Security Valuation · 6 Portfolio Management · 7 Securitization · 8 Mutual Funds (built) · 9 Derivatives Analysis and Valuation ·
10 Foreign Exchange Exposure and Risk Management · 11 International Financial Management · 12 Interest Rate Risk Management ·
13 Business Valuation · 14 Mergers, Acquisitions and Corporate Restructuring · 15 Startup Finance.
Old-scheme papers (SFM, Paper 2, up to Nov 2023) count when the topic is unchanged; SFM chapter names and numbers differ, so search by topic.

## Study material quirks (step 3)

- AFM chapters often have **no numbered "Illustration"**; the worked examples are headed "Example". Treat each as `sm-ill`
  ("SM Illustration n", numbered in SM order). TYK has two lists: label them **"SM TYK Theory Qn"** and **"SM TYK Practical Qn"**
  (ids T1… running through both). Research agents number practicals separately ("TYK 21" = Practical Q21) — map carefully.
- **The PDF text layer garbles numbers.** Fractions come out stacked or reversed (`10025.12 00. 3 ×` is 3.00 ÷ 12.25 × 100),
  `` ` `` stands for ₹, and final percentages can have reversed digits (Ch 8 printed 64.67 for 67.64). **Recompute every final
  figure** you copy from the SM or an ICAI answer (a quick `python3 -c`), and open the PDF page (Read with `pages`) where unsure.
- Check the edition's change log: ICAI sometimes drops a TYK question; the checklist follows the applicable edition.

## Sources (step 5) — what worked

- Run **three background agents**: RTP, MTP, PYQ (+ currency). Give each the found-file layout below and the list of the
  chapter's SM TYK practicals so it can flag repeats. They take 10–25 minutes; build the law library, SM questions, formula
  bank and notes meanwhile.
- **Past papers**: ICAI's suggested-answer PDF reproduces the question paper, so one file per attempt is enough. Some recent QPs
  are scanned images; the SA has text. No CA Final exam was held in Sep 2026 (Final moved to Nov).
- **RTPs**: icai.org/post/rtp-final-course-<attempt> pages list the PDFs. Dead ICAI CDN links (e.g. Dec 2021 RTP) can be
  fetched from the Wayback Machine snapshot of **the exact ICAI URL** — record both URLs.
- **MTPs**: the vsijaipur index has errors (a "May 2024 S-II" link that was May 2025 S-I; a coaching paper posing as an MTP).
  Third-party copies (castudynotes, cacult, zeroinfy, Google Drive) only after checking ICAI's header, series, paper, attempt
  and date or ICAI's copyright footer; reject anything else. Record the check.
- **MCQ case scenarios**: ICAI publishes **only the answer key**. Keep ICAI's key even if you would argue for another option;
  write the working yourself and end `why` with "(ICAI published the key; the working is the app's.)". If the key looks wrong,
  say so in `why` and in the research report.
- **ICAI misprints** (a ratio printed 1.2 but solved with 12; an answer file printing another question's answer): keep the
  question as set, follow ICAI's answer, add a `Note:` line; where ICAI has no answer, write one from the SM and say so.
- **Cross-chapter items** (a bond-fund question in the MF sweep, hedging an MF with index futures): include them in the chapter
  where the student would look, link the nearest concept, and note it in the report; the other chapter's build will link them too.

### Found-file layout (paste into every agent prompt)

```
work/<id>/found-<rtp|mtp|pyq>.md
## 1. Papers swept        table: attempt | series | URL | verification note | items found (or "none")
## 2. Question rows       `kind | attempt | Q no. | marks | topic | gist | url`
## 3. Full questions and ICAI answers
### <Attempt> [S-I|S-II], Q<n>(<part>), <m> marks. <topic>
**Question.** <exact text; markdown tables for data>
**ICAI answer.** <exact solution with every working table and figure; MCQs: options + key>
SM repeat: <"YES, SM TYK Practical Qn, verbatim" | "variant of …" | "not an SM TYK">
## 4. Could not fetch
```
`scripts/found2html.py` converts each section to app HTML (`sections`, `split_qa`, `md`).

## Repeats (step 7)

- **Word-for-word or re-dated repeat of an SM TYK** → no new question; add "Also asked (ICAI): MTP May 2024 S-II Q5(b) (re-dated)"
  to the TYK question's answer (keep a small `also.json` map and append it in the build script).
- **Variant** (new numbers, extra part) → its own question, with "Variant of SM TYK Practical Qn" in the answer.
- **Same question in two papers** (RTP May 2022 = RTP May 2026; new = old course) → one entry under the latest attempt, the other in "Also asked".
- `npm run priority -- <id> --latest "<attempt>"` counts "Also asked" items, so repeats raise the priority as they should.

## Build pattern

Long chapters are written by small Python builders in `work/<id>/` (git-ignored), each writing one part file:
`build_tyk.py` (SM questions, with a `t()` table helper), `build_rtp.py` / `build_mtp.py` / `build_pyq.py` (from found files via
`scripts/found2html.py`, plus a META list: heading prefix → id, src, links, theory?, trap), `build_app.py` (group H provisions,
app questions and MCQs), `build_sections.py` (cards, tags from `work/<id>/priority.json`), `build_formulas.py`.
Re-run a builder after any edit, then `npm run assemble` / `validate`. Verify every number in app-written content with Python
before writing it.

Practice entries are **plain text** (the view does not render HTML): put data inline in `prompt`; lay out tables in
`modelAnswer` with spaces and `\n`.

## Formula bank — family patterns to start from

One family per idea; the master formula is the idea, the rest fall out of it. Formulas shared across chapters (CAPM, Sharpe,
Treynor, β) are restated where a chapter's questions use them, with `derive` naming the home chapter ("from Ch 6 Portfolio
Management"). Starting points (confirm against each chapter's SM and ICAI answers):

| Chapter | Families (master → derived) |
|---|---|
| 2 Risk Management | VaR (σ × z × √t → portfolio VaR, n-day VaR) |
| 3 Advanced Capital Budgeting | NPV (PV of flows → risk-adjusted rate, certainty equivalent, APV, real vs nominal (Fisher)); sensitivity/scenario; decision trees (expected NPV) |
| 4 / 5 Security analysis & valuation | Value = PV of future cash (bond price → YTM, duration, modified duration, convexity; DDM → Gordon growth, multi-stage; P/E, EV multiples) |
| 6 Portfolio Management | Portfolio return and risk (two-asset σ → minimum-variance weights; correlation/covariance → β; CAPM → SML, α; Sharpe/Treynor/Jensen; APT; formula plans) |
| 9 Derivatives | No-arbitrage (cost of carry → futures fair value, hedge ratio, index futures to hedge β; put–call parity; binomial (risk-neutral p); Black–Scholes (d1, d2)) |
| 10 / 11 Forex & IFM | Parity (IRP → forward rate, forward premium/discount, covered interest arbitrage; PPP; Fisher, international Fisher); cross rates; money-market vs forward hedge |
| 12 Interest Rate Risk | FRA settlement, interest rate futures, swaps (fixed vs floating, swap value), caps/floors/collars |
| 13 Business Valuation | DCF (FCFF/FCFE → WACC, terminal value), EVA/MVA, relative valuation |
| 14 Mergers | Value of synergy; swap ratio (EPS, MPS, book value); post-merger EPS and MPS; maximum/minimum exchange ratio |

## Beyond the SM (group H) for AFM

Add concepts a concept-based paper could ask that follow from the chapter's own ideas (e.g. Ch 8: SIP and rupee-cost averaging,
M² and information ratio, side-pocket NAV maths). Each gets a provision in group H (`law` starts with the "Beyond the SM" note),
`beyond: true` formulas, app questions and MCQs. Do not quote SEBI/RBI limits from memory; where the SM's figure is out of date
(e.g. its 2.50% TER cap), keep the SM figure and add a neutral `upd` saying it has been revised and to quote the SM figure.

## Answer style reminders (AFM)

Working notes as tables → formula in symbols → numbers → **bold final figure** → one line of advice when asked.
Keep ICAI's conventions: NAV unrounded until the end; simple annualisation unless IRR/GM is asked; σ with n or n − 1 exactly as
ICAI's answer does; show ICAI's alternative method where its answer gives one.
