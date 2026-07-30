'use strict';

const APP_VERSION='11.3-web';
const DB_KEY='asArcadeMobileDB';
const AVATARS=AVATAR_PRESETS.map(p=>p.id);
const THEMES=['neon','sunset','forest','royal','sky','candy','ocean','lava','mint','galaxy','retro','midnight','sports','creative','cozy','cyber','desert','ice','rainbow','monochrome','custom'];
const WALLPAPERS=['none','grid','stars','candy','waves','circuit','confetti','sunset','clouds','checker','aurora','space','neon-city','mountains','ocean-floor','pixel-sky','sports-field','music-stage','castle','jungle','snow','rainbow'];
const BANNERS=['Arcade Explorer','High Score Hero','Puzzle Master','Racing Champion','Creative Star','Family Game Night','Adventure Ace','Strategy Captain','Galaxy Gamer','Sports Legend','Cozy Player','Tech Wizard','Music Maker','Board Game Boss','Level Champion','Arcade Superstar','Speed Runner','Trophy Hunter','Coin Captain','Touchscreen Pro','Keyboard Hero','Controller Champion','Daily Challenger','Multiplayer MVP','Simulation Star','Word Wizard','Card Shark','Retro Legend','Neon Knight','Ultimate Arcade Legend'];
const CATEGORY_ICONS={Arcade:'🕹️',Adventure:'🗺️',Puzzle:'🧩',Strategy:'♟️',Sports:'🏆',Shooter:'🚀',Word:'🔤',Learning:'📚',Creative:'🎨',Casual:'🎯',Racing:'🏁',Multiplayer:'👥',Simulation:'⚙️',Cards:'🃏',Board:'🎲',Music:'🎵'};
const MULTIMODE_ENGINES=new Set(['pong','soccer','dotsboxes','volleyball','airhockey','tictactoe','connect4','reversi','checkers','mancala','gomoku','hex','tabletennis']);
const POINTER_GAME_ENGINES=new Set(['memory','lights','mines','sudoku','tictactoe','connect4','reversi','checkers','battleship','whack','bubble','basketball','archery','golf','drawing','trivia','towerdefense','chesstactics','wordsearch','crossword','scramble','mathsprint','typingrace','rhythm','sequencer','paintnumbers','jigsaw','sliding','pipes','laser','tangram','nonogram','mastermind','codebreaker','yahtzee','solitaire','war','gofish','dicerace','dotsboxes','mancala','morris','gomoku','hex','dominoes','bowling','fishing','cooking','farm','petcare','citybuilder','match3','robotcode']);
const CONTROLLER_PROFILE_VERSION=2;
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
    a.parental=Object.assign({minutes:0,multiplayer:true,spending:true,categories:[],external:true},a.parental||{});
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
function newAccount(username,displayName,pinHash,type,avatar){return{id:uid(),username,displayName:displayName||username,pinHash,type,enabled:true,avatar:normalizeAvatar(avatar),coins:20,xp:0,banner:BANNERS[0],settings:{theme:'neon',wallpaper:'stars',reducedMotion:false,highContrast:false,sound:true,controlSize:'normal',textSize:'normal',cardSize:'normal',gamePace:'standard',customTheme:{bg:'#071329',panel:'#101f42',card:'#162c58',accent:'#31d5ff',accent2:'#ff4fd8',text:'#f7fbff'}},unlocks:{themes:['neon','sunset','forest','custom'],wallpapers:['none','stars','grid'],banners:[BANNERS[0]],avatars:AVATARS.slice(0,4)},favorites:[],progress:{},achievements:[],stats:{plays:0,levels:0,completed:0,wins:0,seconds:0},daily:{date:'',plays:0,levels:0,claimed:false},parental:{minutes:0,multiplayer:true,spending:true,categories:[],external:true},createdAt:Date.now()}}
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
qsa('[data-key]').forEach(button=>{
  const key=button.dataset.key;
  const down=e=>{e.preventDefault();session&&session.setKey(key,true)};const up=e=>{e.preventDefault();session&&session.setKey(key,false)};
  button.addEventListener('pointerdown',down);button.addEventListener('pointerup',up);button.addEventListener('pointercancel',up);button.addEventListener('pointerleave',up);
});
window.addEventListener('keydown',e=>{if(session){if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.code==='Escape'){session.togglePause();return}session.setKey(e.code,true)}});
window.addEventListener('keyup',e=>session&&session.setKey(e.code,false));

