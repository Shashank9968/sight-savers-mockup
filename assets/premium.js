/* Premium product layer: carousels, PDP gallery + zoom, PLP sort/editorial tiles/filter count. */
(function(){var d=document,$=function(s,r){return(r||d).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||d).querySelectorAll(s))};
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
// carousels
$$('[data-car]').forEach(function(c){var t=$('.car-track',c),bar=$('.car-prog span',c),pv=$('[data-car-prev]',c),nx=$('[data-car-next]',c);
  var step=function(){var i=$('.car-i',t);return i?Math.max(i.getBoundingClientRect().width+parseFloat(getComputedStyle($('.car-list',t)).columnGap||0),200)*(innerWidth>900?2:1):300};
  var go=function(dir){t.scrollBy({left:dir*step(),behavior:RM?'auto':'smooth'})};
  var upd=function(){var max=t.scrollWidth-t.clientWidth;var p=max>0?t.scrollLeft/max:1;var vis=t.clientWidth/t.scrollWidth;
    bar.style.width=Math.max(vis*100,8)+'%';bar.style.transform='translateX('+(p*(1/Math.max(vis,.08)-1)*100)+'%)';
    pv.disabled=t.scrollLeft<4;nx.disabled=t.scrollLeft>max-4;c.classList.toggle('car-static',max<4)};
  pv.addEventListener('click',function(){go(-1)});nx.addEventListener('click',function(){go(1)});
  t.addEventListener('keydown',function(e){if(e.target!==t)return;var k={ArrowRight:1,ArrowLeft:-1}[e.key];if(k){e.preventDefault();go(k)}
    if(e.key==='Home'){e.preventDefault();t.scrollTo({left:0})}if(e.key==='End'){e.preventDefault();t.scrollTo({left:t.scrollWidth})}});
  t.addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd();});
// gallery
$$('[data-gal]').forEach(function(g){var s=$$('.g-s',g),th=$$('.g-t',g),gi=$('[data-gi]',g),z=$('[data-gzoom]',g),m=$('.g-main',g);
  var show=function(i){s.forEach(function(x,j){x.classList.toggle('on',i===j)});th.forEach(function(x,j){x.setAttribute('aria-pressed',i===j)});if(gi)gi.textContent=i+1;m.classList.remove('zoom');z.setAttribute('aria-pressed','false')};
  th.forEach(function(b,i){b.addEventListener('click',function(){show(i)})});
  z.addEventListener('click',function(){var on=m.classList.toggle('zoom');z.setAttribute('aria-pressed',on)});
  m.addEventListener('click',function(e){if(e.target.closest('button'))return;var on=m.classList.toggle('zoom');z.setAttribute('aria-pressed',on)});
  m.addEventListener('mousemove',function(e){var r=m.getBoundingClientRect();m.style.setProperty('--zx',((e.clientX-r.left)/r.width*100)+'%');m.style.setProperty('--zy',((e.clientY-r.top)/r.height*100)+'%')});
  // keep thumbs in sync when the frame/lens script swaps the main image
  var mi=$('.g-s img',g);if(mi&&th[0])new MutationObserver(function(){$('img',th[0]).src=mi.src}).observe(mi,{attributes:true,attributeFilter:['src']});});
