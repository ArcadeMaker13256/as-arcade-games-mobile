'use strict';

const APP_VERSION='8.0-web';
const DB_KEY='asArcadeMobileDB';
const AVATARS=AVATAR_PRESETS.map(p=>p.id);
const THEMES=['neon','sunset','forest','royal','sky','candy'];
const WALLPAPERS=['none','grid','stars','candy'];
const BANNERS=['Arcade Explorer','High Score Hero','Puzzle Master','Racing Champion','Creative Star','Family Game Night','Adventure Ace','Strategy Captain'];
const CATEGORY_ICONS={Arcade:'🕹️',Adventure:'🗺️',Puzzle:'🧩',Strategy:'♟️',Sports:'🏆',Shooter:'🚀',Word:'🔤',Learning:'📚',Creative:'🎨',Casual:'🎯',Racing:'🏁',Multiplayer:'👥',Simulation:'⚙️',Cards:'🃏'};
const STORE={
  themes:THEMES.map((name,i)=>({name,cost:i<2?0:80+i*15})),
  wallpapers:WALLPAPERS.map((name,i)=>({name,cost:i===0?0:70+i*20})),
  banners:BANNERS.map((name,i)=>({name,cost:i===0?0:60+i*15})),
  avatars:AVATAR_PRESETS.map((preset,i)=>({name:preset.id,label:preset.name,cost:i<4?0:70+i*15}))
};
const ACHIEVEMENTS=[
  ['First Steps','Play your first game',a=>a.stats.plays>=1],
  ['Level Learner','Complete 10 levels',a=>a.stats.levels>=10],
  ['Arcade Regular','Play 25 different games',a=>Object.keys(a.progress).length>=25],
  ['Coin Collector','Own 100 AG Coins',a=>a.coins>=100],
  ['Game Finisher','Complete a game',a=>a.stats.completed>=1],
  ['Century Club','Complete 100 levels',a=>a.stats.levels>=100],
  ['Family Champion','Win 10 games',a=>a.stats.wins>=10],
  ['Arcade Legend','Reach level 20',a=>levelFromXp(a.xp)>=20]
];
const qs=s=>document.querySelector(s);const qsa=s=>[...document.querySelectorAll(s)];
const views={auth:qs('#authView'),launcher:qs('#launcherView'),game:qs('#gameView')};
const detailsDialog=qs('#detailsDialog'),panelDialog=qs('#panelDialog'),accountDialog=qs('#accountDialog');
let deferredInstall=null;let currentGame=null;let session=null;let activeAccountId=null;

function defaultDB(){return{version:1,adminHash:'',active:null,accounts:[]}}
function loadDB(){try{const d=JSON.parse(localStorage.getItem(DB_KEY));return d&&Array.isArray(d.accounts)?d:defaultDB()}catch{return defaultDB()}}
function migrateDB(d){
  let changed=false;d.version=2;
  for(const a of d.accounts){
    const normalized=normalizeAvatar(a.avatar);if(JSON.stringify(normalized)!==JSON.stringify(a.avatar)){a.avatar=normalized;changed=true}
    a.unlocks=a.unlocks||{};a.unlocks.avatars=Array.isArray(a.unlocks.avatars)?a.unlocks.avatars.filter(x=>AVATARS.includes(x)):AVATARS.slice(0,4);
    if(!a.unlocks.avatars.length)a.unlocks.avatars=AVATARS.slice(0,4);
    a.settings=a.settings||{};
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
function newAccount(username,displayName,pinHash,type,avatar){return{id:uid(),username,displayName:displayName||username,pinHash,type,enabled:true,avatar:normalizeAvatar(avatar),coins:20,xp:0,banner:BANNERS[0],settings:{theme:'neon',wallpaper:'stars',reducedMotion:false,highContrast:false,sound:true},unlocks:{themes:['neon','sunset'],wallpapers:['none','stars'],banners:[BANNERS[0]],avatars:AVATARS.slice(0,4)},favorites:[],progress:{},achievements:[],stats:{plays:0,levels:0,completed:0,wins:0,seconds:0},daily:{date:'',plays:0,levels:0,claimed:false},parental:{minutes:0,multiplayer:true,spending:true,categories:[],external:false},createdAt:Date.now()}}
function levelFromXp(xp){return Math.max(1,Math.floor(Math.sqrt(Math.max(0,xp)/80))+1)}
function xpForNext(level){return level*level*80}
function toast(text){const el=qs('#toast');el.textContent=text;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2500)}
function showView(name){Object.values(views).forEach(v=>v.classList.remove('active'));views[name].classList.add('active');window.scrollTo(0,0)}
function openDialog(dialog){dialog.showModal()}
function closeDialogs(){qsa('dialog[open]').forEach(d=>d.close())}
qsa('.close-dialog').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));

