#!/usr/bin/env python3
"""Pick the must-do ICAI questions for every unbuilt chapter/unit. Usage: python3 scripts/lastday/packs.py <subject> [--show]

Reads work/lastday/<subject>.json (from sweep.py) plus ICAI's SM Practice Questions (work/smq, FR only).
For each topic it picks 2-3 questions, all ICAI's own: first the one that exercises the most SM sections
("comprehensive"), then the ones that add sections not yet covered. Writes work/lastday/packs-<subject>.json.
"""
import json, re, sys, math, collections
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import sweep as S

ROOT = S.ROOT
subj = sys.argv[1]
S.SUBJ = subj
d = json.load(open(ROOT / 'work' / 'lastday' / f'{subj}.json'))
chs, qs = d['chapters'], d['questions']
BUILT = {'fr': ['chapter-9', 'chapter-12', 'chapter-13'], 'afm': ['chapter-8-'], 'aaa': ['chapter-15-psu', 'chapter-19', 'ch14-']}[subj]
is_built = lambda f: any(f.startswith(b) for b in BUILT)

flat = [(ci, si) for ci, c in enumerate(chs) for si, _ in enumerate(c['sections'])]
docs = [(chs[ci]['sections'][si]['title'] + ' ') * 3 + chs[ci]['sections'][si]['text'][:9000] for ci, si in flat]
score_fn = S.build_bm25(docs)
idx_of = {fs: i for i, fs in enumerate(flat)}

# ICAI SM Practice Questions (FR): numbered questions then numbered answers, in Questions/Answers cycles
# Units in the order ICAI's Practice Questions files present them (checked against the unit headers in each file)
PQ_UNITS = {'fr_125': ['1', '34', '7', '8', '10', '113'], 'fr_130': ['2', '16', '23', '36', '38', '40', '105', '116'],
            'fr_131': ['19', '37', '12', '21', '24', '33', '108'], 'fr_132': ['115', '41', '20', '102', '11'],
            'fr_135': ['103', 'g13', '101']}
def sm_practice():
    out = []
    for f in sorted((ROOT / 'work' / 'smq').glob(f'{subj}_*practice*.txt')):
        raw = S.clean(f.read_text(errors='ignore'))
        parts = re.split(r'(?m)^\s*(Questions|Answers)\s*$', raw)
        qs_, ans_ = [], []
        mode = None
        cyc = []
        for i in range(1, len(parts), 2):
            kind, body = parts[i], parts[i + 1]
            if kind == 'Questions': cyc.append({'q': S.sequential(body, None), 'a': []})
            elif cyc: cyc[-1]['a'] = S.sequential(body, None, False, True)
        units = PQ_UNITS.get(f.name[:6], [])
        if len(units) != len(cyc): print('WARNING: practice file', f.name, len(cyc), 'cycles vs', len(units), 'units'); continue
        for cy, std in zip(cyc, units):
            amap = {a['q']: a['text'] for a in cy['a']}
            for q in cy['q']:
                out.append({'src': 'ICAI SM Practice Question', 'kind': 'sm', 'att': 'sm', 'file': f.name, 'std': std, 'q': 'Q' + str(q['q']), 'text': q['text'], 'ans': amap.get(q['q'], '')})
    return out

if subj == 'fr':
    extra = sm_practice()
    for q in extra:
        sc = score_fn(q['text'][:3000]); order = sorted(range(len(sc)), key=lambda i: -sc[i])[:3]
        q['match'] = [{'ci': flat[i][0], 'si': flat[i][1], 'score': round(sc[i], 1)} for i in order]
    qs = qs + extra

# FR: the standard(s) each SM file covers, so an explicit 'Ind AS 16' in ICAI's question or answer decides the match
def file_standards(f):
    m = re.search(r'ind-as-(\d+)', f)
    if m: return {m.group(1)}
    if f.startswith('chapter-9'): return {'115'}
    if f.startswith('chapter-12'): return {'103'}
    if f.startswith('chapter-13'): return {'110', '111', '28', '27', '112'}
    if f.startswith('chapter-11-unit'): return {'32', '107', '109'}
    if f.startswith('chapter-14-ind-as-101'): return {'101'}
    return set()
FSTD = [file_standards(c['file']) if subj == 'fr' else set() for c in chs]

def chapter_scores(sc, mentions=None):
    best = {}
    for i, v in enumerate(sc):
        ci = flat[i][0]
        if mentions: v = v + 30 * min(3, sum(mentions.get(n, 0) for n in FSTD[ci]))
        if v > best.get(ci, (0, 0))[0]: best[ci] = (v, i)
    return sorted(best.items(), key=lambda kv: -kv[1][0])

TOPICS = None
def topic_of(ci):
    f = chs[ci]['file']
    if subj == 'fr':
        m = re.match(r'chapter-11-unit', f)
        if m: return 'chapter-11'          # all seven financial-instruments units are one topic (Ind AS 32/107/109)
    return f[:-4]

topics = collections.OrderedDict()
for ci, c in enumerate(chs):
    topics.setdefault(topic_of(ci), []).append(ci)

