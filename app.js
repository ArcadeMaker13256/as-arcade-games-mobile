'use strict';

const APP_VERSION='11.6-web';
const DB_KEY='asArcadeMobileDB';
const AVATARS=AVATAR_PRESETS.map(p=>p.id);
const THEMES=['neon','sunset','forest','royal','sky','candy','ocean','lava','mint','galaxy','retro','midnight','sports','creative','cozy','cyber','desert','ice','rainbow','monochrome','custom'];
const WALLPAPERS=['none','grid','stars','candy','waves','circuit','confetti','sunset','clouds','checker','aurora','space','neon-city','mountains','ocean-floor','pixel-sky','sports-field','music-stage','castle','jungle','snow','rainbow'];
const BANNERS=['Arcade Explorer','High Score Hero','Puzzle Master','Racing Champion','Creative Star','Family Game Night','Adventure Ace','Strategy Captain','Galaxy Gamer','Sports Legend','Cozy Player','Tech Wizard','Music Maker','Board Game Boss','Level Champion','Arcade Superstar','Speed Runner','Trophy Hunter','Coin Captain','Touchscreen Pro','Keyboard Hero','Controller Champion','Daily Challenger','Multiplayer MVP','Simulation Star','Word Wizard','Card Shark','Retro Legend','Neon Knight','Ultimate Arcade Legend'];
const CATEGORY_ICONS={Arcade:'🕹️',Adventure:'🗺️',Puzzle:'🧩',Strategy:'♟️',Sports:'🏆',Shooter:'🚀',Word:'🔤',Learning:'📚',Creative:'🎨',Casual:'🎯',Racing:'🏁',Multiplayer:'👥',Simulation:'⚙️',Cards:'🃏',Board:'🎲',Music:'🎵'};
const MULTIMODE_ENGINES=new Set(['pong','soccer','dotsboxes','volleyball','airhockey','tictactoe','connect4','reversi','checkers','mancala','gomoku','hex','tabletennis']);
const POINTER_GAME_ENGINES=new Set(['memory','lights','mines','sudoku','tictactoe','connect4','reversi','checkers','battleship','whack','bubble','basketball','archery','golf','drawing','trivia','towerdefense','chesstactics','wordsearch','crossword','scramble','mathsprint','typingrace','rhythm','sequencer','paintnumbers','jigsaw','sliding','pipes','laser','tangram','nonogram','mastermind','codebreaker','yahtzee','solitaire','war','gofish','dicerace','dotsboxes','mancala','morris','gomoku','hex','dominoes','bowling','fishing','cooking','farm','petcare','citybuilder','match3','robotcode']);
const ENGINE_SPEED_SCALE={snake:1.16,brick:1.12,pong:1.08,invaders:1.12,asteroids:1.1,flappy:1.02,dino:1.08,pacmaze:1.16,tetris:1.1,simon:1.05,whack:1.08,towerdefense:1.12,platformer:1.08,fruitmerge:1.04,racer:1.1,soccer:1.05,volleyball:1.06,airhockey:1.08,pinball:1.1,rhythm:1.03,typingrace:1.02,mathsprint:1.04,cooking:1.02,fishing:.98,petcare:1,citybuilder:1};
let selectedGameMode='1P';

const storeCost=(i,total,free=2)=>i<free?0:Math.min(120,30+Math.round((i-free)*90/Math.max(1,total-free-1)));
const STORE={
  themes:THEMES.map((name,i)=>({name,cost:name==='custom'?0:storeCost(i,THEMES.length,3)})),
  wallpapers:WALLPAPERS.map((name,i)=>({name,cost:storeCost(i,WALLPAPERS.length,3)})),
  banners:BANNERS.map((name,i)=>({name,cost:storeCost(i,BANNERS.length,1)})),
  avatars:AVATAR_PRESETS.map((preset,i)=>({name:preset.id,label:preset.name,cost:storeCost(i,AVATAR_PRESETS.length,4)}))
};
const completedCount=a=>Number(a.stats?.completed||0),levelCount=a=>Number(a.stats?.levels||0),playCount=a=>Number(a.stats?.plays||0),winCount=a=>Number(a.stats?.wins||0),gameCount=a=>Object.keys(a.progress||{}).length,highScore=a=>Math.max(0,...Object.values(a.progress||{}).map(p=>Number(p.highScore||0)));
const ACHIEVEMENTS=[
 ['First Steps','Play your first game',a=>playCount(a)>=1],['Getting Started','Play 5 games',a=>playCount(a)>=5],['Arcade Regular','Play 25 games',a=>playCount(a)>=25],['Arcade Fan','Play 100 games',a=>playCount(a)>=100],['Arcade Veteran','Play 250 games',a=>playCount(a)>=250],
 ['Level Learner','Complete 10 levels',a=>levelCount(a)>=10],['Level Explorer','Complete 25 levels',a=>levelCount(a)>=25],['Level Adventurer','Complete 50 levels',a=>levelCount(a)>=50],['Century Club','Complete 100 levels',a=>levelCount(a)>=100],['Level Master','Complete 250 levels',a=>levelCount(a)>=250],['Level Legend','Complete 500 levels',a=>levelCount(a)>=500],
 ['Game Finisher','Complete one game',a=>completedCount(a)>=1],['Campaign Collector','Complete 3 games',a=>completedCount(a)>=3],['Campaign Champion','Complete 5 games',a=>completedCount(a)>=5],['Ten Games Down','Complete 10 games',a=>completedCount(a)>=10],['Completion Expert','Complete 20 games',a=>completedCount(a)>=20],
 ['First Victory','Earn your first recorded win',a=>winCount(a)>=1],['Winning Streak','Earn 5 wins',a=>winCount(a)>=5],['Family Champion','Earn 10 wins',a=>winCount(a)>=10],['Victory Veteran','Earn 25 wins',a=>winCount(a)>=25],['Victory Legend','Earn 50 wins',a=>winCount(a)>=50],
 ['Game Sampler','Try 10 different games',a=>gameCount(a)>=10],['Genre Explorer','Try 20 different games',a=>gameCount(a)>=20],['Arcade Explorer','Try 35 different games',a=>gameCount(a)>=35],['Library Traveler','Try 50 different games',a=>gameCount(a)>=50],['Played Them All','Try all 100 games',a=>gameCount(a)>=100],
 ['Coin Starter','Own 30 AG Coins',a=>a.coins>=30],['Coin Collector','Own 60 AG Coins',a=>a.coins>=60],['Coin Saver','Own 100 AG Coins',a=>a.coins>=100],['Coin Vault','Own 250 AG Coins',a=>a.coins>=250],['Coin Royalty','Own 500 AG Coins',a=>a.coins>=500],
 ['Score Rookie','Reach a 1,000 high score',a=>highScore(a)>=1000],['Score Chaser','Reach a 2,500 high score',a=>highScore(a)>=2500],['Score Star','Reach a 5,000 high score',a=>highScore(a)>=5000],['Score Hero','Reach a 10,000 high score',a=>highScore(a)>=10000],['Score Legend','Reach a 25,000 high score',a=>highScore(a)>=25000],
 ['Arcade Level 5','Reach player level 5',a=>levelFromXp(a.xp)>=5],['Arcade Level 10','Reach player level 10',a=>levelFromXp(a.xp)>=10],['Arcade Level 15','Reach player level 15',a=>levelFromXp(a.xp)>=15],['Arcade Level 20','Reach player level 20',a=>levelFromXp(a.xp)>=20],['Arcade Level 30','Reach player level 30',a=>levelFromXp(a.xp)>=30],
 ['Favorite Finder','Favorite one game',a=>(a.favorites||[]).length>=1],['Favorite Shelf','Favorite 5 games',a=>(a.favorites||[]).length>=5],['Favorite Collection','Favorite 10 games',a=>(a.favorites||[]).length>=10],
 ['Avatar Artist','Customize an avatar',a=>!!a.updatedAt],['Theme Designer','Save a custom theme',a=>!!a.settings?.customThemeSaved],['Style Collector','Own 10 customization items',a=>Object.values(a.unlocks||{}).reduce((n,v)=>n+(Array.isArray(v)?v.length:0),0)>=10],['Style Master','Own 25 customization items',a=>Object.values(a.unlocks||{}).reduce((n,v)=>n+(Array.isArray(v)?v.length:0),0)>=25],
 ['Daily Player','Complete a daily challenge',a=>!!a.daily?.claimed],['Ultimate Arcade Legend','Complete 25 games and 500 levels',a=>completedCount(a)>=25&&levelCount(a)>=500]
];
const qs=s=>document.querySelector(s);const qsa=s=>[...document.querySelectorAll(s)];
const views={auth:qs('#authView'),launcher:qs('#launcherView'),game:qs('#gameView')};
const detailsDialog=qs('#detailsDialog'),panelDialog=qs('#panelDialog'),accountDialog=qs('#accountDialog'),controllerDialog=qs('#controllerDialog'),installDialog=qs('#installDialog');
let deferredInstall=null;let currentGame=null;let session=null;let activeAccountId=null;

function defaultDB(){return{version:1,adminHash:'',active:null,accounts:[]}}
function loadDB(){try{const d=JSON.parse(localStorage.getItem(DB_KEY));return d&&Array.isArray(d.accounts)?d:defaultDB()}catch{return defaultDB()}}
function migrateDB(d){
  let changed=false;d.version=5;
  for(const a of d.accounts){
    const normalized=normalizeAvatar(a.avatar);if(JSON.stringify(normalized)!==JSON.stringify(a.avatar)){a.avatar=normalized;changed=true}
    a.unlocks=a.unlocks||{};a.unlocks.avatars=Array.isArray(a.unlocks.avatars)?a.unlocks.avatars.filter(x=>AVATARS.includes(x)):AVATARS.slice(0,4);
    if(!a.unlocks.avatars.length)a.unlocks.avatars=AVATARS.slice(0,4);
    a.unlocks.themes=Array.isArray(a.unlocks.themes)?a.unlocks.themes.filter(x=>THEMES.includes(x)):['neon','sunset','forest'];
    a.unlocks.wallpapers=Array.isArray(a.unlocks.wallpapers)?a.unlocks.wallpapers.filter(x=>WALLPAPERS.includes(x)):['none','stars','grid'];
    a.unlocks.banners=Array.isArray(a.unlocks.banners)?a.unlocks.banners.filter(x=>BANNERS.includes(x)):[BANNERS[0]];
    if(!a.unlocks.themes.length)a.unlocks.themes=['neon'];if(!a.unlocks.themes.includes('custom'))a.unlocks.themes.push('custom');if(!a.unlocks.wallpapers.length)a.unlocks.wallpapers=['none'];if(!a.unlocks.banners.length)a.unlocks.banners=[BANNERS[0]];
    a.settings=Object.assign({theme:'neon',wallpaper:'stars',reducedMotion:false,highContrast:false,sound:true,controlSize:'normal',textSize:'normal',cardSize:'normal',gamePace:'standard',customTheme:{bg:'#071329',panel:'#101f42',card:'#162c58',accent:'#31d5ff',accent2:'#ff4fd8',text:'#f7fbff'}},a.settings||{});
    // Mobile 10.6 resets the temporary slow-mode values introduced by earlier hotfixes.
    // Players may still choose a slower or faster pace afterward.
    if(a.settings.speedBalanceVersion!=='10.8'){a.settings.gamePace='standard';a.settings.speedBalanceVersion='10.8';changed=true}
    a.parental=Object.assign({minutes:0,multiplayer:true,spending:true,categories:[],external:true},a.parental||{});a.resumeSession=a.resumeSession||null;
  }
  if(changed)saveDB(d);return d;
}
function saveDB(db){localStorage.setItem(DB_KEY,JSON.stringify(db))}
let db=migrateDB(loadDB());
function uid(){return crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)}
function randomAvatarConfig(){const c=defaultAvatarConfig();for(const key of Object.keys(c))c[key]=Math.floor(Math.random()*(AVATAR_OPTIONS[key]?.length||1));return c}
async function hashText(text){if(crypto.subtle){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}let h=2166136261;for(const c of text){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return String(h>>>0)}
function account(){return db.accounts.find(a=>a.id===activeAccountId)||null}
function updateAccount(fn){const a=account();if(!a)return;fn(a);a.updatedAt=Date.now();saveDB(db);refreshHeader();refreshAchievements(a)}
function newAccount(username,displayName,pinHash,type,avatar){return{id:uid(),username,displayName:displayName||username,pinHash,type,enabled:true,avatar:normalizeAvatar(avatar),coins:20,xp:0,banner:BANNERS[0],settings:{theme:'neon',wallpaper:'stars',reducedMotion:false,highContrast:false,sound:true,controlSize:'normal',textSize:'normal',cardSize:'normal',gamePace:'standard',customTheme:{bg:'#071329',panel:'#101f42',card:'#162c58',accent:'#31d5ff',accent2:'#ff4fd8',text:'#f7fbff'}},unlocks:{themes:['neon','sunset','forest','custom'],wallpapers:['none','stars','grid'],banners:[BANNERS[0]],avatars:AVATARS.slice(0,4)},favorites:[],progress:{},achievements:[],stats:{plays:0,levels:0,completed:0,wins:0,seconds:0},daily:{date:'',plays:0,levels:0,claimed:false},parental:{minutes:0,multiplayer:true,spending:true,categories:[],external:true},resumeSession:null,createdAt:Date.now()}}
function levelFromXp(xp){return Math.max(1,Math.floor(Math.sqrt(Math.max(0,xp)/80))+1)}
function xpForNext(level){return level*level*80}
function toast(text){const el=qs('#toast');el.textContent=text;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2500)}
function showView(name){Object.values(views).forEach(v=>v.classList.remove('active'));views[name].classList.add('active');window.scrollTo(0,0)}
function openDialog(dialog){dialog.showModal()}
function closeDialogs(){qsa('dialog[open]').forEach(d=>d.close())}
qsa('.close-dialog').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));