function applyTheme(){const a=account();document.body.className='';if(!a)return;document.body.classList.add(`theme-${a.settings.theme}`,`wallpaper-${a.settings.wallpaper}`);if(a.settings.highContrast)document.body.classList.add('high-contrast');if(a.settings.reducedMotion)document.body.classList.add('reduced-motion')}
function refreshAuth(){const sel=qs('#accountSelect');sel.innerHTML='';db.accounts.filter(a=>a.enabled).forEach(a=>sel.add(new Option(`${a.displayName} — ${avatarLabel(a.avatar)}`,a.id)));if(!sel.options.length)sel.add(new Option('Create an account first',''));qs('#loginPin').value='';refreshLoginAvatarPreview()}
function refreshLoginAvatarPreview(){const selected=db.accounts.find(a=>a.id===qs('#accountSelect').value&&a.enabled);qs('#loginAvatarPreview').innerHTML=avatarSVG(selected?selected.avatar:defaultAvatarConfig(),108)}
function refreshHeader(){const a=account();if(!a)return;qs('#avatarButton').innerHTML=avatarSVG(a.avatar,58);qs('#welcomeText').textContent=`Welcome, ${a.displayName}`;qs('#bannerText').textContent=a.banner;qs('#levelText').textContent=levelFromXp(a.xp);qs('#xpText').textContent=a.xp;qs('#coinText').textContent=a.coins;applyTheme();const d=todayDaily(a);qs('#dailySummary').textContent=`Daily: ${d.plays}/3 games • ${d.levels}/2 levels`}
function refreshAchievements(a){let changed=false;for(const [name,,test] of ACHIEVEMENTS){if(test(a)&&!a.achievements.includes(name)){a.achievements.push(name);a.xp+=50;changed=true;toast(`🏆 Achievement unlocked: ${name}`)}}if(changed)saveDB(db)}
function todayKey(){return new Date().toISOString().slice(0,10)}
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
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;qs('#installBtn').classList.remove('hidden')});
qs('#installBtn').addEventListener('click',async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;qs('#installBtn').classList.add('hidden')});

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
function renderGames(){const a=account();if(!a)return;const q=qs('#searchInput').value.trim().toLowerCase(),cat=qs('#categorySelect').value||'All',fav=qs('#favoritesOnly').checked;let games=ARCADE_GAMES.filter(g=>(!q||(g.name+' '+g.description).toLowerCase().includes(q))&&(cat==='All'||g.category===cat)&&(!fav||a.favorites.includes(g.id)));qs('#gameCount').textContent=`${games.length} of ${ARCADE_GAMES.length} games`;const grid=qs('#gameGrid');grid.innerHTML='';for(const g of games){const card=document.createElement('article');card.className='game-card';card.dataset.gameId=g.id;const p=a.progress[g.id]||{};card.innerHTML=`<button class="favorite" aria-label="Favorite">${a.favorites.includes(g.id)?'★':'☆'}</button><div class="category-icon">${CATEGORY_ICONS[g.category]||'🎲'}</div><h3>${escapeHtml(g.name)} ${g.new?'<span class="new-badge">NEW</span>':''}</h3><p>${escapeHtml(g.description)}</p><div class="meta"><span>${escapeHtml(g.category)}</span><span>${p.level?`Level ${p.level}`:'New'}</span></div>`;card.querySelector('.favorite').onclick=e=>{e.stopPropagation();toggleFavorite(g.id)};card.onclick=()=>showDetails(g);grid.append(card)}}
function toggleFavorite(id){updateAccount(a=>{const i=a.favorites.indexOf(id);i>=0?a.favorites.splice(i,1):a.favorites.push(id)});renderGames()}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function objective(g){return g.objective||g.description}
function howTo(g){return `Use ${g.controls}. Follow the game-specific instructions and complete the displayed level target.`}
function showDetails(g){currentGame=g;const a=account(),p=a.progress[g.id]||{level:1,highScore:0};qs('#detailsContent').innerHTML=`<div style="font-size:3rem">${CATEGORY_ICONS[g.category]||'🎲'}</div><h2>${escapeHtml(g.name)}</h2><p><b>${escapeHtml(g.category)}</b> • ${g.levels} levels • ${g.players===2?'Two players':'One player'}</p><div class="panel-card"><h3>Objective</h3><p>${escapeHtml(objective(g))}</p><h3>How to play</h3><p>${escapeHtml(howTo(g))}</p><h3>Controls</h3><p>${escapeHtml(g.controls)}. Touch controls stay at the bottom on phones and tablets; keyboard and gamepad controls also work on computers.</p><h3>Progress</h3><p>Resume level ${p.level||1} • High score ${p.highScore||0}</p><p><b>Rewards:</b> 1 AG Coin for each new level and 5 bonus coins for completing the game.</p></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button id="startNew" class="primary">Start New Game</button><button id="resumeGame">Resume Level ${p.level||1}</button><button id="detailFavorite">${a.favorites.includes(g.id)?'Remove Favorite':'Add Favorite'}</button></div>`;openDialog(detailsDialog);qs('#startNew').onclick=()=>{detailsDialog.close();startGame(g,1)};qs('#resumeGame').onclick=()=>{detailsDialog.close();startGame(g,p.level||1)};qs('#detailFavorite').onclick=()=>{toggleFavorite(g.id);detailsDialog.close()}}

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
  out.innerHTML=`<h2>Customize & Accessibility</h2><p class="update-notice">Your avatar is now a layered, original 3D-style character instead of a single emoji.</p><div class="avatar-studio-layout"><div><div id="settingsAvatarPreview" class="avatar-preview-large">${avatarSVG(a.avatar,164)}</div><div class="avatar-actions"><button id="randomizeAvatar">Surprise Me</button></div></div><div id="settingsAvatarControls" class="avatar-control-grid">${avatarControlMarkup('settings-avatar',a.avatar)}</div></div><h3>Quick Avatar Presets</h3><div class="avatar-preset-grid">${a.unlocks.avatars.map(id=>{const p=avatarPreset(id);return`<button class="avatar-preset" data-avatar-preset="${id}">${avatarSVG(p.config,76)}<span>${escapeHtml(p.name)}</span></button>`}).join('')}</div><label>Theme<select id="themeSetting">${a.unlocks.themes.map(x=>`<option ${x===a.settings.theme?'selected':''}>${x}</option>`).join('')}</select></label><label>Wallpaper<select id="wallpaperSetting">${a.unlocks.wallpapers.map(x=>`<option ${x===a.settings.wallpaper?'selected':''}>${x}</option>`).join('')}</select></label><label>Banner<select id="bannerSetting">${a.unlocks.banners.map(x=>`<option ${x===a.banner?'selected':''}>${x}</option>`).join('')}</select></label><label class="check"><input id="contrastSetting" type="checkbox" ${a.settings.highContrast?'checked':''}> High contrast</label><label class="check"><input id="motionSetting" type="checkbox" ${a.settings.reducedMotion?'checked':''}> Reduced motion</label><button id="saveSettings" class="primary">Save Changes</button>`;
  const controls=qs('#settingsAvatarControls'),preview=qs('#settingsAvatarPreview');
  const redraw=()=>preview.innerHTML=avatarSVG(readAvatarControls(controls),164);
  controls.querySelectorAll('select').forEach(el=>el.addEventListener('change',redraw));
  qs('#randomizeAvatar').onclick=()=>{controls.innerHTML=avatarControlMarkup('settings-avatar',randomAvatarConfig());controls.querySelectorAll('select').forEach(el=>el.addEventListener('change',redraw));redraw()};
  out.querySelectorAll('[data-avatar-preset]').forEach(btn=>btn.onclick=()=>{controls.innerHTML=avatarControlMarkup('settings-avatar',avatarPreset(btn.dataset.avatarPreset).config);controls.querySelectorAll('select').forEach(el=>el.addEventListener('change',redraw));redraw()});
  qs('#saveSettings').onclick=()=>{updateAccount(x=>{x.settings.theme=qs('#themeSetting').value;x.settings.wallpaper=qs('#wallpaperSetting').value;x.banner=qs('#bannerSetting').value;x.avatar=readAvatarControls(controls);x.settings.highContrast=qs('#contrastSetting').checked;x.settings.reducedMotion=qs('#motionSetting').checked});panelDialog.close();renderGames();toast('Customization saved')}
}

