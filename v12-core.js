'use strict';

(() => {
  const BOT_PROFILES = {
    beginner:   {label:'Beginner', speed:.56, reaction:.46, accuracy:.55, error:.34, planning:0, aggression:.55},
    easy:       {label:'Easy', speed:.72, reaction:.32, accuracy:.68, error:.22, planning:1, aggression:.7},
    medium:     {label:'Medium', speed:.9, reaction:.19, accuracy:.82, error:.11, planning:2, aggression:.88},
    hard:       {label:'Hard', speed:1.08, reaction:.09, accuracy:.94, error:.035, planning:4, aggression:1.06},
    impossible: {label:'Impossible', speed:1.24, reaction:.018, accuracy:1, error:0, planning:7, aggression:1.22}
  };
  globalThis.ARCADE_BOT_PROFILES = BOT_PROFILES;
  globalThis.botTuning = session => {
    const key = session?.botDifficulty || (() => { try { return account()?.settings?.botDifficulty; } catch { return null; } })() || 'medium';
    return BOT_PROFILES[key] || BOT_PROFILES.medium;
  };
  globalThis.botModeLabel = session => botTuning(session).label;

  const MUSIC_TRACKS = {
    'arcade-pulse': {label:'Arcade Pulse',bpm:124,wave:'square',lead:[72,null,76,null,79,null,76,null,74,null,77,null,81,null,77,null],bass:[36,null,null,null,36,null,43,null,41,null,null,null,41,null,43,null],chord:[60,64,67],drums:'arcade'},
    'pixel-quest': {label:'Pixel Quest',bpm:112,wave:'square',lead:[67,69,71,74,71,69,67,null,64,67,69,72,69,67,64,null],bass:[36,null,36,null,33,null,33,null,29,null,29,null,31,null,31,null],chord:[55,59,62],drums:'march'},
    'neon-racer': {label:'Neon Racer',bpm:142,wave:'sawtooth',lead:[76,null,76,79,81,null,79,null,74,null,74,76,79,null,76,null],bass:[33,null,33,33,38,null,38,38,31,null,31,31,36,null,36,36],chord:[57,60,64],drums:'drive'},
    'cosmic-drift': {label:'Cosmic Drift',bpm:88,wave:'sine',lead:[72,null,null,76,null,null,79,null,74,null,null,77,null,null,81,null],bass:[36,null,null,null,31,null,null,null,33,null,null,null,29,null,null,null],chord:[60,64,69],drums:'soft'},
    'puzzle-garden': {label:'Puzzle Garden',bpm:96,wave:'triangle',lead:[69,null,72,null,76,null,72,null,67,null,71,null,74,null,71,null],bass:[41,null,null,null,38,null,null,null,36,null,null,null,40,null,null,null],chord:[57,60,64],drums:'soft'},
    'sports-arena': {label:'Sports Arena',bpm:132,wave:'square',lead:[67,67,null,74,72,null,67,null,69,69,null,76,74,null,69,null],bass:[36,null,36,null,43,null,43,null,38,null,38,null,45,null,45,null],chord:[55,59,62],drums:'arena'},
    'castle-steps': {label:'Castle Steps',bpm:104,wave:'triangle',lead:[64,67,69,71,72,71,69,67,62,64,67,69,71,69,67,64],bass:[36,null,43,null,41,null,38,null,33,null,40,null,38,null,35,null],chord:[52,55,59],drums:'march'},
    'chill-clouds': {label:'Chill Clouds',bpm:76,wave:'sine',lead:[72,null,69,null,67,null,64,null,69,null,67,null,64,null,62,null],bass:[36,null,null,null,33,null,null,null,29,null,null,null,31,null,null,null],chord:[60,64,67],drums:'soft'}
  };
  globalThis.ARCADE_MUSIC_TRACKS = MUSIC_TRACKS;
  const CATEGORY_MUSIC={Sports:'sports-arena',Racing:'neon-racer',Shooter:'neon-racer',Strategy:'castle-steps',Board:'castle-steps',Puzzle:'puzzle-garden',Word:'puzzle-garden',Learning:'puzzle-garden',Adventure:'pixel-quest',Simulation:'cosmic-drift',Creative:'chill-clouds',Music:'arcade-pulse',Casual:'chill-clouds',Arcade:'arcade-pulse',Multiplayer:'sports-arena',Cards:'castle-steps'};
  const midiToHz=n=>440*Math.pow(2,(n-69)/12);

  class ArcadeAudio {
    constructor(){this.ctx=null;this.master=null;this.musicBus=null;this.last={};this.scene='auth';this.sceneGame=null;this.musicTimer=null;this.musicStep=0;this.nextNoteTime=0;this.activeTrack='';this.previewUntil=0;this.generation=0;}
    settings(){
      try { const s=account()?.settings||{}; return {on:s.sound!==false,volume:Math.max(0,Math.min(1,Number(s.volume??.7))),musicOn:s.music!==false,musicVolume:Math.max(0,Math.min(1,Number(s.musicVolume??.4))),musicTrack:s.musicTrack||'adaptive'}; }
      catch { return {on:true,volume:.7,musicOn:false,musicVolume:.4,musicTrack:'adaptive'}; }
    }
    unlock(){
      try{
        if(!this.ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return;this.ctx=new C();this.master=this.ctx.createGain();this.master.gain.value=.18;this.master.connect(this.ctx.destination);this.musicBus=this.ctx.createGain();this.musicBus.gain.value=0;this.musicBus.connect(this.ctx.destination)}
        if(this.ctx.state==='suspended')this.ctx.resume().then(()=>this.refreshMusic()).catch(()=>{});else this.refreshMusic();
      }catch{}
    }
    tone(freq=440,duration=.08,type='sine',gain=.18,slide=0,delay=0){
      const set=this.settings();if(!set.on||set.volume<=0)return;this.unlock();if(!this.ctx||!this.master)return;
      const now=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(Math.max(35,freq),now);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(35,freq+slide),now+duration);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain*set.volume),now+.008);g.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(g);g.connect(this.master);o.start(now);o.stop(now+duration+.02);
    }
    noise(duration=.06,gain=.08){
      const set=this.settings();if(!set.on||set.volume<=0)return;this.unlock();if(!this.ctx||!this.master)return;
      const length=Math.max(1,Math.floor(this.ctx.sampleRate*duration)),buffer=this.ctx.createBuffer(1,length,this.ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*(1-i/length);const src=this.ctx.createBufferSource(),g=this.ctx.createGain();src.buffer=buffer;g.gain.value=gain*set.volume;src.connect(g);g.connect(this.master);src.start();
    }
    play(name='tap',intensity=1){
      const now=performance.now(),min={move:75,tap:35,hit:42,action:55}[name]||0;if(now-(this.last[name]||0)<min)return;this.last[name]=now;
      switch(name){
        case 'countdown': this.tone(330,.09,'square',.11); break;
        case 'go': this.tone(523,.09,'square',.14);this.tone(784,.16,'triangle',.13,90,.08);break;
        case 'move': this.tone(180,.025,'triangle',.035);break;
        case 'tap': this.tone(280,.045,'sine',.07,70);break;
        case 'action': this.tone(420,.065,'square',.09,160);break;
        case 'jump': this.tone(260,.11,'square',.09,300);break;
        case 'shoot': this.tone(620,.055,'sawtooth',.075,-250);break;
        case 'hit': this.noise(.045,.07*intensity);this.tone(140,.06,'square',.06,-60);break;
        case 'bounce': this.tone(360,.04,'triangle',.055,100);break;
        case 'score': this.tone(660,.08,'square',.11,150);this.tone(880,.11,'triangle',.1,100,.07);break;
        case 'coin': this.tone(880,.06,'square',.08,160);this.tone(1175,.08,'square',.07,120,.06);break;
        case 'win': [523,659,784,1047].forEach((f,i)=>this.tone(f,.18,'triangle',.11,80,i*.09));break;
        case 'fail': this.tone(330,.18,'sawtooth',.09,-150);this.tone(196,.26,'triangle',.08,-70,.12);break;
        case 'pause': this.tone(260,.08,'square',.07,-70);break;
        default: this.tone(300,.05,'sine',.06,60);
      }
    }
    setScene(scene='launcher',game=null){this.scene=scene;this.sceneGame=game||null;this.previewUntil=0;this.refreshMusic(true);}
    resolveTrack(requested){
      if(requested&&requested!=='adaptive'&&MUSIC_TRACKS[requested])return requested;
      const category=this.sceneGame?.category||'Arcade';return CATEGORY_MUSIC[category]||'arcade-pulse';
    }
    preview(track='adaptive',volume=.4){
      this.unlock();if(!this.ctx)return;this.previewUntil=performance.now()+9000;this._startMusic(this.resolveTrack(track),Math.max(0,Math.min(1,Number(volume)||.4)),true);
    }
    refreshMusic(force=false){
      if(!this.ctx||this.ctx.state!=='running')return;
      const set=this.settings(),previewing=performance.now()<this.previewUntil;
      if(document.hidden||(!previewing&&(this.scene==='auth'||!set.musicOn||set.musicVolume<=0))){this.stopMusic();return}
      const id=previewing?this.activeTrack||this.resolveTrack(set.musicTrack):this.resolveTrack(set.musicTrack),vol=previewing?null:set.musicVolume;
      if(force||!this.musicTimer||this.activeTrack!==id)this._startMusic(id,vol??set.musicVolume,false);else this._setMusicVolume(vol??set.musicVolume);
    }
    _setMusicVolume(volume){if(!this.ctx||!this.musicBus)return;const target=.22*Math.max(0,Math.min(1,Number(volume)||0));this.musicBus.gain.cancelScheduledValues(this.ctx.currentTime);this.musicBus.gain.setTargetAtTime(target,this.ctx.currentTime,.06);}
    stopMusic(){
      this.generation++;if(this.musicTimer){clearInterval(this.musicTimer);this.musicTimer=null}this.activeTrack='';if(this.ctx&&this.musicBus){this.musicBus.gain.cancelScheduledValues(this.ctx.currentTime);this.musicBus.gain.setTargetAtTime(0,this.ctx.currentTime,.04)}
    }
    _startMusic(trackId,volume=.4,isPreview=false){
      if(!this.ctx||!this.musicBus||!MUSIC_TRACKS[trackId])return;this.generation++;if(this.musicTimer)clearInterval(this.musicTimer);this.activeTrack=trackId;this.musicStep=0;this.nextNoteTime=this.ctx.currentTime+.05;this._setMusicVolume(volume);const gen=this.generation;const tick=()=>{if(gen!==this.generation||!this.ctx)return;while(this.nextNoteTime<this.ctx.currentTime+.18){this._scheduleStep(MUSIC_TRACKS[trackId],this.musicStep,this.nextNoteTime);const stepDur=60/MUSIC_TRACKS[trackId].bpm/4;this.nextNoteTime+=stepDur;this.musicStep=(this.musicStep+1)%16}if(isPreview&&performance.now()>=this.previewUntil){this.previewUntil=0;this.refreshMusic(true)}};tick();this.musicTimer=setInterval(tick,30);
    }
    _musicTone(note,time,duration,wave='triangle',gain=.07,detune=0){
      if(note==null||!this.ctx||!this.musicBus)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=wave;o.frequency.setValueAtTime(midiToHz(note),time);o.detune.value=detune;g.gain.setValueAtTime(.0001,time);g.gain.exponentialRampToValueAtTime(gain,time+.012);g.gain.exponentialRampToValueAtTime(.0001,time+duration);o.connect(g);g.connect(this.musicBus);o.start(time);o.stop(time+duration+.03);
    }
    _kick(time,gain=.16){if(!this.ctx||!this.musicBus)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type='sine';o.frequency.setValueAtTime(130,time);o.frequency.exponentialRampToValueAtTime(48,time+.11);g.gain.setValueAtTime(gain,time);g.gain.exponentialRampToValueAtTime(.0001,time+.13);o.connect(g);g.connect(this.musicBus);o.start(time);o.stop(time+.14);}
    _hat(time,gain=.045){if(!this.ctx||!this.musicBus)return;const len=Math.floor(this.ctx.sampleRate*.035),b=this.ctx.createBuffer(1,len,this.ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);const src=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),g=this.ctx.createGain();filter.type='highpass';filter.frequency.value=5200;g.gain.setValueAtTime(gain,time);g.gain.exponentialRampToValueAtTime(.0001,time+.035);src.buffer=b;src.connect(filter);filter.connect(g);g.connect(this.musicBus);src.start(time);}
    _scheduleStep(track,step,time){
      const stepDur=60/track.bpm/4,lead=track.lead[step],bass=track.bass[step];if(lead!=null)this._musicTone(lead,time,stepDur*.72,track.wave,.055);if(bass!=null)this._musicTone(bass,time,stepDur*.9,'triangle',.075);
      if(step%4===0){const root=track.chord[(step/4)%track.chord.length];this._musicTone(root,time,stepDur*3.6,'sine',.018);this._musicTone(root+7,time,stepDur*3.6,'sine',.013)}
      const d=track.drums;if(step%4===0||((d==='drive'||d==='arena')&&step%4===2))this._kick(time,d==='soft'?.075:.12);if(d!=='soft'&&step%2===1)this._hat(time,d==='drive'?.055:.035);if(d==='soft'&&step%4===2)this._hat(time,.018);if(d==='march'&&(step===4||step===12))this._hat(time,.05);
    }
  }
  const audio=new ArcadeAudio();globalThis.ARCADE_AUDIO=audio;globalThis.arcadeSfx=(name,intensity)=>audio.play(name,intensity);
  window.addEventListener('pointerdown',()=>audio.unlock(),{once:false,passive:true});
  window.addEventListener('keydown',()=>audio.unlock(),{once:false});
  document.addEventListener('visibilitychange',()=>audio.refreshMusic(true));

  function hashTextValue(text='') { let h=2166136261;for(const ch of String(text)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0; }
  globalThis.arcadeGameHue = id => hashTextValue(id)%360;
  const categorySymbols={Arcade:['◆','●','✦'],Shooter:['✦','·','✧'],Sports:['●','◌','▲'],Strategy:['◇','▦','⌁'],Board:['◆','○','□'],Puzzle:['△','□','○'],Word:['A','Z','?'],Learning:['+','×','÷'],Adventure:['✦','▲','●'],Simulation:['⚙','◇','○'],Music:['♪','♫','●'],Creative:['✦','◇','◌'],Cards:['♠','♦','♣'],Racing:['▰','›','◆'],Casual:['●','✦','○'],Multiplayer:['●','●','↔']};
  function ensureAmbience(session){
    if(session._v12Ambience)return session._v12Ambience;const h=hashTextValue(`${session.game?.id||'game'}:${session.level||1}`),rng=()=>{let x=(h+(session._v12Rand=(session._v12Rand||0)+1)*2654435761)>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296};
    const list=[];for(let i=0;i<18;i++)list.push({x:rng()*900,y:55+rng()*485,s:1+rng()*3,v:.15+rng()*.65,p:rng()*Math.PI*2});session._v12Ambience=list;return list;
  }
  globalThis.emitArcadeFX=(session,x,y,kind='spark',count=8)=>{
    if(!session)return;session.fxParticles=session.fxParticles||[];const hue=arcadeGameHue(session.game?.id||'game');for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,sp=35+Math.random()*145;session.fxParticles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.35+Math.random()*.55,max:.9,size:2+Math.random()*5,hue:(hue+i*17)%360,kind})}if(session.fxParticles.length>90)session.fxParticles.splice(0,session.fxParticles.length-90);
  };
  globalThis.drawArcadePolish=(session,c,time=0,dt=.016)=>{
    let settings={};try{settings=account()?.settings||{}}catch{}if(settings.visualEffects===false)return;const category=session.game?.category||'Arcade',hue=(arcadeGameHue(session.game?.id||'game')+(Number(session.level||1)-1)*17)%360,symbols=categorySymbols[category]||categorySymbols.Arcade,ambient=ensureAmbience(session),t=time/1000;
    c.save();
    // A different ambient motif and hue is generated for every game ID.
    c.globalCompositeOperation='screen';
    for(let i=0;i<ambient.length;i++){const q=ambient[i],x=(q.x+t*q.v*18)%900,y=q.y+Math.sin(t*q.v+q.p)*6;c.globalAlpha=.08+.07*Math.sin(t+q.p);c.fillStyle=`hsl(${(hue+i*11)%360} 90% 68%)`;if(category==='Music'||category==='Creative'){c.fillRect(x,H-18-q.s*8,q.s*4,q.s*8+Math.abs(Math.sin(t*3+q.p))*24)}else{c.font=`700 ${10+q.s*3}px system-ui`;c.fillText(symbols[i%symbols.length],x,y)}}
    c.globalAlpha=.22;c.strokeStyle=`hsl(${hue} 95% 66%)`;c.lineWidth=3;c.strokeRect(4,4,W-8,H-8);
    const grad=c.createRadialGradient(W/2,H/2,150,W/2,H/2,520);grad.addColorStop(0,'transparent');grad.addColorStop(1,'rgba(0,0,0,.28)');c.globalCompositeOperation='source-over';c.globalAlpha=1;c.fillStyle=grad;c.fillRect(0,0,W,H);
    // Distinct game signature chip.
    c.globalAlpha=.72;c.fillStyle='rgba(4,10,25,.58)';c.fillRect(12,H-31,Math.min(280,58+String(session.game?.name||'Game').length*8),21);c.font='700 12px system-ui';c.textAlign='left';c.fillStyle=`hsl(${hue} 95% 76%)`;c.fillText(`V12 • ${session.game?.name||'Game'}${session.game?.campaign&&session.game?.levels>1?` • Level ${session.level}`:''}`,20,H-16);
    const ps=session.fxParticles||[];for(let i=ps.length-1;i>=0;i--){const p=ps[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.kind==='confetti'?80*dt:25*dt;if(p.life<=0){ps.splice(i,1);continue}c.globalAlpha=Math.max(0,p.life/p.max);c.fillStyle=`hsl(${p.hue} 95% 66%)`;if(p.kind==='confetti')c.fillRect(p.x,p.y,p.size*1.8,p.size);else{c.beginPath();c.arc(p.x,p.y,p.size,0,Math.PI*2);c.fill()}}
    c.restore();
  };
})();
