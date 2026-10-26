from PIL import Image,ImageDraw
import random,math,pathlib
random.seed(891)
out=pathlib.Path(__file__).resolve().parents[1] / 'assets'
# Original low-resolution painted patterns, generated offline; no ripped assets.
palettes=[('#d9fc13','#6415ae','#e844a7'),('#fb775c','#762d6f','#ffc082'),('#20f2bb','#082f60','#d7e619'),('#e43a93','#271052','#99ef14'),('#777e84','#342b52','#9ec5a2'),('#c5de36','#4e7222','#f372b7')]
for idx,(a,b,c) in enumerate(palettes):
 im=Image.new('RGB',(64,64),a);d=ImageDraw.Draw(im)
 if idx==0:
  for y in range(0,64,8):
   for x in range(0,64,8):d.rectangle((x,y,x+7,y+7),fill=a if (x+y)//8%2 else b);d.line((x,y,x+7,y),fill=c)
 elif idx==1:
  for y in range(64):
   for x in range(64):
    z=math.sin(x*.32+math.sin(y*.4)*3)+math.sin(y*.4+x*.1)
    if z>0.5:d.point((x,y),fill=b)
    elif z<-.8:d.point((x,y),fill=c)
 elif idx==2:
  for y in range(0,64,8):
   for x in range(0,64,16):
    xx=(x+(8 if y//8%2 else 0))%64
    d.rectangle((xx,y,xx+14,y+6),fill=b)
    d.line((xx+1,y+1,xx+12,y+1),fill=c)
 elif idx==3:
  for y in range(0,64,16):
   for x in range(0,64,16):
    d.ellipse((x+1,y+2,x+14,y+12),fill=c);d.ellipse((x+5,y+3,x+9,y+11),fill=b);d.point((x+6,y+4),fill='white')
 elif idx==4:
  for y in range(0,64,16):
   d.line((0,y,63,y),fill=b,width=2)
   for x in range(0,64,16):d.rectangle((x+3,y+4,x+5,y+6),fill=c)
 else:
  for n in range(45):
   x=random.randrange(64);y=random.randrange(64)
   d.line((x,y,x+random.randrange(-12,12),y+random.randrange(-12,12)),fill=b,width=2)
 for n in range(160):
  x=random.randrange(64);y=random.randrange(64);r,g,b=im.getpixel((x,y));delta=random.randrange(-24,24)
  d.point((x,y),fill=tuple(max(0,min(255,v+delta)) for v in [r,g,b]))
 im.save(out/f'tile{idx}.png')
for idx in range(6):
 im=Image.new('RGB',(32,32),['#ee9e82','#a9e342','#cc8fce','#89c9ae','#ffc984','#b9b1d8'][idx]);d=ImageDraw.Draw(im)
 for n in range(100):
  x=random.randrange(32);y=random.randrange(32);d.point((x,y),fill=random.choice(['#b06c83','#f4c6ad','#86955b']))
 d.rectangle((1,5,13,13),fill='#24202f');d.rectangle((19,7,30,17),fill='#24202f')
 d.rectangle((3,6,11,11),fill='#f3f4cc');d.rectangle((20,8,29,15),fill='#f3f4cc')
 d.rectangle((7,6,9,12),fill='#351342');d.rectangle((22,9,24,15),fill='#351342')
 d.polygon([(14,9),(18,22),(11,22)],fill='#955075')
 d.rectangle((4,24,28,29),fill='#50233e')
 for x in range(5,28,4):d.rectangle((x,24,x+2,26),fill='#e8f695')
 im.save(out/f'face{idx}.png')
# Oily strip-cloud sky panorama, deliberately low resolution.
im=Image.new('RGB',(256,128));pix=im.load()
for y in range(128):
 for x in range(256):
  w=math.sin(x*.09+math.sin(y*.12)*3)+math.cos(y*.21+x*.025)
  colors=[(239,80,91),(123,36,121),(32,27,94),(248,153,100),(151,102,160)]
  pix[x,y]=colors[int((w+2)*1.2)%5]
im.save(out/'sky.png')
