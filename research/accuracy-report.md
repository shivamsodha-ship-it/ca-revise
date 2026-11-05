# Accuracy report

Run on 13 Oct 2026 for the four chapters in the app: AAA Ch 14, AAA Ch 15, AAA Ch 19, AFM Ch 8.
Commands: `node scripts/audit-accuracy.mjs all`, `npm run validate -- <id>`, `node scripts/build-learn.mjs <id>`, `node scripts/spot-check-afm08.mjs`.

## What could and could not be checked

- **Could not**: compare anything against ICAI's own text. ICAI's file server (`resource.cdn.icai.org`) is blocked for this session by the organisation's egress policy (HTTP 403), and no study-material PDFs are in the repository (`inbox/` does not exist). So **nothing here certifies a figure against the printed study material or RTP/MTP/PYQ**. Every chapter was built earlier from those documents; this run checks that the data does not contradict itself, that arithmetic is right, and that every new claim traces back to that data.
- **Could**: self-consistency checks (below), independent recomputation of figures, and confirmation of outside-the-SM regulatory facts from web sources. Web sources found were secondary (law-firm and tax-site summaries quoting RBI); the RBI pages themselves were not retrievable.

## Automated audit: result

| Chapter | Errors | Items to verify by hand |
|---|---|---|
| AAA Ch 14 | 0 | 10 (all labelled "Beyond the SM") |
| AAA Ch 15 | 0 | 1 (a section number read as a count; harmless) |
| AAA Ch 19 | 0 | 1 (see open items) |
| AFM Ch 8 | 0 | 5 (labelled "Beyond the SM"; one arithmetic-only card) |

What the audit checks: every MCQ key against the "Answer: (x)" line and the explanation; no duplicate options; every typed-answer figure appears in the model answer; every numbers-table figure appears in the provision it points to; every figure-with-unit in the mastery layer and on flip cards is stated in the casebook with the same unit; every provision link resolves; every source kind is declared; every solver figure recomputed by code.

## Defects found and fixed in this run

1. **AAA Ch 19, marks tip contradicted the scope note.** The "How to write the answer" tip said to write the 2026 Code figure; the scope note and every guideline provision say to write the SM figure and add one line on the 2026 figure. Corrected to the second reading.
2. **AAA Ch 19, six provisions were tested by no question** (CoE fundamental principles, s.20, FS I(5), FS III(3), the unjustified-removal guideline, the logo guideline). Six app-written questions (E37 to E42) added, built only from those provisions' text.
3. **AAA Ch 14, SM TYK 14 (NPA sale)**: the answer did not state the ₹147.07 lakh total that the app checks. Total added to the answer.
4. **AFM Ch 8, SM TYK 23 (Sunidhi, constant ratio plan)**: the question's answer gives buy-and-hold as ₹2,60,000 with the working "₹1,00,000 + 2,500 × ₹52". That arithmetic gives **₹2,30,000**. If ₹2,30,000 is right, the constant ratio plan (₹2,40,647.55) beats buy-and-hold, the opposite of what the answer said. The printed SM solution is not available here, so this is **flagged, not decided**: the answer, the notes card and the provision note now show both figures and say it is unresolved, and the typed-answer check accepts either. **Please check this one against the SM page.**
5. **AAA Ch 14, NOF phase-in**: the SM's "₹5 crore by 31.3.2025 for ICC/MFI/Factors" is not what the RBI notification lists for NBFC-MFI (₹7 crore). A "Check (not in the SM)" note was added to that provision's update box; the SM text is left as printed.

## Independent recomputation

- AFM Ch 8: 17 figures from ICAI answers recomputed from the question inputs (required return, beta and expected NAV for D and K funds, hedge fee, closed-end geometric returns, constant ratio plan unit trades and ending value, real return). All match except the buy-and-hold total in item 4.
- All 44 solver variants across the four chapters recomputed in each chapter's `check()` before the learn file is written; 0 mismatches. Recall-question figures recomputed for AFM Ch 8 and AAA Ch 15/19.
- CFA-style and one-line questions in AAA Ch 14 (20 questions): each quoted figure recomputed in `scripts/merge-ch14-additions.mjs`; 0 mismatches.

## Outside-the-SM claims, checked against web sources

