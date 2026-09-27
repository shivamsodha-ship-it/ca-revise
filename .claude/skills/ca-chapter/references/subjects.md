# Subject profiles

Pick `meta` values from here. A chapter can deviate when its questions differ (e.g. an AAA
chapter that is all computations), but say why in `research/<id>.md`.

**Verdicts rule:** use verdict buttons only when at least 60% of the chapter's descriptive questions
end in a yes/no ruling. Otherwise omit `verdicts`; cases become reveal-and-self-mark.

## AAA — Advanced Auditing, Assurance & Professional Ethics

| Chapter type | caseNoun | provisionNoun | verdicts | huntQuestion |
|---|---|---|---|---|
| Professional Ethics | case | clause | Guilty (bad, misconduct) · Not guilty (good, no breach) · Partly (mixed, some yes, some no) | Which provision do these facts trigger? |
| SAs / audit reports / CARO / special audits | case | SA / section | Auditor right (good) · Auditor wrong (bad) · Partly (mixed) — only if the verdicts rule holds | Which SA or requirement decides this? |

Provisions: one per clause/Schedule item, SA requirement paragraph cluster, Companies Act section, CARO clause.
Model answer: **Provision → Analysis (facts against each ingredient) → Conclusion** (bold labels, as in ch 19).
`method`: the ICAI 3 steps + marks tips. `numbers`: limits, time periods, penalties, thresholds.

## FR — Financial Reporting

| caseNoun | provisionNoun | verdicts | huntQuestion |
|---|---|---|---|
| question | standard | usually omitted; use Correct treatment (good) · Incorrect (bad) · Partly (mixed) for "is the treatment correct?" chapters | Which Ind AS paragraph decides this? |

Provisions: one per Ind AS principle (paragraph cluster), e.g. "Ind AS 115.22–30 Performance obligations".
Label = "Ind AS <no>.<paras>". Keep numerical illustrations with the workings as HTML tables.
Model answer: **Relevant Ind AS paragraph → Analysis / working (table, journal entry) → Conclusion** with the amount.
`method`: identify the standard → quote the principle → work the numbers → journal entry / disclosure → conclude.
`numbers`: thresholds, rates, periods, bright lines (e.g. 12 months, 20% significant influence presumption).
`v` for numerical questions: "Numerical".

## AFM — Advanced Financial Management

| caseNoun | provisionNoun | verdicts | huntQuestion |
|---|---|---|---|
| problem | concept | omitted | Which model or technique does this problem need? |

Provisions: one per model/technique/formula (e.g. "Black–Scholes", "Interest rate parity", "APV").
`law` holds the formula(s) and when to use it; `notes` the assumptions, variants and common ICAI twists.
Model answer: **Working notes (tables) → Computation → Decision / advice** with the figure; `v`: "Numerical" or "Theory".
`numbers`: formulas and standard values (use `<em>` for variables). `finder`: problem cue → model
("given forward and spot, asked cover" → forward cover).
MCQs are the main theory practice; include every TYK/RTP/MTP MCQ.

## All subjects

- `title`: "<short topic> Casebook".
- `tagline`: default from caseNoun/verdicts is fine; AAA ethics uses "Rule on the case. *Then* read the law."
- `scopeTitle`: "Exam scope for <attempt>" when step 3 found changes; point `scopeNote` at a provision
  (group "Z. Updates") holding the full note.
