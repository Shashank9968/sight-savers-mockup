(function(){
  var fig=document.getElementById('lv-video');if(!fig)return;
  var v=fig.querySelector('video'),btn=fig.querySelector('.lvv-play');
  var rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches,loaded=false;
  function load(){if(loaded)return;loaded=true;v.querySelectorAll('source').forEach(function(s){s.src=s.dataset.src});v.load();}
  function play(){load();var p=v.play();if(p&&p.catch)p.catch(function(){btn.hidden=false});}
  btn.addEventListener('click',function(){btn.hidden=true;v.setAttribute('controls','');play();});
  if(rm){btn.hidden=false;return;}
  v.autoplay=true;
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)play();else if(loaded)v.pause();});},{rootMargin:'200px'}).observe(fig);
  }else play();
})();
