'use strict';

function createGameEngine(session){
  const factories={
    snake:snakeGame,brick:brickGame,pong:pongGame,invaders:invadersGame,asteroids:asteroidsGame,
    flappy:flappyGame,dino:dinoGame,skylinerescue:skylineRescueGame,pacmaze:pacMazeGame,tetris:tetrisGame,
    merge2048:merge2048Game,memory:memoryGame,lights:lightsGame,mines:minesGame,sudoku:sudokuGame,
    tictactoe:ticTacToeGame,connect4:connectFourGame,reversi:reversiGame,checkers:checkersGame,
    battleship:battleshipGame,simon:simonGame,whack:whackGame,bubble:bubbleGame,
    basketball:basketballGame,archery:archeryGame,golf:golfGame,racer:racerGame,soccer:soccerGame,
    drawing:drawingGame,trivia:triviaGame,towerdefense:towerDefenseGame,platformer:platformerGame,
    sokoban:sokobanGame,hangman:hangmanGame,blackjack:blackjackGame,fruitmerge:fruitMergeGame,
    ...(window.EXTRA_GAME_FACTORIES||{})
  };
  const factory=factories[session.game.engine];
  if(!factory)throw new Error(`No gameplay engine exists for ${session.game.name}`);
  return factory(session);
}

const W=900,H=540;
function bg(c,color='#071020'){c.fillStyle=color;c.fillRect(0,0,W,H)}
function txt(c,value,x,y,size=24,color='#fff',align='center'){c.fillStyle=color;c.font=`800 ${size}px system-ui,Segoe UI,sans-serif`;c.textAlign=align;c.textBaseline='alphabetic';c.fillText(String(value),x,y)}
function rect(c,x,y,w,h,color,stroke=''){c.fillStyle=color;c.fillRect(x,y,w,h);if(stroke){c.strokeStyle=stroke;c.strokeRect(x,y,w,h)}}
function circle(c,x,y,r,color,stroke=''){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.stroke()}}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function rand(a,b){return a+Math.random()*(b-a)}
function hit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function keyDirection(k){return({ArrowLeft:[-1,0],KeyA:[-1,0],ArrowRight:[1,0],KeyD:[1,0],ArrowUp:[0,-1],KeyW:[0,-1],ArrowDown:[0,1],KeyS:[0,1]})[k]}
function buttonHit(p,b){return p.x>=b.x&&p.x<=b.x+b.w&&p.y>=b.y&&p.y<=b.y+b.h}
function seedForLevel(s,salt=0){let x=((s.level||1)*2654435761+salt*1013904223)>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296}}
function seededInt(rng,a,b){return Math.floor(a+rng()*(b-a+1))}

function snakeGame(s){
  const cols=30,rows=17,cell=28,ox=30,oy=54;let snake=[[8,8],[7,8],[6,8]],dir=[1,0],next=[1,0],fruit=[18,8],timer=0,score=0,target=7+Math.min(18,s.level);
  function place(){do{fruit=[Math.floor(Math.random()*cols),Math.floor(Math.random()*rows)]}while(snake.some(q=>q[0]===fruit[0]&&q[1]===fruit[1]))}
  function move(){dir=next;const h=[snake[0][0]+dir[0],snake[0][1]+dir[1]];if(h[0]<0||h[0]>=cols||h[1]<0||h[1]>=rows||snake.some(q=>q[0]===h[0]&&q[1]===h[1]))return failLevel(score*100);snake.unshift(h);if(h[0]===fruit[0]&&h[1]===fruit[1]){score++;place();if(score>=target)return completeLevel(score*120)}else snake.pop()}
  return{keyDown(k){const d=keyDirection(k);if(d&&!(d[0]===-dir[0]&&d[1]===-dir[1]))next=d},update(dt){timer+=dt;if(timer>Math.max(.105,.19-Math.min(40,s.level)*.002)){timer=0;move()}},draw(c){bg(c,'#071b22');rect(c,ox,oy,cols*cell,rows*cell,'#0d3030','#55d9b3');for(const q of snake)rect(c,ox+q[0]*cell+2,oy+q[1]*cell+2,cell-4,cell-4,q===snake[0]?'#ffe36b':'#48dfa3');circle(c,ox+(fruit[0]+.5)*cell,oy+(fruit[1]+.5)*cell,cell*.35,'#ff5579');txt(c,`Fruit ${score}/${target}`,450,35,23)}}
}

function brickGame(s){
  const paddle={x:380,y:490,w:140,h:18},ball={x:450,y:450,r:10,vx:230,vy:-260};let bricks=[],lives=3;const rows=4+Math.min(3,Math.floor(s.level/5)),cols=10;
  for(let r=0;r<rows;r++)for(let col=0;col<cols;col++)bricks.push({x:44+col*82,y:70+r*34,w:72,h:24,hp:1+(s.level>12&&r===0?1:0)});
  function resetBall(){Object.assign(ball,{x:paddle.x+paddle.w/2,y:440,vx:230*(Math.random()<.5?-1:1),vy:-270})}
  return{pointer(q,t){if(t==='pointerdown'||t==='pointermove')paddle.x=clamp(q.x-paddle.w/2,0,W-paddle.w)},update(dt){const speed=410;if(s.pressed('ArrowLeft','KeyA'))paddle.x-=speed*dt;if(s.pressed('ArrowRight','KeyD'))paddle.x+=speed*dt;paddle.x=clamp(paddle.x,0,W-paddle.w);ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;if(!Number.isFinite(ball.x+ball.y)){resetBall();return}if(ball.x<ball.r){ball.x=ball.r;ball.vx=Math.abs(ball.vx)}if(ball.x>W-ball.r){ball.x=W-ball.r;ball.vx=-Math.abs(ball.vx)}if(ball.y<55+ball.r){ball.y=55+ball.r;ball.vy=Math.abs(ball.vy)}if(ball.y>H+30){lives--;if(!lives)return failLevel(bricks.length);resetBall()}if(ball.vy>0&&ball.x>paddle.x&&ball.x<paddle.x+paddle.w&&ball.y+ball.r>paddle.y&&ball.y<paddle.y+paddle.h){ball.y=paddle.y-ball.r;ball.vy=-Math.abs(ball.vy);ball.vx=clamp(ball.vx+(ball.x-(paddle.x+paddle.w/2))*4,-620,620)}for(const b of [...bricks]){if(ball.x+ball.r>b.x&&ball.x-ball.r<b.x+b.w&&ball.y+ball.r>b.y&&ball.y-ball.r<b.y+b.h){b.hp--;ball.vy*=-1;if(b.hp<=0)bricks.splice(bricks.indexOf(b),1);break}}if(!bricks.length)completeLevel(lives*1000)},draw(c){bg(c,'#10142e');for(const b of bricks)rect(c,b.x,b.y,b.w,b.h,b.hp>1?'#ffb547':`hsl(${b.y} 80% 62%)`);rect(c,paddle.x,paddle.y,paddle.w,paddle.h,'#5ee6ff');circle(c,ball.x,ball.y,ball.r,'#fff');txt(c,`Bricks ${bricks.length} • Lives ${lives} • drag paddle`,450,35,22)}}
}

function pongGame(s){
  const p1={x:34,y:220,w:18,h:110,score:0},p2={x:848,y:220,w:18,h:110,score:0},ball={x:450,y:270,r:12,vx:330,vy:170},two=s.mode==='2P';function reset(dir){Object.assign(ball,{x:450,y:270,vx:330*dir,vy:rand(-220,220)})}
  return{pointer(p,t){if(t!=='pointerdown'&&t!=='pointermove')return;if(!two||p.x<W/2)p1.y=clamp(p.y-p1.h/2,55,H-p1.h);else p2.y=clamp(p.y-p2.h/2,55,H-p2.h)},update(dt){const v=380;if(s.pressed('KeyW'))p1.y-=v*dt;if(s.pressed('KeyS'))p1.y+=v*dt;if(two){if(s.pressed('ArrowUp'))p2.y-=v*dt;if(s.pressed('ArrowDown'))p2.y+=v*dt}else p2.y+=(ball.y-(p2.y+p2.h/2))*Math.min(1,dt*3.25);p1.y=clamp(p1.y,55,H-p1.h);p2.y=clamp(p2.y,55,H-p2.h);ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;if(ball.y<65||ball.y>H-12)ball.vy*=-1;for(const p of[p1,p2])if(ball.x+ball.r>p.x&&ball.x-ball.r<p.x+p.w&&ball.y>p.y&&ball.y<p.y+p.h){ball.vx=(p===p1?1:-1)*(Math.abs(ball.vx)+12);ball.vy+=(ball.y-(p.y+p.h/2))*4}if(ball.x<0){p2.score++;reset(1)}if(ball.x>W){p1.score++;reset(-1)}if(p1.score>=5||p2.score>=5)(p1.score>p2.score?completeLevel:failLevel)(p1.score*500)},draw(c){bg(c,'#081934');c.setLineDash([12,12]);c.strokeStyle='#6d86ac';c.beginPath();c.moveTo(450,55);c.lineTo(450,H);c.stroke();c.setLineDash([]);rect(c,p1.x,p1.y,p1.w,p1.h,'#42dcff');rect(c,p2.x,p2.y,p2.w,p2.h,'#ff5e86');circle(c,ball.x,ball.y,ball.r,'#ffe15e');txt(c,`${p1.score} — ${p2.score}${two?'':' • CPU'} • drag paddles`,450,38,24)}}
}

function invadersGame(s){
  const player={x:420,y:485,w:56,h:24},bullets=[],enemyBullets=[];let inv=[],dir=1,shootCd=0,enemyCd=.8;
  const rows=3+Math.min(2,Math.floor(s.level/7)),cols=9;for(let r=0;r<rows;r++)for(let col=0;col<cols;col++)inv.push({x:120+col*72,y:80+r*48,w:34,h:24});
  function shoot(){if(shootCd<=0){bullets.push({x:player.x+26,y:player.y,v:-500});shootCd=.25}}
  return{keyDown(k){if(k==='Space')shoot()},update(dt){shootCd-=dt;enemyCd-=dt;const v=330;if(s.pressed('ArrowLeft','KeyA'))player.x-=v*dt;if(s.pressed('ArrowRight','KeyD'))player.x+=v*dt;player.x=clamp(player.x,0,W-player.w);let edge=false;for(const e of inv){e.x+=dir*(35+Math.min(55,s.level*1.35))*dt;if(e.x<20||e.x+e.w>W-20)edge=true}if(edge){dir*=-1;for(const e of inv)e.y+=18}for(const b of bullets)b.y+=b.v*dt;for(const b of enemyBullets)b.y+=b.v*dt;for(const b of bullets)for(const e of inv)if(hit({x:b.x,y:b.y,w:5,h:12},e)){inv.splice(inv.indexOf(e),1);bullets.splice(bullets.indexOf(b),1);break}if(enemyCd<=0&&inv.length){const e=inv[Math.floor(Math.random()*inv.length)];enemyBullets.push({x:e.x+16,y:e.y+20,v:175+Math.min(105,s.level*2.6)});enemyCd=Math.max(.45,1.05-s.level*.015)}if(enemyBullets.some(b=>hit({x:b.x,y:b.y,w:5,h:12},player))||inv.some(e=>e.y+e.h>player.y))return failLevel((rows*cols-inv.length)*100);for(const list of[bullets,enemyBullets])for(let i=list.length-1;i>=0;i--)if(list[i].y<-20||list[i].y>H+20)list.splice(i,1);if(!inv.length)completeLevel(rows*cols*150)},draw(c){bg(c,'#060b22');for(const e of inv){rect(c,e.x,e.y,e.w,e.h,'#77ef86');circle(c,e.x+10,e.y+8,3,'#06131a');circle(c,e.x+24,e.y+8,3,'#06131a')}rect(c,player.x,player.y,player.w,player.h,'#4adfff');for(const b of bullets)rect(c,b.x,b.y,5,13,'#fff');for(const b of enemyBullets)rect(c,b.x,b.y,5,13,'#ff617d');txt(c,`Invaders ${inv.length}`,450,34,22)}}
}

