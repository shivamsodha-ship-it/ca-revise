#!/usr/bin/env python3
"""Merge the three writing plans (research/lastday/*-writing-plan work files) into data/lastday/plan.json,
attaching ICAI's full question and answer text to each exercise. Also copies the analysis markdown into
data/lastday/analysis.json for the app. Usage: python3 scripts/lastday/plan.py

Plan layout, block choice and minutes were written by the analysis agents (app-written plan); every question and
answer text here is ICAI's, looked up verbatim in work/lastday/<subject>.json from the source label."""
import json, re, datetime
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
SUBJ = ['fr', 'afm', 'aaa']
ATT = ['May 2024', 'Nov 2024', 'May 2025', 'Sep 2025', 'Jan 2026', 'May 2026', 'Nov 2026']

def iso(d):
    if re.match(r'\d{4}-\d\d-\d\d', d): return d[:10]
    return datetime.datetime.strptime(re.sub(r'^[A-Za-z]{3}\s+', '', d.strip()), '%d %b %Y').strftime('%Y-%m-%d')

def parse_src(s):
    m = re.match(r'(PYQ|MTP|RTP)\b', s)
    if not m: return None
    kind = m.group(1)
    att = next((a for a in ATT if a in s), None)
    ser = 'S-II' if re.search(r'Series\s*II\b', s) else 'S-I' if re.search(r'Series\s*I\b', s) else ''
    q = re.search(r'\bQ(\d{1,2})(\([a-e]\))?', s)
    if not att or not q or 'MCQ' in s or 'Part I' in s: return None
    alt = '#2' if re.search(r'\bOR\b', s) and 'EITHER' not in s else ''
    return {'src': f'{kind} {att}' + (f' {ser}' if ser else ''), 'q': q.group(1), 'part': (q.group(2) or ''), 'alt': alt}

QS = {}
for s in SUBJ:
    p = ROOT / 'work' / 'lastday' / f'{s}.json'
    QS[s] = json.load(open(p))['questions'] if p.exists() else []

def clean(t):
    t = t.replace('`', '₹')
    out = [ln.rstrip() for ln in t.split('\n')
           if 'The Institute of Chartered Accountants of India' not in ln and not re.match(r'^\s*\d{1,3}\s*$', ln)
           and not (ln.strip().isupper() and re.search(r'EXAMINATION|SUGGESTED ANSWER|REVISION TEST|MOCK TEST', ln))]
    return re.sub(r'\n{3,}', '\n\n', '\n'.join(out)).strip()

def lookup(subj, ps):
    qs = [q for q in QS[subj] if q['src'] == ps['src']]
    if ps['part']:
        want = f"{ps['q']}{ps['part']}{ps['alt']}"
        hit = [q for q in qs if str(q['q']) == want]
    else:
        hit = [q for q in qs if str(q['q']) == ps['q'] or str(q['q']).startswith(ps['q'] + '(')]
    if not hit: return None
    return {'prompt': clean('\n\n'.join(((f"({h['q'].split('(')[1]}" if '(' in str(h['q']) and len(hit) > 1 else '') + '\n' + h['text']).strip() for h in hit)),
            'ans': clean('\n\n'.join(h.get('ans', '') for h in hit))}

out = {}
for s in SUBJ:
    p = ROOT / 'work' / 'lastday' / f'analysis-{s}.json'
    if not p.exists(): continue
    d = json.load(open(p))
    days = {}
    miss = 0
    for it in d['plan']:
        day = days.setdefault(iso(it['date']), [])
        item = {'block': (re.findall(r'\b([AB])\b', it.get('block', '')) or [''])[-1], 'source': it['source'], 'marks': it.get('marks') or None,
                'concept': it.get('concept', ''), 'minutes': round(float(it.get('minutes') or 0)), 'mode': it.get('mode', '')}
        ps = parse_src(it['source'])
        if ps:
            q = lookup(s, ps)
            if q: item['q'] = q
            else: miss += 1; item['note'] = 'Open this question in the ICAI paper named above.'
        day.append(item)
    out[s] = {'days': [{'date': k, 'items': v} for k, v in sorted(days.items())]}
    print(s, 'days', len(days), 'items', sum(len(v) for v in days.values()), 'with text', sum(1 for v in days.values() for i in v if 'q' in i), 'unmatched', miss)
(ROOT / 'data' / 'lastday').mkdir(parents=True, exist_ok=True)
json.dump(out, open(ROOT / 'data' / 'lastday' / 'plan.json', 'w'), ensure_ascii=False)

ana = {}
for s in SUBJ:
    f = ROOT / 'research' / 'lastday' / f'{s}-last3-analysis.md'
    w = ROOT / 'research' / 'lastday' / f'{s}-writing-plan.md'
    if f.exists(): ana[s] = {'analysis': f.read_text(), 'plan': w.read_text() if w.exists() else ''}
json.dump(ana, open(ROOT / 'data' / 'lastday' / 'analysis.json', 'w'), ensure_ascii=False)
print('analysis md for', list(ana))
