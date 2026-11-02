"""Extract SM illustrations/examples (grouped by SM section), TYK and ICAI PQ for one small standard."""
import re, os
from crop import Doc
SP = os.path.dirname(os.path.abspath(__file__))
PQF = {'113': '83022bos67129-pq', '40': '83186bos67256-pq', '105': '83186bos67256-pq', '116': '83186bos67256-pq',
       '21': '83195bod67256-pq', '108': '83195bod67256-pq', '41': '83231bos67302-pq', '20': '83231bos67302-pq', '101': 'pq13', '36': '83186bos67256-pq', '23': '83186bos67256-pq', '19': '83195bod67256-pq', '33': '83195bod67256-pq'}
def pos(r): return (r[0], r[1])
ILL = r'^(Illustration|Examples?)\s*\d+[A-C]?\s*([:\-–(].*|-\s*\d+)?$'
def extract(n):
    D = Doc(f'{SP}/../small/sm{n}.pdf')
    tykr = [r for r in D.L if r[4] == 'TEST YOUR KNOWLEDGE']
    tyk = pos(tykr[0]) if tykr else (D.d.page_count - 1, 9999)
    secs = [r for r in D.L if r[5] and r[3] < 130 and re.match(r'^\d+(\.\d+)?\.?\s+[A-Z][A-Z ,&\'’()/-]{3,}', r[4]) and pos(r) < tyk]
    subs = [r for r in D.L if r[5] and r[3] < 130 and re.match(r'^\d+(\.\d+)+\.?\s+[A-Za-z]', r[4]) and pos(r) < tyk]
    anc = [r for r in D.L if r[5] and r[3] < 140 and re.match(ILL, r[4]) and pos(r) < tyk]
    stops = sorted(set([pos(r) for r in anc + subs + secs] + [tyk]))
    stars = [pos(r) for r in D.L if re.match(r'^\*{3,}', r[4])]
    sols = [pos(r) for r in D.L if r[3] < 140 and re.match(r'^(Solution|Answer)\b', r[4])]
    out = []
    for i, a in enumerate(anc):
        pa = pos(a)
        nxt = [s for s in stops if s > pa][0]
        st = [s for s in stars if pa < s < nxt]; end = st[0] if st else nxt
        so = [s for s in sols if pa < s < end]
        sec = [r for r in secs if pos(r) < pa]; sec = re.sub(r'\s+', ' ', sec[-1][4]).title() if sec else 'General'
        nm = f's{n}_{i}'
        q = D.crop(pa, so[0], nm + 'q') if so else D.crop(pa, end, nm + 'q')
        s = D.crop(so[0], end, nm + 'a') if so else []
        out.append(dict(src=f'SM Ind AS {n} · {a[4].strip()[:80]}', kind='sm-ex' if a[4].startswith('Example') else 'sm-ill', sec=sec, q=q, a=s))
    def numbered(Dd, a, b, tag):
        A = [r for r in Dd.L if a <= pos(r) < b and r[3] < 75 and re.match(r'^\d{1,2}\.(\s|$)', r[4])]
        return [Dd.crop(pos(r), pos(A[i + 1]) if i + 1 < len(A) else b, f'{tag}_{i+1}') for i, r in enumerate(A)]
    if tykr:
        qs = [pos(r) for r in D.L if r[4] == 'Questions' and pos(r) > tyk]; an = [pos(r) for r in D.L if r[4] == 'Answers' and pos(r) > tyk]
        if qs and an:
            for i, (q, a) in enumerate(zip(numbered(D, qs[0], an[0], f't{n}q'), numbered(D, an[0], (D.d.page_count - 1, 9999), f't{n}a'))):
                out.append(dict(src=f'SM Ind AS {n} · Test Your Knowledge Q{i+1}', kind='sm-tyk', sec='Test Your Knowledge', q=q, a=a))
    if n not in PQF: return out
    P = Doc(f'{SP}/../small/{PQF[n]}.pdf')
    hdr = [r for r in P.L if re.match(r'^(CHAPTER|UNIT)', r[4]) or 'PUZZLERS' in r[4]]
    me = [r for r in hdr if re.search(rf'IND AS\s*{n}\b', r[4])]
    if me:
        st = pos(me[0]); nx = [pos(r) for r in hdr if pos(r) > st]; en = nx[0] if nx else (P.d.page_count - 1, 9999)
        qs = [pos(r) for r in P.L if r[4] == 'Questions' and st < pos(r) < en]; an = [pos(r) for r in P.L if r[4] == 'Answers' and st < pos(r) < en]
        if qs and an:
            for i, (q, a) in enumerate(zip(numbered(P, qs[0], an[0], f'pq{n}q'), numbered(P, an[0], en, f'pq{n}a'))):
                out.append(dict(src=f'ICAI Practice Questions · Ind AS {n} Q{i+1}', kind='pq', sec='ICAI Practice Questions', q=q, a=a))
    return out
if __name__ == '__main__':
    import sys, json
    res = {}
    for n in sys.argv[1:]:
        it = extract(n)
        res[n] = [dict(src=x['src'], sec=x['sec'], q=re.sub(r'\s+', ' ', x['q'].txt), a=re.sub(r'\s+', ' ', getattr(x['a'], 'txt', ''))) for x in it]
        import collections
        print(n, len(it), collections.Counter(x['kind'] for x in it), 'no-sol', sum(1 for x in it if not x['a'] and x['kind'] != 'sm-ex'))
    json.dump(res, open('small.json', 'w'), ensure_ascii=False)
