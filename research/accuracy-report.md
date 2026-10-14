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
