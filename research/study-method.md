# How the app teaches a chapter: six stages, three kinds of subject

Every chapter follows one route. The home page of a chapter shows it as six cards with progress; the first unfinished card is marked "Next".

| # | Stage | What you do | App tools | Done when |
|---|---|---|---|---|
| 1 | **Vision** | See the whole chapter on one page before any detail | Vision: one-line summary, why it matters, the chapter map, 60-second version, how ICAI asks it, where marks are lost | You marked it read |
| 2 | **Learn** | Understand it in order, one idea at a time | Mastery path: lesson, picture table, "how it connects", recall check, "twist" | Every level cleared at 80% or more |
| 3 | **Revise** | Go through the source material in its own words | Notes, law library, flip cards (spaced repetition) | Cards seen and due cards cleared |
| 4 | **Memory** | Make the facts stick | Mnemonics round, number cards, pictures and stories | A round scored 80% or more |
| 5 | **Connect** | See how ideas relate, so confusing pairs stop being confusing | Compare table plus "which is which" sorter; Connections (contrast, same, leads to, across chapters) with a link-up quiz | Both quizzes scored 80% or more |
| 6 | **Master** | Apply under exam conditions, including twisted versions | Step solver, case drill, clause hunt, MCQs, games, written practice, one-line twists | Blended mastery score |

A scratch pad (Jot) is on every page so no step needs a notebook. Everything works offline once opened.

## Same route, different emphasis by subject

**AAA (theory and cases; occasional counting).** Marks come from recognising the right provision, applying each ingredient and concluding with the provision again.
- Vision: map by clause family; pitfalls are look-alike clauses and the figure to write for the attempt.
- Learn: one level per clause family; every level ends with a twist where one fact changes.
- Memory: mnemonics for lists and counts (I-O-C-C-P, SSAFI, D-C-C); number match-ups for limits.
- Connect: compare tables for look-alike regimes (First vs Second Schedule; bank vs NBFC; performance vs propriety audit); links such as "gateway clause" and "needs the previous step".
- Master: verdict drill, clause hunt, sorters ("which clause", "which forum", "as written or twisted"), counting solvers (audits held against the limit, fee ceilings, day counts).

**AFM (numerical; formulas that derive from a master).** Marks come from choosing the model, setting the working in order, and getting the final figure.
- Vision: map by sum type; pitfalls are the usual formula slips (n vs n − 1, face value vs NAV).
- Learn: each level states the master formula, how the others come from it, and the cue words in the question.
- Memory: formula-hook mnemonics; auto-generated "exam cue to formula" game from the formula bank.
- Connect: formula chains (Sharpe to beta to expected NAV), contrast pairs (Sharpe vs Treynor), cross-chapter links (Portfolio Management).
- Master: step solver with round numbers (no calculator) and twisted versions; recompute gate on every figure; beyond-the-SM concept questions; CFA-style questions for depth.

**FR (numerical plus standards plus journal entries).** Needs the study-material PDF to build; not yet in the app.
- Vision: map by recognition, measurement, presentation, disclosure for each standard.
- Learn: paragraph clusters as provisions; each level includes a journal-entry walk-through.
- Memory: mnemonics for the steps of each model (the five steps of revenue, lease classification tests, ECL stages).
- Connect: compare tables (Ind AS 115 vs 116; 109 stages 1/2/3), cross-subject links (Ind AS 109 credit loss with NBFC provisioning in AAA Ch 14; valuation with AFM).
- Master: step solver for schedules and computations, a journal-entry builder (planned game type), "which paragraph decides" hunt.

## The accuracy gate (every chapter, every time)

1. Build only from the study-material PDF and ICAI papers; label anything else "Beyond the SM" and "app-written".
2. `npm run validate -- <id>` must show 0 errors.
3. `node scripts/audit-accuracy.mjs <id>` must show 0 errors: it checks every MCQ key against its explanation, every typed-answer figure against the model answer, the numbers table against its provision, and that every figure in the mastery layer is stated in the casebook with the same unit.
4. Every solver figure is recomputed by code before the file is written (`node scripts/build-learn.mjs <id>`).
5. Every "VERIFY" line is checked by hand against ICAI's text and written into `research/accuracy-report.md` as verified, corrected or open.
