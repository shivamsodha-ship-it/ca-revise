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

# ---- curation ----
sys.path.insert(0, SP)
from cur import C as CUR
cu = CUR[part]
def key(it, k): return it['src'].startswith(k)
def find(k):
    m = [it for it in items if key(it, k)]
    return m[0] if m else None
for k, c in cu['concept'].items():
    it = find(k)
    if it: it['concept'] = c
items = [it for it in items if not any(key(it, k) for k in cu['drop'])]
items = [it for it in items if P[it['concept']]['g'] in groups_in]
VAR = {}
for parent, v, txt in cu['variants']:
    vi = find(v); pi = find(parent)
    assert pi is not None, ('parent missing', parent)
    if vi is None: print('WARN variant missing', v); continue
    vi['is_var'] = True
    VAR.setdefault(id(pi), []).append((vi['src'], txt))
master = find(cu['master']); assert master is not None
full = [find(k) for k in cu['full']]; assert all(full), cu['full']
for it in full: it['is_full'] = True
master['is_master'] = True
topic = [it for it in items if not it.get('is_var') and not it.get('is_full') and not it.get('is_master')]
gorder = [g[0] for g in cb['groups']]
topic.sort(key=lambda it: (gorder.index(P[it['concept']]['g']), Pidx[it['concept']], RANK[it['kind']], it['order']))
order = topic + full + [master]
for n, it in enumerate(order, 1): it['n'] = n
def qref(k):
    it = find(k)
    if it is None: return None
    if it.get('is_var'):
        par = next(p for p in order if any(s == it['src'] for s, _ in VAR.get(id(p), [])))
        return f'Q{par["n"]} (variant)'
    return f'Q{it["n"]}'

# ---- HTML ----
def split_tables(h, n=26):
    def rep(m):
        t = m.group(0); rows = re.findall(r'<tr>.*?</tr>', t, re.S)
        if len(rows) <= n: return t
        head = rows[0] if '<th' in rows[0] else ''
        body = rows[1:] if head else rows
        return ''.join('<table>' + head + ''.join(body[i:i + n]) + '</table>' for i in range(0, len(body), n))
    return re.sub(r'<table>.*?</table>', rep, h, flags=re.S)
def blocks(h, cls):
    h = split_tables(h)
    b = re.findall(r'<table>.*?</table>|<p>.*?</p>|<ul>.*?</ul>|<ol>.*?</ol>|<h4>.*?</h4>', h, re.S)
    return ''.join(f'<div class="{cls}">{x}</div>' for x in b) if b else f'<div class="{cls}">{h}</div>'
def imgs(lst):
    return ''.join(f'<div class="cbox"><img class="crop" src="file://{SP}/{fn}" style="width:{w*0.3528*0.92:.1f}mm"></div>' for fn, w, h in lst)
E = html.escape
title = 'Ind AS 103 Business Combinations' if part == '103' else 'Ind AS 110 Consolidated Financial Statements'
headtxt = f'Practice · {title}'
FOOT = '<div class="foot"><span></span><span>FR LDR — Ss</span></div></section>'
def sect(tag): return f'<section class="page"><div class="head"><span>{headtxt}</span><span class="tag">{E(tag)}</span></div>'

