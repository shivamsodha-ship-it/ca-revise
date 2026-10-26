#!/usr/bin/env python3
"""Rank SM chapters/units by how often ICAI's recent papers test them. Usage: python3 scripts/lastday/rank.py <subject> [-v]"""
import json, sys, collections
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
subj = sys.argv[1]; verbose = '-v' in sys.argv
d = json.load(open(ROOT / 'work' / 'lastday' / f'{subj}.json'))
chs, qs = d['chapters'], d['questions']
W = {'pyq': 2, 'rtp': 1, 'mtp': 1}
ch = collections.defaultdict(lambda: collections.Counter())
sec = collections.defaultdict(lambda: collections.Counter())
for q in qs:
    m = q['match'][0]
    if m['score'] < 8: continue
    pts = W[q['kind']] + (1 if q['att'] == 'nov26' else 0)
    ch[m['ci']]['score'] += pts; ch[m['ci']][q['kind']] += 1; ch[m['ci']]['n'] += 1
    sec[(m['ci'], m['si'])]['score'] += pts; sec[(m['ci'], m['si'])]['n'] += 1
print(f"{'score':>5} {'pyq':>3} {'rtp':>3} {'mtp':>3}  chapter")
for ci, c in sorted(ch.items(), key=lambda kv: -kv[1]['score']):
    print(f"{c['score']:5d} {c['pyq']:3d} {c['rtp']:3d} {c['mtp']:3d}  {chs[ci]['file'][:70]}")
    if verbose:
        for (cj, si), s in sorted(sec.items(), key=lambda kv: -kv[1]['score']):
            if cj == ci and s['score'] >= 3:
                S = chs[ci]['sections'][si]; print(f"         {s['score']:3d}  {S['num']} {S['title'][:60]} (SM p{S['p0']}-{S['p1']})")