// PLP: sort, editorial tiles, active filter count
var f=$('[data-plp]'),grid=$('[data-plp-grid]');
if(f&&grid){var sel=$('[data-sort]',f);var orig=$$(':scope>*',grid);
  var sort=function(){var v=sel.value;var cards=$$('.pcard',grid);var key={lo:function(a,b){return a.dataset.price-b.dataset.price},hi:function(a,b){return b.dataset.price-a.dataset.price},
      az:function(a,b){return a.dataset.name.localeCompare(b.dataset.name)}}[v];
    if(!key){orig.forEach(function(e){grid.appendChild(e)});}else{cards.sort(key).forEach(function(e){grid.appendChild(e)});$$('[data-ed]',grid).forEach(function(e){grid.appendChild(e)});}};
  var eds=function(){var n=$$('input:checked',f).length;$$('[data-ed]',grid).forEach(function(e){e.hidden=n>0||sel.value!=='pop'});var fn=$('[data-fn]',f);
    var m=$$('.fbar-pop input:checked',f).length;if(fn)fn.textContent=m?'('+m+')':''};
  sel.addEventListener('change',function(){sort();eds();grid.classList.remove('m-fade');void grid.offsetWidth;grid.classList.add('m-fade')});
  f.addEventListener('change',eds);f.addEventListener('reset',function(){setTimeout(function(){sel.value='pop';sort();eds()})});eds();
  var bar=$('[data-fbar]');if(bar&&'IntersectionObserver'in window){var s=d.createElement('div');bar.parentNode.insertBefore(s,bar);new IntersectionObserver(function(e){bar.classList.toggle('stuck',!e[0].isIntersecting)},{rootMargin:'-80px 0px 0px 0px'}).observe(s)}
  d.addEventListener('click',function(e){var o=$('.fbar-more[open]');if(o&&!o.contains(e.target))o.open=false});
  d.addEventListener('keydown',function(e){var o=$('.fbar-more[open]');if(e.key==='Escape'&&o){o.open=false;$('summary',o).focus()}});}
})();
/* LARQ-anatomy cards: swatches, sizes, frame quick-add, favourites tabs, marquee pause. */
(function(){var d=document,$$=function(s,r){return Array.prototype.slice.call((r||d).querySelectorAll(s))};
d.addEventListener('click',function(e){var b=e.target.closest('.lq-s[data-col],.lq-z');if(!b)return;var g=b.parentNode;
  $$('button',g).forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
  var card=b.closest('.lq');if(b.dataset.col&&card){var im=card.querySelector('.pt-a');if(im)im.src='assets/img/frames/'+card.dataset.id+'-'+b.dataset.col+'.svg'}});
d.addEventListener('click',function(e){var b=e.target.closest('[data-qf]');if(!b||!window.SSOapp)return;var A=window.SSOapp,D=window.SSO||{};
  var f=(D.frames||[]).find(function(x){return x.id===b.dataset.qf});if(!f)return;var card=b.closest('.lq');
  var col=(card.querySelector('.lq-s[aria-pressed=true]')||{}).dataset;col=col&&col.col||f.cols[0];var sz=(card.querySelector('.lq-z[aria-pressed=true]')||{}).dataset;sz=sz&&sz.sz||f.sizes[0][0];
  var C=D.cols||{};var c=A.getCart();c.push({id:f.id,name:f.name,brand:f.brand,img:'assets/img/frames/'+f.id+'-'+col+'.svg',price:f.price,q:1,del:'deliver',frame:true,opt:(C[col]?C[col][0]:col)+' · size '+sz+' · lenses added in store'});
  A.setCart(c);A.added();b.classList.add('ok');b.textContent='Added';setTimeout(function(){b.classList.remove('ok');b.textContent='Add to cart'},1600)});
$$('[data-lq]').forEach(function(car){var sec=car.closest('section'),tabs=$$('[role=tab]',sec),tr=car.querySelector('.car-track'),items=$$('.car-i',car);
  var sel=function(t,focus){tabs.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1});if(focus)t.focus();
    var k=t.dataset.tab;items.forEach(function(i){i.hidden=k==='all'?!i.hasAttribute('data-feat'):i.dataset.fk!==k});tr.setAttribute('aria-labelledby',t.id);tr.scrollLeft=0;
    tr.dispatchEvent(new Event('scroll'));};
  tabs.forEach(function(t,i){t.addEventListener('click',function(){sel(t)});t.addEventListener('keydown',function(e){var n={ArrowRight:1,ArrowLeft:-1}[e.key],j=null;
    if(n)j=(i+n+tabs.length)%tabs.length;if(e.key==='Home')j=0;if(e.key==='End')j=tabs.length-1;if(j!==null){e.preventDefault();sel(tabs[j],true)}})});});
$$('[data-mq]').forEach(function(m){var b=m.querySelector('[data-mq-p]');b.addEventListener('click',function(){var p=m.classList.toggle('paused');b.setAttribute('aria-pressed',p);b.setAttribute('aria-label',p?'Play scrolling slogans':'Pause scrolling slogans')})});
})();
