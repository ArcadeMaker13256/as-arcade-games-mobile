from __future__ import annotations
import json, re, sys
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parent
errors=[]
required=['index.html','styles.css','app.js','game-engines.js','games.js','games.json','manifest.webmanifest','service-worker.js','avatar.js','assets/arcade-logo.png','icons/icon-192.png','icons/icon-512.png']
for f in required:
    if not (root/f).exists(): errors.append(f'Missing {f}')
games=json.loads((root/'games.json').read_text())
if len(games)!=36: errors.append(f'Expected 36 games, found {len(games)}')
for field in ['id','name','engine','controls','objective']:
    vals=[g.get(field) for g in games]
    if any(not v for v in vals): errors.append(f'Missing {field}')
for field in ['id','name']:
    vals=[g[field] for g in games]
    if len(vals)!=len(set(vals)): errors.append(f'Duplicate {field}')
engines=set(re.findall(r'([a-zA-Z0-9]+):[a-zA-Z0-9]+Game', (root/'game-engines.js').read_text()))
missing=sorted({g['engine'] for g in games}-engines)
if missing: errors.append('Missing engines: '+', '.join(missing))
for f,size in [('assets/arcade-logo.png',None),('icons/icon-192.png',(192,192)),('icons/icon-512.png',(512,512))]:
    try:
        im=Image.open(root/f); im.verify()
        if size and Image.open(root/f).size!=size: errors.append(f'Wrong size: {f}')
    except Exception as e: errors.append(f'Invalid image {f}: {e}')
index=(root/'index.html').read_text()
if './assets/arcade-logo.png?v=8.0' not in index: errors.append('Versioned main logo reference missing')
if 'game-engines.js?v=8.0' not in index: errors.append('Game engines script missing')
css=(root/'styles.css').read_text()
for token in ['position:fixed','bottom:0','touch-controls']:
    if token not in css: errors.append(f'Touch dock CSS missing {token}')
print(f'Games: {len(games)}')
print(f'Unique engines: {len({g["engine"] for g in games})}')
print('Static validation:', 'PASS' if not errors else 'FAIL')
for e in errors: print(' -',e)
sys.exit(1 if errors else 0)
