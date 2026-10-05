# CA Revise · Ss

Active-recall revision app for CA Final Group 1 (FR · AFM · AAA), Nov 2026 attempt.

Each chapter is a casebook: rule on real cases, hunt the clause, sprint through MCQs, then read the law.
Handwritten notes, SM-2 flip cards and typed practice sit alongside.

## Stack

- **Next.js 14** (App Router, TypeScript) — deploys to **Vercel**
- Plain CSS design system (`app/globals.css`) from the Ethics Casebook artifact: Bricolage Grotesque, Public Sans, IBM Plex Mono, Special Elite. Light and dark themes, flat hairline surfaces, 44px tap targets, phone bottom bar.
- Handwritten fonts (Kalam / Caveat / Shadows Into Light) are used **only** in the Notes view (scoped under `.hand`).
- **localStorage** for progress (v0.1 — no backend needed)
- Phase 2: **Railway** (Postgres + FastAPI) for cross-device sync and **Claude API** for grading typed answers

## Local dev

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Deploy to Vercel

1. Push this folder to a fresh GitHub repo:
   ```bash
   git init -b main
   git add .
   git commit -m "ca-revise: v0.1 with AAA Ch 19"
   git remote add origin git@github.com:<you>/ca-revise.git
   git push -u origin main
   ```
2. On [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. Framework: **Next.js** (auto-detected). No env vars needed for v0.1.
4. Click **Deploy**. First deploy takes ~90 seconds.
5. On your phone: open the deployed URL → **Add to Home Screen** (Safari share menu / Chrome menu). Behaves like a native app.

## Adding a chapter (any subject)

Chapters are data only. No component changes are needed.

```bash
npm run new-chapter -- fr 3 "Ind AS 115 Revenue" --casebook
```

This creates `data/fr/ch03-ind-as-115-revenue.json` (notes, flip cards, written practice) and,
with `--casebook`, `data/fr/ch03-casebook.json` (case drill, provision hunt, MCQs, law library, cheat sheet),
then registers the chapter in `lib/registry.ts`. Fill in the JSON and it appears on the home page.

Everything chapter-specific lives in the casebook's `meta` block:

| key | what it controls | example |
|---|---|---|
| `sources` | drill filter pills, `[kind, label]` | `[["rtp","RTP Nov 2026"]]` |
| `verdicts` | ruling buttons and stamps; omit for reveal-and-self-mark | `[{"label":"Guilty","tone":"bad","hint":"misconduct"}]` |
| `caseNoun` / `provisionNoun` | wording across the app | `"case"` / `"clause"`, `"question"` / `"standard"` |
| `huntQuestion` | Provision Hunt prompt | |
| `tagline` / `intro` | chapter home headline (`*word*` is highlighted; `{cases}` is the case count) | |
| `scopeTitle` / `scopeNote` / `methodTitle` | home page section headings | |

Provisions with `"hunt": true` are the answer options in Provision Hunt (all provisions if none are flagged).

A casebook may also carry `formulas` (a formula bank: families led by a master formula, each formula with its logic,
derivation, exam cue and trap). It adds a **Formulas** tab to the chapter and feeds the subject-wide bank at `/<subject>/formulas`.
Every AFM chapter has one.
See `data/_CASEBOOK_TEMPLATE.json` for the full shape.

## Building a chapter from the study material (Claude Code skill)

Drop the ICAI study-material PDF in `inbox/` and ask Claude Code, for example:
"add FR chapter 3, SM is inbox/fr-ch3.pdf". The `ca-chapter` skill (`.claude/skills/ca-chapter/`) runs the
same steps every time: extract every illustration and TYK question, verify the attempt's amendments,
collect RTP / MTP / past-paper questions from the ICAI BoS portal, rank topics by exam frequency, write
both data files, validate and build. Its research report lands in `research/<chapter-id>.md`.

The programs it uses can also be run by hand:

```bash
npm run unlock-pdf                                  # inbox/*.pdf -> inbox/unlocked/ (removes copy restrictions)
npm run extract-sm -- inbox/unlocked/sm.pdf work/fr-ch03/sm   # text + inventory of illustrations / TYK
npm run assemble -- fr-ch03                          # work/fr-ch03/parts/*.json -> data files
npm run validate -- fr-ch03                          # schema, links, source labels, coverage
```

## Chapter JSON schema

```jsonc
{
  "id": "aaa-ch19",             // unique across all chapters
  "subject": "aaa",              // "aaa" | "fr" | "afm"
  "number": 19,                  // ICAI SM chapter number
  "title": "Professional Ethics",
  "summary": "...",              // one line for the list
  "currency": "...",             // optional — Nov 2026 flag
  "sections": [
    {
      "id": "sch1-part1",
      "title": "First Schedule Part I",
      "emoji": "📙",
      "cards": [
        {
          "id": "s1p1c11",
          "type": "clause",       // clause | concept | illustration | mnemonic | section | case
          "tags": ["Cl 11", "Reg 190A"],
          "front": "Cl 11 — Other business or occupation",
          "back": {
            "bareText": "engages in any business or occupation…",
            "simplified": "Cannot engage in any business…",
            "exception": "General list…",
            "explanation": "…",
            "trap": "25-hour cap…",
            "cases": ["Nov 2023: Editor 'Company Audit' → NOT GUILTY"],
            "cross": ["Reg 190A", "Sec 2(2)(iv)"]
          }
        }
      ]
    }
  ],
  "practice": [
    {
      "id": "q-cl11-editor",
      "prompt": "CA X becomes the editor of a professional journal…",
      "clauseRef": "Cl 11 Part I 1st Sch",
      "hints": ["Reg 190A general list…"],
      "modelAnswer": "Step 1 — CITE: …\nStep 2 — RULE: …\nStep 3 — APPLY: …\nStep 4 — CONCLUDE: …",
      "markingPoints": ["Cites Clause 11", "Refs Reg 190A", "Concludes: not guilty"]
    }
  ]
}
```

## Modes (per chapter)

Casebook modes — available when the chapter registers a `casebook` JSON (see `data/aaa/ch19-casebook.json`, shape in `lib/casebook.ts`):

- **Home** — coverage ring, accuracy, best streak, weak clauses (<60%), RTP scope rail, ICAI 4-step answer method.
- **Case Drill** — read the facts, rule Guilty / Not guilty / Partly, get stamped, read the model answer and examiner's trap. Filter by source (RTP, SM Illustrations, SM TYK, exam pattern, Code 2026) and New / Missed.
- **Clause Hunt** — 10 rounds: which provision do the facts trigger?
- **MCQ Sprint** — shuffled MCQs with instant feedback.
- **Law Library** — every provision as a tile; tap for the law, notes, updates, memory hook and linked questions.
- **Cheat Sheet** — numbers table and facts → clause finder.

Core modes — every chapter (from the chapter JSON):

- **Notes** — handwritten, lined-paper notes, section by section.
- **Flip Cards** — SM-2 spaced repetition (Again / Hard / Good / Easy).
- **Practice** — type the full answer, reveal the model answer and marking points, self-mark.

## Roadmap

- [ ] **Phase 2 — Railway backend** (FastAPI + Postgres): sync progress across devices, historical charts, weak-clause radar.
- [ ] **Claude API grader** for the Practice mode — rubric-based scoring of your typed answer against the marking points.
- [ ] **Visual advertisements** — chapter-summary infographics generated with Claude to keep on the phone.
- [ ] **All chapters** — full FR / AFM / AAA syllabus, one JSON file at a time.

## Attribution

Built for personal revision — Ss (shivam.sodha@gmail.com). Not for redistribution.
