# AFM: which chapters ICAI tests most (sweep for the Nov 2026 attempt)

Built 15 Oct 2026 for Paper 2 Advanced Financial Management. Sources, all ICAI papers (nothing from coaching sites): question papers with ICAI suggested answers for May 2022, Nov 2022, May 2023, May 2024, Nov 2024, May 2025, Sep 2025, Jan 2026; RTPs May 2023 – May 2026 (7, incl. Nov 2023); MTPs Mar 2024 – Sep 2026 (11 series). 
Each file was checked by its own header (paper, series, attempt) before it was used; the vsijaipur index mislabels some MTP links, so the header decides.

**Method (app-written, approximate).** Every question (the text before a "(N Marks)" marker) is matched to the SM chapter whose own text it resembles most, using ICAI's chapter PDFs (TF-IDF cosine over words and word pairs; `scripts/rank-sweep.py`). *Share* = the chapter's marks in a paper as a percentage of all marks listed in that paper, averaged over the question papers. Papers list about 118 marks for a 100-mark paper because of internal choice, so the share is of marks asked, not of marks a student writes. *Desc* = descriptive marks across the question papers; *MCQ* = 2-mark MCQ marks, which the matcher classifies less reliably because the case scenario is not part of the question text. *QP* = number of question papers (of those fetched) with the chapter. *RTP/MTP* = questions matched.
This orders the build; it is not an ICAI marks count. A question that mixes chapters is counted once, under the closest. Treat shares within about 1 point as equal.

**Could not use:** the May 2026 question papers (scanned images, no text; no OCR here), the Nov 2023 question papers (Drive copies returned a web page, not a PDF), and any MTP not on the index (the 11 series used run Mar 2024 to Sep 2026). MTP answer-only files were skipped.

| Ch | Chapter | Share of paper (%) | Cumulative (%) | Desc marks | MCQ marks | QP | RTP | MTP | In app |
|---|---|---|---|---|---|---|---|---|---|
| 6 | Portfolio Management | 12.9 | 12.9 | 102 | 16 | 8 | 19 | 13 |  |
| 10 | Foreign Exchange Exposure and Risk Management | 10.7 | 23.6 | 86 | 20 | 7 | 33 | 19 |  |
| 8 | Mutual Funds | 10.6 | 34.2 | 88 | 12 | 8 | 12 | 6 | built |
| 5 | Security Valuation | 9.9 | 44.1 | 74 | 22 | 8 | 26 | 31 |  |
| 9 | Derivatives Analysis and Valuation | 9.3 | 53.4 | 77 | 12 | 8 | 20 | 25 |  |
| 14 | Mergers, Acquisitions and Corporate Restructuring | 8.1 | 61.5 | 52 | 24 | 8 | 23 | 26 |  |
| 12 | Interest Rate Risk Management | 6.8 | 68.3 | 61 | 2 | 8 | 11 | 9 |  |
| 11 | International Financial Management | 5.5 | 73.8 | 47 | 2 | 6 | 7 | 10 |  |
| 2 | Risk Management | 5.0 | 78.8 | 54 | 0 | 6 | 2 | 18 |  |
| 13 | Business Valuation | 4.3 | 83.1 | 41 | 0 | 6 | 11 | 25 |  |
| 1 | Financial Policy and Corporate Strategy | 3.9 | 87.0 | 36 | 0 | 8 | 4 | 11 |  |
| 3 | Advanced Capital Budgeting Decisions | 3.4 | 90.4 | 22 | 8 | 5 | 12 | 9 |  |
| 15 | Startup Finance | 3.3 | 93.7 | 32 | 0 | 7 | 7 | 20 |  |
| 4 | Security Analysis | 3.2 | 96.9 | 26 | 2 | 5 | 9 | 9 |  |
| 7 | Securitization | 3.1 | 100.0 | 28 | 0 | 7 | 12 | 10 |  |
AFM note: MTP Series I Nov 2025 gave no readable questions and adds nothing to the MTP counts.
