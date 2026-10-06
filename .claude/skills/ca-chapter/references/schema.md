# Data schema

Two files per chapter, both registered in `lib/registry.ts` (the `new-chapter` script does this).
Types live in `lib/types.ts` (notes) and `lib/casebook.ts` (casebook). The reference build is
`data/aaa/ch19-professional-ethics.json` + `data/aaa/ch19-casebook.json`; open it when unsure.

All HTML fields: plain `<p>`, `<strong>`, `<em>`, `<ul><li>`, `<table>` only. No classes except
provision links: `<a class="xref" href="#" data-p="PROVISION_ID">Label</a>` (opens the law drawer).

## 1. Notes file — `data/<subject>/chNN-<slug>.json`

Part files: `chapter.json`, `sections-*.json`, `practice-*.json`.

```jsonc
// chapter.json
{
  "id": "fr-ch03", "subject": "fr", "number": 3,
  "title": "Ind AS 115 Revenue from Contracts with Customers",   // as printed in the SM
  "summary": "5-step model · variable consideration · principal vs agent",  // one line, key topics
  "weight": 12,                    // average marks per attempt from the priority analysis
  "currency": "SM Sept 2025 ed. · Ind AS 115 amended …"         // one line: what's current for the attempt
}
// sections-*.json — array; one section per SM heading, in SM order
[{ "id": "s1-scope", "title": "Scope and definitions", "emoji": "📖",
   "cards": [{
     "id": "c-scope-exclusions",           // unique in the chapter, kebab-case, meaningful
     "type": "concept",                    // clause | concept | illustration | mnemonic | section | case
     "tags": ["Ind AS 115.5", "High"],     // provision label + priority (High/Medium/Low)
     "front": "Which contracts are outside Ind AS 115?",   // a question you can answer from memory
     "back": {
       "bareText": "Exact text of the standard/section (when type is clause/section)",
       "simplified": "Plain words, one or two sentences",
       "exception": "Exceptions / carve-outs",
       "explanation": "Why, and how it links to other provisions",
       "trap": "The mistake examiners reward you for avoiding",
       "cases": ["SM Illustration 4: …", "PYQ May 2025 Q1(b): …"],
       "cross": ["Ind AS 109", "Ind AS 116"]
     }
   }]
}]
// practice-*.json — written answers, self-marked
[{ "id": "p-nov25-q2a", "prompt": "Full question as ICAI set it",
   "clauseRef": "Ind AS 115.22–30", "hints": ["Pointer, not the answer"],
   "modelAnswer": "Plain text with \n line breaks, ICAI structure (see subjects.md)",
   "markingPoints": ["Cites the right paragraph", "Identifies 2 performance obligations", "Correct allocation ₹…", "Conclusion"] }]
```

## 2. Casebook — `data/<subject>/chNN-casebook.json`

Part files: `meta.json`, `groups.json`, `provisions-*.json`, `questions-*.json`, `extras.json`.

### meta.json
See subjects.md for values per subject.
```jsonc
{
  "title": "Revenue Casebook",
  "sources": [["sm-ill","SM Illustrations"],["sm-tyk","SM TYK"],["rtp","RTPs"],["mtp","MTPs"],["pyq","Past papers"],["upd","Law changed"],["app","Exam-style"]],
  "verdicts": [{"label":"Guilty","tone":"bad","hint":"misconduct"}],   // omit → reveal-and-self-mark
  "caseNoun": "case", "provisionNoun": "clause",
  "huntQuestion": "Which provision do these facts trigger?",
  "tagline": "Rule on the case. *Then* read the law.",   // *word* is highlighted
  "intro": "{cases} cases from the study material, RTPs, MTPs and past papers.",
  "scopeTitle": "Exam scope for Nov 2026", "scopeNote": "scope-2026",   // provision id with the full note
  "methodTitle": "Write it the ICAI way"
}
```
Only list source kinds that have at least one question. Keys are fixed across the app:
`sm-ill`, `sm-tyk`, `rtp`, `mtp`, `pyq`, `upd`, `app` (MCQs use kind `mcq`, not listed in sources).

### groups.json
`[["A","Scope and definitions"], ["B","Step 1 — Identify the contract"], …]` — Law Library sections, SM order.

### provisions-*.json
```jsonc
{
  "id": "ias115-var",               // stable, kebab-case; never reuse for a different rule
  "g": "C",                         // group key
  "label": "Ind AS 115.50–59",      // short code shown on chips/tiles (≤ 24 chars)
  "title": "Variable consideration and the constraint",
  "short": "Variable consideration",// tile subtitle / hunt option text (≤ 60 chars)
  "law": "<p>Operative text, quoted or closely paraphrased from the SM/standard</p>",
  "notes": ["<strong>Point</strong>: …", "…"],  // what you need to know; examples; links with xref
  "upd": "",                        // HTML: change for the attempt vs the SM ('' if none)
  "mem": "",                        // memory hook / mnemonic ('' if none)
  "hunt": true                      // can be an answer in Provision Hunt
  // "qs" is rebuilt by `npm run assemble` from question links — leave it out
}
```

