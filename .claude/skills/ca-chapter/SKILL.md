---
name: ca-chapter
description: Build or update one CA Final chapter in the ca-revise app (FR, AFM or AAA) from the ICAI study material PDF — extracts every illustration and TYK question, researches the chapter's RTP, MTP and past-paper questions on the ICAI BoS portal, ranks topics by exam frequency, and writes the notes, flip cards, written practice, case drill, provision hunt, MCQs, law library and cheat sheet data, then validates and builds. Use whenever the user gives a chapter (and usually a study-material PDF) to add, redo or refresh in the revision app, e.g. "add FR chapter 3, SM is in inbox/", "do AFM ch 5", "update AAA ch 19 for the May 2027 RTP".
---

# CA chapter builder

Turns one ICAI study-material chapter into the two data files the app renders. Same steps every time, so
every chapter gets the depth of AAA Chapter 19 (the reference build: `data/aaa/ch19-*.json`).

The user only provides: **subject, chapter number, and the study-material PDF**. Everything else is
this skill's job. Work in `ca-revise/` (the Next.js app). All scratch goes in `work/<id>/` (git-ignored).

Before building anything, read the design contract in memory (the Ethics Casebook artifact) only if you
are about to touch components. This skill writes **data only**. If a chapter seems to need a component
change, stop and tell the user instead: per-chapter differences belong in the casebook `meta`.

## Non-negotiables

1. **No invented sources.** A question is `pyq`, `rtp` or `mtp` only if you found it in that ICAI paper,
   and its `src` names the attempt and question number ("PYQ Nov 2025 · Q2(a)"). Anything you write
   yourself in exam style is kind `app` ("Exam-style (app-written)"). The validator enforces the label format;
   honesty about origin is on you.
2. **Answers follow ICAI.** Where an ICAI suggested answer, RTP or MTP solution exists, the model answer
   must reach the same conclusion and use its reasoning. If the law has changed since, keep ICAI's answer
   and add the update (see `upd` in references/schema.md) — never silently "correct" ICAI.
3. **Full coverage of the study material.** Every Illustration and every TYK question (MCQ and descriptive)
   in the chapter becomes a question. The extractor's inventory is the checklist.
4. **Verify currency against ICAI** for the target attempt (applicable standards / amendments / study
   material edition). Do not rely on memory for amendment dates, limits or thresholds.
5. **Cite as you go.** Every found paper goes into `work/<id>/sources.md` with its URL; the final research
   report is committed so the user can check any item.

## Inputs to confirm (ask only for what's missing)