function asteroidsGame(s){
  const ship={x:450,y:270,a:-Math.PI/2,vx:0,vy:0},shots=[];let rocks=[],spawn=()=>{for(let i=0;i<4+Math.min(8,s.level);i++)rocks.push({x:rand(0,W),y:rand(55,H),r:rand(18,38),vx:rand(-70,70),vy:rand(-70,70)})};spawn();let cd=0;
  function fire(){if(cd<=0){shots.push({x:ship.x,y:ship.y,vx:Math.cos(ship.a)*480,vy:Math.sin(ship.a)*480,life:1.4});cd=.2}}
  return{keyDown(k){if(k==='Space')fire()},update(dt){cd-=dt;if(s.pressed('ArrowLeft','KeyA'))ship.a-=3.4*dt;if(s.pressed('ArrowRight','KeyD'))ship.a+=3.4*dt;if(s.pressed('ArrowUp','KeyW')){ship.vx+=Math.cos(ship.a)*180*dt;ship.vy+=Math.sin(ship.a)*180*dt}ship.x=(ship.x+ship.vx*dt+W)%W;ship.y=55+((ship.y-55+ship.vy*dt+(H-55))%(H-55));ship.vx*=.995;ship.vy*=.995;for(const r of rocks){r.x=(r.x+r.vx*dt+W)%W;r.y=55+((r.y-55+r.vy*dt+(H-55))%(H-55));if(Math.hypot(r.x-ship.x,r.y-ship.y)<r.r+13)return failLevel(shots.length)}for(const q of shots){q.x=(q.x+q.vx*dt+W)%W;q.y=55+((q.y-55+q.vy*dt+(H-55))%(H-55));q.life-=dt;for(const r of rocks)if(Math.hypot(q.x-r.x,q.y-r.y)<r.r){rocks.splice(rocks.indexOf(r),1);shots.splice(shots.indexOf(q),1);break}}for(let i=shots.length-1;i>=0;i--)if(shots[i].life<=0)shots.splice(i,1);if(!rocks.length)completeLevel(2000)},draw(c){bg(c,'#050918');c.strokeStyle='#edf5ff';for(const r of rocks){c.beginPath();c.arc(r.x,r.y,r.r,0,7);c.stroke()}c.save();c.translate(ship.x,ship.y);c.rotate(ship.a);c.beginPath();c.moveTo(18,0);c.lineTo(-14,-12);c.lineTo(-8,0);c.lineTo(-14,12);c.closePath();c.strokeStyle='#4be3ff';c.stroke();c.restore();for(const q of shots)circle(c,q.x,q.y,3,'#ffe15f');txt(c,`Asteroids ${rocks.length}`,450,34,22)}}
}

function flappyGame(s){
  const bird={x:210,y:270,vy:0,r:15};let pipes=[],spawn=0,score=0,target=5+Math.min(15,s.level);
  function flap(){bird.vy=-330}
  return{keyDown(k){if(k==='Space'||k==='ArrowUp')flap()},pointer(p,t){if(t==='pointerdown')flap()},update(dt){bird.vy+=900*dt;bird.y+=bird.vy*dt;spawn-=dt;if(spawn<=0){const gap=165-Math.min(38,s.level*.95),mid=rand(150,H-150);pipes.push({x:W+20,mid,gap,passed:false});spawn=Math.max(1.35,1.8-s.level*.008)}for(const p of pipes){p.x-=(175+Math.min(65,s.level*1.6))*dt;if(!p.passed&&p.x<bird.x){p.passed=true;score++;if(score>=target)return completeLevel(score*250)}if(bird.x+bird.r>p.x&&bird.x-bird.r<p.x+70&&(bird.y-bird.r<p.mid-p.gap/2||bird.y+bird.r>p.mid+p.gap/2))return failLevel(score*100)}pipes=pipes.filter(p=>p.x>-90);if(bird.y<55||bird.y>H)return failLevel(score*100)},draw(c){bg(c,'#77c9ff');rect(c,0,H-34,W,34,'#6ac34c');for(const p of pipes){rect(c,p.x,55,70,p.mid-p.gap/2-55,'#2ebc5b');rect(c,p.x,p.mid+p.gap/2,70,H-(p.mid+p.gap/2),'#2ebc5b')}circle(c,bird.x,bird.y,bird.r,'#ffe45d','#c48819');txt(c,`${score}/${target}`,450,36,24,'#12335b')}}
}

function dinoGame(s){
  const ground=492,d={x:120,y:440,w:48,h:52,vy:0,duck:false};let obs=[],spawn=0,dist=0,target=14+Math.min(20,s.level),lastType='cactus';
  function jump(){if(d.y>=439&&!d.duck)d.vy=-560}
  function spawnObstacle(){
    // Low birds intersect the standing dinosaur but pass safely above its ducking hitbox.
    const useBird=dist>2&&Math.random()<(lastType==='bird'?.18:.38);
    if(useBird){obs.push({type:'bird',x:W+20,y:438,w:54,h:22,v:235+Math.min(125,s.level*3.1),wing:0});lastType='bird'}
    else{obs.push({type:'cactus',x:W+20,y:438,w:30,h:54,v:235+Math.min(125,s.level*3.1)});lastType='cactus'}
  }
  return{
    keyDown(k){if(k==='Space'||k==='ArrowUp'||k==='KeyW')jump();if((k==='ArrowDown'||k==='KeyS')&&d.y<439)d.vy=Math.max(d.vy,430)},
    update(dt){
      d.duck=s.pressed('ArrowDown','KeyS');
      // Pressing down in the air creates a fast-drop, making duck controls useful and responsive.
      if(d.duck&&d.y<439)d.vy=Math.max(d.vy,430);
      d.vy+=1250*dt;d.y+=d.vy*dt;if(d.y>440){d.y=440;d.vy=0}
      spawn-=dt;if(spawn<=0){spawnObstacle();spawn=rand(1.0,1.65)}
      for(const o of obs){o.x-=o.v*dt;if(o.type==='bird')o.wing=(o.wing||0)+dt*12}
      const box={x:d.x+4,y:d.duck?d.y+25:d.y+3,w:d.w-8,h:d.duck?25:d.h-5};
      if(obs.some(o=>hit(box,{x:o.x+2,y:o.y+2,w:o.w-4,h:o.h-4})))return failLevel(dist*100);
      obs=obs.filter(o=>o.x>-80);dist+=dt;if(dist>=target)completeLevel(dist*150)
    },
    draw(c){
      bg(c,'#f4e5c0');rect(c,0,ground,W,H-ground,'#bc8c50');
      // Dinosaur body visibly crouches while Down/S is held.
      rect(c,d.x,d.duck?d.y+25:d.y,d.w,d.duck?27:d.h,'#2c8752');
      for(const o of obs){
        if(o.type==='bird'){
          rect(c,o.x+9,o.y+6,36,14,'#8a5e3c');
          const flap=Math.sin(o.wing||0)>0?0:7;
          rect(c,o.x,o.y+flap,20,7,'#6f482d');rect(c,o.x+34,o.y+flap,20,7,'#6f482d');
        }else rect(c,o.x,o.y,o.w,o.h,'#2d9c52')
      }
      txt(c,`Distance ${Math.floor(dist)}/${target}`,450,36,22,'#47351e');
      txt(c,'Up/Space: jump   •   Down: duck',450,68,17,'#47351e')
    },
    debugState(){return{duck:d.duck,dinoBox:{x:d.x+4,y:d.duck?d.y+25:d.y+3,w:d.w-8,h:d.duck?25:d.h-5},obstacles:obs.map(o=>({...o}))}}
  }
}

function skylineRescueGame(s){
  const rng=seedForLevel(s,711),buildings=[],survivors=[];
  const width=95,gap=15,startX=14,target=3+Math.min(3,Math.floor((s.level-1)/8));
  for(let i=0;i<8;i++){
    const height=i===0?86:seededInt(rng,105,245+Math.min(45,s.level));
    buildings.push({x:startX+i*(width+gap),y:H-height,w:width,h:height,base:i===0});
  }
  const choices=[2,3,4,5,6,7];
  for(let i=choices.length-1;i>0;i--){const j=seededInt(rng,0,i);[choices[i],choices[j]]=[choices[j],choices[i]]}
  for(const index of choices.slice(0,target)){const b=buildings[index];survivors.push({building:index,x:b.x+b.w/2,y:b.y-10,picked:false,delivered:false})}
  const base=buildings[0],heli={x:base.x+base.w/2-28,y:base.y-62,w:56,h:26};
  let carried=null,delivered=0,fuel=72+target*15,time=0,actionReady=true;
  function closeToRoof(b){const cx=heli.x+heli.w/2,bx=b.x+b.w/2,feet=heli.y+heli.h;return Math.abs(cx-bx)<62&&Math.abs(feet-(b.y-8))<48}
  function action(){
    if(!actionReady)return;actionReady=false;
    if(carried){
      if(closeToRoof(base)){carried.delivered=true;carried=null;delivered++;if(delivered>=target)completeLevel(Math.max(500,Math.round(fuel*35+s.level*40)))}
      return;
    }
    const q=survivors.find(person=>!person.picked&&!person.delivered&&closeToRoof(buildings[person.building]));
    if(q){q.picked=true;carried=q}
  }
  function collision(){const box={x:heli.x+5,y:heli.y+4,w:heli.w-10,h:heli.h-6};return buildings.some(b=>box.x<b.x+b.w-5&&box.x+box.w>b.x+5&&box.y+box.h>b.y+4)}
  return{
    keyDown(k){if(k==='Space'||k==='Enter')action()},
    keyUp(k){if(k==='Space'||k==='Enter')actionReady=true},
    update(dt){
      time+=dt;let dx=0,dy=0;if(s.pressed('ArrowLeft','KeyA'))dx--;if(s.pressed('ArrowRight','KeyD'))dx++;if(s.pressed('ArrowUp','KeyW'))dy--;if(s.pressed('ArrowDown','KeyS'))dy++;
      const length=Math.hypot(dx,dy)||1,speed=225;heli.x+=dx/length*speed*dt;heli.y+=dy/length*speed*dt;
      const wind=Math.sin(time*.8+s.level)*Math.min(18,3+s.level*.35);heli.x+=wind*dt;
      heli.x=clamp(heli.x,2,W-heli.w-2);heli.y=clamp(heli.y,58,H-heli.h-8);
      fuel-=dt*(dx||dy?1.18:.52);
      if(collision()||fuel<=0)return failLevel(delivered*500);
    },
    draw(c){
      bg(c,'#72c8f1');
      circle(c,110,105,38,'#ffe27a');
      for(let i=0;i<9;i++){const x=(i*127+time*9)%1020-60;circle(c,x,92+(i%3)*28,18,'#eaf8ff');circle(c,x+22,92+(i%3)*28,25,'#eaf8ff')}
      rect(c,0,H-32,W,32,'#24445b');
      for(const b of buildings){rect(c,b.x,b.y,b.w,b.h,b.base?'#2e8f76':'#344d70','#172b43');for(let y=b.y+24;y<H-42;y+=34)for(let x=b.x+14;x<b.x+b.w-12;x+=28)rect(c,x,y,12,17,(x+y)%3?'#ffd76a':'#8ed8ff');if(b.base){rect(c,b.x+10,b.y-8,b.w-20,10,'#f6f8ff');txt(c,'RESCUE BASE',b.x+b.w/2,b.y+26,12,'#fff')}}
      for(const person of survivors){if(person.delivered||person.picked)continue;txt(c,'🧍',person.x,person.y,25)}
      if(carried)txt(c,'🧍',heli.x+heli.w/2,heli.y+heli.h+18,20);
      c.save();c.translate(heli.x,heli.y);rect(c,0,8,48,18,'#ff5f66','#7c2634');rect(c,42,13,18,7,'#ffcf56');rect(c,8,4,24,10,'#dff8ff');rect(c,18,0,4,8,'#263447');c.strokeStyle='#263447';c.lineWidth=4;c.beginPath();c.moveTo(-12,0);c.lineTo(52,0);c.stroke();c.beginPath();c.moveTo(11,28);c.lineTo(46,28);c.stroke();c.restore();
      txt(c,`Rescued ${delivered}/${target} • Fuel ${Math.max(0,Math.ceil(fuel))}`,450,34,21,'#17334d');
      txt(c,carried?'Return to the RESCUE BASE and press action':'Hover over a survivor and press action',450,61,16,'#17334d');
    },
    debugState(){return{delivered,target,fuel,carried:!!carried,buildings:buildings.length,survivors:survivors.length}}
  }
}