def item_html(it, label=None):
    o = []
    nref = cu['notes'].get(it['concept'], '')
    lab = label or f'Q{it["n"]}'
    o.append(f'<h3 class="qh">{lab} · {E(P[it["concept"]]["title"])}<span class="src">{E(it["src"])}{" · " + it["type"] if it["type"] else ""} · <b>{E(nref)}</b></span></h3>')
    if it.get('is_full') or it.get('is_master'):
        tl = cu['tests'].get(next((k for k in cu['tests'] if key(it, k)), ''), []) if it.get('is_full') else cu['master_tests']
        if tl: o.append('<div class="tests"><b>Adjustments tested:</b> ' + ' · '.join(tl) + '</div>')
    if it['kind'] in ('sm-ill', 'sm-ex', 'sm-tyk', 'pq'):
        o.append(imgs(it['q']))
        if it['note']: o.append(f'<p class="small">{it["note"]}</p>')
        if it['a']:
            o.append('<h3 class="solh">Solution — ICAI</h3>' if not it.get('is_master') else '<h3 class="solh brk">Master question — solution (ICAI)</h3>')
            o.append(imgs(it['a']))
    else:
        o.append(blocks(it['q'], 'qtxt'))
        sh = ('Solution — app-written (ICAI suggested answer not in the repo; figures match ICAI\'s published key/answer)' if it['note'] == 'app' else 'Solution — ICAI')
        if it.get('is_master'): o.append(f'<h3 class="solh brk">Master question — {sh}</h3>')
        else: o.append(f'<h3 class="solh">{sh}</h3>')
        o.append(blocks(it['a'], 'atxt'))
    vs = VAR.get(id(it))
    if vs:
        o.append('<div class="var"><b>Same type — not repeated here.</b> What changes in each:<ul>' + ''.join(f'<li><b>{E(s)}</b> — {t}</li>' for s, t in vs) + '</ul></div>')
    return o

def play_html(g):
    o = []
    pl = cu['play'].get(g, [])
    if not pl: return o
    o.append(f'<h2 class="brk"><span class="n">{g}</span>Adjustments in this topic — what to do</h2>')
    for a in pl:
        refs = [r for r in (qref(k) for k in a['q']) if r]
        o.append('<div class="adj">'
                 f'<div class="at">{a["t"]}<span class="an">{E(a["n"])} · practise: {", ".join(refs)}</span></div>'
                 f'<p><b>When:</b> {a["when"]}</p>'
                 '<ol>' + ''.join(f'<li>{s}</li>' for s in a['do']) + '</ol>'
                 f'<p class="aex"><b>ICAI figures:</b> {a["ex"]}</p></div>')
    return o

H = []
H.append(sect('Questions + full solutions'))
H.append(f'<h1><span class="u">{title}</span> — practice sheet</h1>')
H.append('<div class="sub"><b>How to use:</b> each topic starts with ICAI\'s small illustrations and questions (cover the solution, solve, check). '
         'Questions that repeat an earlier one are <b>not printed again</b> — the box under the original lists each repeat and what changes. '
         'Each topic ends with <b>"Adjustments in this topic — what to do"</b>: the steps for every adjustment, ICAI\'s figures, the notes section to re-read, and the question numbers to practise. '
         'Then come the <b>full-scale questions</b>, and last the <b>master question</b> — do it timed, without looking, to see if you are ready.</div>')
H.append('<div class="sub">Every question header shows its concept and the <b>notes section and page</b> (pages = this PDF\'s notes part, which comes first). '
         'SM illustrations, SM TYK and ICAI Practice Questions are ICAI\'s printed pages; RTP / MTP / past papers are ICAI\'s text and answers; solutions marked app-written are mine.</div>')
if part == '110':
    H.append('<p class="small">Scope: Ind AS 110. Ind AS 28 associates, Ind AS 111 joint arrangements and Ind AS 27 / 112 are not included.</p>')
H.append('<h2>Index</h2>')
rows = []
cur_g = None
for it in order:
    sec = 'Full-scale' if it.get('is_full') else ('MASTER' if it.get('is_master') else P[it['concept']]['g'])
    nv = len(VAR.get(id(it), []))
    rows.append(f'<tr><td>Q{it["n"]}</td><td>{E(sec)}</td><td>{E(P[it["concept"]]["title"])}</td><td>{E(it["src"])}{" (+" + str(nv) + " repeat" + ("s" if nv > 1 else "") + ")" if nv else ""}</td></tr>')
for i in range(0, len(rows), 22):
    H.append('<table class="tight idx"><tr><th style="width:7%">No.</th><th style="width:9%">Topic</th><th style="width:40%">Concept</th><th>Source</th></tr>' + ''.join(rows[i:i + 22]) + '</table>')