function applyTheme(){
  const a=account();document.body.className='';document.documentElement.removeAttribute('style');if(!a)return;
  document.body.classList.add(`theme-${a.settings.theme}`,`wallpaper-${a.settings.wallpaper}`,`controls-${a.settings.controlSize||'normal'}`,`text-${a.settings.textSize||'normal'}`,`cards-${a.settings.cardSize||'normal'}`);
  if(a.settings.theme==='custom'){const c=a.settings.customTheme||{};for(const [k,v] of Object.entries(c))if(/^#[0-9a-f]{6}$/i.test(v||''))document.documentElement.style.setProperty(`--${k}`,v)}
  if(a.settings.highContrast)document.body.classList.add('high-contrast');if(a.settings.reducedMotion)document.body.classList.add('reduced-motion')
}
function refreshAuth(){const sel=qs('#accountSelect');sel.innerHTML='';db.accounts.filter(a=>a.enabled).forEach(a=>sel.add(new Option(`${a.displayName} — ${avatarLabel(a.avatar)}`,a.id)));if(!sel.options.length)sel.add(new Option('Create an account first',''));qs('#loginPin').value='';refreshLoginAvatarPreview()}
function refreshLoginAvatarPreview(){const selected=db.accounts.find(a=>a.id===qs('#accountSelect').value&&a.enabled);qs('#loginAvatarPreview').innerHTML=avatarSVG(selected?selected.avatar:defaultAvatarConfig(),108)}
function refreshHeader(){const a=account();if(!a)return;qs('#avatarButton').innerHTML=avatarSVG(a.avatar,58);qs('#welcomeText').textContent=`Welcome, ${a.displayName}`;qs('#bannerText').textContent=a.banner;qs('#levelText').textContent=levelFromXp(a.xp);qs('#xpText').textContent=a.xp;qs('#coinText').textContent=a.coins;applyTheme();const d=todayDaily(a);qs('#dailySummary').textContent=`Daily: ${d.plays}/3 games • ${d.levels}/2 levels`}
function refreshAchievements(a){let changed=false;for(const [name,,test] of ACHIEVEMENTS){if(test(a)&&!a.achievements.includes(name)){a.achievements.push(name);a.xp+=50;changed=true;toast(`🏆 Achievement unlocked: ${name}`)}}if(changed)saveDB(db)}
function todayKey(date=new Date()){const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');return `${y}-${m}-${d}`}
function todayDaily(a){if(a.daily.date!==todayKey())a.daily={date:todayKey(),plays:0,levels:0,claimed:false};return a.daily}
function claimDaily(a){const d=todayDaily(a);if(d.claimed)return toast('Daily reward already claimed');if(d.plays>=3&&d.levels>=2){d.claimed=true;a.coins+=8;a.xp+=60;saveDB(db);refreshHeader();toast('Daily challenge complete: +8 AG Coins and +60 XP')}else toast('Play 3 games and complete 2 levels first')}

qs('#createBtn').addEventListener('click',()=>openCreateAccount());
qs('#parentBtn').addEventListener('click',()=>openParentalControls(true));
qs('#loginBtn').addEventListener('click',login);
qs('#loginPin').addEventListener('keydown',e=>{if(e.key==='Enter')login()});
qs('#accountSelect').addEventListener('change',refreshLoginAvatarPreview);
qs('#logoutBtn').addEventListener('click',()=>{if(session)session.stop();activeAccountId=null;db.active=null;saveDB(db);applyTheme();refreshAuth();showView('auth')});
qs('#backToLauncher').addEventListener('click',exitGame);
qs('#pauseBtn').addEventListener('click',()=>session&&session.togglePause());
qs('#controlsToggle').addEventListener('click',()=>toggleTouchControls());
qs('#avatarButton').addEventListener('click',()=>openPanel('settingsPanel'));
qs('#favoritesOnly').addEventListener('change',renderGames);qs('#categorySelect').addEventListener('change',renderGames);qs('#searchInput').addEventListener('input',renderGames);
qsa('[data-panel]').forEach(b=>b.addEventListener('click',()=>openPanel(b.dataset.panel)));
const touchControlPointers=new Map(),touchControlKeyCounts=new Map();
function pressTouchControl(button,pointerId){
  const id=String(pointerId),key=button.dataset.key;if(!key)return;
  const previous=touchControlPointers.get(id);if(previous&&previous.key!==key)releaseTouchControl(id);
  if(touchControlPointers.has(id))return;
  touchControlPointers.set(id,{button,key});touchControlKeyCounts.set(key,(touchControlKeyCounts.get(key)||0)+1);
  button.classList.add('pressed');session?.setKey(key,true);
}
function releaseTouchControl(pointerId){
  const id=String(pointerId),record=touchControlPointers.get(id);if(!record)return;touchControlPointers.delete(id);
  const next=Math.max(0,(touchControlKeyCounts.get(record.key)||1)-1);if(next)touchControlKeyCounts.set(record.key,next);else{touchControlKeyCounts.delete(record.key);session?.setKey(record.key,false)}
  if(![...touchControlPointers.values()].some(x=>x.button===record.button))record.button.classList.remove('pressed');
}
function releaseAllTouchControls(){for(const id of [...touchControlPointers.keys()])releaseTouchControl(id)}
qsa('#touchControls [data-key]').forEach(button=>{
  const down=e=>{e.preventDefault();e.stopPropagation();try{button.setPointerCapture?.(e.pointerId)}catch{}pressTouchControl(button,e.pointerId)};
  const up=e=>{e.preventDefault();releaseTouchControl(e.pointerId)};
  button.addEventListener('pointerdown',down,{passive:false});button.addEventListener('pointerup',up,{passive:false});button.addEventListener('pointercancel',up,{passive:false});button.addEventListener('lostpointercapture',up,{passive:false});
  button.addEventListener('contextmenu',e=>e.preventDefault());
  if(!window.PointerEvent){
    button.addEventListener('touchstart',e=>{e.preventDefault();for(const t of e.changedTouches)pressTouchControl(button,`touch-${t.identifier}`)},{passive:false});
    const end=e=>{e.preventDefault();for(const t of e.changedTouches)releaseTouchControl(`touch-${t.identifier}`)};button.addEventListener('touchend',end,{passive:false});button.addEventListener('touchcancel',end,{passive:false});
  }
});
window.addEventListener('blur',releaseAllTouchControls);
window.addEventListener('keydown',e=>{if(session){if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.code==='Escape'){session.togglePause();return}session.setKey(e.code,true)}});
window.addEventListener('keyup',e=>session&&session.setKey(e.code,false));

const controllerMenuState={buttons:new Map(),direction:'',nextMoveAt:0,connected:false};
const CONTROLLER_PREFS_KEY='as-arcade-controller-v11-6';
function readControllerPrefs(){try{return JSON.parse(localStorage.getItem(CONTROLLER_PREFS_KEY)||'{}')||{}}catch{return{}}}
const savedControllerPrefs=readControllerPrefs();
const controllerManager={
  activePadIndex:null,activationTimer:null,activationUntil:0,keyboardFallback:false,lastDetectedId:'',lastDebug:0,
  isAppleMobile:/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),
  standalone:window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true,
  framed:window.top!==window.self,
  joyConMode:savedControllerPrefs.joyConMode==='separate'?'separate':'combined',
  stickDeadZone:.24,rightAxisPairs:new Map()
};
function saveControllerPrefs(){try{localStorage.setItem(CONTROLLER_PREFS_KEY,JSON.stringify({joyConMode:controllerManager.joyConMode}))}catch{}}
function controllerStatus(text,connected=false){const el=qs('#controllerStatus');if(!el)return;el.textContent=text;el.classList.toggle('connected',connected)}
function gamepadGetter(){
  if(typeof navigator.getGamepads==='function')return navigator.getGamepads.bind(navigator);
  if(typeof navigator.webkitGetGamepads==='function')return navigator.webkitGetGamepads.bind(navigator);
  return null;
}
function rawGamepads(){try{const getter=gamepadGetter();return getter?Array.from(getter()||[]).filter(Boolean):[]}catch(error){console.warn('Gamepad read failed',error);return[]}}
function connectedGamepads(){const pads=rawGamepads();if(pads.length&&controllerManager.activePadIndex===null)controllerManager.activePadIndex=Number.isInteger(pads[0].index)?pads[0].index:0;return pads}
function gamepadButtonPressed(pad,index){const b=pad?.buttons?.[index];if(typeof b==='number')return b>.5;return !!(b&&(b.pressed||Number(b.value||0)>.5))}
function axisValue(pad,index){const value=Number(pad?.axes?.[index]);return Number.isFinite(value)?value:0}
function isJoyCon(pad){return /joy[- ]?con/i.test(String(pad?.id||''))}
function joyConSide(pad){const id=String(pad?.id||'');if(/joy[- ]?con.*(?:\(\s*l\s*\)|\bleft\b|\bl\b)|(?:\(\s*l\s*\)|\bleft\b).*joy[- ]?con/i.test(id))return'L';if(/joy[- ]?con.*(?:\(\s*r\s*\)|\bright\b|\br\b)|(?:\(\s*r\s*\)|\bright\b).*joy[- ]?con/i.test(id))return'R';return''}
function rawButton(pad,index){return gamepadButtonPressed(pad,index)}
function makeButtons(states={}){return Array.from({length:20},(_,i)=>{const pressed=!!states[i];return{pressed,touched:pressed,value:pressed?1:0}})}
function rotateJoyConStick(pad){const x=axisValue(pad,0),y=axisValue(pad,1),side=joyConSide(pad);if(side==='L')return{x:y,y:-x,available:true,source:'Joy-Con L sideways'};if(side==='R')return{x:-y,y:x,available:true,source:'Joy-Con R sideways'};return{x,y,available:true,source:'Joy-Con stick'}}
function joyConActionButtons(pad){return{
  0:rawButton(pad,0)||rawButton(pad,1),1:rawButton(pad,2)||rawButton(pad,3),
  2:rawButton(pad,4)||rawButton(pad,5),3:rawButton(pad,6)||rawButton(pad,7),
  9:rawButton(pad,8)||rawButton(pad,9)||rawButton(pad,10)||rawButton(pad,11)
}}
function makeSeparateJoyCon(pad){const stick=rotateJoyConStick(pad),states=joyConActionButtons(pad);return{
  id:`${pad.id||'Joy-Con'} — Separate Player`,index:`joy-${pad.index}`,mapping:'standard',connected:true,timestamp:pad.timestamp||performance.now(),
  axes:[stick.x,stick.y,0,0],buttons:makeButtons(states),_leftStick:stick,_rightStick:{x:0,y:0,available:false,source:'none'},_forcedDpad:{left:false,right:false,up:false,down:false},_physicalIndexes:[pad.index],_joyConSeparate:true,_joyConSide:joyConSide(pad)
}}
function physicalDpad(pad){const hat=hatDirections(pad);return{left:rawButton(pad,14)||hat.left,right:rawButton(pad,15)||hat.right,up:rawButton(pad,12)||hat.up,down:rawButton(pad,13)||hat.down}}
function makeCombinedJoyCons(left,right){
  const leftStick={x:axisValue(left,0),y:axisValue(left,1),available:(left.axes?.length||0)>=2,source:'Joy-Con L'};
  const rightStick={x:axisValue(right,0),y:axisValue(right,1),available:(right.axes?.length||0)>=2,source:'Joy-Con R'};
  const states=joyConActionButtons(right),start=rawButton(left,8)||rawButton(left,9)||rawButton(right,8)||rawButton(right,9)||rawButton(left,10)||rawButton(right,10);states[9]=states[9]||start;
  const d=physicalDpad(left);return{
    id:'Joy-Con Pair — Combined Controller',index:`joypair-${left.index}-${right.index}`,mapping:'standard',connected:true,timestamp:Math.max(left.timestamp||0,right.timestamp||0),
    axes:[leftStick.x,leftStick.y,rightStick.x,rightStick.y],buttons:makeButtons(states),_leftStick:leftStick,_rightStick:rightStick,_forcedDpad:d,_physicalIndexes:[left.index,right.index],_joyConPair:true
  }
}
function logicalGamepads(){
  const physical=connectedGamepads();if(!physical.length)return[];const used=new Set(),logical=[];
  for(let i=0;i<physical.length;i++){
    const pad=physical[i];if(used.has(pad))continue;
    if(!isJoyCon(pad)){logical.push(pad);used.add(pad);continue}
    if(controllerManager.joyConMode==='separate'){logical.push(makeSeparateJoyCon(pad));used.add(pad);continue}
    const side=joyConSide(pad),mate=physical.find(other=>other!==pad&&!used.has(other)&&isJoyCon(other)&&(!side||!joyConSide(other)||joyConSide(other)!==side));
    if(mate){const left=side==='L'?pad:joyConSide(mate)==='L'?mate:side==='R'?mate:pad,right=left===pad?mate:pad;logical.push(makeCombinedJoyCons(left,right));used.add(pad);used.add(mate)}
    else{logical.push(makeSeparateJoyCon(pad));used.add(pad)}
  }
  return logical;
}
function applyStickDeadZone(x,y){const magnitude=Math.hypot(x,y),dead=controllerManager.stickDeadZone;if(magnitude<=dead)return{x:0,y:0};const scaled=Math.min(1,(magnitude-dead)/(1-dead)),factor=scaled/(magnitude||1);return{x:clamp(x*factor,-1,1),y:clamp(y*factor,-1,1)}}
function chooseRightAxisPair(pad){
  const axes=pad?.axes||[],key=String(pad?.index??pad?.id??'pad');if(axes.length<4)return null;if(pad.mapping==='standard')return[2,3];
  const candidates=[[2,3],[2,5],[3,4],[4,5]].filter(([x,y])=>x<axes.length&&y<axes.length),saved=controllerManager.rightAxisPairs.get(key);
  if(saved&&saved[0]<axes.length&&saved[1]<axes.length)return saved;
  let best=candidates[0]||null,bestActivity=.28;for(const pair of candidates){const activity=Math.hypot(axisValue(pad,pair[0]),axisValue(pad,pair[1]));if(activity>bestActivity){best=pair;bestActivity=activity}}
  if(best&&bestActivity>.28)controllerManager.rightAxisPairs.set(key,best);return best;
}
function gamepadStick(pad,side='left'){
  if(!pad)return{x:0,y:0,available:false,source:'none'};const custom=side==='left'?pad._leftStick:pad._rightStick;if(custom){const value=applyStickDeadZone(custom.x||0,custom.y||0);return{...value,available:custom.available!==false,source:custom.source||side}}
  const axes=pad.axes||[];let pair=side==='left'?(axes.length>=2?[0,1]:null):chooseRightAxisPair(pad);if(!pair)return{x:0,y:0,available:false,source:'none'};const value=applyStickDeadZone(axisValue(pad,pair[0]),axisValue(pad,pair[1]));return{...value,available:true,source:`axes ${pair[0]}/${pair[1]}`}
}
function hatDirections(pad){
  if(pad?._forcedDpad)return pad._forcedDpad;const axes=pad?.axes||[];let left=false,right=false,up=false,down=false;
  // Some Nintendo/DirectInput mappings expose the D-pad as two hat axes.
  for(const [xi,yi] of [[6,7],[4,5]]){if(axes.length>yi){const hx=axisValue(pad,xi),hy=axisValue(pad,yi);if(Math.abs(hx)>.55||Math.abs(hy)>.55){left=hx<-.55;right=hx>.55;up=hy<-.55;down=hy>.55;break}}}
  // Other mappings expose the D-pad as a single POV-hat axis.
  if(!left&&!right&&!up&&!down){
    const states=[[-1,'up'],[-.7142857,'upRight'],[-.4285714,'right'],[-.1428571,'downRight'],[.1428571,'down'],[.4285714,'downLeft'],[.7142857,'left'],[1,'upLeft']];
    for(let i=4;i<axes.length;i++){const match=states.find(([value])=>Math.abs(axisValue(pad,i)-value)<.11);if(!match)continue;const name=match[1];left=name.toLowerCase().includes('left');right=name.toLowerCase().includes('right');up=name.toLowerCase().includes('up');down=name.toLowerCase().includes('down');break}
  }
  return{left,right,up,down};
}
function gamepadDirections(pad){
  const hat=hatDirections(pad),dpad={left:gamepadButtonPressed(pad,14)||hat.left,right:gamepadButtonPressed(pad,15)||hat.right,up:gamepadButtonPressed(pad,12)||hat.up,down:gamepadButtonPressed(pad,13)||hat.down},stick=gamepadStick(pad,'left'),usingDpad=dpad.left||dpad.right||dpad.up||dpad.down;
  const x=usingDpad?(dpad.left?-1:dpad.right?1:0):stick.x,y=usingDpad?(dpad.up?-1:dpad.down?1:0):stick.y,left=x<-.34,right=x>.34,up=y<-.34,down=y>.34;
  return{left,right,up,down,x,y,xAxis:usingDpad?'D-pad':stick.source,yAxis:usingDpad?'D-pad':stick.source};
}
function gamepadRightStick(pad){return gamepadStick(pad,'right')}
function playerGamepads(){return logicalGamepads().sort((a,b)=>{const sideRank=p=>p._joyConSide==='L'?0:p._joyConSide==='R'?1:2,sa=sideRank(a),sb=sideRank(b);if(sa!==sb)return sa-sb;const ai=Number(a._physicalIndexes?.[0]??a.index),bi=Number(b._physicalIndexes?.[0]??b.index);return(Number.isFinite(ai)?ai:99)-(Number.isFinite(bi)?bi:99)})}
function activeGamepads(){const pads=logicalGamepads();if(!pads.length)return[];const active=pads.find(p=>p.index===controllerManager.activePadIndex||p._physicalIndexes?.includes(controllerManager.activePadIndex));return active?[active,...pads.filter(p=>p!==active)]:pads}
function gamepadPermissionAllowed(){try{const policy=document.permissionsPolicy||document.featurePolicy;if(policy?.allowsFeature)return policy.allowsFeature('gamepad')}catch{}return null}
function controllerEnvironmentHelp(){
  if(!gamepadGetter())return'This browser does not expose the Gamepad API. Update the browser or use the on-screen touch controls.';
  if(gamepadPermissionAllowed()===false||controllerManager.framed)return'Controller access is blocked inside this embedded page. Open the arcade directly, then tap Enable Nintendo Controller.';
  if(controllerManager.isAppleMobile&&controllerManager.standalone)return'Tap Enable Nintendo Controller, then move a stick and press the D-pad or B/A buttons repeatedly. If the Home Screen web app still reports no controller, open the same address directly in Safari and test there.';
  if(controllerManager.isAppleMobile)return'Keep Safari visible, tap Enable Nintendo Controller, then move a stick and press the D-pad or B/A buttons repeatedly for several seconds.';
  return'Tap Enable Nintendo Controller, then move the L stick or press the D-pad or a face button.';
}
function updateControllerDebug(force=false){
  const now=performance.now();if(!force&&now-controllerManager.lastDebug<180)return;controllerManager.lastDebug=now;const physical=connectedGamepads(),pads=playerGamepads(),live=qs('#controllerLive'),debug=qs('#controllerDebug');if(!live||!debug)return;
  const help=qs('#controllerHelp');if(help)help.textContent=controllerEnvironmentHelp();const direct=qs('#openDirectControllerLink');if(direct){direct.href=location.href;direct.classList.toggle('hidden',!controllerManager.framed&&gamepadPermissionAllowed()!==false)}
  const mode=qs('#joyConModeSelect');if(mode&&mode.value!==controllerManager.joyConMode)mode.value=controllerManager.joyConMode;
  if(!physical.length){const remaining=Math.max(0,Math.ceil((controllerManager.activationUntil-performance.now())/1000));live.textContent=remaining?`Controller scan active for ${remaining} more second${remaining===1?'':'s'}. Move a stick and press the D-pad or B/A buttons repeatedly.`:'No web controller detected yet.';debug.textContent=`Gamepad API: ${gamepadGetter()?'available':'unavailable'}\nAPI path: ${typeof navigator.getGamepads==='function'?'standard':typeof navigator.webkitGetGamepads==='function'?'WebKit fallback':'none'}\nPermission: ${gamepadPermissionAllowed()===false?'blocked':gamepadPermissionAllowed()===true?'allowed':'not reported'}\nSafari/iPad: ${controllerManager.isAppleMobile?'yes':'no'}\nHome Screen app: ${controllerManager.standalone?'yes':'no'}\nEmbedded: ${controllerManager.framed?'yes':'no'}\nSecure page: ${window.isSecureContext?'yes':'no'}\nJoy-Con mode: ${controllerManager.joyConMode}`;return}
  const first=pads[0],left=gamepadStick(first,'left'),right=gamepadRightStick(first),d=gamepadDirections(first);controllerManager.lastDetectedId=first.id||'Controller';
  const dirs=[d.left&&'LEFT',d.right&&'RIGHT',d.up&&'UP',d.down&&'DOWN'].filter(Boolean).join(' ')||'centered';live.textContent=`Connected: ${first.id||'Controller'}. Movement: ${dirs}. L ${left.x.toFixed(2)},${left.y.toFixed(2)} • R ${right.x.toFixed(2)},${right.y.toFixed(2)}`;
  const logicalSummary=pads.map((p,n)=>{const q=gamepadDirections(p),l=gamepadStick(p,'left'),r=gamepadRightStick(p),buttons=(p.buttons||[]).map((b,i)=>gamepadButtonPressed(p,i)?i:null).filter(i=>i!==null);return`Player controller ${n+1}: ${p.id||'Unknown'}\nL stick ${l.source}: ${l.x.toFixed(2)}, ${l.y.toFixed(2)}\nR stick ${r.source}: ${r.x.toFixed(2)}, ${r.y.toFixed(2)}\nMovement L${+q.left} R${+q.right} U${+q.up} D${+q.down}\nPressed buttons: ${buttons.join(', ')||'none'}`}).join('\n\n');
  const physicalSummary=physical.map((p,n)=>`Physical ${Number.isInteger(p.index)?p.index:n}: ${p.id||'Unknown'}\nMapping: ${p.mapping||'non-standard'} • Buttons: ${p.buttons?.length||0} • Axes: ${p.axes?.length||0}\nRaw axes: ${(p.axes||[]).map((v,i)=>`${i}:${Number(v).toFixed(2)}`).join('  ')||'none'}`).join('\n\n');
  debug.textContent=`Joy-Con mode: ${controllerManager.joyConMode}\nPhysical devices: ${physical.length} • Player controllers: ${pads.length}\n\n${logicalSummary}\n\n--- Browser report ---\n${physicalSummary}`;
}
function updateControllerStatus(){const physical=connectedGamepads(),pads=playerGamepads();controllerMenuState.connected=!!physical.length;const label=physical.length?(physical.length!==pads.length?`🎮 ${physical.length} devices → ${pads.length} player controller${pads.length===1?'':'s'}`:`🎮 ${pads.length} controller${pads.length===1?'':'s'} ready`):'🎮 Enable Controller';controllerStatus(label,!!physical.length);updateControllerDebug()}
function finishControllerScan(found){if(controllerManager.activationTimer){clearInterval(controllerManager.activationTimer);controllerManager.activationTimer=null}controllerManager.activationUntil=0;const button=qs('#activateControllerBtn');if(button){button.disabled=false;button.textContent='Enable Nintendo Controller'}if(found){const pads=connectedGamepads();if(pads[0])controllerManager.activePadIndex=Number.isInteger(pads[0].index)?pads[0].index:0;updateControllerStatus();toast(`${pads[0]?.id||'Controller'} connected — L stick moves, R stick aims`)}else{updateControllerDebug(true);toast('Safari did not expose the controller; touch controls remain available')}}
function detectControllers(){
  // Must be called from a real tap/click so Safari can activate controller access.
  connectedGamepads();const pads=connectedGamepads();if(pads.length){finishControllerScan(true);return}if(!gamepadGetter()){updateControllerStatus();toast('Gamepad API unavailable; use touch controls');return}
  controllerManager.activationUntil=performance.now()+20000;const button=qs('#activateControllerBtn');if(button){button.disabled=true;button.textContent='Scanning… move a stick or press a button'}updateControllerDebug(true);if(controllerManager.activationTimer)clearInterval(controllerManager.activationTimer);
  controllerManager.activationTimer=setInterval(()=>{const fresh=connectedGamepads();updateControllerDebug(true);if(fresh.length)finishControllerScan(true);else if(performance.now()>=controllerManager.activationUntil)finishControllerScan(false)},100);
}
window.addEventListener('gamepadconnected',e=>{controllerManager.activePadIndex=e.gamepad?.index??controllerManager.activePadIndex;finishControllerScan(true)});
window.addEventListener('gamepaddisconnected',()=>{controllerManager.activePadIndex=null;updateControllerStatus();toast('Controller disconnected')});
qs('#controllerStatus')?.addEventListener('click',()=>{openDialog(controllerDialog);updateControllerDebug(true)});qs('#activateControllerBtn')?.addEventListener('click',detectControllers);
const joyConModeSelect=qs('#joyConModeSelect');if(joyConModeSelect){joyConModeSelect.value=controllerManager.joyConMode;joyConModeSelect.addEventListener('change',()=>{controllerManager.joyConMode=joyConModeSelect.value==='separate'?'separate':'combined';saveControllerPrefs();controllerMenuState.buttons.clear();controllerManager.rightAxisPairs.clear();updateControllerStatus();toast(controllerManager.joyConMode==='separate'?'Joy-Cons will control separate players in multiplayer':'Left and Right Joy-Cons will work together as one controller')})}
for(const eventName of['pointerdown','touchstart','click'])window.addEventListener(eventName,()=>{connectedGamepads();updateControllerStatus()},{passive:true});
for(const eventName of['pageshow','focus'])window.addEventListener(eventName,updateControllerStatus);document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateControllerStatus()});
window.addEventListener('keydown',event=>{
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter','Space','Escape'].includes(event.code)){controllerManager.keyboardFallback=true;updateControllerStatus()}
  if(session?.running&&views.game.classList.contains('active'))return;
  if(event.code.startsWith('Arrow')){event.preventDefault();focusMenuItem(event.code.replace('Arrow','').toLowerCase())}
  else if(event.code==='Enter'||event.code==='Space'){const el=document.activeElement;if(el&&el!==document.body){event.preventDefault();el.click?.()}}
  else if(event.code==='Escape'){event.preventDefault();closeTopControllerLayer()}
});
function menuFocusable(){
  const open=[...document.querySelectorAll('dialog[open]')].pop(),scope=open||Object.values(views).find(v=>v.classList.contains('active'))||document.body;
  const visible=selector=>[...scope.querySelectorAll(selector)].filter(el=>{const r=el.getBoundingClientRect(),style=getComputedStyle(el);return style.display!=='none'&&style.visibility!=='hidden'&&r.width>0&&r.height>0});
  const all=visible('button:not([disabled]):not(.favorite),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"]):not(.favorite),.game-card');if(!open&&views.launcher.classList.contains('active')){const cards=visible('.game-card');return[...cards,...all.filter(el=>!cards.includes(el))]}return all;
}
function ensureControllerFocus(){const items=menuFocusable();if(!items.length)return null;if(items.includes(document.activeElement))return document.activeElement;const preferred=views.launcher.classList.contains('active')&&!document.querySelector('dialog[open]')?items.find(el=>el.classList.contains('game-card')):items[0];(preferred||items[0]).focus?.();return preferred||items[0]}
function focusMenuItem(direction){const items=menuFocusable();if(!items.length)return;const active=items.includes(document.activeElement)?document.activeElement:ensureControllerFocus();if(!active)return;if(active.tagName==='SELECT'&&(direction==='left'||direction==='right')){const delta=direction==='right'?1:-1,next=clamp(active.selectedIndex+delta,0,active.options.length-1);if(next!==active.selectedIndex){active.selectedIndex=next;active.dispatchEvent(new Event('change',{bubbles:true}))}return}const a=active.getBoundingClientRect(),ax=a.left+a.width/2,ay=a.top+a.height/2;let best=null,bestScore=Infinity;for(const el of items){if(el===active)continue;const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,dx=x-ax,dy=y-ay,valid=direction==='left'?dx<-6:direction==='right'?dx>6:direction==='up'?dy<-6:dy>6;if(!valid)continue;const primary=direction==='left'||direction==='right'?Math.abs(dx):Math.abs(dy),secondary=direction==='left'||direction==='right'?Math.abs(dy):Math.abs(dx),score=primary+secondary*2.2;if(score<bestScore){best=el;bestScore=score}}(best||items[(items.indexOf(active)+(direction==='left'||direction==='up'?-1:1)+items.length)%items.length]).focus?.();document.activeElement?.scrollIntoView?.({block:'nearest',inline:'nearest'})}
function closeTopControllerLayer(){const open=[...document.querySelectorAll('dialog[open]')].pop();if(open){open.close();return}if(views.game.classList.contains('active')){exitGame();return}document.activeElement?.blur?.()}
function menuButtonEdge(pad,index){const key=`${pad.index}:${index}`,pressed=gamepadButtonPressed(pad,index),was=controllerMenuState.buttons.get(key)||false;controllerMenuState.buttons.set(key,pressed);return pressed&&!was}
function activateFocusedControllerItem(){ensureControllerFocus()?.click?.()}
function pollControllerMenus(t){
  const pads=activeGamepads();updateControllerStatus();if((!session?.running||!views.game.classList.contains('active'))&&pads.length){const pad=pads[0],dir=gamepadDirections(pad),direction=dir.left?'left':dir.right?'right':dir.up?'up':dir.down?'down':'';if(direction&&(direction!==controllerMenuState.direction||t>=controllerMenuState.nextMoveAt)){focusMenuItem(direction);controllerMenuState.nextMoveAt=t+(direction===controllerMenuState.direction?150:320)}controllerMenuState.direction=direction;const select=menuButtonEdge(pad,0),back=menuButtonEdge(pad,1),start=menuButtonEdge(pad,9),open=document.querySelector('dialog[open]');if(select)activateFocusedControllerItem();if(back){if(open||views.game.classList.contains('active'))closeTopControllerLayer();else activateFocusedControllerItem()}if(start&&views.game.classList.contains('active')&&session)session.togglePause()}else{controllerMenuState.direction='';for(const pad of pads)for(const index of[0,1,9])controllerMenuState.buttons.set(`${pad.index}:${index}`,gamepadButtonPressed(pad,index))}requestAnimationFrame(pollControllerMenus)
}
updateControllerStatus();requestAnimationFrame(pollControllerMenus);
function installButtons(){return[qs('#installBtn'),qs('#launcherInstallBtn')].filter(Boolean)}
function isInstalledApp(){return window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true}
function isMobileBrowser(){return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
function isAppleMobileBrowser(){return /iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
function updateInstallButtons(){const installed=isInstalledApp(),show=!installed&&(isMobileBrowser()||!!deferredInstall);for(const button of installButtons()){button.classList.toggle('hidden',!show);button.textContent=deferredInstall?'Install Arcade App':isAppleMobileBrowser()?'Open Install Menu':'Install Arcade App'}}
function showManualInstallHelp(){const body=qs('#installHelpBody');if(!body||!installDialog)return;if(isAppleMobileBrowser())body.innerHTML='<p>Apple requires installation through the browser Share menu. Tap Share, then choose <b>Add to Home Screen</b>.</p>';else body.innerHTML='<p>Open the browser menu and choose <b>Install app</b> or <b>Add to Home screen</b>.</p>';openDialog(installDialog)}
async function requestArcadeInstall(){
  if(isInstalledApp()){toast('The arcade is already installed');return}
  if(deferredInstall){deferredInstall.prompt();const choice=await deferredInstall.userChoice;deferredInstall=null;updateInstallButtons();if(choice?.outcome==='accepted')toast('Arcade installation started');return}
  if(isAppleMobileBrowser()&&navigator.share){try{await navigator.share({title:"A's Arcade Games",text:'Add A’s Arcade Games to your Home Screen from this menu.',url:location.href});toast('Choose Add to Home Screen in the Share menu');return}catch(error){if(error?.name==='AbortError')return}}
  showManualInstallHelp();
}
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstall=event;updateInstallButtons()});window.addEventListener('appinstalled',()=>{deferredInstall=null;updateInstallButtons();toast('Arcade installed')});for(const button of installButtons())button.addEventListener('click',requestArcadeInstall);window.addEventListener('pageshow',updateInstallButtons);updateInstallButtons();
function fullscreenElement(){return document.fullscreenElement||document.webkitFullscreenElement||null}
async function toggleFullscreen(){
  try{if(fullscreenElement()){const exit=document.exitFullscreen||document.webkitExitFullscreen;if(exit)await exit.call(document);return}const target=document.documentElement,request=target.requestFullscreen||target.webkitRequestFullscreen;if(request){await request.call(target,{navigationUI:'hide'});return}if(isAppleMobileBrowser()&&!isInstalledApp()){toast('For full-screen play, install the arcade from the Share menu');requestArcadeInstall();return}toast('Full screen is not supported by this browser')}catch(error){console.warn(error);toast('Full screen could not be opened')}
}
function updateFullscreenButtons(){const label=fullscreenElement()?'Exit Full Screen':'Full Screen';for(const id of['#fullscreenBtn','#gameFullscreenBtn']){const b=qs(id);if(b)b.textContent=label}}
qs('#fullscreenBtn')?.addEventListener('click',toggleFullscreen);qs('#gameFullscreenBtn')?.addEventListener('click',toggleFullscreen);document.addEventListener('fullscreenchange',updateFullscreenButtons);document.addEventListener('webkitfullscreenchange',updateFullscreenButtons);updateFullscreenButtons();
function openArcadeWebsite(){const a=account();if(a&&!a.parental.external)return toast('Website links are disabled by Parental Controls');window.open('https://sites.google.com/view/agsarcadegames/home','_blank','noopener,noreferrer')}
qs('#websiteBtn')?.addEventListener('click',openArcadeWebsite);qs('#authWebsiteBtn')?.addEventListener('click',openArcadeWebsite);

