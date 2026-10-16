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