function pacMazeGame(s){
  const rows=13,cols=17,rng=seedForLevel(s,904),map=Array.from({length:rows},()=>Array(cols).fill('#'));
  const dirs=[[2,0],[-2,0],[0,2],[0,-2]],stack=[[1,1]];map[1][1]='.';
  while(stack.length){const [r,c]=stack[stack.length-1],options=dirs.map(([dr,dc])=>[r+dr,c+dc,dr,dc]).filter(q=>q[0]>0&&q[0]<rows-1&&q[1]>0&&q[1]<cols-1&&map[q[0]][q[1]]==='#');if(!options.length){stack.pop();continue}const q=options[Math.floor(rng()*options.length)];map[r+q[2]/2][c+q[3]/2]='.';map[q[0]][q[1]]='.';stack.push([q[0],q[1]])}
  // Open a few extra loops so ghosts cannot trap the player in a single corridor.
  for(let i=0;i<8+Math.floor(s.level/4);i++){const r=1+2*seededInt(rng,0,5),c=2+2*seededInt(rng,0,6);if(map[r]?.[c])map[r][c]='.'}
  map[1][1]='o';map[rows-2][cols-2]='o';const cell=38,ox=127,oy=49,p={r:rows-2,c:1},ghosts=[{r:1,c:cols-2},{r:rows-2,c:cols-2}],pellets=new Set();for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if(map[r][c]==='.'||map[r][c]==='o')pellets.add(`${r},${c}`);pellets.delete(`${p.r},${p.c}`);let timer=0,power=0;
  function move(k){const d=keyDirection(k);if(!d)return;const nr=p.r+d[1],nc=p.c+d[0];if(map[nr]?.[nc]!=='#'){p.r=nr;p.c=nc;const key=`${nr},${nc}`;if(pellets.delete(key)&&map[nr][nc]==='o')power=5;if(!pellets.size)completeLevel(3000)}}
  return{keyDown:move,update(dt){timer+=dt;power=Math.max(0,power-dt);if(timer>Math.max(.22,.38-s.level*.003)){timer=0;for(const g of ghosts){let choices=[[1,0],[-1,0],[0,1],[0,-1]].filter(d=>map[g.r+d[1]]?.[g.c+d[0]]!=='#');choices.sort((a,b)=>(Math.abs(p.r-(g.r+a[1]))+Math.abs(p.c-(g.c+a[0])))-(Math.abs(p.r-(g.r+b[1]))+Math.abs(p.c-(g.c+b[0]))));const d=rng()<.72?choices[0]:choices[Math.floor(rng()*choices.length)];g.c+=d[0];g.r+=d[1];if(g.r===p.r&&g.c===p.c){if(power){g.r=1;g.c=cols-2}else return failLevel(pellets.size)}}}},draw(c){bg(c,'#020412');for(let r=0;r<rows;r++)for(let col=0;col<cols;col++){const x=ox+col*cell,y=oy+r*cell;if(map[r][col]==='#')rect(c,x,y,cell,cell,'#183ec6');else if(pellets.has(`${r},${col}`))circle(c,x+cell/2,y+cell/2,map[r][col]==='o'?6:3,'#ffeab0')}circle(c,ox+(p.c+.5)*cell,oy+(p.r+.5)*cell,14,'#ffe13b');for(const g of ghosts)circle(c,ox+(g.c+.5)*cell,oy+(g.r+.5)*cell,14,power?'#79bfff':'#ff5476');txt(c,`Maze ${s.level}/40 • Pellets ${pellets.size}`,450,34,20)}}
}

function tetrisGame(s){
  const C=10,R=20,cell=23,ox=335,oy=65,board=Array.from({length:R},()=>Array(C).fill(0));const shapes=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]]];let piece,newPiece,fall=0,lines=0,target=3+Math.floor(s.level/2);
  function spawn(){piece={shape:shapes[Math.floor(Math.random()*shapes.length)].map(r=>r.slice()),x:3,y:0,color:1+Math.floor(Math.random()*6)};if(collide(piece.x,piece.y,piece.shape))failLevel(lines*300)}function collide(x,y,sh){for(let r=0;r<sh.length;r++)for(let c=0;c<sh[r].length;c++)if(sh[r][c]&&(x+c<0||x+c>=C||y+r>=R||(y+r>=0&&board[y+r][x+c])))return true;return false}function lock(){for(let r=0;r<piece.shape.length;r++)for(let c=0;c<piece.shape[r].length;c++)if(piece.shape[r][c]&&piece.y+r>=0)board[piece.y+r][piece.x+c]=piece.color;for(let r=R-1;r>=0;r--)if(board[r].every(Boolean)){board.splice(r,1);board.unshift(Array(C).fill(0));lines++;r++}if(lines>=target)return completeLevel(lines*500);spawn()}function drop(){while(!collide(piece.x,piece.y+1,piece.shape))piece.y++;lock()}function rotate(){const sh=piece.shape[0].map((_,i)=>piece.shape.map(r=>r[i]).reverse());if(!collide(piece.x,piece.y,sh))piece.shape=sh}spawn();
  return{keyDown(k){if(k==='ArrowLeft'&&!collide(piece.x-1,piece.y,piece.shape))piece.x--;if(k==='ArrowRight'&&!collide(piece.x+1,piece.y,piece.shape))piece.x++;if(k==='ArrowDown'){if(!collide(piece.x,piece.y+1,piece.shape))piece.y++;else lock()}if(k==='ArrowUp'||k==='Enter')rotate();if(k==='Space')drop()},update(dt){fall+=dt;if(fall>Math.max(.26,.72-s.level*.0115)){fall=0;if(!collide(piece.x,piece.y+1,piece.shape))piece.y++;else lock()}},draw(c){bg(c,'#12152b');rect(c,ox,oy,C*cell,R*cell,'#080b18','#7188c8');for(let r=0;r<R;r++)for(let col=0;col<C;col++)if(board[r][col])rect(c,ox+col*cell+1,oy+r*cell+1,cell-2,cell-2,`hsl(${board[r][col]*48} 80% 58%)`);for(let r=0;r<piece.shape.length;r++)for(let col=0;col<piece.shape[r].length;col++)if(piece.shape[r][col])rect(c,ox+(piece.x+col)*cell+1,oy+(piece.y+r)*cell+1,cell-2,cell-2,`hsl(${piece.color*48} 80% 62%)`);txt(c,`Lines ${lines}/${target}`,450,38,22)}}
}

function merge2048Game(s){
  const n=4,g=Array.from({length:n},()=>Array(n).fill(0));let score=0,target=Math.min(2048,32*2**Math.floor((s.level-1)/3));function add(){const e=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(!g[r][c])e.push([r,c]);if(e.length){const q=e[Math.floor(Math.random()*e.length)];g[q[0]][q[1]]=Math.random()<.9?2:4}}function slide(a){a=a.filter(Boolean);for(let i=0;i<a.length-1;i++)if(a[i]===a[i+1]){a[i]*=2;score+=a[i];a.splice(i+1,1)}while(a.length<n)a.push(0);return a}function move(d){const old=JSON.stringify(g);if(d==='L')for(let r=0;r<n;r++)g[r]=slide(g[r]);if(d==='R')for(let r=0;r<n;r++)g[r]=slide([...g[r]].reverse()).reverse();if(d==='U'||d==='D')for(let c=0;c<n;c++){let a=g.map(r=>r[c]);if(d==='D')a.reverse();a=slide(a);if(d==='D')a.reverse();for(let r=0;r<n;r++)g[r][c]=a[r]}if(JSON.stringify(g)!==old)add();if(Math.max(...g.flat())>=target)completeLevel(score)}add();add();
  return{keyDown(k){const d={ArrowLeft:'L',KeyA:'L',ArrowRight:'R',KeyD:'R',ArrowUp:'U',KeyW:'U',ArrowDown:'D',KeyS:'D'}[k];if(d)move(d)},pointer(p,t){if(t==='pointerdown')this.start={...p};else if(t==='pointermove'&&this.start&&Math.hypot(p.x-this.start.x,p.y-this.start.y)>60){const dx=p.x-this.start.x,dy=p.y-this.start.y;move(Math.abs(dx)>Math.abs(dy)?(dx>0?'R':'L'):(dy>0?'D':'U'));this.start=null}},draw(c){bg(c,'#30283c');const cell=105,ox=240,oy=70;for(let r=0;r<n;r++)for(let col=0;col<n;col++){const v=g[r][col];rect(c,ox+col*cell+5,oy+r*cell+5,cell-10,cell-10,v?`hsl(${35+Math.log2(v)*22} 75% 58%)`:'#51485e');if(v)txt(c,v,ox+(col+.5)*cell,oy+(r+.64)*cell,28,'#fff')}txt(c,`Target ${target} • Score ${score}`,450,38,22)}}
}

function memoryGame(s){
  const pairs=6+Math.min(6,Math.floor(s.level/3)),cols=6,vals=[...Array(pairs).keys(),...Array(pairs).keys()].sort(()=>Math.random()-.5);let open=[],matched=new Set(),moves=0,busy=false;
  return{pointer(p,t){if(t!=='pointerdown'||busy)return;const cell=72,ox=(W-cols*cell)/2,oy=65,idx=Math.floor((p.y-oy)/cell)*cols+Math.floor((p.x-ox)/cell);if(idx<0||idx>=vals.length||matched.has(idx)||open.includes(idx))return;open.push(idx);if(open.length===2){moves++;if(vals[open[0]]===vals[open[1]]){open.forEach(i=>matched.add(i));open=[];if(matched.size===vals.length)completeLevel(2200-moves*25)}else{busy=true;setTimeout(()=>{open=[];busy=false},550)}}},draw(c){bg(c,'#16254a');const cell=72,ox=(W-cols*cell)/2,oy=65;for(let i=0;i<vals.length;i++){const r=Math.floor(i/cols),col=i%cols,show=open.includes(i)||matched.has(i);rect(c,ox+col*cell+4,oy+r*cell+4,cell-8,cell-8,show?'#4bdfff':'#334a78');if(show)txt(c,['★','◆','●','▲','♥','☀','♫','⚡','☂','✿','☯','♛'][vals[i]],ox+(col+.5)*cell,oy+(r+.67)*cell,30)}txt(c,`Pairs ${matched.size/2}/${pairs} • Moves ${moves}`,450,38,22)}}
}