| Claim (where used) | Result | Source |
|---|---|---|
| SMA-0/1/2 are 1 to 30, 31 to 60, 61 to 90 days overdue (Ch 14 level 6) | Consistent across sources | [RBI MSME framework summary via bank customer literature](https://www.smbc.co.jp/asia/india/policies/Customer-Education-Literature.pdf), [Fibe explainer](https://www.fibe.in/blogs/sma-meaning-in-cibil-what-it-is-types-and-how-it-affects-your-credit-score/) |
| Bank: doubtful after 12 months as sub-standard (Ch 14 compare) | Consistent | [WIRC-ICAI IRAC note](https://old.wirc-icai.org/images/material/2015-IRAC-WIRC-200315.pdf), [CA Club summary](https://caclub.in/rbi-master-circular-on-prudential-norms-for-income-recognition-asset-classification-irac-and-provisioning-pertaining-to-advances/) |
| NBFC-BL 18 months, NBFC-ML/UL 12 months (in the SM) | Consistent with a CA-firm working paper; RBI text not retrieved | [Panchal CA tool](https://panchalsk.com/npa-provisioning-tool/), [KPMG](https://assets.kpmg.com/content/dam/kpmg/in/pdf/2022/06/chapter-3-aau-non-perfrming-assets-and-provisioning.pdf) |
| NOF ₹10 crore by 31.3.2027; ICC ₹5 crore step | Confirmed | [Taxmann](https://www.taxmann.com/post/blog/rbi-revises-net-owned-fund-requirements-for-specified-nbfcs-to-commence-carry-on-business/), [SCC Online](https://scconline.com/blog/post/2022/04/06/rbi-notifies-net-owned-fund-for-nbfcs-to-commence-business/amp) |
| NOF interim step for NBFC-MFI is ₹7 crore, not ₹5 crore | **Differs from the SM** | [Taxscan gazette copy](https://documents.taxscan.in/judgments/2022/1389386-order_watermark.pdf) |
| Ind AS NBFC: ECL below prudential provision, difference to an Impairment Reserve, not counted for regulatory capital, no withdrawal without RBI permission | Confirmed | [RBI notification page](https://rbi.org.in/SCRIPTS/NotificationUser.aspx?Id=11818), [Vinod Kothari](https://vinodkothari.com/?p=27089) |
| Bank sub-standard provision 15% secured / 25% unsecured; doubtful 25/40/100% secured by age; 100% unsecured (not used in the app; noted for completeness) | Consistent | [IRAC summaries](https://website.rbi.org.in/documents/87730/39710850/58324.pdf) |

One development to know about: search results report that RBI issued consolidated IRAC and provisioning Directions in 2025 (for NBFCs, effective 28 November 2025; for banks, "Commercial Banks – Income Recognition, Asset Classification and Provisioning Directions, 2025"). The study material and RTP the app follows predate or ignore this; the figures in the SM match the secondary summaries of the new Directions, but **the RBI text itself was not read**.

## Open items for you (in order of exam risk)

1. **AFM Ch 8, SM TYK 23 (Sunidhi)**: buy-and-hold ₹2,30,000 or ₹2,60,000 as printed? (Defect 4.)
2. **AAA Ch 14**: confirm in the SM that NBFC-MFI is grouped with ICC at ₹5 crore for 31.3.2025 (RBI lists ₹7 crore).
3. **AAA Ch 14, "Beyond the SM" items**: SMA bands, bank 12-month doubtful clock, CET1/AT1/leverage, LCR run-off rates (illustrative), Impairment Reserve wording. These are labelled in the app; do not quote them unless asked.
4. **AAA Ch 19, cheat-sheet row "Fee dependence disclosure to ICAI" (2 consecutive years, 40%/20%, ₹20 lakh)**: the provision it points to does not state these figures, and the provision's own update note puts the topic beyond the Nov 2026 syllabus. Treat as outside the exam until confirmed.
5. **AAA Ch 19**: SM figures to write (company audits 30, teaching 25 hours, goodwill 1 year, websites pull-only) rest on the RTP Nov 2026 listing exactly three amendments; confirm that list against the RTP.
6. **All chapters**: where the RBI's 2025 consolidated Directions renumber or reword a provision, ICAI's answer still governs; the app follows ICAI.

## fr-ch09 (14 Oct 2026)
- VERIFY "Significant financing: practical expedient" → **verified**: SM 9 p.76, Ind AS 115.63 "one year or less".
- 32 ICAI MCQ keys parsed from the found files were each matched against ICAI's answer text (all match); four recomputed (Bazar voucher ₹1,762/₹238; gym ₹6,857/₹643; elevators ₹15,00,000; barter ₹50,000).
- PYQ May 2026 MCQ 12: key not published in the paper swept → app working (A) ₹(2,000), labelled on the question.
- ICAI arithmetic/wording issues kept as published with an app note: see research/fr-ch09.md.
- SM Example 8 (commission table states ₹1 crore as acquisition cost for a 1% commission on a ₹1 crore contract) noted in the provision as needing a check; not used in any question.

## fr-ch09 completion pass (14 Oct 2026)
- 70 numericals given `nums`; every figure recomputed in Python (helper agent for ICAI papers, main session for SM). All ICAI figures within 0.25% except those listed in research/fr-ch09.md with corrected workings.
- Mastery layer: every solver and numeric recall figure recomputed in scripts/learn-src/fr-ch09.mjs check() — 0 mismatches.
- Level l09 figures rewritten to the SM's own units (₹1 million / ₹10,00,000) after audit VERIFY.

## fr-ch09 (14 Oct 2026, later)
- Removed all 'Corrected working (app)' / 'Note (app)' paragraphs: apparent ICAI slips were not verified against the PDF page images and are likely text-extraction artefacts. ICAI text kept as published.

## Last-day packs (27 Oct 2026)
Scope: `data/lastday/*` (must-do packs, weightage, analysis, writing plan, Nov 2026 updates), built by `scripts/lastday`. All question and answer text is ICAI's, extracted verbatim; layout, ordering, minutes and chapter/concept labels are app-written. Chapter filing is by wording match (BM25) plus the Ind AS number cited, not by ICAI, and each question shows its closest SM section.

ICAI's own corrections and quirks found in the papers (checked against the ICAI files; ICAI text kept as published, nothing corrected by the app):
- FR Sep 2025, Case Scenario II Q9: ICAI note "Read 'loan notes' as 'preference shares'".
- FR Sep 2025, Q on Ind AS 19 discount rate: ICAI note "Read 'annual market yield on high quality corporate bonds' as 'market yields on government bonds'".
- FR Sep 2025, MCQ 15: ICAI's key is "No Correct Option".
- FR Jan 2026, MCQ 7: ICAI's key is "(A) and (C)" (both accepted).
- FR May 2026, MCQ CS-I Q5: key accepts B or D. Q5(b): the question says Gama Ltd., ICAI's answer text says "Sigma Ltd." once ("Sigma Ltd. will need to split…") and Gama Ltd. elsewhere.
- AFM May 2026, Case Scenario II MCQ 6: ICAI's key is "No correct option".

Nov 2026 currency: Part I of the FR and AAA Nov 2026 RTPs (amendments / academic update) is reproduced on `/fr/updates` and `/aaa/updates`; the AFM Nov 2026 RTP has no such section. The AAA list is cumulative (it repeats the Jan 2026 and May 2026 items). The FR amendments (Ind AS 21 exchangeability, Ind AS 1 current/non-current with covenants, Ind AS 7 and 107 supplier finance, Ind AS 12 Pillar Two) are newer than the SM text in Ch 3.1, 3.3, 7.1, 7.2 and 11; those packs carry a notice.

Not verified line by line: the question-to-chapter mapping and concept labels in `research/lastday/*-last3-analysis.md` (agent-written from ICAI's papers and answers; marks and question labels were spot-checked against the ICAI text).

## LDR notes: Ind AS 32 & 109 (SM Ch 11), 1 Nov 2026
`ldr-src/fr/ind-as-32-109-sm.html` → `public/ldr/fr/FR_LDR_IndAS32_109_Financial_Instruments.pdf`. Condensed from ICAI SM Ch 11 Units 1–7; every figure is ICAI's. Inconsistencies in the SM flagged in the notes and left as ICAI wrote them:
- Non-substantial modification of a financial liability: Unit 2 (2.8) says to re-discount revised cash flows at the original EIR and take the difference to P&L; Unit 5 Example 4 instead nets the fee against the carrying amount and resets the EIR (10.99%), saying the standard is not explicit. The notes give both.
- Unit 5 Example 4: difference shown as 4.35% in the text and "4%" in the working note (43,474 ÷ 10,00,000 = 4.35%).

## Conceptual Framework SM Ch 2, Example 13 (physical capital maintenance), 2 Nov 2026
- ICAI computes closing capital at current cost as ₹ 9,000 [(6,000 × 2.50) − 6,000 drawings] and retained profit (6,000), and says that with no drawings the trader "would have left with ₹ 15,000". The trader actually holds ₹ 12,000 cash (18,000 sales − 6,000 drawings); with no drawings he would hold ₹ 18,000. On the SM's own facts, capital to maintain is ₹ 15,000 (6,000 × 2.50), so the shortfall is ₹ 3,000 and the maximum drawings are ₹ 3,000 (current cost profit 18,000 − 15,000; holding gain 3,000 to capital maintenance adjustment). ICAI's text is kept as printed; this note is app-written.

## AFM SM Ch 9, Illustration 1 (two-step binomial, riskless hedge), 3 Nov 2026
- ICAI's hedge ratio at the valuation date is ∆ = (5 − 0) ÷ (33 − 27) = 5/6, using the intrinsic values at the one-period nodes (33 − 28 = 5; 27 < 28 → 0). The option values ICAI itself computes at those nodes are Cu = 5.673 and Cd = 1.0341, which would give ∆ = (5.673 − 1.0341) ÷ 6 = 0.773. ICAI's 5/6 is kept as printed; this note is app-written.
- Same illustration: p uses r = (1.05)^½ = 1.0247, while discounting uses 1.025 (rounded). ICAI's figures are kept.
- SM Ch 9 §6.6.3 (p 9.21): put buyer's gain printed "(Spot Price – Exercise Price – Premium)"; it should be (Exercise Price − Spot Price − Premium), which gives ICAI's own break-even of ₹ 35.
- SM Ch 9 Illus 3(iii) (p 9.31): PV of exercise price shown as 395.06 and 395.03, giving two put values (25.58 / 25.55); "Current Market Value ₹ 415" is listed though the put uses 380.
- SM Ch 9 Illus 6 (p 9.47, timing option): expected pay-off includes a negative down-state NPV (−1.3 crore), against the SM's rule that an option's value cannot be negative. ICAI's ₹ 19.96 / 18.48 lakh kept.

## AAA SM inconsistencies found while building the AAA exam pack, 4 Nov 2026 (ICAI text kept; app-written notes in the pack)
- Ch 6 p.6 (SA 570 chart): "Use of Going Concern Basis of Accounting is appropriate – the auditor shall express an adverse opinion"; should read inappropriate (Ch 6 TYK 4, Ch 7 pp.9–10).
- Ch 7 p.77 Example 3: qualified opinion uses "subject to", although Ch 7 p.46 says "except for" should be used.
- Ch 7 p.11 Illustration 1: refers to Note 10 and Note 11 for the same matter.
- Ch 7 p.52 SA 710 chart vs pp.51–52 text on unaudited prior-period FS.
- Ch 7 p.104 TQ 9 answer: adverse opinion (basis inappropriate) but Basis paragraph uses material-uncertainty wording.
- Jan 2026 MCQ CS-I Q4 key (EOM) where management refuses disclosure; SA 706 in the SM requires appropriate disclosure for EOM.
- Ch 1 p.13 vs p.19: EQCR completion "before the report is issued" (SQC 1) vs "on or before the date of the auditor's report" (SA 220).
- Ch 2 p.49 TYK Q1 names (A and B vs A and C); Ch 2 pp.60–61 TYK 10 answer differs from main text pp.36–37 on joint-audit allocation communication.
- Ch 5 p.5.39 TYK 5 answer swaps the names of the auditor and the audit partner.
- Ch 11 p.11.4: SAEs said to give "moderate" assurance, while SAE 3402/3420 are reasonable-assurance engagements (pp.11.15, 11.22–11.29).
- Ch 8 p.8.39 TYK 6 answer refers to para 4.2; content is in 4.6/4.6.1.
- Ch 12 p.12.19: phishing e-mail to the CEO labelled "spear phishing" although the SM's whaling definition covers C-level targets.
- Ch 18 p.18.10 vs p.18.32: "Social Capital" vs "Social and Relationship Capital".
- Ch 14 (AAA pack): the only official Ch 14 PDF found (boslive c_id 1472: 90438bos-aps3938-ch14u1/u2) is the Hindi edition; notes were built from it and cross-checked against data/aaa/ch14-*.json. Points where the Hindi text is internally inconsistent or differs from the English app data: sub-standard/doubtful NBFC periods worded "more than" (read as BL 18 / ML+ 12 months, matching Jan 2026 MCQ); gold-loan Tier 1 12% says "banks"; exception-report addressee "Ministry of Finance" vs RBI DNBS; SAC timing (one month / 30 Dec vs 5 working days / 31 Dec in app data); NOF ₹10 crore vs ₹200 lakh vs ₹25 lakh/₹2 crore; Abhimanyu Finance CoR date 2024 vs 2021; current-asset risk-weight table (11 percentages for 9 items).
- AAA SM Ch 19 §4.7 vs TYK 15 answer (p.19.174–175): §4.7 says the KYC norms are mandatory and "shall apply in all assignments pertaining to attestation functions"; the TYK 15 answer holds CA F's contention invalid although his services were GST consultancy, a compilation engagement, ERP set-up and advisory (none an attestation function), quoting the same "attestation functions" sentence. The answer does not say "guilty"; it says the contention is not valid and lists the corporate KYC information. Both kept as printed.
