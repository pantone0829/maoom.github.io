const N=5, COUNT=N*N, EMPTY=COUNT-1;
const board=document.getElementById('board');
const movesEl=document.getElementById('moves');
const complete=document.getElementById('complete');
let state=[], moves=0, locked=false;

function solved(){ return Array.from({length:COUNT},(_,i)=>i); }
function rc(pos){ return [Math.floor(pos/N),pos%N]; }
function adjacent(a,b){ const [ar,ac]=rc(a),[br,bc]=rc(b); return Math.abs(ar-br)+Math.abs(ac-bc)===1; }

function build(){
  board.innerHTML='';
  for(let id=0;id<EMPTY;id++){
    const t=document.createElement('button');
    t.className='tile'; t.dataset.id=id; t.type='button';
    const r=Math.floor(id/N), c=id%N;
    t.style.backgroundPosition=`${c*25}% ${r*25}%`;
    t.setAttribute('aria-label',`퍼즐 조각 ${id+1}`);
    t.addEventListener('click',()=>moveTile(id,true));
    board.appendChild(t);
  }
}
function render(){
  for(const t of board.children){
    const id=Number(t.dataset.id), pos=state.indexOf(id);
    const [r,c]=rc(pos);
    t.style.transform=`translate(${c*100}%,${r*100}%)`;
  }
  movesEl.textContent=`MOVE ${moves}`;
}
function moveTile(id,countMove){
  if(locked)return;
  const p=state.indexOf(id), e=state.indexOf(EMPTY);
  if(!adjacent(p,e))return;
  [state[p],state[e]]=[state[e],state[p]];
  if(countMove)moves++;
  render();
  if(countMove && state.every((v,i)=>v===i)){
    locked=true; complete.classList.add('show');
  }
}
function shuffle(){
  complete.classList.remove('show'); locked=false; state=solved(); moves=0;
  let empty=EMPTY, prev=-1;
  for(let k=0;k<400;k++){
    const [r,c]=rc(empty), opts=[];
    if(r>0)opts.push(empty-N); if(r<N-1)opts.push(empty+N);
    if(c>0)opts.push(empty-1); if(c<N-1)opts.push(empty+1);
    let choices=opts.filter(x=>x!==prev); if(!choices.length)choices=opts;
    const next=choices[Math.floor(Math.random()*choices.length)];
    [state[empty],state[next]]=[state[next],state[empty]];
    prev=empty; empty=next;
  }
  if(state.every((v,i)=>v===i)) return shuffle();
  render();
}
function reset(){ complete.classList.remove('show'); locked=false; state=solved(); moves=0; render(); }

let sx=0,sy=0;
board.addEventListener('touchstart',e=>{const t=e.touches[0];sx=t.clientX;sy=t.clientY},{passive:true});
board.addEventListener('touchend',e=>{
  if(locked)return;
  const t=e.changedTouches[0], dx=t.clientX-sx, dy=t.clientY-sy;
  if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;
  const epos=state.indexOf(EMPTY),[er,ec]=rc(epos);
  let target=-1;
  if(Math.abs(dx)>Math.abs(dy)){
    if(dx>0 && ec>0) target=epos-1;
    if(dx<0 && ec<N-1) target=epos+1;
  }else{
    if(dy>0 && er>0) target=epos-N;
    if(dy<0 && er<N-1) target=epos+N;
  }
  if(target>=0){ const id=state[target]; if(id!==EMPTY) moveTile(id,true); }
},{passive:true});

document.getElementById('shuffle').addEventListener('click',shuffle);
document.getElementById('reset').addEventListener('click',reset);
build(); shuffle();