function lightsGame(s){
  const n=5+(s.level>12?1:0),g=Array.from({length:n},()=>Array(n).fill(false));let moves=0;function toggle(r,c){for(const[dr,dc]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])if(g[r+dr]?.[c+dc]!==undefined)g[r+dr][c+dc]=!g[r+dr][c+dc]}for(let i=0;i<8+s.level;i++)toggle(Math.floor(Math.random()*n),Math.floor(Math.random()*n));
  return{pointer(p,t){if(t!=='pointerdown')return;const cell=Math.min(76,420/n),ox=(W-cell*n)/2,oy=70,r=Math.floor((p.y-oy)/cell),col=Math.floor((p.x-ox)/cell);if(g[r]?.[col]!==undefined){toggle(r,col);moves++;if(g.every(row=>row.every(v=>!v)))completeLevel(1800-moves*20)}},draw(c){bg(c,'#0d2a3c');const cell=Math.min(76,420/n),ox=(W-cell*n)/2,oy=70;for(let r=0;r<n;r++)for(let col=0;col<n;col++)rect(c,ox+col*cell+4,oy+r*cell+4,cell-8,cell-8,g[r][col]?'#ffe263':'#173b57');txt(c,`Moves ${moves}`,450,38,22)}}
}

function minesGame(s){
  const n=s.level>12?10:8,mines=Math.min(n*n-12,8+Math.floor(s.level/2)),cell=Math.min(48,420/n),ox=(W-cell*n)/2,oy=70;let g=Array.from({length:n},()=>Array.from({length:n},()=>({mine:false,open:false,flag:false,n:0}))),left=mines,flagMode=false,initialized=false;
  function initialize(safeR,safeC){const rng=seedForLevel(s,141),blocked=new Set();for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)blocked.add(`${safeR+dr},${safeC+dc}`);let k=0;while(k<mines){const r=seededInt(rng,0,n-1),c=seededInt(rng,0,n-1);if(!blocked.has(`${r},${c}`)&&!g[r][c].mine){g[r][c].mine=true;k++}}for(let r=0;r<n;r++)for(let c=0;c<n;c++)g[r][c].n=[-1,0,1].flatMap(dr=>[-1,0,1].map(dc=>g[r+dr]?.[c+dc]?.mine?1:0)).reduce((a,b)=>a+b,0);initialized=true}
  function open(r,c){const q=g[r]?.[c];if(!q||q.open||q.flag)return;if(!initialized)initialize(r,c);if(q.mine)return failLevel(0);q.open=true;if(q.n===0)for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(dr||dc)open(r+dr,c+dc);if(g.flat().filter(x=>!x.mine&&x.open).length===n*n-mines)completeLevel(2500)}
  function act(r,c){const q=g[r]?.[c];if(!q)return;if(flagMode){if(q.open)return;q.flag=!q.flag;left+=q.flag?-1:1}else open(r,c)}
  return{keyDown(k){if(k==='Enter'||k==='Space')flagMode=!flagMode},pointer(p,t){if(t!=='pointerdown')return;act(Math.floor((p.y-oy)/cell),Math.floor((p.x-ox)/cell))},draw(c){bg(c,'#172638');for(let r=0;r<n;r++)for(let col=0;col<n;col++){const q=g[r][col],x=ox+col*cell,y=oy+r*cell;rect(c,x+1,y+1,cell-2,cell-2,q.open?'#cad7df':'#4b6780');if(q.flag)txt(c,'⚑',x+cell/2,y+cell*.72,cell*.58,'#ffdd55');else if(q.open&&q.n)txt(c,q.n,x+cell/2,y+cell*.7,cell*.5,['#42a5f5','#4caf50','#f44336','#7e57c2'][Math.min(3,q.n-1)])}txt(c,`${flagMode?'FLAG':'REVEAL'} mode • Flags ${left} • First reveal is safe`,450,38,20)}}
}

function sudokuGame(s){
  const base=2,n=4,rng=seedForLevel(s,166),symbols=[1,2,3,4];for(let i=3;i>0;i--){const j=seededInt(rng,0,i);[symbols[i],symbols[j]]=[symbols[j],symbols[i]]}const rowOrder=(s.level%2)?[0,1,2,3]:[2,3,0,1],colOrder=(Math.floor(s.level/2)%2)?[0,1,2,3]:[2,3,0,1],latin=[[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]],solution=rowOrder.map(r=>colOrder.map(c=>symbols[latin[r][c]-1])),g=solution.map(r=>r.slice()),fixed=Array.from({length:n},()=>Array(n).fill(true)),cells=[...Array(16).keys()];for(let i=cells.length-1;i>0;i--){const j=seededInt(rng,0,i);[cells[i],cells[j]]=[cells[j],cells[i]]}const blanks=7+Math.min(4,Math.floor(s.level/5));for(const i of cells.slice(0,blanks)){const r=Math.floor(i/n),c=i%n;g[r][c]=0;fixed[r][c]=false}let selected=null,value=1;
  function valid(){return g.flat().every(Boolean)&&JSON.stringify(g)===JSON.stringify(solution)}function set(v){if(selected&&!fixed[selected[0]][selected[1]]){g[selected[0]][selected[1]]=v;if(valid())completeLevel(2000)}}
  return{keyDown(k){if(k==='Space'||k==='Enter'){value=value%n+1;set(value)}if(/^Digit[1-4]$/.test(k))set(+k.slice(-1))},pointer(p,t){if(t!=='pointerdown')return;const cell=100,ox=250,oy=70,r=Math.floor((p.y-oy)/cell),c=Math.floor((p.x-ox)/cell);if(g[r]?.[c]!==undefined){selected=[r,c];if(!fixed[r][c]){value=value%n+1;set(value)}}},draw(c){bg(c,'#f1f3f8');const cell=100,ox=250,oy=70;for(let r=0;r<n;r++)for(let col=0;col<n;col++){rect(c,ox+col*cell,oy+r*cell,cell,cell,selected&&selected[0]===r&&selected[1]===col?'#d9ecff':'#fff','#41536e');if(g[r][col])txt(c,g[r][col],ox+(col+.5)*cell,oy+(r+.65)*cell,34,fixed[r][col]?'#1e2e45':'#168cc7')}c.lineWidth=4;c.strokeStyle='#1e2e45';for(let i=0;i<=n;i+=base){c.beginPath();c.moveTo(ox,oy+i*cell);c.lineTo(ox+n*cell,oy+i*cell);c.stroke();c.beginPath();c.moveTo(ox+i*cell,oy);c.lineTo(ox+i*cell,oy+n*cell);c.stroke()}txt(c,`Level ${s.level} • Tap blanks or press 1–4`,450,38,20,'#1e2e45')}}
}

const TTT_WINS=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function ticTacToeWinner(board){for(const w of TTT_WINS)if(board[w[0]]&&board[w[0]]===board[w[1]]&&board[w[1]]===board[w[2]])return board[w[0]];return board.every(Boolean)?3:0}
function ticTacToeBestMove(board){
  const memo=new Map();
  function search(turn,depth,alpha,beta){
    const result=ticTacToeWinner(board);
    if(result===2)return 10-depth;
    if(result===1)return depth-10;
    if(result===3)return 0;
    const key=`${board.join('')}:${turn}`;if(memo.has(key))return memo.get(key);
    let best=turn===2?-Infinity:Infinity;
    const order=[4,0,2,6,8,1,3,5,7];
    for(const i of order){if(board[i])continue;board[i]=turn;const score=search(turn===2?1:2,depth+1,alpha,beta);board[i]=0;
      if(turn===2){best=Math.max(best,score);alpha=Math.max(alpha,best)}else{best=Math.min(best,score);beta=Math.min(beta,best)}
      if(beta<=alpha)break;
    }
    memo.set(key,best);return best;
  }
  let bestScore=-Infinity,bestMove=-1;
  for(const i of[4,0,2,6,8,1,3,5,7]){if(board[i])continue;board[i]=2;const score=search(1,0,-Infinity,Infinity);board[i]=0;if(score>bestScore){bestScore=score;bestMove=i}}
  return bestMove;
}
function ticTacToeGame(s){
  const b=Array(9).fill(0),two=s.mode==='2P';let busy=false,ended=false,turn=1;
  function finish(){const w=ticTacToeWinner(b);if(!w)return false;ended=true;if(w===1)completeLevel(1500);else if(w===2)(two?completeLevel:failLevel)(two?1200:0);else failLevel(700);return true}
  function ai(){if(ended||s.completed)return;const i=ticTacToeBestMove(b);if(i>=0)b[i]=2;busy=false;finish()}
  function play(i){if(busy||ended||s.completed||b[i])return;b[i]=turn;if(finish())return;if(two){turn=3-turn}else{busy=true;setTimeout(ai,180)}}
  return{pointer(p,t){if(t!=='pointerdown')return;const cell=130,ox=255,oy=75,i=Math.floor((p.y-oy)/cell)*3+Math.floor((p.x-ox)/cell);if(i>=0&&i<9)play(i)},draw(c){bg(c,'#152344');const cell=130,ox=255,oy=75;c.strokeStyle='#8ee9ff';c.lineWidth=5;for(let i=1;i<3;i++){c.beginPath();c.moveTo(ox+i*cell,oy);c.lineTo(ox+i*cell,oy+3*cell);c.stroke();c.beginPath();c.moveTo(ox,oy+i*cell);c.lineTo(ox+3*cell,oy+i*cell);c.stroke()}for(let i=0;i<9;i++){const x=ox+(i%3+.5)*cell,y=oy+(Math.floor(i/3)+.65)*cell;if(b[i])txt(c,b[i]===1?'X':'O',x,y,70,b[i]===1?'#4ce3ff':'#ff6689')}txt(c,two?`Player ${turn} turn`:busy?'Computer thinking…':'Unbeatable bot',450,38,20,'#d7e7ff')}}
}

function connectFourGame(s){
  const R=6,C=7,b=Array.from({length:R},()=>Array(C).fill(0)),two=s.mode==='2P';let busy=false,turn=1;
  function win(w){for(let r=0;r<R;r++)for(let c=0;c<C;c++)for(const[dr,dc]of[[0,1],[1,0],[1,1],[1,-1]])if([0,1,2,3].every(k=>b[r+dr*k]?.[c+dc*k]===w))return true;return false}
  function drop(col,w){for(let r=R-1;r>=0;r--)if(!b[r][col]){b[r][col]=w;return r}return -1}
  function chooseAI(){const cols=[0,1,2,3,4,5,6].filter(c=>!b[0][c]);for(const who of[2,1])for(const c of cols){const r=drop(c,who),winning=win(who);b[r][c]=0;if(winning)return c}return cols.sort((a,d)=>Math.abs(a-3)-Math.abs(d-3))[0]}
  function finish(w){if(win(w)){w===1||two?completeLevel(1800):failLevel(0);return true}if(b.flat().every(Boolean)){failLevel(600);return true}return false}
  function play(col){if(busy||col<0||col>=C)return;const r=drop(col,turn);if(r<0)return;if(finish(turn))return;if(two){turn=3-turn;return}busy=true;setTimeout(()=>{const c=chooseAI();if(c===undefined)return failLevel(600);drop(c,2);busy=false;finish(2)},260)}
  return{pointer(p,t){if(t==='pointerdown')play(Math.floor((p.x-205)/70))},keyDown(k){const col={Digit1:0,Digit2:1,Digit3:2,Digit4:3,Digit5:4,Digit6:5,Digit7:6}[k];if(col!==undefined)play(col)},draw(c){bg(c,'#142147');const ox=205,oy=75,cell=70;rect(c,ox,oy,C*cell,R*cell,'#1d59b5');for(let r=0;r<R;r++)for(let col=0;col<C;col++)circle(c,ox+(col+.5)*cell,oy+(r+.5)*cell,25,b[r][col]===1?'#ffe15b':b[r][col]===2?'#ff5d73':'#09162d');txt(c,two?`Player ${turn} turn`:busy?'Computer thinking…':'Your turn',450,38,20)}}
}

