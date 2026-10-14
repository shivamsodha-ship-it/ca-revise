# CA Revise: working notes for Claude

Revision app for CA Final Group 1 (FR, AFM, AAA). Next.js 14 (App Router, TypeScript), plain CSS in `app/globals.css`, MongoDB for accounts and sync, deployed on Vercel from `main`.

## Rules that matter most
- **Accuracy first.** Chapter content comes only from ICAI study material and papers. Anything else is labelled "Beyond the SM" or "app-written". Never invent a figure. Where ICAI's answer conflicts with arithmetic or current law, keep ICAI's text, add a clearly marked note, and record it in `research/accuracy-report.md`.
- **Chapters are data, not components.** Build chapters with the `ca-chapter` skill (`.claude/skills/ca-chapter`). The mastery layer (`data/<subject>/chNN-learn.json`) is generated from `scripts/learn-src/<id>.mjs` with `node scripts/build-learn.mjs <id>`.
- **Before any hand-over:** `npx tsc --noEmit`, `npm run lint`, `npm run validate -- <id>`, `node scripts/audit-accuracy.mjs <id>` (0 errors), `npm run build`.

## Code style (keep new code like the old code)
- TypeScript, React function components; client components start with `'use client'`.
- Styling through tokens in `:root` (light, dark and `data-theme` blocks); per-subject accent via `[data-subj]`. No hard-coded colours in components. Tap targets 44px; layouts work at 390px width with no sideways scroll.
- Chapter HTML fields allow only `p, strong, em, ul, li, table` plus provision links.
- Do not push to `main` directly; work on the session branch and open a pull request.

## Third-party tools installed here
- `.claude/agents/code-simplifier.md` (Anthropic claude-plugins-official). Its default rules mention ES modules and the `function` keyword; in this repo, follow the style above instead.
- `.claude/skills/*` from obra/superpowers (MIT; hooks not installed): brainstorming, writing-plans, executing-plans, test-driven-development, systematic-debugging, verification-before-completion, code-review skills and others (the superpowers-only "diagnosing" skill is left out). License in `.claude/skills/_thirdparty/`.
- `.mcp.json` registers the Context7 documentation server (`https://mcp.context7.com/mcp`); add an API key in your own settings for higher limits.
- gstack (garrytan/gstack) lives outside the repo at `~/.claude/skills/gstack` (needs Bun 1.4.2+; install with `git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup`). Setup adds a Stop hook to `~/.claude/settings.json`. In a fresh codespace its browser skills (`/qa`, `/browse`, `/design-review` and others) first need Chromium's system libraries: `sudo apt-get install -y libatk1.0-0t64 libatk-bridge2.0-0t64 libcups2t64 libxkbcommon0 libasound2t64 libgbm1 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libatspi2.0-0t64`, then re-run `./setup` (keep the sandbox on). Its skills (`/ship`, `/review` and others) must still follow the rules above: branch and pull request, no direct push to `main`.
- ponytail (DietrichGebert/ponytail, MIT) is a Claude Code plugin: `/plugin marketplace add DietrichGebert/ponytail`, then `/plugin install ponytail@ponytail`. Its "write less code" advice never overrides the accuracy rules or the pre-hand-over checks.
