from pathlib import Path
from playwright.sync_api import sync_playwright
import re,base64,sys,json
ROOT=Path(__file__).resolve().parent
html=(ROOT/'index.html').read_text()
html=re.sub(r'<link rel="stylesheet"[^>]+>','',html)
html=re.sub(r'<link rel="manifest"[^>]+>','',html)
html=re.sub(r'<link rel="icon"[^>]+>','',html)
html=re.sub(r'<link rel="apple-touch-icon"[^>]+>','',html)
html=re.sub(r'<script[^>]+src="[^"]+"[^>]*></script>','',html)
logo=base64.b64encode((ROOT/'assets/arcade-logo.png').read_bytes()).decode()
html=html.replace('./assets/arcade-logo.png?v=10.0',f'data:image/png;base64,{logo}')
FAKE_STORAGE="""() => { const store={}; Object.defineProperty(window,'localStorage',{value:{getItem:k=>Object.prototype.hasOwnProperty.call(store,k)?store[k]:null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k],clear:()=>Object.keys(store).forEach(k=>delete store[k])}, configurable:true}); window.open=(url)=>{window.__openedUrl=url;return null}; }"""
def load(page):
    page.set_default_timeout(2500)
    page.set_content(html)
    page.evaluate(FAKE_STORAGE)
    page.add_style_tag(content=(ROOT/'styles.css').read_text())
    for f in ['avatar.js','games.js','game-engines.js','extra-engines.js','app.js']:
        page.add_script_tag(content=(ROOT/f).read_text())
def account(page,user='tester'):
    page.click('#createBtn');page.fill('#newUsername',user);page.fill('#newDisplayName','QA Player');page.fill('#newPin','1234');page.click('#saveAccountBtn');page.wait_for_timeout(60);page.fill('#loginPin','1234');page.click('#loginBtn');page.wait_for_timeout(80)
fail=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    # Mobile full catalog and accessibility
    ctx=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
    page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));load(page)
    logo_info=page.locator('#mainLogo').evaluate('(e)=>({w:e.naturalWidth,h:e.naturalHeight,complete:e.complete})')
    if not logo_info['complete'] or logo_info['w']<450: fail.append(f'logo render: {logo_info}')
    page.click('#authWebsiteBtn');
    if page.evaluate('window.__openedUrl')!='https://sites.google.com/view/agsarcadegames/home':fail.append('auth website link wrong')
    account(page)
    page.click('[data-panel="settingsPanel"]');page.select_option('#controlSizeSetting','xlarge');page.select_option('#textSizeSetting','large');page.select_option('#cardSizeSetting','large');page.click('#saveSettings');page.wait_for_timeout(30)
    ids=page.eval_on_selector_all('.game-card','els=>els.map(e=>e.dataset.gameId)')
    if len(ids)!=75:fail.append(f'catalog count {len(ids)}')
    for n,gid in enumerate(ids,1):
        try:
            before=len(errors);page.locator(f'.game-card[data-game-id="{gid}"]').click();page.click('#startNew');page.wait_for_timeout(30)
            dock=page.locator('#touchControls').evaluate("e=>({display:getComputedStyle(e).display,position:getComputedStyle(e).position,bottom:getComputedStyle(e).bottom})")
            if dock['display']=='none' or dock['position']!='fixed' or dock['bottom']!='0px':fail.append(f'{gid}: touch dock {dock}')
            if n==1:
                w=page.locator('.p1-controls .dpad button').first.evaluate('e=>parseFloat(getComputedStyle(e).width)')
                if w<68:fail.append(f'xlarge control width {w}')
            for key in ['ArrowRight','ArrowUp','Space','Enter','KeyD','KeyF']:page.keyboard.press(key)
            box=page.locator('#gameCanvas').bounding_box()
            if box:page.mouse.click(box['x']+box['width']*.5,box['y']+box['height']*.5)
            page.wait_for_timeout(20)
            if page.locator('#gameOverlay').is_visible() and 'Game Error' in page.locator('#gameOverlay').inner_text():fail.append(f'{gid}: {page.locator("#gameOverlay").inner_text()}')
            if len(errors)>before:fail.append(f'{gid}: {errors[before:]}')
            page.click('#backToLauncher');page.wait_for_timeout(10)
        except Exception as e:
            fail.append(f'{gid}: QA exception {e}')
            try: page.evaluate('exitGame()')
            except: pass
    # Automatic current-level restart on loss
    page.evaluate("""() => {const g=ARCADE_GAMES.find(x=>x.id==='crossy-street');startGame(g,7);failLevel(123)}""")
    page.wait_for_timeout(80)
    txt=page.locator('#gameOverlay').inner_text()
    if 'Restarting Level 7' not in txt:fail.append(f'restart message missing: {txt}')
    page.wait_for_timeout(2300)
    state=page.evaluate('({level:session.level,completed:session.completed,title:document.querySelector("#gameLevelText").textContent})')
    if state['level']!=7 or state['completed']:fail.append(f'current-level restart failed: {state}')
    page.click('#backToLauncher')
    # Test all campaign levels can construct/update/draw
    deep=page.evaluate("""() => {
      const issues=[];const oldC=window.completeLevel,oldF=window.failLevel;window.completeLevel=()=>{};window.failLevel=()=>{};
      try{for(const g of ARCADE_GAMES.filter(x=>x.campaign)){for(let level=1;level<=40;level++){try{const s=new GameSession(g,level);s.engine.init?.();s.engine.update?.(.001);s.engine.draw(s.ctx);s.engine.cleanup?.()}catch(e){issues.push(`${g.id} level ${level}: ${e.message}`);break}}}}finally{window.completeLevel=oldC;window.failLevel=oldF}return issues;
    }""")
    if deep:fail.extend(deep)
    ctx.close()
    # Desktop keyboard/gamepad/touch toggle
    ctx=browser.new_context(viewport={'width':1280,'height':800});page=ctx.new_page();load(page);account(page,'desktopqa');page.locator('.game-card').first.click();page.click('#startNew');page.wait_for_timeout(50)
    if page.locator('#touchControls').evaluate('e=>getComputedStyle(e).display')!='none':fail.append('desktop dock should auto-hide')
    page.click('#controlsToggle');page.wait_for_timeout(20)
    if page.locator('#touchControls').evaluate('e=>getComputedStyle(e).display')=='none':fail.append('desktop touch toggle failed')
    page.keyboard.down('ArrowRight');page.wait_for_timeout(20)
    if 'ArrowRight' not in page.evaluate('Array.from(session.keys)'):fail.append('desktop keyboard key not received')
    page.keyboard.up('ArrowRight')
    page.evaluate("""() => {const pad={axes:[1,0],buttons:Array.from({length:16},(_,i)=>({pressed:i===0}))};Object.defineProperty(navigator,'getGamepads',{value:()=>[pad],configurable:true})}""");page.wait_for_timeout(90)
    keys=page.evaluate('Array.from(session.keys)')
    if 'ArrowRight' not in keys or 'Space' not in keys:fail.append(f'gamepad mapping {keys}')
    browser.close()
print(f'Games tested: {len(ids)}')
print('Campaign level constructions tested:',sum(g.get('campaign',False) for g in json.loads((ROOT/'games.json').read_text()))*40)
print(f'Browser QA: {"PASS" if not fail else "FAIL"}')
for item in fail:print(' -',item)
sys.exit(1 if fail else 0)