async function openParentalControls(fromAuth){const pin=prompt(db.adminHash?'Enter the Parental Controls administrator PIN':'Create a Parental Controls administrator PIN (4+ characters)');if(pin===null)return;if(pin.length<4)return toast('Administrator PIN needs at least 4 characters');const h=await hashText(pin);if(!db.adminHash){db.adminHash=h;saveDB(db);toast('Administrator PIN created')}else if(h!==db.adminHash)return toast('Incorrect administrator PIN');renderParentPanel(qs('#panelContent'));openDialog(panelDialog)}
function renderParentPanel(out){out.innerHTML=`<h2>Parental Controls</h2><p>Manage accounts without knowing the player's PIN. Existing PINs cannot be displayed, but they can be reset.</p><div class="panel-grid">${db.accounts.map(a=>`<div class="panel-card" data-account="${a.id}"><div class="profile-card-heading"><span class="avatar-mini">${avatarSVG(a.avatar,46)}</span><h3>${escapeHtml(a.displayName)}</h3></div><p>${a.type} • ${a.enabled?'Enabled':'Disabled'}</p><label>Daily minutes<input class="limit" type="number" min="0" value="${a.parental.minutes}"></label><label class="check"><input class="multi" type="checkbox" ${a.parental.multiplayer?'checked':''}> Multiplayer allowed</label><label class="check"><input class="spend" type="checkbox" ${a.parental.spending?'checked':''}> AG Coin spending</label><button class="save-parent">Save</button><button class="reset-pin">Reset Player PIN</button><button class="toggle-account">${a.enabled?'Disable':'Enable'} Account</button></div>`).join('')}</div>`;out.querySelectorAll('[data-account]').forEach(card=>{const a=db.accounts.find(x=>x.id===card.dataset.account);card.querySelector('.save-parent').onclick=()=>{a.parental.minutes=Math.max(0,+card.querySelector('.limit').value||0);a.parental.multiplayer=card.querySelector('.multi').checked;a.parental.spending=card.querySelector('.spend').checked;saveDB(db);toast('Parental controls saved')};card.querySelector('.toggle-account').onclick=()=>{a.enabled=!a.enabled;saveDB(db);renderParentPanel(out);refreshAuth()};card.querySelector('.reset-pin').onclick=async()=>{const p=prompt(`Enter a new PIN for ${a.displayName}`);if(p&&p.length>=4){a.pinHash=await hashText(p);saveDB(db);toast('Player PIN reset')}}})}