const controllerMenuState={buttons:new Map(),direction:'',nextMoveAt:0,connected:false};
const controllerManager={
  activePadIndex:null,profiles:{},motion:new Map(),calibration:null,lastDebug:0,
  activationTimer:null,activationUntil:0,keyboardFallback:false,lastDetectedId:'',
  isAppleMobile:/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),
  standalone:window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true,
  framed:window.top!==window.self
};
try{
  controllerManager.profiles=JSON.parse(localStorage.getItem('asArcadeControllerProfiles')||'{}')||{};
  let removedOld=false;
  for(const [key,profile] of Object.entries(controllerManager.profiles)){if(profile?.version!==CONTROLLER_PROFILE_VERSION){delete controllerManager.profiles[key];removedOld=true}}
  if(removedOld)localStorage.setItem('asArcadeControllerProfiles',JSON.stringify(controllerManager.profiles));
}catch{controllerManager.profiles={}}
function controllerStatus(text,connected=false){const el=qs('#controllerStatus');if(!el)return;el.textContent=text;el.classList.toggle('connected',connected)}
function gamepadGetter(){
  if(typeof navigator.getGamepads==='function')return navigator.getGamepads.bind(navigator);
  if(typeof navigator.webkitGetGamepads==='function')return navigator.webkitGetGamepads.bind(navigator);
  return null;
}
function rawGamepads(){
  try{const getter=gamepadGetter();if(!getter)return[];const list=getter()||[];return Array.from(list).filter(Boolean)}catch(error){console.warn('Gamepad read failed',error);return[]}
}
function connectedGamepads(){
  // Safari has occasionally returned a usable Gamepad object with a stale false
  // connected flag. A non-null object from the current getGamepads() snapshot is
  // enough to poll it; disconnected controllers disappear from later snapshots.
  const pads=rawGamepads();
  if(pads.length&&controllerManager.activePadIndex===null)controllerManager.activePadIndex=Number.isInteger(pads[0].index)?pads[0].index:0;
  return pads;
}
function gamepadButtonPressed(pad,index){const b=pad?.buttons?.[index];if(typeof b==='number')return b>.5;return !!(b&&(b.pressed||Number(b.value||0)>.5))}
function padKey(pad){return String(pad?.id||'unknown').replace(/\s+/g,' ').trim().slice(0,160)}
function saveControllerProfiles(){try{localStorage.setItem('asArcadeControllerProfiles',JSON.stringify(controllerManager.profiles))}catch{}}
function controllerProfile(pad){return controllerManager.profiles[padKey(pad)]||null}
function axisValue(pad,index){const value=Number(pad?.axes?.[index]);return Number.isFinite(value)?value:0}
function updateAxisMotion(pad){
  if(!pad)return;const key=pad.index,count=pad.axes?.length||0;let state=controllerManager.motion.get(key);
  if(!state||state.count!==count){state={count,center:[],min:[],max:[],last:[],pair:null,frames:0};for(let i=0;i<count;i++){const v=axisValue(pad,i);state.center[i]=pad.mapping==='standard'?0:v;state.min[i]=v;state.max[i]=v;state.last[i]=v}controllerManager.motion.set(key,state)}
  state.frames++;
  for(let i=0;i<count;i++){const v=axisValue(pad,i);state.min[i]=Math.min(state.min[i],v);state.max[i]=Math.max(state.max[i],v);state.last[i]=v;if(state.frames<20&&Math.abs(v-state.center[i])<.12)state.center[i]=state.center[i]*.85+v*.15}
  return state;
}
function autoAxisPair(pad){
  const axes=pad?.axes||[],state=updateAxisMotion(pad);if(axes.length<2)return[0,1];
  const profile=controllerProfile(pad);if(profile?.version===CONTROLLER_PROFILE_VERSION&&Number.isInteger(profile.xAxis)&&Number.isInteger(profile.yAxis)&&profile.xAxis<axes.length&&profile.yAxis<axes.length)return[profile.xAxis,profile.yAxis];
  // The standard Gamepad mapping guarantees axes 0/1 are the left stick. Do not
  // learn from whichever stick happened to move first: that caused Chrome to
  // save the right stick as movement on Nintendo controllers.
  if(pad.mapping==='standard'||axes.length>=2){state.pair=[0,1];return state.pair}
  return[0,1];
}
function normalizedLeftStick(pad){
  const profile=controllerProfile(pad),state=updateAxisMotion(pad),[xAxis,yAxis]=autoAxisPair(pad);let x=axisValue(pad,xAxis),y=axisValue(pad,yAxis);
  if(profile){x=(x-Number(profile.xCenter||0))*Number(profile.xSign||1);y=(y-Number(profile.yCenter||0))*Number(profile.ySign||1)}else{x-=Number(state?.center?.[xAxis]||0);y-=Number(state?.center?.[yAxis]||0)}
  const dead=.12;const clean=v=>Math.abs(v)<dead?0:clamp((Math.abs(v)-dead)/(1-dead)*Math.sign(v),-1,1);return{x:clean(x),y:clean(y),xAxis,yAxis};
}
function hatDirections(pad){
  const axes=pad?.axes||[];let left=false,right=false,up=false,down=false;
  if(axes.length>7){const hx=axisValue(pad,6),hy=axisValue(pad,7);left=hx<-.55;right=hx>.55;up=hy<-.55;down=hy>.55}
  if(!left&&!right&&!up&&!down&&pad?.mapping!=='standard'){
    for(let i=8;i<axes.length;i++){const hat=axisValue(pad,i),states=[[-1,'up'],[-.7142857,'upRight'],[-.4285714,'right'],[-.1428571,'downRight'],[.1428571,'down'],[.4285714,'downLeft'],[.7142857,'left'],[1,'upLeft']],match=states.find(([value])=>Math.abs(hat-value)<.11);if(!match)continue;const name=match[1];left=name.includes('Left')||name==='left';right=name.includes('Right')||name==='right';up=name.includes('up')||name==='up';down=name.includes('down')||name==='down';break}
  }
  return{left,right,up,down};
}
function gamepadDirections(pad){
  const stick=normalizedLeftStick(pad),hat=hatDirections(pad);return{
    left:stick.x<0||gamepadButtonPressed(pad,14)||hat.left,right:stick.x>0||gamepadButtonPressed(pad,15)||hat.right,
    up:stick.y<0||gamepadButtonPressed(pad,12)||hat.up,down:stick.y>0||gamepadButtonPressed(pad,13)||hat.down,
    x:stick.x,y:stick.y,xAxis:stick.xAxis,yAxis:stick.yAxis
  };
}
function activeGamepads(){const pads=connectedGamepads();if(!pads.length)return[];const active=pads.find(p=>p.index===controllerManager.activePadIndex);return active?[active,...pads.filter(p=>p!==active)]:pads}
function gamepadPermissionAllowed(){
  try{const policy=document.permissionsPolicy||document.featurePolicy;if(policy?.allowsFeature)return policy.allowsFeature('gamepad')}catch{}
  return null;
}
function controllerEnvironmentHelp(){
  if(!gamepadGetter())return'This Safari version does not expose the Gamepad API. Update iPadOS, then reopen the arcade in Safari.';
  if(gamepadPermissionAllowed()===false)return'This page is embedded where controller access is blocked. Use Open Arcade Directly, then run the connection scan in the new Safari page.';
  if(controllerManager.framed)return'This arcade is inside another website. Controller access is more reliable on the direct GitHub Pages address; use Open Arcade Directly below.';
  if(controllerManager.isAppleMobile&&controllerManager.standalone)return'For this test, open the HTTPS address in a normal Safari tab instead of the Home Screen copy. Tap Start Safari Scan, then press B, A, or + repeatedly on the Nintendo controller.';
  if(controllerManager.isAppleMobile)return'Confirm the controller appears under iPad Settings → General → Game Controller. Then tap Start Safari Scan and press B, A, or + repeatedly for several seconds.';
  return'Press any controller button, then choose Start Controller Scan. Use Calibrate Left Stick if only the D-pad responds.';
}
function updateControllerDebug(force=false){
  const now=performance.now();if(!force&&now-controllerManager.lastDebug<160)return;controllerManager.lastDebug=now;const pads=connectedGamepads(),live=qs('#controllerLive'),debug=qs('#controllerDebug');if(!live||!debug)return;
  qs('#controllerHelp').textContent=controllerEnvironmentHelp();
  const direct=qs('#openDirectControllerLink');if(direct){direct.href=location.href;direct.classList.toggle('hidden',!controllerManager.framed&&gamepadPermissionAllowed()!==false)}
  if(!pads.length){
    const remaining=Math.max(0,Math.ceil((controllerManager.activationUntil-performance.now())/1000));
    live.textContent=remaining?`Safari scan active for ${remaining} more second${remaining===1?'':'s'}. Keep this page visible and press B, A, or + repeatedly on the controller.`:'No web controller detected. Safari has not exposed a controller to this page yet.';
    debug.textContent=`Gamepad API: ${gamepadGetter()?'available':'unavailable'}\nAPI path: ${typeof navigator.getGamepads==='function'?'standard':typeof navigator.webkitGetGamepads==='function'?'webkit fallback':'none'}\nGamepad permission: ${gamepadPermissionAllowed()===false?'blocked':gamepadPermissionAllowed()===true?'allowed':'not reported'}\nSafari/iPad: ${controllerManager.isAppleMobile?'yes':'no'}\nStandalone/Home Screen: ${controllerManager.standalone?'yes':'no'}\nEmbedded page: ${controllerManager.framed?'yes':'no'}\nSecure page: ${window.isSecureContext?'yes':'no'}\nKeyboard fallback seen: ${controllerManager.keyboardFallback?'yes':'no'}\nUser agent: ${navigator.userAgent}`;return
  }
  const first=pads[0];controllerManager.lastDetectedId=first.id||'Controller';
  live.textContent=`Connected: ${first.id||'Controller'}. Move the left stick and watch the X/Y values below.`;
  debug.textContent=`API path: ${typeof navigator.getGamepads==='function'?'standard':typeof navigator.webkitGetGamepads==='function'?'webkit fallback':'none'}\n`+pads.map((p,n)=>{const d=gamepadDirections(p),profile=controllerProfile(p);return[`Controller ${Number.isInteger(p.index)?p.index:n}: ${p.id||'Unknown'}`,`Connected flag: ${String(p.connected)} | Mapping: ${p.mapping||'non-standard'} | Buttons: ${p.buttons?.length||0} | Axes: ${p.axes?.length||0}`,`Left stick axes: ${d.xAxis}/${d.yAxis} | X ${d.x.toFixed(2)} | Y ${d.y.toFixed(2)}`,`D-pad: L${+gamepadButtonPressed(p,14)} R${+gamepadButtonPressed(p,15)} U${+gamepadButtonPressed(p,12)} D${+gamepadButtonPressed(p,13)}`,`Calibration: ${profile?'saved':'automatic'}`,`Raw axes: ${(p.axes||[]).map((v,i)=>`${i}:${Number(v).toFixed(2)}`).join('  ')}`].join('\n')}).join('\n\n');
}
function updateControllerStatus(){const pads=connectedGamepads();controllerMenuState.connected=!!pads.length;controllerStatus(pads.length?`🎮 ${pads.length} controller${pads.length===1?'':'s'} ready`:controllerManager.keyboardFallback?'⌨ Controller keyboard mode':'🎮 Controller Setup',!!pads.length||controllerManager.keyboardFallback);updateControllerDebug()}
function finishControllerScan(found){
  if(controllerManager.activationTimer){clearInterval(controllerManager.activationTimer);controllerManager.activationTimer=null}
  controllerManager.activationUntil=0;
  const button=qs('#activateControllerBtn');if(button){button.disabled=false;button.textContent='Start Safari Scan'}
  if(found){const pads=connectedGamepads();if(pads[0])controllerManager.activePadIndex=Number.isInteger(pads[0].index)?pads[0].index:0;updateControllerStatus();toast(`${pads[0]?.id||'Controller'} connected`)}else{updateControllerDebug(true);toast('Safari did not expose the controller')}
}
function detectControllers(){
  const pads=connectedGamepads();
  if(pads.length){finishControllerScan(true);return}
  if(!gamepadGetter()){updateControllerStatus();toast('Gamepad API unavailable in this Safari version');return}
  controllerManager.activationUntil=performance.now()+15000;
  const button=qs('#activateControllerBtn');if(button){button.disabled=true;button.textContent='Scanning… press B, A, or +'}
  updateControllerDebug(true);
  if(controllerManager.activationTimer)clearInterval(controllerManager.activationTimer);
  controllerManager.activationTimer=setInterval(()=>{
    const fresh=connectedGamepads();updateControllerDebug(true);
    if(fresh.length)finishControllerScan(true);else if(performance.now()>=controllerManager.activationUntil)finishControllerScan(false)
  },100);
}
async function calibrateLeftStick(){
  const pad=activeGamepads()[0];if(!pad){detectControllers();return}
  const live=qs('#controllerLive'),btn=qs('#calibrateControllerBtn');btn.disabled=true;btn.classList.add('controller-calibrating');
  const getPad=()=>connectedGamepads().find(p=>p.index===pad.index)||pad;
  const pause=ms=>new Promise(r=>setTimeout(r,ms));
  const averageAxes=async(ms,label)=>{
    live.textContent=label;const start=performance.now(),sums=[],counts=[];
    while(performance.now()-start<ms){const fresh=getPad();for(let i=0;i<(fresh.axes?.length||0);i++){sums[i]=(sums[i]||0)+axisValue(fresh,i);counts[i]=(counts[i]||0)+1}await new Promise(r=>requestAnimationFrame(r))}
    return sums.map((value,i)=>value/(counts[i]||1));
  };
  const chooseAxis=(negative,positive,centers,exclude=-1)=>{let best=-1,bestSpan=0;for(let i=0;i<Math.max(negative.length,positive.length,centers.length);i++){if(i===exclude)continue;const n=(negative[i]??centers[i]??0)-(centers[i]||0),p=(positive[i]??centers[i]??0)-(centers[i]||0),span=Math.abs(p-n),opposite=n*p<-.02;if(span>bestSpan&&(opposite||span>.75)){best=i;bestSpan=span}}return best};
  live.textContent='Release every stick and keep the controller still…';await pause(900);const centers=await averageAxes(650,'Centering the controller…');
  const left=await averageAxes(1200,'Move ONLY the L stick fully LEFT and hold it…');
  await pause(350);const right=await averageAxes(1200,'Move ONLY the L stick fully RIGHT and hold it…');
  await pause(350);const up=await averageAxes(1200,'Move ONLY the L stick fully UP and hold it…');
  await pause(350);const down=await averageAxes(1200,'Move ONLY the L stick fully DOWN and hold it…');
  const xAxis=chooseAxis(left,right,centers),yAxis=chooseAxis(up,down,centers,xAxis);
  if(xAxis<0||yAxis<0){live.textContent='Could not identify the L stick. Reset it, then retry while moving only the L stick.';toast('L-stick calibration was not saved')}
  else{
    const lx=(left[xAxis]??0)-(centers[xAxis]||0),rx=(right[xAxis]??0)-(centers[xAxis]||0),uy=(up[yAxis]??0)-(centers[yAxis]||0),dy=(down[yAxis]??0)-(centers[yAxis]||0);
    controllerManager.profiles[padKey(pad)]={version:CONTROLLER_PROFILE_VERSION,xAxis,yAxis,xCenter:centers[xAxis]||0,yCenter:centers[yAxis]||0,xSign:lx<rx?1:-1,ySign:uy<dy?1:-1,source:'guided-left-stick'};
    saveControllerProfiles();controllerManager.motion.delete(pad.index);
    live.textContent=`L stick saved on axes ${xAxis}/${yAxis}. LEFT now reports negative X and RIGHT reports positive X.`;toast('Nintendo L stick calibration saved');
  }
  btn.disabled=false;btn.classList.remove('controller-calibrating');updateControllerDebug(true);
}
function useStandardLeftStick(){
  const pad=activeGamepads()[0];if(!pad){detectControllers();return}
  controllerManager.profiles[padKey(pad)]={version:CONTROLLER_PROFILE_VERSION,xAxis:0,yAxis:1,xCenter:0,yCenter:0,xSign:1,ySign:1,source:'standard-0-1'};
  saveControllerProfiles();controllerManager.motion.delete(pad.index);toast('Using standard L-stick axes 0/1');updateControllerDebug(true);
}
function resetControllerCalibration(){const pad=activeGamepads()[0];if(pad)delete controllerManager.profiles[padKey(pad)];else controllerManager.profiles={};saveControllerProfiles();controllerManager.motion.clear();toast('Controller calibration reset');updateControllerDebug(true)}
window.addEventListener('gamepadconnected',e=>{controllerManager.activePadIndex=e.gamepad?.index??controllerManager.activePadIndex;finishControllerScan(true)});
window.addEventListener('gamepaddisconnected',()=>{controllerManager.activePadIndex=null;updateControllerStatus();toast('Controller disconnected')});
qs('#controllerStatus')?.addEventListener('click',()=>{qs('#controllerHelp').textContent=controllerEnvironmentHelp();openDialog(controllerDialog);updateControllerDebug(true)});
qs('#activateControllerBtn')?.addEventListener('click',detectControllers);qs('#standardControllerBtn')?.addEventListener('click',useStandardLeftStick);qs('#calibrateControllerBtn')?.addEventListener('click',calibrateLeftStick);qs('#resetControllerBtn')?.addEventListener('click',resetControllerCalibration);
for(const eventName of['pointerdown','pointerup','touchstart','touchend','click'])window.addEventListener(eventName,()=>{connectedGamepads();updateControllerStatus()},{passive:true});
for(const eventName of['pageshow','focus'])window.addEventListener(eventName,()=>updateControllerStatus());
document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateControllerStatus()});
window.addEventListener('keydown',event=>{
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter','Space','Escape'].includes(event.code)){controllerManager.keyboardFallback=true;updateControllerStatus()}
  if(session?.running)return;
  if(event.code==='ArrowLeft'||event.code==='ArrowRight'||event.code==='ArrowUp'||event.code==='ArrowDown'){event.preventDefault();focusMenuItem(event.code.replace('Arrow','').toLowerCase())}
  else if(event.code==='Enter'||event.code==='Space'){const el=document.activeElement;if(el&&el!==document.body){event.preventDefault();el.click?.()}}
  else if(event.code==='Escape'){event.preventDefault();closeTopControllerLayer()}
});
function menuFocusable(){
  const open=[...document.querySelectorAll('dialog[open]')].pop();
  const scope=open||Object.values(views).find(v=>v.classList.contains('active'))||document.body;
  const visible=selector=>[...scope.querySelectorAll(selector)].filter(el=>{const r=el.getBoundingClientRect(),style=getComputedStyle(el);return style.display!=='none'&&style.visibility!=='hidden'&&r.width>0&&r.height>0});
  const all=visible('button:not([disabled]):not(.favorite),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"]):not(.favorite),.game-card');
  if(!open&&views.launcher.classList.contains('active')){const cards=visible('.game-card');return[...cards,...all.filter(el=>!cards.includes(el))]}
  return all;
}
function ensureControllerFocus(){
  const items=menuFocusable();if(!items.length)return null;
  if(items.includes(document.activeElement))return document.activeElement;
  const preferred=views.launcher.classList.contains('active')&&!document.querySelector('dialog[open]')?items.find(el=>el.classList.contains('game-card')):items[0];
  (preferred||items[0]).focus?.();return preferred||items[0];
}
function focusMenuItem(direction){
  const items=menuFocusable();if(!items.length)return;const active=items.includes(document.activeElement)?document.activeElement:ensureControllerFocus();if(!active)return;
  if(active.tagName==='SELECT'&&(direction==='left'||direction==='right')){const delta=direction==='right'?1:-1,next=clamp(active.selectedIndex+delta,0,active.options.length-1);if(next!==active.selectedIndex){active.selectedIndex=next;active.dispatchEvent(new Event('change',{bubbles:true}))}return}
  const a=active.getBoundingClientRect(),ax=a.left+a.width/2,ay=a.top+a.height/2;let best=null,bestScore=Infinity;
  for(const el of items){if(el===active)continue;const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,dx=x-ax,dy=y-ay,valid=direction==='left'?dx<-6:direction==='right'?dx>6:direction==='up'?dy<-6:dy>6;if(!valid)continue;const primary=direction==='left'||direction==='right'?Math.abs(dx):Math.abs(dy),secondary=direction==='left'||direction==='right'?Math.abs(dy):Math.abs(dx),score=primary+secondary*2.2;if(score<bestScore){best=el;bestScore=score}}
  (best||items[(items.indexOf(active)+(direction==='left'||direction==='up'?-1:1)+items.length)%items.length]).focus?.();document.activeElement?.scrollIntoView?.({block:'nearest',inline:'nearest'});
}
function closeTopControllerLayer(){const open=[...document.querySelectorAll('dialog[open]')].pop();if(open){open.close();return}if(views.game.classList.contains('active')&&!session?.running){exitGame();return}if(document.activeElement&&document.activeElement!==document.body)document.activeElement.blur?.()}
function menuButtonEdge(pad,index){const key=`${pad.index}:${index}`,pressed=gamepadButtonPressed(pad,index),was=controllerMenuState.buttons.get(key)||false;controllerMenuState.buttons.set(key,pressed);return pressed&&!was}
function activateFocusedControllerItem(){const el=ensureControllerFocus();el?.click?.()}
function pollControllerMenus(t){
  const pads=activeGamepads();updateControllerStatus();
  if(!session?.running&&pads.length){
    const pad=pads[0],dir=gamepadDirections(pad),direction=dir.left?'left':dir.right?'right':dir.up?'up':dir.down?'down':'';
    if(direction&&(direction!==controllerMenuState.direction||t>=controllerMenuState.nextMoveAt)){focusMenuItem(direction);controllerMenuState.nextMoveAt=t+(direction===controllerMenuState.direction?150:320)}
    controllerMenuState.direction=direction;
    const bottomButton=menuButtonEdge(pad,0),rightButton=menuButtonEdge(pad,1),startButton=menuButtonEdge(pad,9),openDialog=document.querySelector('dialog[open]');
    if(bottomButton)activateFocusedControllerItem();
    if(rightButton){if(openDialog||views.game.classList.contains('active'))closeTopControllerLayer();else activateFocusedControllerItem()}
    if(startButton&&views.game.classList.contains('active')&&session)session.togglePause();
  }else{controllerMenuState.direction='';for(const pad of pads)for(const index of[0,1,9])controllerMenuState.buttons.set(`${pad.index}:${index}`,gamepadButtonPressed(pad,index))}
  requestAnimationFrame(pollControllerMenus);
}
updateControllerStatus();requestAnimationFrame(pollControllerMenus);
function installButtons(){return[qs('#installBtn'),qs('#launcherInstallBtn')].filter(Boolean)}
function isInstalledApp(){return window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true}
function isMobileBrowser(){return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
function isAppleMobileBrowser(){return /iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
function updateInstallButtons(){
  const installed=isInstalledApp(),show=!installed&&(isMobileBrowser()||!!deferredInstall);
  for(const button of installButtons()){button.classList.toggle('hidden',!show);button.textContent=deferredInstall?'Install Arcade App':isAppleMobileBrowser()?'Add to Home Screen':'Install / Add to Home Screen'}
}
function showManualInstallHelp(){
  const body=qs('#installHelpBody');if(!body||!installDialog)return;
  if(isAppleMobileBrowser())body.innerHTML='<ol class="install-steps"><li>Open this exact arcade address directly in Safari.</li><li>Tap the Safari <b>Share</b> button (square with an up arrow).</li><li>Scroll and choose <b>Add to Home Screen</b>.</li><li>Tap <b>Add</b>.</li></ol><p class="small">Apple devices do not use the automatic browser install popup, so these manual steps are always available.</p>';
  else if(/Android/i.test(navigator.userAgent))body.innerHTML='<ol class="install-steps"><li>Open the browser menu (usually ⋮).</li><li>Choose <b>Install app</b> or <b>Add to Home screen</b>.</li><li>Confirm the installation.</li></ol>';
  else body.innerHTML='<p>The automatic install prompt is not available right now. Use your browser menu and choose <b>Install app</b> or <b>Add to Home screen</b> when offered.</p>';
  openDialog(installDialog);
}
async function requestArcadeInstall(){
  if(isInstalledApp()){toast('The arcade is already running from the Home Screen');return}
  if(!deferredInstall){showManualInstallHelp();return}
  deferredInstall.prompt();const choice=await deferredInstall.userChoice;deferredInstall=null;updateInstallButtons();if(choice?.outcome==='accepted')toast('Arcade installation started')
}
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstall=event;updateInstallButtons()});
window.addEventListener('appinstalled',()=>{deferredInstall=null;updateInstallButtons();toast('Arcade installed')});
for(const button of installButtons())button.addEventListener('click',requestArcadeInstall);
window.addEventListener('pageshow',updateInstallButtons);updateInstallButtons();
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
function renderGames(){const a=account();if(!a)return;const q=qs('#searchInput').value.trim().toLowerCase(),cat=qs('#categorySelect').value||'All',fav=qs('#favoritesOnly').checked;let games=ARCADE_GAMES.filter(g=>(!q||(g.name+' '+g.description).toLowerCase().includes(q))&&(cat==='All'||g.category===cat)&&(!fav||a.favorites.includes(g.id)));qs('#gameCount').textContent=`${games.length} of ${ARCADE_GAMES.length} games`;const grid=qs('#gameGrid');grid.innerHTML='';for(const g of games){const card=document.createElement('article');card.className='game-card';card.tabIndex=0;card.dataset.gameId=g.id;const p=a.progress[g.id]||{};card.innerHTML=`<button class="favorite" aria-label="Favorite">${a.favorites.includes(g.id)?'★':'☆'}</button><div class="category-icon">${CATEGORY_ICONS[g.category]||'🎲'}</div><h3>${escapeHtml(g.name)} ${g.new?'<span class="new-badge">NEW</span>':''}${supportsMultipleModes(g)?'<span class="mode-badge">1P / 2P</span>':''}</h3><p>${escapeHtml(g.description)}</p><div class="meta"><span>${escapeHtml(g.category)}</span><span>${g.campaign&&g.levels>1?(p.level?`Level ${p.level}`:'New'):(p.wins?`${p.wins} win${p.wins===1?'':'s'}`:'New')}</span></div>`;card.querySelector('.favorite').onclick=e=>{e.stopPropagation();toggleFavorite(g.id)};card.onclick=()=>showDetails(g);grid.append(card)}}
function toggleFavorite(id){updateAccount(a=>{const i=a.favorites.indexOf(id);i>=0?a.favorites.splice(i,1):a.favorites.push(id)});renderGames()}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function objective(g){return g.objective||g.description}
function howTo(g){return g.howTo||`Use ${g.controls}. Follow the game-specific instructions and complete the displayed level target.`}
function supportsMultipleModes(g){return (Array.isArray(g.modes)&&g.modes.includes('1P')&&g.modes.includes('2P'))||MULTIMODE_ENGINES.has(g.engine)}
function showDetails(g){
  currentGame=g;const a=account(),p=a.progress[g.id]||{level:1,highScore:0,wins:0},multi=supportsMultipleModes(g),campaign=!!g.campaign&&g.levels>1;selectedGameMode=multi?'1P':(g.players===2?'2P':'1P');
  const blocked=multi&&!a.parental.multiplayer;
  const modeMarkup=multi?`<fieldset class="mode-picker"><legend>Choose players</legend><div class="mode-choice-row"><button type="button" class="mode-choice selected" data-game-mode="1P" aria-pressed="true"><b>1 Player</b><span>Play against the computer</span></button><button type="button" class="mode-choice" data-game-mode="2P" aria-pressed="false" ${blocked?'disabled':''}><b>2 Players</b><span>${blocked?'Blocked by Parental Controls':'Play together on this device'}</span></button></div><p id="selectedModeText" class="selected-mode-text">Selected: 1 Player</p></fieldset>`:'';
  const format=campaign?`${g.levels} levels`:(g.id==='drawing-studio'||g.id==='music-sequencer'?'Open-ended activity':'Single match');
  const progress=campaign?`Resume level ${Math.min(g.levels,p.level||1)} • High score ${p.highScore||0}`:`Wins ${p.wins||0} • High score ${p.highScore||0}`;
  const rewards=campaign?'1 AG Coin for each newly completed level and 5 bonus coins for completing the campaign.':'1 AG Coin for a win and a one-time 5-coin first-win bonus.';
  qs('#detailsContent').innerHTML=`<div style="font-size:3rem">${CATEGORY_ICONS[g.category]||'🎲'}</div><h2>${escapeHtml(g.name)}</h2><p><b>${escapeHtml(g.category)}</b> • ${format} • ${multi?'Single player or two players':g.players===2?'Two players':'One player'}</p>${modeMarkup}<div class="panel-card"><h3>Objective</h3><p>${escapeHtml(objective(g))}</p><h3>How to play</h3><p>${escapeHtml(howTo(g))}</p><h3>Controls</h3><p>${escapeHtml(g.controls)}. Compatible games accept direct taps and drags on the game area, like Dots and Boxes. Keyboard and gamepad controls still work on computers.</p><h3>Progress</h3><p>${progress}</p><p><b>Rewards:</b> ${rewards}</p></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button id="startNew" class="primary">${campaign?'Start New Game':'Start'}</button>${campaign?`<button id="resumeGame">Resume Level ${Math.min(g.levels,p.level||1)}</button>`:''}<button id="detailFavorite">${a.favorites.includes(g.id)?'Remove Favorite':'Add Favorite'}</button></div>`;
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

function isFinePointer(){return innerWidth>900&&matchMedia('(hover:hover) and (pointer:fine)').matches}
function toggleTouchControls(forceVisible){
  const dock=qs('#touchControls'),view=qs('#gameView');
  const currentlyHidden=dock.classList.contains('desktop-auto-hide')||dock.classList.contains('controls-hidden');
  const shouldShow=typeof forceVisible==='boolean'?forceVisible:currentlyHidden;
  dock.classList.remove('desktop-auto-hide');view.classList.remove('desktop-auto-hide');
  dock.classList.toggle('controls-hidden',!shouldShow);view.classList.toggle('controls-hidden',!shouldShow);
  qs('#controlsToggle').textContent=shouldShow?'Hide Touch Controls':'Show Touch Controls';
}
function configureControlDock(g){
  const dock=qs('#touchControls'),view=qs('#gameView');
  dock.className='touch-controls';view.classList.remove('desktop-auto-hide','controls-hidden');
  if((session?.mode||selectedGameMode)!=='2P')dock.classList.add('single-player');else dock.classList.add('multiplayer');
  if(POINTER_GAME_ENGINES.has(g.engine))dock.classList.add('pointer-game');
  if(isFinePointer()){dock.classList.add('desktop-auto-hide');view.classList.add('desktop-auto-hide');qs('#controlsToggle').textContent='Show Touch Controls'}else qs('#controlsToggle').textContent='Hide Touch Controls';
}
function startGame(g,level,mode=null){
  const a=account();if(!a)return;const campaign=!!g.campaign&&g.levels>1;level=campaign?clamp(Number(level)||1,1,g.levels):1;mode=mode||(g.players===2?'2P':'1P');if(mode==='2P'&&!a.parental.multiplayer)return toast('Multiplayer is blocked by Parental Controls');
  const d=todayDaily(a);d.plays++;a.stats.plays++;const prog=a.progress[g.id]||(a.progress[g.id]={level:1,completedLevels:[],highScore:0,finished:false,plays:0,wins:0});prog.plays++;saveDB(db);
  currentGame=g;showView('game');qs('#gameTitle').textContent=g.name;qs('#gameLevelText').textContent=campaign?`Level ${level} of ${g.levels}`:(g.id==='drawing-studio'||g.id==='music-sequencer'?'Creative Mode':'Single Match');selectedGameMode=mode;configureControlDock(g);
  qs('#gameInstructions').innerHTML=`<h3>${escapeHtml(g.name)} — Instructions</h3><p><b>Objective:</b> ${escapeHtml(objective(g))}</p><p><b>How to play:</b> ${escapeHtml(howTo(g))}</p><p><b>Computer controls:</b> ${escapeHtml(g.controls)}.</p><p><b>Touchscreen:</b> Use the fixed control dock at the bottom plus direct taps or drags on the game canvas where appropriate.</p><p><b>Gamepad:</b> Left stick/D-pad moves, A is the primary action, B is the secondary action, and Start pauses. Open Controller Setup from the lower-right button to detect or calibrate a Nintendo controller. For tap/drag games, use the L stick as a cursor and press the bottom face button, X, or the right trigger to click and drag.</p><p><b>Mode:</b> ${mode==='2P'?'Two players on this device':'Single player'}.</p><p><b>Game pace:</b> ${escapeHtml((a.settings.gamePace||'standard').replace(/^./,c=>c.toUpperCase()))}. Change it under Customize & Accessibility.</p><p><b>Rewards:</b> ${campaign?'1 AG Coin for each newly completed level and 5 bonus coins for finishing the campaign.':'1 AG Coin for a win and a one-time 5-coin first-win bonus.'}</p>`;
  session=new GameSession(g,level,mode);session.start();
}
function exitGame(){if(session){session.stop();session=null}showView('launcher');refreshHeader();renderGames()}
function completeLevel(score=0){
  if(!session||session.completed)return;session.completed=true;const g=session.game,level=session.level,campaign=!!g.campaign&&g.levels>1;
  updateAccount(a=>{const p=a.progress[g.id]||(a.progress[g.id]={level:1,completedLevels:[],highScore:0,finished:false,plays:0,wins:0});p.highScore=Math.max(p.highScore||0,Math.round(score));p.wins=Number(p.wins||0)+1;a.stats.wins=Number(a.stats.wins||0)+1;let reward=0;
    if(campaign){if(!p.completedLevels.includes(level)){p.completedLevels.push(level);a.coins+=1;a.xp+=25+level;a.stats.levels++;todayDaily(a).levels++;reward++}if(level>=g.levels&&!p.finished){p.finished=true;a.coins+=5;a.xp+=100;a.stats.completed++;reward+=5}p.level=level>=g.levels?g.level:level+1}
    else{a.coins+=1;a.xp+=20;reward=1;if(!p.finished){p.finished=true;a.coins+=5;a.xp+=75;a.stats.completed++;reward+=5}p.level=1}
    session.reward=reward});session.showResult(true,score)
}
function failLevel(score=0){if(!session||session.completed)return;session.completed=true;const g=session.game;if(g.campaign&&g.levels>1)updateAccount(a=>{const p=a.progress[g.id]||(a.progress[g.id]={level:1,completedLevels:[],highScore:0,finished:false,plays:0,wins:0});p.level=1});session.showResult(false,score)}

class GameSession{
  constructor(game,level,mode='1P'){
    this.game=game;this.level=level;this.mode=mode;this.canvas=qs('#gameCanvas');this.ctx=this.canvas.getContext('2d');this.keys=new Set();this.running=false;this.paused=false;this.completed=false;this.reward=0;this.last=0;this.elapsed=0;this.pointer={x:0,y:0,down:false};this.gamepadPointer={x:W/2,y:H/2,down:false,visible:false};this.pointerGame=POINTER_GAME_ENGINES.has(game.engine);this.gamepadKeys=new Set();this.prevGamepadButtons={};this.resultTimer=null;const userScale=({'very-slow':.78,relaxed:.9,standard:1,challenge:1.12}[account()?.settings.gamePace||'standard']||1);this.paceScale=userScale*(ENGINE_SPEED_SCALE[game.engine]||1);
    this.boundPointer=e=>this.handlePointer(e);this.boundPointerUp=e=>{this.pointer.down=false;this.engine.pointer?.(this.pointer,'pointerup');this.engine.pointerUp?.(this.pointer)};this.engine=createGameEngine(this);
  }
  start(){this.running=true;this.canvas.addEventListener('pointerdown',this.boundPointer);this.canvas.addEventListener('pointermove',this.boundPointer);window.addEventListener('pointerup',this.boundPointerUp);this.engine.init?.();this.last=performance.now();requestAnimationFrame(t=>this.loop(t))}
  stop(){clearTimeout(this.resultTimer);this.resultTimer=null;this.running=false;this.canvas.removeEventListener('pointerdown',this.boundPointer);this.canvas.removeEventListener('pointermove',this.boundPointer);window.removeEventListener('pointerup',this.boundPointerUp);for(const k of this.gamepadKeys)this.setKey(k,false);if(this.gamepadPointer.down)this.releaseGamepadPointer();this.engine.cleanup?.();qs('#gameOverlay').classList.add('hidden')}
  setKey(key,on){if(!on){this.keys.delete(key);this.engine.keyUp?.(key);return}if(!this.running||this.paused||this.completed)return;if(!this.keys.has(key))this.engine.keyDown?.(key);this.keys.add(key)}
  pressed(...keys){return keys.some(k=>this.keys.has(k))}
  handlePointer(e){if(!this.running||this.paused||this.completed)return;const r=this.canvas.getBoundingClientRect();this.pointer.x=(e.clientX-r.left)*this.canvas.width/r.width;this.pointer.y=(e.clientY-r.top)*this.canvas.height/r.height;this.pointer.id=e.pointerId;this.pointer.type=e.pointerType||'mouse';this.pointer.down=e.type==='pointerdown'||this.pointer.down;if(e.type==='pointerdown')this.canvas.setPointerCapture?.(e.pointerId);this.engine.pointer?.(this.pointer,e.type)}
  sendGamepadPointer(type){const p=this.gamepadPointer;this.pointer={x:p.x,y:p.y,down:p.down,type:'gamepad',id:'gamepad'};this.engine.pointer?.(this.pointer,type);if(type==='pointerup')this.engine.pointerUp?.(this.pointer)}
  releaseGamepadPointer(){if(!this.gamepadPointer.down)return;this.gamepadPointer.down=false;this.sendGamepadPointer('pointerup')}
  pollGamepadPointer(pad,dir){
    if(!pad||!this.pointerGame)return;const p=this.gamepadPointer,stick=dir||gamepadDirections(pad),rx=stick.x||(stick.left?-1:stick.right?1:0),ry=stick.y||(stick.up?-1:stick.down?1:0);
    if(rx||ry){p.visible=true;p.x=clamp(p.x+rx*12,0,W);p.y=clamp(p.y+ry*12,0,H);if(p.down)this.sendGamepadPointer('pointermove')}
    const click=gamepadButtonPressed(pad,0)||gamepadButtonPressed(pad,2)||Number(pad.buttons?.[7]?.value||0)>.45,old=!!this.prevGamepadButtons.pointerClick;
    if(click&&!old&&!this.paused&&!this.completed){p.visible=true;p.down=true;this.sendGamepadPointer('pointerdown')}
    if(!click&&old)this.releaseGamepadPointer();this.prevGamepadButtons.pointerClick=click;
  }
  drawGamepadPointer(){const p=this.gamepadPointer;if(!p.visible)return;const c=this.ctx;c.save();c.lineWidth=3;c.strokeStyle='#ffffff';c.fillStyle=p.down?'#ffdf5d':'#36ddff';c.beginPath();c.arc(p.x,p.y,p.down?11:9,0,Math.PI*2);c.fill();c.stroke();c.beginPath();c.moveTo(p.x-16,p.y);c.lineTo(p.x+16,p.y);c.moveTo(p.x,p.y-16);c.lineTo(p.x,p.y+16);c.stroke();c.restore()}
  pollGamepads(){
    if(this.completed||!this.running)return;
    const pads=activeGamepads();const desired=new Set();
    const addSet=(dir,keys)=>{if(dir.left)desired.add(keys.left);if(dir.right)desired.add(keys.right);if(dir.up)desired.add(keys.up);if(dir.down)desired.add(keys.down)};
    const addDirectionKeys=(dir,index)=>{
      if(this.mode!=='2P'){addSet(dir,{left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown'});addSet(dir,{left:'KeyA',right:'KeyD',up:'KeyW',down:'KeyS'});return}
      const pongSwap=this.game.engine==='pong';
      if((index===0&&!pongSwap)||(index===1&&pongSwap))addSet(dir,{left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown'});
      else addSet(dir,{left:'KeyA',right:'KeyD',up:'KeyW',down:'KeyS'});
    };
    const mapPad=(pad,index)=>{if(!pad)return null;const dir=gamepadDirections(pad);if(!(index===0&&this.pointerGame))addDirectionKeys(dir,index);if(!(index===0&&this.pointerGame)&&gamepadButtonPressed(pad,0))desired.add(index===0?'Space':'KeyF');if(gamepadButtonPressed(pad,1))desired.add(index===0?'Enter':'KeyG');const start=gamepadButtonPressed(pad,9),old=!!this.prevGamepadButtons[`${pad.index}:start`];if(start&&!old)this.togglePause();this.prevGamepadButtons[`${pad.index}:start`]=start;return dir};
    const p1dir=mapPad(pads[0],0);if(this.mode==='2P'&&pads[1])mapPad(pads[1],1);this.pollGamepadPointer(pads[0],p1dir);
    for(const k of this.gamepadKeys)if(!desired.has(k))this.setKey(k,false);for(const k of desired)if(!this.gamepadKeys.has(k))this.setKey(k,true);this.gamepadKeys=desired;
  }
  loop(t){if(!this.running)return;this.pollGamepads();const dt=Math.min(.04,(t-this.last)/1000||0);this.last=t;if(!this.paused&&!this.completed){const gameDt=dt*this.paceScale;this.elapsed+=gameDt;try{this.engine.update?.(gameDt)}catch(err){console.error(err);this.showError(err);return}}if(!this.running)return;try{this.engine.draw(this.ctx);this.drawGamepadPointer()}catch(err){console.error(err);this.showError(err);return}requestAnimationFrame(x=>this.loop(x))}
  togglePause(){if(this.completed)return;this.paused=!this.paused;const o=qs('#gameOverlay');if(this.paused){o.innerHTML=`<div class="overlay-card"><h2>Game Paused</h2><p>${escapeHtml(this.game.name)}</p><button id="resumeBtn" class="primary">Resume</button><button id="restartBtn">Restart Level</button><button id="quitBtn">Return to Launcher</button></div>`;o.classList.remove('hidden');qs('#resumeBtn').onclick=()=>this.togglePause();qs('#restartBtn').onclick=()=>{const g=this.game,l=this.level,mode=this.mode;this.stop();session=new GameSession(g,l,mode);session.start()};qs('#quitBtn').onclick=exitGame}else o.classList.add('hidden')}
  showResult(win,score){this.running=false;this.keys.clear();this.gamepadKeys.clear();this.pointer.down=false;const campaign=!!this.game.campaign&&this.game.levels>1,o=qs('#gameOverlay'),next=campaign&&this.level<this.game.levels,title=win?(campaign?'Level Complete!':'Match Complete!'):(campaign?'Campaign Restart':'Try Again');o.innerHTML=`<div class="overlay-card"><h2>${title}</h2><p>Score: ${Math.round(score)}</p>${win?'':`<p>${campaign?'You lost. Restarting at Level 1.':'Restarting the match'} automatically.</p>`}${win?`<p>AG Coins earned: ${this.reward}</p>`:''}<button id="resultMain" class="primary">${win&&next?'Next Level':win?(campaign?'Replay Level':'Play Again'):(campaign?'Restart at Level 1':'Restart Now')}</button><button id="resultLauncher">Return to Launcher</button></div>`;o.classList.remove('hidden');const restart=()=>{const g=this.game,l=win?(next?this.level+1:this.level):(campaign?1:this.level),mode=this.mode;this.stop();session=new GameSession(g,l,mode);qs('#gameLevelText').textContent=campaign?`Level ${l} of ${g.levels}`:(g.id==='drawing-studio'||g.id==='music-sequencer'?'Creative Mode':'Single Match');selectedGameMode=mode;configureControlDock(g);session.start()};qs('#resultMain').onclick=restart;qs('#resultLauncher').onclick=exitGame;if(!win)this.resultTimer=setTimeout(()=>{if(session===this&&this.completed)restart()},2200)}
  showError(err){this.running=false;const o=qs('#gameOverlay');o.innerHTML=`<div class="overlay-card"><h2>Game Error</h2><p>${escapeHtml(err.message||String(err))}</p><button id="errorBack">Return to Launcher</button></div>`;o.classList.remove('hidden');qs('#errorBack').onclick=exitGame}
}

async function syncGameCatalog(){
  try{const response=await fetch('./games.json?v=11.3',{cache:'no-store'});if(!response.ok)return;const fresh=await response.json();if(!Array.isArray(fresh)||!fresh.length)return;const current=JSON.stringify(ARCADE_GAMES.map(g=>[g.id,g.name,g.engine,g.controls]));const next=JSON.stringify(fresh.map(g=>[g.id,g.name,g.engine,g.controls]));if(current!==next){ARCADE_GAMES.splice(0,ARCADE_GAMES.length,...fresh);if(activeAccountId){const selected=qs('#categorySelect').value;qs('#categorySelect').innerHTML='';renderLauncher();if([...qs('#categorySelect').options].some(o=>o.value===selected))qs('#categorySelect').value=selected;renderGames()}toast('The unique game catalog was refreshed')}}catch(error){console.warn('Catalog refresh skipped',error)}
}
if('serviceWorker'in navigator)window.addEventListener('load',async()=>{
  const logo=qs('#mainLogo');if(logo&&!logo.complete)logo.addEventListener('error',()=>logo.src='./icon-512.png?v=11.3',{once:true});
  try{const registration=await navigator.serviceWorker.register('./service-worker.js?v=11.3');await registration.update();let refreshing=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(refreshing)return;refreshing=true;location.reload()})}catch(error){console.warn(error)}
  syncGameCatalog();
});
window.addEventListener('error',e=>{console.error(e.error||e.message);try{localStorage.setItem('asArcadeLastError',JSON.stringify({time:new Date().toISOString(),message:e.message,stack:e.error?.stack||''}))}catch{}});
refreshAuth();if(db.active&&db.accounts.some(a=>a.id===db.active&&a.enabled)){activeAccountId=db.active;refreshHeader();renderLauncher();showView('launcher')}else showView('auth');
