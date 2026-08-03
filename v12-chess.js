'use strict';

window.V12_GAME_FACTORIES = Object.assign(window.V12_GAME_FACTORIES || {}, {
  chess: regularChessGame
});

function regularChessGame(s) {
  const CELL = 58, OX = 218, OY = 50;
  const GLYPH = {
    K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',
    k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'
  };
  const VALUE = {p:100,n:320,b:330,r:500,q:900,k:20000};
  const KNIGHT = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  const KING = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  const ORTHO = [[-1,0],[1,0],[0,-1],[0,1]], DIAG = [[-1,-1],[-1,1],[1,-1],[1,1]];
  const initialBoard = () => [
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p','p','p','p','p'],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    ['P','P','P','P','P','P','P','P'],
    ['R','N','B','Q','K','B','N','R']
  ];
  const freshState = () => ({board:initialBoard(),turn:'w',rights:'KQkq',ep:null,half:0,full:1,last:null});
  const copyState = st => ({
    board: st.board.map(row => row.slice()), turn:st.turn, rights:st.rights,
    ep: st.ep ? st.ep.slice() : null, half:st.half, full:st.full,
    last: st.last ? {...st.last} : null
  });
  const color = p => !p ? null : p === p.toUpperCase() ? 'w' : 'b';
  const enemy = c => c === 'w' ? 'b' : 'w';
  const inside = (r,c) => r>=0 && r<8 && c>=0 && c<8;
  const squareName = (r,c) => `${String.fromCharCode(97+c)}${8-r}`;
  const moveName = m => `${squareName(m.fr,m.fc)}–${squareName(m.tr,m.tc)}${m.promotion ? `=${m.promotion.toUpperCase()}` : ''}`;

  let state = freshState(), selected = null, cursor = [6,4], history = [], botThinking = false,
      message = 'White to move', gameOver = false, botTimer = null, moveNumber = 0;

  function attacked(st, r, c, by) {
    const pawn = by === 'w' ? 'P' : 'p', pdir = by === 'w' ? -1 : 1;
    for (const dc of [-1,1]) { const rr=r-pdir, cc=c-dc; if (inside(rr,cc) && st.board[rr][cc]===pawn) return true; }
    const knight = by === 'w' ? 'N' : 'n';
    for (const [dr,dc] of KNIGHT) { const rr=r+dr,cc=c+dc; if(inside(rr,cc)&&st.board[rr][cc]===knight)return true; }
    const king = by === 'w' ? 'K' : 'k';
    for (const [dr,dc] of KING) { const rr=r+dr,cc=c+dc; if(inside(rr,cc)&&st.board[rr][cc]===king)return true; }
    for (const [dr,dc] of ORTHO) {
      let rr=r+dr,cc=c+dc; while(inside(rr,cc)){const p=st.board[rr][cc];if(p){if(color(p)===by&&'rq'.includes(p.toLowerCase()))return true;break}rr+=dr;cc+=dc;}
    }
    for (const [dr,dc] of DIAG) {
      let rr=r+dr,cc=c+dc; while(inside(rr,cc)){const p=st.board[rr][cc];if(p){if(color(p)===by&&'bq'.includes(p.toLowerCase()))return true;break}rr+=dr;cc+=dc;}
    }
    return false;
  }

  function kingSquare(st, side) {
    const target = side==='w'?'K':'k';
    for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(st.board[r][c]===target)return[r,c];
    return null;
  }
  function inCheck(st, side) { const k=kingSquare(st,side); return !!k && attacked(st,k[0],k[1],enemy(side)); }

  function pseudoMoves(st,r,c,forAttack=false) {
    const p=st.board[r]?.[c], side=color(p); if(!p)return[];
    const type=p.toLowerCase(), out=[];
    const add=(tr,tc,extra={})=>{if(!inside(tr,tc))return;const target=st.board[tr][tc];if(!target||color(target)!==side)out.push({fr:r,fc:c,tr,tc,...extra})};
    if(type==='p'){
      const dir=side==='w'?-1:1,start=side==='w'?6:1,promo=side==='w'?0:7;
      for(const dc of[-1,1]){const tr=r+dir,tc=c+dc;if(inside(tr,tc)){if(forAttack)add(tr,tc);else if(st.board[tr][tc]&&color(st.board[tr][tc])!==side)add(tr,tc,{promotion:tr===promo?(side==='w'?'Q':'q'):null});else if(st.ep&&st.ep[0]===tr&&st.ep[1]===tc)add(tr,tc,{enPassant:true,promotion:null});}}
      if(!forAttack&&inside(r+dir,c)&&!st.board[r+dir][c]){
        add(r+dir,c,{promotion:r+dir===promo?(side==='w'?'Q':'q'):null});
        if(r===start&&!st.board[r+2*dir][c])add(r+2*dir,c,{doublePawn:true});
      }
      return out;
    }
    if(type==='n'){for(const[dr,dc]of KNIGHT)add(r+dr,c+dc);return out;}
    if(type==='b'||type==='r'||type==='q'){
      const dirs=type==='b'?DIAG:type==='r'?ORTHO:[...ORTHO,...DIAG];
      for(const[dr,dc]of dirs){let tr=r+dr,tc=c+dc;while(inside(tr,tc)){const target=st.board[tr][tc];if(!target)out.push({fr:r,fc:c,tr,tc});else{if(color(target)!==side)out.push({fr:r,fc:c,tr,tc});break}tr+=dr;tc+=dc;}}
      return out;
    }
    if(type==='k'){
      for(const[dr,dc]of KING)add(r+dr,c+dc);
      if(!forAttack&&!inCheck(st,side)){
        const row=side==='w'?7:0,kingSide=side==='w'?'K':'k',queenSide=side==='w'?'Q':'q';
        if(r===row&&c===4&&st.rights.includes(kingSide)&&!st.board[row][5]&&!st.board[row][6]&&st.board[row][7]===(side==='w'?'R':'r')&&!attacked(st,row,5,enemy(side))&&!attacked(st,row,6,enemy(side)))out.push({fr:r,fc:c,tr:row,tc:6,castle:'K'});
        if(r===row&&c===4&&st.rights.includes(queenSide)&&!st.board[row][1]&&!st.board[row][2]&&!st.board[row][3]&&st.board[row][0]===(side==='w'?'R':'r')&&!attacked(st,row,3,enemy(side))&&!attacked(st,row,2,enemy(side)))out.push({fr:r,fc:c,tr:row,tc:2,castle:'Q'});
      }
      return out;
    }
    return out;
  }

  function apply(st,m) {
    const next=copyState(st),piece=next.board[m.fr][m.fc],side=color(piece),type=piece.toLowerCase(),captured=next.board[m.tr][m.tc];
    next.board[m.fr][m.fc]=null;
    if(m.enPassant){const cr=m.tr+(side==='w'?1:-1);next.board[cr][m.tc]=null;}
    next.board[m.tr][m.tc]=m.promotion||piece;
    if(m.castle){const row=m.tr;if(m.tc===6){next.board[row][5]=next.board[row][7];next.board[row][7]=null}else{next.board[row][3]=next.board[row][0];next.board[row][0]=null}}
    let rights=next.rights;
    if(piece==='K')rights=rights.replace(/[KQ]/g,''); if(piece==='k')rights=rights.replace(/[kq]/g,'');
    if(m.fr===7&&m.fc===0||m.tr===7&&m.tc===0)rights=rights.replace('Q','');
    if(m.fr===7&&m.fc===7||m.tr===7&&m.tc===7)rights=rights.replace('K','');
    if(m.fr===0&&m.fc===0||m.tr===0&&m.tc===0)rights=rights.replace('q','');
    if(m.fr===0&&m.fc===7||m.tr===0&&m.tc===7)rights=rights.replace('k','');
    next.rights=rights;next.ep=m.doublePawn?[(m.fr+m.tr)/2,m.fc]:null;
    next.half=(type==='p'||captured||m.enPassant)?0:next.half+1;if(side==='b')next.full++;
    next.turn=enemy(side);next.last={...m,piece,captured};return next;
  }
  function legalMoves(st,side=st.turn) {
    const moves=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(color(st.board[r][c])===side)for(const m of pseudoMoves(st,r,c)){const n=apply(st,m);if(!inCheck(n,side))moves.push(m)}return moves;
  }
  function movesFrom(st,r,c){return legalMoves(st).filter(m=>m.fr===r&&m.fc===c)}

  function evaluate(st) {
    let score=0;for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=st.board[r][c];if(!p)continue;const v=VALUE[p.toLowerCase()]||0,center=(3.5-Math.abs(c-3.5))+(3.5-Math.abs(r-3.5));score+=(color(p)==='b'?1:-1)*(v+center*(p.toLowerCase()==='p'?2:4));}
    if(inCheck(st,'w'))score+=28;if(inCheck(st,'b'))score-=28;return score;
  }
  function ordered(st,moves) {
    return moves.slice().sort((a,b)=>{
      const pa=st.board[a.tr][a.tc],pb=st.board[b.tr][b.tc],sa=(pa?VALUE[pa.toLowerCase()]:0)+(a.promotion?800:0)+(a.castle?30:0),sb=(pb?VALUE[pb.toLowerCase()]:0)+(b.promotion?800:0)+(b.castle?30:0);return sb-sa;
    });
  }
  function minimax(st,depth,alpha,beta,ply=0) {
    const moves=legalMoves(st);if(!moves.length){if(inCheck(st,st.turn))return st.turn==='b'?-100000+ply:100000-ply;return 0}if(depth<=0)return evaluate(st);
    const list=ordered(st,moves).slice(0,depth>=3?18:26);
    if(st.turn==='b'){let best=-Infinity;for(const m of list){best=Math.max(best,minimax(apply(st,m),depth-1,alpha,beta,ply+1));alpha=Math.max(alpha,best);if(beta<=alpha)break}return best}
    let best=Infinity;for(const m of list){best=Math.min(best,minimax(apply(st,m),depth-1,alpha,beta,ply+1));beta=Math.min(beta,best);if(beta<=alpha)break}return best;
  }
  function botChoice() {
    const moves=legalMoves(state);if(!moves.length)return null;const profile=typeof botTuning==='function'?botTuning(s):{label:'Medium',planning:2,error:.1,accuracy:.8};
    if(profile.error>0&&Math.random()<profile.error)return moves[Math.floor(Math.random()*moves.length)];
    const depth=profile.planning>=7?4:profile.planning>=4?3:profile.planning>=2?2:1;
    const scored=ordered(state,moves).map(m=>({m,score:minimax(apply(state,m),depth-1,-Infinity,Infinity,1)})).sort((a,b)=>b.score-a.score);
    if(profile.accuracy<.75&&scored.length>2)return scored[Math.floor(Math.random()*Math.min(4,scored.length))].m;
    if(profile.accuracy<.9&&scored.length>1&&Math.random()>.7)return scored[1].m;return scored[0].m;
  }

  function finishStatus() {
    const moves=legalMoves(state);if(moves.length){message=`${state.turn==='w'?'White':'Black'} to move${inCheck(state,state.turn)?' — CHECK!':''}`;return false}
    gameOver=true;const checked=inCheck(state,state.turn);
    if(!checked){message='Draw by stalemate';setTimeout(()=>completeLevel(900),400);return true}
    const winner=state.turn==='w'?'Black':'White';message=`Checkmate — ${winner} wins!`;
    setTimeout(()=>{if(s.mode==='2P'||winner==='White')completeLevel(3000);else failLevel(900)},400);return true;
  }
  function doMove(m,byBot=false) {
    if(gameOver)return;history.push(copyState(state));state=apply(state,m);moveNumber++;selected=null;cursor=[m.tr,m.tc];message=`${byBot?'Computer':'Player'}: ${moveName(m)}`;try{arcadeSfx?.(state.last?.captured?'hit':'move');emitArcadeFX?.(s,OX+(m.tc+.5)*CELL,OY+(m.tr+.5)*CELL,state.last?.captured?'confetti':'spark',state.last?.captured?14:6)}catch{}
    if(finishStatus())return;
    if(s.mode!=='2P'&&state.turn==='b')scheduleBot();
  }
  function scheduleBot() {
    if(botThinking||gameOver)return;botThinking=true;const profile=typeof botTuning==='function'?botTuning(s):{label:'Medium',reaction:.2};message=`${profile.label} computer thinking…`;clearTimeout(botTimer);botTimer=setTimeout(()=>{botTimer=null;const m=botChoice();botThinking=false;if(m)doMove(m,true);else finishStatus()},180+Math.round((profile.reaction||.2)*750));
  }
  function undo() {
    if(botThinking||!history.length||gameOver)return;
    state=history.pop();if(s.mode!=='2P'&&state.turn==='b'&&history.length)state=history.pop();selected=null;gameOver=false;message='Move undone';moveNumber=Math.max(0,moveNumber-(s.mode==='2P'?1:2));try{arcadeSfx?.('tap')}catch{}
  }
  function chooseSquare(r,c) {
    if(gameOver||botThinking||!inside(r,c))return;if(s.mode!=='2P'&&state.turn==='b')return;
    const p=state.board[r][c];
    if(!selected){if(color(p)===state.turn)selected=[r,c];return}
    const move=movesFrom(state,selected[0],selected[1]).find(m=>m.tr===r&&m.tc===c);
    if(move){doMove(move);return}
    if(color(p)===state.turn)selected=[r,c];else selected=null;
  }
  function key(k) {
    if(k==='ArrowLeft'||k==='KeyA')cursor[1]=(cursor[1]+7)%8;
    else if(k==='ArrowRight'||k==='KeyD')cursor[1]=(cursor[1]+1)%8;
    else if(k==='ArrowUp'||k==='KeyW')cursor[0]=(cursor[0]+7)%8;
    else if(k==='ArrowDown'||k==='KeyS')cursor[0]=(cursor[0]+1)%8;
    else if(k==='Space'||k==='Enter'||k==='KeyF')chooseSquare(cursor[0],cursor[1]);
    else if(k==='Backspace'||k==='KeyU'||k==='KeyG')undo();
  }
  function drawBoard(c) {
    const hue=typeof arcadeGameHue==='function'?arcadeGameHue('regular-chess'):225;
    const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,`hsl(${hue} 45% 13%)`);g.addColorStop(1,`hsl(${(hue+55)%360} 48% 20%)`);c.fillStyle=g;c.fillRect(0,0,W,H);
    const legal=selected?movesFrom(state,selected[0],selected[1]):[];
    const checkSq=inCheck(state,state.turn)?kingSquare(state,state.turn):null;
    for(let r=0;r<8;r++)for(let col=0;col<8;col++){
      const x=OX+col*CELL,y=OY+r*CELL,dark=(r+col)%2;
      let fill=dark?'#5d765a':'#e7dab7';
      if(state.last&&((state.last.fr===r&&state.last.fc===col)||(state.last.tr===r&&state.last.tc===col)))fill=dark?'#a89a3a':'#d8ce58';
      if(checkSq&&checkSq[0]===r&&checkSq[1]===col)fill='#d64c54';
      c.fillStyle=fill;c.fillRect(x,y,CELL,CELL);
      if(selected&&selected[0]===r&&selected[1]===col){c.strokeStyle='#31dcff';c.lineWidth=5;c.strokeRect(x+3,y+3,CELL-6,CELL-6)}
      if(cursor[0]===r&&cursor[1]===col){c.strokeStyle='#fff';c.lineWidth=2;c.strokeRect(x+6,y+6,CELL-12,CELL-12)}
      const lm=legal.find(m=>m.tr===r&&m.tc===col);if(lm){c.globalAlpha=.72;c.fillStyle=state.board[r][col]?'#ff6767':'#173f33';c.beginPath();c.arc(x+CELL/2,y+CELL/2,state.board[r][col]?20:8,0,Math.PI*2);c.fill();c.globalAlpha=1}
      const p=state.board[r][col];if(p){c.fillStyle=color(p)==='w'?'#f9fbff':'#15191d';c.strokeStyle=color(p)==='w'?'#17202c':'#e7edf6';c.lineWidth=1.4;c.font='46px "Segoe UI Symbol","Arial Unicode MS",serif';c.textAlign='center';c.textBaseline='middle';c.strokeText(GLYPH[p],x+CELL/2,y+CELL/2+2);c.fillText(GLYPH[p],x+CELL/2,y+CELL/2+2)}
    }
    c.fillStyle='rgba(5,10,24,.74)';c.fillRect(16,10,185,150);c.fillStyle='#fff';c.font='700 17px system-ui';c.textAlign='left';c.textBaseline='alphabetic';c.fillText('REGULAR CHESS',28,38);c.font='600 14px system-ui';c.fillStyle='#cbe3ff';c.fillText(s.mode==='2P'?'Local 2 Player':`Bot: ${typeof botModeLabel==='function'?botModeLabel(s):'Medium'}`,28,64);c.fillText('A: select / move',28,90);c.fillText('B or U: undo',28,114);c.fillText('Castling • En passant',28,138);
    c.fillStyle='rgba(5,10,24,.78)';c.fillRect(690,70,194,200);c.fillStyle='#fff';c.font='700 16px system-ui';c.fillText('MATCH STATUS',706,100);c.font='600 14px system-ui';wrapText(c,message,706,126,160,20);c.fillText(`Move ${Math.floor(moveNumber/2)+1}`,706,220);c.fillText(state.turn==='w'?'White turn':'Black turn',706,245);
    c.fillStyle='#326690';c.fillRect(708,300,155,48);c.fillStyle='#fff';c.textAlign='center';c.font='800 17px system-ui';c.fillText('UNDO',785,331);c.fillStyle='#a24d61';c.fillRect(708,365,155,48);c.fillStyle='#fff';c.fillText('NEW GAME',785,396);
  }
  function wrapText(c,text,x,y,maxWidth,lineHeight){const words=String(text).split(/\s+/);let line='',yy=y;for(const word of words){const test=line?`${line} ${word}`:word;if(c.measureText(test).width>maxWidth&&line){c.fillText(line,x,yy);line=word;yy+=lineHeight}else line=test}if(line)c.fillText(line,x,yy)}
  function restart(){clearTimeout(botTimer);state=freshState();history=[];selected=null;cursor=[6,4];botThinking=false;gameOver=false;message='White to move';moveNumber=0;try{arcadeSfx?.('action')}catch{}}

  return {
    keyDown:key,
    pointer(p,t){if(t!=='pointerdown')return;if(p.x>=708&&p.x<=863&&p.y>=300&&p.y<=348){undo();return}if(p.x>=708&&p.x<=863&&p.y>=365&&p.y<=413){restart();return}const r=Math.floor((p.y-OY)/CELL),c=Math.floor((p.x-OX)/CELL);chooseSquare(r,c)},
    draw:drawBoard,
    cleanup(){clearTimeout(botTimer)}
  };
}