for q in qs:
    full = (q['text'] + '\n' + q.get('ans', ''))[:5000]
    sc = score_fn(full)
    q['_sc'] = sc
    ment = collections.Counter(re.findall(r'Ind\s*AS\s*(\d{1,3})', full)) if subj == 'fr' else None
    cs = chapter_scores(sc, ment)
    top = cs[0]; sec = cs[1][1][0] if len(cs) > 1 else 0
    q['topic'] = topic_of(top[0]); q['best'] = top[1][1]; q['strength'] = top[1][0]
    q['clear'] = top[1][0] >= 8 and top[1][0] >= 1.2 * sec

STD_TOPIC = {}
if subj == 'fr':
    for ci, c in enumerate(chs):
        for n in FSTD[ci]: STD_TOPIC.setdefault(n, topic_of(ci))
    STD_TOPIC['11'] = 'chapter-11'
for q in qs:
    if q['kind'] == 'sm':
        tp = STD_TOPIC.get(q['std'])
        if tp: q['topic'] = tp; q['clear'] = True; q['strength'] = max(q['strength'], 50)
        else: q['topic'] = 'unmapped'; q['clear'] = False

def pri_pts(q): return {'pyq': 2, 'rtp': 1, 'mtp': 1, 'sm': 0}[q['kind']] + (1 if q['att'] == 'nov26' else 0)

result = {}
for t, cis in topics.items():
    if is_built(chs[cis[0]]['file']): continue
    secs = [(ci, si) for ci in cis for si in range(len(chs[ci]['sections']))]
    sec_idx = [idx_of[x] for x in secs]
    big = [i for i, x in zip(sec_idx, secs) if len(S.words(chs[x[0]]['sections'][x[1]]['text'])) >= 80]
    cand = [q for q in qs if q['topic'] == t and q['clear'] and q.get('ans')]
    cand = [q for q in cand if not str(q['q']).startswith('MCQ') and len(S.words(q['text'])) >= 25 and not re.search(r'(?m)^\s*(Or|OR|Either|EITHER)\b\s*$|^\s*(OR|Or)\s', q['text'])]
    for q in cand:
        sc = q['_sc']; mx = max(sc[i] for i in big) if big else 1
        q['cov'] = [i for i in big if sc[i] >= max(0.40 * mx, 8)]
    stat = collections.Counter(); pts = 0
    for q in qs:
        if q['topic'] == t and q['clear']:
            stat[q['kind']] += 1; pts += pri_pts(q)
    def eligible(q, minstr, need_ans, minw=25):
        return (q['topic'] == t and q['strength'] >= minstr and (q.get('ans') or not need_ans) and not str(q['q']).startswith('MCQ')
                and len(S.words(q['text'])) >= minw and (minw <= 10 or not re.search(r'(?m)^\s*(Or|OR|Either|EITHER)\b\s*$|^\s*(OR|Or)\s', q['text'])))
    loose = set()
    for minstr, need_ans, minw in ((5, True, 25), (3, True, 25), (3, True, 10), (3, False, 10)):   # thin topic: relax the match rather than ship an empty pack
        if len(cand) >= 3: break
        have = {id(q) for q in cand}
        for q in sorted(qs, key=lambda q: -q['strength']):
            if id(q) not in have and eligible(q, minstr, need_ans, minw):
                sc = q['_sc']; mx = max(sc[i] for i in big) if big else 1
                q['cov'] = [i for i in big if sc[i] >= max(0.40 * mx, 6)]
                cand.append(q); loose.add(id(q))
            if len(cand) >= 3: break
    chosen, covered = [], set()
    fullans = lambda q: len(q.get('ans', '').split()) >= 40
    pool = sorted(cand, key=lambda q: (not fullans(q), -len(q['cov']), -pri_pts(q), -len(q['text'])))
    if pool:
        first = pool[0]; chosen.append(first); covered |= set(first['cov'])
        for _ in range(2):
            rest = [q for q in cand if q not in chosen]
            rest.sort(key=lambda q: (not fullans(q), -len(set(q['cov']) - covered), -pri_pts(q)))
            if rest and (len(set(rest[0]['cov']) - covered) >= 1 or len(chosen) < 3):
                chosen.append(rest[0]); covered |= set(rest[0]['cov'])
    result[t] = {'topic': t, 'files': [chs[ci]['file'] for ci in cis], 'points': pts, 'stat': dict(stat),
                 'nsec': len(big), 'covered': len(covered), 'cands': len(cand),
                 'chosen': [{'loose': id(q) in loose, 'src': q['src'], 'q': q['q'], 'kind': q['kind'], 'cov': len(q['cov']), 'text': q['text'], 'ans': q['ans'], 'best': q['best'], 'secs': q['cov']} for q in chosen]}

json.dump({'flat': flat, 'topics': result}, open(ROOT / 'work' / 'lastday' / f'packs-{subj}.json', 'w'), ensure_ascii=False)
if '--show' in sys.argv:
    for t, r in sorted(result.items(), key=lambda kv: -kv[1]['points']):
        print(f"\n## {t}  points={r['points']} {r['stat']} sections={r['nsec']} covered={r['covered']} candidates={r['cands']}")
        for c in r['chosen']:
            print(f"   - {c['src']} {c['q']} covers {c['cov']}/{r['nsec']} :: {re.sub(chr(10)+'|\\s+', ' ', c['text'])[:230]}")
