#!/usr/bin/env python3
"""Last-day sweep: which ICAI SM sections do ICAI's own papers test?

Usage: python3 scripts/lastday/sweep.py <fr|afm|aaa>
Reads  work/sm/<subject>/*.txt          (ICAI study-material chapters/units, pdftotext -layout)
       work/papers/<subject>_<attempt>_<kind>_<n>.txt   (ICAI question papers, RTPs, MTPs, verified by header)
Writes work/lastday/<subject>.json      (SM sections, every paper question matched to its best section)

Matching is lexical (BM25 of the question against each SM section). It orders work; it is not a marks count.
Every question text kept in the output is ICAI's own, extracted verbatim. Nothing here is written by hand.
"""
import json, math, re, sys, collections
PART2 = r'(?m)^\s*(?:ANSWERS?\s+(?:OF|TO)\s+)?PART\s*[–-]?\s*II\b[^\n]{0,70}$'
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SUBJ = sys.argv[1] if len(sys.argv) > 1 else 'fr'
SM = ROOT / 'work' / 'sm' / SUBJ
PAP = ROOT / 'work' / 'papers'
OUT = ROOT / 'work' / 'lastday'
OUT.mkdir(exist_ok=True)

ATTEMPT = {'may24': 'May 2024', 'nov24': 'Nov 2024', 'may25': 'May 2025', 'sep25': 'Sep 2025',
           'jan26': 'Jan 2026', 'may26': 'May 2026', 'nov26': 'Nov 2026'}

def clean(s):
    s = s.replace('`', '₹').replace('’', "'")
    return re.sub(r'[ \t]+\n', '\n', s)

def words(s):
    return re.findall(r'[a-z][a-z0-9]{2,}', s.lower())

STOP = set('the and for that this with from are was not which shall will under any has have its their than such may can per all but also been being into out more other only when where who whom what does did how why would could should must one two three four five six seven eight nine ten given following state calculate compute determine advise discuss explain comment briefly examine'.split())

# ---------- study material ----------
HEAD = re.compile(r'^\s{0,10}(\d{1,2}(?:\.\d{1,2}){0,2})\.?\s+([A-Z][^\n]{2,95})$')

def parse_sm():
    chapters = []
    for f in sorted(SM.glob('*.txt')):
        raw = clean(f.read_text(errors='ignore'))
        pages = raw.split('\f')
        lines = []
        for pi, pg in enumerate(pages, 1):
            for ln in pg.split('\n'):
                lines.append((pi, ln))
        secs, cur = [], None
        for pi, ln in lines:
            m = HEAD.match(ln)
            ok = bool(m) and not re.search(r'\.{4,}|\d\s*$', ln.strip()[-3:]) and len(m.group(2).split()) <= 14
            if ok:   # a heading is short, has no sentence punctuation or verbs; illustration openers and list items are not headings
                tt = m.group(2).strip()
                ok = len(tt.split()) <= 10 and not re.search(r'[.,;:]$|\b(is|are|was|were|has|have|had|will|would|should|may|can)\b', tt) and not re.search(r'[₹%]|\d{3,}', tt)
            if ok and m.group(1).count('.') <= 1 and not re.match(r'^\d{1,2}\.\d{2,}$', m.group(1)):
                cur = {'num': m.group(1), 'title': m.group(2).strip(), 'p0': pi, 'p1': pi, 'lines': []}
                secs.append(cur)
                continue
            if cur is None:
                cur = {'num': '0', 'title': 'Introduction and overview', 'p0': pi, 'p1': pi, 'lines': []}
                secs.append(cur)
            cur['lines'].append(ln); cur['p1'] = pi
        # merge sections too small to stand alone into the previous one
        merged = []
        for s in secs:
            text = '\n'.join(s['lines'])
            if merged and len(words(text)) < 60:
                merged[-1]['lines'] += [f"{s['num']} {s['title']}"] + s['lines']; merged[-1]['p1'] = s['p1']
            else:
                merged.append(s)
        chapters.append({'file': f.name, 'sections': [{'num': s['num'], 'title': s['title'], 'p0': s['p0'], 'p1': s['p1'], 'text': '\n'.join(s['lines']).strip()} for s in merged], 'pages': len(pages)})
    return chapters

# ---------- papers ----------
def label(fn):
    m = re.match(r'(?:fr|afm|aaa)_(\w+?)_(qp|rtp|mtps?[12]?)_(\d)', fn.stem)
    return m

