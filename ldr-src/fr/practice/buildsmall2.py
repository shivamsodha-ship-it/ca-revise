import sys, os, re, html, difflib
SP = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, SP)
from exsmall import extract
ORDER = sys.argv[2].split(',')
TITLE = {'19': 'Ind AS 19 Employee Benefits', '33': 'Ind AS 33 Earnings per Share', '111': 'Ind AS 111 Joint Arrangements', '28': 'Ind AS 28 Associates and Joint Ventures', '27': 'Ind AS 27 Separate Financial Statements', '40': 'Ind AS 40 Investment Property', '41': 'Ind AS 41 Agriculture', '113': 'Ind AS 113 Fair Value Measurement',
         '105': 'Ind AS 105 Held for Sale & Discontinued Operations', '108': 'Ind AS 108 Operating Segments', '20': 'Ind AS 20 Government Grants',
         '21': 'Ind AS 21 Foreign Exchange', '116': 'Ind AS 116 Leases', '101': 'Ind AS 101 First-time Adoption'}
E = html.escape
FOOT = '<div class="foot"><span></span><span>FR LDR — Ss</span></div></section>'
def sect(n, tag): return f'<section class="page"><div class="head"><span>FR · {E(TITLE[n])}</span><span class="tag">{E(tag)}</span></div>'
def imgs(lst): return ''.join(f'<div class="cbox"><img class="crop" src="file://{SP}/{fn}" style="width:{w*0.3528*0.92:.1f}mm"></div>' for fn, w, h in lst)
H = []; marks = []
qn = 0
import json
from crop import Doc
def pos(r): return (r[0], r[1])
def numbered(Dd, a, b, tag):
    A = [r for r in Dd.L if a <= pos(r) < b and r[3] < 75 and re.match(r'^\d{1,2}\.(\s|$)', r[4])]
    return [Dd.crop(pos(r), pos(A[i + 1]) if i + 1 < len(A) else b, f'{tag}_{i+1}') for i, r in enumerate(A)]
U8 = [os.path.join('/root/.claude/uploads', d, '5f2f0345-CA-Final-FR-Ed2-Ch13-U8.pdf') for d in os.listdir('/root/.claude/uploads') if os.path.exists(os.path.join('/root/.claude/uploads', d, '5f2f0345-CA-Final-FR-Ed2-Ch13-U8.pdf'))][0]
TYKSEL = {'111': [1], '28': [2, 3]}; PQSEL = {'111': [4, 9, 13, 15], '28': [3], '27': [6, 7]}; CBG = {'111': 'F', '28': 'G', '27': 'K'}
APP = {'P13': '<p><b>ICAI answer key: (C) ₹ 57,20,000.</b> Working (app-written, reproduces the key): cost 50,00,000 + 45% × year\'s profit 16,00,000 (7,20,000) = 57,20,000. The revaluation of 31 Mar 2025 is before the acquisition on 1 Apr 2025, so it is already reflected in the price paid.</p>',
       'P14': '<p><b>ICAI answer key: (B) ₹ 24,94,000.</b> Working (app-written, reproduces the key): cost 65,50,000 + 40% × (76,00,000 − 52,40,000) = 74,94,000; less downstream unrealised profit 40% × (15,00,000 − 5,00,000) = 4,00,000 → 70,94,000; recoverable 40% × 1,15,00,000 = 46,00,000 → impairment 24,94,000.</p>'}
def extras(n):
    out = []
    if n in TYKSEL:
        D8 = Doc(U8); qs = pos([r for r in D8.L if r[4] == 'Questions'][0]); an = pos([r for r in D8.L if r[4] == 'Answers'][0])
        Q = numbered(D8, qs, an, f'u8q{n}'); A = numbered(D8, an, (D8.d.page_count - 1, 9999), f'u8a{n}')
        for k in TYKSEL[n]: out.append(dict(src=f'SM Ch 13 · Test Your Knowledge Q{k}', kind='sm-tyk', sec='Ch 13 Test Your Knowledge', q=Q[k-1], a=A[k-1]))
    if n in PQSEL:
        PQ = Doc(f'{SP}/../small/pq13.pdf')
        c13 = pos([r for r in PQ.L if r[4].startswith('CHAPTER-13')][0]); c14 = pos([r for r in PQ.L if r[4].startswith('CHAPTER-14')][0])
        qs = pos([r for r in PQ.L if r[4] == 'Questions' and c13 < pos(r) < c14][0]); an = pos([r for r in PQ.L if r[4] == 'Answers' and c13 < pos(r) < c14][0])
        Q = numbered(PQ, qs, an, f'pq13q{n}'); A = numbered(PQ, an, c14, f'pq13a{n}')
        for k in PQSEL[n]: out.append(dict(src=f'ICAI Practice Questions · Ch 13 Q{k}', kind='pq', sec='ICAI Practice Questions (Ch 13)', q=Q[k-1], a=A[k-1]))
    if n in CBG:
        cb = json.load(open('/home/user/ca-revise/data/fr/ch13-casebook.json')); Pg = {p['id']: p['g'] for p in cb['P']}
        for q in cb['Q']:
            if q['k'] in ('rtp', 'mtp', 'pyq') and Pg[q['links'][0]] == CBG[n]:
                a = APP.get(q['id'], q['a'])
                out.append(dict(src=q['src'], kind='txt', sec='RTP / MTP / past papers', q=q['q'], a=a, app=q['id'] in APP))
    return out
