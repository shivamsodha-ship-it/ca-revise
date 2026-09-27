#!/usr/bin/env python3
"""Extract an ICAI study-material chapter PDF into text the ca-chapter skill can read in chunks.

Usage: python3 scripts/extract-sm.py <chapter.pdf> <out-dir>

Writes to <out-dir>:
  sm.txt          full text with '=== p.N ===' page markers (N = PDF page number)
  inventory.json  headings, Illustrations, TYK / MCQ / descriptive-question blocks found, with pages
  inventory.md    the same, human-readable (read this first)

The inventory is a checklist: every Illustration and TYK question listed must end up in the casebook.
Pattern matching is heuristic; always confirm counts against the PDF itself.
"""
import json, re, sys
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError:
    sys.exit("pypdf missing: pip install pypdf")

if len(sys.argv) != 3:
    sys.exit(__doc__)
pdf, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)

reader = PdfReader(str(pdf))
pages = []
for i, page in enumerate(reader.pages, 1):
    try:
        t = page.extract_text() or ''
    except Exception as e:  # damaged page: keep going, flag it
        t = f'[[EXTRACTION FAILED: {e}]]'
    t = re.sub(r'[ \t]+\n', '\n', t).replace('­', '')
    pages.append(t)

with open(out / 'sm.txt', 'w') as f:
    for i, t in enumerate(pages, 1):
        f.write(f'\n=== p.{i} ===\n{t}\n')

RX = {
    'illustration': re.compile(r'^\s*(?:ILLUSTRATION|Illustration)\s*[-–:]?\s*(\d+[A-Za-z]?)\b', re.M),
    'tyk': re.compile(r'^\s*TEST\s+YOUR\s+KNOWLEDGE|^\s*Test\s+Your\s+Knowledge', re.M),
    'mcq_head': re.compile(r'^\s*(?:Multiple\s+Choice\s+Questions|MCQs?)\b', re.M | re.I),
    'desc_head': re.compile(r'^\s*(?:Descriptive\s+Questions|Theoretical\s+Questions|Scenario[- ]based\s+Questions|Case\s+Scenarios?|Questions)\s*$', re.M | re.I),
    'answers_head': re.compile(r'^\s*(?:ANSWERS|Answers|Hints|Answers\s*/\s*Hints|Answers\s+to\s+(?:the\s+)?MCQs?)\b', re.M),
    'case_study': re.compile(r'^\s*(?:CASE\s+STUDY|Case\s+Study|Case\s+Scenario)\s*[-–:]?\s*(\d+)?', re.M),
    'heading': re.compile(r'^\s*(\d{1,2}(?:\.\d{1,2}){0,3})\s+([A-Z][^\n]{3,90})$', re.M),
}

inv = {'pdf': str(pdf), 'pages': len(pages), 'empty_pages': [], 'headings': [], 'illustrations': [], 'case_studies': [], 'blocks': []}
seen_ill = set()
for n, t in enumerate(pages, 1):
    if len(t.strip()) < 30:
        inv['empty_pages'].append(n)
    for m in RX['heading'].finditer(t):
        inv['headings'].append({'num': m.group(1), 'title': m.group(2).strip(), 'page': n})
    for m in RX['illustration'].finditer(t):
        k = m.group(1)
        snippet = t[m.end():m.end() + 160].strip().replace('\n', ' ')
        inv['illustrations'].append({'n': k, 'page': n, 'repeat': k in seen_ill, 'snippet': snippet})
        seen_ill.add(k)
    for m in RX['case_study'].finditer(t):
        inv['case_studies'].append({'n': m.group(1), 'page': n})
    for kind in ('tyk', 'mcq_head', 'desc_head', 'answers_head'):
        for m in RX[kind].finditer(t):
            inv['blocks'].append({'kind': kind, 'page': n, 'text': m.group(0).strip()})

(out / 'inventory.json').write_text(json.dumps(inv, indent=1, ensure_ascii=False))

uniq = [i for i in inv['illustrations'] if not i['repeat']]
lines = [f"# Study material inventory: {pdf.name}", '',
         f"- Pages: {inv['pages']}" + (f" (little or no text on pages {inv['empty_pages']}: scanned? check them visually)" if inv['empty_pages'] else ''),
         f"- Illustrations found: {len(uniq)}" + (f" (+{len(inv['illustrations']) - len(uniq)} repeats: usually the 'Solution' line re-quoting the number)" if len(uniq) != len(inv['illustrations']) else ''),
         f"- Case studies found: {len(inv['case_studies'])}",
         f"- TYK / question / answer block markers: {len(inv['blocks'])}", '',
         '## Headings', *[f"- p.{h['page']} · {h['num']} {h['title']}" for h in inv['headings']], '',
         '## Illustrations', *[f"- Ill. {i['n']} (p.{i['page']}): {i['snippet'][:110]}" for i in uniq], '',
         '## Question blocks', *[f"- p.{b['page']} · {b['kind']}: {b['text']}" for b in inv['blocks']]]
(out / 'inventory.md').write_text('\n'.join(lines) + '\n')
print(f"{pdf.name}: {inv['pages']} pages, {len(uniq)} illustrations, {len(inv['headings'])} headings, {len(inv['blocks'])} question-block markers -> {out}")
