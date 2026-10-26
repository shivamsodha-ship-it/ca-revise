#!/usr/bin/env python3
"""Write data/lastday/<subject>.json for the app from work/lastday (sweep.py + packs.py output).
Usage: python3 scripts/lastday/export.py <fr|afm|aaa>

Everything shown to the student is ICAI text: SM sections, ICAI questions and ICAI answers, verbatim (only
the rupee sign, which the PDF text layer renders as a backtick, is restored). The only things written here are
the labels: what a section is called, which paper a question came from, and how many SM sections it touches."""
import json, re, sys, collections
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
subj = sys.argv[1]
sys.argv = [sys.argv[0], subj]
sys.path.insert(0, str(Path(__file__).parent))

sw = json.load(open(ROOT / 'work' / 'lastday' / f'{subj}.json'))
pk = json.load(open(ROOT / 'work' / 'lastday' / f'packs-{subj}.json'))
chs = sw['chapters']

# ---- SM file -> title and ICAI URL
def slug(s): return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:50]
links = json.load(open(ROOT / 'scripts' / 'lastday' / 'sources' / 'sm_links.json'))
units = json.load(open(ROOT / 'scripts' / 'lastday' / 'sources' / 'fr_units.json'))
meta = {}
P = {'fr': '97', 'afm': '100', 'aaa': '101'}[subj]
for m, u, n in links[P]:
    if n.startswith('Chapter'): meta[slug(n)] = (re.sub(r'^Chapter (\d+): ', r'Ch \1 · ', n), u)
if subj == 'fr':
    for m, name, pdfs in units:
        for u, n in pdfs:
            if n.startswith('Unit'):
                full = name.split(':')[0] + ' ' + n
                ch = re.search(r'Chapter (\d+)', name).group(1); un = re.search(r'Unit\s*(\d+)', n).group(1)
                meta[slug(full)] = (f'Ch {ch}.{un} · ' + re.sub(r'^Unit\s*\d+\s*:\s*', '', n), u)
FIXUP = {  # titles the ICAI listing garbles (mojibake in curly quotes)
}
def title_of(fname):
    st = fname[:-4]
    for k, (t, u) in meta.items():
        if k == st or st.startswith(k) or k.startswith(st): return t.replace('â€œ', '').replace('â€', ''), u
    return st, ''

# ---- FR priority from research/fr-priority.md (ICAI papers May 2022 - Nov 2026)
FR_SCORE = {}
if subj == 'fr':
    for ln in (ROOT / 'research' / 'fr-priority.md').read_text().splitlines():
        m = re.match(r'\|\s*(\d+(?:\.\d)?)\s+(.*?)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(yes)?', ln)
        if m: FR_SCORE[m.group(1)] = {'name': m.group(2), 'score': int(m.group(3)), 'pyq': int(m.group(4)), 'rtpmtp': int(m.group(5)), 'nov26': bool(m.group(6))}
def fr_key(fname):
    m = re.match(r'chapter-(\d+)(?:-unit-(\d+))?', fname)
    if not m: return None
    ch, un = m.group(1), m.group(2)
    if ch == '11': return '11'
    if un: return f'{int(ch):02d}.{un}'
    return f'{int(ch):02d}'

def clean(t):
    t = t.replace('`', '₹')
    out = []
    for ln in t.split('\n'):
        if 'The Institute of Chartered Accountants of India' in ln: continue
        if re.match(r'^\s*\d{0,3}\s*(JANUARY|MAY|NOVEMBER|SEPTEMBER|MARCH|APRIL|JULY|AUGUST|DECEMBER)\s*,?\s*20\d\d\s+EXAMINATION\b', ln, re.I): continue
        if re.match(r'^\s*(REVISION TEST PAPERS?|MOCK TEST PAPER|SUGGESTED ANSWERS?)\b[^\n]{0,80}$', ln, re.I) and ln.strip().isupper(): continue
        if re.match(r'^\s*(PAPER\s*[–-]?\s*[123]\s*[:\-–]?\s*)?(ADVANCED\s+(FINANCIAL\s+MANAGEMENT|AUDITING[A-Z ,&]*)|FINANCIAL REPORTING)\s*\d*\s*$', ln, re.I) and ln.strip().isupper(): continue
        if re.match(r'^\s*\d{1,3}\s*$', ln): continue
        if re.match(r'^\s*FINAL EXAMINATION(:\s*[A-Z]+\s*20\d\d)?\s*$', ln): continue
        if re.match(r'^\s*(PAPER\s*[–-]?\s*[123][^\n]{0,70})$', ln) and ln.strip().isupper(): continue
        if re.match(r'^\s*\d{1,2}\.\d{1,3}\s*(FINANCIAL REPORTING|ADVANCED[A-Z ,&]*|[A-Z ]{8,})?\s*\d*\.?\d*\s*$', ln): continue
        out.append(ln.rstrip())
    t = '\n'.join(out)
    return re.sub(r'\n{3,}', '\n\n', t).strip()

def trim(t, words=1100):
    ws = t.split('\n'); n = 0; keep = []
    for ln in ws:
        n += len(ln.split())
        if n > words: break
        keep.append(ln)
    cut = len(keep) < len(ws)
    return '\n'.join(keep).strip(), cut

DROP = set(json.load(open(ROOT / 'scripts' / 'lastday' / 'drop.json'))) if (ROOT / 'scripts' / 'lastday' / 'drop.json').exists() else set()

