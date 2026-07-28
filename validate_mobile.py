"""Static validation for A's Arcade Games GitHub Mobile Edition."""
from __future__ import annotations
import json, re, subprocess, sys
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parent
required=['index.html','styles.css','app.js','games.js','games.json','manifest.webmanifest','service-worker.js','assets/logo.png','icons/icon-192.png','icons/icon-512.png']
fail=[]
for name in required:
    if not (ROOT/name).is_file(): fail.append(f'Missing {name}')
try:
    games=json.loads((ROOT/'games.json').read_text(encoding='utf-8'))
    if len(games)!=190: fail.append(f'Expected 190 games, found {len(games)}')
    ids=[g.get('id') for g in games]
    if len(ids)!=len(set(ids)): fail.append('Duplicate game IDs')
except Exception as e: fail.append(f'games.json: {e}')
for name in ['app.js','games.js']:
    try:
        cp=subprocess.run(['node','--check',str(ROOT/name)],capture_output=True,text=True)
        if cp.returncode: fail.append(f'{name}: {cp.stderr.strip()}')
    except FileNotFoundError:
        print('NOTE: Node.js not installed; skipped JavaScript parser check.')
for name,size in [('icons/icon-192.png',(192,192)),('icons/icon-512.png',(512,512))]:
    try:
        with Image.open(ROOT/name) as im:
            if im.size!=size: fail.append(f'{name}: expected {size}, found {im.size}')
            im.verify()
    except Exception as e: fail.append(f'{name}: {e}')
html=(ROOT/'index.html').read_text(encoding='utf-8') if (ROOT/'index.html').exists() else ''
for marker in ['gameCanvas','touchControls','gameInstructions','Parental Controls']:
    if marker not in html: fail.append(f'index.html missing {marker}')
js=(ROOT/'app.js').read_text(encoding='utf-8') if (ROOT/'app.js').exists() else ''
for marker in ["completedLevels","a.coins+=1","a.coins+=5","showDetails","openParentalControls"]:
    if marker not in js: fail.append(f'app.js missing {marker}')
print('PASS' if not fail else 'FAIL')
for item in fail: print(' -',item)
raise SystemExit(1 if fail else 0)
