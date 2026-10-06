# Writing standards

The user reads this to score marks, so it must teach, not merely summarise: "teach me like a kid, but
exam-oriented". The ch 19 build is the bar.

## Question facts (`q`)
- Keep ICAI's facts and names; trim only padding. Keep every number the answer uses.
- One `<p>` per paragraph. End with the ICAI ask ("Comment.", "Advise.", "Compute …").

## Model answers (`a`)
- Use the subject's structure (subjects.md) with bold labels, e.g. `<strong>Provision:</strong>`.
- Name the exact provision the way the examiner wants it cited ("Clause (7) of Part I of the Second
  Schedule", "para 56 of Ind AS 115").
- Analysis: apply each ingredient to a specific fact. One fact, one reason.
- Conclusion: a clear verdict / figure / advice, repeating the provision.
- Where ICAI's answer is based on law that has since changed: keep ICAI's answer, then add
  `<p><strong>Update for <attempt>:</strong> …</p>` and use kind `upd` if the verdict itself changes.
- Numerical: HTML tables for workings, units in headers, final answer in bold.

## Traps (`trap`)
The single most likely wrong answer and why it's wrong. Skip ('') rather than pad.

## MCQs
Four options as ICAI set them. `why` explains the right option and knocks out the most tempting wrong one.

## Provisions
- `law`: the operative rule, quoted or tightly paraphrased from the SM. Bold the words that decide cases.
- `notes`: 3–10 bullets: ingredients, exceptions, examples from the SM, related case law, and xref links
  to connected provisions.
- `mem`: only a genuinely useful hook (acronym, contrast pair).

## Flip cards
- `front` is a question you can answer from memory, not a heading ("What are the 6 disabilities under s.8?").
- Types: `clause`/`section` (with `bareText`), `concept`, `illustration` (SM example in brief), `mnemonic`,
  `case` (case law).
- Cover every provision at least once; High-priority provisions get 2–4 cards from different angles
  (rule, exception, trap, example).

## Written practice
From the highest-priority real questions. `modelAnswer` in plain text with line breaks, in the subject's
structure; `markingPoints` are what an examiner ticks (4–6 points), matching the marks.

## Formula bank
- Families, not lists: start each family from the master idea and show how every other formula falls out of it.
- Every formula has an exam `cue`: the words a question uses that call for it (e.g. "NAV after a dividend", "Sharpe ratio"). Its flip card asks for the formula name from that cue.
- `logic` is for a child: a concrete picture (pizza slices for NAV, a toll road for loads, runners on a hill for risk-adjusted return),
  then one sentence linking it back to the symbols.
- `derive` shows the algebra in one or two steps, naming the parent.
- `example` uses a real SM/ICAI figure and names its source; `trap` is the mistake ICAI's answers punish.
- Keep ICAI's conventions (simple annualisation, n − 1 in tracking error, rounding NAV only at the end) and say where ICAI accepts an alternative.

## Beyond the SM
- Add only concepts that follow from the chapter's ideas and could be asked as concept-based questions.
- Label them in the provision text ("Beyond the SM…"), with `beyond: true` on formulas, and use kind `app` for their questions.
- Explain concepts, not current regulatory numbers; where a figure matters, say it must be checked against the latest SEBI/ICAI document.

## Style
Plain English, short sentences, Indian number formatting (₹1,00,000; 5 lakh; 2 crore), dates as ICAI writes them
(1.4.2026). No emojis except section `emoji`.
