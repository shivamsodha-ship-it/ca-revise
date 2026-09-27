# CA Revise · Ss

Active-recall revision app for CA Final Group 1 (FR · AFM · AAA), Nov 2026 attempt.

The philosophy: reading a chapter three times ≠ knowing it. This app forces **retrieval** (flip cards)
and **production** (typed answers), scheduled by SM-2 spaced repetition.

## Stack

- **Next.js 14** (App Router, TypeScript) — deploys to **Vercel**
- **Tailwind CSS** with handwritten fonts (Kalam / Caveat / Shadows Into Light)
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

## Adding a new chapter (30 seconds)

1. Copy `data/aaa/ch19-professional-ethics.json` as a template.
2. Save it under the correct subject folder:
   - `data/aaa/<slug>.json`, `data/fr/<slug>.json`, or `data/afm/<slug>.json`.
3. Update the `id`, `subject`, `number`, `title`, `summary` and content.
4. Register it in `lib/registry.ts`:
   ```ts
   {
     id: 'aaa-ch18',
     subject: 'aaa',
     number: 18,
     title: 'Audit Reports',
     summary: 'SA 700/705/706 · CARO 2020 · Sec 143 CA 2013',
     loader: async () => (await import('../data/aaa/ch18-audit-reports.json')).default as unknown as Chapter,
   },
   ```
5. `npm run dev` → the chapter appears immediately. Commit + push → Vercel redeploys.

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

## The three modes

- **📖 Read Notes** — section-by-section, tap a card to expand its bare text, plain words, exceptions, traps, cases and cross-refs. Use as a first pass.
- **🎴 Flip Cards** — active recall. Front = prompt, tap to reveal, then rate **Again / Hard / Good / Easy**. The SM-2 scheduler queues cards on their next-due date. Filter by section or "Due today".
- **✍️ Practice** — type your answer using the 4-step template (Cite → Rule + Regulation → Apply → Conclude). Reveal the model answer and marking points; tick what you covered; mark **Wrong / Partial / Correct** to log the attempt.

## Roadmap

- [ ] **Phase 2 — Railway backend** (FastAPI + Postgres): sync progress across devices, historical charts, weak-clause radar.
- [ ] **Claude API grader** for the Practice mode — rubric-based scoring of your typed answer against the marking points.
- [ ] **Visual advertisements** — chapter-summary infographics generated with Claude to keep on the phone.
- [ ] **All chapters** — full FR / AFM / AAA syllabus, one JSON file at a time.

## Attribution

Built for personal revision — Ss (shivam.sodha@gmail.com). Not for redistribution.
