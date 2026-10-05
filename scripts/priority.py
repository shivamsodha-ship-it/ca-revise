#!/usr/bin/env python3
"""Exam-priority table for a chapter, from its assembled casebook. Usage: npm run priority -- <chapter-id>

Score per provision (the deciding provision = links[0]) over the 5-year sweep:
  2 x past papers + 1 x each RTP/MTP appearance + 1 if in the latest RTP (pass --latest "Nov 2026").
Counts each question by its src kind, each MCQ case scenario once per paper, and every
"Also asked (ICAI): …" item in model answers. High >= 5, Medium 2-4, Low 0-1.
Writes work/<id>/priority.json ({provision id: "High"|"Medium"|"Low"}) for flip-card tags, and prints the table
plus past-paper marks per provision (for the chapter weight).
"""
import json, re, sys, collections
from pathlib import Path

args = [a for a in sys.argv[1:] if not a.startswith('--')]
if not args: sys.exit('Usage: npm run priority -- <chapter-id> [--latest "Nov 2026"]')
cid = args[0]
latest = sys.argv[sys.argv.index('--latest') + 1] if '--latest' in sys.argv else None
root = Path(__file__).resolve().parent.parent
reg = (root / 'lib' / 'registry.ts').read_text()
block = next((b for b in reg.split('\n  {\n') if f"id: '{cid}'" in b), None)
if not block: sys.exit(f'{cid} is not registered')
cbp = re.search(r"casebook:.*import\('\.\./(data/[^']+)'\)", block).group(1)
cb = json.loads((root / cbp).read_text())

S = collections.defaultdict(lambda: {'pyq': 0, 'rtp': 0, 'mtp': 0, 'latest': 0, 'marks': 0})
seen = set()
def kind_of(label):
    for k in ('PYQ', 'RTP', 'MTP'):
        if label.startswith(k): return k.lower()
for q in cb['Q']:
    pid, src = q['links'][0], q['src']
    k = q['k'] if q['k'] in ('pyq', 'rtp', 'mtp') else kind_of(src) if q['k'] == 'mcq' else None
    if k:
        if q['k'] == 'mcq':
            key = re.sub(r'MCQ.*', '', src) + pid
            if key in seen: k = None
            seen.add(key)
    if k:
        S[pid][k] += 1
        m = re.search(r'(\d+) marks', src)
        if k == 'pyq' and m: S[pid]['marks'] += int(m.group(1))
        if latest and k == 'rtp' and latest in src: S[pid]['latest'] = 1
    for a in re.findall(r'Also asked(?: \(ICAI\))?: (.*?)\.</p>', q.get('a', '')):
        for item in a.split(';'):
            k2 = kind_of(item.strip())
            if k2:
                S[pid][k2] += 1
                if latest and k2 == 'rtp' and latest in item: S[pid]['latest'] = 1

rows = []
for p in cb['P']:
    s = S[p['id']]
    sc = 2 * s['pyq'] + s['rtp'] + s['mtp'] + s['latest']
    rows.append((sc, p['id'], p['label'], s))
rows.sort(key=lambda r: (-r[0], r[1]))
pri = {}
print(f"{'score':>5} {'priority':8} {'provision':22} pyq rtp mtp latest marks")
for sc, pid, label, s in rows:
    pri[pid] = 'High' if sc >= 5 else 'Medium' if sc >= 2 else 'Low'
    print(f"{sc:5d} {pri[pid]:8} {pid:22} {s['pyq']:3d} {s['rtp']:3d} {s['mtp']:3d} {s['latest']:6d} {s['marks']:5d}")
out = root / 'work' / cid / 'priority.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(pri, indent=1))
print(f"\nPast-paper marks in total: {sum(r[3]['marks'] for r in rows)} (divide by attempts swept for the chapter weight). Wrote {out.relative_to(root)}")
