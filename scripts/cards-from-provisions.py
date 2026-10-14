#!/usr/bin/env python3
"""Flip cards (one per provision, plus memory hooks and worked examples for High-priority ones) and written practice
(from past-paper questions) generated from a chapter's part files. Usage: python3 scripts/cards-from-provisions.py <chapter-id>"""
import json, re, glob, html, os
import sys
ID = sys.argv[1]; W = f'work/{ID}/parts'
P = sum((json.load(open(f)) for f in sorted(glob.glob(f'{W}/provisions-*.json'))), [])
G = dict(json.load(open(f'{W}/groups.json')))
F = json.load(open(f'{W}/questions-10-found.json')) if os.path.exists(f'{W}/questions-10-found.json') else []
txt = lambda h: html.unescape(re.sub(r'<[^>]+>', ' ', re.sub(r'</p>', '\n', h))).replace('  ', ' ').strip()
# priority per provision: (PYQs x 2) + RTP/MTP appearances + 1 if latest (Nov 2026)
score = {p['id']: 0 for p in P}
for q in F:
    for l in q['links'][:1]:
        score[l] = score.get(l, 0) + (2 if q['src'].startswith('PYQ') else 1) + (1 if 'Nov 2026' in q['src'] else 0)
pri = lambda s: 'High' if s >= 5 else 'Medium' if s >= 2 else 'Low'
EMO = {'A': '📖', 'B': '🤝', 'C': '📦', 'D': '💰', 'E': '⚖️', 'F': '✅', 'G': '🧾', 'P': '📊', 'S': '🛣️', 'H': '🔭'}
secs = []
for g, name in G.items():
    cards = []
    for p in [p for p in P if p['g'] == g]:
        t = pri(score[p['id']]); law = txt(p['law'])
        cards.append({'id': f"c-{p['id']}", 'type': 'concept', 'tags': [p['label'], t],
                      'front': f"{p['title']}: what is the rule?",
                      'back': {'simplified': law[:700], 'explanation': ' '.join(txt(n) for n in p['notes'][:2])[:600], 'cases': [txt(n) for n in p['notes'] if re.search(r'SM (Illustration|TYK|Practice|Example)', n)][:3]}})
        if p.get('mem'):
            cards.append({'id': f"c-{p['id']}-mem", 'type': 'mnemonic', 'tags': [p['label'], t], 'front': f"Memory hook: {p['short']}?", 'back': {'simplified': p['mem']}})
        if t == 'High' and len(p['notes']) > 2:
            cards.append({'id': f"c-{p['id']}-apply", 'type': 'illustration', 'tags': [p['label'], t], 'front': f"Worked example: {p['short']} — what does ICAI's illustration show?",
                          'back': {'simplified': txt(p['notes'][2])[:600], 'explanation': txt(p['notes'][3])[:500] if len(p['notes']) > 3 else ''}})
    secs.append({'id': f's-{g.lower()}', 'title': name, 'emoji': EMO.get(g, '📘'), 'cards': cards})
json.dump(secs, open(f'{W}/sections-01.json', 'w'), ensure_ascii=False, indent=1)
pr = []
for q in [q for q in F if q['k'] == 'pyq']:
    pr.append({'id': f"p-{q['id'].lower()}", 'prompt': txt(q['q']), 'clauseRef': q['src'], 'hints': [f"Start from the deciding requirement: {next(p['title'] for p in P if p['id'] == q['links'][0])}."],
               'modelAnswer': txt(re.sub(r'<p><strong>Note \(app\).*', '', q['a'], flags=re.S)),
               'markingPoints': ['Names the governing Ind AS and paragraph', 'Applies each condition to the specific facts', 'Figures and treatment match ICAI\'s answer (allocation, entries, amounts)', 'Clear conclusion with the treatment and amounts']})
json.dump(pr, open(f'{W}/practice-01.json', 'w'), ensure_ascii=False, indent=1)
print(len(secs), sum(len(s['cards']) for s in secs), 'cards;', len(pr), 'practice'); print({k: v for k, v in sorted(score.items(), key=lambda x: -x[1])[:12]})
json.dump(score, open(f'work/{ID}/build/priority.json', 'w'))
