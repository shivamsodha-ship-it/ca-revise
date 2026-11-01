"""Build practice sheets for Ind AS 103 and Ind AS 110.
SM / Practice-Question items: cropped from ICAI PDFs (exactly as printed).
RTP / MTP / past-paper items: ICAI text from data/fr/ch1x-casebook.json.
Usage: python3 build.py <part 103|110> <out.html>
"""
import sys, json, re, os, html
from crop import Doc

SP = os.path.dirname(os.path.abspath(__file__))
REPO = '/home/user/ca-revise'
part, out = sys.argv[1], sys.argv[2]
U8 = [os.path.join('/root/.claude/uploads', d, '5f2f0345-CA-Final-FR-Ed2-Ch13-U8.pdf') for d in os.listdir('/root/.claude/uploads')
      if os.path.exists(os.path.join('/root/.claude/uploads', d, '5f2f0345-CA-Final-FR-Ed2-Ch13-U8.pdf'))][0]

def anchors(D, pat, rng=None, maxx=None):
    res = []
    for r in D.L:
        if rng and not (rng[0] <= (r[0], r[1]) < rng[1]): continue
        if maxx is not None and r[3] > maxx: continue
        if re.match(pat, r[4]): res.append(r)
    return res

def illus(D, tag, extra_end=None):
    """Return list of dicts num,title,q,a (crop lists) for every Illustration in D."""
    ill = anchors(D, r'^Illustration\s*\d+', maxx=110)
    stops = anchors(D, r'^(Illustration\s*\d+|Example\s*\d+|TEST YOUR KNOWLEDGE)', maxx=200)
    stars = anchors(D, r'^\*{3,}')
    sols = anchors(D, r'^Solution', maxx=110)
    items = []
    for i, a in enumerate(ill):
        pa = (a[0], a[1])
        nxt = [(s[0], s[1]) for s in stops if (s[0], s[1]) > pa]
        nxt = nxt[0] if nxt else (D.d.page_count - 1, 9999)
        if extra_end:
            for e in extra_end:
                if pa < e < nxt: nxt = e
        sol = [(s[0], s[1]) for s in sols if pa < (s[0], s[1]) < nxt]
        st = [(s[0], s[1]) for s in stars if pa < (s[0], s[1]) < nxt]
        end = st[0] if st else nxt
        name = f'{tag}_I{i+1}'
        if sol:
            q = D.crop(pa, sol[0], name + 'q'); s = D.crop(sol[0], end, name + 'a')
        else:
            q = D.crop(pa, end, name + 'q'); s = []
        title = a[4]
        items.append(dict(seq=i + 1, title=title, q=q, a=s))
    return items

def numbered(D, sec_start, sec_end, tag):
    """Numbered questions/answers between two (pno,y) points; anchors 'N.' at left margin."""
    an = anchors(D, r'^\d{1,2}\.(\s|$)', rng=(sec_start, sec_end), maxx=75)
    res = []
    for i, a in enumerate(an):
        s = (a[0], a[1]); e = (an[i + 1][0], an[i + 1][1]) if i + 1 < len(an) else sec_end
        res.append(D.crop(s, e, f'{tag}_{i+1}'))
    return res

def pos(r): return (r[0], r[1])

cb = json.load(open(f'{REPO}/data/fr/ch{"12" if part=="103" else "13"}-casebook.json'))
P = {p['id']: p for p in cb['P']}
Pidx = {p['id']: i for i, p in enumerate(cb['P'])}
G = dict((g[0], g[1]) for g in cb['groups'])
CBQ = {q['id']: q for q in cb['Q']}
items = []  # dict(concept, src, kind, q, a, rank, order, type)
RANK = {'sm-ex': 0, 'sm-ill': 0, 'sm-tyk': 1, 'pq': 2, 'rtp': 3, 'mtp': 4, 'pyq': 5}

def add(concept, src, kind, q, a, typ='', note=''):
    items.append(dict(concept=concept, src=src, kind=kind, q=q, a=a, type=typ, note=note, order=len(items)))