async function login(){const id=qs('#accountSelect').value;const a=db.accounts.find(x=>x.id===id);if(!a)return toast('Create an account first');if(!a.enabled)return toast('This account is disabled');const hash=await hashText(qs('#loginPin').value);if(hash!==a.pinHash)return toast('Incorrect PIN');activeAccountId=id;db.active=id;saveDB(db);todayDaily(a);refreshHeader();renderLauncher();showView('launcher')}
function openCreateAccount(){
  qs('#newUsername').value='';qs('#newDisplayName').value='';qs('#newPin').value='';
  const controls=qs('#newAvatarControls'),preview=qs('#newAvatarPreview');
  controls.innerHTML=avatarControlMarkup('new-avatar',defaultAvatarConfig());
  const redraw=()=>preview.innerHTML=avatarSVG(readAvatarControls(controls),164);
  controls.querySelectorAll('select').forEach(el=>el.addEventListener('change',redraw));
  qs('#randomizeNewAvatar').onclick=()=>{controls.innerHTML=avatarControlMarkup('new-avatar',randomAvatarConfig());controls.querySelectorAll('select').forEach(el=>el.addEventListener('change',redraw));redraw()};
  redraw();openDialog(accountDialog)
}
qs('#saveAccountBtn').addEventListener('click',async()=>{const username=qs('#newUsername').value.trim();const pin=qs('#newPin').value.trim();if(username.length<2)return toast('Username needs at least 2 characters');if(pin.length<4)return toast('PIN needs at least 4 characters');if(db.accounts.some(a=>a.username.toLowerCase()===username.toLowerCase()))return toast('Username already exists');const avatar=readAvatarControls(qs('#newAvatarControls'));const a=newAccount(username,qs('#newDisplayName').value.trim(),await hashText(pin),qs('#newAccountType').value,avatar);db.accounts.push(a);saveDB(db);accountDialog.close();refreshAuth();toast('Account created')});