class T(str):
    pass
for n in ORDER:
    its = extract(n) + extras(n)
    # fold exact repeats (TYK vs PQ etc.)
    txt = [re.sub(r'^\S+\s', '', re.sub(r'\s+', ' ', x['q'].txt if hasattr(x['q'], 'txt') else re.sub(r'<[^>]+>', ' ', x['q'])))[:900] for x in its]
    rep = {}
    for i in range(len(its)):
        for j in range(i):
            if j not in rep and difflib.SequenceMatcher(None, txt[i], txt[j]).ratio() > 0.9:
                rep[i] = j; break
    H.append(f'<!--MARK {n}-->'); H.append(sect(n, 'Notes'))
    H.append(open(f'{SP}/../sn/n{n}.html').read())
    H.append(FOOT)
    H.append(sect(n, 'Questions with ICAI solutions'))
    H.append(f'<h2 class="brk"><span class="n">Q</span>{E(TITLE[n])} — ICAI questions with solutions</h2>')
    H.append('<p class="small">Every SM illustration and example, SM Test Your Knowledge and ICAI Practice Question for this standard, exactly as ICAI printed them, grouped by SM section. Cover the solution, solve, check.</p>')
    cur = None
    for i, x in enumerate(its):
        if i in rep: continue
        if x['sec'] != cur:
            H.append(f'<h3 class="sech">{E(x["sec"])}</h3>'); cur = x['sec']
        qn += 1
        H.append(f'<h3 class="qh">Q{qn} · {E(x["src"])}</h3>')
        if x['kind'] == 'txt':
            for b in re.findall(r'<table>.*?</table>|<p>.*?</p>|<ul>.*?</ul>', x['q'], re.S): H.append(f'<div class="qtxt">{b}</div>')
            H.append('<h3 class="solh">' + ('Solution — app-written (ICAI answer not in the repo; reproduces ICAI\'s key)' if x.get('app') else 'Solution — ICAI') + '</h3>')
            for b in re.findall(r'<table>.*?</table>|<p>.*?</p>|<ul>.*?</ul>', x['a'], re.S): H.append(f'<div class="atxt">{b}</div>')
            dups = [its[k]['src'] for k, v in rep.items() if v == i]
            if dups: H.append('<div class="var"><b>Not repeated:</b> ' + '; '.join(E(d) for d in dups) + ' — same question, same answer.</div>')
            continue
        H.append(imgs(x['q']))
        if x['kind'] == 'sm-ex': H.append('<p class="small">ICAI example — facts and ICAI\'s analysis are printed together.</p>')
        if x['a']:
            H.append('<h3 class="solh">Solution — ICAI</h3>'); H.append(imgs(x['a']))
        dups = [its[k]['src'] for k, v in rep.items() if v == i]
        if dups: H.append('<div class="var"><b>Not repeated:</b> ' + '; '.join(E(d) for d in dups) + ' — same question, same answer.</div>')
    H.append(FOOT)
    print(n, len(its), 'folded', len(rep))
head = open(f'{SP}/../head.html').read().replace('Ind AS 103 SM LDR', 'FR small chapters')
css = '''<style>
 h3.qh { font-size: 15px; margin: 12px 0 4px; padding: 3px 8px; background: var(--hl-b, #dceeff); border-radius: 6px; }
 h3.sech { font-size: 17px; color: var(--red); margin: 14px 0 2px; border-bottom: 2px solid var(--red); }
 h3.solh { font-size: 14px; color: var(--green, #1d7a3a); margin: 6px 0 2px; border-top: 2px dashed var(--green, #1d7a3a); padding-top: 3px; }
 .cbox { margin: 0 0 3px; }
 img.crop { display: block; max-width: 100%; max-height: 236mm; background: #fff; border: 1px solid #ccd; }
 .var { font-size: 12.3px; border: 2px solid #c98a1b; background: #fff6e0; border-radius: 8px; padding: 3px 10px; margin: 6px 0 10px; }
 table.tight td, table.tight th { font-size: 12px; line-height: 16.5px; }
 .qtxt, .atxt { font-family: Arial, Helvetica, sans-serif; font-size: 11.5px; line-height: 16px; } .qtxt p, .atxt p { margin: 0 0 5px; } .qtxt table, .atxt table { font-family: Arial; font-size: 11px; line-height: 14px; margin: 0 0 6px; }
</style>'''
open(sys.argv[1], 'w').write(head.replace('</style></head>', '</style>' + css + '</head>') + '\n'.join(H) + '</body></html>')
