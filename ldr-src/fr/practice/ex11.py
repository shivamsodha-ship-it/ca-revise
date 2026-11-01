"""Extract Ch 11 items (SM illustrations/examples per unit, SM TYK, ICAI PQ) as crops + text."""
import re, os
from crop import Doc
SP = os.path.dirname(os.path.abspath(__file__))
ILL = r'^Illustration\s*\d+[A-C]?\s*(:.*)?$'
def pos(r): return (r[0], r[1])
def extract():
    out = []
    for u in range(1, 8):
        D = Doc(f'{SP}/../sm11/u{u}.pdf')
        anc = [r for r in D.L if r[5] and r[3] < 140 and (re.match(ILL, r[4]) or re.match(r'^Example\s*\d+\s*(:.*)?$', r[4]))]
        heads = [r for r in D.L if r[5] and r[3] < 110 and re.match(r'^\d+\.\d+(\.\d+)*\s+[A-Z]', r[4])]
        stops = sorted([pos(r) for r in anc + heads])
        stars = [pos(r) for r in D.L if re.match(r'^\*{3,}', r[4])]
        sols = [pos(r) for r in D.L if r[3] < 140 and re.match(r'^Solution', r[4])]
        for i, a in enumerate(anc):
            pa = pos(a)
            nxt = [s for s in stops if s > pa]; nxt = nxt[0] if nxt else (D.d.page_count - 1, 9999)
            st = [s for s in stars if pa < s < nxt]; end = st[0] if st else nxt
            so = [s for s in sols if pa < s < end]
            nm = f'c11u{u}_{i}'
            isex = a[4].startswith('Example')
            if so and not isex:
                q = D.crop(pa, so[0], nm + 'q'); s = D.crop(so[0], end, nm + 'a')
            else:
                q = D.crop(pa, end, nm + 'q'); s = []
            out.append(dict(src=f'SM Ch 11 Unit {u} · {a[4][:90]}', kind='sm-ex' if isex else 'sm-ill', q=q, a=s, unit=u))
    T = Doc(f'{SP}/../pq11/83232bos67302-tyk.pdf')
    qs = pos([r for r in T.L if r[4] == 'Questions'][0]); an = pos([r for r in T.L if r[4] == 'Answers'][0])
    def numbered(D, a, b, tag):
        A = [r for r in D.L if a <= pos(r) < b and r[3] < 75 and re.match(r'^\d{1,2}\.(\s|$)', r[4])]
        return [D.crop(pos(r), pos(A[i + 1]) if i + 1 < len(A) else b, f'{tag}_{i+1}') for i, r in enumerate(A)]
    Qs = numbered(T, qs, an, 'c11tq'); As = numbered(T, an, (T.d.page_count - 1, 9999), 'c11ta')
    for i, (q, a) in enumerate(zip(Qs, As)):
        out.append(dict(src=f'SM Ch 11 · Test Your Knowledge Q{i+1}', kind='sm-tyk', q=q, a=a))
    PQ = Doc(f'{SP}/../pq11/83231bos67302-pq.pdf')
    c11 = pos([r for r in PQ.L if r[4].startswith('CHAPTER-11')][0])
    qs = pos([r for r in PQ.L if r[4] == 'Questions' and pos(r) > c11][0]); an = pos([r for r in PQ.L if r[4] == 'Answers' and pos(r) > c11][0])
    endr = [r for r in PQ.L if pos(r) > an and re.search(r'CROSSWORD|Crossword|ACROSS|Across|PUZZLERS', r[4])]
    end = pos(endr[0]) if endr else (PQ.d.page_count - 1, 9999)
    Qs = numbered(PQ, qs, an, 'pq11q'); As = numbered(PQ, an, end, 'pq11a')
    for i, (q, a) in enumerate(zip(Qs, As)):
        out.append(dict(src=f'ICAI Practice Questions · Ch 11 Q{i+1}', kind='pq', q=q, a=a))
    return out
if __name__ == '__main__':
    import json
    it = extract()
    for x in it:
        print(x['src'], '| q', len(x['q']), 'a', len(x['a']), '|', re.sub(r'\s+', ' ', x['q'].txt)[len(x['src'])-20:][:110].replace('\n',' '))
