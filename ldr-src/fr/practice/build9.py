"""Practice sheet for Ch 9 (Ind AS 115): SM / TYK / PQ as ICAI crops, RTP / MTP / past papers from data/fr/ch09-casebook.json."""
import sys, os, re, html, json
SP = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, SP)
from crop import Doc
from cur import C
part, out = '9', sys.argv[1]
cu = C['9']
REPO = '/home/user/ca-revise'
cb = json.load(open(f'{REPO}/data/fr/ch09-casebook.json'))
P = {p['id']: p for p in cb['P']}
Pidx = {p['id']: i for i, p in enumerate(cb['P'])}
G = dict((g[0], g[1]) for g in cb['groups'])
CBQ = {q['id']: q for q in cb['Q']}
RANK = {'sm-ex': 0, 'sm-ill': 0, 'sm-tyk': 1, 'pq': 2, 'rtp': 3, 'mtp': 4, 'pyq': 5}
def pos(r): return (r[0], r[1])
items = []
def add(concept, src, kind, q, a, typ='', note=''):
    items.append(dict(concept=concept, src=src, kind=kind, q=q, a=a, type=typ, note=note, order=len(items)))
D = Doc(f'{SP}/../sm9/ch9.pdf')
ILL = r'^Illustration\s*\d+[A-C]?\s*([:\-–].*)?$'
anc = [r for r in D.L if r[5] and r[3] < 140 and re.match(ILL, r[4])]
tyk = pos([r for r in D.L if r[4] == 'TEST YOUR KNOWLEDGE'][0])
heads = [r for r in D.L if r[5] and r[3] < 110 and re.match(r'^\d+(\.\d+)+\s+[A-Z]', r[4])]
stops = sorted([pos(r) for r in anc + heads] + [tyk])
stars = [pos(r) for r in D.L if re.match(r'^\*{3,}', r[4])]
sols = [pos(r) for r in D.L if r[3] < 140 and re.match(r'^Solution', r[4])]
for a in anc:
    pa = pos(a); n = int(re.match(r'Illustration\s*(\d+)', a[4]).group(1))
    nxt = [s for s in stops if s > pa][0]
    st = [s for s in stars if pa < s < nxt]; end = st[0] if st else nxt
    so = [s for s in sols if pa < s < end]
    nm = f'c9_I{n}'
    q = D.crop(pa, so[0], nm + 'q') if so else D.crop(pa, end, nm + 'q'); s = D.crop(so[0], end, nm + 'a') if so else []
    c = CBQ.get(f'I{n}')
    add(c['links'][0] if c else 'r115-core', f'SM Ch 9 · {a[4].strip()}', 'sm-ill', q, s, c['v'] if c else '')
def numbered(Dd, a, b, tag):
    A = [r for r in Dd.L if a <= pos(r) < b and r[3] < 75 and re.match(r'^\d{1,2}\.(\s|$)', r[4])]
    return [Dd.crop(pos(r), pos(A[i + 1]) if i + 1 < len(A) else b, f'{tag}_{i+1}') for i, r in enumerate(A)]
qs = pos([r for r in D.L if r[4] == 'Questions' and pos(r) > tyk][0]); an = pos([r for r in D.L if r[4] == 'Answers' and pos(r) > tyk][0])
for i, (q, a) in enumerate(zip(numbered(D, qs, an, 'c9tq'), numbered(D, an, (D.d.page_count - 1, 9999), 'c9ta'))):
    c = CBQ.get(f'T{i+1}')
    add(c['links'][0] if c else 'r115-core', f'SM Ch 9 · Test Your Knowledge Q{i+1}', 'sm-tyk', q, a, c['v'] if c else '')
PQ = Doc(f'{SP}/../pq11/83231bos67302-pq.pdf')
c9 = pos([r for r in PQ.L if r[4].startswith('CHAPTER-9')][0]); c10 = pos([r for r in PQ.L if r[4].startswith('CHAPTER-10')][0])
qs = pos([r for r in PQ.L if r[4] == 'Questions' and c9 < pos(r) < c10][0]); an = pos([r for r in PQ.L if r[4] == 'Answers' and c9 < pos(r) < c10][0])
for i, (q, a) in enumerate(zip(numbered(PQ, qs, an, 'pq9q'), numbered(PQ, an, c10, 'pq9a'))):
    c = CBQ.get(f'T{11+i}')
    add(c['links'][0] if c else 'r115-core', f'ICAI Practice Questions · Ch 9 Q{i+1}', 'pq', q, a, c['v'] if c else '')
for q in cb['Q']:
    if q['k'] not in ('rtp', 'mtp', 'pyq') or q['id'] in cu['skip_ids']: continue
    add(q['links'][0], q['src'], q['k'], q['q'], q['a'], q['v'])
groups_in = cu['groups_in']
code = open(os.path.join(SP, 'build2.py')).read()
code = code[code.index('# ---- curation ----'):]
code = code.replace("from cur import C as CUR\ncu = CUR[part]\n", "")
code = code.replace("def key(it, k): return it['src'].startswith(k)",
    "def key(it, k):\n    s = it['src']\n    return s == k or (s.startswith(k) and not (s[len(k)].isdigit() or s[len(k)] in 'ABC'))")
code = code.replace("title = 'Ind AS 103 Business Combinations' if part == '103' else 'Ind AS 110 Consolidated Financial Statements'", "title = cu['title']")
code = code.replace("print(len(order)", "missing = [k for g in cu['play'].values() for a in g for k in a['q'] if find(k) is None]\nprint('MISSING refs', missing)\nprint(len(order)")
exec(code)