H.append(FOOT)

curg = None
for it in topic:
    g = P[it['concept']]['g']
    if g != curg:
        if curg is not None:
            H.extend(play_html(curg)); H.append(FOOT)
        H.append(sect(G[g]))
        H.append(f'<h2 class="brk"><span class="n">{g}</span>{E(G[g])}</h2>')
        curg = g
    H.extend(item_html(it))
H.extend(play_html(curg)); H.append(FOOT)
H.append(sect('Full-scale questions'))
H.append('<h2 class="brk"><span class="n">F</span>Full-scale questions</h2>')
H.append('<p class="small">Exam-length questions. Each lists the adjustments it tests — if one trips you, go to that topic\'s "what to do" list and the notes section shown.</p>')
for it in full: H.extend(item_html(it))
H.append(FOOT)
H.append(sect('Master question'))
H.append('<h2 class="brk"><span class="n">M</span>Master question — test yourself</h2>')
H.append('<div class="sticky">Do this last. Close the notes, set a timer (14 marks ≈ 25 minutes), write the full answer with working notes, then check against the solution on the next page. '
         'For every adjustment you missed, go back to the topic list shown in brackets and redo its practice questions.</div>')
H.extend(item_html(master, label=f'Q{master["n"]} · MASTER'))
H.append(FOOT)

head = open(f'{SP}/../head.html').read().replace('Ind AS 103 SM LDR', f'Practice {part}')
css = '''<style>
 h3.qh { font-size: 17px; margin: 14px 0 4px; padding: 3px 8px; background: var(--hl-b, #dceeff); border-radius: 6px; }
 h3.qh .src { display: block; font-family: 'Patrick'; font-size: 13px; font-weight: normal; color: #444; }
 h3.solh { font-size: 15px; color: var(--green, #1d7a3a); margin: 8px 0 2px; border-top: 2px dashed var(--green, #1d7a3a); padding-top: 3px; }
 .cbox { margin: 0 0 3px; }
 img.crop { display: block; max-width: 100%; max-height: 236mm; background: #fff; border: 1px solid #ccd; }
 .qtxt, .atxt { font-family: Arial, Helvetica, sans-serif; font-size: 11.5px; line-height: 16px; }
 .qtxt p, .atxt p { margin: 0 0 5px; }
 .qtxt table, .atxt table { font-family: Arial, Helvetica, sans-serif; font-size: 11px; line-height: 14px; margin: 0 0 6px; }
 .qtxt td, .atxt td, .qtxt th, .atxt th { padding: 1px 5px; }
 table.idx { font-size: 11px; }
 .var { font-size: 12.3px; border: 2px solid #c98a1b; background: #fff6e0; border-radius: 8px; padding: 3px 10px; margin: 6px 0 10px; }
 .var ul { margin: 2px 0; }
 .tests { font-size: 12.5px; background: #eef7ee; border-left: 4px solid var(--green, #1d7a3a); padding: 2px 8px; margin: 0 0 6px; }
 .adj { border: 1.5px solid var(--ink); border-radius: 8px; padding: 2px 10px 4px; margin: 0 0 8px; background: rgba(255,255,255,.7); font-size: 12.8px; }
 .adj .at { font-family: 'Kalam', cursive; font-size: 16px; font-weight: 700; color: var(--red); }
 .adj .an { display: block; font-family: 'Patrick'; font-size: 12.5px; font-weight: normal; color: #333; }
 .adj p { margin: 1px 0; } .adj ol { margin: 2px 0 2px 18px; padding: 0; } .adj li { margin: 0; }
 .adj .aex { background: rgba(191,227,255,.35); padding: 1px 6px; border-radius: 4px; }
</style>'''
open(out, 'w').write(head.replace('</style></head>', '</style>' + css + '</head>') + '\n'.join(H) + '</body></html>')
print(len(order), 'questions shown;', sum(len(v) for v in VAR.values()), 'repeats folded;', len(full), 'full-scale; master', master['src'])
