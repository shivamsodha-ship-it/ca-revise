"""AFM chapter practice pack: SM illustrations, TYK theory (with the SM paragraph ICAI refers to) and TYK practical, all cropped verbatim.
usage: python3 buildafm.py <chapter no> out.html"""
import sys, os, re, html, json
SP = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, SP)
os.chdir(SP)
from crop import Doc
E = html.escape
n = int(sys.argv[1]); OUT = sys.argv[2]
TITLES = {1: 'Financial Policy and Corporate Strategy', 2: 'Risk Management', 3: 'Advanced Capital Budgeting Decisions', 4: 'Security Analysis', 5: 'Security Valuation',
          6: 'Portfolio Management', 7: 'Securitization', 8: 'Mutual Funds', 9: 'Derivatives Analysis and Valuation', 10: 'Foreign Exchange Exposure and Risk Management',
          11: 'International Financial Management', 12: 'Interest Rate Risk Management', 13: 'Business Valuation', 14: 'Mergers, Acquisitions and Corporate Restructuring', 15: 'Startup Finance'}
T = f'Ch {n} {TITLES[n]}'
D = Doc(f'{SP}/../afm/c{n:02d}.pdf')
def pos(r): return (r[0], r[1])
for _i, _r in enumerate(D.L):  # main headings print the number ('4.') and the title as separate lines on the same row
    if _r[5] and re.match(r'^\d+(\.\d+)*\.?$', _r[4]) and _i + 1 < len(D.L):
        _n = D.L[_i + 1]
        if _n[0] == _r[0] and abs(_n[1] - _r[1]) < 4: D.L[_i] = _r[:4] + (_r[4] + ' ' + _n[4], True)
END = (D.d.page_count - 1, 9999)
def first(pred, after=(0, 0), before=END):
    for r in D.L:
        if after <= pos(r) < before and pred(r): return r
    return None
tyk = first(lambda r: r[4].upper().startswith('TEST YOUR KNOWLEDGE'))
TY = pos(tyk) if tyk else END
HEAD = re.compile(r'^(\d+(?:\.\d+)*)\.?\s+\S')
def is_head(r):
    m = HEAD.match(r[4])
    if not (r[5] and r[3] < 110 and m and pos(r) < TY): return None
    lab = m.group(1)
    if '.' not in lab and not re.match(r'^\d+\.\s+[A-Z][A-Z\s,&/\'’()\-:]{3,}', r[4]): return None  # main headings are upper case
    return lab
heads = [(pos(r), is_head(r), re.sub(r'\s+', ' ', r[4])) for r in D.L if is_head(r)]
ILL = re.compile(r'^Illustration\s*\d+', re.I)
anc = [r for r in D.L if r[5] and r[3] < 110 and ILL.match(r[4]) and pos(r) < TY]
sols = [pos(r) for r in D.L if r[5] and r[3] < 110 and re.match(r'^Solution\b', r[4])]
stops = sorted(set([h[0] for h in heads] + [pos(r) for r in anc] + [TY]))
items = []
for i, a in enumerate(anc):
    pa = pos(a); nxt = [s for s in stops if s > pa][0]
    so = [s for s in sols if pa < s < nxt]
    sec = [h for h in heads if h[0] < pa and '.' not in h[1]]
    sub = [h for h in heads if h[0] < pa]
    secname = sec[-1][2].title() if sec else 'General'
    q = D.crop(pa, so[0] if so else nxt, f'a{n}i{i}q'); s = D.crop(so[0], nxt, f'a{n}i{i}a') if so else []
    items.append(dict(sec=secname, src=f'SM Ch {n} · {a[4].strip()[:60]}' + (f' (under {sub[-1][2][:60]})' if sub and '.' in sub[-1][1] else ''), q=q, a=s))
def numbered(a, b, tag):
    A = []; k = 1
    for r in D.L:
        if a <= pos(r) < b and r[3] < 80 and re.match(rf'^{k}\.(\s|$)', r[4]):
            A.append(r); k += 1
    return [(i + 1, pos(r), pos(A[i + 1]) if i + 1 < len(A) else b) for i, r in enumerate(A)]
theory, prac = [], []
if tyk:
    tq = first(lambda r: r[4].startswith('Theoretical Questions'), TY)
    pq = first(lambda r: r[4].startswith('Practical Questions'), TY)
    ans = first(lambda r: r[4].upper().startswith('ANSWERS'), TY)
    ta = first(lambda r: r[4].startswith('Answers to Theoretical'), TY)
    pa_ = first(lambda r: re.match(r'^Answers to (the )?Practical', r[4]) or r[4].startswith('Solutions to Practical'), TY)
    ANS = pos(ans) if ans else END
    if tq:
        Q = numbered(pos(tq), pos(pq) if pq else ANS, f't{n}q')
        A = numbered(pos(ta), pos(pa_) if pa_ else END, f't{n}a') if ta else []
        for (k, qa, qb), ar in zip(Q, A + [None] * (len(Q) - len(A))):
            qi = D.crop(qa, qb, f'a{n}tq{k}')
            atxt = D.text(ar[1], ar[2]) if ar else ''
            refs = re.findall(r'\b(\d+(?:\.\d+)+|\d+)\b', atxt.split('paragraph', 1)[1]) if 'paragraph' in atxt.lower() else []
            crops = []
            if ar and not refs: crops.append(('ICAI answer', D.crop(ar[1], ar[2], f'a{n}ta{k}')))
            for ref in refs[:3]:
                hs = [h for h in heads if h[1] == ref]
                if not hs: crops.append((f'ICAI: "refer paragraph {ref}" (heading not found in the SM text)', [])); continue
                h = hs[0]; dep = ref.count('.')
                nx = [g[0] for g in heads if g[0] > h[0] and g[1].count('.') <= dep] + [TY]
                crops.append((f'ICAI answer: "Please refer paragraph {ref}" — SM paragraph {ref} reproduced', D.crop(h[0], min(nx), f'a{n}ta{k}_{ref}')))
            theory.append(dict(k=k, q=qi, a=crops))
    if pq:
        Q = numbered(pos(pq), ANS, f'p{n}q')
        A = numbered(pos(pa_), END, f'p{n}a') if pa_ else []
        for (k, qa, qb), ar in zip(Q, A + [None] * (len(Q) - len(A))):
            prac.append(dict(k=k, q=D.crop(qa, qb, f'a{n}pq{k}'), a=D.crop(ar[1], ar[2], f'a{n}pa{k}') if ar else []))
