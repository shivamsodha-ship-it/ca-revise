#!/bin/bash
# usage: runafm.sh N  -> public/ldr/afm/AFM_ChNN_Notes_and_Practice.pdf
set -e
S=/tmp/claude-0/-home-user-ca-revise/875a3bcf-d0bb-5e25-a756-3ce1bb336279/scratchpad
N=$1; NN=$(printf %02d $N)
cd $S/prac && ZOOM=1.7 JQ=70 python3 buildafm.py $N ../afm$N.html 2>&1 | grep -v -i warn
cd /home/user/ca-revise/ldr-src/fr && cp $S/afm$N.html ./_afm$N.html && node $S/paginate_afm.js _afm$N.html $S/pagedafm$N.html $S/afm$N.pdf "AFM · Ch $N practice" | tail -1; rm _afm$N.html
cd /home/user/ca-revise && python3 - "$N" <<'PY'
import sys,glob,re,pymupdf,os
n=int(sys.argv[1]); S='/tmp/claude-0/-home-user-ca-revise/875a3bcf-d0bb-5e25-a756-3ce1bb336279/scratchpad'
ldr=glob.glob(f'public/ldr/afm/AFM_LDR_Ch{n:02d}_*.pdf')[0]
out=pymupdf.open(); a=pymupdf.open(ldr); out.insert_pdf(a); k=a.page_count
b=pymupdf.open(f'{S}/afm{n}.pdf'); out.insert_pdf(b)
toc=[[1,'Notes (LDR, SM-checked)',1]]
labs=[('what ICAI asked','Past papers — what ICAI asked'),('Theory questions (SM','Theory — TYK with ICAI answers'),('SM illustrations with ICAI','SM illustrations with ICAI solutions'),('Practical questions (SM','TYK practical with ICAI solutions')]
for i in range(k,out.page_count):
    t=re.sub(r'\s+',' ',out[i].get_text())
    for key,lab in labs:
        if key in t and lab not in [x[1] for x in toc]: toc.append([1,lab,i+1])
out.set_toc(toc)
title=re.sub(r'^AFM_LDR_Ch\d+_|\.pdf$','',os.path.basename(ldr))
fn=f'public/ldr/afm/AFM_Ch{n:02d}_{title}_Notes_and_Practice.pdf'
out.save(fn,garbage=3,deflate=True); print(fn,out.page_count,os.path.getsize(fn)//1024,'KB',toc)
PY
