/* Sight Savers Optics · premium motion layer. Vanilla, no deps. Disabled under prefers-reduced-motion. */
(function(){'use strict';
var RM=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(RM)return;
var d=document,H=d.documentElement,$$=function(s,r){return Array.prototype.slice.call((r||d).querySelectorAll(s))};
H.classList.add('m-on');
var E='cubic-bezier(.2,.7,.2,1)';
/* reveal on scroll, staggered per parent */
var RS='main .sh,main .pcard,main .tile,main .acc-card,main .sp-rel,main .qa-card,main section h2,main .lead,main .ctas,main .row>*,main .faq,main .story,main article';
var hero=d.querySelector('.lhero,.ph-head');
var els=$$(RS).filter(function(e){return !(hero&&hero.contains(e))&&!e.closest('.mega,.modal,[hidden]')});
var vh=innerHeight;
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('m-in');io.unobserve(x.target)}})},{rootMargin:'0px 0px -6% 0px',threshold:.05});
  var groups=new Map();
  els.forEach(function(e){if(!e.offsetParent||e.getBoundingClientRect().top<vh*.92)return; /* above-the-fold stays put: no flash */
    var p=e.parentNode,n=groups.get(p)||0;groups.set(p,n+1);e.style.setProperty('--i',Math.min(n,6));e.classList.add('m-rv');io.observe(e)});
  setTimeout(function(){$$('.m-rv:not(.m-in)').forEach(function(e){if(e.getBoundingClientRect().top<innerHeight)e.classList.add('m-in')})},2500);
}
/* blur-up images */
$$('main img[loading=lazy], main .pcard img, main .tile img').forEach(function(i){if(i.complete&&i.naturalWidth)return;i.classList.add('m-lz');var f=function(){i.classList.add('m-ld')};i.addEventListener('load',f,{once:true});i.addEventListener('error',f,{once:true})});
/* scroll: progress hairline, header shrink, hero parallax (rAF-throttled) */
var bar=d.createElement('div');bar.className='m-prog';bar.setAttribute('aria-hidden','true');d.body.appendChild(bar);
var hdr=d.querySelector('.hdr'),himg=d.querySelector('.lhero picture, .sp-hero picture'),tick=false;
function onS(){tick=false;var y=scrollY,m=H.scrollHeight-innerHeight;bar.style.transform='scaleX('+(m>0?Math.min(1,y/m):0)+')';
  if(hdr)hdr.classList.toggle('m-scrolled',y>8);if(y>=m-40)$$('.m-rv:not(.m-in)').forEach(function(e){e.classList.add('m-in')});
  if(himg&&y<innerHeight*1.2)himg.style.transform='translate3d(0,'+(y*.18).toFixed(1)+'px,0)';}
addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(onS)}},{passive:true});onS();
/* magnetic pill buttons (fine pointers only) */
if(matchMedia('(hover:hover) and (pointer:fine)').matches){
  d.addEventListener('pointermove',function(e){var b=e.target.closest&&e.target.closest('.btn');if(!b)return;var r=b.getBoundingClientRect();
    b.style.setProperty('--mx',((e.clientX-r.left-r.width/2)*.12).toFixed(1)+'px');b.style.setProperty('--my',((e.clientY-r.top-r.height/2)*.18).toFixed(1)+'px')},{passive:true});
  d.addEventListener('pointerout',function(e){var b=e.target.closest&&e.target.closest('.btn');if(b&&!b.contains(e.relatedTarget)){b.style.removeProperty('--mx');b.style.removeProperty('--my')}});
}
/* secondary image swap on product cards when data allows (data-alt on img) */
$$('.pcard .ph img[data-alt]').forEach(function(i){var a=new Image();a.src=i.dataset.alt;a.alt='';a.className='m-alt';a.loading='lazy';i.parentNode.appendChild(a)});
/* smooth accordion / FAQ height */
d.addEventListener('click',function(e){var b=e.target.closest('.acc-btn,.faq .q>button');if(!b)return;
  setTimeout(function(){var p=d.getElementById(b.getAttribute('aria-controls'));if(!p||p.hidden||!p.animate)return;
    p.animate([{opacity:0,transform:'translateY(-6px)',clipPath:'inset(0 0 100% 0)'},{opacity:1,transform:'none',clipPath:'inset(0 0 0 0)'}],{duration:380,easing:E})},0)});
