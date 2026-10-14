/* Sight Savers Optics – clickable mockup behaviour (no network calls, nothing is submitted) */
(function(){
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const AR=document.documentElement.lang==='ar';
const fmt=n=>'AED '+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const WA='+971 56 710 3775';
const qs=new URLSearchParams(location.search);
const ico=n=>`<svg class="ico s"><use href="#i-${n}"/></svg>`;
const BASE=document.documentElement.dataset.base||'';   /* '../' inside /b2/ and /c2/ */
const A=p=>(p&&!/^(https?:|data:|\/)/.test(p))?BASE+p:p;

/* ---------- theme switch (Original / B2 / C2): same page, other folder ---------- */
(function(){
  const box=$('[data-theme-switch]'); if(!box) return;
  const cur=document.documentElement.dataset.theme||'orig';
  const ROOT=document.documentElement.dataset.root||'../';
  const page=(location.pathname.split('/').pop()||'index.html');
  const file=page+location.search+location.hash;
  const P2MAP={'eyeglasses.html':'eyewear.html','sunglasses.html':'eyewear.html','product.html':'eyewear.html'};
  const href=t=>t==='p2'?ROOT+(P2MAP[page]||page):ROOT+(t==='orig'?'v1':t)+'/'+file;
  const opts=[['p2','P2 (new)'],['orig','V1'],['b2','B2'],['c2','C2']];
  box.innerHTML='<span class="ts-lbl">Look:</span>'+opts.map(([t,l])=>`<a href="${href(t)}" data-theme-link="${t}"${t===cur?' aria-current="true" class="on"':''}><span>${l}</span></a>`).join('');
  box.setAttribute('role','group'); box.setAttribute('aria-label','Switch design look');
  try{ localStorage.setItem('sso-theme',cur); }catch(e){}
})();

/* ---------- toast + modal ---------- */
let toastEl;
function toast(html){ if(!toastEl){toastEl=document.createElement('div');toastEl.className='toast';document.body.appendChild(toastEl);} toastEl.innerHTML=html; toastEl.classList.add('show'); clearTimeout(toastEl._t); toastEl._t=setTimeout(()=>toastEl.classList.remove('show'),2600); }
function modal(html){ let m=$('#sso-modal'); if(!m){m=document.createElement('div');m.id='sso-modal';m.className='modal';m.innerHTML='<div class="scrim" data-close></div><div class="box"><button class="iconbtn sm x" data-close aria-label="Close"><svg class="ico s"><use href="#i-x"/></svg></button><div class="mc"></div></div>';document.body.appendChild(m); m.addEventListener('click',e=>{if(e.target.closest('[data-close]'))m.classList.remove('open');});}
  $('.mc',m).innerHTML=html; m.classList.add('open'); return m; }
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$$('.modal.open,.drawer.open').forEach(x=>x.classList.remove('open'));}});
function waModal(msg){
  const num=`<bdi dir="ltr" style="white-space:nowrap">${WA}</bdi>`;
  modal(AR?`<div class="row gap12" style="margin-bottom:14px;color:var(--wa)"><svg class="ico l"><use href="#i-wa"/></svg><b style="font-size:18px;color:var(--ink)">واتساب</b></div>
  <p class="small muted" style="margin-bottom:6px">في الموقع الفعلي يفتح هذا الزر محادثة واتساب مع ${num} مع هذه الرسالة جاهزة:</p>
  <div class="wa-bubble" style="background:var(--wa-tint)" dir="auto">${msg}</div>
  <div class="note warn" style="margin-top:10px">${ico('info')}<span class="xs"><b>نموذج تفاعلي:</b> لا يتم إرسال أي شيء. <span class="ex">Draft Arabic</span></span></div>
  <button class="btn btn-wa block" style="margin-top:16px" data-close>حسناً</button>`
  :`<div class="row gap12" style="margin-bottom:14px;color:var(--wa)"><svg class="ico l"><use href="#i-wa"/></svg><b style="font-size:18px;color:var(--ink)">WhatsApp</b></div>
  <p class="small muted" style="margin-bottom:6px">On the live site this opens WhatsApp to ${num} with this message pre-filled:</p>
  <div class="wa-bubble" style="background:var(--wa-tint)" dir="auto">${msg}</div>
  <div class="note warn" style="margin-top:10px">${ico('info')}<span class="xs"><b>Clickable mockup:</b> nothing is sent.</span></div>
  <button class="btn btn-wa block" style="margin-top:16px" data-close>OK</button>`);
  setTimeout(()=>{const b=$('#sso-modal .btn');b&&b.focus();},30);
}
/* mockup strip: dismissible */
try{ if(sessionStorage.getItem('sso_strip_hidden'))document.documentElement.classList.add('strip-hidden'); }catch(e){}
document.addEventListener('click',e=>{ if(e.target.closest('[data-strip-x]')){document.documentElement.classList.add('strip-hidden'); try{sessionStorage.setItem('sso_strip_hidden','1');}catch(_){} }});
/* Arabic twin pages: only the homepage exists in Arabic */
const PAGE=(location.pathname.split('/').pop()||'index.html');
if(!AR && PAGE!=='index.html' && PAGE!==''){
  document.addEventListener('click',e=>{const a=e.target.closest('a[href="ar.html"]'); if(!a)return; e.preventDefault();
    modal(`<b style="font-size:18px">Arabic version not in the mockup yet</b><p class="small muted" style="margin-top:8px">On the live site this switch opens the Arabic twin of this page (/ar/…). The mockup only includes the Arabic homepage.</p><div class="row gap12 wrapflex" style="margin-top:16px"><a class="btn btn-ink" href="ar.html" lang="ar">الصفحة الرئيسية بالعربية</a><button class="btn btn-o" data-close>Stay on this page</button></div>`);});
}
document.addEventListener('click',e=>{
  const w=e.target.closest('[data-wa]'); if(w){e.preventDefault();waModal(w.getAttribute('data-wa'));return;}
  const mk=e.target.closest('[data-mock]'); if(mk){e.preventDefault();modal(`<b style="font-size:18px">Not active in the mockup</b><p class="small muted" style="margin-top:8px">${mk.getAttribute('data-mock')}</p><button class="btn btn-ink block" style="margin-top:16px" data-close>OK</button>`);return;}
  const d=e.target.closest('[data-drawer]'); if(d){$('#drawer').classList.add('open');return;}
  if(e.target.closest('#drawer [data-close]')){$('#drawer').classList.remove('open');return;}
  const a=e.target.closest('.acc>button'); if(a){a.parentElement.classList.toggle('open');return;}
  const s=e.target.closest('[data-search]'); if(s){openSearch();return;}
});

