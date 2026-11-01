"""Practice sheet for Ch 11 (Ind AS 32 & 109): items from ex11, rendering shared with build.py."""
import sys, os, re, html, json
SP = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, SP)
from ex11 import extract
from cur import C
part, out = '11', sys.argv[1]
cu = C['11']
P = {k: dict(id=k, g=g, title=t) for k, g, t in cu['concepts']}
Pidx = {k: i for i, (k, g, t) in enumerate(cu['concepts'])}
G = dict(cu['groups'])
cb = dict(groups=[list(g) for g in cu['groups']])
RANK = {'sm-ex': 0, 'sm-ill': 0, 'sm-tyk': 1, 'pq': 2, 'rtp': 3, 'mtp': 4, 'pyq': 5}
items = []
for x in extract():
    items.append(dict(concept=cu['conceptfn'](x['src']), src=x['src'], kind=x['kind'], q=x['q'], a=x['a'], type='', order=len(items),
                      note='ICAI example — facts and ICAI\'s analysis are printed together.' if x['kind'] == 'sm-ex' else ''))
groups_in = ''.join(g for g, _ in cu['groups'])
code = open(os.path.join(SP, 'build2.py')).read()
code = code[code.index('# ---- curation ----'):]
code = code.replace("from cur import C as CUR\ncu = CUR[part]\n", "")
code = code.replace("def key(it, k): return it['src'].startswith(k)",
    "def key(it, k):\n    s = it['src']\n    return s == k or (s.startswith(k) and not (s[len(k)].isdigit() or s[len(k)] in 'ABC'))")
code = code.replace("title = 'Ind AS 103 Business Combinations' if part == '103' else 'Ind AS 110 Consolidated Financial Statements'", "title = cu['title']")
code = re.sub(r"RTP / MTP / past papers are ICAI.{1,3}s text and answers; solutions marked app-written are mine\.", "This chapter uses ICAI SM Units 1-5 (Units 6-7 have no illustrations), SM Test Your Knowledge and ICAI Practice Questions; past papers that asked each adjustment are named in its list (Asked:).", code)
code = code.replace("print(len(order)", "missing = [k for g in cu['play'].values() for a in g for k in a['q'] if find(k) is None]\nprint('MISSING refs', missing)\nprint(len(order)")
exec(code)