function reversiGame(s){
  const n=8,b=Array.from({length:n},()=>Array(n).fill(0)),two=s.mode==='2P';b[3][3]=b[4][4]=2;b[3][4]=b[4][3]=1;let turn=1,busy=false;const dirs=[-1,0,1].flatMap(a=>[-1,0,1].map(d=>[a,d])).filter(x=>x[0]||x[1]);
  function flips(r,c,w){if(b[r]?.[c])return[];let out=[];for(const[dr,dc]of dirs){let q=[],rr=r+dr,cc=c+dc;while(b[rr]?.[cc]===3-w){q.push([rr,cc]);rr+=dr;cc+=dc}if(q.length&&b[rr]?.[cc]===w)out.push(...q)}return out}function moves(w){const m=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(flips(r,c,w).length)m.push([r,c]);return m}function play(r,c,w){const f=flips(r,c,w);if(!f.length)return false;b[r][c]=w;f.forEach(q=>b[q[0]][q[1]]=w);return true}
  function end(){if(moves(1).length||moves(2).length)return false;const a=b.flat().filter(x=>x===1).length,d=b.flat().filter(x=>x===2).length;(a>=d?completeLevel:failLevel)(a*100);return true}
  function next(){if(end())return;if(two){turn=3-turn;if(!moves(turn).length)turn=3-turn;return}busy=true;setTimeout(()=>{const m=moves(2).sort((a,d)=>flips(d[0],d[1],2).length-flips(a[0],a[1],2).length);if(m.length)play(m[0][0],m[0][1],2);busy=false;end()},250)}
  function user(r,c){if(busy||!play(r,c,turn))return;next()}
  return{pointer(p,t){if(t!=='pointerdown')return;const cell=52,ox=242,oy=70;user(Math.floor((p.y-oy)/cell),Math.floor((p.x-ox)/cell))},draw(c){bg(c,'#0a4a38');const cell=52,ox=242,oy=70;for(let r=0;r<n;r++)for(let col=0;col<n;col++){rect(c,ox+col*cell,oy+r*cell,cell,cell,'#147254','#0b3d30');if(b[r][col])circle(c,ox+(col+.5)*cell,oy+(r+.5)*cell,20,b[r][col]===1?'#f5f5f5':'#151515')}txt(c,two?`Player ${turn} • White ${b.flat().filter(x=>x===1).length} • Black ${b.flat().filter(x=>x===2).length}`:`You ${b.flat().filter(x=>x===1).length} • Computer ${b.flat().filter(x=>x===2).length}`,450,38,20)}}
}


function checkersGame(s){
  const n=8,b=Array.from({length:n},()=>Array(n).fill(0));for(let r=0;r<3;r++)for(let c=0;c<n;c++)if((r+c)%2)b[r][c]=2;for(let r=5;r<n;r++)for(let c=0;c<n;c++)if((r+c)%2)b[r][c]=1;let selected=null,turn=1;
  const owner=v=>v===1||v===3?1:v===2||v===4?2:0,king=v=>v===3||v===4;
  function moves(r,c){const piece=b[r]?.[c],who=owner(piece);if(!who)return[];const dirs=king(piece)?[-1,1]:[who===1?-1:1];let out=[];for(const dr of dirs)for(const dc of[-1,1]){if(b[r+dr]?.[c+dc]===0)out.push([r+dr,c+dc,false]);const mid=b[r+dr]?.[c+dc];if(mid&&owner(mid)!==who&&b[r+2*dr]?.[c+2*dc]===0)out.push([r+2*dr,c+2*dc,true])}return out}
  function promote(r,c){if(b[r][c]===1&&r===0)b[r][c]=3;if(b[r][c]===2&&r===7)b[r][c]=4}
  function playerAction(r,c){if(s.mode!=='2P'&&turn!==1)return;if(owner(b[r]?.[c])===turn){selected=[r,c];return}if(!selected)return;const m=moves(...selected).find(q=>q[0]===r&&q[1]===c);if(!m)return;const[rr,cc]=selected;b[r][c]=b[rr][cc];b[rr][cc]=0;if(m[2])b[(r+rr)/2][(c+cc)/2]=0;promote(r,c);selected=null;if(!b.flat().some(x=>owner(x)===3-turn))return completeLevel(2000);turn=3-turn;if(s.mode!=='2P')setTimeout(ai,260)}
  function ai(){let all=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(owner(b[r][c])===2)for(const m of moves(r,c))all.push([r,c,...m]);if(!all.length)return completeLevel(2000);all.sort((a,d)=>Number(d[4])-Number(a[4]));const[r,c,nr,nc,cap]=all[0];b[nr][nc]=b[r][c];b[r][c]=0;if(cap)b[(r+nr)/2][(c+nc)/2]=0;promote(nr,nc);turn=1;if(!b.flat().some(x=>owner(x)===1))failLevel(0)}
  return{pointer(p,t){if(t!=='pointerdown')return;const cell=54,ox=234,oy=65;playerAction(Math.floor((p.y-oy)/cell),Math.floor((p.x-ox)/cell))},draw(c){bg(c,'#2c1c1c');const cell=54,ox=234,oy=65;for(let r=0;r<n;r++)for(let col=0;col<n;col++){rect(c,ox+col*cell,oy+r*cell,cell,cell,(r+col)%2?'#77452f':'#e9c79c');if(b[r][col]){circle(c,ox+(col+.5)*cell,oy+(r+.5)*cell,20,owner(b[r][col])===1?'#f1f1f1':'#222','#f3c45e');if(king(b[r][col]))txt(c,'K',ox+(col+.5)*cell,oy+(r+.65)*cell,18,'#f3c45e')}}if(selected){c.strokeStyle='#5ee7ff';c.lineWidth=4;c.strokeRect(ox+selected[1]*cell+3,oy+selected[0]*cell+3,cell-6,cell-6)}txt(c,s.mode==='2P'?`Player ${turn} turn`:turn===1?'Your turn':'Computer thinking',450,38,21)}}
}
function battleshipGame(s){
  const n=8,b=Array.from({length:n},()=>Array(n).fill(0)),shots=18+Math.floor(s.level/2);let remaining=shots,hits=0;for(const len of[3,3,2,2]){let ok=false;while(!ok){const vert=Math.random()<.5,r=Math.floor(Math.random()*(n-(vert?len:0))),c=Math.floor(Math.random()*(n-(vert?0:len)));let cells=Array.from({length:len},(_,i)=>[r+(vert?i:0),c+(vert?0:i)]);if(cells.every(q=>!b[q[0]][q[1]])){cells.forEach(q=>b[q[0]][q[1]]=1);ok=true}}}const total=b.flat().filter(Boolean).length;
  return{pointer(p,t){if(t!=='pointerdown'||remaining<=0)return;const cell=52,ox=242,oy=70,r=Math.floor((p.y-oy)/cell),c=Math.floor((p.x-ox)/cell);if(!b[r]||b[r][c]>=2)return;remaining--;if(b[r][c]===1){b[r][c]=3;hits++}else b[r][c]=2;if(hits===total)completeLevel(hits*300+remaining*100);else if(!remaining)failLevel(hits*200)},draw(c){bg(c,'#092f52');const cell=52,ox=242,oy=70;for(let r=0;r<n;r++)for(let col=0;col<n;col++){rect(c,ox+col*cell,oy+r*cell,cell,cell,'#1474a8','#8dd8ff');if(b[r][col]===2)txt(c,'•',ox+(col+.5)*cell,oy+(r+.68)*cell,34,'#fff');if(b[r][col]===3)txt(c,'✹',ox+(col+.5)*cell,oy+(r+.68)*cell,28,'#ff5d68')}txt(c,`Hits ${hits}/${total} • Shots ${remaining}`,450,38,21)}}
}

function simonGame(s){
  const colors=['#ff535e','#43d675','#4d8eff','#ffd34d'],seq=[];let input=0,showing=true,lit=-1,round=0,target=4+Math.min(12,s.level);function next(){seq.push(Math.floor(Math.random()*4));input=0;showing=true;let i=0;const step=()=>{if(i>=seq.length){lit=-1;showing=false;return}lit=seq[i++];setTimeout(()=>{lit=-1;setTimeout(step,170)},360)};step()}setTimeout(next,400);function press(i){if(showing)return;if(i!==seq[input])return failLevel(round*300);input++;if(input===seq.length){round++;if(round>=target)return completeLevel(round*350);setTimeout(next,400)}}
  return{keyDown(k){const i={ArrowUp:0,ArrowRight:1,ArrowDown:2,ArrowLeft:3,KeyW:0,KeyD:1,KeyS:2,KeyA:3}[k];if(i!==undefined)press(i)},pointer(p,t){if(t!=='pointerdown')return;press((p.y<290?0:2)+(p.x>450?1:0))},draw(c){bg(c,'#16152d');const boxes=[[245,85],[465,85],[245,305],[465,305]];boxes.forEach((q,i)=>rect(c,q[0],q[1],190,190,colors[i]+(lit===i?'':'99')));txt(c,`Round ${round}/${target} • ${showing?'Watch':'Repeat'}`,450,38,22)}}
}

function whackGame(s){
  const holes=9;let active=-1,decoy=false,timer=0,score=0,time=22,target=8+Math.min(18,s.level);function next(){active=Math.floor(Math.random()*holes);decoy=Math.random()<.2;timer=rand(.45,.8)}
  return{pointer(p,t){if(t!=='pointerdown')return;const cell=130,ox=255,oy=90,i=Math.floor((p.y-oy)/cell)*3+Math.floor((p.x-ox)/cell);if(i===active){if(decoy)score=Math.max(0,score-2);else score++;active=-1;if(score>=target)completeLevel(score*200)}},update(dt){time-=dt;timer-=dt;if(timer<=0)next();if(time<=0)failLevel(score*100)},draw(c){bg(c,'#4d8b4a');const cell=130,ox=255,oy=90;for(let i=0;i<holes;i++){const x=ox+(i%3+.5)*cell,y=oy+(Math.floor(i/3)+.62)*cell;circle(c,x,y,42,'#432d21');if(i===active)circle(c,x,y-22,34,decoy?'#e64b65':'#9a633d')}txt(c,`Score ${score}/${target} • ${Math.ceil(time)}s`,450,38,22)}}
}

function bubbleGame(s){
  const colors=['#ff5d78','#4bdcff','#ffe05b','#67e68e','#b377ff'],R=7,C=11,rad=19,ox=240,oy=70;let grid=Array.from({length:R},(_,r)=>Array.from({length:C},()=>r<4?Math.floor(Math.random()*colors.length):-1)),aim={x:450,y:180},shots=25,target=12+Math.min(20,s.level),cleared=0,current=Math.floor(Math.random()*colors.length);
  function shoot(p){if(shots<=0)return;shots--;let c=clamp(Math.round((p.x-ox)/(rad*2)),0,C-1),r=R-1;while(r>0&&grid[r-1][c]===-1)r--;if(grid[r][c]!==-1)r=Math.max(0,r-1);grid[r][c]=current;const q=[[r,c]],seen=new Set([`${r},${c}`]),match=[];while(q.length){const[a,b]=q.pop();match.push([a,b]);for(const[dr,dc]of[[1,0],[-1,0],[0,1],[0,-1]]){const rr=a+dr,cc=b+dc;if(grid[rr]?.[cc]===current&&!seen.has(`${rr},${cc}`)){seen.add(`${rr},${cc}`);q.push([rr,cc])}}}if(match.length>=3){match.forEach(x=>grid[x[0]][x[1]]=-1);cleared+=match.length}current=Math.floor(Math.random()*colors.length);if(cleared>=target)completeLevel(cleared*150);else if(!shots)failLevel(cleared*100)}
  return{pointer(p,t){if(t==='pointermove')aim={...p};if(t==='pointerdown')shoot(p)},draw(c){bg(c,'#152445');for(let r=0;r<R;r++)for(let col=0;col<C;col++)if(grid[r][col]>=0)circle(c,ox+col*rad*2,oy+r*rad*2,rad-2,colors[grid[r][col]]);circle(c,450,500,rad,colors[current]);c.strokeStyle='#fff';c.beginPath();c.moveTo(450,480);c.lineTo(aim.x,aim.y);c.stroke();txt(c,`Cleared ${cleared}/${target} • Shots ${shots}`,450,38,21)}}
}