topics = []
for tid, t in pk['topics'].items():
    ch_idx = [i for i, c in enumerate(chs) if c['file'] in t['files']]
    first = t['files'][0]
    title, url = title_of(first)
    if subj == 'fr' and tid == 'chapter-11':
        title, url = 'Ch 11 · Accounting and Reporting of Financial Instruments (Ind AS 32, 107, 109)', ''
    picks = []
    for c in t['chosen']:
        key = f"{subj}|{tid}|{c['src']}|{c['q']}"
        if key in DROP: continue
        if len(c['text'].split()) < 10: continue
        picks.append(c)
    # sections (only those with enough text to be a topic of their own)
    secs, lookup = [], {}
    for ci in ch_idx:
        for si, s in enumerate(chs[ci]['sections']):
            if len(s['text'].split()) >= 80:
                lookup[(ci, si)] = len(secs)
                secs.append({'n': s['num'], 't': s['title'].strip(), 'p0': s['p0'], 'p1': s['p1'], 'hits': 0, 'ci': ci, 'si': si, 'file': chs[ci]['file']})
    # section hits from every swept question that matched this topic
    ev = collections.Counter()
    for q in sw['questions']:
        m0 = q['match'][0]
        if (m0['ci'], m0['si']) in lookup and m0['score'] >= 8:
            ev[lookup[(m0['ci'], m0['si'])]] += {'pyq': 2, 'rtp': 1, 'mtp': 1}[q['kind']]
    for i, v in ev.items(): secs[i]['hits'] = v
    # map picks' covered sections (they were stored as flat indexes)
    flat = pk['flat']
    flat_to_sec = {k: lookup.get(tuple(flat[k])) for k in range(len(flat))}
    qout = []
    for r, c in enumerate(picks):
        cov = sorted({flat_to_sec[k] for k in c['secs'] if flat_to_sec.get(k) is not None})
        bci, bsi = flat[c['best']]
        bs = chs[bci]['sections'][bsi]
        qout.append({'closest': {'t': bs['title'].strip(), 'p0': bs['p0'], 'file': chs[bci]['file'] == first or chs[bci]['file'] in t['files']}, 'role': 'comprehensive' if r == 0 else 'drill', 'src': c['src'], 'label': str(c['q']),
                     'kind': c['kind'], 'loose': c.get('loose', False), 'covers': cov, 'prompt': clean(c['text']), 'ans': clean(c['ans'])})
    # reading: hottest sections, verbatim SM text
    hot = sorted(range(len(secs)), key=lambda i: -secs[i]['hits'])[:4]
    reading = []
    for i in sorted(hot, key=lambda i: (secs[i]['ci'], secs[i]['si'])):
        if secs[i]['hits'] <= 0: continue
        s = chs[secs[i]['ci']]['sections'][secs[i]['si']]
        txt, cut = trim(clean(s['text']))
        reading.append({'sec': i, 'text': txt, 'cut': cut})
    stat = t['stat']; pts = t['points']
    entry = {'id': tid, 'title': title, 'url': url, 'sections': [{k: v for k, v in s.items() if k in ('n', 't', 'p0', 'p1', 'hits')} for s in secs],
             'questions': qout, 'reading': reading, 'sweep': {'points': pts, **stat}}
    if subj == 'fr':
        k = fr_key(first); sc = FR_SCORE.get(k)
        entry['rank'] = {'score': sc['score'], 'pyq': sc['pyq'], 'rtpmtp': sc['rtpmtp'], 'nov26': sc['nov26']} if sc else {'score': 0, 'pyq': 0, 'rtpmtp': 0, 'nov26': False}
    else:
        entry['rank'] = {'score': pts}
    topics.append(entry)

topics.sort(key=lambda e: -e['rank']['score'])
mx = max((e['rank']['score'] for e in topics), default=1) or 1
for e in topics:
    r = e['rank']['score'] / mx
    e['tier'] = 'must' if r >= 0.5 else 'should' if r >= 0.25 else 'quick'

BASIS = {
 'fr': 'Order: ICAI papers May 2022 to Nov 2026, from research/fr-priority.md (a unit counts as tested when its Ind AS number or key terms appear three or more times in ICAI answers). Questions: ICAI question papers with suggested answers May 2024 to Jan 2026, RTPs May 2024 to Nov 2026, MTPs Mar 2025 to Sep 2026, and ICAI\'s Practice Questions in the study material.',
 'afm': 'Order: how many questions in ICAI papers May 2024 to Nov 2026 are about the chapter (question paper 2 points, RTP or MTP 1 point, +1 for a Nov 2026 RTP or MTP). Questions: ICAI question papers with suggested answers May 2024 to Jan 2026, RTPs May 2024 to Nov 2026, MTPs Mar 2024 to Sep 2026.',
 'aaa': 'Order: how many questions in ICAI papers May 2024 to Nov 2026 are about the chapter (question paper 2 points, RTP or MTP 1 point, +1 for a Nov 2026 RTP or MTP). Questions: ICAI question papers with suggested answers May 2024 to Jan 2026, RTPs May 2024 to Nov 2026, MTPs Mar 2024 to Sep 2026.',
}
out = {'subject': subj, 'basis': BASIS[subj], 'topics': topics}
d = ROOT / 'data' / 'lastday'; d.mkdir(parents=True, exist_ok=True)
json.dump(out, open(d / f'{subj}.json', 'w'), ensure_ascii=False, indent=1)
print(subj, len(topics), 'packs;', sum(len(e['questions']) for e in topics), 'questions;', round((d / f"{subj}.json").stat().st_size / 1e6, 2), 'MB')
for e in topics:
    print(f"{e['tier']:6} {e['rank']['score']:4} {e['title'][:70]:70} q={len(e['questions'])} secs={len(e['sections'])}")
