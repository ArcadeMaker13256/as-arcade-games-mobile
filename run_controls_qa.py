from pathlib import Path
from playwright.sync_api import sync_playwright
import re,base64,sys
ROOT=Path(__file__).resolve().parent
html=(ROOT/'index.html').read_text();html=re.sub(r'<link rel="stylesheet"[^>]+>','',html);html=re.sub(r'<link rel="manifest"[^>]+>','',html);html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',html)
logo=base64.b64encode((ROOT/'assets/arcade-logo.png').read_bytes()).decode();html=html.replace('./assets/arcade-logo.png?v=9.0',f'data:image/png;base64,{logo}')
FAKE="""() => { const store={}; Object.defineProperty(window,'localStorage',{value:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k],clear:()=>{}},configurable:true}); }"""
def load(page):
 page.set_content(html);page.evaluate(FAKE);page.add_style_tag(content=(ROOT/'styles.css').read_text());
 for f in ['avatar.js','games.js','game-engines.js','extra-engines.js','app.js']:page.add_script_tag(content=(ROOT/f).read_text())
def account(page,u):
 page.click('#createBtn');page.fill('#newUsername',u);page.fill('#newDisplayName','QA');page.fill('#newPin','1234');page.click('#saveAccountBtn');page.wait_for_timeout(50);page.fill('#loginPin','1234');page.click('#loginBtn');page.wait_for_timeout(50)
fail=[]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 # mobile
 c=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True);page=c.new_page();load(page)
 info=page.locator('#mainLogo').evaluate('(e)=>({w:e.naturalWidth,h:e.naturalHeight,complete:e.complete})')
 if not info['complete'] or info['w']<400:fail.append(f'logo {info}')
 account(page,'mobileqa');page.locator('.game-card').first.click();page.click('#startNew');page.wait_for_timeout(50)
 dock=page.locator('#touchControls').evaluate("e=>({display:getComputedStyle(e).display,pos:getComputedStyle(e).position,bottom:getComputedStyle(e).bottom})")
 if dock!={'display':'grid','pos':'fixed','bottom':'0px'}:fail.append(f'mobile dock {dock}')
 c.close()
 # desktop
 c=b.new_context(viewport={'width':1280,'height':800});page=c.new_page();load(page);account(page,'desktopqa');page.locator('.game-card').first.click();page.click('#startNew');page.wait_for_timeout(50)
 if page.locator('#touchControls').evaluate('e=>getComputedStyle(e).display')!='none':fail.append('desktop dock should auto-hide')
 page.click('#controlsToggle');page.wait_for_timeout(20)
 if page.locator('#touchControls').evaluate('e=>getComputedStyle(e).display')=='none':fail.append('desktop toggle failed')
 page.keyboard.down('ArrowRight');page.wait_for_timeout(20)
 if 'ArrowRight' not in page.evaluate('Array.from(session.keys)'):fail.append('keyboard key not received')
 page.keyboard.up('ArrowRight')
 page.evaluate("""() => {const pad={axes:[1,0],buttons:Array.from({length:16},(_,i)=>({pressed:i===0}))};Object.defineProperty(navigator,'getGamepads',{value:()=>[pad],configurable:true})}""");page.wait_for_timeout(80)
 keys=page.evaluate('Array.from(session.keys)')
 if 'ArrowRight' not in keys or 'Space' not in keys:fail.append(f'gamepad {keys}')
 b.close()
print('Controls QA:', 'PASS' if not fail else 'FAIL')
for x in fail:print(' -',x)
sys.exit(bool(fail))