def sequential(text, start_re, restarts=False, start_any=False):
    """Split on numbered lines 1., 2., 3. ... accepting only the next expected number."""
    out, exp, cur, prev = [], 1, None, ''
    for ln in text.split('\n'):
        m = re.match(r'^\s{0,10}(\d{1,2})\.\s{1,}\S', ln)
        heading = bool(prev) and len(prev) < 60 and not re.search(r'[\d.:;,]', prev) and not prev.strip().startswith('(')
        if m and start_any and not out and int(m.group(1)) <= 4: exp = int(m.group(1))
        if m and (int(m.group(1)) == exp or restarts and int(m.group(1)) == 1 and exp > 2 and heading):
            exp = int(m.group(1))
            cur = {'q': str(len(out) + 1), 'lines': [ln]}; out.append(cur); exp += 1
        elif cur is not None:
            cur['lines'].append(ln)
        if ln.strip() and not m: prev = ln.strip()
    return [{'q': c['q'], 'text': '\n'.join(c['lines']).strip()} for c in out]

ANS_MARK = re.compile(r'(?m)^\s{0,8}(?:Answer|ANSWER)\b[^\n]{0,24}$')

def subparts(body, qn):
    """[(label, text)] for (a)(b)(c) parts; repeated letters (EITHER/OR) get #2, #3."""
    parts = re.split(r'(?m)^\s{0,10}\(([a-e])\)\s', body)
    if len(parts) == 1: return [(str(qn), body.strip())]
    seen, out = collections.Counter(), []
    pre = parts[0].strip()
    for j in range(1, len(parts), 2):
        let = parts[j]; seen[let] += 1
        lab = f'{qn}({let})' + ('' if seen[let] == 1 else f'#{seen[let]}')
        out.append((lab, ((pre + '\n') if pre and j == 1 else '') + parts[j + 1].strip()))
    return out

def split_questions(text, pair=False):
    """Descriptive questions: 'Question N' blocks (or sequential numbered lines), then (a)(b)(c) sub-parts.
    pair=True: the block holds the question(s) then an 'Answer' block; each sub-part gets its own answer."""
    out = []
    blocks = re.split(r'(?m)^\s*Question\s*(?:No\.?\s*)?(\d{1,2})\b(?! is compulsory)[^\n]*\n', text)
    if len(blocks) < 7:  # fewer than 3 'Question N' headers: fall back to numbered lines
        blocks, exp = [''], 1
        for ln in text.split('\n'):
            m = re.match(r'^\s{0,4}(\d{1,2})(?:\.\s+\S|\s+(?=\(a\)))', ln)
            if m and int(m.group(1)) == exp:
                blocks += [str(exp), ln + '\n']; exp += 1
            elif len(blocks) > 1:
                blocks[-1] += ln + '\n'
    for i in range(1, len(blocks), 2):
        qn, body = int(blocks[i]), blocks[i + 1]
        body = re.sub(r'^\s*\d{1,2}\.?\s+', '', body, count=1)
        ans = ''
        if pair:
            m = ANS_MARK.search(body)
            if m: body, ans = body[:m.start()], body[m.end():]
        sp = subparts(body, qn)
        am = dict(subparts(ans, qn)) if ans.strip() else {}
        for lab, t in sp:
            a = am.get(lab, '') if len(sp) > 1 or len(am) > 1 else ans.strip()
            out.append({'q': lab, 'text': t, 'ans': a})
    return out

def split_scenarios(text):
    out = []
    blocks = re.split(r'(?m)^\s*(Case\s*Scenario[^\n]*)\n', text, flags=re.I)
    for i in range(1, len(blocks), 2):
        out.append({'q': 'MCQ ' + re.sub(r'\s+', ' ', blocks[i]).strip().replace('Case Scenario', 'CS'), 'text': blocks[i + 1].strip()})
    return out

