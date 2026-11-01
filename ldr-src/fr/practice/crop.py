import pymupdf, re, os
class CL(list): pass
class Doc:
    def __init__(s, path):
        s.d=pymupdf.open(path); s.L=[]
        for pno,p in enumerate(s.d):
            for b in p.get_text('dict')['blocks']:
                for l in b.get('lines',[]):
                    t=''.join(sp['text'] for sp in l['spans']).strip()
                    if not t: continue
                    bold=any('Bold' in sp['font'] for sp in l['spans'] if sp['text'].strip())
                    s.L.append((pno,l['bbox'][1],l['bbox'][3],l['bbox'][0],t,bold))
        s.L.sort(key=lambda r:(r[0],round(r[1]),r[3]))
        s.bounds={}
        for pno,p in enumerate(s.d):
            ls=[r for r in s.L if r[0]==pno]
            foot=[r[1] for r in ls if 'Institute of Chartered' in r[4]]
            bot=min(foot)-4 if foot else p.rect.height-25
            hdr=[r[2] for r in ls if r[1]<65]
            top=(max(hdr)+3) if hdr else 40
            s.bounds[pno]=(top,bot)
    def find(s, pat, start=(0,0), bold=None, maxx=None):
        for r in s.L:
            if (r[0],r[1])<start: continue
            if bold is not None and r[5]!=bold: continue
            if maxx is not None and r[3]>maxx: continue
            if re.match(pat, r[4]): return r
        return None
    def crop(s, a, b, name, zoom=float(os.environ.get('ZOOM', 2.2)), inclusive_end=False):
        """a,b = (pno,y). crop from a to b (exclusive) across pages; returns list of png paths"""
        out=[]; pno,y=a
        while True:
            top,bot=s.bounds[pno]
            y0=max(y,top)-2
            if pno==b[0]: y1=b[1]
            else: y1=bot
            p=s.d[pno]; W=p.rect.width
            if y1-y0>6:
                # trim y1 to last text line inside range
                ls=[r for r in s.L if r[0]==pno and r[1]>=y0-1 and r[2]<=y1+1]
                draws=[dr['rect'] for dr in p.get_drawings() if dr['rect'].y0>=y0-1 and dr['rect'].y1<=y1+1]
                if ls or draws:
                    yb=max([r[2] for r in ls]+[r.y1 for r in draws])+3
                    yb=min(yb,y1)
                    clip=pymupdf.Rect(45,y0,W-30,yb)
                    pix=p.get_pixmap(matrix=pymupdf.Matrix(zoom,zoom),clip=clip)
                    fn=f'img/{name}_{len(out)}.jpg'; pix.save(fn, jpg_quality=int(os.environ.get('JQ', 78))); out.append((fn,clip.width,clip.height))
            if pno>=b[0]: break
            pno+=1; y=0
        out=CL(out); out.txt=s.text(a,b)
        return out

    def text(s, a, b):
        return ' '.join(r[4] for r in s.L if a <= (r[0], r[1]) < b and s.bounds[r[0]][0] <= r[1] <= s.bounds[r[0]][1])