if part == '103':
    D = Doc(f'{SP}/../sm12/ch12.pdf')
    end40 = pos(anchors(D, r'^Relevant Extracts')[0])
    for it in illus(D, 'c12', extra_end=[end40]):
        q = CBQ.get(f'I{it["seq"]}')
        add(q['links'][0], f'SM Ch 12 · {it["title"]}', 'sm-ill', it['q'], it['a'], q['v'])
    # Examples 1-7 (business test, concentration test)
    exs = anchors(D, r'^Example\s*[1-7]\b', maxx=110)
    stops = anchors(D, r'^(Illustration\s*\d+|Example\s*\d+)', maxx=110)
    for e in exs[:7]:
        nxt = [pos(s) for s in stops if pos(s) > pos(e)][0]
        add('bc-business', f'SM Ch 12 · {e[4]}', 'sm-ex', D.crop(pos(e), nxt, 'c12ex' + e[4].split()[1].strip(':')), [], 'Theory',
            note='ICAI example — the facts and ICAI\'s analysis are printed together.')
    tyk = pos(anchors(D, r'^Questions$', rng=((119, 0), (200, 0)))[0]); ans = pos(anchors(D, r'^Answers$', rng=((119, 0), (200, 0)))[0])
    Qs = numbered(D, tyk, ans, 'c12tq'); As = numbered(D, ans, (D.d.page_count - 1, 9999), 'c12ta')
    over = {1: 'bc-step', 2: 'bc-reverse'}
    for i, (q, a) in enumerate(zip(Qs, As)):
        c = CBQ[f'T{i+1}']
        add(over.get(i + 1, c['links'][0]), f'SM Ch 12 · Test Your Knowledge Q{i+1}', 'sm-tyk', q, a, c['v'])
    PQ = Doc(f'{SP}/../pq/pq13.pdf')
    c13 = pos(anchors(PQ, r'^CHAPTER-13')[0])
    qs = pos(anchors(PQ, r'^Questions$')[0]); an = pos(anchors(PQ, r'^Answers$')[0])
    Qs = numbered(PQ, qs, an, 'pq12q'); As = numbered(PQ, an, c13, 'pq12a')
    pqc = ['bc-intangibles', 'bc-measure', 'bc-business', 'bc-sbp', 'bc-goodwill', 'bc-employees', 'bc-nci', 'bc-intangibles', 'bc-business', 'bc-step']
    for i, (q, a) in enumerate(zip(Qs, As)):
        add(pqc[i], f'ICAI Practice Questions · Ch 12 Q{i+1}', 'pq', q, a)
    groups_in = 'ABCDEFGJ'
else:
    D3 = Doc(f'{SP}/../sm13/83342bos67375-cp13u3.pdf'); D4 = Doc(f'{SP}/../sm13/83343bos67375-cp13u4.pdf')
    for it in illus(D3, 'c13u3'):
        q = CBQ.get(f'U3-I{it["seq"]}')
        add(q['links'][0], f'SM Ch 13 Unit 3 · {it["title"]}', 'sm-ill', it['q'], it['a'], q['v'])
    for it in illus(D4, 'c13u4'):
        n = int(re.match(r'Illustration\s*(\d+)', it['title']).group(1))
        q = CBQ.get(f'U4-I{n}')
        add(q['links'][0] if q else 'cfs-gw-nci', f'SM Ch 13 Unit 4 · {it["title"]}', 'sm-ill', it['q'], it['a'], q['v'] if q else '')
    D8 = Doc(U8)
    qs = pos(anchors(D8, r'^Questions$')[0]); an = pos(anchors(D8, r'^Answers$')[0])
    Qs = numbered(D8, qs, an, 'c13tq'); As = numbered(D8, an, (D8.d.page_count - 1, 9999), 'c13ta')
    for i, (q, a) in enumerate(zip(Qs, As)):
        c = CBQ[f'U8-T{i+1}']
        if i + 1 == 3: continue  # associate-only (Ind AS 28)
        lk = 'cfs-chain' if i + 1 == 2 else c['links'][0]
        add(lk, f'SM Ch 13 · Test Your Knowledge Q{i+1}', 'sm-tyk', q, a, c['v'])
    PQ = Doc(f'{SP}/../pq/pq13.pdf')
    c13 = pos(anchors(PQ, r'^CHAPTER-13')[0]); c14 = pos(anchors(PQ, r'^CHAPTER-14')[0])
    qs = pos(anchors(PQ, r'^Questions$', rng=(c13, c14))[0]); an = pos(anchors(PQ, r'^Answers$', rng=(c13, c14))[0])
    Qs = numbered(PQ, qs, an, 'pq13q'); As = numbered(PQ, an, c14, 'pq13a')
    pqc = {1: 'cfs-intragroup', 2: 'cfs-loss', 5: 'cfs-scope', 8: 'cfs-voting', 10: 'cfs-gw-nci', 11: 'cfs-intragroup', 12: 'cfs-gw-nci', 14: 'cfs-gw-nci'}
    for i, (q, a) in enumerate(zip(Qs, As)):
        if i + 1 in pqc: add(pqc[i + 1], f'ICAI Practice Questions · Ch 13 Q{i+1}', 'pq', q, a)
    groups_in = 'ABCDEH'

