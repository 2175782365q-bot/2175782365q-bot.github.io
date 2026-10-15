(()=>{
const R={idle:[0,6,180],walk:[1,6,110],wave:[2,6,130],work:[3,6,140],jump:[4,6,100],sleep:[5,6,420]};
const LINES=['好的！马上做～','曲奇又许愿啦？','交给饼干总监！','螺丝刀已就位🔧','需求收到，开工！','嘿嘿，做好啦～','再许一个愿？','今天也要快乐鸭','别戳啦，痒～','代码在冒烟…没事的！'];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const el=document.createElement('div');el.id='biscuit-mascot';el.setAttribute('role','img');el.setAttribute('aria-label','饼干总监');el.title='饼干总监';
el.innerHTML='<div class="bm-sprite"></div><div class="bm-bubble" aria-live="polite"></div>';
document.body.appendChild(el);
const sp=el.firstChild,bub=el.lastChild;
let st='idle',f=0,last=0,lock=0,idleT=Date.now(),drag=null,moved=false;
const set=(s,ms)=>{if(st!==s){st=s;f=0}lock=ms?Date.now()+ms:0};
function frame(t){
  const [row,n,d]=R[st];
  if(t-last>(reduce?d*3:d)){last=t;f=(f+1)%n;if(reduce&&st!=='sleep')f=0;
    sp.style.backgroundPosition=`${f*20}% ${row*20}%`;}
  if(lock&&Date.now()>lock){lock=0;set('idle')}
  if(!lock&&st!=='sleep'&&Date.now()-idleT>25000)set('sleep');
  else if(!lock&&st==='idle'&&Math.random()<0.0015)set('work',2400);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
function say(s){bub.textContent=s;bub.classList.add('on');clearTimeout(say.t);say.t=setTimeout(()=>bub.classList.remove('on'),2200)}
function wake(){idleT=Date.now();if(st==='sleep'){set('wave',900);say('唔…醒啦！')}}
['mousemove','keydown','scroll','touchstart'].forEach(e=>addEventListener(e,wake,{passive:true}));
addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();sp.classList.toggle('flip',e.clientX<r.left+r.width/2)},{passive:true});
el.addEventListener('mouseenter',()=>{if(!lock)set('wave',1200)});
el.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,r:el.getBoundingClientRect()};moved=false;el.setPointerCapture(e.pointerId)});
el.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>6)moved=true;
  if(moved){set('walk',400);el.style.left=Math.max(0,Math.min(innerWidth-drag.r.width,drag.r.left+dx))+'px';el.style.top=Math.max(0,Math.min(innerHeight-drag.r.height,drag.r.top+dy))+'px';el.style.right='auto';el.style.bottom='auto'}});
el.addEventListener('pointerup',()=>{if(!moved){wake();set('jump',600);say(LINES[Math.random()*LINES.length|0])}drag=null});
})();
