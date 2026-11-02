"""AFM theory pack: each theory question from Sep 2025, Jan 2026, May 2026 with the SM section(s) it is answered from (page crops)."""
import sys, os, re, html, json
SP = os.path.dirname(os.path.abspath(__file__)); os.chdir(SP)
E = html.escape
SRC = open('buildafm.py').read().split('# past papers from weightage')[0]
CACHE = {}
def load(n):
    if n not in CACHE:
        ns = {'__file__': os.path.join(SP, 'buildafm.py')}; sys.argv = ['buildafm.py', str(n), '/dev/null']; exec(SRC, ns); CACHE[n] = ns
    return CACHE[n]
def crop(n, start, end=None):
    ns = load(n); heads = ns['heads']; D = ns['D']
    h = [x for x in heads if x[1] == start][0]
    if end: stop = [x for x in heads if x[1] == end][0][0]
    else:
        dep = start.count('.'); stop = min([g[0] for g in heads if g[0] > h[0] and g[1].count('.') <= dep] + [ns['TY']])
    return h[2], D.crop(h[0], stop, f'th{n}_{start}')
# (chapter, attempt + question, marks, question as summarised in research/lastday/afm-last3-analysis.md, [(from heading, up to heading)])
Q = [
 (4, 'Sep 2025 Q4(c) [either]', 4, 'Technical analysis: favourable and unfavourable arguments', [('2.10', None)]),
 (4, 'Jan 2026 Q4(c)', 4, 'Technical analysis: identify chart patterns (uptrend, continuation/flag, head and shoulders, triangle/wedge) from descriptions, any four', [('2.8', None)]),
 (4, 'May 2026 Q4(c) [either]', 4, 'Elliott Wave Theory of technical analysis', [('2.4.2', None)]),
 (7, 'Sep 2025 Q3(c)', 4, 'Risks associated with the use of blockchain technology', [('10.2', None)]),
 (7, 'Jan 2026 Q6(c) [or]', 4, 'Securitisation instruments: pass-through, pay-through and stripped securities', [('7', None)]),
 (7, 'May 2026 Q3(c)', 4, 'Securitisation of NPAs: benefit to the balance sheet versus regulatory and valuation challenges', [('11', None)]),
 (15, 'Sep 2025 Q1(c)', 4, 'Steps in a business succession strategy', [('8.3', None)]),
 (15, 'Jan 2026 Q6(c) [either]', 4, 'Role of government in creating a sustainable environment for start-ups in India', [('7', None)]),
 (15, 'May 2026 Q2(c)', 4, 'True/False on start-up finance: valuation of early-stage firms, venture capital staging, bootstrapping, angel investors', [('5.1', None)]),
 (2, 'Sep 2025 Q4(c) [or]', 4, 'Parameters used to identify currency risk', [('1.4.4', None), ('4.4', None)]),
 (2, 'Jan 2026 Q3(c)', 4, 'Political risk: host-government actions that signal it, and techniques to mitigate it', [('1.4.2', None), ('4.2', None)]),
 (1, 'Sep 2025 Q2(c)', 4, 'Key points that make an organisation financially sustainable', [('6', '6.2')]),
 (1, 'May 2026 Q1(c)', 4, 'Sustainable growth rate versus target growth: concerns on an extra loan request and alternative courses of action', [('6.1', None)]),
 (9, 'Jan 2026 Q2(c)', 4, 'Real options versus financial options: underlying asset, pay-off, exercise period, approach', [('9.1', None)]),
 (10, 'May 2026 Q5(c)', 2, 'Why transaction exposure is generally more critical than translation exposure', [('10', '10.3')]),
]
TT = {1: 'Financial Policy and Corporate Strategy', 2: 'Risk Management', 4: 'Security Analysis', 7: 'Securitization', 9: 'Derivatives Analysis and Valuation', 10: 'Foreign Exchange Exposure and Risk Management', 15: 'Startup Finance'}
H = []
def imgs(lst): return ''.join(f'<div class="cbox"><img class="crop" src="file://{SP}/{fn}" style="width:{w*0.3528*0.92:.1f}mm"></div>' for fn, w, h in lst)
H.append('<section class="page"><div class="head"><span>AFM · Theory from the last three papers</span><span class="tag">Theory</span></div>')
H.append('<h2 class="brk"><span class="n">T</span>AFM theory asked in Sep 2025, Jan 2026 and May 2026 — with the SM text</h2>')
H.append('<p class="small">For each theory question: the attempt, question number and marks (ICAI), a one-line summary of the question (app-written), and the SM section(s) the answer comes from, cropped exactly as ICAI printed them. Choosing the section is app judgement; ICAI publishes the answers separately. Ordered by chapter weight in theory.</p>')
H.append('<table class="tight"><tr><th>Ch</th><th>Attempt / Q</th><th>Marks</th><th>Question (summary)</th><th>SM section</th></tr>')
rows = []
for n, q, m, txt, secs in Q:
    names = [crop(n, a, b)[0] for a, b in secs]
    H.append(f'<tr><td>{n}</td><td>{E(q)}</td><td>{m}</td><td>{E(txt)}</td><td>{E("; ".join(names))}</td></tr>')
H.append('</table><div class="foot"><span></span><span>AFM LDR — Ss</span></div></section>')
cur = None
for n, q, m, txt, secs in Q:
    if n != cur:
        H.append(f'<section class="page"><div class="head"><span>AFM · Ch {n} {E(TT[n])} · theory</span><span class="tag">Theory</span></div>'); cur = n
        H.append(f'<h3 class="sech">Ch {n} {E(TT[n])}</h3>')
    H.append(f'<h3 class="qh">{E(q)} · {m} marks — {E(txt)}</h3>')
    for a, b in secs:
        name, c = crop(n, a, b)
        H.append(f'<h3 class="solh">SM {E(name)}' + (f' (up to {b})' if b else '') + '</h3>'); H.append(imgs(c))
    if Q.index((n, q, m, txt, secs)) == len(Q) - 1 or Q[Q.index((n, q, m, txt, secs)) + 1][0] != n:
        H.append('<div class="foot"><span></span><span>AFM LDR — Ss</span></div></section>')
head = open(f'{SP}/../head.html').read().replace('Ind AS 103 SM LDR', 'AFM theory')
css = '''<style>
 h3.qh { font-size: 15px; margin: 12px 0 4px; padding: 3px 8px; background: var(--hl-b, #dceeff); border-radius: 6px; }
 h3.sech { font-size: 17px; color: var(--red); margin: 14px 0 2px; border-bottom: 2px solid var(--red); }
 h3.solh { font-size: 14px; color: var(--green, #1d7a3a); margin: 6px 0 2px; border-top: 2px dashed var(--green, #1d7a3a); padding-top: 3px; }
 .cbox { margin: 0 0 3px; } img.crop { display: block; max-width: 100%; max-height: 236mm; background: #fff; border: 1px solid #ccd; }
 table.tight td, table.tight th { font-size: 12px; line-height: 16.5px; }
</style>'''
open(os.environ['OUTHTML'], 'w').write(head.replace('</style></head>', '</style>' + css + '</head>') + '\n'.join(H) + '</body></html>')
print('ok', len(Q))