# past papers from weightage
W = json.load(open('/home/user/ca-revise/data/lastday/weightage.json'))['afm']
row = [r for r in W['rows'] if r['unit'].startswith(f'Ch {n} ')]
H = []
def imgs(lst): return ''.join(f'<div class="cbox"><img class="crop" src="file://{SP}/{fn}" style="width:{w*0.3528*0.92:.1f}mm"></div>' for fn, w, h in lst)
def sect(tag): return f'<section class="page"><div class="head"><span>AFM · {E(T)}</span><span class="tag">{E(tag)}</span></div>'
FOOT = '<div class="foot"><span></span><span>AFM LDR — Ss</span></div></section>'
H.append(sect('Past papers'))
H.append(f'<h2 class="brk"><span class="n">{n}</span>{E(TITLES[n])} — what ICAI asked (Sep 2025, Jan 2026, May 2026)</h2>')
if row:
    r = row[0]
    H.append(f'<p class="small"><b>{r["total"]} marks</b> set across the last three attempts ({r["pct"]}% of marks set). Question labels and marks are ICAI\'s; the one-line concept descriptions are app-written.</p>')
    H.append('<table class="tight"><tr><th style="width:13%">Attempt</th><th style="width:13%">Question</th><th style="width:7%">Marks</th><th>Concept tested</th></tr>')
    for it in r['items']:
        H.append(f'<tr><td>{E(it["a"])}</td><td>{E(it["q"])}</td><td>{it["m"]}</td><td>{E(it["c"])} <i>({E(it["t"])})</i></td></tr>')
    H.append('</table>')
H.append('<p class="small">What follows, exactly as ICAI printed it in the AFM study material: (1) Test Your Knowledge theory questions, with the SM paragraph ICAI\'s answer points to; (2) every SM illustration with ICAI\'s solution, grouped by SM section; (3) Test Your Knowledge practical questions with ICAI\'s solutions.</p>')
H.append(FOOT)
qn = 0
if theory:
    H.append(sect('Theory — TYK with ICAI answers'))
    H.append(f'<h2 class="brk"><span class="n">T</span>Theory questions (SM Test Your Knowledge) with ICAI answers</h2>')
    for t in theory:
        H.append(f'<h3 class="qh">Theory Q{t["k"]}</h3>'); H.append(imgs(t['q']))
        for lab, c in t['a']:
            H.append(f'<h3 class="solh">{E(lab)}</h3>'); H.append(imgs(c))
    H.append(FOOT)
if items:
    H.append(sect('SM illustrations with ICAI solutions'))
    H.append(f'<h2 class="brk"><span class="n">I</span>SM illustrations with ICAI solutions</h2>')
    cur = None
    for x in items:
        if x['sec'] != cur: H.append(f'<h3 class="sech">{E(x["sec"])}</h3>'); cur = x['sec']
        H.append(f'<h3 class="qh">{E(x["src"])}</h3>'); H.append(imgs(x['q']))
        if x['a']: H.append('<h3 class="solh">Solution — ICAI</h3>'); H.append(imgs(x['a']))
    H.append(FOOT)
if prac:
    H.append(sect('TYK practical with ICAI solutions'))
    H.append(f'<h2 class="brk"><span class="n">P</span>Practical questions (SM Test Your Knowledge) with ICAI solutions</h2>')
    for x in prac:
        H.append(f'<h3 class="qh">Practical Q{x["k"]}</h3>'); H.append(imgs(x['q']))
        if x['a']: H.append('<h3 class="solh">Solution — ICAI</h3>'); H.append(imgs(x['a']))
    H.append(FOOT)
head = open(f'{SP}/../head.html').read().replace('Ind AS 103 SM LDR', 'AFM practice')
css = '''<style>
 h3.qh { font-size: 15px; margin: 12px 0 4px; padding: 3px 8px; background: var(--hl-b, #dceeff); border-radius: 6px; }
 h3.sech { font-size: 17px; color: var(--red); margin: 14px 0 2px; border-bottom: 2px solid var(--red); }
 h3.solh { font-size: 14px; color: var(--green, #1d7a3a); margin: 6px 0 2px; border-top: 2px dashed var(--green, #1d7a3a); padding-top: 3px; }
 .cbox { margin: 0 0 3px; }
 img.crop { display: block; max-width: 100%; max-height: 236mm; background: #fff; border: 1px solid #ccd; }
 table.tight td, table.tight th { font-size: 12px; line-height: 16.5px; }
</style>'''
open(OUT, 'w').write(head.replace('</style></head>', '</style>' + css + '</head>') + '\n'.join(H) + '</body></html>')
print(f'ch{n}: illus {len(items)} (no sol {sum(1 for x in items if not x["a"])}), theory {len(theory)} (unresolved {sum(1 for t in theory for l, c in t["a"] if not c)}; no ans {sum(1 for t in theory if not t["a"])}), practical {len(prac)} (no sol {sum(1 for x in prac if not x["a"])})')