function basketballGame(s){
  const ball={x:180,y:430,r:17,vx:0,vy:0,flying:false},hoop={x:680,y:220,w:100},gravity=640;let drag=null,dragNow=null,shots=10,score=0,target=3+Math.floor(s.level/4);
  function reset(){Object.assign(ball,{x:180,y:430,vx:0,vy:0,flying:false});drag=dragNow=null}
  function launch(p){if(!drag||ball.flying)return;const dx=drag.x-p.x,dy=drag.y-p.y;ball.vx=clamp(dx*4.2,-1050,1050);ball.vy=clamp(dy*4.2,-1050,650);if(Math.hypot(ball.vx,ball.vy)<120){drag=dragNow=null;return}ball.flying=true;drag=dragNow=null;shots--}
  return{pointer(p,t){if(t==='pointerdown'&&!ball.flying&&Math.hypot(p.x-ball.x,p.y-ball.y)<100){drag={x:ball.x,y:ball.y};dragNow={...p}}if(t==='pointermove'&&drag)dragNow={...p};if(t==='pointerup')launch(p)},update(dt){if(!ball.flying)return;const prevY=ball.y;ball.vy+=gravity*dt;ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;if(prevY<hoop.y&&ball.y>=hoop.y&&ball.x>hoop.x&&ball.x<hoop.x+hoop.w&&ball.vy>0){score++;reset();if(score>=target)return completeLevel(score*400)}if(!Number.isFinite(ball.x+ball.y)||ball.y>H+100||ball.x>W+120||ball.x<-120){reset();if(!shots&&score<target)failLevel(score*200)}},draw(c){bg(c,'#91d4ff');rect(c,0,480,W,60,'#d4a16d');rect(c,hoop.x+hoop.w,hoop.y-70,12,150,'#ffffff');c.strokeStyle='#ff6138';c.lineWidth=6;c.beginPath();c.moveTo(hoop.x,hoop.y);c.lineTo(hoop.x+hoop.w,hoop.y);c.stroke();if(drag&&dragNow){c.strokeStyle='#173451';c.lineWidth=4;c.beginPath();c.moveTo(ball.x,ball.y);c.lineTo(dragNow.x,dragNow.y);c.stroke()}circle(c,ball.x,ball.y,ball.r,'#ed7f2d','#5e3218');txt(c,`Baskets ${score}/${target} • Shots ${shots} • drag farther for power`,450,38,22,'#173451')}}
}

function archeryGame(s){
  const bow={x:130,y:300},target={x:720,y:270,vy:80};let arrows=[],drag=null,dragNow=null,shots=12,score=0,needed=45+s.level*3,wind=rand(-25,25);
  function fire(p){if(!drag||!shots)return;const dx=drag.x-p.x,dy=drag.y-p.y;const vx=clamp(dx*4.3,-1200,1200),vy=clamp(dy*4.3,-1200,900);drag=dragNow=null;if(Math.hypot(vx,vy)<140)return;arrows.push({x:bow.x,y:bow.y,vx,vy});shots--}
  return{pointer(p,t){if(t==='pointerdown'&&Math.hypot(p.x-bow.x,p.y-bow.y)<105){drag={...bow};dragNow={...p}}if(t==='pointermove'&&drag)dragNow={...p};if(t==='pointerup')fire(p)},update(dt){target.y+=target.vy*dt;if(target.y<140){target.y=140;target.vy=Math.abs(target.vy)}if(target.y>400){target.y=400;target.vy=-Math.abs(target.vy)}for(const a of arrows){a.vx+=wind*dt;a.vy+=120*dt;a.x+=a.vx*dt;a.y+=a.vy*dt;if(a.x>target.x-10&&a.x<target.x+15){const d=Math.abs(a.y-target.y),points=Math.max(0,10-Math.floor(d/12));score+=points;a.x=1000;if(score>=needed)return completeLevel(score*100)}}arrows=arrows.filter(a=>Number.isFinite(a.x+a.y)&&a.x<W+100&&a.y<H+100&&a.y>-100);if(!shots&&!arrows.length&&score<needed)failLevel(score*100)},draw(c){bg(c,'#b6e4ff');for(const r of[60,45,30,15])circle(c,target.x,target.y,r,r>45?'#fff':r>30?'#111':r>15?'#4ca4ff':'#ffdb4d');c.strokeStyle='#8d522b';c.lineWidth=8;c.beginPath();c.arc(bow.x,bow.y,60,-1.4,1.4);c.stroke();if(drag&&dragNow){c.strokeStyle='#23465c';c.lineWidth=3;c.beginPath();c.moveTo(bow.x,bow.y);c.lineTo(dragNow.x,dragNow.y);c.stroke()}for(const a of arrows){c.strokeStyle='#56351e';c.beginPath();c.moveTo(a.x,a.y);c.lineTo(a.x-24,a.y);c.stroke()}txt(c,`Score ${score}/${needed} • Arrows ${shots} • Wind ${wind.toFixed(0)}`,450,38,21,'#18364d')}}
}

function golfGame(s){
  const ball={x:120,y:430,r:10,vx:0,vy:0},hole={x:780,y:130,r:13},obstacles=[{x:330,y:260,w:170,h:28},{x:570,y:370,w:170,h:28}],par=5+Math.floor(s.level/5);let drag=null,dragNow=null,shots=0,moving=false;
  function shoot(p){if(!drag||moving)return;const dx=drag.x-p.x,dy=drag.y-p.y;ball.vx=clamp(dx*3.5,-850,850);ball.vy=clamp(dy*3.5,-850,850);drag=dragNow=null;if(Math.hypot(ball.vx,ball.vy)<90){ball.vx=ball.vy=0;return}moving=true;shots++}
  return{pointer(p,t){if(t==='pointerdown'&&!moving&&Math.hypot(p.x-ball.x,p.y-ball.y)<85){drag={x:ball.x,y:ball.y};dragNow={...p}}if(t==='pointermove'&&drag)dragNow={...p};if(t==='pointerup')shoot(p)},update(dt){if(!moving)return;ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;ball.vx*=Math.pow(.15,dt);ball.vy*=Math.pow(.15,dt);if(!Number.isFinite(ball.x+ball.y)){Object.assign(ball,{x:120,y:430,vx:0,vy:0});moving=false;return}if(ball.x<ball.r){ball.x=ball.r;ball.vx=Math.abs(ball.vx)*.7}if(ball.x>W-ball.r){ball.x=W-ball.r;ball.vx=-Math.abs(ball.vx)*.7}if(ball.y<55+ball.r){ball.y=55+ball.r;ball.vy=Math.abs(ball.vy)*.7}if(ball.y>H-ball.r){ball.y=H-ball.r;ball.vy=-Math.abs(ball.vy)*.7}for(const o of obstacles)if(hit({x:ball.x-ball.r,y:ball.y-ball.r,w:ball.r*2,h:ball.r*2},o)){ball.vx*=-.7;ball.vy*=-.7;ball.x=clamp(ball.x,ball.r,W-ball.r);ball.y=clamp(ball.y,55+ball.r,H-ball.r)}if(Math.hypot(ball.x-hole.x,ball.y-hole.y)<hole.r+ball.r&&Math.hypot(ball.vx,ball.vy)<130)return completeLevel(Math.max(100,2000-shots*200));if(Math.hypot(ball.vx,ball.vy)<8){ball.vx=ball.vy=0;moving=false;if(shots>par+4)failLevel(0)}},draw(c){bg(c,'#55ad59');for(const o of obstacles)rect(c,o.x,o.y,o.w,o.h,'#805a35');circle(c,hole.x,hole.y,hole.r,'#111');rect(c,hole.x,hole.y-80,4,80,'#eee');if(drag&&dragNow){c.strokeStyle='#17391a';c.lineWidth=4;c.beginPath();c.moveTo(ball.x,ball.y);c.lineTo(dragNow.x,dragNow.y);c.stroke()}circle(c,ball.x,ball.y,ball.r,'#fff','#777');txt(c,`Shots ${shots} • Par ${par} • drag farther for power`,450,38,22,'#15391a')}}
}

function racerGame(s){
  const car={x:420,y:430,w:54,h:82};let traffic=[],spawn=0,dist=0,fuel=100,target=20+Math.min(30,s.level);return{update(dt){const v=360;if(s.pressed('ArrowLeft','KeyA'))car.x-=v*dt;if(s.pressed('ArrowRight','KeyD'))car.x+=v*dt;car.x=clamp(car.x,245,600);spawn-=dt;if(spawn<=0){traffic.push({x:[270,390,510,570][Math.floor(Math.random()*4)],y:-100,w:50,h:78,v:205+Math.min(125,s.level*3.1),type:Math.random()<.15?'fuel':'car'});spawn=rand(.85,1.35)}for(const o of traffic)o.y+=o.v*dt;if(traffic.some(o=>o.type==='car'&&hit(car,o)))return failLevel(dist*100);for(const o of traffic)if(o.type==='fuel'&&hit(car,o)){fuel=Math.min(100,fuel+30);o.y=700}traffic=traffic.filter(o=>o.y<H+120);fuel-=dt*2.2;dist+=dt;if(fuel<=0)return failLevel(dist*100);if(dist>=target)completeLevel(dist*180)},draw(c){bg(c,'#5b8e59');rect(c,220,55,420,H-55,'#3d4249');for(let y=60;y<H;y+=70){rect(c,350,y,8,38,'#fff');rect(c,500,y,8,38,'#fff')}for(const o of traffic)rect(c,o.x,o.y,o.w,o.h,o.type==='fuel'?'#ffd34d':'#ff5a71');rect(c,car.x,car.y,car.w,car.h,'#42d8ff');txt(c,`Distance ${Math.floor(dist)}/${target} • Fuel ${Math.floor(fuel)}`,450,38,21)}}
}

