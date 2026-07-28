'use strict';

const AVATAR_SKINS=['#F6D2B8','#E8B28E','#D58C63','#B96E47','#8B4B2F','#5E321F'];
const AVATAR_HAIR_COLORS=['#24170F','#4B2B1B','#7A4A27','#B8763D','#E7C16E','#151A2C','#B73A55','#6A4EC4'];
const AVATAR_SHIRT_COLORS=['#38D5FF','#FF5C8A','#7B6CFF','#45D58C','#FFD05C','#FF914D','#26396B','#F5F7FF'];
const AVATAR_BACKGROUNDS=['#203A73','#713D91','#1F6A64','#A34863','#8A6224','#27304D','#6A3B2E','#274F80'];
const AVATAR_OPTIONS={
  skin:['Light','Warm','Tan','Brown','Deep','Dark'],
  face:['Round','Oval','Soft square','Heart'],
  hair:['Short','Side sweep','Curly','Long','Ponytail','Twin buns','Fade','Spiky'],
  hairColor:['Black','Brown','Chestnut','Copper','Blonde','Midnight','Rose','Purple'],
  eyes:['Classic','Happy','Bright','Calm'],
  brows:['Soft','Arched','Straight','Bold'],
  mouth:['Smile','Open smile','Neutral','Grin'],
  shirt:['Arcade tee','Hoodie','Jacket','Sport top'],
  shirtColor:['Cyan','Pink','Purple','Green','Gold','Orange','Navy','White'],
  accessory:['None','Glasses','Headphones','Cap','Crown','Bow','Star clip','Gaming headset'],
  background:['Blue','Purple','Teal','Rose','Gold','Slate','Copper','Ocean']
};
const AVATAR_PRESETS=[
  {id:'arcade-blue',name:'Arcade Blue',config:{skin:1,face:0,hair:0,hairColor:0,eyes:0,brows:0,mouth:0,shirt:0,shirtColor:0,accessory:0,background:0}},
  {id:'sunset-style',name:'Sunset Style',config:{skin:2,face:1,hair:3,hairColor:2,eyes:2,brows:1,mouth:1,shirt:1,shirtColor:1,accessory:6,background:3}},
  {id:'sport-star',name:'Sport Star',config:{skin:3,face:2,hair:6,hairColor:0,eyes:0,brows:3,mouth:3,shirt:3,shirtColor:4,accessory:3,background:4}},
  {id:'creative-wave',name:'Creative Wave',config:{skin:0,face:3,hair:4,hairColor:6,eyes:1,brows:0,mouth:0,shirt:2,shirtColor:2,accessory:5,background:1}},
  {id:'tech-hero',name:'Tech Hero',config:{skin:4,face:1,hair:7,hairColor:5,eyes:3,brows:2,mouth:0,shirt:2,shirtColor:6,accessory:7,background:5}},
  {id:'royal-player',name:'Royal Player',config:{skin:1,face:0,hair:5,hairColor:3,eyes:2,brows:1,mouth:1,shirt:0,shirtColor:7,accessory:4,background:1}},
  {id:'forest-friend',name:'Forest Friend',config:{skin:2,face:0,hair:2,hairColor:1,eyes:1,brows:0,mouth:0,shirt:1,shirtColor:3,accessory:0,background:2}},
  {id:'night-gamer',name:'Night Gamer',config:{skin:5,face:2,hair:1,hairColor:5,eyes:0,brows:3,mouth:3,shirt:0,shirtColor:2,accessory:2,background:7}}
];

