from pathlib import Path
from playwright.sync_api import sync_playwright
import re,base64,sys
ROOT=Path(__file__).resolve().parent
html=(ROOT/'index.html').read_text()
html=re.sub(r'<link rel="stylesheet"[^>]+>','',html)
html=re.sub(r'<link rel="manifest"[^>]+>','',html)
html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',html)
logo=base64.b64encode((ROOT/'assets/arcade-logo.png').read_bytes()).decode()
html=html.replace('./assets/arcade-logo.png?v=8.0',f'data:image/png;base64,{logo}')
FAKE_STORAGE="""() => { const store={}; Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(store,k)?store[k]:null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k],clear:()=>Object.keys(store).forEach(k=>delete store[k])}, configurable:true}); }"""
def load(page):
    page.set_content(html); page.evaluate(FAKE_STORAGE); page.add_style_tag(content=(ROOT/'styles.css').read_text())
    for f in ['avatar.js','games.js','game-engines.js','app.js']: page.add_script_tag(content=(ROOT/f).read_text())
def account(page,user='tester'):
    page.click('#createBtn');page.fill('#newUsername',user);page.fill('#newDisplayName','QA Player');page.fill('#newPin','1234');page.click('#saveAccountBtn');page.wait_for_timeout(250);page.fill('#loginPin','1234');page.click('#loginBtn');page.wait_for_timeout(250)
fail=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    ctx=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
    page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));load(page)
    logo_info=page.locator('#mainLogo').evaluate('(e)=>({complete:e.complete,w:e.naturalWidth,h:e.naturalHeight})')
    if not logo_info['complete'] or logo_info['w']<400: fail.append(f'Logo failed: {logo_info}')
    account(page)
    ids=page.eval_on_selector_all('.game-card','els=>els.map(e=>e.dataset.gameId)')
    for gid in ids:
        before=len(errors);page.locator(f'.game-card[data-game-id="{gid}"]').click();page.click('#startNew');page.wait_for_timeout(120)
        dock=page.locator('#touchControls').evaluate("e=>({display:getComputedStyle(e).display,position:getComputedStyle(e).position,bottom:getComputedStyle(e).bottom})")
        if dock['display']=='none' or dock['position']!='fixed' or dock['bottom']!='0px':fail.append(f'{gid}: touch dock {dock}')
        for _ in range(3):
            for key in ['ArrowRight','ArrowUp','Space','Enter','KeyD','KeyF']:page.keyboard.press(key)
            box=page.locator('#gameCanvas').bounding_box()
            if box:page.mouse.click(box['x']+box['width']*.5,box['y']+box['height']*.5)
            page.wait_for_timeout(120)
        if page.locator('#gameOverlay').is_visible() and 'Game Error' in page.locator('#gameOverlay').inner_text():fail.append(f'{gid}: {page.locator("#gameOverlay").inner_text()}')
        if len(errors)>before:fail.append(f'{gid}: {errors[before:]}')
        page.click('#backToLauncher');page.wait_for_timeout(25)
    ctx.close()
    ctx=browser.new_context(viewport={'width':1280,'height':800});page=ctx.new_page();load(page);account(page,'desktop');page.locator('.game-card').first.click();page.click('#startNew');page.wait_for_timeout(100)
    if page.locator('#touchControls').evaluate('e=>getComputedStyle(e).display')!='none':fail.append('Desktop touch controls should initially be hidden')
    page.click('#controlsToggle');page.wait_for_timeout(30)
    if page.locator('#touchControls').evaluate('e=>getComputedStyle(e).display')=='none':fail.append('Desktop touch control toggle failed')
    # Mock a connected gamepad and confirm the shared input layer receives it.
    page.evaluate("""() => { const pad={axes:[1,0],buttons:Array.from({length:16},(_,i)=>({pressed:i===0}))}; Object.defineProperty(navigator,'getGamepads',{value:()=>[pad],configurable:true}); }""")
    page.wait_for_timeout(100)
    keys=page.evaluate('Array.from(session.keys)')
    if 'ArrowRight' not in keys or 'Space' not in keys:fail.append(f'Gamepad mapping failed: {keys}')
    browser.close()
print(f'Games tested: {len(ids)}')
print(f'Browser test: {"PASS" if not fail else "FAIL"}')
for item in fail:print(' -',item)
sys.exit(1 if fail else 0)
