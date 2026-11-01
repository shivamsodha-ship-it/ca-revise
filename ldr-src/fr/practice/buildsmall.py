import sys, os, re, html, difflib
SP = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, SP)
from exsmall import extract
ORDER = ['40', '41', '113', '105', '108', '20', '21', '116', '101']
TITLE = {'40': 'Ind AS 40 Investment Property', '41': 'Ind AS 41 Agriculture', '113': 'Ind AS 113 Fair Value Measurement',
         '105': 'Ind AS 105 Held for Sale & Discontinued Operations', '108': 'Ind AS 108 Operating Segments', '20': 'Ind AS 20 Government Grants',
         '21': 'Ind AS 21 Foreign Exchange', '116': 'Ind AS 116 Leases', '101': 'Ind AS 101 First-time Adoption'}
E = html.escape
FOOT = '<div class="foot"><span></span><span>FR LDR — Ss</span></div></section>'
def sect(n, tag): return f'<section class="page"><div class="head"><span>FR · {E(TITLE[n])}</span><span class="tag">{E(tag)}</span></div>'
def imgs(lst): return ''.join(f'<div class="cbox"><img class="crop" src="file://{SP}/{fn}" style="width:{w*0.3528*0.92:.1f}mm"></div>' for fn, w, h in lst)
H = []; marks = []
qn = 0
for n in ORDER:
    its = extract(n)
    # fold exact repeats (TYK vs PQ etc.)
    txt = [re.sub(r'^\S+\s', '', re.sub(r'\s+', ' ', x['q'].txt))[:900] for x in its]
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
</style>'''
open(sys.argv[1], 'w').write(head.replace('</style></head>', '</style>' + css + '</head>') + '\n'.join(H) + '</body></html>')