/* ---------- search ---------- */
function openSearch(){
  const m=modal(`<b style="font-size:18px">${AR?'بحث':'Search'}</b><div class="field" style="margin-top:14px;gap:10px">${ico('search')}<input data-q placeholder="${AR?'جرّب: keratoconus':'Try “keratoconus”, “Biofinity”, “RTA”…'}" style="border:0;outline:0;flex:1;height:46px;background:transparent;min-width:0"></div><div class="search-res" data-res style="margin-top:10px;max-height:50vh;overflow:auto"></div><p class="xs muted" style="margin-top:10px">Finds products <i>and</i> pages. Mockup index of ${window.SSO.search.length} entries.</p>`);
  const inp=$('[data-q]',m), res=$('[data-res]',m);
  const draw=()=>{const q=inp.value.trim().toLowerCase(); const list=window.SSO.search.filter(x=>!q||(x[0]+' '+x[1]).toLowerCase().includes(q)).slice(0,q?20:7);
    res.innerHTML=list.length?list.map(x=>`<a href="${x[2]}"><span>${x[0]}<br><span class="xs muted">${x[1]}</span></span>${ico('chev')}</a>`).join(''):'<p class="small muted" style="padding:14px 4px">No results. Ask us on WhatsApp.</p>';};
  inp.addEventListener('input',draw); inp.addEventListener('keydown',e=>{if(e.key==='Enter'){const f=$('a',res); if(f)location.href=f.getAttribute('href');}}); draw(); setTimeout(()=>inp.focus(),50);
}

/* ---------- cart (localStorage, example seed) ---------- */
const KEY='sso_mock_cart_v1';
const SEED=[{id:'cl-11501',name:'Dailies Total One',brand:'Alcon',img:'assets/img/products/11501-0.jpg',price:235,meta:'Daily · 30 per box · R −1.25 / L −1.50 (example)',qty:2},
 {id:'fr-f1',name:'Example rectangle frame, acetate',brand:'Brand name (example)',img:'',frame:'havana',price:700,meta:'Havana tortoise · Standard fit · Single vision 1.5 (example)',qty:1,example:true}];
