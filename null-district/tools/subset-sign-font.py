"""Rebuild the offline signage font with fontTools and a Noto CJK JP source."""
from pathlib import Path
import sys
from fontTools import subset
from fontTools.ttLib import TTFont
root = Path(__file__).resolve().parents[1]
source = sys.argv[1] if len(sys.argv)>1 else '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
texts = [root/'game.js', root/'index.html', *sorted((root/'graphics').glob('*.js'))]
text = ''.join(p.read_text() for p in texts) + ''.join(chr(i) for i in range(32,127))
opts = subset.Options()
opts.name_IDs = [0,1,2,3,4,5,6,13,14]
opts.name_languages = [0x409]
opts.name_legacy = True
font = TTFont(source,fontNumber=0)
s = subset.Subsetter(options=opts)
s.populate(text=text)
s.subset(font)
for record in font['name'].names:
    if record.nameID in [1,3,4,6]:
        record.string = ('DistrictJP-Bold' if record.nameID==6 else 'District JP Bold').encode(record.getEncoding())
font.flavor = 'woff'
font.save(root/'graphics/fonts/DistrictJP.woff')
print('Subset font:', (root/'graphics/fonts/DistrictJP.woff').stat().st_size, 'bytes')
