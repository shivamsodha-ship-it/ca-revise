#!/usr/bin/env python3
"""Merge figure/answer patches into question part files and write nums.json.

Usage: python3 scripts/apply-patches.py <chapter-id>
Patch files in work/<id>/build/*-patch.json: { "<question id>": { "nums": [[label, value, unit, tol?]], "a": "<html>",
"corrected": "<p>…</p>", "table_fix": "<html>" } }. A question with nums becomes v "Numerical". "corrected" replaces any
earlier "Note (app)" paragraph. Every questions-*.json part file is patched in place.
"""
import json, re, glob, sys
ID = sys.argv[1]; W = f'work/{ID}'
patch = {}
for f in sorted(glob.glob(f'{W}/build/*-patch.json')): patch.update(json.load(open(f)))
nums, hit = {}, set()
for qf in sorted(glob.glob(f'{W}/parts/questions-*.json')):
    Q = json.load(open(qf))
    for q in Q:
        p = patch.get(q['id'])
        if p is None: continue
        hit.add(q['id'])
        if p.get('a'): q['a'] = p['a']
        if p.get('table_fix'):
            intro = re.match(r'(<p>.*?</p>)', q['q'], re.S)
            q['q'] = (intro.group(1) if intro else '') + p['table_fix']
        if p.get('corrected') or p.get('drop_note'):
            q['a'] = re.sub(r'<p><strong>Note \(app\):</strong>.*?</p>', '', q['a'], flags=re.S)
        if p.get('corrected') and p['corrected'] not in q['a']: q['a'] += p['corrected']
        if p.get('nums'): nums[q['id']] = p['nums']; q['v'] = 'Numerical'
    json.dump(Q, open(qf, 'w'), ensure_ascii=False, indent=1)
json.dump(nums, open(f'{W}/parts/nums.json', 'w'), ensure_ascii=False, indent=1)
miss = sorted(set(patch) - hit)
print(f'{len(nums)} numericals with figures; {len(hit)} questions patched' + (f'; patch ids not found: {miss}' if miss else ''))
