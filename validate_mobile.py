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
check(not any('survival' in (g['name']+' '+g['description']+' '+g['objective']).lower() for g in games),'Survival-template wording remains in catalog')
engine_text=(ROOT/'game-engines.js').read_text(encoding='utf-8')+(ROOT/'extra-engines.js').read_text(encoding='utf-8')
for g in games:
    check(re.search(r'\b'+re.escape(g['engine'])+r'\s*:',engine_text) is not None,f'Missing engine mapping: {g["engine"]}')
for f in ['avatar.js','games.js','game-engines.js','extra-engines.js','app.js','service-worker.js']:
    result=subprocess.run(['node','--check',str(ROOT/f)],capture_output=True,text=True)
    check(result.returncode==0,f'{f} syntax failed: {result.stderr.strip()}')
for f in ['index.html','styles.css','manifest.webmanifest','assets/arcade-logo.png','icons/icon-192.png','icons/icon-512.png']:
    check((ROOT/f).exists(),f'Missing required file: {f}')
for f in ['assets/arcade-logo.png','icons/icon-192.png','icons/icon-512.png']:
    try:
        im=Image.open(ROOT/f);im.verify()
    except Exception as e: errors.append(f'Invalid image {f}: {e}')
html=(ROOT/'index.html').read_text(encoding='utf-8')
check('extra-engines.js?v=9.0' in html,'extra-engines.js is not loaded by index.html')
check('75 genuinely different games' in html,'Login screen does not show honest 75-game count')
sw=(ROOT/'service-worker.js').read_text(encoding='utf-8')
check('extra-engines.js?v=9.0' in sw,'Service worker does not cache extra engines')
print('Games:',len(games))
print('Unique names:',len({g['name'] for g in games}))
print('Unique engines:',len({g['engine'] for g in games}))
print('Validation:', 'PASS' if not errors else 'FAIL')
for e in errors: print(' -',e)
sys.exit(bool(errors))