const getCart=()=>{try{const v=localStorage.getItem(KEY); return v?JSON.parse(v):SEED.slice();}catch(e){return SEED.slice();}};
const setCart=c=>{try{localStorage.setItem(KEY,JSON.stringify(c));}catch(e){} drawCount(true); drawCart();};
function drawCount(bump){const n=getCart().reduce((a,b)=>a+b.qty,0); $$('[data-cart-count]').forEach(el=>{el.textContent=n; if(bump){el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');}});}
function addToCart(item){const c=getCart(); const ex=c.find(x=>x.id===item.id&&x.meta===item.meta); if(ex)ex.qty+=item.qty||1; else c.push(Object.assign({qty:1},item)); setCart(c); toast(`${ico('check')} ${AR?'أضيف إلى السلة':'Added to cart'} · <a href="cart.html">${AR?'عرض السلة':'View cart'}</a>`);}
window.ssoAdd=addToCart;
document.addEventListener('click',e=>{const b=e.target.closest('[data-add]'); if(b){e.preventDefault(); addToCart(JSON.parse(b.getAttribute('data-add')));}});
const miniGlasses='<svg viewBox="0 0 24 24" class="ico l" style="color:var(--frame-1)"><use href="#i-glasses"/></svg>';
function drawCart(){
  const box=$('[data-cart-lines]'); if(!box)return; const c=getCart();
  $('[data-cart-empty]').classList.toggle('hide',c.length>0);
  box.innerHTML=c.map((x,i)=>`<div class="cart-line"><div class="thumbimg">${x.img?`<img src="${A(x.img)}" alt="">`:miniGlasses}</div>
   <div><div class="xs muted b" style="text-transform:uppercase;letter-spacing:.06em">${x.brand}</div><b>${x.name}</b> ${x.example?'<span class="ex">Example</span>':''}<div class="xs muted" style="margin-top:2px">${x.meta||''}</div>
   <div class="row gap12" style="margin-top:10px"><div class="qty"><button data-ci="${i}" data-d="-1" aria-label="Less">−</button><span>${x.qty}</span><button data-ci="${i}" data-d="1" aria-label="More">+</button></div><button class="xs muted ul" data-rm="${i}">Remove</button></div></div>
   <div class="ctl" style="text-align:end"><b>${fmt(x.price*x.qty)}</b><div class="xs muted">${fmt(x.price)} each</div></div></div>`).join('');
  const sub=c.reduce((a,b)=>a+b.price*b.qty,0);
  $('[data-c-sub]').textContent=fmt(sub); $('[data-c-vat]').textContent=fmt(sub-sub/1.05); $('[data-c-total]').textContent=fmt(sub);
  $('[data-checkout]').classList.toggle('disabled',!c.length);
}
document.addEventListener('click',e=>{
  const q=e.target.closest('[data-ci]'); if(q){const c=getCart(),i=+q.dataset.ci; c[i].qty=Math.max(1,c[i].qty+ +q.dataset.d); setCart(c); return;}
  const r=e.target.closest('[data-rm]'); if(r){const c=getCart(); c.splice(+r.dataset.rm,1); setCart(c); return;}
  if(e.target.closest('[data-cart-reset]')){try{localStorage.removeItem(KEY);}catch(_){} drawCount(true); drawCart(); return;}
  if(e.target.closest('[data-checkout]')){modal(`<b style="font-size:18px">Secure checkout</b><p class="small muted" style="margin-top:8px">On the live site this goes to the hosted payment page (card, Apple Pay), then an order-confirmed page and email. The mockup stops here: no payment is taken.</p><button class="btn btn-ink block" style="margin-top:16px" data-close>OK</button>`);}
});
drawCount(false); drawCart();

/* ---------- generic radio / check groups ----------
   Option cards are real <label><input type=radio|checkbox class=sr> (keyboard: Tab + arrows/Space).
   Chips/fit buttons are real <button>s with aria-pressed. */
function syncOpts(root){ $$('label.opt',root).forEach(l=>{const i=$('input',l); if(i)l.classList.toggle('on',i.checked);}); }
function radioGroup(root,cb){ if(!root)return;
  if($('input',root)){ root.addEventListener('change',e=>{const i=e.target; if(!i.matches('input'))return; syncOpts(root); if(i.type==='radio')cb&&cb(i.value,i.closest('.opt'));}); syncOpts(root); return; }
  $$(':scope > button',root).forEach(o=>o.addEventListener('click',()=>{ $$(':scope > button',root).forEach(x=>{x.classList.remove('on');x.setAttribute('aria-pressed','false');}); o.classList.add('on'); o.setAttribute('aria-pressed','true'); cb&&cb(o.dataset.v,o);}));
}
function pick(root,v){ const i=root&&$(`input[value="${v}"]`,root); if(i){i.checked=true; i.dispatchEvent(new Event('change',{bubbles:true}));} }

/* ---------- filter chips (listing pages) ---------- */
$$('[data-filter-scope]').forEach(scope=>{
  const items=$$('.fi',scope), grid=$('[data-items]',scope), promo=$('[data-promo]',scope);
  const groups=[...new Set($$('.chip[data-group]',scope).map(c=>c.dataset.group))];
  const active=()=>{const a={}; groups.forEach(g=>{a[g]=$$(`.chip.on[data-group="${g}"]`,scope).map(c=>c.dataset.value).filter(v=>v!=='*');}); return a;};
  const match=(it,a,skip)=>groups.every(g=>g===skip||!a[g].length||a[g].some(v=>(it.dataset[g]||'').split(' ').includes(v)));
  function apply(){
    const a=active(); let n=0;
    items.forEach(it=>{const ok=match(it,a); it.classList.toggle('hide',!ok); if(ok)n++;});
    $$('[data-n]',scope).forEach(el=>{const [g,v]=el.dataset.n.split(':'); const c=items.filter(it=>match(it,a,g)&&(it.dataset[g]||'').split(' ').includes(v)).length; el.textContent=c; el.parentElement.classList.toggle('disabled-chip',!c);});
    const any=groups.some(g=>a[g].length); if(promo)promo.classList.toggle('hide',any);
    const nf=groups.reduce((s,g)=>s+a[g].length,0); const fc=$('[data-fcount]',scope); if(fc)fc.textContent=nf?`(${nf})`:'';
    const sn=$('[data-show-n]',scope); if(sn)sn.textContent=`Show ${n} result${n===1?'':'s'}`;
    $('[data-empty]',scope).classList.toggle('hide',n>0);
    const ce=$('[data-count]',scope); if(ce)ce.textContent=`Showing ${n} of ${items.length} ${document.body.querySelector('.nav a.on')?.textContent.trim().toLowerCase()||'products'}`;
    $$('.qt').forEach(t=>{const [g,v]=t.dataset.quick.split(':'); const on=g==='*'?!any:(a[g]&&a[g].length===1&&a[g][0]===v&&groups.filter(x=>x!==g).every(x=>!a[x].length)); t.style.borderColor=on?'var(--ink)':''; t.style.borderWidth=on?'2px':'';});
  }
  function setChip(g,v,only){ const chips=$$(`.chip[data-group="${g}"]`,scope); if(v==='*'){chips.forEach(c=>c.classList.toggle('on',c.dataset.value==='*'));return;}
    const c=chips.find(c=>c.dataset.value===v); if(only){chips.forEach(x=>x.classList.remove('on')); c.classList.add('on');} else { c.classList.toggle('on'); chips.find(x=>x.dataset.value==='*').classList.toggle('on',!chips.some(x=>x.classList.contains('on')&&x.dataset.value!=='*')); if(c.classList.contains('on'))chips.find(x=>x.dataset.value==='*').classList.remove('on'); } }
  scope.addEventListener('click',e=>{const c=e.target.closest('.chip[data-group]'); if(c){setChip(c.dataset.group,c.dataset.value); apply();} if(e.target.closest('[data-clear]')){groups.forEach(g=>setChip(g,'*')); apply();}});
  $$('.qt').forEach(t=>t.addEventListener('click',()=>{const [g,v]=t.dataset.quick.split(':'); groups.forEach(x=>setChip(x,'*')); if(g!=='*')setChip(g,v,true); apply(); scope.scrollIntoView({behavior:'smooth',block:'start'});}));
  const sheet=$('.fsheet',scope), scr=$('.scrim-sheet',scope);
  const openSheet=o=>{ if(!sheet)return; sheet.classList.toggle('open',o); scr.classList.toggle('open',o); if(o){ const f=$('button,a',sheet); f&&f.focus(); } else { const b=$('[data-sheet-open]',scope); b&&b.focus(); } };
  scope.addEventListener('click',e=>{ if(e.target.closest('[data-sheet-open]'))openSheet(true); else if(e.target.closest('[data-sheet-close]'))openSheet(false); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&sheet&&sheet.classList.contains('open'))openSheet(false); });
  const sort=$('[data-sort]',scope); if(sort)sort.addEventListener('change',()=>{const v=sort.value; const arr=items.slice().sort((x,y)=>v==='pop'?(+x.dataset.pop)-(+y.dataset.pop):v==='asc'?x.dataset.price-y.dataset.price:y.dataset.price-x.dataset.price); arr.forEach(it=>grid.insertBefore(it,$('[data-empty]',grid))); if(promo){ if(v==='pop'){const ref=arr[6]; ref?grid.insertBefore(promo,ref):0;} }});
  const h=location.hash.slice(1); const map={colour:['type','colour'],toric:['type','toric'],care:['type','care'],daily:['rep','daily'],monthly:['rep','monthly']};
  if(map[h]&&groups.includes(map[h][0]))setChip(map[h][0],map[h][1],true);
  apply();
});

/* ---------- frame product + configurator ---------- */
const pdp=$('[data-pdp]');
if(pdp){
  const all=(window.SSO.frames||[]).concat(window.SSO.suns||[]);
  const f=all.find(x=>x.id===qs.get('f'))||all[0]; const sun=f.id[0]==='s';
  const COLN={havana:'Havana tortoise',black:'Black',crystal:'Crystal',navy:'Navy',teal:'Teal',red:'Red'};
  const VARS={havana:['--frame-1','--frame-2','--frame-3'],black:['--ink','--ink-2','--ink'],crystal:['--ph-2','--ph-1','--line-3'],navy:['--swatch-navy','--slate','--swatch-navy'],teal:['--teal','--teal-2','--teal'],red:['--red-deep','--red','--red-deep']};
  const st={frame:f.price,col:f.col,fit:f.fit,rx:null,lens:'sv',lensP:250,th:'1.5',thP:0,co:{},step:1};
  const cfgRoot=$('[data-cfg]');
  $$('[data-fname]').forEach(e=>e.textContent=f.name); document.title=f.name+' · Sight Savers Optics (clickable mockup)';
  if(sun){const c=$('[data-crumb-cat]'); c.textContent='Sunglasses'; c.href='sunglasses.html'; $$('.nav a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='sunglasses.html'));}
  $$('[data-fprice]').forEach(e=>e.textContent=fmt(f.price)); $$('[data-fcomplete]').forEach(e=>e.textContent=fmt(f.price+250));
  const shape=f.shape==='Round'?'round':'rect';
  $$('.gv').forEach(g=>g.classList.toggle('on',g.dataset.shapeV===shape&&g.dataset.sunV===(sun?'1':'0')));
  function setCol(k){ const v=VARS[k]||VARS.havana; [pdp,$('[data-mini]')].forEach(el=>{['--frame-1','--frame-2','--frame-3'].forEach((n,i)=>{ if(k==='havana')el.style.removeProperty(n); else el.style.setProperty(n,`var(${v[i]})`);});});
    st.col=k; $$('[data-fcol]').forEach(e=>e.textContent=COLN[k]||k); $$('.swatch').forEach(s=>{s.classList.toggle('on',s.dataset.col===k); s.setAttribute('aria-pressed',s.dataset.col===k?'true':'false');}); }
  setCol(f.col);
  $$('.swatch').forEach(s=>s.addEventListener('click',()=>setCol(s.dataset.col)));
  $$('.thumb').forEach(t=>t.addEventListener('click',()=>{ $$('.thumb').forEach(x=>x.classList.remove('on')); t.classList.add('on'); $$('.stage .gv svg').forEach(s=>s.style.transform=`rotate(${t.dataset.angle}deg) scale(${t.dataset.angle==='-3'?1.15:1})`);}));
  radioGroup($('[data-radio="fit"]'),v=>{st.fit=v; $$('[data-ffit]').forEach(e=>e.textContent=v);});
  $$('[data-radio="fit"] .opt').forEach(o=>{o.classList.toggle('on',o.dataset.v===f.fit); o.setAttribute('aria-pressed',o.dataset.v===f.fit?'true':'false');}); $$('[data-ffit]').forEach(e=>e.textContent=f.fit);
  const LN={sv:'Single vision lenses',prog:'Progressive lenses',office:'Office / computer lenses',read:'Reading lenses',nonrx:'Non-prescription lenses',frame:'Frame only (no new lenses)'};
  const RXN={upload:'Photo uploaded',type:'Typed in',later:'Send later'};
  const NEXT={1:'Continue: lens type',2:'Continue: thickness & coatings',3:'Continue: review',4:'Add to cart'};
  const extra=()=>st.thP+Object.values(st.co).reduce((a,b)=>a+b,0);
  const total=()=>st.frame+st.lensP+(st.lens==='frame'?0:extra());
  const needsAdd=()=>['prog','office','read'].includes(st.lens);
  const addMissing=()=>needsAdd()&&st.rx==='type'&&$('[name="od_add"]').value==='—'&&$('[name="os_add"]').value==='—';
  const valid=n=>n===1?!!st.rx:true;
  function sum(){
    $$('[data-s-frame]').forEach(e=>e.textContent=fmt(st.frame));
    $$('[data-s-lensname]').forEach(e=>e.textContent=LN[st.lens]+(st.lens==='frame'?'':` (${st.th})`));
    $$('[data-s-lens]').forEach(e=>e.textContent=fmt(st.lensP));
    $$('[data-s-extra]').forEach(e=>e.textContent=st.lens==='frame'?'—':fmt(extra()));
    const rx=$('[data-s-rx]'); const ok=st.rx||st.lens==='frame'||st.lens==='nonrx'; rx.textContent=st.lens==='frame'||st.lens==='nonrx'?'Not needed':(st.rx?RXN[st.rx]:'Not added yet'); rx.className='tag'+(ok?' ok':'');
    const t=total(); $$('[data-s-total]').forEach(e=>e.textContent=fmt(t)); $$('[data-s-vat]').forEach(e=>e.textContent=fmt(t-t/1.05));
    $('[data-addwarn]').classList.toggle('hide',!addMissing());
    $('[data-step="1"] [data-next]').disabled=!st.rx;
    const bb=$('[data-barnext]'); if(bb){ const inView=$('#lenses').getBoundingClientRect().top<innerHeight*0.6;
      if(!inView&&st.step===1&&!st.rx){bb.innerHTML='Choose lenses '+ico('arrow'); bb.disabled=false;}
      else {bb.innerHTML=(st.step===4?ico('cart')+' ':'')+NEXT[st.step]+(st.step<4?' '+ico('arrow'):''); bb.disabled=!valid(st.step); bb.className='btn '+(st.step===4?'btn-buy':'btn-ink');} }
  }
  function go(n,focus){ st.step=n; $$('[data-cfg] .panel-step').forEach(p=>p.classList.toggle('on',+p.dataset.step===n));
    $$('#lenses [data-stepdot]').forEach(d=>{const i=+d.dataset.stepdot; d.classList.toggle('done',i<n); d.classList.toggle('on',i===n); d.setAttribute('aria-current',i===n?'step':'false');});
    if(n===4)review(); sum();
    if(focus){ const h=$(`[data-step="${n}"] h3`); h.setAttribute('tabindex','-1'); h.focus({preventScroll:true}); $('#lenses').scrollIntoView({behavior:'smooth'}); } }
  function next(){ if(!valid(st.step))return; let n=st.step+1; if(st.step===2&&st.lens==='frame')n=4; go(n,true); }
  function back(){ let n=st.step-1; if(st.step===4&&st.lens==='frame')n=2; go(Math.max(1,n),true); }
  function review(){ const co=Object.keys(st.co); const CN={blue:'Blue-light filter',photo:'Photochromic',tint:'Sun tint'};
    const add=$('[name="od_add"]').value; const rxTxt=st.lens==='frame'||st.lens==='nonrx'?'Not needed':(RXN[st.rx]||'—')+(st.rx==='type'&&add!=='—'?` · ADD ${add}`:'');
    const rows=[['Frame',`${f.name} · ${COLN[st.col]} · ${st.fit} fit`,fmt(st.frame)],['Prescription',rxTxt,''],['Lenses',LN[st.lens],fmt(st.lensP)]];
    if(st.lens!=='frame'){rows.push(['Thickness','Index '+st.th,st.thP?fmt(st.thP):'Included']); rows.push(['Coatings',co.length?co.map(k=>CN[k]).join(', '):'None',co.length?fmt(co.reduce((a,k)=>a+st.co[k],0)):'—']);}
    $('[data-review]').innerHTML=rows.map(r=>`<div class="rv-row"><span class="small muted k">${r[0]}</span><span class="small v">${r[1]}</span><b class="small">${r[2]}</b></div>`).join('')+`<div class="row between" style="padding-top:14px"><b>Total incl. VAT <span class="ex">Example</span></b><span class="serif" style="font-size:28px">${fmt(total())}</span></div>`+(st.lens==='prog'?`<div class="note wa" style="margin-top:12px">${ico('wa')}<span class="xs">An optometrist will contact you on WhatsApp to confirm progressive measurements before we make your lenses.</span></div>`:''); }
  radioGroup($('[data-radio="rx"]'),v=>{st.rx=v; $('[data-reveal-for="type"]').classList.toggle('hide',v!=='type'); sum();});
  radioGroup($('[data-radio="lens"]'),(v,o)=>{st.lens=v; st.lensP=+o.dataset.price; sum();});
  radioGroup($('[data-radio="th"]'),(v,o)=>{st.th=v; st.thP=+o.dataset.price; sum();});
  radioGroup($('[data-check="co"]'));
  $('[data-check="co"]').addEventListener('change',()=>{ st.co={}; $$('[data-check="co"] input:checked').forEach(i=>st.co[i.value]=+i.closest('.opt').dataset.price); sum(); });
  $$('[data-reveal-for] select').forEach(s=>s.addEventListener('change',sum));
  $$('[data-cfg] [data-next]').forEach(b=>b.addEventListener('click',next));
  $$('[data-cfg] [data-back]').forEach(b=>b.addEventListener('click',back));
  const addCfg=()=>{ addToCart({id:'fr-'+f.id,name:f.name,brand:'Brand name (example)',img:'',price:total(),example:true,meta:`${COLN[st.col]} · ${st.fit} fit · ${LN[st.lens]}${st.lens==='frame'?'':' '+st.th} (example)`,qty:1}); setTimeout(()=>location.href='cart.html',900); };
  $('[data-addcfg]').addEventListener('click',addCfg);
  $('[data-frameonly]').addEventListener('click',()=>{ st.rx=st.rx||'later'; pick($('[data-radio="lens"]'),'frame'); go(4,true); });
  $('[data-startcfg]').addEventListener('click',e=>{e.preventDefault(); go(st.step,true);});
  const bb=$('[data-barnext]'); if(bb)bb.addEventListener('click',()=>{ const inView=$('#lenses').getBoundingClientRect().top<innerHeight*0.6;
    if(st.step===4)return addCfg(); if(!inView||!valid(st.step)){ go(st.step,true); return; } next(); });
  addEventListener('scroll',()=>{ if(st.step===1)sum(); },{passive:true});
  go(1);
}

/* ---------- contact lens product ---------- */
const lp=$('[data-lens]');
if(lp){
  const L=window.SSO.lenses; const l=L.find(x=>x.id===qs.get('p'))||L[0];
  const toric=l.type==='Toric', care=l.type==='Care';
  $$('[data-l-name]').forEach(e=>e.textContent=l.name); $$('[data-l-brand]').forEach(e=>e.textContent=l.brand);
  $('[data-l-img]').src=A(l.img); $('[data-l-price]').textContent=fmt(l.price); $('[data-l-rep]').textContent=l.rep;
  $('[data-l-packtxt]').textContent=care?'Solutions & accessories':`${l.pack} ${l.pack===1?'lens':'lenses'} per box`;
  if(care){ $('[data-l-rxchip]').textContent='No prescription needed'; $('[data-l-rxchip]').className='tag ok'; }
  if(l.example){ $('[data-l-ex]').innerHTML='<span class="ex">Example price</span>'; $('[data-l-imglabel]').textContent='Example image'; }
  document.title=l.name+' · Sight Savers Optics (clickable mockup)';
  if(toric)lp.classList.add('is-toric');
  const q={r:1,l:1}; let mode='type';
  const boxes=()=>care?1:(mode==='type'?q.r+q.l:2);
  function upd(){ const b=boxes(); $$('[data-l-boxes]').forEach(e=>e.textContent=b); $$('[data-l-boxes-bar]').forEach(e=>e.textContent=`${b} ${care?'item':b===1?'box':'boxes'} · incl. VAT`); $$('[data-l-total]').forEach(e=>e.textContent=fmt(l.price*b)); $$('[data-qty]').forEach(el=>$('span',el).textContent=q[el.dataset.qty]); }
  $$('[data-qty] button').forEach(b=>{ const k=b.closest('[data-qty]').dataset.qty; b.setAttribute('aria-label',(b.dataset.d==='1'?'More':'Fewer')+' boxes, '+(k==='r'?'right':'left')+' eye'); b.addEventListener('click',()=>{q[k]=Math.max(0,Math.min(12,q[k]+ +b.dataset.d)); upd();}); });
  radioGroup($('[data-radio="lrx"]'),v=>{mode=v; ['type','upload','later'].forEach(k=>$(`[data-lrx-${k}]`).classList.toggle('hide',k!==v)); upd();});
  if(care){ $('[data-lcfg]').innerHTML='<b>No prescription needed</b><p class="small muted" style="margin-top:6px">Solutions and accessories ship without a prescription. Price and image are examples.</p>'; mode='later'; }
  const addL=()=>{
    const s=n=>($(`[name="${n}"]`)||{}).value;
    let meta=care?'Lens care · no prescription needed':`${l.rep} · ${l.pack} per box`;
    if(!care){ meta+= mode==='type'?` · R ${s('r_sph')}${toric?' / '+s('r_cyl')+' × '+s('r_ax'):''} (${q.r}) · L ${s('l_sph')}${toric?' / '+s('l_cyl')+' × '+s('l_ax'):''} (${q.l})`:(mode==='upload'?' · Rx photo uploaded':' · Rx to follow on WhatsApp'); }
    if(boxes()<1){toast('Choose at least 1 box');return;}
    addToCart({id:'cl-'+l.id,name:l.name,brand:l.brand,img:l.img,price:l.price,meta,qty:boxes(),example:!!l.example});
  };
  $('[data-addlens]').addEventListener('click',addL); const ab=$('[data-addlens-bar]'); if(ab)ab.addEventListener('click',addL);
  upd();
  const rel=$('[data-related]'); if(rel){ rel.innerHTML=L.filter(x=>x.id!==l.id&&x.type!=='Care').slice(0,4).map(x=>`<div class="pcard"><a class="pimg" href="lens.html?p=${x.id}"><img src="${A(x.img)}" alt="${x.name}" loading="lazy"></a><div class="brand">${x.brand}</div><a class="name" href="lens.html?p=${x.id}">${x.name}</a><div class="meta">${x.rep} · ${x.pack} per box</div><div class="foot"><div><div class="price">${fmt(x.price)}</div><div class="vat">incl. 5% VAT [confirm]</div></div><a class="add" href="lens.html?p=${x.id}" aria-label="Add ${x.name}: choose your power"><svg class="ico s"><use href="#i-plus"/></svg><span class="lbl">Add</span></a></div></div>`).join(''); }
}

/* ---------- booking flow ---------- */
const bk=$('[data-booking]');
if(bk){
  const st={svc:'eye',svcL:'Eye test',store:'karama',storeL:'Al Karama',addr:'7A Dubai Pyramids Building, Al Karama',day:null,dayL:'',slot:null,step:1};
  const pre=qs.get('s'); const preStore=qs.get('store');
  const STEPN={1:'Service',2:'Store',3:'Time',4:'Your details'};
  const val=k=>k===1?st.svcL:k===2?st.storeL:k===3?(st.slot?`${st.dayL}, ${st.slot}`:'—'):'';
  function sum(){ $('[data-sum-svc]').innerHTML=st.svcL; $('[data-sum-store]').textContent=st.storeL; $('[data-sum-addr]').textContent=st.addr;
    $('[data-sum-time]').textContent=st.slot?`${st.dayL}, ${st.slot}`:'Not chosen yet';
    $('[data-wa-preview]').innerHTML=`Hello Sight Savers Optics, I’d like to book an <b>${st.svcL}</b> at <b>${st.storeL}</b>${st.slot?` on <b>${st.dayL} at ${st.slot}</b>`:''}.`;
    $$('.pin').forEach(p=>p.classList.toggle('on',p.dataset.pin===st.store));
    const bs=$('[data-bar-svc]'); if(bs){ bs.innerHTML=st.svcL; $('[data-bar-line]').textContent=`${st.storeL} · ${st.slot?st.dayL.split(' ').slice(0,2).join(' ')+', '+st.slot:'time not chosen'}`;
      const bn=$('[data-bar-next]'); bn.className='btn '+(st.step===4?'btn-book':'btn-ink'); bn.innerHTML=st.step===4?'Request':'Continue '+ico('arrow'); $('[data-bookbar]').classList.toggle('hide',st.step===5); }
    const dl=$('[data-done-list]'); dl.innerHTML=[1,2,3].filter(k=>k<st.step&&st.step<5).map(k=>`<div class="done-chip"><span class="ck">${ico('check')}</span><span class="txt"><span class="muted">${STEPN[k]}:</span> <b>${val(k)}</b></span><button class="btn sm btn-o" data-goto="${k}" aria-label="Change ${STEPN[k]}">Change</button></div>`).join('');
  }
  function go(n,focus){ st.step=n; $$('[data-booking] .panel-step').forEach(p=>p.classList.toggle('on',+p.dataset.step===n));
    $('[data-book-flow]').classList.toggle('hide',n===5);
    $$('[data-stepdot]').forEach(d=>{const i=+d.dataset.stepdot; d.classList.toggle('done',i<n&&n<6); d.classList.toggle('on',i===n); d.setAttribute('aria-current',i===n?'step':'false'); if(i<n&&n<5){d.setAttribute('role','button');d.tabIndex=0;d.setAttribute('aria-label','Change '+STEPN[i]);} else {d.removeAttribute('role');d.removeAttribute('tabindex');d.removeAttribute('aria-label');}});
    sum();
    const top=$('[data-booking]').getBoundingClientRect().top+scrollY-150; if(scrollY>top)scrollTo({top,behavior:'smooth'});
    if(focus){ const h=$(`[data-step="${n}"] h2`); if(h){h.setAttribute('tabindex','-1'); h.focus({preventScroll:true});} } }
  function next(){ if(st.step===3&&!st.slot){toast('Pick a day and a time first'); $('.day:not(.dis)').focus(); return;} if(st.step===4){ $('[data-details]').requestSubmit(); return; } go(st.step+1,true); }
  radioGroup($('[data-radio="svc"]'),(v,o)=>{st.svc=v; st.svcL=$('.t',o).innerHTML; sum();});
  radioGroup($('[data-radio="store"]'),(v,o)=>{st.store=v; st.storeL=o.dataset.label; st.addr=o.dataset.addr; sum();});
  $$('.pin').forEach(p=>p.addEventListener('click',()=>pick($('[data-radio="store"]'),p.dataset.pin)));
  if(pre)pick($('[data-radio="svc"]'),pre); if(preStore)pick($('[data-radio="store"]'),preStore);
  const days=$('[data-days]'), now=new Date(); const DN=['SUN','MON','TUE','WED','THU','FRI','SAT'], MN=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const FULL=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  let html=''; for(let i=1;i<=7;i++){const d=new Date(now); d.setDate(now.getDate()+i); const lab=`${FULL[d.getDay()]} ${d.getDate()} ${MN[d.getMonth()]}`; html+=`<button class="day" data-day="${lab}" aria-pressed="false" aria-label="${lab}"><div class="dn">${DN[d.getDay()]}</div><b>${d.getDate()}</b></button>`;}
  days.innerHTML=html; const d1=new Date(now); d1.setDate(now.getDate()+1); $('[data-month]').textContent=MN[d1.getMonth()]+' '+d1.getFullYear();
  const AM=['10:00','10:30','11:00','11:30','12:00','12:30'], PM=['16:00','16:30','17:00','18:00','19:00','20:00'];
  function slots(seed){ const dis=i=>((i*7+seed*3)%5===0); const b=(t,i)=>`<button class="slot${dis(i)?' dis':''}" data-slot="${t}" aria-pressed="false"${dis(i)?' disabled aria-label="'+t+', taken (example)"':''}>${t}</button>`; $('[data-slots-am]').innerHTML=AM.map((t,i)=>b(t,i)).join(''); $('[data-slots-pm]').innerHTML=PM.map((t,i)=>b(t,i+6)).join(''); }
  slots(1);
  days.addEventListener('click',e=>{const b=e.target.closest('.day'); if(!b)return; $$('.day').forEach(x=>{x.classList.remove('on');x.setAttribute('aria-pressed','false');}); b.classList.add('on'); b.setAttribute('aria-pressed','true'); st.day=b.dataset.day; st.dayL=b.dataset.day; st.slot=null; slots([...days.children].indexOf(b)+1); sum();});
  bk.addEventListener('click',e=>{ const s=e.target.closest('.slot'); if(s){ if(!st.day){ $('.day').click(); } $$('.slot').forEach(x=>{x.classList.remove('on');x.setAttribute('aria-pressed','false');}); const s2=$(`.slot[data-slot="${s.dataset.slot}"]`); s2.classList.add('on'); s2.setAttribute('aria-pressed','true'); st.slot=s.dataset.slot; sum(); return; }
    const g=e.target.closest('[data-goto]'); if(g){ go(+g.dataset.goto,true); } });
  $$('[data-stepdot]').forEach(d=>{ const f=()=>{ const i=+d.dataset.stepdot; if(i<st.step&&st.step<5)go(i,true); }; d.addEventListener('click',f); d.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f();}}); });
  $$('[data-booking] [data-next]').forEach(b=>b.addEventListener('click',next));
  $$('[data-booking] [data-back]').forEach(b=>b.addEventListener('click',()=>go(Math.max(1,st.step-1),true)));
  $$('[data-wa-book]').forEach(b=>b.addEventListener('click',()=>waModal($('[data-wa-preview]').innerHTML)));
  const rq=$('[data-request]'); if(rq)rq.addEventListener('click',()=>{ if(!st.slot){ go(3,true); toast('Pick a day and a time first'); return; } if(st.step<4){ go(4,true); return; } $('[data-details]').requestSubmit(); });
  const bn=$('[data-bar-next]'); if(bn)bn.addEventListener('click',next);
  const form=$('[data-details]');
  form.addEventListener('submit',e=>{ e.preventDefault();
    const name=form.name.value.trim(), mob=form.mobile.value.replace(/[\s-]/g,''), em=form.email.value.trim();
    const okName=name.length>1, okMob=/^0?5\d{8}$/.test(mob), okEm=!em||/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em);
    const setErr=(field,wrap,errId,ok)=>{ (wrap||field).classList.toggle('err',!ok); field.setAttribute('aria-invalid',ok?'false':'true'); $('#'+errId).classList.toggle('show',!ok); };
    setErr(form.name,null,'e-name',okName); setErr(form.mobile,$('[data-mobwrap]'),'e-mob',okMob); setErr(form.email,null,'e-email',okEm);
    const first=!okName?form.name:!okMob?form.mobile:!okEm?form.email:null;
    if(first){ first.focus(); first.scrollIntoView({block:'center',behavior:'smooth'}); return; }
    if(!st.slot){ go(3,true); toast('Pick a day and a time first'); return; }
    const m=mob.replace(/^0/,''); const pretty=`${m.slice(0,2)} ${m.slice(2,5)} ${m.slice(5)}`;
    $('[data-c-name]').textContent=name.split(' ')[0]; $('[data-c-mob]').textContent='+971 '+pretty; $('[data-c-svc]').innerHTML=st.svcL; $('[data-c-store]').textContent=st.storeL; $('[data-c-time]').textContent=`${st.dayL}, ${st.slot}`;
    $('[data-c-ref]').textContent='SSO-EXAMPLE-'+String(Math.floor(1000+Math.random()*9000));
    go(5); scrollTo({top:0,behavior:'smooth'}); const h=$('[data-confirm] h2'); h.setAttribute('tabindex','-1'); h.focus({preventScroll:true}); });
  sum(); go(1);
}

/* ---------- placeholder page title ---------- */
const pt=$('[data-p-title]'); if(pt&&qs.get('t')){pt.textContent=qs.get('t'); document.title=qs.get('t')+' · Sight Savers Optics (clickable mockup)';}
})();