# ---- RTP / MTP / past papers from the casebook ----
APP = {}
APP['P5'] = ('<p><b>ICAI answer key: (B) ₹ 187.60 lakhs.</b></p>'
    '<p>Working (app-written, reproduces ICAI\'s key):</p><table><tr><th>Particulars</th><th>₹ lakhs</th></tr>'
    '<tr><td>Agreed total consideration</td><td>200.00</td></tr>'
    '<tr><td>Less: reimbursement of sellers\' transaction cost — acquisition-related cost, expensed (not consideration)</td><td>(4.00)</td></tr>'
    '<tr><td>Less: salary to two shareholders as general managers for post-combination service: ₹ 40,000 × 4 quarters × 2 years × 2 persons — employee benefit expense</td><td>(6.40)</td></tr>'
    '<tr><td>Less: settlement of pre-existing legal case — accounted separately (Ind AS 103.51–52)</td><td>(2.00)</td></tr>'
    '<tr><td><b>Consideration for the business combination</b></td><td><b>187.60</b></td></tr></table>')
APP['P12'] = ('<p><b>ICAI answer key: (A) ₹ 970 lakhs.</b></p><p>Working (app-written, reproduces ICAI\'s key):</p>'
    '<table><tr><th>Particulars</th><th>₹ lakhs</th></tr><tr><td>Sale proceeds</td><td>2,000</td></tr>'
    '<tr><td>Less: net assets derecognised 1,500 less NCI derecognised 200</td><td>(1,300)</td></tr>'
    '<tr><td>Add: parent\'s share of FCTR reclassified to P&amp;L (NCI\'s 30 is not reclassified)</td><td>270</td></tr>'
    '<tr><td><b>Gain on disposal</b></td><td><b>970</b></td></tr></table>')
APP['P6'] = open(f'{SP}/may26q1.html').read() if part == '103' else ''
skip = {'103': {'K3'}, '110': set()}[part]
for q in cb['Q']:
    if q['k'] not in ('rtp', 'mtp', 'pyq') or q['id'] in skip: continue
    g = P[q['links'][0]]['g']
    if g not in groups_in: continue
    a = q['a']; note = ''
    if 'has not yet published' in a:
        if q['id'] not in APP or not APP[q['id']]: continue
        a = APP[q['id']]; note = 'app'
    add(q['links'][0], q['src'], q['k'], q['q'], a, 'Numerical' if (part=='103' and q['id']=='P6') else q['v'], note)

items = [it for it in items if P[it['concept']]['g'] in groups_in]
gorder = [g[0] for g in cb['groups']]
items.sort(key=lambda it: (gorder.index(P[it['concept']]['g']), Pidx[it['concept']], RANK[it['kind']], it['order']))

# ---- HTML ----
def split_tables(h, n=26):
    def rep(m):
        t = m.group(0); rows = re.findall(r'<tr>.*?</tr>', t, re.S)
        if len(rows) <= n: return t
        head = rows[0] if '<th' in rows[0] else ''
        body = rows[1:] if head else rows
        chunks = [body[i:i + n] for i in range(0, len(body), n)]
        return ''.join('<table>' + head + ''.join(c) + '</table>' for c in chunks)
    return re.sub(r'<table>.*?</table>', rep, h, flags=re.S)

def imgs(lst):
    return ''.join(f'<img class="crop" src="file://{SP}/{fn}" style="width:{w*0.3528*0.92:.1f}mm">' for fn, w, h in lst)

KN = {'sm-ill': 'SM Illustration', 'sm-ex': 'SM Example', 'sm-tyk': 'SM Test Your Knowledge', 'pq': 'ICAI Practice Questions',
      'rtp': 'RTP', 'mtp': 'MTP', 'pyq': 'Past paper'}
title = 'Ind AS 103 Business Combinations' if part == '103' else 'Ind AS 110 Consolidated Financial Statements'
headtxt = f'Practice sheet · {title}'
H = []
H.append(f'<section class="page"><div class="head"><span>{headtxt}</span><span class="tag">Questions + full solutions</span></div>')
H.append(f'<h1><span class="u">{title}</span> — practice sheet</h1>')
H.append('<div class="sub">Every question comes with its full solution, straight after it. <b>Cover the solution, solve by hand, then check.</b> '
         'SM illustrations, SM Test Your Knowledge and ICAI Practice Questions are reproduced exactly as ICAI printed them (page images). '
         'RTP, MTP and past-paper questions are ICAI\'s text with ICAI\'s suggested answers. Where ICAI\'s answer is not available, the solution is marked <b>app-written</b>. '
         'Questions are grouped by concept; inside each concept: SM first, then Practice Questions, RTPs, MTPs and past papers.</div>')
if part == '110':
    H.append('<p class="small">Scope: Ind AS 110 (control, investment entities, consolidation procedure, changes in stake, loss of control). Ind AS 28 associates, Ind AS 111 joint arrangements and Ind AS 27/112 are not included.</p>')
