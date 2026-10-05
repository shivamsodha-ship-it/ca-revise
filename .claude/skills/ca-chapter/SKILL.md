---
name: ca-chapter
description: Build or update one CA Final chapter in the ca-revise app (FR, AFM or AAA) from the ICAI study material PDF — extracts every illustration and TYK question, researches the chapter's RTP, MTP and past-paper questions on the ICAI BoS portal, ranks topics by exam frequency, and writes the notes, flip cards, written practice, case drill, provision hunt, MCQs, law library, cheat sheet and formula bank data (plus app-written questions so no topic is untested), then validates and builds. Use whenever the user gives a chapter (and usually a study-material PDF) to add, redo or refresh in the revision app, e.g. "add FR chapter 3, SM is in inbox/", "do AFM ch 5", "update AAA ch 19 for the May 2027 RTP".
---

# CA chapter builder

Turns one ICAI study-material chapter into the two data files the app renders. Same steps every time, so
every chapter gets the depth of AAA Chapter 19 (the reference build: `data/aaa/ch19-*.json`).
**AFM chapters**: read `references/afm.md` first; the AFM reference build is Ch 8 Mutual Funds (`data/afm/ch08-*.json`).

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
3a. **No topic left untested.** ICAI now sets concept-based and "untouched topic" questions, and the user revises from
   this app alone. Every provision must be tested by at least one question: where ICAI has never examined a topic, write
   an app question (kind `app`) and app MCQs for it. Add a "Beyond the SM" group (key `H`) for closely related concepts
   ICAI could ask (e.g. Jensen/M²/information ratio, SIP maths), each marked as beyond the SM. Never invent regulatory
   numbers for these: explain the concept and say the figure must be checked.
3b. **Formula bank for every numerical chapter** (all AFM chapters; FR/AAA chapters with computations). See step 7, item 6.
3c. **Recompute every number** you copy from a PDF or write yourself: PDF text layers garble fractions and can reverse digits.
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

### 2. Unlock the PDFs
ICAI PDFs are usually copy/print-restricted, which can break text extraction. Unlock every PDF in `inbox/` first:
```bash
npm run unlock-pdf                      # all PDFs in inbox/ -> inbox/unlocked/<same name>.pdf
```
Use only the copies in `inbox/unlocked/` from here on. Originals are never modified.
- `LOCKED … needs its open password`: ask the user for it, then
  `PDF_PASSWORD='…' npm run unlock-pdf -- "inbox/<file>.pdf"`. Never guess or crack a password.
- Pages reported with little or no text are scanned images: read those pages visually in step 3.
- **Never delete, move or overwrite anything in `inbox/`.** Those are the user's files and are not in git.
  Test files go in `work/` or a temp folder, never in `inbox/`.

### 3. Extract and read the study material
```bash
npm run extract-sm -- "inbox/unlocked/<sm>.pdf" work/<id>/sm
```
Read `work/<id>/sm/inventory.md`, then read **all** of `work/<id>/sm/sm.txt` in chunks (Read with offset/limit).
Pages flagged as empty are probably scanned: read those pages of the PDF directly (Read with `pages`).
Correct the inventory by hand where the regex missed or double-counted, and write
`work/<id>/sm/checklist.md`: every heading, every Illustration (number, page, one-line gist),
every TYK question (MCQ n, descriptive n), every case study. This is the coverage checklist for step 7.

### 4. Verify currency (target attempt)
From the ICAI BoS portal (references/sources.md): the study material edition applicable to the attempt,
the "applicable standards / amendments" announcement for the attempt, and the latest RTP's statutory
update section. Note every change that touches this chapter in `work/<id>/currency.md`, with URLs.
These become the chapter's `currency` line, `upd` notes on provisions, `upd` questions, and `changes`.

