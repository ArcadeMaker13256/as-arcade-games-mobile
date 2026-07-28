from pathlib import Path
from playwright.sync_api import sync_playwright
import re,base64,sys
ROOT=Path(__file__).resolve().parent
html=(ROOT/'index.html').read_text()
html=re.sub(r'<link rel="stylesheet"[^>]+>','',html)
html=re.sub(r'<link rel="manifest"[^>]+>','',html)
html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',html)
logo=base64.b64encode((ROOT/'assets/arcade-logo.png').read_bytes()).decode()
html=html.replace('./assets/arcade-logo.png?v=9.0',f'data:image/png;base64,{logo}')
FAKE_STORAGE="""() => { const store={}; Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(store,k)?store[k]:null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k],clear:()=>Object.keys(store).forEach(k=>delete store[k])}, configurable:true}); }"""
def load(page):
    page.set_default_timeout(1500)
    page.set_content(html); page.evaluate(FAKE_STORAGE); page.add_style_tag(content=(ROOT/'styles.css').read_text())
    for f in ['avatar.js','games.js','game-engines.js','extra-engines.js','app.js']: page.add_script_tag(content=(ROOT/f).read_text())
def account(page,user='tester'):
    page.click('#createBtn');page.fill('#newUsername',user);page.fill('#newDisplayName','QA Player');page.fill('#newPin','1234');page.click('#saveAccountBtn');page.wait_for_timeout(50);page.fill('#loginPin','1234');page.click('#loginBtn');page.wait_for_timeout(50)
fail=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    ctx=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
    page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));load(page);account(page)
    ids=page.eval_on_selector_all('.game-card','els=>els.map(e=>e.dataset.gameId)')
    print('catalog',len(ids),flush=True)
    for n,gid in enumerate(ids,1):
        try:
            before=len(errors);page.locator(f'.game-card[data-game-id="{gid}"]').click();page.click('#startNew');page.wait_for_timeout(25)
            dock=page.locator('#touchControls').evaluate("e=>({display:getComputedStyle(e).display,position:getComputedStyle(e).position,bottom:getComputedStyle(e).bottom})")
            if dock['display']=='none' or dock['position']!='fixed':fail.append(f'{gid}: touch dock {dock}')
            for key in ['ArrowRight','ArrowUp','Space','Enter','KeyD','KeyF']:page.keyboard.press(key)
            box=page.locator('#gameCanvas').bounding_box()
            if box:page.mouse.click(box['x']+box['width']*.5,box['y']+box['height']*.5)
            page.wait_for_timeout(25)
            if page.locator('#gameOverlay').is_visible() and 'Game Error' in page.locator('#gameOverlay').inner_text():fail.append(f'{gid}: {page.locator("#gameOverlay").inner_text()}')
            if len(errors)>before:fail.append(f'{gid}: {errors[before:]}')
            page.click('#backToLauncher');page.wait_for_timeout(10)
        except Exception as e:
            fail.append(f'{gid}: QA exception {e}')
            try: page.evaluate('exitGame()')
            except: pass
        print(n,gid,'OK' if not any(x.startswith(gid+':') for x in fail) else 'FAIL',flush=True)
    browser.close()
print(f'Games tested: {len(ids)}')
print(f'Browser test: {"PASS" if not fail else "FAIL"}')
for item in fail:print(' -',item)
sys.exit(1 if fail else 0)
