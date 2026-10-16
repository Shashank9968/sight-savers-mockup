/* Sight Savers Optics · P2 · rule-based recommendations (similar, frequently bought together, recently viewed, multi-box nudge). */
(function(){
'use strict';
const A=window.SSOapp;if(!A)return;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const L=A.lenses,BY={};L.forEach(l=>BY[l.id]=l);
const esc=A.esc,aed=A.aed,AR=A.AR;
const RKEY='sso-p2-recent';
const recent=()=>{try{return JSON.parse(localStorage.getItem(RKEY)||'[]').filter(id=>BY[id])}catch(e){return []}};
const pk=l=>l.type==='Care'?(l.pk||'Lens care'):`${l.pack} lenses · ${l.rep.toLowerCase()}${l.type==='Coloured'?' · coloured':''}${l.type==='Toric'?' · toric':''}`;
const lens=l=>l.type!=='Care';
function similar(p,n=4){
  if(!lens(p))return L.filter(l=>!lens(l)&&l.id!==p.id).sort((a,b)=>(b.care===p.care)-(a.care===p.care)||b.pop-a.pop).slice(0,n);
  const rank=(a,b)=>(b.brand===p.brand)-(a.brand===p.brand)||Math.abs(a.price-p.price)-Math.abs(b.price-p.price);
  let out=L.filter(l=>lens(l)&&l.id!==p.id&&l.rep===p.rep&&l.type===p.type).sort(rank);
  if(out.length<2){const more=L.filter(l=>lens(l)&&l.id!==p.id&&!out.includes(l)&&l.type===p.type).sort(rank);out=out.concat(more);}
  if(out.length<2){const more=L.filter(l=>lens(l)&&l.id!==p.id&&!out.includes(l)&&l.rep===p.rep).sort(rank);out=out.concat(more);}
  return out.slice(0,n);
}
// curated pairs: monthly / bi-weekly -> solution, daily -> case, any lens -> drops
function fbt(p){
  if(lens(p))return (p.rep==='Daily'?['case-1','drops-1']:['solution-1','drops-1']).map(id=>BY[id]).filter(Boolean);
  const M={'solution-1':['case-1','drops-1'],'solution-2':['case-1'],'drops-1':['solution-2'],'case-1':['solution-1']};
  return (M[p.id]||[]).map(id=>BY[id]).filter(Boolean);
}
const popular=(n=4,f=()=>true)=>L.filter(f).sort((a,b)=>b.pop-a.pop||a.price-b.price).slice(0,n);
function card(l){
  const link='lens.html?p='+l.id;
  const btn=lens(l)?`<a class="add" href="${link}" aria-label="Choose power: ${esc(l.brand+' '+l.name)}">Choose power <svg class="ico s flip" aria-hidden="true"><use href="#i-arrow"/></svg></a>`
    :`<button class="add" type="button" data-add="${l.id}" aria-label="Add: ${esc(l.name)}"><svg class="ico s" aria-hidden="true"><use href="#i-plus"/></svg> Add</button>`;
  return `<article class="rec-card" role="listitem"><a class="rc-img" href="${link}" tabindex="-1" aria-hidden="true"><img src="${l.img}" alt="" loading="lazy"></a>`+
    `<span class="mono" lang="en">${esc(l.brand)}</span><h3 lang="en"><a href="${link}">${esc(l.name)}</a></h3><p class="rc-meta" lang="en">${esc(pk(l))}</p>`+
    `<div class="rc-row"><b>${aed(l.price)}${l.example?'':''}</b>${btn}</div></article>`;
}
const rail=(list,label)=>`<div class="rec-rail" role="list" aria-label="${esc(label)}">${list.map(card).join('')}</div>`;
window.SSOrecs={recent,similar,fbt,popular,card,rail,pk,BY};

/* ---- home: recently viewed (only with history) ---- */
const hr=$('[data-rec-recent]');
if(hr){const r=recent().map(id=>BY[id]).slice(0,4);if(r.length){$('[data-rail]',hr).innerHTML=rail(r,'Recently viewed');hr.hidden=false;}}

/* ---- product page: similar + bundle + nudge ---- */
function pdpRecs(){
  const P=window.SSOpdp;if(!P)return;const p=P.p;
  const sim=$('[data-rec-similar]');
  if(sim){const s=similar(p);if(s.length){$('[data-rail]',sim).innerHTML=rail(s,lens(p)?'Similar lenses':'More lens care');
    $('[data-sim-h]',sim).textContent=lens(p)?'Similar lenses.':'More lens care.';
    $('[data-sim-lead]',sim).textContent=lens(p)?`Same replacement (${p.rep.toLowerCase()}) and type, closest in brand and price.`:'Other lens-care items.';sim.hidden=false;}}
  const bd=$('[data-bundle]');const extras=fbt(p);
  if(bd&&extras.length){
    const items=extras.map((x,i)=>`<label class="bundle-item bundle-opt"><input type="checkbox" value="${x.id}"${i===0?' checked':''}><img src="${x.img}" alt=""><span><span class="mono">${esc(x.brand)}</span><b>${esc(x.name)}</b><span class="small">${aed(x.price)}</span></span></label>`).join('<span class="bundle-plus" aria-hidden="true">+</span>');
    bd.innerHTML=`<div class="bundle-h"><span class="mono">Frequently bought together</span><h2 id="bundle-h" class="d3">Complete your order.</h2></div>
      <div class="bundle-items"><div class="bundle-item bundle-main"><img src="${p.img}" alt=""><span><span class="mono">This ${lens(p)?'lens':'item'}</span><b>${esc(p.name)}</b><span class="small" data-b-main></span></span></div><span class="bundle-plus" aria-hidden="true">+</span>${items}</div>
      <div class="bundle-sum"><span class="mono">Together</span><b data-b-tot></b><button class="btn btn-ink" type="button" data-b-add></button>
      <p class="small muted">${lens(p)?'Uses the power, boxes and delivery you chose above.':'Adds both to your cart.'}</p></div>`;
    bd.setAttribute('aria-labelledby','bundle-h');bd.hidden=false;
    const upd=()=>{const ch=$$('input:checked',bd).map(i=>BY[i.value]);const main=P.boxes()*p.price;
      $('[data-b-main]',bd).textContent=`${P.boxes()} ${lens(p)?(P.boxes()===1?'box':'boxes'):'×'} · ${aed(main)}`;
      $('[data-b-tot]',bd).textContent=aed(main+ch.reduce((a,x)=>a+x.price,0));
      $('[data-b-add]',bd).textContent=ch.length===0?'Add to cart':ch.length===1?'Add both':'Add all '+(ch.length+1);};
    bd.addEventListener('change',upd);document.addEventListener('sso:qty',upd);upd();
    $('[data-b-add]',bd).addEventListener('click',()=>{const ids=$$('input:checked',bd).map(i=>i.value);
      if(lens(p)){P.form.dataset.extra=ids.join(',');P.form.requestSubmit();}
      else{A.addSimple(p.id,P.boxes(),true);ids.forEach(id=>A.addSimple(id,1,true));A.toast((ids.length?(ids.length===1?'Added both':'Added all '+(ids.length+1)):'Added')+' to cart · <a href="cart.html">View cart</a>');}});
  }
  const nd=$('[data-nudge]');
  if(nd&&lens(p)){
    const upd=()=>{const pe=P.perEye();const save=Math.round(p.price*3*2*0.10);
      nd.hidden=pe>=3;nd.innerHTML=`<span class="mono">Multi-box saving</span><p>3+ boxes per eye could save 10%, about ${aed(save)} on a 6-box order. Applied automatically at checkout.</p><button class="lnk" type="button" data-nudge-go>Make it 3 boxes per eye</button>`;
      $('[data-nudge-go]',nd).addEventListener('click',()=>{P.setPerEye(3);A.toast('Set to 3 boxes per eye');});};
    document.addEventListener('sso:qty',upd);upd();
  }
}
if(window.SSOpdp)pdpRecs();else document.addEventListener('sso:pdp',pdpRecs,{once:true});

/* ---- cart: you might also need + reorder ---- */
const cr=$('[data-rec-cart]');
function cartRecs(){
  const c=A.getCart();const inCart=new Set(c.map(l=>l.id));let list=[];
  c.forEach(l=>{const p=BY[l.id];if(p)fbt(p).forEach(x=>{if(!inCart.has(x.id)&&!list.includes(x))list.push(x);});});
  let lead='Picked to go with what’s in your cart.';
  if(!list.length){list=popular(4,l=>!inCart.has(l.id));lead='Popular in Dubai.';}
  $('[data-rail]',cr).innerHTML=rail(list.slice(0,4),'You might also need');$('[data-lead]',cr).textContent=lead;
  const ro=$('[data-rec-reorder]');if(ro){const r=recent().map(id=>BY[id]).filter(lens).slice(0,4);
    $('[data-rail]',ro).innerHTML=r.length?rail(r,'Reorder: recently viewed'):'<p class="muted">Lenses you view will appear here for a quick reorder. <a class="lnk" href="contact-lenses.html">Shop contact lenses</a></p>';}
}
if(cr){cartRecs();document.addEventListener('sso:cart',cartRecs);}
})();