function renderLauncher(){const cats=['All',...new Set(ARCADE_GAMES.map(g=>g.category))];const sel=qs('#categorySelect');if(!sel.options.length)cats.forEach(c=>sel.add(new Option(c,c)));renderGames()}
function renderGames(){const a=account();if(!a)return;const q=qs('#searchInput').value.trim().toLowerCase(),cat=qs('#categorySelect').value||'All',fav=qs('#favoritesOnly').checked;let games=ARCADE_GAMES.filter(g=>(!q||(g.name+' '+g.description).toLowerCase().includes(q))&&(cat==='All'||g.category===cat)&&(!fav||a.favorites.includes(g.id)));qs('#gameCount').textContent=`${games.length} of ${ARCADE_GAMES.length} games`;const grid=qs('#gameGrid');grid.innerHTML='';for(const g of games){const card=document.createElement('article');card.className='game-card';card.tabIndex=0;card.dataset.gameId=g.id;const p=a.progress[g.id]||{};card.innerHTML=`<button class="favorite" aria-label="Favorite">${a.favorites.includes(g.id)?'★':'☆'}</button><div class="category-icon">${CATEGORY_ICONS[g.category]||'🎲'}</div><h3>${escapeHtml(g.name)} ${g.new?'<span class="new-badge">NEW</span>':''}${supportsMultipleModes(g)?'<span class="mode-badge">1P / 2P</span>':''}</h3><p>${escapeHtml(g.description)}</p><div class="meta"><span>${escapeHtml(g.category)}</span><span>${g.campaign&&g.levels>1?(p.level?`Level ${p.level}`:'New'):(p.wins?`${p.wins} win${p.wins===1?'':'s'}`:'New')}</span></div>`;card.querySelector('.favorite').onclick=e=>{e.stopPropagation();toggleFavorite(g.id)};card.onclick=()=>showDetails(g);grid.append(card)}updateResumeButton()}
function toggleFavorite(id){updateAccount(a=>{const i=a.favorites.indexOf(id);i>=0?a.favorites.splice(i,1):a.favorites.push(id)});renderGames()}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function objective(g){return g.objective||g.description}
function howTo(g){return g.howTo||`Use ${g.controls}. Follow the game-specific instructions and complete the displayed level target.`}
function supportsMultipleModes(g){return (Array.isArray(g.modes)&&g.modes.includes('1P')&&g.modes.includes('2P'))||MULTIMODE_ENGINES.has(g.engine)}
function showDetails(g){
  currentGame=g;const a=account(),p=a.progress[g.id]||{level:1,highScore:0,wins:0},multi=supportsMultipleModes(g),campaign=!!g.campaign&&g.levels>1;selectedGameMode=multi?'1P':(g.players===2?'2P':'1P');
  const blocked=multi&&!a.parental.multiplayer;
  const modeMarkup=multi?`<fieldset class="mode-picker"><legend>Choose players</legend><div class="mode-choice-row"><button type="button" class="mode-choice selected" data-game-mode="1P" aria-pressed="true"><b>1 Player</b><span>Play against the computer</span></button><button type="button" class="mode-choice" data-game-mode="2P" aria-pressed="false" ${blocked?'disabled':''}><b>2 Players</b><span>${blocked?'Blocked by Parental Controls':'Play together on this device'}</span></button></div><p id="selectedModeText" class="selected-mode-text">Selected: 1 Player</p></fieldset>`:'';
  const drawingMode=g.id==='drawing-studio';
  const format=campaign?`${g.levels} levels`:(drawingMode||g.id==='music-sequencer'?'Open-ended activity':'Single match');
  const progress=campaign?`Resume level ${Math.min(g.levels,p.level||1)} • High score ${p.highScore||0}`:drawingMode?'Creative mode — no levels, timer, or win condition':`Wins ${p.wins||0} • High score ${p.highScore||0}`;
  const rewards=campaign?'3 AG Coins for each new level, 5 bonus coins at levels 10, 20, and 30, and a 100-coin bonus at level 40.':drawingMode?'Drawing Studio has no levels or win rewards—create for as long as you like.':'3 AG Coins per win and a one-time 5-coin first-win bonus.';
  qs('#detailsContent').innerHTML=`<div style="font-size:3rem">${CATEGORY_ICONS[g.category]||'🎲'}</div><h2>${escapeHtml(g.name)}</h2><p><b>${escapeHtml(g.category)}</b> • ${format} • ${multi?'Single player or two players':g.players===2?'Two players':'One player'}</p>${modeMarkup}<div class="panel-card"><h3>Objective</h3><p>${escapeHtml(objective(g))}</p><h3>How to play</h3><p>${escapeHtml(howTo(g))}</p><h3>Controls</h3><p>${escapeHtml(g.controls)}. Compatible games accept direct taps and drags on the game area, like Dots and Boxes. Keyboard and gamepad controls still work on computers. The D-pad or L stick moves; the R stick aims or moves the virtual cursor in compatible games.</p><h3>Progress</h3><p>${progress}</p><p><b>Rewards:</b> ${rewards}</p></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button id="startNew" class="primary">${campaign?'Start New Game':'Start'}</button>${campaign?`<button id="resumeGame">Resume Level ${Math.min(g.levels,p.level||1)}</button>`:''}<button id="detailFavorite">${a.favorites.includes(g.id)?'Remove Favorite':'Add Favorite'}</button></div>`;
  openDialog(detailsDialog);
  if(multi){const buttons=[...qs('#detailsContent').querySelectorAll('[data-game-mode]')];const choose=mode=>{selectedGameMode=mode;buttons.forEach(btn=>{const active=btn.dataset.gameMode===mode;btn.classList.toggle('selected',active);btn.setAttribute('aria-pressed',String(active))});const t=qs('#selectedModeText');if(t)t.textContent=`Selected: ${mode==='2P'?'2 Players':'1 Player'}`};buttons.forEach(btn=>btn.onclick=()=>{if(!btn.disabled)choose(btn.dataset.gameMode)});choose('1P')}
  qs('#startNew').onclick=()=>{const mode=selectedGameMode;detailsDialog.close();startGame(g,1,mode)};
  if(campaign)qs('#resumeGame').onclick=()=>{const mode=selectedGameMode;detailsDialog.close();startGame(g,Math.min(g.levels,p.level||1),mode)};
  qs('#detailFavorite').onclick=()=>{toggleFavorite(g.id);detailsDialog.close()}
}

