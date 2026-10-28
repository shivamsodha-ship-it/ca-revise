# AAA last-day revision (LDR) sheets: brief for chapter writers

Student: CA Final Nov 2026, Paper 3 AAA (exam 6 Nov). AAA is pure theory. ICAI can ask any paragraph, or combine several topics in a case study that needs at least 4 bullet points per answer. The student wants **exam-oriented, SM-faithful, printable handwritten-style notes**, and **every topic needs a mnemonic that is easy to remember and makes sense**.

## Non-negotiable accuracy rules
1. Content comes ONLY from the ICAI AAA Study Material (SM) chapter text you extract (see Extraction below). Do not add points from memory. If you add any study aid that is not in the SM (a mnemonic, an answer frame, a cross-link), label it: mnemonics go in `.sticky` boxes headed "Mnemonic"; cross-links go in the correlation table, whose header says "app-written". Never invent a section number, threshold, limit, date or penalty. If the SM states something that looks outdated, keep the SM's text and add "(as per SM)".
2. Lists must be **complete**: if the SM gives 7 factors, write all 7, in the SM's order, with the SM's key words. Examiners mark on keywords.
3. Cite SA / para / section / clause numbers exactly as the SM gives them.

## Extraction (Claude in Chrome)
Load the Chrome tools in one ToolSearch call:
`select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__javascript_tool,mcp__claude-in-chrome__get_page_text,mcp__claude-in-chrome__tabs_close_mcp`
Call tabs_context_mcp, then tabs_create_mcp to open your OWN tab (other writers use the browser at the same time, so never touch another tab). Navigate it to your chapter's SM PDF URL. Then run this with javascript_tool (replace URL):
```
window.DONE=0;(async()=>{if(!window.pdfjsLib){await new Promise((r,j)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';s.onload=r;s.onerror=j;document.head.appendChild(s);});pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';}const d=await pdfjsLib.getDocument('URL').promise;let o=[];for(let i=1;i<=d.numPages;i++){const p=await d.getPage(i);const c=await p.getTextContent();o.push(c.items.map(x=>x.str+(x.hasEOL?'\n':' ')).join(''));}window.T=o.join('\n').replace(/© The Institute of Chartered Accountants of India/g,'');document.body.innerHTML='<article><pre id="o"></pre></article>';window.DONE=window.T.length;})();'started'
```
Poll `window.DONE` until it is non-zero (that is the text length). Then read the text in chunks of about 15,000 characters: run `document.getElementById('o').textContent=window.T.slice(A,B);B` and call get_page_text on your tab. Read the WHOLE chapter, including Test Your Knowledge questions (they show what ICAI considers askable). javascript_tool output is capped at about 1,000 characters, so read the text only through get_page_text. Close your tab at the end.
If the Chrome tools are missing or every call fails, STOP and report that. Do NOT write notes from memory.

## Past-paper signal (optional, cheap)
`/home/claude/ca-revise/data/lastday/aaa.json` holds recent ICAI AAA questions (Sep 2025, Jan 2026, May 2026, plus RTP/MTP). Grep it for your chapter to mark topics "asked" with a small tag such as `<span class="tag">Asked May 2026</span>`. Don't spend long on this.

## Output format
- One HTML file per chapter: `ldr-src/aaa (in the ca-revise repo)/aaa-NN.html` (NN = two-digit chapter number). Link `style.css` (same folder). Copy the structure of `afm-02.html` in the same folder exactly. Use only the classes it uses: `.page`, `.head`, `.tag`, `h1 .u`, `.sub`, `h2 .n`, `ul.small`, `ol.small`, `p.small`, `.box`, `.box.small h3`, `.cols` (2 columns), `.cols3`, `table`/`table.small`, `.trap`, `.sticky`, `.exam`, `.foot`.
- Header tag on page 1: `Ch NN · X% of marks` (weights are given in your task). Footer right: `checked vs AAA SM Ch NN · AAA LDR — Ss`. Footer left: `AAA Ch NN · page i / n`.
- Content per topic (each SA / section):
  1. The SM's points, complete, compressed into keyword bullets or tables (requirements, conditions, factors, procedures, exceptions, documentation).
  2. **Mnemonic** in a `.sticky` box. It must expand to the SM's actual list in order, or a meaningful phrase that maps 1:1 to the points (eg "<b>P-I-E-C-E</b> = Purpose, Independence, ..."). It must make sense; no random letter strings. Give one mnemonic for every list of 4 or more items.
  3. A `.trap` box for points examiners twist (exceptions, "is / is not", timing, who is responsible).
  4. For case-study-heavy topics, a short `.exam` "answer frame": the 4-bullet skeleton (provision → requirement → application → conclusion) with the exact SA / para to quote.
- Last page: **"Correlation — how Ch NN actually connects"** table. Write the actual link, not "see Ch X". Examples: "SA 560 subsequent events ⇄ Ind AS 10 adjusting events: auditor's duty changes before vs after the report date"; "SA 250 NOCLAR ⇄ Ch 19 Code of Ethics NOCLAR (Section 260/360)". Header: "The actual link (app-written cross-reference; the Ch NN side is SM)".
- **Required cross-standard correlations** (the student asked for these specifically). Wherever the chapter touches them, add correlation rows across these families of engagement and ethics standards:
  - **SAs** (audits, Ch 1–8, 13) ⇄ **SREs** (reviews, Ch 10: SRE 2400 / 2410) ⇄ **SRSs** (related services, Ch 9: SRS 4400 / 4410) ⇄ **SAEs** (other assurance, Ch 11: SAE 3400 / 3402 / 3420, ESG assurance Ch 18) ⇄ **SQC 1 / SQM** (Ch 1) ⇄ **Professional ethics** (Ch 19: Code of Ethics, CA Act schedules, independence, NOCLAR).
  - Compare these side by side wherever the SM supports it: level of assurance (reasonable / limited / none), form of opinion or report (positive / negative / factual findings / compilation), independence requirement, engagement letter / terms, use of others' work, management representations, documentation, and the ethics duties that apply (confidentiality, independence, misconduct clauses).
  - The comparison side must come from the SM chapter you are writing. For the other side, state only what your chapter's SM itself says or cross-refers to. Where you rely on general knowledge of the other standard, keep it to the standard's name and number plus a well-known headline fact, and mark the row "app-written".
- Density: body text is small and handwritten. A page holds about 1,000 px of content. Typical chapter: 4 to 9 pages, high-weight chapters more. Be complete before you trim. Pack the pages: no page except the last should end under about 800 px. Pull the next section up to fill it. The finished pilot `aaa-09.html` is the model for format, mnemonic style and the two correlation tables (A: side-by-side standards comparison; B: actual-link rows).

## Build and check (you do this yourself)
`cd ldr-src/aaa && python3 build1.py aaa-NN.html AAA_LDR_ChNN_<ShortName>.pdf`
It prints `[[page, bottom_px], ...]`. Every bottom must be under 1075. If a page overflows, move a whole section to the next page or split it into a new `<section class="page">`, then fix the "page i / n" numbers. Rebuild until clean. Optional visual check: `python3 sheet.py <pdf>` writes `sheet.png`, which you can view with Read. Don't overwrite any other aaa-*.html file.

## Report back (short)
For each chapter: PDF path, page count, the topics covered (one line), and anything in the SM that looked wrong or outdated (quote it). No other narration.