### 5. Collect exam questions for this chapter
Follow references/sources.md. Sweep **every attempt in the last 5 years, and nothing older** (RTPs, all MTP series,
past papers with suggested answers; old-scheme papers within those 5 years count when the topic is unchanged).
A paper that can't be fetched goes under "Could not fetch" and you move on. Depth must match the reference build
(AAA Ch 19); a sweep of only the last few attempts is not enough.

Download each paper to `work/<id>/src/` (curl, or the web-fetch agent for pages). If a paper can't be
fetched (login wall, blocked), list it under "Could not fetch" and ask the user to drop the PDF in
`inbox/` — do not guess its contents. Extract text with `npm run extract-sm -- <pdf> work/<id>/src/<name>` (run `npm run unlock-pdf -- <pdf>` first if extraction fails or it is encrypted).

Record every chapter-relevant question in `work/<id>/found.md` as one row:
`kind | attempt | Q no. | marks | topic/provision | one-line gist | url`.
Questions can be spread across papers in many sub-parts; capture each sub-part that belongs to this chapter.
Parallelise: run one background subagent per paper type (RTP / MTP / PYQ + currency), each writing `work/<id>/found-<type>.md`
in the layout in references/afm.md ("Found-file layout"), with the full question text and ICAI's full answer for every item and an
"SM repeat" note. Give each agent the chapter's TYK list so it can flag repeats. While they run, do steps 7.1, the SM questions,
the formula bank and the notes. Convert their files with `scripts/found2html.py`.

### 6. Exam-priority analysis
After the questions are written and assembled, run `npm run priority -- <id> --latest "<latest RTP attempt>"`: it scores every
provision from the questions and their "Also asked" lines (rules in references/sources.md), prints the table with past-paper marks,
and writes `work/<id>/priority.json` for the flip-card tags.
Write `research/<id>.md` (committed): sources swept, what couldn't be fetched, the priority table,
chapter weight (average marks per attempt → `weight` in chapter.json), and the coverage summary from step 10.

### 7. Write the data as part files
Write into `work/<id>/parts/` in batches (files named so they sort in order: `questions-01-sm-ill.json`,
`questions-02-sm-tyk.json`, ...). Shapes and every field: references/schema.md. Wording and answer standards:
references/writing.md. Subject-specific `meta` (verdicts, nouns, answer style): references/subjects.md.

Order of work:
1. `groups.json` + `provisions-*.json` — the law library, built from the SM headings. One provision per
   testable rule (clause, Ind AS paragraph cluster, SA requirement, formula/model). Mark `hunt: true` on
   provisions a fact pattern can point to. Add a scope/updates provision if step 4 found changes.
2. `questions-*.json` in this order: `sm-ill` (every illustration), `sm-tyk` (every descriptive TYK),
   `mcq` (every TYK MCQ, then RTP/MTP/PYQ MCQs with their source in `src`), `rtp`, `mtp`, `pyq`,
   `upd` (questions whose answer changed with the law), then `app`: for every provision with no question (rule 3a),
   for high-priority provisions with fewer than 2, and for group H. Word-for-word repeats of an SM question are not
   new questions: add them as "Also asked (ICAI): …" on the SM question (references/afm.md, "Repeats").
3. `extras.json` — `numbers` (every limit, threshold, time period, rate in the chapter), `finder`
   (fact trigger → provision), `method` (the answer-writing steps for this subject), `changes` (from step 4).
4. `meta.json` from references/subjects.md.
5. `chapter.json`, `sections-*.json` (notes and flip cards; sections mirror SM headings; High-priority
   topics get the most cards; add a "Beyond the study material" section for group H), `practice-*.json` (at least 8 written questions, taken from the
   highest-priority PYQ/RTP/MTP questions, with ICAI-style model answers and marking points).
6. `formulas-*.json` — the **formula bank** (shape in references/schema.md, standards in references/writing.md).
   Group formulas into families, each led by one **master formula** that the others are derived from (e.g. NAV → units issued,
   NAV after dividend; reward-to-risk → Sharpe, Treynor → β = Sharpe × σ ÷ Treynor). Every formula: plain-words logic a child
   could follow, how it is derived from its parent (`from` + `derive`), exam cue, trap, a worked example from the SM/ICAI
   paper, and its provision `p`. Cover every formula used in any SM/ICAI answer of the chapter; mark app additions `beyond`.
   The validator warns when a provision with numerical questions has no formula. The subject-wide bank at `/<subject>/formulas`
   picks it up automatically.