function soccerGame(s){
  const p1={x:180,y:270,r:22,score:0},p2={x:720,y:270,r:22,score:0},ball={x:450,y:270,r:14,vx:0,vy:0},two=s.mode==='2P';let cd1=0,cd2=0,still=0;
  function kick(p,dir,power=1){if(Math.hypot(p.x-ball.x,p.y-ball.y)<72){ball.vx=dir*470*power;ball.vy=(ball.y-p.y)*5.4;return true}return false}
  function reset(){Object.assign(ball,{x:450,y:270,vx:0,vy:0});p1.x=180;p1.y=270;p2.x=720;p2.y=270;still=0}
  return{pointer(q,t){if(t!=='pointerdown'&&t!=='pointermove')return;const target=(!two||q.x<W/2)?p1:p2;target.x=clamp(q.x,target===p1?40:460,target===p1?440:860);target.y=clamp(q.y,80,H-40);if(t==='pointerdown'){if(target===p1&&cd1<=0&&kick(p1,1)){cd1=.25}else if(target===p2&&cd2<=0&&kick(p2,-1)){cd2=.25}}},keyDown(k){if(k==='Space'&&cd1<=0&&kick(p1,1))cd1=.25;if(two&&k==='KeyF'&&cd2<=0&&kick(p2,-1))cd2=.25},update(dt){cd1-=dt;cd2-=dt;const v=275;for(const[k,p,dx,dy]of[['ArrowLeft',p1,-1,0],['ArrowRight',p1,1,0],['ArrowUp',p1,0,-1],['ArrowDown',p1,0,1]])if(s.pressed(k)){p.x+=dx*v*dt;p.y+=dy*v*dt}if(two){for(const[k,dx,dy]of[['KeyA',-1,0],['KeyD',1,0],['KeyW',0,-1],['KeyS',0,1]])if(s.pressed(k)){p2.x+=dx*v*dt;p2.y+=dy*v*dt}}else{const attackX=clamp(ball.x+52,470,845),predictY=clamp(ball.y+ball.vy*.28,90,500),cpuSpeed=ball.x>390?v*1.08:v*.92;p2.x+=clamp(attackX-p2.x,-cpuSpeed*dt,cpuSpeed*dt);p2.y+=clamp(predictY-p2.y,-cpuSpeed*dt,cpuSpeed*dt);if(cd2<=0&&kick(p2,-1,1.08))cd2=.32}for(const p of[p1,p2]){p.x=clamp(p.x,p===p1?40:460,p===p1?440:860);p.y=clamp(p.y,80,H-40);const d=Math.hypot(p.x-ball.x,p.y-ball.y);if(d<p.r+ball.r){const nx=(ball.x-p.x)/(d||1),ny=(ball.y-p.y)/(d||1);ball.x=p.x+nx*(p.r+ball.r);ball.y=p.y+ny*(p.r+ball.r);ball.vx+=nx*95;ball.vy+=ny*95}}ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;ball.vx*=Math.pow(.2,dt);ball.vy*=Math.pow(.2,dt);if(ball.y<75+ball.r){ball.y=75+ball.r;ball.vy=Math.abs(ball.vy)*.8}if(ball.y>H-ball.r){ball.y=H-ball.r;ball.vy=-Math.abs(ball.vy)*.8}if(ball.x<0&&ball.y>200&&ball.y<340){p2.score++;reset()}else if(ball.x>W&&ball.y>200&&ball.y<340){p1.score++;reset()}else{if(ball.x<ball.r){ball.x=ball.r;ball.vx=Math.abs(ball.vx)*.8}if(ball.x>W-ball.r){ball.x=W-ball.r;ball.vx=-Math.abs(ball.vx)*.8}}if(Math.hypot(ball.vx,ball.vy)<10)still+=dt;else still=0;if(still>2.5){ball.vx=ball.x<450?150:-150;ball.vy=rand(-80,80);still=0}if(p1.score>=3||p2.score>=3)(p1.score>p2.score?completeLevel:failLevel)(p1.score*500)},draw(c){bg(c,'#2f9d55');c.strokeStyle='#fff';c.lineWidth=4;c.strokeRect(20,65,W-40,H-85);c.beginPath();c.arc(450,290,75,0,7);c.stroke();c.strokeRect(0,200,65,140);c.strokeRect(W-65,200,65,140);circle(c,p1.x,p1.y,p1.r,'#42d9ff');circle(c,p2.x,p2.y,p2.r,'#ff5c79');circle(c,ball.x,ball.y,ball.r,'#fff','#111');txt(c,`${p1.score} — ${p2.score}${two?'':' • attacking CPU'}`,450,38,26)}}
}

function drawingGame(s){
  let lines=[],last=null,color=0,width=7,strokeStart=0;const colors=['#1d9bf0','#ff4f79','#28b463','#f4b400','#8e44ad','#111'];
  function clear(){lines=[];last=null;strokeStart=0}
  function undo(){if(!lines.length)return;const stroke=lines[lines.length-1].stroke;while(lines.length&&lines[lines.length-1].stroke===stroke)lines.pop()}
  return{pointer(p,t){if(t==='pointerdown'){last={x:p.x,y:p.y};strokeStart++}if(t==='pointermove'&&p.down&&last){lines.push({a:last,b:{x:p.x,y:p.y},color:colors[color],width,stroke:strokeStart});last={x:p.x,y:p.y};if(lines.length>12000)lines.splice(0,1000)}},pointerUp(){last=null},keyDown(k){if(k==='Space')color=(color+1)%colors.length;if(k==='Enter')clear();if(k==='Backspace')undo();if(k==='ArrowUp')width=Math.min(20,width+1);if(k==='ArrowDown')width=Math.max(2,width-1)},draw(c){bg(c,'#f7f8fc');c.lineCap='round';for(const l of lines){c.strokeStyle=l.color;c.lineWidth=l.width;c.beginPath();c.moveTo(l.a.x,l.a.y);c.lineTo(l.b.x,l.b.y);c.stroke()}txt(c,`Free Drawing • Color ${color+1}/${colors.length} • Brush ${width} • A color • B clear`,450,34,19,'#21304a')}}
}

function triviaGame(s){
  const qs=[['Which planet is the Red Planet?',['Venus','Mars','Jupiter','Mercury'],1],['What is 9 × 7?',['56','63','72','79'],1],['Which animal is a mammal?',['Shark','Dolphin','Trout','Octopus'],1],['What is the capital of France?',['Rome','Paris','Madrid','Berlin'],1],['Which word is a verb?',['table','green','jump','quiet'],2],['How many sides does a hexagon have?',['5','6','7','8'],1],['Water freezes at what Celsius temperature?',['0','10','32','100'],0],['Which is largest?',['Moon','Earth','Sun','Car'],2]];let i=0,score=0,q=qs[(s.level-1)%qs.length],buttons=[];function next(){q=qs[(i+s.level-1)%qs.length];buttons=q[1].map((_,j)=>({x:160+(j%2)*310,y:285+Math.floor(j/2)*82,w:280,h:60,i:j}))}next();
  return{pointer(p,t){if(t!=='pointerdown')return;const b=buttons.find(x=>buttonHit(p,x));if(!b)return;if(b.i===q[2])score++;i++;if(i>=6)return score>=4?completeLevel(score*350):failLevel(score*200);next()},draw(c){bg(c,'#10274c');txt(c,`Question ${i+1}/6`,450,40,22);txt(c,q[0],450,180,28);for(const b of buttons){rect(c,b.x,b.y,b.w,b.h,'#295083','#69cfff');txt(c,q[1][b.i],b.x+b.w/2,b.y+39,20)}}}
}

function towerDefenseGame(s){
  const path=[[0,300],[170,300],[170,145],[405,145],[405,395],[650,395],[650,225],[900,225]],pads=[[85,215],[270,245],[330,78],[510,275],[585,465],[760,335]],types=[{name:'RAPID',cost:42,range:128,damage:8,rate:.22,color:'#4ad6ff'},{name:'CANNON',cost:58,range:155,damage:30,rate:1.05,color:'#ffb45c'},{name:'FROST',cost:52,range:140,damage:10,rate:.7,color:'#9e8cff'}],towers=[],enemies=[];let wave=1,spawn=0,spawned=0,base=12,money=105,selectedPad=-1,type=0,waveActive=true,total=7+Math.min(8,Math.floor(s.level/3));
  const pathLen=path.slice(0,-1).reduce((n,a,i)=>n+Math.hypot(path[i+1][0]-a[0],path[i+1][1]-a[1]),0);function pointAt(t){let remain=t;for(let i=0;i<path.length-1;i++){const a=path[i],b=path[i+1],d=Math.hypot(b[0]-a[0],b[1]-a[1]);if(remain<=d)return{x:a[0]+(b[0]-a[0])*remain/d,y:a[1]+(b[1]-a[1])*remain/d};remain-=d}return{x:900,y:225,done:true}}
  function towerAt(i){return towers.find(t=>t.pad===i)}function build(i){const existing=towerAt(i),spec=types[type];selectedPad=i;if(existing)return;if(money>=spec.cost){money-=spec.cost;towers.push({pad:i,type,level:1,cd:0})}}
  function upgrade(){const t=towerAt(selectedPad);if(!t)return;const cost=30+t.level*20;if(t.level<3&&money>=cost){money-=cost;t.level++}}
  function sell(){const i=towers.findIndex(t=>t.pad===selectedPad);if(i<0)return;const t=towers[i];money+=Math.floor((types[t.type].cost+t.level*25)*.6);towers.splice(i,1);selectedPad=-1}
  function nextWave(){if(waveActive||enemies.length)return;wave++;if(wave>3)return completeLevel(base*350+money);spawned=0;total=7+wave*3+Math.min(8,Math.floor(s.level/3));waveActive=true;money+=20}
  return{keyDown(k){if(k==='Space')type=(type+1)%types.length;if(k==='Enter')upgrade();if(k==='Backspace')sell()},pointer(p,t){if(t!=='pointerdown')return;if(p.y<62){if(p.x<300)type=0;else if(p.x<540)type=1;else if(p.x<760)type=2;else nextWave();return}const i=pads.findIndex(q=>Math.hypot(p.x-q[0],p.y-q[1])<38);if(i>=0){const existing=towerAt(i);if(existing){selectedPad=i;if(p.y<pads[i][1])upgrade()}else build(i)}},update(dt){if(waveActive){spawn-=dt;if(spawn<=0&&spawned<total){const armored=(spawned+wave+s.level)%4===0;enemies.push({d:0,hp:(36+s.level*5+wave*14)*(armored?1.65:1),maxHp:(36+s.level*5+wave*14)*(armored?1.65:1),speed:(48+Math.min(40,s.level))*(armored?.72:1),slow:0,armored});spawned++;spawn=.62}if(spawned>=total)waveActive=false}for(const e of enemies){e.slow=Math.max(0,e.slow-dt);e.d+=e.speed*(e.slow?0.58:1)*dt}for(const t of towers){t.cd-=dt;if(t.cd>0)continue;const spec=types[t.type],q=pads[t.pad],target=enemies.filter(e=>e.hp>0&&Math.hypot(pointAt(e.d).x-q[0],pointAt(e.d).y-q[1])<spec.range+t.level*14).sort((a,b)=>b.d-a.d)[0];if(!target)continue;target.hp-=spec.damage*(1+(t.level-1)*.65)*(target.armored&&t.type===0?.68:1);if(t.type===2)target.slow=1.3;t.cd=spec.rate/(1+(t.level-1)*.22)}for(const e of [...enemies]){if(e.hp<=0){money+=e.armored?18:11;enemies.splice(enemies.indexOf(e),1)}else if(e.d>=pathLen){base--;enemies.splice(enemies.indexOf(e),1);if(base<=0)return failLevel(0)}}if(!waveActive&&!enemies.length&&wave>=3)completeLevel(base*350+money)},draw(c){bg(c,'#365f3b');c.strokeStyle='#cbb58a';c.lineWidth=55;c.lineJoin='round';c.beginPath();c.moveTo(...path[0]);for(const q of path.slice(1))c.lineTo(...q);c.stroke();types.forEach((q,i)=>{rect(c,20+i*245,8,225,42,type===i?q.color:'#263e36','#fff5');txt(c,`${q.name} $${q.cost}`,132+i*245,37,17,type===i?'#102030':'#fff')});rect(c,760,8,125,42,'#465e53');txt(c,waveActive?`WAVE ${wave}`:'NEXT WAVE',822,37,15);for(let i=0;i<pads.length;i++){const t=towerAt(i);circle(c,pads[i][0],pads[i][1],29,t?types[t.type].color:'#6e8c62',selectedPad===i?'#ffe05d':'');if(t)txt(c,t.level,pads[i][0],pads[i][1]+7,16,'#102030')}for(const e of enemies){const q=pointAt(e.d);circle(c,q.x,q.y,e.armored?17:14,e.armored?'#8e5067':'#ff5a70');rect(c,q.x-18,q.y-27,36,5,'#222');rect(c,q.x-18,q.y-27,36*Math.max(0,e.hp/e.maxHp),5,'#5ee881')}txt(c,`Base ${base} • $${money} • Wave ${wave}/3 • Space changes tower • Enter upgrades`,450,530,18)}}
}

