#!/usr/bin/env python3
"""Extract SM illustrations and TYK questions verbatim into casebook questions.

Usage: python3 scripts/sm2questions.py <chapter-id>
Reads work/<id>/build/config.json:
  { "sm": ["work/<id>/sm/sm.txt", ...],            # one or more extracted SM texts, in SM order (units)
    "ill_prefix": ["", "U3-", ...],                 # optional id prefix per SM file (for multi-unit chapters)
    "ranges": [[first, last, "provision-id"], ...], # per SM file: list of illustration ranges -> deciding provision
    "extra": {"<ill id>": "second-provision"},
    "tyk": {"file": 0, "links": {"1": ["prov"], ...}}  # optional: TEST YOUR KNOWLEDGE at the end of an SM file
  }
Writes work/<id>/parts/questions-01-sm.json. Apply sm-patch.json afterwards with scripts/apply-patches.py.
"""
import re, json, html, sys
ID = sys.argv[1]; W = f'work/{ID}'
C = json.load(open(f'{W}/build/config.json'))
def clean(t):
    t = re.sub(r'=== p\.\d+ ===', '', t)
    t = re.sub(r'©\s*The Institute of Chartered Accountants of India', '', t)
    t = re.sub(r'(?m)^\s*([A-Z][A-Z ,&\-:]{6,60}\s*\d*\.?\d*|\d{1,2}\.\d{1,3}|\d{1,3}|PQ \d+|a)\s*$', '', t)
    t = t.replace('`', '₹')
    t = re.sub(r'recogni\s?z(e|ed|es|ing)', r'recognis\1', t)
    t = re.sub(r'(\d),\s+(\d{2},\d{3})\b', r'\1,\2', t)
    t = re.sub(r'[ \t]+', ' ', t)
    return t.strip()
def paras(t):
    lines = [l.strip() for l in t.split('\n') if l.strip() and l.strip() != '*****']
    out, cur = [], ''
    for l in lines:
        if cur and (re.match(r'^(\(?[a-z0-9ivx]{1,4}\)|[•●➢✓▪]|Step \d|Case [A-C]|Year|Particulars|Total|Note)', l) or cur.endswith(('.', ':', '?'))):
            out.append(cur); cur = l
        else:
            cur = (cur + ' ' + l).strip()
    if cur: out.append(cur)
    return ''.join(f'<p>{html.escape(p, quote=False)}</p>' for p in out)
Q, report = [], []
for fi, path in enumerate(C['sm']):
    sm = re.sub(r'I\s?l\s?l\s?u\s?s\s?t\s?r\s?a\s?t\s?i\s?o\s?n', 'Illustration', open(path).read())
    pre = (C.get('ill_prefix') or [''] * len(C['sm']))[fi]
    ranges = C['ranges'][fi]
    tyk_at = sm.find('TEST YOUR KNOWLEDGE')
    body = sm[:tyk_at] if tyk_at > 0 else sm
    starts = [(int(re.sub(r'\s', '', m.group(1))), m.start()) for m in re.finditer(r'(?m)^\s*Illus\s?tration\s+(\d\s?\d?)\b', body)]
    seen = set()
    for i, (n, s) in enumerate(starts):
        if n in seen: continue
        seen.add(n)
        e = starts[i + 1][1] if i + 1 < len(starts) else len(body)
        blk = body[s:e]
        so = re.search(r'(?m)^\s*Solution\b', blk)
        stop = blk.find('*****', so.end() if so else 0)
        if stop > 0: blk = blk[:stop]
        head, sol = (blk[:so.start()], blk[so.end():]) if so else (blk, '')
        tm = re.match(r'\s*Illus\s?tration\s+\d\s?\d?\s*(?:[:\-–]\s*)?([^\n]*)', head)
        first = tm.group(1).strip() if tm else ''
        title = first if first and len(first) < 90 and not re.search(r'\b(enters|is|has|sells|provides|acquire[sd]?|holds|owns|issues|agrees)\b', first) else ''
        head = head[tm.end():] if (tm and title) else re.sub(r'^\s*Illus\s?tration\s+\d\s?\d?\s*[:\-–]?', '', head)
        prov = next((p for a, b, p in ranges if a <= n <= b), ranges[-1][2])
        qid = f'{pre}I{n}'
        links = [prov] + ([C['extra'][qid]] if qid in C.get('extra', {}) and C['extra'][qid] != prov else [])
        Q.append({'id': qid, 'src': f"SM Illustration {n}" + (f" ({C['unit_names'][fi]})" if C.get('unit_names') else '') + (f' · {title.strip(" :")}' if title else ''),
                  'k': 'sm-ill', 'links': links, 'v': 'Theory', 'q': paras(clean(head)), 'a': paras(clean(sol)) or '<p>See the study material.</p>', 'trap': ''})
    report.append(f'{path}: {len(seen)} illustrations ({min(seen) if seen else "-"}–{max(seen) if seen else "-"})')
    t = C.get('tyk')
    if t and t['file'] == fi and tyk_at > 0:
        ty = sm[tyk_at:]
        qpart, apart = re.split(r'(?m)^\s*Answer\s?s\s*$', ty, maxsplit=1) if re.search(r'(?m)^\s*Answer\s?s\s*$', ty) else (ty, '')
        def items(x):
            d = {}
            for p in re.split(r'\n(?=\d{1,2}\.\s)', '\n' + x):
                m = re.match(r'\n?(\d{1,2})\.\s', p)
                if m and int(m.group(1)) not in d: d[int(m.group(1))] = re.sub(r'^\n?\d{1,2}\.\s*', '', p)
            return d
        TQ, TA = items(qpart.split('Questions', 1)[-1]), items(apart)
        for n in sorted(TQ):
            Q.append({'id': f'{pre}T{n}', 'src': f'SM TYK {n}', 'k': 'sm-tyk', 'links': t['links'].get(str(n), [ranges[0][2]]), 'v': 'Theory',
                      'q': paras(clean(TQ[n])), 'a': paras(clean(TA.get(n, ''))) or '<p>See the study material.</p>', 'trap': ''})
        report.append(f'TYK: {len(TQ)} questions, {len(TA)} answers')
json.dump(Q, open(f'{W}/parts/questions-01-sm.json', 'w'), ensure_ascii=False, indent=1)
print('\n'.join(report)); print(len(Q), 'questions')