### 8. Assemble and validate
```bash
npm run assemble -- <id>      # writes data/<subject>/…json; rebuilds every provision's qs from question links
npm run validate -- <id>      # must end "OK: 0 errors"
```
Fix every error. Read every warning; fix the ones that are real (untested provisions, unbalanced HTML,
missing MCQ explanations). Tick off `checklist.md`: every illustration and TYK item must map to a question id.

### 9. Build and look at it
```bash
npm run build
```
Then run the app (`npx next start -p 3100`) and click through the chapter's Home, Drill (answer two
questions), Hunt, MCQ, Library (open a provision), Cheat sheet, Formulas (open a formula; check `/<subject>/formulas`), Notes and Flip at phone width
(390px) and desktop width. Nothing chapter-specific should need a code change.
Headless check (no browser in the Codespace): `pip install playwright && python3 -m playwright install chromium`, then a short
script that loads each view at 390×844 and 1280×900, saves screenshots **to the scratchpad (never the repo root)**, records
console errors and checks `document.documentElement.scrollWidth` equals the viewport width. Restart `next start` after every
rebuild (a stale server serves old chunks → 400 errors). Stop the server with `ps … | grep next-server` in its own command,
never in the same command line as `next start` (the pattern would match and kill your own shell).

### 10. Report and hand over
Finish `research/<id>.md` with the coverage table:

| | In source | In app |
|---|---|---|
| SM illustrations | n | n |
| SM TYK (MCQ / descriptive) | n / n | n / n |
| RTP / MTP / PYQ questions found | n / n / n | n / n / n |
| App-written (exam-style) | – | n |
| Formula bank (families / formulas) | – | n / n |

Tell the user: the counts, the top High-priority topics, anything that couldn't be fetched or verified,
and any place where ICAI's answer conflicts with the current law. **Ask before committing or deploying.**
When they say yes: commit (`data/`, `lib/registry.ts`, `research/<id>.md`, and any skill/script changes), push, and Vercel deploys.
In this Codespace, push with the user's gh login:
`env -u GITHUB_TOKEN git -c credential.helper= -c credential.helper='!env -u GITHUB_TOKEN gh auth git-credential' push`

## Updating a chapter (new RTP/MTP, new attempt, amendments)

1. Split the current data into parts so you edit rather than rewrite:
   run the snippet in references/schema.md ("Split existing data into parts").
2. Redo steps 4–6 for the new attempt only; add the new questions as new part files; update `upd`
   notes, `numbers`, `changes`, `currency`.
3. Steps 8–10. In the report, list what changed since the previous version.

## Files

- `references/schema.md` — every field of both data files, id conventions, the split snippet.
- `references/sources.md` — ICAI BoS URLs, how to find each paper type, labelling rules, priority rules.
- `references/subjects.md` — per-subject `meta`, answer structure and what counts as a provision.
- `references/writing.md` — how to write facts, model answers, traps, cards, MCQ explanations, formula bank, beyond-SM content.
- `references/afm.md` — AFM playbook: SM quirks, source lessons, agent found-file layout, repeats, build pattern, formula families per chapter.
- Programs (in the app repo): `scripts/new-chapter.mjs`, `scripts/unlock-pdf.py`, `scripts/extract-sm.py`,
  `scripts/assemble-chapter.mjs`, `scripts/validate-chapter.mjs` (npm scripts: `new-chapter`, `unlock-pdf`,
  `extract-sm`, `assemble`, `validate`), `scripts/found2html.py` (agent found-files → HTML) and `scripts/priority.py`
  (`npm run priority -- <id> --latest "Nov 2026"`).
