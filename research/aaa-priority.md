# AAA: which chapters ICAI tests most (sweep for the Nov 2026 attempt)

Built 15 Oct 2026 for Paper 3 Advanced Auditing, Assurance and Professional Ethics. Sources, all ICAI papers (nothing from coaching sites): question papers with ICAI suggested answers for Nov 2022, May 2023, May 2024, Nov 2024, May 2025, Sep 2025, Jan 2026; RTPs May 2024 – May 2026 (5); MTPs Mar 2024 – Sep 2026 (11 series). 
Each file was checked by its own header (paper, series, attempt) before it was used; the vsijaipur index mislabels some MTP links, so the header decides.

**Method (app-written, approximate).** Every question (the text before a "(N Marks)" marker) is matched to the SM chapter whose own text it resembles most, using ICAI's chapter PDFs (TF-IDF cosine over words and word pairs; `scripts/rank-sweep.py`). *Share* = the chapter's marks in a paper as a percentage of all marks listed in that paper, averaged over the question papers. Papers list about 118 marks for a 100-mark paper because of internal choice, so the share is of marks asked, not of marks a student writes. *Desc* = descriptive marks across the question papers; *MCQ* = 2-mark MCQ marks, which the matcher classifies less reliably because the case scenario is not part of the question text. *QP* = number of question papers (of those fetched) with the chapter. *RTP/MTP* = questions matched.
This orders the build; it is not an ICAI marks count. A question that mixes chapters is counted once, under the closest. Treat shares within about 1 point as equal.

**Could not use:** the May 2026 question papers (scanned images, no text; no OCR here), the Nov 2023 question papers (Drive copies returned a web page, not a PDF), the May 2022 AAA paper (not on the index), and any MTP not on the index (the 11 series used run Mar 2024 to Sep 2026). MTP answer-only files were skipped.

| Ch | Chapter | Share of paper (%) | Cumulative (%) | Desc marks | MCQ marks | QP | RTP | MTP | In app |
|---|---|---|---|---|---|---|---|---|---|
| 19 | Professional Ethics & Liabilities of Auditors | 19.6 | 19.6 | 121 | 20 | 7 | 11 | 47 | built |
| 14 | Special Features of Audit of Banks & NBFCs | 10.8 | 30.4 | 56 | 24 | 7 | 16 | 14 | built |
| 7 | Reporting | 9.8 | 40.2 | 50 | 20 | 7 | 13 | 26 |  |
| 1 | Quality Control | 7.8 | 48.0 | 52 | 2 | 7 | 5 | 9 |  |
| 3 | Audit Planning, Strategy and Execution | 6.1 | 54.1 | 38 | 6 | 4 | 1 | 14 |  |
| 12 | Digital Auditing & Assurance | 5.6 | 59.7 | 37 | 4 | 7 | 9 | 12 |  |
| 13 | Group Audits | 4.7 | 64.4 | 27 | 8 | 6 | 4 | 5 |  |
| 17 | Due Diligence, Investigation & Forensic Accounting | 4.3 | 68.7 | 29 | 0 | 6 | 2 | 8 |  |
| 4 | Materiality, Risk Assessment and Internal Control | 4.0 | 72.7 | 24 | 4 | 4 | 3 | 10 |  |
| 2 | General Auditing Principles and Auditors Responsibilities | 3.6 | 76.3 | 24 | 4 | 5 | 4 | 5 |  |
| 5 | Audit Evidence | 3.6 | 79.9 | 20 | 6 | 5 | 4 | 24 |  |
| 18 | SDG & ESG Assurance | 3.5 | 83.4 | 21 | 6 | 5 | 14 | 11 |  |
| 10 | Review of Financial Information | 3.4 | 86.8 | 26 | 0 | 5 | 3 | 5 |  |
| 16 | Internal Audit | 3.2 | 90.0 | 19 | 4 | 5 | 4 | 8 |  |
| 8 | Specialised Areas | 2.5 | 92.5 | 19 | 0 | 4 | 3 | 4 |  |
| 6 | Completion and Review | 2.0 | 94.5 | 5 | 10 | 4 | 3 | 12 |  |
| 9 | Related Services | 1.9 | 96.4 | 14 | 0 | 3 | 3 | 1 |  |
| 15 | Overview of Audit of Public Sector Undertakings | 1.8 | 98.2 | 5 | 10 | 4 | 6 | 17 | built |
| 11 | Prospective Financial Information and Other Assurance Services | 1.6 | 99.8 | 13 | 0 | 3 | 3 | 5 |  |
AAA note: MTP Series I Nov 2025 and Mar 2026 gave no readable questions and add nothing to the MTP counts.
