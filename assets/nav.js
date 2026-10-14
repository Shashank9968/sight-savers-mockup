/* Sight Savers Optics · P2 · mega menu (desktop) + drawer accordions (mobile). */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const items=$$('.nav-item');
const OPEN_MS=140,CLOSE_MS=260;
const links=it=>$$('.mega a[href], .mega button',it).filter(a=>a.offsetParent!==null);
let quiet=false;
function close(it,focusTop){if(!it)return;it.classList.remove('open');$('.nav-top',it).setAttribute('aria-expanded','false');if(focusTop){quiet=true;$('.nav-top',it).focus();quiet=false;}}
function open(it){items.forEach(o=>{if(o!==it)close(o);});it.classList.add('open');$('.nav-top',it).setAttribute('aria-expanded','true');}
const desktop=()=>window.matchMedia('(min-width:981px)').matches;
items.forEach((it,i)=>{
  const top=$('.nav-top',it);let tIn,tOut;
  it.addEventListener('mouseenter',()=>{if(!desktop())return;clearTimeout(tOut);tIn=setTimeout(()=>open(it),items.some(o=>o.classList.contains('open'))?0:OPEN_MS);});
  it.addEventListener('mouseleave',()=>{clearTimeout(tIn);tOut=setTimeout(()=>close(it),CLOSE_MS);});
  top.addEventListener('focus',()=>{if(desktop()&&!quiet)open(it);});
  it.addEventListener('focusout',e=>{if(!it.contains(e.relatedTarget))close(it);});
  it.addEventListener('keydown',e=>{
    const L=links(it),idx=L.indexOf(document.activeElement),onTop=document.activeElement===top;
    const cols=$$('.mega-col, .mega-card',it);
    const colOf=el=>cols.findIndex(c=>c.contains(el));
    if(e.key==='Escape'){if(it.classList.contains('open')){e.preventDefault();close(it,true);}return;}
    if(onTop){
      if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const rtl=document.dir==='rtl';const d=(e.key==='ArrowRight')!==rtl?1:-1;$('.nav-top',items[(i+d+items.length)%items.length]).focus();}
      else if(e.key==='ArrowDown'){e.preventDefault();open(it);const l=links(it);l[0]&&l[0].focus();}
      else if(e.key==='Home'){e.preventDefault();$('.nav-top',items[0]).focus();}
      else if(e.key==='End'){e.preventDefault();$('.nav-top',items[items.length-1]).focus();}
      return;
    }
    if(idx<0)return;
    if(e.key==='ArrowDown'){e.preventDefault();L[Math.min(idx+1,L.length-1)].focus();}
    else if(e.key==='ArrowUp'){e.preventDefault();if(idx===0)top.focus();else L[idx-1].focus();}
    else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const rtl=document.dir==='rtl';const d=(e.key==='ArrowRight')!==rtl?1:-1;
      const c=colOf(document.activeElement);const nc=cols[(c+d+cols.length)%cols.length];const f=links(it).find(a=>nc.contains(a));f&&f.focus();}
    else if(e.key==='Home'){e.preventDefault();L[0].focus();}
    else if(e.key==='End'){e.preventDefault();L[L.length-1].focus();}
  });
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const o=items.find(x=>x.classList.contains('open'));if(o&&!o.contains(document.activeElement))close(o);}});
window.addEventListener('resize',()=>{if(!desktop())items.forEach(o=>close(o));});
/* drawer accordions */
$$('.acc-btn').forEach(b=>b.addEventListener('click',()=>{const o=b.getAttribute('aria-expanded')==='true';
  $$('.acc-btn').forEach(x=>{if(x!==b&&x.getAttribute('aria-expanded')==='true'){x.setAttribute('aria-expanded','false');document.getElementById(x.getAttribute('aria-controls')).hidden=true;}});
  b.setAttribute('aria-expanded',!o);document.getElementById(b.getAttribute('aria-controls')).hidden=o;}));
})();