H.append('<h2>Index</h2>')
rows = []
for n, it in enumerate(items, 1):
    it['n'] = n
    rows.append(f'<tr><td>Q{n}</td><td>{html.escape(P[it["concept"]]["title"])}</td><td>{html.escape(it["src"])}</td><td>{it["type"]}</td></tr>')
for i in range(0, len(rows), 20):
    H.append('<table class="tight idx"><tr><th style="width:8%">No.</th><th style="width:44%">Concept</th><th>Source</th><th style="width:11%">Type</th></tr>' + ''.join(rows[i:i + 20]) + '</table>')
H.append('<div class="foot"><span></span><span>FR LDR — Ss</span></div></section>')

curg = None
for it in items:
    g = P[it['concept']]['g']
    if g != curg:
        if curg is not None: H.append('<div class="foot"><span></span><span>FR LDR — Ss</span></div></section>')
        H.append(f'<section class="page"><div class="head"><span>{headtxt}</span><span class="tag">{html.escape(G[g])}</span></div>')
        H.append(f'<h2 class="brk"><span class="n">{g}</span>{html.escape(G[g])}</h2>')
        curg = g
    H.append(f'<h3 class="qh">Q{it["n"]} · {html.escape(P[it["concept"]]["title"])}<span class="src">{html.escape(it["src"])}{" · " + it["type"] if it["type"] else ""}</span></h3>')
    if it['kind'] in ('sm-ill', 'sm-ex', 'sm-tyk', 'pq'):
        H.append(f'<div class="qbox">{imgs(it["q"])}</div>' if len(it['q']) == 1 else ''.join(f'<div class="qbox">{imgs([c])}</div>' for c in it['q']))
        if it['note']: H.append(f'<p class="small">{it["note"]}</p>')
        if it['a']:
            H.append('<h3 class="solh">Solution — ICAI</h3>')
            H.extend(f'<div class="abox">{imgs([c])}</div>' for c in it['a'])
    else:
        qh = split_tables(it['q'])
        H.append('<div class="qtxt">' + qh + '</div>')
        H.append('<h3 class="solh">' + ('Solution — app-written (ICAI suggested answer not in the repo; figures match ICAI\'s published key/answer)' if it['note'] == 'app' else 'Solution — ICAI') + '</h3>')
        ah = split_tables(it['a'])
        # put each top-level p/table as its own block so pages can break between them
        for blk in re.findall(r'<table>.*?</table>|<p>.*?</p>|<ul>.*?</ul>|<ol>.*?</ol>|<h4>.*?</h4>', ah, re.S):
            H.append(f'<div class="atxt">{blk}</div>')
H.append('<div class="foot"><span></span><span>FR LDR — Ss</span></div></section>')

head = open(f'{SP}/../head.html').read().replace('Ind AS 103 SM LDR', f'Practice {part}')
css = '''<style>
 h3.qh { font-size: 17px; margin: 14px 0 4px; padding: 3px 8px; background: var(--hl-b, #dceeff); border-radius: 6px; }
 h3.qh .src { display: block; font-family: 'Patrick'; font-size: 13px; font-weight: normal; color: #555; }
 h3.solh { font-size: 15px; color: var(--green, #1d7a3a); margin: 8px 0 2px; border-top: 2px dashed var(--green, #1d7a3a); padding-top: 3px; }
 .qbox, .abox { margin: 0 0 3px; }
 img.crop { display: block; max-width: 100%; max-height: 236mm; background: #fff; border: 1px solid #ccd; }
 .qtxt, .atxt { font-family: Arial, Helvetica, sans-serif; font-size: 11.5px; line-height: 16px; }
 .qtxt p, .atxt p { margin: 0 0 5px; }
 .qtxt table, .atxt table { font-family: Arial, Helvetica, sans-serif; font-size: 11px; line-height: 14px; margin: 0 0 6px; }
 .qtxt td, .atxt td, .qtxt th, .atxt th { padding: 1px 5px; }
 table.idx { font-size: 11.5px; }
</style>'''
# the split above puts the whole question text in one block: split it too
body = '\n'.join(H)
def splitq(m):
    inner = m.group(1)
    blks = re.findall(r'<table>.*?</table>|<p>.*?</p>|<ul>.*?</ul>|<ol>.*?</ol>', inner, re.S)
    return ''.join(f'<div class="qtxt">{b}</div>' for b in blks) if blks else m.group(0)
body = re.sub(r'<div class="qtxt">(.*?)</div>(?=\n<h3 class="solh">)', splitq, body, flags=re.S)
open(out, 'w').write(head.replace('</style></head>', '</style>' + css + '</head>') + body + '</body></html>')
print(len(items), 'items')