function isFinePointer(){return innerWidth>900&&matchMedia('(hover:hover) and (pointer:fine)').matches}
function toggleTouchControls(force){
  const dock=qs('#touchControls'),view=qs('#gameView');
  const hide=typeof force==='boolean'?!force:dock.classList.contains('desktop-auto-hide')||dock.classList.contains('controls-hidden');
  dock.classList.toggle('desktop-auto-hide',!hide&&isFinePointer());dock.classList.toggle('controls-hidden',false);
  view.classList.toggle('desktop-auto-hide',!hide&&isFinePointer());view.classList.toggle('controls-hidden',false);
  if(hide){dock.classList.remove('desktop-auto-hide','controls-hidden');view.classList.remove('desktop-auto-hide','controls-hidden')}
  qs('#controlsToggle').textContent=dock.offsetParent===null?'Show Touch Controls':'Hide Touch Controls';
}
function configureControlDock(g){
  const dock=qs('#touchControls'),view=qs('#gameView');
  dock.className='touch-controls';view.classList.remove('desktop-auto-hide','controls-hidden');
  if(g.players!==2)dock.classList.add('single-player');
  if(['memory','lights','mines','sudoku','tictactoe','connect4','reversi','checkers','battleship','whack','bubble','basketball','archery','golf','drawing','trivia','towerdefense'].includes(g.engine))dock.classList.add('pointer-game');
  if(isFinePointer()){dock.classList.add('desktop-auto-hide');view.classList.add('desktop-auto-hide');qs('#controlsToggle').textContent='Show Touch Controls'}else qs('#controlsToggle').textContent='Hide Touch Controls';
}
function startGame(g,level){
  const a=account();if(!a)return;if(g.players===2&&!a.parental.multiplayer)return toast('Multiplayer is blocked by Parental Controls');
  const d=todayDaily(a);d.plays++;a.stats.plays++;const prog=a.progress[g.id]||(a.progress[g.id]={level:1,completedLevels:[],highScore:0,finished:false,plays:0});prog.plays++;saveDB(db);
  currentGame=g;showView('game');qs('#gameTitle').textContent=g.name;qs('#gameLevelText').textContent=`Level ${level} of ${g.levels}`;configureControlDock(g);
  qs('#gameInstructions').innerHTML=`<h3>${escapeHtml(g.name)} — Instructions</h3><p><b>Objective:</b> ${escapeHtml(objective(g))}</p><p><b>How to play:</b> ${escapeHtml(howTo(g))}</p><p><b>Computer controls:</b> ${escapeHtml(g.controls)}.</p><p><b>Touchscreen:</b> Use the fixed control dock at the bottom plus direct taps or drags on the game canvas where appropriate.</p><p><b>Gamepad:</b> Left stick/D-pad moves, A is the primary action, B is the secondary action, and Start pauses.</p><p><b>Rewards:</b> 1 AG Coin for each newly completed level and 5 bonus coins for finishing the game.</p>`;
  session=new GameSession(g,level);session.start();
}
function exitGame(){if(session){session.stop();session=null}showView('launcher');refreshHeader();renderGames()}
function completeLevel(score=0){if(!session||session.completed)return;session.completed=true;const g=session.game,level=session.level;updateAccount(a=>{const p=a.progress[g.id]||(a.progress[g.id]={level:1,completedLevels:[],highScore:0,finished:false,plays:0});p.highScore=Math.max(p.highScore||0,Math.round(score));let reward=0;if(!p.completedLevels.includes(level)){p.completedLevels.push(level);a.coins+=1;a.xp+=25+level;a.stats.levels++;todayDaily(a).levels++;reward++}if(level>=g.levels&&!p.finished){p.finished=true;a.coins+=5;a.xp+=100;a.stats.completed++;a.stats.wins++;reward+=5}p.level=level>=g.levels?g.level:level+1;session.reward=reward});session.showResult(true,score)}
function failLevel(score=0){if(!session||session.completed)return;session.completed=true;session.showResult(false,score)}