function platformerGame(s){
  const rng=seedForLevel(s,277),p={x:45,y:420,w:32,h:44,vx:0,vy:0,on:false},plats=[{x:0,y:490,w:900,h:50}];let x=105,y=420;for(let i=0;i<6;i++){x+=100+seededInt(rng,5,35);y=clamp(y+seededInt(rng,-85,65),150,420);plats.push({x,y,w:90+seededInt(rng,0,50),h:20})}const gems=plats.slice(1).map((q,i)=>({x:q.x+q.w*(.3+(i%3)*.2),y:q.y-18,taken:false})),exit={x:Math.min(850,plats.at(-1).x+plats.at(-1).w-25),y:plats.at(-1).y-50,w:40,h:50};let collected=0;
  return{keyDown(k){if((k==='Space'||k==='ArrowUp')&&p.on){p.vy=-500;p.on=false}},update(dt){p.vx=0;if(s.pressed('ArrowLeft','KeyA'))p.vx=-250;if(s.pressed('ArrowRight','KeyD'))p.vx=250;p.vy+=1050*dt;const oldY=p.y;p.x=clamp(p.x+p.vx*dt,0,W-p.w);p.y+=p.vy*dt;p.on=false;for(const q of plats)if(p.vy>=0&&oldY+p.h<=q.y+7&&p.y+p.h>=q.y&&p.x+p.w>q.x&&p.x<q.x+q.w){p.y=q.y-p.h;p.vy=0;p.on=true}if(p.y>H)return failLevel(collected*200);for(const g of gems)if(!g.taken&&Math.hypot(p.x+p.w/2-g.x,p.y+p.h/2-g.y)<30){g.taken=true;collected++}if(collected===gems.length&&hit(p,exit))completeLevel(2500+s.level*20)},draw(c){bg(c,'#80c7ef');for(const q of plats)rect(c,q.x,q.y,q.w,q.h,'#5d824b');for(const g of gems)if(!g.taken)txt(c,'◆',g.x,g.y+10,28,'#ffe05a');rect(c,exit.x,exit.y,exit.w,exit.h,collected===gems.length?'#55e58a':'#6f7584');rect(c,p.x,p.y,p.w,p.h,'#ff5d7d');txt(c,`Level ${s.level}/40 • Gems ${collected}/${gems.length}`,450,38,22,'#183450')}}
}

function sokobanGame(s){
  const bases=[
    ["########","#   .  #","#   $  #","#  @   #","#      #","#      #","#      #","########"],
    ["########","# . .  #","# $ $  #","#  @   #","#      #","#      #","#      #","########"],
    ["########","#  .   #","#  #   #","#  $   #","# @    #","#      #","#      #","########"],
    ["########","# .    #","# $##  #","#  @   #","#      #","#      #","#      #","########"],
    ["########","# . .  #","# $$   #","#   @  #","#      #","#      #","#      #","########"]
  ];
  function transform(raw,rot,mirror){let a=raw.map(r=>r.split(''));if(mirror)a=a.map(r=>r.slice().reverse());for(let k=0;k<rot;k++)a=Array.from({length:a[0].length},(_,c)=>Array.from({length:a.length},(_,r)=>a[a.length-1-r][c]));return a}
  const idx=(s.level-1)%5,variant=Math.floor((s.level-1)/5),g=transform(bases[idx],variant%4,variant>=4);let pr=0,pc=0;for(let r=0;r<g.length;r++)for(let c=0;c<g[r].length;c++)if(g[r][c]==='@'){pr=r;pc=c;g[r][c]=' '}const goals=new Set();for(let r=0;r<g.length;r++)for(let c=0;c<g[r].length;c++)if(g[r][c]==='.'){goals.add(`${r},${c}`);g[r][c]=' '}
  function move(k){const d=keyDirection(k);if(!d)return;const nr=pr+d[1],nc=pc+d[0];if(g[nr]?.[nc]==='#')return;if(g[nr]?.[nc]==='$'){const rr=nr+d[1],cc=nc+d[0];if(g[rr]?.[cc]!==' ')return;g[rr][cc]='$';g[nr][nc]=' '}pr=nr;pc=nc;if([...goals].every(x=>{const[r,c]=x.split(',').map(Number);return g[r][c]==='$'}))completeLevel(2000+s.level*20)}
  return{keyDown:move,draw(c){bg(c,'#2c2732');const cell=58,ox=(W-g[0].length*cell)/2,oy=58;for(let r=0;r<g.length;r++)for(let col=0;col<g[r].length;col++){const x=ox+col*cell,y=oy+r*cell;if(g[r][col]==='#')rect(c,x,y,cell,cell,'#6f5142');else rect(c,x,y,cell,cell,'#d7c49d');if(goals.has(`${r},${col}`))circle(c,x+cell/2,y+cell/2,13,'#56d48d');if(g[r][col]==='$')rect(c,x+10,y+10,cell-20,cell-20,'#b36b32')}circle(c,ox+(pc+.5)*cell,oy+(pr+.5)*cell,20,'#4bdcff');txt(c,`Sokoban layout ${s.level}/40`,450,35,20)}}
}

function hangmanGame(s){
  const words=['ARCADE','GALAXY','PUZZLE','DRAGON','ROCKET','JUNGLE','CASTLE','PLANET','MUSIC','TREASURE'],word=words[(s.level-1)%words.length],guessed=new Set(),letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';let cursor=0,wrong=0;function guess(ch){if(guessed.has(ch))return;guessed.add(ch);if(!word.includes(ch))wrong++;if([...word].every(x=>guessed.has(x)))completeLevel(1800-wrong*150);else if(wrong>=6)failLevel(0)}
  return{keyDown(k){if(/^Key[A-Z]$/.test(k))guess(k.slice(3));if(k==='ArrowLeft')cursor=(cursor+25)%26;if(k==='ArrowRight')cursor=(cursor+1)%26;if(k==='Space'||k==='Enter')guess(letters[cursor])},pointer(p,t){if(t!=='pointerdown')return;const cell=54,ox=99,oy=350,c=Math.floor((p.x-ox)/cell),r=Math.floor((p.y-oy)/cell),i=r*13+c;if(i>=0&&i<26)guess(letters[i])},draw(c){bg(c,'#f2ead8');c.strokeStyle='#3b3024';c.lineWidth=5;c.beginPath();c.moveTo(170,280);c.lineTo(170,80);c.lineTo(330,80);c.lineTo(330,115);c.stroke();if(wrong>0)circle(c,330,145,28,'transparent','#3b3024');if(wrong>1){c.beginPath();c.moveTo(330,173);c.lineTo(330,240);c.stroke()}if(wrong>2){c.beginPath();c.moveTo(330,190);c.lineTo(292,220);c.stroke()}if(wrong>3){c.beginPath();c.moveTo(330,190);c.lineTo(368,220);c.stroke()}if(wrong>4){c.beginPath();c.moveTo(330,240);c.lineTo(300,280);c.stroke()}if(wrong>5){c.beginPath();c.moveTo(330,240);c.lineTo(360,280);c.stroke()}txt(c,[...word].map(x=>guessed.has(x)?x:'_').join(' '),590,190,42,'#332a21');const cell=54,ox=99,oy=350;for(let i=0;i<26;i++){const x=ox+(i%13)*cell,y=oy+Math.floor(i/13)*65;rect(c,x,y,48,50,i===cursor?'#4bdcff':guessed.has(letters[i])?'#aaa':'#fff','#776a55');txt(c,letters[i],x+24,y+34,20,'#2d2922')}txt(c,`Mistakes ${wrong}/6`,590,245,22,'#6c3f3f')}}
}

function blackjackGame(s){
  let deck=[],player=[],dealer=[],done=false;function resetDeck(){deck=[];for(let i=0;i<4;i++)for(let v=1;v<=13;v++)deck.push(v);deck.sort(()=>Math.random()-.5)}function val(hand){let total=hand.reduce((n,c)=>n+Math.min(10,c),0),aces=hand.filter(c=>c===1).length;while(aces&&total+10<=21){total+=10;aces--}return total}function card(){return deck.pop()}function hitP(){if(done)return;player.push(card());if(val(player)>21){done=true;failLevel(0)}}function stand(){if(done)return;while(val(dealer)<17)dealer.push(card());done=true;val(player)>val(dealer)||val(dealer)>21?completeLevel(val(player)*100):failLevel(val(player)*50)}resetDeck();player=[card(),card()];dealer=[card(),card()];
  return{keyDown(k){if(k==='Space')hitP();if(k==='Enter')stand()},pointer(p,t){if(t!=='pointerdown')return;if(p.x<450)hitP();else stand()},draw(c){bg(c,'#075239');txt(c,'Dealer',450,70,22);dealer.forEach((q,i)=>drawCard(c,340+i*75,90,q,done||i===0));txt(c,done?`Dealer ${val(dealer)}`:'Dealer ?',450,210,20);txt(c,`You ${val(player)}`,450,270,24);player.forEach((q,i)=>drawCard(c,300+i*75,295,q,true));rect(c,150,450,260,60,'#2372b8');rect(c,490,450,260,60,'#a64c79');txt(c,'A / HIT',280,490,22);txt(c,'B / STAND',620,490,22)}}
}
function drawCard(c,x,y,v,show){rect(c,x,y,62,90,'#fff','#111');if(show){const label=v===1?'A':v===11?'J':v===12?'Q':v===13?'K':v;txt(c,label,x+31,y+55,26,'#111')}else rect(c,x+6,y+6,50,78,'#2e5aa6')}

function fruitMergeGame(s){
  const fruits=[12,18,25,34,45,58],items=[];let aim=450,next=0,dropCd=0,target=Math.min(5,2+Math.floor(s.level/5));function drop(){if(dropCd>0)return;items.push({x:aim,y:70,r:fruits[next],level:next,vx:0,vy:0});next=Math.random()<.75?0:1;dropCd=.35}return{keyDown(k){if(k==='Space'||k==='Enter')drop()},update(dt){dropCd-=dt;const speed=280;if(s.pressed('ArrowLeft','KeyA'))aim-=speed*dt;if(s.pressed('ArrowRight','KeyD'))aim+=speed*dt;aim=clamp(aim,250,650);for(const a of items){a.vy+=500*dt;a.x+=a.vx*dt;a.y+=a.vy*dt;if(a.y+a.r>500){a.y=500-a.r;a.vy*=-.15}if(a.x-a.r<220){a.x=220+a.r;a.vx*=-.2}if(a.x+a.r>680){a.x=680-a.r;a.vx*=-.2}}for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){const a=items[i],b=items[j],d=Math.hypot(a.x-b.x,a.y-b.y),min=a.r+b.r;if(d<min){if(a.level===b.level&&a.level<fruits.length-1){a.level++;a.r=fruits[a.level];a.x=(a.x+b.x)/2;a.y=(a.y+b.y)/2;a.vy=-120;items.splice(j,1);if(a.level>=target)return completeLevel(a.level*700)}else{const nx=(b.x-a.x)/(d||1),ny=(b.y-a.y)/(d||1),push=(min-d)/2;a.x-=nx*push;a.y-=ny*push;b.x+=nx*push;b.y+=ny*push}}}if(items.some(a=>a.y-a.r<95&&Math.abs(a.vy)<20))failLevel(0)},draw(c){bg(c,'#ffe9c7');rect(c,215,90,470,425,'#fff3','#986d4a');for(const a of items)circle(c,a.x,a.y,a.r,['#ff5e73','#ff9e42','#ffe05a','#62d66d','#b973ff','#ff82c5'][a.level],'#6b4632');c.strokeStyle='#503b2e';c.beginPath();c.moveTo(aim,55);c.lineTo(aim,90);c.stroke();txt(c,`Create fruit level ${target+1}`,450,38,21,'#5a3a25')}}
}
