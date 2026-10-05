# Sources, labelling and priority

## Where ICAI publishes (BoS Knowledge Portal, checked Sept 2026)

| What | URL |
|---|---|
| Portal home | https://www.icai.org/post/bos-knowledge-portal |
| Study material, Final (new scheme) | https://boslive.icai.org/study_material_new_paper_details.php?c=final&language=English |
| AAA study material modules (example) | https://boslive.icai.org/sm_module.php?module=101 |
| Revision Test Papers | https://boslive.icai.org/education_content_rtp.php |
| Question papers, new scheme | https://boslive.icai.org/education_content.php?p=Question+Papers+New+Scheme |
| Question papers (older) | https://boslive.icai.org/education_content.php?p=Question+Papers |
| Suggested answers, Final | https://boslive.icai.org/education_content.php?p=Previous+Year+Suggested+Answers&c=final |
| Announcements (applicability of SM / standards for an attempt) | https://boslive.icai.org/announcement_details.php?id=… (search "study material applicable for Final Course <attempt>") |

MTPs are listed on the same portal under "Mock Test Papers" for each attempt; search the portal
(WebSearch with `allowed_domains: ["icai.org"]`) for "MTP <subject> <attempt>" if the menu URL has moved.
URLs change between attempts: if one 404s, search `icai.org` rather than guessing a path.

Only ICAI papers count as a source for questions and answers. Coaching sites may help you *find* a paper, never
supply what it says.

**MTPs, and anything boslive blocks** (boslive.icai.org returns 403 from Codespaces): use the index at
https://www.vsijaipur.com/ca-final-papers/ (the user's pointer). It links ICAI's own PDFs on resource.cdn.icai.org
(RTPs, question papers, suggested answers) and has Google Drive copies of ICAI MTPs for recent attempts. To download
a Drive file: `curl -sL -o f.pdf "https://drive.google.com/uc?export=download&id=<FILE_ID>"`. Use a third-party copy
only after checking it is ICAI's paper: ICAI format and header ("Mock Test Paper - Series I/II"), the correct paper
and attempt, and a paper date matching ICAI's BoS MTP schedule. Record both the copy's URL and that check in the
research report. If a row has no link yet, list it under "Could not fetch".

Lessons from the AFM Ch 8 sweep (details in references/afm.md):
- Suggested-answer PDFs contain the full question paper; use them as the PYQ source.
- Dead ICAI CDN links: try the Wayback Machine snapshot of the exact ICAI URL and record both.
- The vsijaipur index has mislabelled links; verify every file's header, series, paper, attempt and date.
- ICAI publishes only answer keys for MCQ case scenarios; the working is ours and is labelled so.
- No CA Final exam in Sep 2026 (moved to Nov 2026); check ICAI's exam notices before listing an attempt as missing.

Fetching: PDFs usually download with `curl -L -o work/<id>/src/<name>.pdf "<url>"`. If you get HTML or a
login page instead of a PDF (`file` says HTML), record it under "Could not fetch" in `research/<id>.md` and
ask the user to download it into `inbox/`.

## Labels (`src`) — the validator checks the attempt is present for rtp/mtp/pyq

| kind | `src` format | example |
|---|---|---|
| sm-ill | SM Illustration n | SM Illustration 12 |
| sm-tyk | SM TYK n / SM TYK MCQ n | SM TYK 4 |
| rtp | RTP <attempt> · Q n[(part)] | RTP Nov 2026 · Q3(b) |
| mtp | MTP <attempt> <series> · Q n | MTP Sep 2026 S-I · Q5(a) |
| pyq | PYQ <attempt> · Q n(part) · m marks | PYQ May 2025 · Q4(b) · 4 marks |
| upd | Law changed · <what> | Law changed · Code of Ethics 2026 |
| app | Exam-style (app-written) | Exam-style (app-written) |
| mcq | its origin, as above | RTP Nov 2026 · MCQ 2 |

A question asked in several papers: one entry, `src` names the most recent, and the model answer ends
with "Also asked: PYQ Nov 2023 Q1(a); MTP Mar 2025 S-II Q2." Count every appearance in the priority analysis.

## Priority rules (per topic cluster)

Score over the whole 5-year sweep = (PYQs × 2) + (RTP and MTP appearances) + (1 if in the latest RTP).
Count every appearance, including repeats recorded under "Also asked".

- **High**: score ≥ 5.
- **Medium**: score 2–4.
- **Low**: score 0–1.

Put the priority in each flip card's `tags` and in the research report's table. Chapter `weight`
= average marks this chapter carried per exam attempt in the sweep (rounded).
