from pathlib import Path
import json,re,subprocess,sys
from PIL import Image
ROOT=Path(__file__).resolve().parent
errors=[]
def check(ok,msg):
    if not ok: errors.append(msg)
games=json.loads((ROOT/'games.json').read_text(encoding='utf-8'))
check(len(games)==75,f'Expected 75 games, found {len(games)}')
for field in ['id','name','engine']:
    vals=[g[field] for g in games]
    check(len(vals)==len(set(vals)),f'Duplicate {field} values found')
check(all(g.get('objective') and g.get('howTo') and g.get('controls') for g in games),'Every game must contain objective, howTo, and controls')
compatible=[g for g in games if g.get('campaign')]
check(len(compatible)>=60,f'Expected at least 60 compatible campaigns, found {len(compatible)}')
check(all(g.get('levels')==40 for g in compatible),'Every compatible campaign must have exactly 40 levels')
check(all(g.get('players')==1 for g in compatible),'Campaign compatibility should be limited to one-player games')
engine_text=(ROOT/'game-engines.js').read_text(encoding='utf-8')+(ROOT/'extra-engines.js').read_text(encoding='utf-8')
for g in games:
    check(re.search(r'\b'+re.escape(g['engine'])+r'\s*:',engine_text) is not None,f'Missing engine mapping: {g["engine"]}')
for f in ['avatar.js','games.js','game-engines.js','extra-engines.js','app.js','service-worker.js']:
    result=subprocess.run(['node','--check',str(ROOT/f)],capture_output=True,text=True)
    check(result.returncode==0,f'{f} syntax failed: {result.stderr.strip()}')
required=['index.html','styles.css','manifest.webmanifest','assets/arcade-logo.png','icons/favicon-32.png','icons/apple-touch-icon.png','apple-touch-icon-v10.png','icons/icon-192.png','icons/icon-512.png','icons/maskable-192.png','icons/maskable-512.png']
for f in required: check((ROOT/f).exists(),f'Missing required file: {f}')
expected_sizes={'icons/favicon-32.png':(32,32),'icons/apple-touch-icon.png':(180,180),'icons/icon-192.png':(192,192),'icons/icon-512.png':(512,512),'icons/maskable-192.png':(192,192),'icons/maskable-512.png':(512,512)}
for f,size in expected_sizes.items():
    try:
        im=Image.open(ROOT/f);check(im.size==size,f'{f} size is {im.size}, expected {size}');im.verify()
    except Exception as e: errors.append(f'Invalid image {f}: {e}')
html=(ROOT/'index.html').read_text(encoding='utf-8')
check('apple-touch-icon-v10.png' in html,'Apple Home Screen icon is not linked')
check('https://sites.google.com/view/agsarcadegames/home' in (ROOT/'app.js').read_text(),'Website link missing')
check('controlSizeSetting' in (ROOT/'app.js').read_text(),'Touch-control size setting missing')
check('Restarting Level' in (ROOT/'app.js').read_text(),'Automatic current-level restart messaging missing')
check('40-level campaigns' in html,'Login screen does not mention 40-level campaigns')
manifest=json.loads((ROOT/'manifest.webmanifest').read_text())
check(any(i.get('purpose')=='maskable' for i in manifest.get('icons',[])),'Maskable PWA icon missing')
check(any(i.get('purpose')=='any' for i in manifest.get('icons',[])),'Standard PWA icon missing')
print('Games:',len(games))
print('Compatible 40-level campaigns:',len(compatible))
print('Unique names:',len({g['name'] for g in games}))
print('Unique engines:',len({g['engine'] for g in games}))
print('Validation:', 'PASS' if not errors else 'FAIL')
for e in errors: print(' -',e)
sys.exit(bool(errors))
