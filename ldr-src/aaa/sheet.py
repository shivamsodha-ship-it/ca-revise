import glob,sys,subprocess
from PIL import Image
pdf=sys.argv[1]
for f in glob.glob('chk-*.png'): __import__('os').remove(f)
subprocess.run(['pdftoppm','-r','55','-png',pdf,'chk'],check=True)
ims=[Image.open(f) for f in sorted(glob.glob('chk-*.png'))]
o=Image.new('RGB',(sum(i.width for i in ims)+10*len(ims),ims[0].height),'white');x=0
for i in ims: o.paste(i,(x,0)); x+=i.width+10
o.save('sheet.png')