function openPanel(type){const a=account();if(!a&&type!=='parentPanel')return;const out=qs('#panelContent');if(type==='dailyPanel'){const d=todayDaily(a);out.innerHTML=`<h2>Daily Challenges</h2><div class="panel-grid"><div class="panel-card"><h3>Play 3 games</h3><p>${d.plays}/3</p></div><div class="panel-card"><h3>Complete 2 levels</h3><p>${d.levels}/2</p></div><div class="panel-card"><h3>Reward</h3><p>8 AG Coins + 60 XP</p></div></div><button id="claimDaily" class="primary">Claim Reward</button>`;openDialog(panelDialog);qs('#claimDaily').onclick=()=>claimDaily(a);return}
  if(type==='storePanel'){renderStore(out,a);openDialog(panelDialog);return}
  if(type==='achievementPanel'){renderAchievements(out,a);openDialog(panelDialog);return}
  if(type==='leaderboardPanel'){renderLeaderboards(out);openDialog(panelDialog);return}
  if(type==='settingsPanel'){renderSettings(out,a);openDialog(panelDialog);return}
  if(type==='parentPanel'){openParentalControls(false);return}}
function renderStore(out,a){
  if(!a.parental.spending){out.innerHTML='<h2>AG Store</h2><p>Coin spending is disabled by Parental Controls.</p>';return}
  const section=(title,key,items)=>`<h3>${title}</h3><div class="panel-grid">${items.map(it=>{const owned=a.unlocks[key].includes(it.name);const visual=key==='avatars'?`<div class="avatar-mini">${avatarSVG(avatarPreset(it.name).config,46)}</div>`:'';return`<div class="panel-card store-item ${owned?'':'locked'}">${visual}<b>${escapeHtml(it.label||it.name)}</b><p>${owned?'Owned':`${it.cost} AG Coins`}</p><button data-store="${key}" data-item="${escapeHtml(it.name)}" data-cost="${it.cost}">${owned?'Apply':'Unlock'}</button></div>`}).join('')}</div>`;
  out.innerHTML=`<h2>AG Store</h2><p>Balance: 🪙 ${a.coins}. Avatar presets now apply a complete, polished character design.</p>${section('Themes','themes',STORE.themes)}${section('Wallpapers','wallpapers',STORE.wallpapers)}${section('Banners','banners',STORE.banners)}${section('Avatar Presets','avatars',STORE.avatars)}`;
  out.querySelectorAll('[data-store]').forEach(b=>b.onclick=()=>buyStore(b.dataset.store,b.dataset.item,+b.dataset.cost))
}
function buyStore(key,item,cost){updateAccount(a=>{const owned=a.unlocks[key].includes(item);if(!owned){if(a.coins<cost){toast('Not enough AG Coins');return}a.coins-=cost;a.unlocks[key].push(item)}if(key==='themes')a.settings.theme=item;if(key==='wallpapers')a.settings.wallpaper=item;if(key==='banners')a.banner=item;if(key==='avatars')a.avatar=cloneAvatar(avatarPreset(item).config);toast(`${key==='avatars'?avatarPreset(item).name:item} applied`) });renderStore(qs('#panelContent'),account());renderGames()}
function renderAchievements(out,a){refreshAchievements(a);out.innerHTML=`<h2>Trophy Room</h2><div class="panel-grid">${ACHIEVEMENTS.map(([n,d])=>`<div class="panel-card"><h3>${a.achievements.includes(n)?'🏆':'🔒'} ${n}</h3><p>${d}</p></div>`).join('')}</div>`}
function renderLeaderboards(out){const rows=[...db.accounts].sort((a,b)=>b.xp-a.xp);out.innerHTML=`<h2>Local Family Leaderboards</h2><div class="panel-grid">${rows.map((a,i)=>`<div class="panel-card"><div class="profile-card-heading"><span class="avatar-mini">${avatarSVG(a.avatar,46)}</span><h3>#${i+1} ${escapeHtml(a.displayName)}</h3></div><p>Level ${levelFromXp(a.xp)} • ${a.xp} XP • ${a.coins} coins</p><p>${a.stats.levels} levels • ${a.stats.completed} games completed</p></div>`).join('')}</div>`}
function renderSettings(out,a){
  const option=(value,label,current)=>`<option value="${value}" ${value===current?'selected':''}>${label}</option>`,ct=a.settings.customTheme||{};
  out.innerHTML=`<h2>Customize & Accessibility</h2><p class="update-notice">Create a custom theme, choose expanded avatar parts, and adjust accessibility.</p><div class="avatar-studio-layout"><div><div id="settingsAvatarPreview" class="avatar-preview-large">${avatarSVG(a.avatar,164)}</div><div class="avatar-actions"><button id="randomizeAvatar">Surprise Me</button></div></div><div id="settingsAvatarControls" class="avatar-control-grid">${avatarControlMarkup('settings-avatar',a.avatar)}</div></div><h3>Quick Avatar Presets</h3><div class="avatar-preset-grid">${a.unlocks.avatars.map(id=>{const p=avatarPreset(id);return`<button class="avatar-preset" data-avatar-preset="${id}">${avatarSVG(p.config,76)}<span>${escapeHtml(p.name)}</span></button>`}).join('')}</div><div class="settings-grid"><label>Theme<select id="themeSetting">${a.unlocks.themes.map(x=>`<option ${x===a.settings.theme?'selected':''}>${x}</option>`).join('')}</select></label><label>Wallpaper<select id="wallpaperSetting">${a.unlocks.wallpapers.map(x=>`<option ${x===a.settings.wallpaper?'selected':''}>${x}</option>`).join('')}</select></label><label>Banner<select id="bannerSetting">${a.unlocks.banners.map(x=>`<option ${x===a.banner?'selected':''}>${x}</option>`).join('')}</select></label><label>Touch control size<select id="controlSizeSetting">${option('normal','Normal',a.settings.controlSize)}${option('large','Large',a.settings.controlSize)}${option('xlarge','Extra Large',a.settings.controlSize)}</select></label><label>Game pace<select id="gamePaceSetting">${option('very-slow','Slower',a.settings.gamePace)}${option('relaxed','Relaxed',a.settings.gamePace)}${option('standard','Balanced by game',a.settings.gamePace)}${option('challenge','Faster',a.settings.gamePace)}</select></label><label>Launcher text size<select id="textSizeSetting">${option('normal','Normal',a.settings.textSize)}${option('large','Large',a.settings.textSize)}</select></label><label>Game-card size<select id="cardSizeSetting">${option('compact','Compact',a.settings.cardSize)}${option('normal','Normal',a.settings.cardSize)}${option('large','Large',a.settings.cardSize)}</select></label></div><h3>Custom Theme Designer</h3><p>Select the <b>custom</b> theme above, then choose your colors.</p><div class="custom-theme-grid">${[['bg','Background'],['panel','Panels'],['card','Game cards'],['accent','Primary accent'],['accent2','Second accent'],['text','Text']].map(([k,l])=>`<label>${l}<input id="custom-${k}" type="color" value="${ct[k]||'#ffffff'}"></label>`).join('')}</div><label class="check"><input id="contrastSetting" type="checkbox" ${a.settings.highContrast?'checked':''}> High contrast</label><label class="check"><input id="motionSetting" type="checkbox" ${a.settings.reducedMotion?'checked':''}> Reduced motion</label><button id="saveSettings" class="primary">Save Changes</button>`;
  const controls=qs('#settingsAvatarControls'),preview=qs('#settingsAvatarPreview');const redraw=()=>{const next=readAvatarControls(controls);preview.innerHTML=avatarSVG(next,164);updateAccount(x=>{x.avatar=next})};const wire=()=>controls.querySelectorAll('select').forEach(el=>el.addEventListener('change',redraw));wire();qs('#randomizeAvatar').onclick=()=>{controls.innerHTML=avatarControlMarkup('settings-avatar',randomAvatarConfig());wire();redraw()};out.querySelectorAll('[data-avatar-preset]').forEach(btn=>btn.onclick=()=>{controls.innerHTML=avatarControlMarkup('settings-avatar',avatarPreset(btn.dataset.avatarPreset).config);wire();redraw()});
  qs('#saveSettings').onclick=()=>{updateAccount(x=>{x.settings.theme=qs('#themeSetting').value;x.settings.wallpaper=qs('#wallpaperSetting').value;x.banner=qs('#bannerSetting').value;x.avatar=readAvatarControls(controls);x.settings.highContrast=qs('#contrastSetting').checked;x.settings.reducedMotion=qs('#motionSetting').checked;x.settings.controlSize=qs('#controlSizeSetting').value;x.settings.textSize=qs('#textSizeSetting').value;x.settings.cardSize=qs('#cardSizeSetting').value;x.settings.gamePace=qs('#gamePaceSetting').value;x.settings.customTheme={bg:qs('#custom-bg').value,panel:qs('#custom-panel').value,card:qs('#custom-card').value,accent:qs('#custom-accent').value,accent2:qs('#custom-accent2').value,text:qs('#custom-text').value};if(x.settings.theme==='custom')x.settings.customThemeSaved=true});panelDialog.close();renderGames();toast('Customization and accessibility settings saved')}
}

async function openParentalControls(fromAuth){const pin=prompt(db.adminHash?'Enter the Parental Controls administrator PIN':'Create a Parental Controls administrator PIN (4+ characters)');if(pin===null)return;if(pin.length<4)return toast('Administrator PIN needs at least 4 characters');const h=await hashText(pin);if(!db.adminHash){db.adminHash=h;saveDB(db);toast('Administrator PIN created')}else if(h!==db.adminHash)return toast('Incorrect administrator PIN');renderParentPanel(qs('#panelContent'));openDialog(panelDialog)}
function renderParentPanel(out){out.innerHTML=`<h2>Parental Controls</h2><p>Manage accounts without knowing the player's PIN. Existing PINs cannot be displayed, but they can be reset.</p><div class="panel-grid">${db.accounts.map(a=>`<div class="panel-card" data-account="${a.id}"><div class="profile-card-heading"><span class="avatar-mini">${avatarSVG(a.avatar,46)}</span><h3>${escapeHtml(a.displayName)}</h3></div><p>${a.type} • ${a.enabled?'Enabled':'Disabled'}</p><label>Daily minutes<input class="limit" type="number" min="0" value="${a.parental.minutes}"></label><label class="check"><input class="multi" type="checkbox" ${a.parental.multiplayer?'checked':''}> Multiplayer allowed</label><label class="check"><input class="spend" type="checkbox" ${a.parental.spending?'checked':''}> AG Coin spending</label><label class="check"><input class="external" type="checkbox" ${a.parental.external?'checked':''}> Website links allowed</label><button class="save-parent">Save</button><button class="reset-pin">Reset Player PIN</button><button class="toggle-account">${a.enabled?'Disable':'Enable'} Account</button></div>`).join('')}</div>`;out.querySelectorAll('[data-account]').forEach(card=>{const a=db.accounts.find(x=>x.id===card.dataset.account);card.querySelector('.save-parent').onclick=()=>{a.parental.minutes=Math.max(0,+card.querySelector('.limit').value||0);a.parental.multiplayer=card.querySelector('.multi').checked;a.parental.spending=card.querySelector('.spend').checked;a.parental.external=card.querySelector('.external').checked;saveDB(db);toast('Parental controls saved')};card.querySelector('.toggle-account').onclick=()=>{a.enabled=!a.enabled;saveDB(db);renderParentPanel(out);refreshAuth()};card.querySelector('.reset-pin').onclick=async()=>{const p=prompt(`Enter a new PIN for ${a.displayName}`);if(p&&p.length>=4){a.pinHash=await hashText(p);saveDB(db);toast('Player PIN reset')}}})}

function isFinePointer(){return (navigator.maxTouchPoints||0)===0&&innerWidth>900&&matchMedia('(hover:hover) and (pointer:fine)').matches}
function fitGameWindow(){
  const view=qs('#gameView'),wrap=qs('.canvas-wrap'),header=qs('.game-header'),dock=qs('#touchControls');
  if(!view?.classList.contains('active')||!wrap||!header||!dock)return;
  const viewportHeight=Math.max(320,Math.floor(window.visualViewport?.height||window.innerHeight||document.documentElement.clientHeight||720));
  view.style.height=`${viewportHeight}px`;
  const dockVisible=getComputedStyle(dock).display!=='none';
  const dockHeight=dockVisible?Math.ceil(dock.getBoundingClientRect().height):0;
  const headerHeight=Math.ceil(header.getBoundingClientRect().height);
  const availableHeight=Math.max(72,viewportHeight-headerHeight-dockHeight-12);
  const availableWidth=Math.max(120,Math.min(1100,view.clientWidth-12));
  const scale=Math.max(.08,Math.min(availableWidth/W,availableHeight/H));
  wrap.style.width=`${Math.floor(W*scale)}px`;
  wrap.style.height=`${Math.floor(H*scale)}px`;
}
function scheduleGameWindowFit(){requestAnimationFrame(()=>{fitGameWindow();requestAnimationFrame(fitGameWindow)})}
window.addEventListener('resize',scheduleGameWindowFit,{passive:true});
window.addEventListener('orientationchange',scheduleGameWindowFit,{passive:true});
window.visualViewport?.addEventListener('resize',scheduleGameWindowFit,{passive:true});
document.addEventListener('fullscreenchange',scheduleGameWindowFit);
function toggleTouchControls(forceVisible){
  const dock=qs('#touchControls'),view=qs('#gameView');
  const currentlyHidden=dock.classList.contains('desktop-auto-hide')||dock.classList.contains('controls-hidden');
  const shouldShow=typeof forceVisible==='boolean'?forceVisible:currentlyHidden;
  dock.classList.remove('desktop-auto-hide');view.classList.remove('desktop-auto-hide');
  dock.classList.toggle('controls-hidden',!shouldShow);view.classList.toggle('controls-hidden',!shouldShow);
  qs('#controlsToggle').textContent=shouldShow?'Hide Touch Controls':'Show Touch Controls';
  scheduleGameWindowFit();
}
function setTouchButton(selector,key,label,aria){const b=qs(selector);if(!b)return;b.dataset.key=key;if(label!==undefined)b.textContent=label;if(aria)b.setAttribute('aria-label',aria)}
function configureTouchPlayer(prefix,keys,labels){
  setTouchButton(`.${prefix}-controls [aria-label$="up"]`,keys.up,labels.up,`${prefix==='p1'?'Player 1':'Player 2'} up`);
  setTouchButton(`.${prefix}-controls [aria-label$="left"]`,keys.left,labels.left,`${prefix==='p1'?'Player 1':'Player 2'} left`);
  setTouchButton(`.${prefix}-controls [aria-label$="down"]`,keys.down,labels.down,`${prefix==='p1'?'Player 1':'Player 2'} down`);
  setTouchButton(`.${prefix}-controls [aria-label$="right"]`,keys.right,labels.right,`${prefix==='p1'?'Player 1':'Player 2'} right`);
  const actions=qsa(`.${prefix}-controls .mini-actions button`);if(actions[0])actions[0].dataset.key=keys.a;if(actions[1])actions[1].dataset.key=keys.b;
}
function configureControlDock(g){
  releaseAllTouchControls();const dock=qs('#touchControls'),view=qs('#gameView'),mode=session?.mode||selectedGameMode;
  dock.className='touch-controls';view.classList.remove('desktop-auto-hide','controls-hidden');
  const arrows={up:'ArrowUp',left:'ArrowLeft',down:'ArrowDown',right:'ArrowRight',a:'Space',b:'Enter'},wasd={up:'KeyW',left:'KeyA',down:'KeyS',right:'KeyD',a:'KeyF',b:'KeyG'};
  const arrowLabels={up:'▲',left:'◀',down:'▼',right:'▶'},wasdLabels={up:'W',left:'A',down:'S',right:'D'};
  if(mode!=='2P'){dock.classList.add('single-player');configureTouchPlayer('p1',arrows,arrowLabels)}else{
    dock.classList.add('multiplayer');
    // Pong is the one sports engine whose left paddle uses W/S and right paddle uses arrows.
    if(g.engine==='pong'){configureTouchPlayer('p1',wasd,wasdLabels);configureTouchPlayer('p2',arrows,arrowLabels)}
    else{configureTouchPlayer('p1',arrows,arrowLabels);configureTouchPlayer('p2',wasd,wasdLabels)}
  }
  const hint=qs('.touch-hint');if(hint)hint.textContent=mode==='2P'?'Two-player touch enabled: both players can press and hold controls at the same time.':'Touch, keyboard, and supported gamepads work together.';
  if(POINTER_GAME_ENGINES.has(g.engine)||typeof session?.engine?.pointer==='function')dock.classList.add('pointer-game');
  // Version 11.6 keeps the control dock visible directly beneath the game on every device.
  // Players can still hide it manually with the header button when they want a larger canvas.
  dock.classList.remove('desktop-auto-hide','controls-hidden');view.classList.remove('desktop-auto-hide','controls-hidden');qs('#controlsToggle').textContent='Hide Touch Controls';
  scheduleGameWindowFit();
}
function checkpointFor(a=account()){return a?.resumeSession||null}
function saveSessionCheckpoint(reason='launcher'){
  if(!session||session.completed||!account())return;const a=account();a.resumeSession={gameId:session.game.id,level:session.level,mode:session.mode,elapsed:Math.round(session.elapsed),savedAt:Date.now(),reason};saveDB(db);updateResumeButton();
}
function clearSessionCheckpoint(gameId=null){const a=account();if(!a?.resumeSession)return;if(!gameId||a.resumeSession.gameId===gameId){a.resumeSession=null;saveDB(db);updateResumeButton()}}
function updateResumeButton(){const b=qs('#resumeSavedBtn'),a=account();if(!b)return;const cp=a?.resumeSession,g=cp&&ARCADE_GAMES.find(x=>x.id===cp.gameId);b.classList.toggle('hidden',!g);if(g){const campaign=!!g.campaign&&g.levels>1,suffix=g.id==='drawing-studio'?' — Creative Mode':campaign?` — Level ${cp.level}`:'';b.textContent=`▶ Resume ${g.name}${suffix}`}}
function resumeSavedGame(){
  const a=account(),cp=a?.resumeSession;if(!cp)return;const g=ARCADE_GAMES.find(x=>x.id===cp.gameId);if(!g){clearSessionCheckpoint();return}
  if(session&&!session.completed&&session.game.id===g.id&&session.level===cp.level){showView('game');currentGame=g;selectedGameMode=session.mode;configureControlDock(g);session.resumeFromHome();return}
  startGame(g,cp.level,cp.mode,{resume:true});
}
qs('#resumeSavedBtn')?.addEventListener('click',resumeSavedGame);
function startGame(g,level,mode=null,options={}){
  const a=account();if(!a)return;const campaign=!!g.campaign&&g.levels>1;level=campaign?clamp(Number(level)||1,1,g.levels):1;mode=mode||(g.players===2?'2P':'1P');if(mode==='2P'&&!a.parental.multiplayer)return toast('Multiplayer is blocked by Parental Controls');
  if(session){session.stop();session=null}if(!options.resume)clearSessionCheckpoint();
  const d=todayDaily(a);d.plays++;a.stats.plays++;const prog=a.progress[g.id]||(a.progress[g.id]={level:1,completedLevels:[],highScore:0,finished:false,plays:0,wins:0});prog.plays++;saveDB(db);
  currentGame=g;showView('game');qs('#gameTitle').textContent=g.name;qs('#gameLevelText').textContent=campaign?`Level ${level} of ${g.levels}`:(g.id==='drawing-studio'?'Free Drawing — No Levels':g.id==='music-sequencer'?'Creative Mode':'Single Match');selectedGameMode=mode;session=new GameSession(g,level,mode);configureControlDock(g);scheduleGameWindowFit();session.start();
}
function exitGame(){
  if(session&&!session.completed){session.pauseForHome();saveSessionCheckpoint('launcher')}else if(session){session.stop();session=null}
  showView('launcher');refreshHeader();renderGames();ensureControllerFocus();
}
function levelCoinReward(level,totalLevels){if(level>=40&&totalLevels>=40)return 103;return 3+(level%10===0?5:0)}
function completeLevel(score=0){
  if(!session||session.completed)return;session.completed=true;const g=session.game,level=session.level,campaign=!!g.campaign&&g.levels>1;clearSessionCheckpoint(g.id);
  updateAccount(a=>{const p=a.progress[g.id]||(a.progress[g.id]={level:1,completedLevels:[],highScore:0,finished:false,plays:0,wins:0});p.highScore=Math.max(p.highScore||0,Math.round(score));p.wins=Number(p.wins||0)+1;a.stats.wins=Number(a.stats.wins||0)+1;let reward=0;
    if(campaign){if(!p.completedLevels.includes(level)){p.completedLevels.push(level);const coins=levelCoinReward(level,g.levels);a.coins+=coins;a.xp+=30+level;a.stats.levels++;todayDaily(a).levels++;reward+=coins}if(level>=g.levels&&!p.finished){p.finished=true;if(g.levels<40){a.coins+=5;reward+=5}a.xp+=150;a.stats.completed++}p.level=level>=g.levels?g.level:level+1}
    else{a.coins+=3;a.xp+=25;reward=3;if(!p.finished){p.finished=true;a.coins+=5;a.xp+=75;a.stats.completed++;reward+=5}p.level=1}
    session.reward=reward});session.showResult(true,score)
}
function failLevel(score=0){if(!session||session.completed)return;session.completed=true;clearSessionCheckpoint(session.game.id);const g=session.game;if(g.campaign&&g.levels>1)updateAccount(a=>{const p=a.progress[g.id]||(a.progress[g.id]={level:1,completedLevels:[],highScore:0,finished:false,plays:0,wins:0});p.level=1});session.showResult(false,score)}

class GameSession{
  constructor(game,level,mode='1P'){
    this.game=game;this.level=level;this.mode=mode;this.canvas=qs('#gameCanvas');this.ctx=this.canvas.getContext('2d');this.keys=new Set();this.running=false;this.paused=false;this.homePaused=false;this.completed=false;this.reward=0;this.last=0;this.elapsed=0;this.pointer={x:0,y:0,down:false};this.pointerOnlyGame=POINTER_GAME_ENGINES.has(game.engine);this.pointerGame=this.pointerOnlyGame;this.gamepadPointer={x:W/2,y:H/2,down:false,visible:false};this.gamepadPointerOwner=null;this.gamepadPointerPlayer=1;this.gamepadKeys=new Set();this.prevGamepadButtons={};this.resultTimer=null;this.ready=true;this.readyUntil=0;this.goUntil=0;this.readyShown=-1;this.touchStart=null;this.touchStarts=new Map();this.activePointers=new Map();this.readyHeldKeys=new Set();this.engine=null;const userScale=({'very-slow':.78,relaxed:.9,standard:1,challenge:1.12}[account()?.settings.gamePace||'standard']||1);this.paceScale=userScale*(ENGINE_SPEED_SCALE[game.engine]||1);
    this.boundPointer=e=>this.handlePointer(e);this.boundPointerUp=e=>this.handlePointerUp(e);
  }
  start(){this.running=true;this.canvas.addEventListener('pointerdown',this.boundPointer);this.canvas.addEventListener('pointermove',this.boundPointer);window.addEventListener('pointerup',this.boundPointerUp);window.addEventListener('pointercancel',this.boundPointerUp);this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);this.ctx.fillStyle='#071020';this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);this.last=performance.now();this.beginReadyCountdown();scheduleGameWindowFit();requestAnimationFrame(t=>this.loop(t))}
  beginReadyCountdown(){this.ready=true;this.readyUntil=performance.now()+5000;this.goUntil=0;this.readyShown=-1;this.updateReadyOverlay()}
  startEngineAfterCountdown(now){if(this.engine)return;this.engine=createGameEngine(this);this.pointerGame=this.pointerOnlyGame||typeof this.engine?.pointer==='function';this.engine?.init?.();this.ready=false;this.last=now;for(const key of this.readyHeldKeys){if(!this.keys.has(key))this.engine?.keyDown?.(key);this.keys.add(key)}this.readyHeldKeys.clear();qs('#gameOverlay').classList.add('hidden')}
  updateReadyOverlay(now=performance.now()){
    if(!this.ready)return;const o=qs('#gameOverlay');
    if(now<this.readyUntil){const remaining=Math.max(1,Math.ceil((this.readyUntil-now)/1000));if(remaining!==this.readyShown){this.readyShown=remaining;o.innerHTML=`<div class="overlay-card ready-card"><h2>Get Ready</h2><p>${remaining}</p></div>`;o.classList.remove('hidden')}return}
    if(!this.goUntil){this.goUntil=now+550;this.readyShown=0;o.innerHTML='<div class="overlay-card ready-card"><h2>GO!</h2><p>Start!</p></div>';o.classList.remove('hidden');return}
    if(now>=this.goUntil)this.startEngineAfterCountdown(now)
  }
  stop(){clearTimeout(this.resultTimer);this.resultTimer=null;releaseAllTouchControls();this.running=false;this.canvas.removeEventListener('pointerdown',this.boundPointer);this.canvas.removeEventListener('pointermove',this.boundPointer);window.removeEventListener('pointerup',this.boundPointerUp);window.removeEventListener('pointercancel',this.boundPointerUp);for(const k of this.gamepadKeys)this.setKey(k,false);if(this.gamepadPointer.down)this.releaseGamepadPointer();this.engine?.cleanup?.();qs('#gameOverlay').classList.add('hidden')}
  setKey(key,on){if(!on){this.readyHeldKeys.delete(key);if(this.keys.delete(key))this.engine?.keyUp?.(key);return}if(!this.running||this.paused||this.completed)return;if(this.ready){this.readyHeldKeys.add(key);return}if(!this.keys.has(key))this.engine?.keyDown?.(key);this.keys.add(key)}
  tapKey(key){this.setKey(key,true);setTimeout(()=>this.setKey(key,false),90)}
  pressed(...keys){return keys.some(k=>this.keys.has(k))}
  pointerPosition(e){const r=this.canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*this.canvas.width/r.width,y:(e.clientY-r.top)*this.canvas.height/r.height}}
  handlePointer(e){if(!this.running||this.paused||this.ready||this.completed)return;const pos=this.pointerPosition(e),id=e.pointerId??'mouse',type=e.pointerType||'mouse',state={...pos,id,type,down:true,player:this.mode==='2P'?(pos.x<W/2?1:2):1};this.activePointers.set(id,state);this.pointer=state;if(e.type==='pointerdown'){try{this.canvas.setPointerCapture?.(id)}catch{}if(type==='touch'){const start={...pos,time:performance.now(),player:state.player};this.touchStarts.set(id,start);this.touchStart=start}}this.engine?.pointer?.(state,e.type)}
  handlePointerUp(e){if(!this.running)return;const id=e.pointerId??'mouse',pos=this.pointerPosition(e),old=this.activePointers.get(id)||{},state={...old,...pos,id,type:e.pointerType||old.type||'mouse',down:false,player:old.player||(this.mode==='2P'?(pos.x<W/2?1:2):1)};this.activePointers.delete(id);this.pointer=state;this.engine?.pointer?.(state,'pointerup');this.engine?.pointerUp?.(state);const start=this.touchStarts.get(id);this.touchStarts.delete(id);if(!this.paused&&!this.ready&&!this.completed&&start&&!this.pointerGame){const dx=pos.x-start.x,dy=pos.y-start.y,d=Math.hypot(dx,dy),p2=this.mode==='2P'&&start.player===2,keys=p2?{left:'KeyA',right:'KeyD',up:'KeyW',down:'KeyS',action:'KeyF'}:{left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown',action:'Space'};if(d>32)this.tapKey(Math.abs(dx)>Math.abs(dy)?(dx<0?keys.left:keys.right):(dy<0?keys.up:keys.down));else this.tapKey(keys.action)}this.touchStart=null}
  sendGamepadPointer(type){const p=this.gamepadPointer;this.pointer={x:p.x,y:p.y,down:p.down,type:'gamepad',id:'gamepad',player:this.gamepadPointerPlayer};this.engine?.pointer?.(this.pointer,type);if(type==='pointerup')this.engine?.pointerUp?.(this.pointer)}
  releaseGamepadPointer(){if(!this.gamepadPointer.down)return;this.gamepadPointer.down=false;this.sendGamepadPointer('pointerup')}
  gamepadPointerActivity(pad,dir){if(!pad)return false;const right=gamepadRightStick(pad),move=dir||gamepadDirections(pad);return Math.abs(right.x)>.04||Math.abs(right.y)>.04||move.left||move.right||move.up||move.down||gamepadButtonPressed(pad,0)||gamepadButtonPressed(pad,2)||Number(pad.buttons?.[7]?.value||0)>.45}
  pollGamepadPointer(pad,dir,player=1){if(!pad||!this.pointerGame)return;const owner=String(pad.index);if(this.gamepadPointerOwner!==owner){if(this.gamepadPointer.down)this.releaseGamepadPointer();this.prevGamepadButtons.pointerClick=false;this.gamepadPointerOwner=owner}this.gamepadPointerPlayer=player;const p=this.gamepadPointer,right=gamepadRightStick(pad),fallback=this.pointerOnlyGame?(dir||gamepadDirections(pad)):{x:0,y:0},rightActive=Math.abs(right.x)>.04||Math.abs(right.y)>.04,rx=rightActive?right.x:fallback.x,ry=rightActive?right.y:fallback.y;if(Math.abs(rx)>.02||Math.abs(ry)>.02){p.visible=true;p.x=clamp(p.x+rx*15,0,W);p.y=clamp(p.y+ry*15,0,H);if(p.down)this.sendGamepadPointer('pointermove')}const click=gamepadButtonPressed(pad,0)||gamepadButtonPressed(pad,2)||Number(pad.buttons?.[7]?.value||0)>.45,old=!!this.prevGamepadButtons.pointerClick;if(click&&!old&&!this.paused&&!this.ready&&!this.completed){p.visible=true;p.down=true;this.sendGamepadPointer('pointerdown')}if(!click&&old)this.releaseGamepadPointer();this.prevGamepadButtons.pointerClick=click}
  drawGamepadPointer(){const p=this.gamepadPointer;if(!p.visible)return;const c=this.ctx;c.save();c.lineWidth=3;c.strokeStyle='#fff';c.fillStyle=p.down?'#ffdf5d':'#36ddff';c.beginPath();c.arc(p.x,p.y,p.down?11:9,0,Math.PI*2);c.fill();c.stroke();c.beginPath();c.moveTo(p.x-16,p.y);c.lineTo(p.x+16,p.y);c.moveTo(p.x,p.y-16);c.lineTo(p.x,p.y+16);c.stroke();c.restore()}
  pollGamepads(){
    if(this.completed||!this.running||this.ready)return;const pads=playerGamepads(),desired=new Set();const addSet=(dir,keys)=>{if(dir.left)desired.add(keys.left);if(dir.right)desired.add(keys.right);if(dir.up)desired.add(keys.up);if(dir.down)desired.add(keys.down)};
    const addDirectionKeys=(dir,index)=>{if(this.mode!=='2P'){addSet(dir,{left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown'});addSet(dir,{left:'KeyA',right:'KeyD',up:'KeyW',down:'KeyS'});return}const pongSwap=this.game.engine==='pong';if((index===0&&!pongSwap)||(index===1&&pongSwap))addSet(dir,{left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown'});else addSet(dir,{left:'KeyA',right:'KeyD',up:'KeyW',down:'KeyS'})};
    const mapPad=(pad,index)=>{if(!pad)return null;const dir=gamepadDirections(pad);if(!this.pointerOnlyGame)addDirectionKeys(dir,index);if(!this.pointerOnlyGame&&gamepadButtonPressed(pad,0))desired.add(index===0?'Space':'KeyF');if(!this.pointerOnlyGame&&gamepadButtonPressed(pad,1))desired.add(index===0?'Enter':'KeyG');const start=gamepadButtonPressed(pad,9),old=!!this.prevGamepadButtons[`${pad.index}:start`];if(start&&!old)this.togglePause();this.prevGamepadButtons[`${pad.index}:start`]=start;return dir};
    const p1dir=mapPad(pads[0],0),p2dir=this.mode==='2P'&&pads[1]?mapPad(pads[1],1):null;let pointerPad=pads[0],pointerDir=p1dir,pointerPlayer=1;if(this.pointerGame&&pads[1]){const p2active=this.gamepadPointerActivity(pads[1],p2dir),p1active=this.gamepadPointerActivity(pads[0],p1dir);if(p2active&&!p1active||p2active&&String(this.gamepadPointerOwner)!==String(pads[0].index)){pointerPad=pads[1];pointerDir=p2dir;pointerPlayer=2}else if(!p1active&&this.gamepadPointerOwner===String(pads[1].index)){pointerPad=pads[1];pointerDir=p2dir;pointerPlayer=2}}this.pollGamepadPointer(pointerPad,pointerDir,pointerPlayer);for(const k of this.gamepadKeys)if(!desired.has(k))this.setKey(k,false);for(const k of desired)if(!this.gamepadKeys.has(k))this.setKey(k,true);this.gamepadKeys=desired;
  }
  loop(t){if(!this.running)return;if(this.ready)this.updateReadyOverlay(t);else this.pollGamepads();const dt=Math.min(.04,(t-this.last)/1000||0);this.last=t;if(!this.ready&&!this.paused&&!this.completed&&this.engine){const gameDt=dt*this.paceScale;this.elapsed+=gameDt;try{this.engine.update?.(gameDt)}catch(err){console.error(err);this.showError(err);return}}if(!this.running)return;try{if(this.engine){this.engine.draw(this.ctx);this.drawGamepadPointer()}}catch(err){console.error(err);this.showError(err);return}requestAnimationFrame(x=>this.loop(x))}
  pauseMarkup(){const g=this.game,campaign=!!g.campaign&&g.levels>1,drawing=g.id==='drawing-studio',rewards=campaign?'3 coins per new level; +5 at levels 10, 20, and 30; +100 at level 40.':drawing?'Open-ended creative mode: no levels, timer, win condition, or level rewards.':'3 coins per win; +5 for the first win.',restartLabel=drawing?'Start a Blank Drawing':campaign?'Restart Level':'Restart Match';return`<div class="overlay-card pause-card"><h2>Game Paused</h2><h3>${escapeHtml(g.name)}</h3><p><b>Objective:</b> ${escapeHtml(objective(g))}</p><p><b>How to play:</b> ${escapeHtml(howTo(g))}</p><p><b>Controls:</b> ${escapeHtml(g.controls)}. Touch controls and direct canvas gestures are supported. Nintendo controller movement uses the D-pad or L stick; the R stick controls aiming and the virtual cursor in compatible games.</p><p><b>Rewards:</b> ${rewards}</p><button id="resumeBtn" class="primary">Resume</button><button id="restartBtn">${restartLabel}</button><button id="quitBtn">Save & Return to Launcher</button></div>`}
  togglePause(){if(this.completed||this.ready)return;this.paused=!this.paused;const o=qs('#gameOverlay');if(this.paused){o.innerHTML=this.pauseMarkup();o.classList.remove('hidden');qs('#resumeBtn').onclick=()=>this.togglePause();qs('#restartBtn').onclick=()=>{const g=this.game,l=this.level,mode=this.mode;this.stop();session=new GameSession(g,l,mode);configureControlDock(g);session.start()};qs('#quitBtn').onclick=exitGame}else{o.classList.add('hidden');this.last=performance.now()}}
  pauseForHome(){if(this.completed)return;this.homePaused=true;this.paused=true;this.keys.clear();for(const k of this.gamepadKeys)this.setKey(k,false);this.gamepadKeys.clear()}
  resumeFromHome(){this.homePaused=false;this.paused=true;this.last=performance.now();const o=qs('#gameOverlay');o.innerHTML=this.pauseMarkup();o.classList.remove('hidden');qs('#resumeBtn').onclick=()=>this.togglePause();qs('#restartBtn').onclick=()=>{const g=this.game,l=this.level,mode=this.mode;this.stop();session=new GameSession(g,l,mode);configureControlDock(g);session.start()};qs('#quitBtn').onclick=exitGame}
  showResult(win,score){this.running=false;this.keys.clear();this.gamepadKeys.clear();this.pointer.down=false;const campaign=!!this.game.campaign&&this.game.levels>1,o=qs('#gameOverlay'),next=campaign&&this.level<this.game.levels,title=win?(campaign?'Level Complete!':'Match Complete!'):(campaign?'Campaign Restart':'Try Again');o.innerHTML=`<div class="overlay-card"><h2>${title}</h2><p>Score: ${Math.round(score)}</p>${win?'':`<p>${campaign?'You lost. Restarting at Level 1.':'Restarting the match'} automatically.</p>`}${win?`<p>AG Coins earned: ${this.reward}</p>`:''}<button id="resultMain" class="primary">${win&&next?'Next Level':win?(campaign?'Replay Level':'Play Again'):(campaign?'Restart at Level 1':'Restart Now')}</button><button id="resultLauncher">Return to Launcher</button></div>`;o.classList.remove('hidden');const restart=()=>{const g=this.game,l=win?(next?this.level+1:this.level):(campaign?1:this.level),mode=this.mode;this.stop();session=new GameSession(g,l,mode);qs('#gameLevelText').textContent=campaign?`Level ${l} of ${g.levels}`:(g.id==='drawing-studio'?'Free Drawing — No Levels':g.id==='music-sequencer'?'Creative Mode':'Single Match');selectedGameMode=mode;configureControlDock(g);session.start()};qs('#resultMain').onclick=restart;qs('#resultLauncher').onclick=()=>{this.stop();session=null;showView('launcher');refreshHeader();renderGames()};if(!win)this.resultTimer=setTimeout(()=>{if(session===this&&this.completed)restart()},2200)}
  showError(err){this.running=false;const o=qs('#gameOverlay');o.innerHTML=`<div class="overlay-card"><h2>Game Error</h2><p>${escapeHtml(err.message||String(err))}</p><button id="errorBack">Return to Launcher</button></div>`;o.classList.remove('hidden');qs('#errorBack').onclick=()=>{this.stop();session=null;showView('launcher');renderGames()}}
}

window.addEventListener('pagehide',()=>saveSessionCheckpoint('pagehide'));
document.addEventListener('visibilitychange',()=>{if(document.hidden&&session?.running&&!session.completed){saveSessionCheckpoint('device-home');session.pauseForHome()}else if(!document.hidden&&session?.homePaused&&views.game.classList.contains('active'))session.resumeFromHome()});
window.addEventListener('beforeunload',()=>saveSessionCheckpoint('reload'));

async function syncGameCatalog(){
  try{const response=await fetch('./games.json?v=11.6',{cache:'no-store'});if(!response.ok)return;const fresh=await response.json();if(!Array.isArray(fresh)||!fresh.length)return;const current=JSON.stringify(ARCADE_GAMES.map(g=>[g.id,g.name,g.engine,g.controls]));const next=JSON.stringify(fresh.map(g=>[g.id,g.name,g.engine,g.controls]));if(current!==next){ARCADE_GAMES.splice(0,ARCADE_GAMES.length,...fresh);if(activeAccountId){const selected=qs('#categorySelect').value;qs('#categorySelect').innerHTML='';renderLauncher();if([...qs('#categorySelect').options].some(o=>o.value===selected))qs('#categorySelect').value=selected;renderGames()}toast('The unique game catalog was refreshed')}}catch(error){console.warn('Catalog refresh skipped',error)}
}
if('serviceWorker'in navigator)window.addEventListener('load',async()=>{
  const logo=qs('#mainLogo');if(logo&&!logo.complete)logo.addEventListener('error',()=>logo.src='./icon-512.png?v=11.6',{once:true});
  try{const registration=await navigator.serviceWorker.register('./service-worker.js?v=11.6');await registration.update();let refreshing=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(refreshing)return;refreshing=true;location.reload()})}catch(error){console.warn(error)}
  syncGameCatalog();
});
window.addEventListener('error',e=>{console.error(e.error||e.message);try{localStorage.setItem('asArcadeLastError',JSON.stringify({time:new Date().toISOString(),message:e.message,stack:e.error?.stack||''}))}catch{}});
refreshAuth();if(db.active&&db.accounts.some(a=>a.id===db.active&&a.enabled)){activeAccountId=db.active;refreshHeader();renderLauncher();showView('launcher')}else showView('auth');