def parse_papers():
    qs = []
    for f in sorted(PAP.glob(f'{SUBJ}_*.txt')):
        m = label(f)
        if not m: continue
        att, kind = m.group(1), m.group(2)
        if att not in ATTEMPT: continue
        raw = clean(f.read_text(errors='ignore'))
        head = re.sub(r'\s+', ' ', raw[:5000])
        if kind == 'qp' and 'SUGGESTED ANSWER' not in head and att != 'may26': continue
        if kind.startswith('mtp'):
            if 'comprises two parts' not in head and 'Question' not in raw[:20000] and 'Case Scenario' not in raw[:20000]:
                continue
            if 'comprises two parts' not in head:   # answer file: used for answers only
                continue
            ser = 'S-II' if ('s2' in kind or re.search(r'Series\s*-?\s*II', head)) else 'S-I'
            if 'Series - I' in head or 'Series I' in head: ser = 'S-I'
            if 'Series II' in head or 'Series - II' in head: ser = 'S-II'
            src = f'MTP {ATTEMPT[att]} {ser}'
            pp = re.split(PART2, raw, maxsplit=1, flags=re.I)
            items = split_scenarios(pp[0])
            desc = pp[1] if len(pp) > 1 else ''
            items += split_questions(desc)
            af = f.with_name(f.name.replace('_1.txt', '_2.txt'))
            ans = {}
            if af.exists():
                araw = clean(af.read_text(errors='ignore'))
                ap = re.split(PART2, araw, maxsplit=1, flags=re.I)
                if len(ap) > 1:
                    for it in split_questions(ap[1]): ans[it['q']] = it['text']
            for it in items: qs.append({'src': src, 'kind': 'mtp', 'att': att, 'file': f.name, **it, 'ans': ans.get(it['q'], '')})
        elif kind == 'rtp':
            body = raw
            a = re.search(r'(?m)^\s*QUESTIONS\s*$', raw)
            b = re.search(r'(?m)^\s*SUGGESTED ANSWERS?(?:/HINTS)?\s*$', raw)
            if a and b and b.start() > a.start(): body = raw[a.end():b.start()]
            its = sequential(body, None)
            if len(its) < 9: its = sequential(body, None, True)
            abody = raw[b.end():] if b else ''
            ats = sequential(abody, None)
            if len(ats) < 9: ats = sequential(abody, None, True)
            amap = {a['q']: a['text'] for a in ats}
            for it in its:
                qs.append({'src': f'RTP {ATTEMPT[att]}', 'kind': 'rtp', 'att': att, 'file': f.name, **it, 'ans': amap.get(it['q'], '')})
        else:  # question paper / suggested answers
            src = f'PYQ {ATTEMPT[att]}'
            if re.search(PART2, raw, re.I):
                parts = re.split(PART2, raw, maxsplit=1, flags=re.I)
                mcq, desc = parts[0], parts[1]
            else:
                mcq, desc = raw, raw
            items = split_scenarios(mcq) + split_questions(desc, True)
            if att == 'may26' and not items:
                items = sequential(raw, None)
            for it in items:
                qs.append({'src': src, 'kind': 'pyq', 'att': att, 'file': f.name, **it})
    return [q for q in qs if len(words(q['text'])) >= 12]

# ---------- BM25 ----------
def build_bm25(docs):
    toks = [[w for w in words(d) if w not in STOP] for d in docs]
    df = collections.Counter(w for t in toks for w in set(t))
    N = len(docs); avg = sum(map(len, toks)) / max(N, 1)
    idf = {w: math.log(1 + (N - n + .5) / (n + .5)) for w, n in df.items()}
    tf = [collections.Counter(t) for t in toks]
    def score(q):
        qt = [w for w in words(q) if w not in STOP]
        res = []
        for i, c in enumerate(tf):
            L = sum(c.values()) or 1
            s = 0.0
            for w in set(qt):
                if w in c:
                    s += idf[w] * c[w] * 2.2 / (c[w] + 1.2 * (0.25 + 0.75 * L / avg))
            res.append(s)
        return res
    return score

def main():
    chs = parse_sm()
    flat = []
    for ci, ch in enumerate(chs):
        for si, s in enumerate(ch['sections']):
            flat.append((ci, si))
    docs = [(chs[ci]['sections'][si]['title'] + ' ') * 3 + chs[ci]['sections'][si]['text'][:9000] for ci, si in flat]
    score = build_bm25(docs)
    qs = parse_papers()
    for q in qs:
        sc = score(q['text'][:3000])
        order = sorted(range(len(sc)), key=lambda i: -sc[i])[:3]
        q['match'] = [{'ci': flat[i][0], 'si': flat[i][1], 'score': round(sc[i], 1)} for i in order]
    json.dump({'subject': SUBJ, 'chapters': chs, 'questions': qs}, open(OUT / f'{SUBJ}.json', 'w'), ensure_ascii=False)
    print(SUBJ, 'chapters', len(chs), 'sections', len(flat), 'questions', len(qs))
    per = collections.Counter(q['src'] for q in qs)
    for k, v in sorted(per.items()): print('  ', k, v)

if __name__ == '__main__':
    main()
