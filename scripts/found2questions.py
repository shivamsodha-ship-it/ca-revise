#!/usr/bin/env python3
"""Convert research agents' found-*.md files (ICAI RTP/MTP/PYQ questions with ICAI answers) into casebook questions.

Usage: python3 scripts/found2questions.py <chapter-id>
Config work/<id>/build/config.json keys used:
  "found": ["work/<x>/found-rtpmtp.md", ...]   # files in the found-file layout (references/afm.md)
  "tag": "[Ch12]"                               # optional: keep only headings containing this tag (several chapters share a sweep)
  "rules": [["regex on topic+question", "provision-id"], ...]   # first match = deciding provision; up to 3 links
  "default": "provision-id"
  "overrides": {"<question id>": ["prov", ...]}
Writes work/<id>/parts/questions-10-found.json and work/<id>/build/found-index.json (for review).
MCQs (heading contains "MCQ") need four options (A)–(D) and a key ("Option (X)" / "Answer key"); unparsed items are listed.
"""
import sys, re, json
sys.path.insert(0, 'scripts')
from found2html import md
ID = sys.argv[1]; W = f'work/{ID}'
C = json.load(open(f'{W}/build/config.json'))
def links_for(text):
    t = text.lower(); out = []
    for rx, p in C['rules']:
        if re.search(rx, t) and p not in out: out.append(p)
    return out[:3] or [C['default']]
def mcq_parse(q, a):
    q = re.sub(r'(?m)^\s*([A-D])[.)]\s+', r'(\1) ', q)
    parts = re.split(r'\(\s*([A-Da-d])\s*\)\s*', q)
    stem, o = parts[0], {}
    for i in range(1, len(parts) - 1, 2):
        if parts[i].upper() not in o: o[parts[i].upper()] = parts[i + 1].strip()
    if len(o) < 4:  # some files list the options under the ICAI answer heading, one per line
        o = dict(re.findall(r'(?m)^\(([A-D])\)\s*(.+)$', a))
    if len(o) < 4: return None
    m = re.search(r'(?i)(?:option|answer[^:()]*:|key[^:()]*:)\s*\(?\s*([a-d])\s*\)', a)
    if not m: return None
    clean = lambda s: re.sub(r'\s*\((Case Study|Case Scenario|\d+ (MCQs )?x|\d+ Marks?).*$', '', s, flags=re.S).strip()
    return stem.strip(), [clean(o[k]) for k in 'ABCD'], 'ABCD'.index(m.group(1).upper())
qs, flags, cnt = [], [], {'R': 0, 'K': 0, 'P': 0, 'M': 0}
for fn in C['found']:
    txt = open(fn).read()
    sec3 = txt.split('## 3.')[1].split('## 4.')[0]
    for blk in re.split(r'\n(?=### )', sec3):
        if not blk.startswith('### '): continue
        head = blk.split('\n')[0][4:].strip()
        if C.get('tag') and C['tag'] not in head: continue
        m = re.match(r'(RTP|MTP|PYQ) ([A-Za-z]+\.? \d{4})(?: (S-I{1,2}))?:\s*(.+?)\s*\(([^)]*?)(?:Marks?|not stated[^)]*)\)\.?\s*(.*)', head)
        if not m: flags.append('HEAD ' + head); continue
        typ, att, ser, qno, marks, topic = m.groups()
        marks = re.sub(r'\D', '', marks or '')
        body = blk.split('\n', 1)[1] if '\n' in blk else ''
        rep = (re.search(r'\nSM repeat:\s*(.*)', body) or [None, ''])[1].strip()
        body = re.sub(r'\nSM repeat:.*', '', body)
        qm = re.search(r'\*\*Question\.\*\*(.*?)(?=\*\*ICAI (?:answer|Suggested Answer)[^*]*\*\*)', body, re.S)
        am = re.search(r'\*\*ICAI (?:answer|Suggested Answer)[^*]*\*\*(.*)', body, re.S)
        if not qm or not am: flags.append('QA ' + head); continue
        qtext, atext = qm.group(1).strip(), am.group(1).strip()
        checks = re.findall(r'CHECK:[^\n]*', atext + '\n' + qtext)
        atext = re.sub(r'\n?CHECK:[^\n]*', '', atext); qtext = re.sub(r'\n?CHECK:[^\n]*', '', qtext)
        atext = re.sub(r'\s*\((?:[^()]|\([^()]*\))*?(?:App[- ]|[Aa]pp-written|[Rr]ecompute)(?:[^()]|\([^()]*\))*\)', '', atext).strip()  # agents' own recomputes are not ICAI text
        pending = re.match(r'(?i)not available', atext)
        if pending: atext = 'ICAI has not yet published the answer (question paper only).'
        label = f"{typ} {att}" + (f" {ser}" if ser else '') + f" · {qno.strip()}" + (f" · {marks} marks" if typ == 'PYQ' and marks else '')
        label = re.sub(r'· Q(\d+) \(MCQ\)', r'· MCQ \1', label)
        lk = links_for(topic + ' ' + qtext[:800])
        note = ''
        # CHECK remarks from research agents are not shown: apparent ICAI slips are usually PDF-extraction artefacts.
        if rep and re.match(r'(?i)(yes|variant|near)', rep): note += f'<p><em>Study-material link: {rep}</em></p>'
        p = None if pending or 'MCQ' not in qno + head.split('.')[0] else mcq_parse(qtext, atext)
        if p:  # an MCQ without a single ICAI key (e.g. "No Correct Option") is kept as a written question
            stem, opts, ans = p
            atext = re.sub(r'(?m)^\([A-D]\)[^\n]*\n?', '', atext).strip()
            cnt['M'] += 1; qid = f"M{cnt['M']}"
            qs.append({'id': qid, 'src': label, 'k': 'mcq', 'links': C.get('overrides', {}).get(qid, lk), 'v': 'MCQ', 'q': md(stem), 'opts': opts, 'ans': ans,
                       'why': re.sub(r'\s+', ' ', re.sub(r'\*\*|\|', '', atext))[:700], 'a': f"<p><strong>Answer: ({'abcd'[ans]})</strong> {opts[ans]}</p>" + md(atext) + note, 'trap': ''})
        else:
            pre = {'RTP': 'R', 'MTP': 'K', 'PYQ': 'P'}[typ]; cnt[pre] += 1; qid = f'{pre}{cnt[pre]}'
            qs.append({'id': qid, 'src': label, 'k': typ.lower(), 'links': C.get('overrides', {}).get(qid, lk), 'v': 'Theory', 'q': md(qtext), 'a': md(atext) + note, 'trap': '', '_topic': topic, '_rep': rep})
json.dump([{k: v for k, v in q.items() if not k.startswith('_')} for q in qs], open(f'{W}/parts/questions-10-found.json', 'w'), ensure_ascii=False, indent=1)
json.dump([{'id': q['id'], 'src': q['src'], 'links': q['links'], 'topic': q.get('_topic', ''), 'rep': q.get('_rep', '')} for q in qs], open(f'{W}/build/found-index.json', 'w'), ensure_ascii=False, indent=1)
print(len(qs), cnt); print('\n'.join(flags))