class GameSession{
  constructor(game,level){
    this.game=game;this.level=level;this.canvas=qs('#gameCanvas');this.ctx=this.canvas.getContext('2d');this.keys=new Set();this.running=false;this.paused=false;this.completed=false;this.reward=0;this.last=0;this.elapsed=0;this.pointer={x:0,y:0,down:false};this.gamepadKeys=new Set();this.prevGamepadButtons={};
    this.boundPointer=e=>this.handlePointer(e);this.boundPointerUp=e=>{this.pointer.down=false;this.engine.pointer?.(this.pointer,'pointerup');this.engine.pointerUp?.(this.pointer)};this.engine=createGameEngine(this);
  }
  start(){this.running=true;this.canvas.addEventListener('pointerdown',this.boundPointer);this.canvas.addEventListener('pointermove',this.boundPointer);window.addEventListener('pointerup',this.boundPointerUp);this.engine.init?.();this.last=performance.now();requestAnimationFrame(t=>this.loop(t))}
  stop(){this.running=false;this.canvas.removeEventListener('pointerdown',this.boundPointer);this.canvas.removeEventListener('pointermove',this.boundPointer);window.removeEventListener('pointerup',this.boundPointerUp);for(const k of this.gamepadKeys)this.setKey(k,false);this.engine.cleanup?.();qs('#gameOverlay').classList.add('hidden')}
  setKey(key,on){if(on){if(!this.keys.has(key))this.engine.keyDown?.(key);this.keys.add(key)}else{this.keys.delete(key);this.engine.keyUp?.(key)}}
  pressed(...keys){return keys.some(k=>this.keys.has(k))}
  handlePointer(e){const r=this.canvas.getBoundingClientRect();this.pointer.x=(e.clientX-r.left)*this.canvas.width/r.width;this.pointer.y=(e.clientY-r.top)*this.canvas.height/r.height;this.pointer.down=e.type==='pointerdown'||this.pointer.down;this.engine.pointer?.(this.pointer,e.type)}
  pollGamepads(){
    const pads=navigator.getGamepads?.()||[];const desired=new Set();
    const mapPad=(pad,index)=>{if(!pad)return;const left=index===0?'ArrowLeft':'KeyA',right=index===0?'ArrowRight':'KeyD',up=index===0?'ArrowUp':'KeyW',down=index===0?'ArrowDown':'KeyS',a=index===0?'Space':'KeyF',b=index===0?'Enter':'KeyG';const ax=pad.axes[0]||0,ay=pad.axes[1]||0;if(ax<-.35||pad.buttons[14]?.pressed)desired.add(left);if(ax>.35||pad.buttons[15]?.pressed)desired.add(right);if(ay<-.35||pad.buttons[12]?.pressed)desired.add(up);if(ay>.35||pad.buttons[13]?.pressed)desired.add(down);if(pad.buttons[0]?.pressed)desired.add(a);if(pad.buttons[1]?.pressed)desired.add(b);const start=!!pad.buttons[9]?.pressed,old=!!this.prevGamepadButtons[`${index}:start`];if(start&&!old)this.togglePause();this.prevGamepadButtons[`${index}:start`]=start};
    mapPad(pads[0],0);if(this.game.players===2)mapPad(pads[1]||pads[0],1);
    for(const k of this.gamepadKeys)if(!desired.has(k))this.setKey(k,false);for(const k of desired)if(!this.gamepadKeys.has(k))this.setKey(k,true);this.gamepadKeys=desired;
  }
  loop(t){if(!this.running)return;this.pollGamepads();const dt=Math.min(.04,(t-this.last)/1000||0);this.last=t;if(!this.paused&&!this.completed){this.elapsed+=dt;try{this.engine.update?.(dt)}catch(err){console.error(err);this.showError(err);return}}try{this.engine.draw(this.ctx)}catch(err){console.error(err);this.showError(err);return}requestAnimationFrame(x=>this.loop(x))}
  togglePause(){if(this.completed)return;this.paused=!this.paused;const o=qs('#gameOverlay');if(this.paused){o.innerHTML=`<div class="overlay-card"><h2>Game Paused</h2><p>${escapeHtml(this.game.name)}</p><button id="resumeBtn" class="primary">Resume</button><button id="restartBtn">Restart Level</button><button id="quitBtn">Return to Launcher</button></div>`;o.classList.remove('hidden');qs('#resumeBtn').onclick=()=>this.togglePause();qs('#restartBtn').onclick=()=>{const g=this.game,l=this.level;this.stop();session=new GameSession(g,l);session.start()};qs('#quitBtn').onclick=exitGame}else o.classList.add('hidden')}
  showResult(win,score){const o=qs('#gameOverlay'),next=this.level<this.game.levels,title=win?'Level Complete!':'Try Again';o.innerHTML=`<div class="overlay-card"><h2>${title}</h2><p>Score: ${Math.round(score)}</p>${win?`<p>AG Coins earned: ${this.reward}</p>`:''}<button id="resultMain" class="primary">${win&&next?'Next Level':'Play Again'}</button><button id="resultLauncher">Return to Launcher</button></div>`;o.classList.remove('hidden');qs('#resultMain').onclick=()=>{const g=this.game,l=win&&next?this.level+1:this.level;this.stop();session=new GameSession(g,l);qs('#gameLevelText').textContent=`Level ${l} of ${g.levels}`;session.start()};qs('#resultLauncher').onclick=exitGame}
  showError(err){this.running=false;const o=qs('#gameOverlay');o.innerHTML=`<div class="overlay-card"><h2>Game Error</h2><p>${escapeHtml(err.message||String(err))}</p><button id="errorBack">Return to Launcher</button></div>`;o.classList.remove('hidden');qs('#errorBack').onclick=exitGame}
}