/* advisor direction */
var back=d.querySelector('[data-qa-back],.qa-nav button[type=button]');
if(back)back.addEventListener('click',function(){$$('.qa-step').forEach(function(s){s.classList.add('m-back')});setTimeout(function(){$$('.qa-step').forEach(function(s){s.classList.remove('m-back')})},500)},true);
/* shop filter crossfade */
d.addEventListener('change',function(e){if(!e.target.closest('.filters,[data-filters],form.flt,.shop-f,aside'))return;var g=d.querySelector('main .pgrid');if(g){g.classList.remove('m-fade');void g.offsetWidth;g.classList.add('m-fade')}});
/* number tween for AED prices */
function num(t){var m=/AED\s?([\d,]+)/.exec(t||'');return m?+m[1].replace(/,/g,''):null}
var busy=new WeakSet();
function tween(el,from,to,tpl){busy.add(el);var t0=performance.now(),dur=450;
  (function f(t){var k=Math.min(1,(t-t0)/dur),v=from+(to-from)*(1-Math.pow(1-k,3));el.textContent=tpl.replace(/AED\s?[\d,]+/,'AED '+Math.round(v).toLocaleString('en-US'));
    if(k<1)requestAnimationFrame(f);else{el.textContent=tpl;setTimeout(function(){busy.delete(el)},0)}})(t0)}
var last=new WeakMap();
$$('[data-f],[data-ff]').forEach(function(el){last.set(el,el.textContent)});
if(window.MutationObserver)new MutationObserver(function(ms){ms.forEach(function(m){var el=m.target.nodeType===3?m.target.parentNode:m.target;if(!el||busy.has(el)||!(el.matches&&el.matches('[data-f],[data-ff]')))return;
  var nt=el.textContent,a=num(last.get(el)),b=num(nt);last.set(el,nt);if(a!=null&&b!=null&&a!==b)tween(el,a,b,nt)})}).observe(d.body,{subtree:true,childList:true,characterData:true});
/* tasteful counters: count up AED/number figures in price bands when they enter view */
if('IntersectionObserver' in window){var co=new IntersectionObserver(function(en){en.forEach(function(x){if(!x.isIntersecting)return;co.unobserve(x.target);var el=x.target,t=el.textContent,n=num(t);if(n&&n>20)tween(el,Math.round(n*.6),n,t)})},{threshold:.6});
  $$('main .saveband .pr, main .price-band .pr, main [data-count]').forEach(function(e){co.observe(e)})}
/* add to cart: flying dot + badge bump */
var lastClick=null;d.addEventListener('click',function(e){var b=e.target.closest('[data-add],button[type=submit],.btn');if(b)lastClick={x:e.clientX,y:e.clientY,t:Date.now()}},true);
d.addEventListener('sso:cart',function(){var c=d.querySelector('.hdr .count');var cart=d.querySelector('.hdr [data-cart-link]');
  if(c){c.classList.remove('m-bump');void c.offsetWidth;c.classList.add('m-bump')}
  if(!cart||!lastClick||Date.now()-lastClick.t>2500||!lastClick.x)return;var r=cart.getBoundingClientRect(),dot=d.createElement('div');dot.className='m-dot';dot.setAttribute('aria-hidden','true');d.body.appendChild(dot);
  var dx=r.left+r.width/2-lastClick.x,dy=r.top+r.height/2-lastClick.y;
  var a=dot.animate([{transform:'translate('+lastClick.x+'px,'+lastClick.y+'px) scale(1)',opacity:1},{transform:'translate('+(lastClick.x+dx*.5)+'px,'+(lastClick.y+dy-120)+'px) scale(1.2)',opacity:1,offset:.45},{transform:'translate('+(lastClick.x+dx)+'px,'+(lastClick.y+dy)+'px) scale(.4)',opacity:.2}],{duration:700,easing:E});
  a.onfinish=function(){dot.remove()};lastClick=null});
/* marquee trust strip on narrow screens */
var tr=d.querySelector('.trust .wrap');
function mq(){if(!tr)return;var on=innerWidth<900,has=tr.querySelector('.m-track');var p=tr.parentNode;
  if(on&&!has){var items=$$(':scope>span',tr);var t1=d.createElement('div');t1.className='m-track';items.forEach(function(s){t1.appendChild(s)});var t2=t1.cloneNode(true);t2.setAttribute('aria-hidden','true');t2.removeAttribute('role');$$('[role]',t2).forEach(function(s){s.removeAttribute('role')});tr.appendChild(t1);tr.appendChild(t2);p.classList.add('m-mq')}
  else if(!on&&has){var ts=$$('.m-track',tr);$$(':scope>span',ts[0]).forEach(function(s){tr.appendChild(s)});ts.forEach(function(t){t.remove()});p.classList.remove('m-mq')}}
mq();addEventListener('resize',mq,{passive:true});
})();