### questions-*.json
```jsonc
{
  "id": "I4",               // prefixes: I = SM illustration, T = SM TYK, R = RTP, K = MTP, P = PYQ,
                            //           U = law-changed, E = app-written, M = MCQ, CS = case study
  "src": "PYQ Nov 2025 · Q2(a) · 4 marks",   // what the card shows; rtp/mtp/pyq MUST name the attempt
  "k": "pyq",
  "links": ["ias115-var", "ias115-alloc"],   // links[0] = the deciding provision (used by Hunt)
  "v": "Guilty",            // a meta.verdicts label, or "Theory"/"Numerical" for reveal-and-self-mark
  "q": "<p>Facts exactly as set (trim only irrelevant numbers)</p>",
  "a": "<p><strong>Provision:</strong> … </p><p><strong>Analysis:</strong> …</p><p><strong>Conclusion:</strong> …</p>",
  "trap": "<p>The wrong turn most students take</p>"   // '' if none
}
// MCQ: k "mcq", v "MCQ", plus
{ "opts": ["…","…","…","…"], "ans": 1, "why": "Why (b) is right and the tempting wrong option is wrong",
  "src": "RTP Nov 2026 · MCQ 3" /* or "SM TYK MCQ 5", "MTP Sep 2026 S-I · MCQ 2" */, "a": "<p><strong>Answer: (b)</strong> …</p>" }
```

### extras.json
```jsonc
{
  "numbers": [["Item", "Exam figure", "provision-id", false]],   // true = changed vs SM (highlighted)
  "finder":  [["Fact trigger in plain words", "provision-id"]],
  "method":  [["Step 1 — Provision", "HTML"], ["Step 2 — Analysis", "HTML"], ["Step 3 — Conclusion", "HTML"], ["Marks tips", "HTML"]],
  "changes": ["HTML: one scope/amendment point per item, with xref links"]
}
```

### formulas-*.json (formula bank)
An array of families. HTML fields may use `<em>`, `<sub>`, `<sup>`, `<strong>`, `<p>`, `<table>` and fractions as
`<span class="frac"><span>top</span><span>bottom</span></span>`.
```jsonc
[{
  "id": "f-risk", "title": "Performance: reward per unit of risk",
  "idea": "<p>Every ratio is extra return ÷ some risk …</p>",     // the one idea tying the family together
  "master": { "id": "risk-master", "name": "Reward-to-risk", "expr": "Score = <span class=\"frac\">…</span>",
              "logic": "<p>Plain-words why (child-level analogy)</p>", "p": "mf-eval-quant" },
  "items": [{
    "id": "beta-st", "name": "β from Sharpe and Treynor", "expr": "β = …",
    "vars": [["σ", "standard deviation of the fund"]],   // symbol (HTML), meaning
    "logic": "<p>Why it works</p>",
    "derive": "<p>Sharpe = E ÷ σ → E = Sharpe × σ; β = E ÷ Treynor</p>",
    "from": ["sharpe", "treynor"],          // parent formula ids (any family)
    "hook": "Memory hook", "cue": "Words in a question that call for it",
    "trap": "<p>The usual mistake</p>", "example": "<p>Worked mini-example with the source</p>",
    "p": "mf-beta-nav",                      // provision id
    "beyond": false                          // true = not in the SM
  }]
}]
```

### nums.json (final figures for numerical questions)
An object keyed by question id. Each value lists the figures the question asks for, in the order the answer gives them.
```jsonc
{ "<question id>": [["<label as the answer names it>", <final value>, "<unit>"], ["<next figure>", <value>, "%", <tolerance?>] ] }
```
`[label, value, unit, tolerance?]`. `assemble-chapter` merges it into the question's `nums`; `validate-chapter` errors when a
`Numerical` question has none.

## Split existing data into parts (for updates)

```bash
python3 - <<'E'
import json, os, sys
ID, NOTES, CB = 'aaa-ch19', 'data/aaa/ch19-professional-ethics.json', 'data/aaa/ch19-casebook.json'  # edit
W = f'work/{ID}/parts'; os.makedirs(W, exist_ok=True)
ch = json.load(open(NOTES)); cb = json.load(open(CB))
dump = lambda n, v: json.dump(v, open(f'{W}/{n}', 'w'), ensure_ascii=False, indent=1)
dump('chapter.json', {k: v for k, v in ch.items() if k not in ('sections', 'practice')})
dump('sections-01.json', ch['sections']); dump('practice-01.json', ch['practice'])
dump('meta.json', cb['meta']); dump('groups.json', cb['groups'])
dump('provisions-01.json', [{k: v for k, v in p.items() if k != 'qs'} for p in cb['P']])
kinds = ['sm-ill', 'sm-tyk', 'mcq', 'rtp', 'mtp', 'pyq', 'upd', 'app']
for i, k in enumerate(kinds, 1):
    qs = [q for q in cb['Q'] if q['k'] == k]
    if qs: dump(f'questions-{i:02d}-{k}.json', qs)
other = [q for q in cb['Q'] if q['k'] not in kinds]
if other: dump('questions-99-other.json', other)
dump('extras.json', {k: cb[k] for k in ('numbers', 'finder', 'method', 'changes')})
if cb.get('formulas'): dump('formulas-01.json', cb['formulas'])
print('parts written to', W)
E
```
`npm run assemble` then reproduces the files exactly (tested on AAA ch 19).
