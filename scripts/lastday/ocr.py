import sys,subprocess,glob,os
from rapidocr_onnxruntime import RapidOCR
ocr=RapidOCR()
pdf,out=sys.argv[1],sys.argv[2]
d=out+'_img'; os.makedirs(d,exist_ok=True)
subprocess.run(['pdftoppm','-r','130','-png',pdf,d+'/p'])
with open(out,'w') as fo:
    for f in sorted(glob.glob(d+'/p-*.png')):
        r,_=ocr(f)
        fo.write(f'\f=== {os.path.basename(f)} ===\n')
        if r:
            # group by line using y
            items=sorted([(b[0][1],b[0][0],t) for b,t,c in r])
            line=[];last=None
            for y,x,t in items:
                if last is not None and abs(y-last)>14:
                    fo.write(' '.join(line)+'\n'); line=[]
                line.append(t); last=y
            fo.write(' '.join(line)+'\n')