- Subject (`aaa` | `fr` | `afm`), chapter number, chapter title as printed in the SM.
- Path to the SM PDF (default: look in `inbox/`). If the user put RTP/MTP/PYQ PDFs there too, use them first.
- Target attempt (default: the one in `lib/registry.ts` / existing chapters' `currency`, e.g. Nov 2026).
- New chapter or update of an existing one (check `lib/registry.ts`).

## Steps

Track these as tasks. Each step ends with a concrete artifact; don't move on without it.

### 1. Scaffold
```bash
npm run new-chapter -- <subject> <number> "<Title>" --casebook   # skip if the chapter already exists
mkdir -p work/<id>/{sm,src,parts}
```
The id is `<subject>-chNN` (e.g. `fr-ch03`). For an update, first copy the current data into part files
(see "Updating a chapter" below).

### 2. Extract and read the study material
```bash
npm run extract-sm -- <path/to/sm.pdf> work/<id>/sm
```
Read `work/<id>/sm/inventory.md`, then read **all** of `work/<id>/sm/sm.txt` in chunks (Read with offset/limit).
Pages flagged as empty are probably scanned: read those pages of the PDF directly (Read with `pages`).
Correct the inventory by hand where the regex missed or double-counted, and write
`work/<id>/sm/checklist.md`: every heading, every Illustration (number, page, one-line gist),
every TYK question (MCQ n, descriptive n), every case study. This is the coverage checklist for step 6.

### 3. Verify currency (target attempt)
From the ICAI BoS portal (references/sources.md): the study material edition applicable to the attempt,
the "applicable standards / amendments" announcement for the attempt, and the latest RTP's statutory
update section. Note every change that touches this chapter in `work/<id>/currency.md`, with URLs.
These become the chapter's `currency` line, `upd` notes on provisions, `upd` questions, and `changes`.

### 4. Collect exam questions for this chapter
Follow references/sources.md. Minimum sweep:
- **RTPs**: the target attempt and the previous 3 attempts.
- **MTPs**: every series for the target attempt and the previous 2 attempts.
- **Past papers + ICAI suggested answers**: every new-scheme attempt (May 2024 onward), plus old-scheme
  papers from the last 3 years when the topic is unchanged in the new syllabus.

Download each paper to `work/<id>/src/` (curl, or the web-fetch agent for pages). If a paper can't be
fetched (login wall, blocked), list it under "Could not fetch" and ask the user to drop the PDF in
`inbox/` — do not guess its contents. Extract text with `npm run extract-sm -- <pdf> work/<id>/src/<name>`.

Record every chapter-relevant question in `work/<id>/found.md` as one row:
`kind | attempt | Q no. | marks | topic/provision | one-line gist | url`.
Questions can be spread across papers in many sub-parts; capture each sub-part that belongs to this chapter.
Parallelise when useful: one subagent per paper type (RTP / MTP / PYQ), each returning rows in that format.

### 5. Exam-priority analysis
Group `found.md` rows by provision/topic. For each: times asked, total marks, last attempt asked,
and whether it appeared in the latest RTP/MTP. Rank **High / Medium / Low** (rules in references/sources.md).
Write `research/<id>.md` (committed): sources swept, what couldn't be fetched, the priority table,
chapter weight (average marks per attempt → `weight` in chapter.json), and the coverage summary from step 9.

### 6. Write the data as part files
Write into `work/<id>/parts/` in batches (files named so they sort in order: `questions-01-sm-ill.json`,
`questions-02-sm-tyk.json`, ...). Shapes and every field: references/schema.md. Wording and answer standards:
references/writing.md. Subject-specific `meta` (verdicts, nouns, answer style): references/subjects.md.

Order of work:
1. `groups.json` + `provisions-*.json` — the law library, built from the SM headings. One provision per
   testable rule (clause, Ind AS paragraph cluster, SA requirement, formula/model). Mark `hunt: true` on
   provisions a fact pattern can point to. Add a scope/updates provision if step 3 found changes.
2. `questions-*.json` in this order: `sm-ill` (every illustration), `sm-tyk` (every descriptive TYK),
   `mcq` (every TYK MCQ, then RTP/MTP/PYQ MCQs with their source in `src`), `rtp`, `mtp`, `pyq`,
   `upd` (questions whose answer changed with the law), then `app` only to fill gaps where a
   high-priority provision has fewer than 2 questions.
3. `extras.json` — `numbers` (every limit, threshold, time period, rate in the chapter), `finder`
   (fact trigger → provision), `method` (the answer-writing steps for this subject), `changes` (from step 3).
4. `meta.json` from references/subjects.md.
5. `chapter.json`, `sections-*.json` (notes and flip cards; sections mirror SM headings; High-priority
   topics get the most cards), `practice-*.json` (at least 8 written questions, taken from the
   highest-priority PYQ/RTP/MTP questions, with ICAI-style model answers and marking points).

### 7. Assemble and validate
```bash
npm run assemble -- <id>      # writes data/<subject>/…json; rebuilds every provision's qs from question links
npm run validate -- <id>      # must end "OK: 0 errors"
```
Fix every error. Read every warning; fix the ones that are real (untested provisions, unbalanced HTML,
missing MCQ explanations). Tick off `checklist.md`: every illustration and TYK item must map to a question id.

### 8. Build and look at it
```bash
npm run build
```
Then run the app (`npx next start -p 3100`) and click through the chapter's Home, Drill (answer two
questions), Hunt, MCQ, Library (open a provision), Cheat sheet, Notes and Flip at phone width
(390px) and desktop width. Nothing chapter-specific should need a code change.

### 9. Report and hand over
Finish `research/<id>.md` with the coverage table:

| | In source | In app |
|---|---|---|
| SM illustrations | n | n |
| SM TYK (MCQ / descriptive) | n / n | n / n |
| RTP / MTP / PYQ questions found | n / n / n | n / n / n |
| App-written (exam-style) | – | n |

Tell the user: the counts, the top High-priority topics, anything that couldn't be fetched or verified,
and any place where ICAI's answer conflicts with the current law. **Ask before committing or deploying.**
When they say yes: commit (`data/`, `lib/registry.ts`, `research/<id>.md`), push, and Vercel deploys.
In this Codespace, push with the user's gh login:
`env -u GITHUB_TOKEN git -c credential.helper= -c credential.helper='!env -u GITHUB_TOKEN gh auth git-credential' push`

## Updating a chapter (new RTP/MTP, new attempt, amendments)

1. Split the current data into parts so you edit rather than rewrite:
   run the snippet in references/schema.md ("Split existing data into parts").
2. Redo steps 3–5 for the new attempt only; add the new questions as new part files; update `upd`
   notes, `numbers`, `changes`, `currency`.
3. Steps 7–9. In the report, list what changed since the previous version.

## Files

- `references/schema.md` — every field of both data files, id conventions, the split snippet.
- `references/sources.md` — ICAI BoS URLs, how to find each paper type, labelling rules, priority rules.
- `references/subjects.md` — per-subject `meta`, answer structure and what counts as a provision.
- `references/writing.md` — how to write facts, model answers, traps, cards, MCQ explanations.
- Programs (in the app repo): `scripts/new-chapter.mjs`, `scripts/extract-sm.py`,
  `scripts/assemble-chapter.mjs`, `scripts/validate-chapter.mjs` (npm scripts: `new-chapter`,
  `extract-sm`, `assemble`, `validate`).