async function syncGameCatalog(){
  try{const response=await fetch('./games.json?v=8.0',{cache:'no-store'});if(!response.ok)return;const fresh=await response.json();if(!Array.isArray(fresh)||!fresh.length)return;const current=JSON.stringify(ARCADE_GAMES.map(g=>[g.id,g.name,g.engine,g.controls]));const next=JSON.stringify(fresh.map(g=>[g.id,g.name,g.engine,g.controls]));if(current!==next){ARCADE_GAMES.splice(0,ARCADE_GAMES.length,...fresh);if(activeAccountId){const selected=qs('#categorySelect').value;qs('#categorySelect').innerHTML='';renderLauncher();if([...qs('#categorySelect').options].some(o=>o.value===selected))qs('#categorySelect').value=selected;renderGames()}toast('The unique game catalog was refreshed')}}catch(error){console.warn('Catalog refresh skipped',error)}
}
if('serviceWorker'in navigator)window.addEventListener('load',async()=>{
  const logo=qs('#mainLogo');if(logo&&!logo.complete)logo.addEventListener('error',()=>logo.src='./icons/icon-512.png?v=8.0',{once:true});
  try{const registration=await navigator.serviceWorker.register('./service-worker.js?v=8.0');await registration.update();let refreshing=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(refreshing)return;refreshing=true;location.reload()})}catch(error){console.warn(error)}
  syncGameCatalog();
});
window.addEventListener('error',e=>{console.error(e.error||e.message);try{localStorage.setItem('asArcadeLastError',JSON.stringify({time:new Date().toISOString(),message:e.message,stack:e.error?.stack||''}))}catch{}});
refreshAuth();if(db.active&&db.accounts.some(a=>a.id===db.active&&a.enabled)){activeAccountId=db.active;refreshHeader();renderLauncher();showView('launcher')}else showView('auth');