function cloneAvatar(value){return JSON.parse(JSON.stringify(value));}
function defaultAvatarConfig(){return cloneAvatar(AVATAR_PRESETS[0].config);}
function avatarPreset(id){return AVATAR_PRESETS.find(p=>p.id===id)||AVATAR_PRESETS[0];}
function findAvatarPreset(id){return AVATAR_PRESETS.find(p=>p.id===id)||null;}
function normalizeAvatar(value){
  if(value&&typeof value==='object'&&!Array.isArray(value)){
    const base=defaultAvatarConfig();
    for(const key of Object.keys(base)){
      const max=(AVATAR_OPTIONS[key]?.length||8)-1;
      const n=Number(value[key]);base[key]=Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):base[key];
    }
    return base;
  }
  if(typeof value==='string'){
    const preset=findAvatarPreset(value);
    if(preset)return cloneAvatar(preset.config);
    const legacy=['🎮','🧑‍🚀','🦸','🧙','🥷','👩‍🔬','👨‍🎨','👩‍🚀','🧑‍🎤','👸','🤴','🧝','🤖','🐉','🦊','🐼','🐯','🦄','🐙','👾'];
    const i=Math.max(0,legacy.indexOf(value));return cloneAvatar(AVATAR_PRESETS[i%AVATAR_PRESETS.length].config);
  }
  return defaultAvatarConfig();
}
function avatarLabel(value){
  const c=normalizeAvatar(value);
  return `${AVATAR_OPTIONS.hair[c.hair]} • ${AVATAR_OPTIONS.shirt[c.shirt]}`;
}
function escAttr(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function avatarSVG(value,size=96){
  const c=normalizeAvatar(value),skin=AVATAR_SKINS[c.skin],hair=AVATAR_HAIR_COLORS[c.hairColor],shirt=AVATAR_SHIRT_COLORS[c.shirtColor],bg=AVATAR_BACKGROUNDS[c.background];
  const faceRx=[31,28,30,29][c.face],faceRy=[35,38,34,37][c.face];
  const ear=`<ellipse cx="25" cy="56" rx="4.5" ry="7" fill="${skin}" stroke="#74432f" stroke-width="1.2"/><ellipse cx="95" cy="56" rx="4.5" ry="7" fill="${skin}" stroke="#74432f" stroke-width="1.2"/>`;
  const longBack=c.hair===3?`<path d="M27 43 Q28 13 60 10 Q93 13 94 44 L91 91 Q79 82 75 67 L45 67 Q41 82 29 91Z" fill="${hair}"/>`:c.hair===4?`<ellipse cx="94" cy="47" rx="14" ry="24" fill="${hair}"/>`:c.hair===5?`<circle cx="27" cy="25" r="13" fill="${hair}"/><circle cx="93" cy="25" r="13" fill="${hair}"/>`:'';
  let hairFront='';
  if(c.hair===0)hairFront=`<path d="M31 42 Q31 17 60 15 Q89 17 89 42 Q77 31 67 34 Q51 25 31 42Z" fill="${hair}"/>`;
  else if(c.hair===1)hairFront=`<path d="M30 43 Q31 16 61 14 Q88 16 90 39 Q69 25 45 39 Q39 46 30 43Z" fill="${hair}"/><path d="M49 18 Q71 20 86 40 Q63 30 46 44Z" fill="${hair}"/>`;
  else if(c.hair===2)hairFront=`<g fill="${hair}">${[34,44,54,64,74,84].map((x,i)=>`<circle cx="${x}" cy="${22+(i%2)*5}" r="10"/>`).join('')}<circle cx="31" cy="37" r="9"/><circle cx="88" cy="37" r="9"/></g>`;
  else if(c.hair===3)hairFront=`<path d="M31 42 Q31 15 60 13 Q89 15 89 42 Q74 28 60 33 Q45 27 31 42Z" fill="${hair}"/>`;
  else if(c.hair===4)hairFront=`<path d="M31 42 Q31 17 60 15 Q88 17 89 41 Q75 28 60 34 Q45 28 31 42Z" fill="${hair}"/><rect x="87" y="32" width="8" height="7" rx="3" fill="#ffcf66"/>`;
  else if(c.hair===5)hairFront=`<path d="M31 42 Q31 18 60 16 Q88 18 89 42 Q73 29 60 34 Q46 28 31 42Z" fill="${hair}"/>`;
  else if(c.hair===6)hairFront=`<path d="M32 39 Q35 17 61 16 Q86 18 88 37 Q68 26 47 34Z" fill="${hair}"/><path d="M34 34 L31 49 M87 34 L90 49" stroke="${hair}" stroke-width="5"/>`;
  else hairFront=`<path d="M30 42 L35 19 L44 28 L50 12 L59 27 L69 10 L75 28 L87 17 L90 43 Q71 27 52 34Z" fill="${hair}"/>`;
  const brows=c.brows===0?`<path d="M42 48 Q48 45 53 48 M67 48 Q73 45 78 48"/>`:c.brows===1?`<path d="M41 49 Q48 43 54 48 M66 48 Q73 43 79 49"/>`:c.brows===2?`<path d="M41 47 L54 47 M66 47 L79 47"/>`:`<path d="M40 48 L54 45 M66 45 L80 48"/>`;
  let eyes='';
  if(c.eyes===0)eyes=`<g><ellipse cx="48" cy="55" rx="6" ry="7" fill="#fff"/><ellipse cx="72" cy="55" rx="6" ry="7" fill="#fff"/><circle cx="49" cy="56" r="2.7" fill="#25304b"/><circle cx="71" cy="56" r="2.7" fill="#25304b"/><circle cx="50" cy="55" r=".9" fill="#fff"/><circle cx="72" cy="55" r=".9" fill="#fff"/></g>`;
  else if(c.eyes===1)eyes=`<path d="M42 56 Q48 50 54 56 M66 56 Q72 50 78 56" fill="none" stroke="#27304a" stroke-width="2.3" stroke-linecap="round"/>`;
  else if(c.eyes===2)eyes=`<g><ellipse cx="48" cy="55" rx="6.5" ry="7.5" fill="#fff"/><ellipse cx="72" cy="55" rx="6.5" ry="7.5" fill="#fff"/><circle cx="48" cy="56" r="3.2" fill="#4775a5"/><circle cx="72" cy="56" r="3.2" fill="#4775a5"/><path d="M41 50 L38 48 M79 50 L82 48" stroke="#27304a" stroke-width="1.6"/></g>`;
  else eyes=`<path d="M42 55 L54 55 M66 55 L78 55" stroke="#27304a" stroke-width="2.5" stroke-linecap="round"/>`;
  const mouth=c.mouth===0?`<path d="M49 72 Q60 80 71 72" fill="none" stroke="#963f51" stroke-width="2.6" stroke-linecap="round"/>`:c.mouth===1?`<path d="M48 71 Q60 83 72 71 Q60 77 48 71Z" fill="#963f51"/><path d="M52 73 L68 73" stroke="#fff" stroke-width="2"/>`:c.mouth===2?`<path d="M52 74 L68 74" stroke="#963f51" stroke-width="2.4" stroke-linecap="round"/>`:`<path d="M48 70 Q60 82 72 70" fill="#fff" stroke="#963f51" stroke-width="1.8"/>`;
  const shirtPattern=c.shirt===0?`<circle cx="60" cy="104" r="8" fill="#ffffffdd"/><text x="60" y="108" text-anchor="middle" font-size="11" font-weight="900" fill="#27304b">A</text>`:c.shirt===1?`<path d="M46 93 Q60 84 74 93" fill="none" stroke="#ffffffaa" stroke-width="3"/><path d="M53 91 L49 108 M67 91 L71 108" stroke="#ffffffaa" stroke-width="2"/>`:c.shirt===2?`<path d="M41 91 L53 108 M79 91 L67 108" stroke="#ffffffcc" stroke-width="3"/>`:`<path d="M39 99 H81 M42 107 H78" stroke="#ffffffcc" stroke-width="3"/>`;
  let accessory='';
  if(c.accessory===1)accessory=`<g fill="none" stroke="#26304b" stroke-width="2"><rect x="38" y="50" width="18" height="13" rx="5"/><rect x="64" y="50" width="18" height="13" rx="5"/><path d="M56 56 H64"/></g>`;
  else if(c.accessory===2)accessory=`<path d="M27 53 Q28 24 60 21 Q92 24 93 53" fill="none" stroke="#5ce4ff" stroke-width="6"/><rect x="24" y="50" width="8" height="19" rx="4" fill="#27355f"/><rect x="88" y="50" width="8" height="19" rx="4" fill="#27355f"/>`;
  else if(c.accessory===3)accessory=`<path d="M33 27 Q49 10 75 18 L88 28 Q65 24 34 33Z" fill="#4a76ff" stroke="#fff" stroke-width="1.5"/><path d="M76 24 Q93 25 96 31 Q85 34 75 31Z" fill="#4a76ff"/>`;
  else if(c.accessory===4)accessory=`<path d="M36 28 L42 10 L55 23 L61 7 L69 23 L82 10 L86 30Z" fill="#ffd052" stroke="#fff" stroke-width="1.5"/>`;
  else if(c.accessory===5)accessory=`<g fill="#ff5b9b" stroke="#fff" stroke-width="1"><path d="M80 27 Q93 16 98 30 Q93 42 80 31Z"/><path d="M80 27 Q67 16 62 30 Q67 42 80 31Z"/><circle cx="80" cy="29" r="4"/></g>`;
  else if(c.accessory===6)accessory=`<path d="M82 31 L85 37 L92 38 L87 43 L89 50 L82 46 L76 50 L78 43 L73 38 L80 37Z" fill="#ffd052" stroke="#fff"/>`;
  else if(c.accessory===7)accessory=`<path d="M27 53 Q28 24 60 21 Q92 24 93 53" fill="none" stroke="#ff5d8f" stroke-width="6"/><rect x="23" y="49" width="10" height="21" rx="5" fill="#242f53"/><rect x="87" y="49" width="10" height="21" rx="5" fill="#242f53"/><path d="M92 66 Q101 68 98 78" fill="none" stroke="#ff5d8f" stroke-width="3"/>`;
  return `<svg class="avatar-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="Custom arcade avatar"><circle cx="60" cy="60" r="58" fill="${bg}"/><circle cx="60" cy="60" r="53" fill="#ffffff12" stroke="#ffffff44" stroke-width="2"/>${longBack}<path d="M24 120 Q28 84 60 84 Q92 84 96 120Z" fill="${shirt}"/><path d="M53 78 H67 V91 H53Z" fill="${skin}"/>${ear}<ellipse cx="60" cy="53" rx="${faceRx}" ry="${faceRy}" fill="${skin}" stroke="#74432f" stroke-width="1.4"/>${hairFront}<g fill="none" stroke="${hair}" stroke-width="2" stroke-linecap="round">${brows}</g>${eyes}<path d="M60 57 Q57 64 61 66" fill="none" stroke="#ae7059" stroke-width="1.7" stroke-linecap="round"/>${mouth}${shirtPattern}${accessory}</svg>`;
}
function avatarControlMarkup(prefix,config){
  const c=normalizeAvatar(config);
  const order=['skin','face','hair','hairColor','eyes','brows','mouth','shirt','shirtColor','accessory','background'];
  return order.map(key=>`<label>${key.replace(/([A-Z])/g,' $1').replace(/^./,m=>m.toUpperCase())}<select data-avatar-control="${key}" id="${prefix}-${key}">${AVATAR_OPTIONS[key].map((name,i)=>`<option value="${i}" ${c[key]===i?'selected':''}>${escAttr(name)}</option>`).join('')}</select></label>`).join('');
}
function readAvatarControls(root){
  const c=defaultAvatarConfig();root.querySelectorAll('[data-avatar-control]').forEach(el=>{c[el.dataset.avatarControl]=Number(el.value)||0});return normalizeAvatar(c);
}
