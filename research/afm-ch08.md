# AFM Ch 8 — Mutual Funds

Built 5 Oct 2026 for the **Nov 2026** attempt with the `ca-chapter` skill. It sweeps every ICAI paper from the
last 5 years (Dec 2021 attempt onward). This is the first AFM chapter in the app, and the first with a formula bank.

## Sources

**Study material.** User-supplied `MF.pdf` (54 pp). It is text-identical to ICAI's Ch 8 file
https://resource.cdn.icai.org/87849bos-aps2163-ch8.pdf, part of the AFM set ICAI lists as "Applicable for May 2026 Exam Onwards"
(https://www.icai.org/post/sm-final-p2-may2026; imprint "Edition: November, 2024; Reprint: August, 2025"). The edition's change log
says only that one TYK question and its answer were removed from Ch 8.

**Currency.** No amendments affect this chapter. The Nov 2026 and May 2026 AFM RTPs have no statutory or academic update section.
The 15 Sep 2026 corrigendum to the Nov 2026 RTP covers only Q11 (RSI). The "Applicability … November, 2026" annex covers Papers 1 and 3 only.
The user's `inbox/RTP.pdf` is byte-identical to ICAI's Nov 2026 AFM RTP (93964bos-aps6169-rtp-nov2026-ch2.pdf).

**Where the papers came from.** ICAI's own PDFs on resource.cdn.icai.org, found through icai.org post pages and the index
https://www.vsijaipur.com/ca-final-papers/. boslive.icai.org returns 403 from the Codespace.
- RTPs: all 13 papers (12 attempts; Dec 2021 has new- and old-course papers). The Dec 2021 new-course RTP link is dead on ICAI's CDN;
  it came from the Wayback Machine snapshot of that exact ICAI URL (web.archive.org/web/20220525232814/…/66477bos53743-fnewgp1.pdf).
- Past papers: ICAI suggested-answer PDFs, which reproduce the questions (12 papers). No CA Final exam was held in Sep 2026.
- MTPs: 24 of 25 Paper 2 MTPs. Where ICAI's link was dead or the index was wrong, a third-party copy was used only after checking ICAI's
  header (Series, Paper 2 AFM/SFM, attempt, paper date) or ICAI copyright footer. The index's "May 2024 S-II" link was actually May 2025 S-I,
  and its "Nov 2023 S-II" was a coaching paper (rejected). URLs and checks are recorded in `work/afm-ch08/found-mtp.md`.

Full per-paper notes, URLs and ICAI answer texts: `work/afm-ch08/found-rtp.md`, `found-mtp.md`, `found-pyq.md`, `currency.md` (not committed; work/ is git-ignored).

## Papers swept and MF questions found

| Attempt | RTP | MTP S-I | MTP S-II | Past paper |
|---|---|---|---|---|
| Nov 2026 | Q10 (gilt fund) | none | Q3(c) TE | – (exam not yet held) |
| May 2026 | Q12 (= May 2022 Q5) | MCQs 6–10 | Q1(a) (= RTP Nov 26 Q10), Q1(b) | Q3(b), Q4(b) |
| Jan 2026 | Q13 | Q4(b) (= TYK), Q5(a) | Q4(b) (= TYK) | Q1(a), Q6(a) |
| Sep 2025 | Q12 | Q1(b) (= TYK) | Q3(a) (= TYK) | MCQs 4–6, Q3(b), Q5(b) |
| May 2025 | none | MCQs 1–5, Q3(a) | Q3(a), Q4(b) | MCQs 6–8, Q5(a) |
| Nov 2024 | Q2 MCQs I–V | MCQs 6–10, Q2(c) | Q4(a) (= TYK) | Q2(a), Q6(a) |
| May 2024 | Q10 | MCQs 1–4 | Q3(c), Q4(b), Q5(b) (= TYK) | Q1(b), Q2(c) |
| Nov 2023 | Q6 | Q3(b), Q4(b) | Q3(a) | Q2(b) |
| May 2023 | Q5 | Q3(b), Q4(b), Q5(a) | Q3(b), Q4(b) (= TYK) | Q5(a), Q5(b), Q6(c) |
| Nov 2022 | Q5 (= TYK) | Q3(b), Q4(b) | Q3(b)(i), (ii) | Q3(b), Q4(a) |
| May 2022 | Q5 | Q3(b) (= TYK) | Q3(b) (= TYK), Q6(c) | Q2(a), Q4(b) |
| Dec 2021 | Q5 (new = old) | Q6(b), Q6(c) (new); Q5(b) (old) | **could not fetch** (new); Q5(a) (old) | Q1(b) (new); Q1(b), Q4(b) (old) |

"= TYK" means a word-for-word or re-dated repeat of a study-material question; it is recorded under "Also asked (ICAI)" on that question
rather than duplicated. Every item found is in the app, either as its own question or as an "Also asked" line.

**Could not fetch**
- **MTP Dec 2021 new-course Series II** (Paper 2 SFM): ICAI's page lists it, but all three ICAI links are dead and no verifiable copy was found.
  To add it, drop the PDF in `inbox/` and ask to update the chapter.
- **May 2024 past paper MCQ part**: ICAI's suggested-answer file has the descriptive part only; no separate MCQ file was found.

**Problems in ICAI's own files (kept as ICAI printed them, flagged in the app)**
- PYQ Dec 2021 Q1(b): the paper prints AJ's Treynor ratio as 1.2; ICAI's answer uses 12.
- PYQ Nov 2022 Q3(b)(ii): ICAI's text says the plan's value is "lesser" than buy-and-hold, but its own figures show it higher (₹5,56,065.37 vs ₹5,50,000).
- MTP May 2025 S-I MCQ 3 (side pocketing): ICAI's key is (c); option (a) also matches the SM text. The app follows ICAI and explains both.
- MTP Nov 2024 S-I MCQ 9: ICAI's key is "only (iii)"; statement (i) ("percentage of income") is also loose against the SM ("percentage of assets"). The app follows ICAI and notes this.
- MTP Dec 2021 S-I Q6(c): ICAI's answer file prints an answer to a different question. The app's model answer is written from SM para 7 and says so.
- SM TYK 16 (Sun Moon): the PDF's text layer reverses the digits of the three final returns; the app uses the correct 67.64%, 73.33% and 69.59%.

## Exam priority (5-year sweep)

Score = 2 × PYQs + RTP/MTP appearances + 1 if in the latest RTP; repeats under "Also asked" count. High ≥ 5, Medium 2–4, Low 0–1.

| Topic cluster (concept) | PYQs | RTP | MTP | Score | Priority |
|---|---|---|---|---|---|
| Effective yield, date of investment, NAV back-solving (mf-eff-yield) | 8 | 4 | 5 | 25 | **High** |
| NAV computation, fresh subscription, NAV after dividend (mf-nav) | 6 | 2 | 7 | 21 | **High** |
| Plan-wise yield; issue price back-solve (mf-plan-yield) | 5 | 1 | 6 | 17 | **High** |
| Holding period return, payout vs reinvest (mf-hpr) | 5 | 0 | 6 | 16 | **High** |
| Sharpe / Treynor / Jensen / R² on MF schemes (mf-eval-quant) | 3 | 1 | 8 | 15 | **High** |
| Expected NAV via β from Sharpe and Treynor (mf-beta-nav) | 4 | 2 | 3 | 13 | **High** |
| Dividend equalisation (mf-div-eq) | 2 | 3 | 5 | 12 | **High** |
| New fund's month/year: cash, NAV, rate of earning (mf-earning-rate) | 2 | 3 | 0 | 7 | **High** |
| Constant ratio plan (mf-constant-ratio) | 2 | 0 | 3 | 7 | **High** |
| Tracking error | 0 | 0 | 3 | 3 | Medium |
| Gilt fund & duration (in latest RTP) | 0 | 1 | 1 | 3 | Medium |
| Expense ratio; special funds; hedge fund fees; closed-end premium/discount | – | – | – | 2 each | Medium |
| Side pocketing, bond-fund risks, loads, qualitative evaluation | – | – | – | 1 each | Low |
| Establishment, advantages, drawbacks, schemes, ETFs, direct plans, trail, FIIs, fund manager, required return | 0 | 0 | 0 | 0 | Low (but covered by app questions/MCQs) |

**Chapter weight**: about **13 marks per attempt** (145 past-paper marks over 11 attempts, plus the Dec 2021 old-course paper).
Since 2024 ICAI has also tested this chapter's theory through case-scenario MCQs (expense ratio, tracking error, side pocketing, Sortino).

## Beyond the study material (app additions)

At the user's request ("ICAI has started … asking untouched topics and concept-based new questions"), the chapter adds, all clearly labelled:
- **Group H concepts**: SIP/STP/SWP and rupee-cost averaging; Jensen's alpha, M², information ratio, R², portfolio turnover; MF operating vocabulary (NFO, AUM, switches, folio, cut-off time).
- **13 app-written questions** (one or more for every topic ICAI has not examined) and **28 app-written MCQs**.
- **Formula bank**: 13 families, 68 formulas, each family led by a master formula; every formula explains why it works, how it is derived from its parent, the exam cue, the trap and a worked example. 4 formulas are marked "Beyond SM".
- SEBI figures quoted in the SM (2.50% expense cap, ₹100 crore AMC net worth, 3-year FMP tenure for indexation) are reproduced as ICAI prints them; the app warns that SEBI and tax rules have changed since, without asserting the new figures.

## Coverage

| | In source | In app |
|---|---|---|
| SM worked examples | 1 | 1 |
| SM TYK (theory / practical) | 2 / 23 | 2 / 23 |
| SM TYK MCQs | 0 | 0 |
| RTP questions found (distinct / incl. MCQs) | 12 / 16 rows | 8 questions + 5 MCQs; 3 repeats as "Also asked" |
| MTP rows found | 40 | 22 questions + 19 MCQs; the rest as "Also asked" |
| Past-paper items found | 24 (incl. 2 MCQ cases = 6 MCQs) | 22 questions + 6 MCQs |
| App-written (exam-style) | – | 13 questions + 28 MCQs |
| Totals | | 149 questions (58 MCQs), 35 concepts, 71 flip cards, 11 written practice, 68 formulas |
