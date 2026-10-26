#!/usr/bin/env python3
"""Chapter-wise weightage of the last three attempts -> data/lastday/weightage.json (for the printable table).
Computed from the question-level rows the analysis agents extracted from ICAI's papers (work/lastday/analysis-<s>.json):
marks as printed, chapter/unit and concept as labelled by the analysis. Compulsory = Part I MCQs and Q1; everything else is choice.
Marks are 'marks set': a paper prints 118 when both alternatives of an EITHER/OR question are counted (114 otherwise)."""
import json, re, collections
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
ATT = ['Sep 2025', 'Jan 2026', 'May 2026']
out = {}
for s in ['fr', 'afm', 'aaa']:
    rows = json.load(open(ROOT / 'work' / 'lastday' / f'analysis-{s}.json'))['rows']
    U = collections.OrderedDict()
    tot = collections.Counter()
    for r in rows:
        m = r['marks'] or 0
        q = str(r['q'])
        comp = q.startswith('MCQ') or bool(re.match(r'Q1\b', q))
        u = U.setdefault(r['unit'], {'unit': r['unit'], 'by': {a: 0 for a in ATT}, 'comp': 0, 'choice': 0, 'items': []})
        u['by'][r['attempt']] += m
        u['comp' if comp else 'choice'] += m
        tot[r['attempt']] += m
        u['items'].append({'a': r['attempt'], 'q': q, 'm': m, 'c': r['concept'], 't': r.get('type', ''), 'k': comp})
    allm = sum(tot.values())
    res = []
    for u in U.values():
        t = sum(u['by'].values())
        res.append({'unit': u['unit'], 'by': u['by'], 'total': t, 'pct': round(100 * t / allm, 1), 'comp': u['comp'], 'choice': u['choice'],
                    'n': sum(1 for a in ATT if u['by'][a] > 0), 'items': sorted(u['items'], key=lambda i: (ATT.index(i['a']), i['q']))})
    res.sort(key=lambda r: (-r['total'], r['unit']))
    out[s] = {'attempts': ATT, 'setPerAttempt': {a: tot[a] for a in ATT}, 'rows': res}
    print(s, len(res), 'units; marks set per attempt', dict(tot))
json.dump(out, open(ROOT / 'data' / 'lastday' / 'weightage.json', 'w'), ensure_ascii=False)
