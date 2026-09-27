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

Only ICAI (icai.org, boslive.icai.org, resource.cdn.icai.org) counts as a source for questions and answers.
Coaching sites may help you *find* where a paper is, never what it says.

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

## Priority rules (per provision/topic)

Score = (times asked in PYQ over the sweep × 2) + (times in RTP/MTP of the last 2 attempts) + (1 if in the latest RTP).

- **High**: score ≥ 5, or asked in 2 of the last 4 exams, or a change for this attempt that the RTP highlights.
- **Medium**: score 2–4.
- **Low**: score 0–1.

Put the priority in each flip card's `tags` and in the research report's table. Chapter `weight`
= average marks this chapter carried per exam attempt in the sweep (rounded).
