#!/usr/bin/env python3
"""Turn a research agent's found-*.md (ICAI questions + answers in markdown) into app HTML.

Used from a chapter build script in work/<id>/:
    import sys; sys.path.insert(0, "scripts")            # run from the repo root
    from found2html import sections, split_qa, md
    S = sections("work/afm-ch09/found-pyq.md")             # {"<heading>": body}
    q, a = split_qa(S["May 2025: Q5(a) (7 Marks)"])        # markdown question / ICAI answer
    html_q, html_a = md(q), md(a)

Expected found-*.md layout (give it to every research agent):
    ### <Attempt> <S-I/S-II if MTP>: Q<n>(<part>) (<m> Marks)
    **Question.** …text, markdown tables…
    **ICAI answer.** …text, markdown tables…   (or **ICAI Suggested Answer**)
    SM repeat: <note>                           (stripped)
Markdown tables become <table>; **bold** -> <strong>; "[note]" -> "Note:"; each other line -> <p>.
"""
import re
def inline(s):
    s = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)
    s = re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])', r'<em>\1</em>', s)
    s = s.replace('` ', '₹ ').replace('\\*', '*')
    s = s.replace('<strong>[note]</strong>', '<strong>Note:</strong>').replace('[note]', 'Note:')
    return s.strip()
def md(text):
    out, rows = [], []
    def flush():
        if rows:
            h, *b = rows
            out.append('<table><tr>' + ''.join(f'<th>{inline(c)}</th>' for c in h) + '</tr>' +
                       ''.join('<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in r) + '</tr>' for r in b) + '</table>')
            rows.clear()
    for line in text.split('\n'):
        l = line.strip()
        if l.startswith('|'):
            cells = [c.strip() for c in l.strip('|').split('|')]
            if all(re.fullmatch(r':?-{2,}:?', c) or c == '' for c in cells) and any(cells): continue
            rows.append(cells); continue
        flush()
        if not l or l == '---': continue
        if l.startswith('```'): continue
        out.append(f'<p>{inline(l)}</p>')
    flush()
    return ''.join(out)
def sections(path):
    txt = open(path).read()
    parts = re.split(r'\n### ', txt)
    res = {}
    for p_ in parts[1:]:
        head, body = p_.split('\n', 1)
        body = body.split('\n## ')[0]
        res[head.strip()] = body
    return res
def split_qa(body):
    body = re.sub(r'\*\*Repeat note:\*\*.*\n', '', body)
    body = re.sub(r'(?m)^SM repeat:.*$', '', body)
    m = re.search(r'\*\*(ICAI Suggested Answer|ICAI answer[^*]*|ICAI Answer[^*]*|Suggested Answer[^*]*|Answer[^*]*)\*\*', body)
    q = body[:m.start()] if m else body
    a = body[m.end():] if m else ''
    q = re.sub(r'\*\*(Question|Case)[^*]*\*\*', '', q)
    return q.strip(), a.strip()
