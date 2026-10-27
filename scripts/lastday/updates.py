#!/usr/bin/env python3
"""'What changed for Nov 2026': ICAI's own amendments / academic-update section, copied verbatim from the Nov 2026 RTP
(Part I of the FR and AAA RTPs). The AFM RTP has no such section. Page headers are removed; nothing is reworded.
Usage: python3 scripts/lastday/updates.py  ->  data/lastday/updates.json"""
import json, re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
P = ROOT / 'work' / 'papers'

def clean(t):
    t = t.replace('`', '₹')
    out = []
    for ln in t.split('\n'):
        s = ln.strip()
        if re.match(r'^\d{0,3}\s*NOVEMBER 2026 EXAMINATION\s*\d{0,3}$', s): continue
        if s in ('REVISION TEST PAPER', 'REVISION TEST PAPERS', 'PAPERS', 'FINAL EXAMINATION'): continue
        if re.match(r'^(ADVANCED AUDITING, ASSURANCE AND|PROFESSIONAL ETHICS)$', s): continue
        if re.match(r'^\d{1,3}$', s): continue
        out.append(ln.rstrip())
    return re.sub(r'\n{3,}', '\n\n', '\n'.join(out)).strip()

def part1(file, start_pat, end_pat):
    lines = (P / file).read_text(errors='ignore').split('\n')
    a = next(i for i, l in enumerate(lines) if re.search(start_pat, l))
    b = next(i for i, l in enumerate(lines) if i > a and re.search(end_pat, l))
    return '\n'.join(lines[a:b])

out = {
  'fr': {'source': 'ICAI Revision Test Paper, Final Paper 1 Financial Reporting, November 2026 examination, Part I: Amendments applicable from November 2026 examination',
         'url': 'https://resource.cdn.icai.org/93963bos-aps6169-rtp-nov2026-ch1.pdf',
         'text': clean(part1('fr_nov26_rtp_1.txt', r'Part I-Amendments applicable', r'Part II-Questions and Answers'))},
  'aaa': {'source': 'ICAI Revision Test Paper, Final Paper 3 Advanced Auditing, Assurance and Professional Ethics, November 2026 examination, Part I: Academic Update (legislative amendments, notifications, circulars, rules, guidelines)',
          'url': 'https://resource.cdn.icai.org/93965bos-aps6169-rtp-nov2026-ch3.pdf',
          'text': clean(part1('aaa_nov26_rtp_1.txt', r'Part . I : Academic Update', r'Part . II: Questions and Answers'))},
  'afm': {'source': 'ICAI Revision Test Paper, Final Paper 2 Advanced Financial Management, November 2026 examination',
          'url': 'https://resource.cdn.icai.org/93964bos-aps6169-rtp-nov2026-ch2.pdf', 'text': ''},
}
json.dump(out, open(ROOT / 'data' / 'lastday' / 'updates.json', 'w'), ensure_ascii=False)
for s, v in out.items(): print(s, len(v['text'].split()), 'words')
