#!/usr/bin/env python3
"""Exam-frequency ranking of SM chapters for AFM (Paper 2) and AAA (Paper 3) from ICAI papers.

Usage: python3 scripts/rank-sweep.py <workdir> <2|3>
<workdir> holds full/*.txt (pdftotext -layout of ICAI papers) and sm/*.txt (ICAI chapter PDFs, one per chapter).
Every question (the text before a "(N Marks)" marker, or a numbered RTP question) is matched to the SM chapter whose text it
resembles most (TF-IDF cosine over single words and word pairs). Prints JSON for research/ writing.
App-written and approximate: a mapping aid, not an ICAI marks count. Marks include choice (the paper asks 100 and lists ~114-118)."""
import re, sys, math, json, collections, glob, os
W, PAPER = sys.argv[1], sys.argv[2]
tag = 'aps2163' if PAPER == '2' else 'aps2168'
tok = lambda s: re.findall(r"[a-z][a-z\-]{2,}|sa ?\d{3}", s.lower())
STOP = set("the and for are that with this from have has was were will shall not any all its their which may can also been such than into per but other more under what how why whether following given using whose they them then there these those would could should being does did only just very much many".split())
def words(s):
    t = [w.replace(' ', '') for w in tok(s) if w not in STOP]
    return t + [a + ' ' + b for a, b in zip(t, t[1:])]
chap = {}
for f in glob.glob(f'{W}/sm/*.txt'):
    b = os.path.basename(f)
    m = re.search(r'-ch(\d+)', b)
    if tag in b and m: chap.setdefault(int(m.group(1)), []).append(open(f, errors='ignore').read())
chap = {k: collections.Counter(words(' '.join(v))) for k, v in chap.items()}
df = collections.Counter(w for c in chap.values() for w in c)
N = len(chap)
def vec(c):
    v = {w: (1 + math.log(n)) * math.log((N + 1) / (df[w] + 0.5)) for w, n in c.items() if w in df and df[w] <= N * 0.5}
    d = math.sqrt(sum(x * x for x in v.values())) or 1
    return {w: x / d for w, x in v.items()}
CV = {k: vec(c) for k, c in chap.items()}
def classify(text):
    q = vec(collections.Counter(words(text)))
    sc = {k: sum(x * CV[k].get(w, 0) for w, x in q.items()) for k in CV}
    o = sorted(sc, key=sc.get, reverse=True)
    return o[0], sc[o[0]], sc[o[1]]
MARK = re.compile(r'\((?:(\d+)\s*[×x]\s*\d+\s*=\s*)?(\d+)\s*Marks?\)', re.I)
BND = re.compile(r'^\s*(Answer|ANSWER|Question\s*\d|Part\s+I\b|PART)')
def mark_windows(txt, skip_answers=True):
    out, buf, ans = [], [], False
    for ln in txt.split('\n'):
        if re.match(r'^\s*(Question\s*\d|Part\s+II|PART\s+II)', ln): ans = False; buf = []
        elif skip_answers and re.match(r'^\s*(Answer|ANSWER)\s*(\d+)?\s*[:.\-]?\s*(\([a-z0-9]+\))*\s*$', ln): ans = True
        if BND.match(ln): buf = []
        buf.append(ln)
        m = MARK.search(ln)
        if m and not ans: out.append((int(m.group(2)), ' '.join(buf[-90:]), bool(m.group(1)) or int(m.group(2)) <= 2)); buf = []
    return out
def rtp_windows(txt):
    i = re.search(r'^\s*(ANSWERS|PART A: Answers|ANSWER)\b', txt, re.M)
    q = txt[:i.start()] if i else txt
    parts = re.split(r'\n\s{0,8}(?=\d{1,2}\.\s+[A-Z(])', q)
    return [(0, p, False) for p in parts[1:] if len(p) > 120]
# paper registry: (file stem, kind, attempt); attempts read from each file's own header, see research notes
DOCS = json.load(open(f'{W}/docs{PAPER}.json'))
res = collections.defaultdict(lambda: {'pyq_marks': 0, 'mcq_marks': 0, 'pyq_q': 0, 'rtp_q': 0, 'mtp_q': 0, 'papers': set(), 'latest': 0})
unsure = collections.Counter(); total = collections.Counter(); perdoc = []; byp = collections.defaultdict(lambda: collections.defaultdict(int)); listed = collections.Counter()
for d in DOCS:
    txt = open(f"{W}/full/{d['file']}.txt", errors='ignore').read()
    ws = rtp_windows(txt) if d['kind'] == 'rtp' else mark_windows(txt, d['kind'] == 'qp')
    if d['kind'] == 'rtp' and len(ws) < 3: ws = mark_windows(txt)
    perdoc.append((d['kind'], d['attempt'], len(ws), sum(m for m, _, _ in ws)))
    for m, t, mcq in ws:
        c, s1, s2 = classify(t)
        total[d['kind']] += 1
        if s1 < 1.15 * s2 or s1 < 0.03: unsure[d['kind']] += 1
        r = res[c]
        if d['kind'] == 'qp': byp[c][d['attempt']] += m; listed[d['attempt']] += m
        if d['kind'] == 'qp': r['mcq_marks' if mcq else 'pyq_marks'] += m; r['pyq_q'] += 1; r['papers'].add(d['attempt'])
        elif d['kind'] == 'rtp': r['rtp_q'] += 1; r['papers'].add('RTP ' + d['attempt'])
        else: r['mtp_q'] += 1; r['papers'].add('MTP ' + d['attempt'])
        if d.get('latest'): r['latest'] = 1
out = {'perdoc': perdoc, 'unsure': dict(unsure), 'total': dict(total), 'chapters': {}}
for c in sorted(chap):
    r = res.get(c, {'pyq_marks': 0, 'mcq_marks': 0, 'pyq_q': 0, 'rtp_q': 0, 'mtp_q': 0, 'papers': set(), 'latest': 0})
    out['chapters'][c] = {**{k: v for k, v in r.items() if k != 'papers'}, 'qp_papers': sorted(p for p in r['papers'] if not p.startswith(('RTP', 'MTP'))), 'n_qp': len([p for p in r['papers'] if not p.startswith(('RTP', 'MTP'))])}
out['share'] = {c: round(sum(100 * v / listed[a] for a, v in byp[c].items()) / max(1, len(listed)), 1) for c in chap}
out['listed'] = dict(listed)
json.dump(out, open(f'{W}/rank{PAPER}.json', 'w'), indent=1)
print(json.dumps({'perdoc': perdoc, 'unsure': out['unsure'], 'total': out['total']}))
