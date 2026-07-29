'use strict';

const AVATAR_SKINS=['#FBE0CB','#F6D2B8','#E8B28E','#D99A72','#C77E55','#A95F3D','#7B432A','#4D2A1C'];
const AVATAR_HAIR_COLORS=['#15100D','#24170F','#4B2B1B','#7A4A27','#B8763D','#E7C16E','#D9D4C8','#151A2C','#B73A55','#6A4EC4','#168C8C','#E45F2B'];
const AVATAR_SHIRT_COLORS=['#38D5FF','#FF5C8A','#7B6CFF','#45D58C','#FFD05C','#FF914D','#26396B','#F5F7FF','#E34255','#24A4A4','#111827','#B66DFF'];
const AVATAR_BACKGROUNDS=['#203A73','#713D91','#1F6A64','#A34863','#8A6224','#27304D','#6A3B2E','#274F80','#0E7490','#7C2D12','#166534','#9F1239','#312E81','#475569','#854D0E','#164E63'];
const AVATAR_EYE_COLORS=['#25304B','#4E7199','#2E7D66','#80512F','#6C4FA3','#161616'];
const AVATAR_OPTIONS={
  skin:['Porcelain','Light','Warm','Golden','Tan','Brown','Deep','Dark'],
  face:['Round','Oval','Soft square','Heart','Diamond','Long'],
  hair:['Short','Side sweep','Curly','Long','Ponytail','Twin buns','Fade','Spiky','Braids','Bob','Waves','Mohawk','Locs','Pixie'],
  hairColor:['Jet black','Black','Brown','Chestnut','Copper','Blonde','Silver','Midnight','Rose','Purple','Teal','Orange'],
  hairHighlight:['None','Soft shine','Bright streak','Two-tone'],
  eyes:['Classic','Happy','Bright','Calm','Wide','Wink','Focused','Sparkle'],
  eyeColor:['Charcoal','Blue','Green','Hazel','Violet','Black'],
  brows:['Soft','Arched','Straight','Bold','Curved','Feathered'],
  nose:['Button','Soft','Straight','Tiny'],
  mouth:['Smile','Open smile','Neutral','Grin','Laugh','Side smile','Surprised','Confident'],
  cheeks:['None','Blush','Freckles','Dimples'],
  facialHair:['None','Mustache','Goatee','Short beard'],
  shirt:['Arcade tee','Hoodie','Jacket','Sport top','Dress top','Sweater','Armor','Overalls'],
  shirtColor:['Cyan','Pink','Purple','Green','Gold','Orange','Navy','White','Red','Teal','Black','Lilac'],
  shirtPattern:['Plain','A logo','Stripes','Stars','Gradient','Pixel blocks'],
  accessory:['None','Glasses','Headphones','Cap','Crown','Bow','Star clip','Gaming headset','Beanie','Tiara','Visor','Bandana','Flower','Earrings','Scarf','Space helmet'],
  background:['Blue','Purple','Teal','Rose','Gold','Slate','Copper','Ocean','Cyan','Rust','Forest','Berry','Indigo','Steel','Amber','Deep sea']
};
const AVATAR_PRESETS=[
  {id:'arcade-blue',name:'Arcade Blue',config:{skin:1,face:0,hair:0,hairColor:0,eyes:0,brows:0,mouth:0,shirt:0,shirtColor:0,accessory:0,background:0}},
  {id:'sunset-style',name:'Sunset Style',config:{skin:2,face:1,hair:3,hairColor:2,eyes:2,brows:1,mouth:1,shirt:1,shirtColor:1,accessory:6,background:3}},
  {id:'sport-star',name:'Sport Star',config:{skin:3,face:2,hair:6,hairColor:0,eyes:0,brows:3,mouth:3,shirt:3,shirtColor:4,accessory:3,background:4}},
  {id:'creative-wave',name:'Creative Wave',config:{skin:0,face:3,hair:4,hairColor:6,eyes:1,brows:0,mouth:0,shirt:2,shirtColor:2,accessory:5,background:1}},
  {id:'tech-hero',name:'Tech Hero',config:{skin:4,face:1,hair:7,hairColor:5,eyes:3,brows:2,mouth:0,shirt:2,shirtColor:6,accessory:7,background:5}},
  {id:'royal-player',name:'Royal Player',config:{skin:1,face:0,hair:5,hairColor:3,eyes:2,brows:1,mouth:1,shirt:0,shirtColor:7,accessory:4,background:1}},
  {id:'forest-friend',name:'Forest Friend',config:{skin:2,face:0,hair:2,hairColor:1,eyes:1,brows:0,mouth:0,shirt:1,shirtColor:3,accessory:0,background:2}},
  {id:'night-gamer',name:'Night Gamer',config:{skin:5,face:2,hair:1,hairColor:5,eyes:0,brows:3,mouth:3,shirt:0,shirtColor:2,accessory:2,background:7}},
  {id:'ocean-explorer',name:'Ocean Explorer',config:{skin:2,face:1,hair:4,hairColor:1,eyes:2,brows:1,mouth:0,shirt:1,shirtColor:0,accessory:6,background:7}},
  {id:'candy-creator',name:'Candy Creator',config:{skin:0,face:3,hair:5,hairColor:6,eyes:1,brows:0,mouth:1,shirt:0,shirtColor:1,accessory:5,background:3}},
  {id:'galaxy-captain',name:'Galaxy Captain',config:{skin:4,face:2,hair:7,hairColor:7,eyes:2,brows:3,mouth:3,shirt:2,shirtColor:2,accessory:7,background:1}},
  {id:'nature-artist',name:'Nature Artist',config:{skin:3,face:0,hair:2,hairColor:2,eyes:1,brows:1,mouth:0,shirt:1,shirtColor:3,accessory:6,background:2}},
  {id:'royal-gamer-2',name:'Royal Gamer',config:{skin:1,face:3,hair:3,hairColor:4,eyes:2,brows:1,mouth:1,shirt:2,shirtColor:7,accessory:4,background:4}},
  {id:'retro-racer',name:'Retro Racer',config:{skin:2,face:2,hair:6,hairColor:0,eyes:0,brows:3,mouth:3,shirt:3,shirtColor:5,accessory:3,background:5}},
  {id:'puzzle-pro',name:'Puzzle Pro',config:{skin:5,face:1,hair:0,hairColor:5,eyes:3,brows:2,mouth:0,shirt:0,shirtColor:6,accessory:1,background:0}},
  {id:'music-star',name:'Music Star',config:{skin:1,face:0,hair:4,hairColor:3,eyes:1,brows:0,mouth:1,shirt:3,shirtColor:4,accessory:2,background:6}}
];
for(const preset of AVATAR_PRESETS){Object.assign(preset.config,{hairHighlight:preset.config.hairHighlight||0,eyeColor:preset.config.eyeColor||0,nose:preset.config.nose||0,cheeks:preset.config.cheeks||0,facialHair:preset.config.facialHair||0,shirtPattern:preset.config.shirtPattern||0});}
const EXTRA_AVATAR_PRESETS=[
  {id:'braid-adventurer',name:'Braid Adventurer',config:{skin:4,face:1,hair:8,hairColor:2,hairHighlight:2,eyes:2,eyeColor:2,brows:1,nose:1,mouth:0,cheeks:2,facialHair:0,shirt:6,shirtColor:3,shirtPattern:4,accessory:12,background:10}},
  {id:'pixel-pioneer',name:'Pixel Pioneer',config:{skin:2,face:2,hair:9,hairColor:7,hairHighlight:1,eyes:7,eyeColor:1,brows:4,nose:0,mouth:3,cheeks:1,facialHair:0,shirt:0,shirtColor:8,shirtPattern:5,accessory:10,background:12}},
  {id:'cozy-cloud',name:'Cozy Cloud',config:{skin:1,face:0,hair:10,hairColor:5,hairHighlight:1,eyes:1,eyeColor:3,brows:5,nose:3,mouth:5,cheeks:1,facialHair:0,shirt:5,shirtColor:11,shirtPattern:2,accessory:8,background:13}},
  {id:'space-commander',name:'Space Commander',config:{skin:6,face:4,hair:11,hairColor:10,hairHighlight:2,eyes:6,eyeColor:4,brows:3,nose:2,mouth:7,cheeks:0,facialHair:2,shirt:6,shirtColor:6,shirtPattern:4,accessory:15,background:15}},
  {id:'festival-star',name:'Festival Star',config:{skin:3,face:3,hair:12,hairColor:8,hairHighlight:3,eyes:4,eyeColor:4,brows:1,nose:0,mouth:4,cheeks:2,facialHair:0,shirt:4,shirtColor:1,shirtPattern:3,accessory:9,background:11}},
  {id:'street-champion',name:'Street Champion',config:{skin:5,face:2,hair:13,hairColor:0,hairHighlight:1,eyes:6,eyeColor:5,brows:3,nose:2,mouth:7,cheeks:3,facialHair:1,shirt:7,shirtColor:9,shirtPattern:2,accessory:11,background:8}},
  {id:'forest-guardian',name:'Forest Guardian',config:{skin:4,face:0,hair:8,hairColor:3,hairHighlight:1,eyes:2,eyeColor:2,brows:4,nose:1,mouth:0,cheeks:2,facialHair:0,shirt:5,shirtColor:3,shirtPattern:3,accessory:12,background:10}},
  {id:'neon-dj',name:'Neon DJ',config:{skin:2,face:5,hair:11,hairColor:9,hairHighlight:3,eyes:7,eyeColor:1,brows:5,nose:3,mouth:3,cheeks:1,facialHair:0,shirt:2,shirtColor:10,shirtPattern:4,accessory:7,background:12}}
];
AVATAR_PRESETS.push(...EXTRA_AVATAR_PRESETS);

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
  const c=normalizeAvatar(value),skin=AVATAR_SKINS[c.skin],hair=AVATAR_HAIR_COLORS[c.hairColor],shirt=AVATAR_SHIRT_COLORS[c.shirtColor],bg=AVATAR_BACKGROUNDS[c.background],eyeColor=AVATAR_EYE_COLORS[c.eyeColor];
  const hairStyle=c.hair%8,accessoryStyle=c.accessory%8;
  const faceRx=[31,28,30,29][c.face],faceRy=[35,38,34,37][c.face];
  const ear=`<ellipse cx="25" cy="56" rx="4.5" ry="7" fill="${skin}" stroke="#74432f" stroke-width="1.2"/><ellipse cx="95" cy="56" rx="4.5" ry="7" fill="${skin}" stroke="#74432f" stroke-width="1.2"/>`;
  const longBack=hairStyle===3?`<path d="M27 43 Q28 13 60 10 Q93 13 94 44 L91 91 Q79 82 75 67 L45 67 Q41 82 29 91Z" fill="${hair}"/>`:hairStyle===4?`<ellipse cx="94" cy="47" rx="14" ry="24" fill="${hair}"/>`:hairStyle===5?`<circle cx="27" cy="25" r="13" fill="${hair}"/><circle cx="93" cy="25" r="13" fill="${hair}"/>`:'';
  let hairFront='';
  if(hairStyle===0)hairFront=`<path d="M31 42 Q31 17 60 15 Q89 17 89 42 Q77 31 67 34 Q51 25 31 42Z" fill="${hair}"/>`;
  else if(hairStyle===1)hairFront=`<path d="M30 43 Q31 16 61 14 Q88 16 90 39 Q69 25 45 39 Q39 46 30 43Z" fill="${hair}"/><path d="M49 18 Q71 20 86 40 Q63 30 46 44Z" fill="${hair}"/>`;
  else if(hairStyle===2)hairFront=`<g fill="${hair}">${[34,44,54,64,74,84].map((x,i)=>`<circle cx="${x}" cy="${22+(i%2)*5}" r="10"/>`).join('')}<circle cx="31" cy="37" r="9"/><circle cx="88" cy="37" r="9"/></g>`;
  else if(hairStyle===3)hairFront=`<path d="M31 42 Q31 15 60 13 Q89 15 89 42 Q74 28 60 33 Q45 27 31 42Z" fill="${hair}"/>`;
  else if(hairStyle===4)hairFront=`<path d="M31 42 Q31 17 60 15 Q88 17 89 41 Q75 28 60 34 Q45 28 31 42Z" fill="${hair}"/><rect x="87" y="32" width="8" height="7" rx="3" fill="#ffcf66"/>`;
  else if(hairStyle===5)hairFront=`<path d="M31 42 Q31 18 60 16 Q88 18 89 42 Q73 29 60 34 Q46 28 31 42Z" fill="${hair}"/>`;
  else if(hairStyle===6)hairFront=`<path d="M32 39 Q35 17 61 16 Q86 18 88 37 Q68 26 47 34Z" fill="${hair}"/><path d="M34 34 L31 49 M87 34 L90 49" stroke="${hair}" stroke-width="5"/>`;
  else hairFront=`<path d="M30 42 L35 19 L44 28 L50 12 L59 27 L69 10 L75 28 L87 17 L90 43 Q71 27 52 34Z" fill="${hair}"/>`;
  const brows=c.brows===0?`<path d="M42 48 Q48 45 53 48 M67 48 Q73 45 78 48"/>`:c.brows===1?`<path d="M41 49 Q48 43 54 48 M66 48 Q73 43 79 49"/>`:c.brows===2?`<path d="M41 47 L54 47 M66 47 L79 47"/>`:`<path d="M40 48 L54 45 M66 45 L80 48"/>`;
  let eyes='';
  if(c.eyes===0)eyes=`<g><ellipse cx="48" cy="55" rx="6" ry="7" fill="#fff"/><ellipse cx="72" cy="55" rx="6" ry="7" fill="#fff"/><circle cx="49" cy="56" r="2.7" fill="${eyeColor}"/><circle cx="71" cy="56" r="2.7" fill="${eyeColor}"/><circle cx="50" cy="55" r=".9" fill="#fff"/><circle cx="72" cy="55" r=".9" fill="#fff"/></g>`;
  else if(c.eyes===1)eyes=`<path d="M42 56 Q48 50 54 56 M66 56 Q72 50 78 56" fill="none" stroke="#27304a" stroke-width="2.3" stroke-linecap="round"/>`;
  else if(c.eyes===2)eyes=`<g><ellipse cx="48" cy="55" rx="6.5" ry="7.5" fill="#fff"/><ellipse cx="72" cy="55" rx="6.5" ry="7.5" fill="#fff"/><circle cx="48" cy="56" r="3.2" fill="${eyeColor}"/><circle cx="72" cy="56" r="3.2" fill="${eyeColor}"/><path d="M41 50 L38 48 M79 50 L82 48" stroke="#27304a" stroke-width="1.6"/></g>`;
  else eyes=`<path d="M42 55 L54 55 M66 55 L78 55" stroke="#27304a" stroke-width="2.5" stroke-linecap="round"/>`;
  const mouth=c.mouth===0?`<path d="M49 72 Q60 80 71 72" fill="none" stroke="#963f51" stroke-width="2.6" stroke-linecap="round"/>`:c.mouth===1?`<path d="M48 71 Q60 83 72 71 Q60 77 48 71Z" fill="#963f51"/><path d="M52 73 L68 73" stroke="#fff" stroke-width="2"/>`:c.mouth===2?`<path d="M52 74 L68 74" stroke="#963f51" stroke-width="2.4" stroke-linecap="round"/>`:`<path d="M48 70 Q60 82 72 70" fill="#fff" stroke="#963f51" stroke-width="1.8"/>`;
  const shirtPattern=c.shirt===0?`<circle cx="60" cy="104" r="8" fill="#ffffffdd"/><text x="60" y="108" text-anchor="middle" font-size="11" font-weight="900" fill="#27304b">A</text>`:c.shirt===1?`<path d="M46 93 Q60 84 74 93" fill="none" stroke="#ffffffaa" stroke-width="3"/><path d="M53 91 L49 108 M67 91 L71 108" stroke="#ffffffaa" stroke-width="2"/>`:c.shirt===2?`<path d="M41 91 L53 108 M79 91 L67 108" stroke="#ffffffcc" stroke-width="3"/>`:`<path d="M39 99 H81 M42 107 H78" stroke="#ffffffcc" stroke-width="3"/>`;
  let accessory='';
  if(accessoryStyle===1)accessory=`<g fill="none" stroke="#26304b" stroke-width="2"><rect x="38" y="50" width="18" height="13" rx="5"/><rect x="64" y="50" width="18" height="13" rx="5"/><path d="M56 56 H64"/></g>`;
  else if(accessoryStyle===2)accessory=`<path d="M27 53 Q28 24 60 21 Q92 24 93 53" fill="none" stroke="#5ce4ff" stroke-width="6"/><rect x="24" y="50" width="8" height="19" rx="4" fill="#27355f"/><rect x="88" y="50" width="8" height="19" rx="4" fill="#27355f"/>`;
  else if(accessoryStyle===3)accessory=`<path d="M33 27 Q49 10 75 18 L88 28 Q65 24 34 33Z" fill="#4a76ff" stroke="#fff" stroke-width="1.5"/><path d="M76 24 Q93 25 96 31 Q85 34 75 31Z" fill="#4a76ff"/>`;
  else if(accessoryStyle===4)accessory=`<path d="M36 28 L42 10 L55 23 L61 7 L69 23 L82 10 L86 30Z" fill="#ffd052" stroke="#fff" stroke-width="1.5"/>`;
  else if(accessoryStyle===5)accessory=`<g fill="#ff5b9b" stroke="#fff" stroke-width="1"><path d="M80 27 Q93 16 98 30 Q93 42 80 31Z"/><path d="M80 27 Q67 16 62 30 Q67 42 80 31Z"/><circle cx="80" cy="29" r="4"/></g>`;
  else if(accessoryStyle===6)accessory=`<path d="M82 31 L85 37 L92 38 L87 43 L89 50 L82 46 L76 50 L78 43 L73 38 L80 37Z" fill="#ffd052" stroke="#fff"/>`;
  else if(accessoryStyle===7)accessory=`<path d="M27 53 Q28 24 60 21 Q92 24 93 53" fill="none" stroke="#ff5d8f" stroke-width="6"/><rect x="23" y="49" width="10" height="21" rx="5" fill="#242f53"/><rect x="87" y="49" width="10" height="21" rx="5" fill="#242f53"/><path d="M92 66 Q101 68 98 78" fill="none" stroke="#ff5d8f" stroke-width="3"/>`;
  const highlight=c.hairHighlight===1?`<path d="M38 30 Q55 17 76 29" fill="none" stroke="#ffffff55" stroke-width="3" stroke-linecap="round"/>`:c.hairHighlight===2?`<path d="M51 17 Q57 27 54 39" fill="none" stroke="#58e8ff" stroke-width="5"/>`:c.hairHighlight===3?`<path d="M37 23 Q46 20 52 24 M68 21 Q77 21 84 27" fill="none" stroke="#ff72c8" stroke-width="4"/>`:'';
  const cheek=c.cheeks===1?`<g fill="#ef7c8f55"><ellipse cx="40" cy="66" rx="7" ry="3"/><ellipse cx="80" cy="66" rx="7" ry="3"/></g>`:c.cheeks===2?`<g fill="#9b5a45"><circle cx="39" cy="65" r="1"/><circle cx="43" cy="67" r="1"/><circle cx="77" cy="67" r="1"/><circle cx="81" cy="65" r="1"/></g>`:c.cheeks===3?`<path d="M38 68 Q42 71 46 68 M74 68 Q78 71 82 68" fill="none" stroke="#a85c66" stroke-width="1.5"/>`:'';
  const facial=c.facialHair===1?`<path d="M52 68 Q57 64 60 69 Q63 64 68 68 Q64 72 60 70 Q56 72 52 68Z" fill="${hair}"/>`:c.facialHair===2?`<path d="M55 76 Q60 82 65 76 L63 84 H57Z" fill="${hair}"/>`:c.facialHair===3?`<path d="M45 69 Q48 86 60 89 Q72 86 75 69 Q69 81 60 82 Q51 81 45 69Z" fill="${hair}" opacity=".9"/>`:'';
  const extraAccessory=c.accessory===8?`<path d="M32 31 Q60 8 88 31 L85 39 H35Z" fill="#4f5e78" stroke="white"/>`:c.accessory===9?`<path d="M37 28 L45 12 L55 25 L61 9 L70 25 L82 13 L86 29Z" fill="#ff9ee1" stroke="white"/>`:c.accessory===10?`<path d="M34 49 H86 L79 62 H41Z" fill="#51e5ff88" stroke="#dffaff"/>`:c.accessory===11?`<path d="M31 30 Q60 18 89 30 L85 39 Q60 31 35 39Z" fill="#e94d62"/>`:c.accessory===12?`<g fill="#ff77aa"><circle cx="84" cy="29" r="6"/><circle cx="90" cy="34" r="5"/><circle cx="79" cy="35" r="5"/></g>`:c.accessory===13?`<g fill="#ffd76b"><circle cx="24" cy="62" r="2.5"/><circle cx="96" cy="62" r="2.5"/></g>`:c.accessory===14?`<path d="M34 86 Q60 99 86 86 L80 104 H40Z" fill="#ff914d" opacity=".85"/>`:c.accessory===15?`<circle cx="60" cy="54" r="45" fill="none" stroke="#8de8ff88" stroke-width="5"/>`:'';
  return `<svg class="avatar-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="Custom arcade avatar"><circle cx="60" cy="60" r="58" fill="${bg}"/><circle cx="60" cy="60" r="53" fill="#ffffff12" stroke="#ffffff44" stroke-width="2"/>${longBack}<path d="M24 120 Q28 84 60 84 Q92 84 96 120Z" fill="${shirt}"/><path d="M53 78 H67 V91 H53Z" fill="${skin}"/>${ear}<ellipse cx="60" cy="53" rx="${faceRx}" ry="${faceRy}" fill="${skin}" stroke="#74432f" stroke-width="1.4"/>${hairFront}${highlight}<g fill="none" stroke="${hair}" stroke-width="2" stroke-linecap="round">${brows}</g>${eyes}${cheek}<path d="M60 57 Q57 64 61 66" fill="none" stroke="#ae7059" stroke-width="1.7" stroke-linecap="round"/>${mouth}${facial}${shirtPattern}${accessory}${extraAccessory}</svg>`;
}
function avatarControlMarkup(prefix,config){
  const c=normalizeAvatar(config);
  const order=['skin','face','hair','hairColor','hairHighlight','eyes','eyeColor','brows','nose','mouth','cheeks','facialHair','shirt','shirtColor','shirtPattern','accessory','background'];
  return order.map(key=>`<label>${key.replace(/([A-Z])/g,' $1').replace(/^./,m=>m.toUpperCase())}<select data-avatar-control="${key}" id="${prefix}-${key}">${AVATAR_OPTIONS[key].map((name,i)=>`<option value="${i}" ${c[key]===i?'selected':''}>${escAttr(name)}</option>`).join('')}</select></label>`).join('');
}
function readAvatarControls(root){
  const c=defaultAvatarConfig();root.querySelectorAll('[data-avatar-control]').forEach(el=>{c[el.dataset.avatarControl]=Number(el.value)||0});return normalizeAvatar(c);
}
