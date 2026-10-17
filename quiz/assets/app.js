/* Sight Savers Optics · clickable mockup · P2 look. Nothing is sent anywhere. */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const AR=document.documentElement.lang==='ar';
const D=window.SSO||{lenses:[],search:[]};
const WA='971567103775';
const aed=n=>'AED '+Math.round(n).toLocaleString('en-US');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const strip=s=>String(s).replace(/<[^>]+>/g,'').replace(/&amp;/g,'&');
const Q=new URLSearchParams(location.search);
const page=(location.pathname.split('/').pop()||'index.html');

/* ---------- mockup strip + look switch ---------- */
const sw=$('[data-switch]');
if(sw){
  const V1MAP={'lens-advisor.html':'contact-lenses.html','eyewear.html':'eyeglasses.html','eye-tests.html':'book.html'};
  const tail=location.search+location.hash;
  const opts=[['p2','P2'],['v1','V1'],['b2','B2'],['c2','C2']];
  sw.innerHTML=(AR?'':'<span class="sr">Look: </span>')+opts.map(([k,l])=>{
    const href=k==='p2'?page:(k+'/'+(V1MAP[page]||page))+(k==='p2'?'':tail);
    return `<a href="${k==='p2'?page+tail:href}"${k==='p2'?' class="on" aria-current="true"':''} aria-label="${l} look"><span>${l}</span></a>`;}).join('');
}
const sx=$('[data-strip-x]');
if(sx) sx.addEventListener('click',()=>{document.documentElement.classList.add('strip-hidden');try{sessionStorage.setItem('sso-strip','0')}catch(e){};const b=$('.brand');b&&b.focus();});

/* ---------- toast ---------- */
const toastEl=$('.toast');let tt;
function toast(html){if(!toastEl)return;toastEl.innerHTML=html;toastEl.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>toastEl.classList.remove('show'),4200);}

/* ---------- modal ---------- */
const modal=$('#modal');let lastFocus=null;
function openModal(html){
  lastFocus=document.activeElement;
  $('[data-mbody]',modal).innerHTML=html;
  modal.classList.add('open');modal.setAttribute('aria-hidden','false');
  const f=$('.btns a, .btns button',modal)||$('.x',modal);f.focus();
}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');if(lastFocus&&lastFocus.focus)lastFocus.focus();}
if(modal){
  modal.addEventListener('click',e=>{if(e.target.closest('[data-mclose]'))closeModal();});
  modal.addEventListener('keydown',e=>{
    if(e.key==='Escape'){closeModal();}
    if(e.key==='Tab'){const f=$$('a[href],button:not([disabled]),input,select',modal);const a=f[0],z=f[f.length-1];
      if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}
  });
}
function waModal(msg){
  const url='https://wa.me/'+WA+'?text='+encodeURIComponent(msg);
  openModal(AR?
    `<span class="mono">واتساب</span><h2 id="mh">المحادثة عبر واتساب</h2><p>سنفتح واتساب مع هذه الرسالة:</p><p class="bubble">${esc(msg)}</p><div class="btns"><a class="btn btn-wa" href="${url}" target="_blank" rel="noopener">افتح واتساب</a><button class="btn btn-line" type="button" data-mclose>إغلاق</button></div>`:
    `<span class="mono">WhatsApp</span><h2 id="mh">Chat on WhatsApp</h2><p>We'll open WhatsApp with this message ready to send:</p><p class="bubble">${esc(msg)}</p><div class="btns"><a class="btn btn-wa" href="${url}" target="_blank" rel="noopener">Open WhatsApp</a><button class="btn btn-line" type="button" data-mclose>Close</button></div>`);
}
function mockModal(text){
  openModal(`<span class="mono">Sight Savers Optics</span><h2 id="mh">${AR?'قريباً':'Coming soon'}</h2><p>${esc(text)}</p><div class="btns"><button class="btn btn-ink" type="button" data-mclose>${AR?'حسناً':'OK'}</button></div>`);
}
document.addEventListener('click',e=>{
  const w=e.target.closest('[data-wa]');
  if(w&&!w.closest('#modal')){e.preventDefault();waModal(w.dataset.wa);return;}
  const m=e.target.closest('[data-mock]');
  if(m){e.preventDefault();mockModal(m.dataset.mock);}
});

/* ---------- drawer ---------- */
const drawer=$('#drawer'),menuBtn=$('[data-menu]');
function setDrawer(o){if(!drawer)return;drawer.classList.toggle('open',o);menuBtn&&menuBtn.setAttribute('aria-expanded',o);
  document.body.style.overflow=o?'hidden':'';if(o){$('[data-close].strip-x',drawer).focus();}else menuBtn&&menuBtn.focus();}
menuBtn&&menuBtn.addEventListener('click',()=>setDrawer(true));
drawer&&drawer.addEventListener('click',e=>{if(e.target.closest('[data-close]'))setDrawer(false);});
drawer&&drawer.addEventListener('keydown',e=>{
  if(e.key==='Escape')setDrawer(false);
  if(e.key==='Tab'){const f=$$('a[href],button',drawer).filter(x=>x.offsetParent);const a=f[0],z=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}
});

/* search: see assets/search.js */

/* ---------- cart store ---------- */
const KEY='sso-p2-cart';
const getCart=()=>{try{return JSON.parse(localStorage.getItem(KEY))||[]}catch(e){return []}};
const setCart=c=>{try{localStorage.setItem(KEY,JSON.stringify(c))}catch(e){};updCount();document.dispatchEvent(new CustomEvent('sso:cart'));};
const lineQty=l=>l.eyes?l.eyes.reduce((a,e)=>a+e.q,0):l.q;
function updCount(){const n=getCart().reduce((a,l)=>a+lineQty(l),0);$$('[data-count]').forEach(c=>{c.textContent=n||'';c.dataset.n=n;});
  $$('[data-cart-link]').forEach(a=>a.setAttribute('aria-label',(AR?'السلة':'Cart')+(n?` (${n})`:'')));}
updCount();
const added=()=>toast(AR?'أُضيفت إلى السلة · <a href="cart.html">عرض السلة</a>':'Added to cart · <a href="cart.html">View cart</a>');
function addSimple(id,q,silent){const p=D.lenses.find(l=>l.id===id);if(!p||p.type!=='Care')return false;
  const c=getCart();const ex=c.find(l=>l.id===p.id&&!l.eyes);if(ex)ex.q+=(q||1);else c.push({id:p.id,name:p.name,brand:p.brand,img:p.img,price:p.price,q:q||1,del:'deliver'});setCart(c);if(!silent)added();return true;}
document.addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(!b)return;addSimple(b.dataset.add);});
window.SSOapp={getCart,setCart,addSimple,toast,added,aed,esc,AR,lenses:D.lenses,openModal:(h)=>openModal(h)};

/* ---------- FAQ ---------- */
$$('.faq .q>button').forEach(b=>b.addEventListener('click',()=>{const o=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',!o);document.getElementById(b.getAttribute('aria-controls')).hidden=o;}));

/* ---------- contact lens filters ---------- */
const grid=$('[data-grid]');
if(grid){
  const st={t:Q.get('t')||'all',b:Q.get('b')||'all'};
  const apply=()=>{let n=0;
    $$('.lc',grid).forEach(c=>{const okT=st.t==='all'||c.dataset.t===st.t||c.dataset.r===st.t;const okB=st.b==='all'||c.dataset.b===st.b;const ok=okT&&okB;c.classList.toggle('hide',!ok);if(ok)n++;});
    $$('[data-chip]').forEach(ch=>ch.setAttribute('aria-pressed',st[ch.dataset.chip]===ch.dataset.v));
    $('[data-empty]').classList.toggle('hide',n>0);$('[data-count-line]').textContent=n+(n===1?' product':' products');
    const mf=$('[data-empty-mf]');if(mf){mf.classList.toggle('hide',st.t!=='Multifocal');$('[data-empty-gen]').classList.toggle('hide',st.t==='Multifocal');}};
  $$('[data-chip]').forEach(ch=>ch.addEventListener('click',()=>{st[ch.dataset.chip]=ch.dataset.v;apply();}));
  $$('[data-reset]').forEach(r=>r.addEventListener('click',()=>{st.t='all';st.b='all';apply();$('[data-chip]').focus();}));
  apply();
}

/* ---------- lens product page ---------- */
const pdp=$('[data-pdp]');
if(pdp){
  const p=D.lenses.find(l=>l.id===Q.get('p'))||D.lenses.find(l=>l.id===pdp.dataset.pdp);
  const care=p.type==='Care',toric=p.type==='Toric',col=p.type==='Coloured';
  try{const r=JSON.parse(localStorage.getItem('sso-p2-recent')||'[]').filter(x=>x!==p.id);r.unshift(p.id);localStorage.setItem('sso-p2-recent',JSON.stringify(r.slice(0,8)));}catch(e){}
  const pk=care?(p.pk||'Bottle · lens care'):`${p.pack} lenses · ${p.rep.toLowerCase()}${col?' · coloured':''}${toric?' · toric':''}`;
  const set=(f,v)=>$$(`[data-f="${f}"]`).forEach(x=>x.textContent=v);
  set('id',p.id);set('brand',p.brand);set('rep',p.rep.toLowerCase());set('name',p.name);set('crumb',p.brand+' '+p.name);
  set('sub',pk+(care?'.':'. Ships in sealed boxes.'));set('price',aed(p.price));set('type',p.type);set('wear',p.rep);set('pack',care?'1 bottle':p.pack+' lenses');
  const im=$('[data-f="img"]');im.src=p.img;im.alt=p.brand+' '+p.name+' box';
  document.title=p.brand+' '+p.name+' · Sight Savers Optics';
  if(p.example){$('.price-row b').insertAdjacentHTML('afterend','');}
  // related: drop the current product
  $$('[data-related] .lc').forEach(c=>{if(c.querySelector(`a[href="lens.html?p=${p.id}"]`))c.remove();});
  const form=$('#buyf');
  if(care){$$('[data-rx]',form).forEach(x=>x.classList.add('hide'));$('[data-care]',form).classList.remove('hide');$('[data-delno]').textContent='02';}
  {let n=0;$$('fieldset.blk',form).forEach(f=>{if(f.classList.contains('hide')||f.closest('.hide'))return;const m=f.querySelector('.hd .mono');if(!m)return;const d=m.querySelector('[data-delno]');if(d){d.textContent=String(++n).padStart(2,'0');return;}const t=m.textContent;if(/^\d\d ·/.test(t)){m.textContent=String(++n).padStart(2,'0')+t.slice(2);}});}
  const tbl=$('[data-tbl]');tbl.classList.toggle('toric',toric);
  const pw=[];
  if(col)pw.push(['0.00','0.00 (plano, colour only)']);
  for(let v=-0.5;v>=-6;v-=0.25)pw.push([v.toFixed(2),'−'+Math.abs(v).toFixed(2)]);
  for(let v=-6.5;v>=-10;v-=0.5)pw.push([v.toFixed(2),'−'+Math.abs(v).toFixed(2)]);
  if(!col){for(let v=0.5;v<=6;v+=0.25)pw.push(['+'+v.toFixed(2),'+'+v.toFixed(2)]);}
  $$('[data-pow]',tbl).forEach(s=>s.innerHTML='<option value="">Select power</option>'+pw.map(([v,t])=>`<option value="${v}">${t}</option>`).join(''));
  $$('[data-cyl]',tbl).forEach(s=>s.innerHTML='<option value="">CYL</option>'+['-0.75','-1.25','-1.75','-2.25'].map(v=>`<option>${v}</option>`).join(''));
  $$('[data-axis]',tbl).forEach(s=>{let o='<option value="">Axis</option>';for(let a=10;a<=180;a+=10)o+=`<option>${a}</option>`;s.innerHTML=o;});
  const rowL=$('[data-eye="L"]',tbl),lblR=$('[data-eyelbl]',tbl);
  const diff=()=>form.eyes.value==='diff';
  $$('input[name=eyes]',form).forEach(r=>r.addEventListener('change',()=>{rowL.classList.toggle('hide',!diff());lblR.textContent=diff()?'OD · Right':'Both eyes';
    qR.setAttribute('aria-label',diff()?'Boxes, right eye':'Boxes, both eyes');calc();}));
  const qR=$('[data-eye="R"] .qty',tbl);qR.setAttribute('aria-label','Boxes, both eyes');
  // qty steppers
  $$('.qty',form).forEach(q=>{q.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>{const v=q.querySelector('[data-qv]');v.textContent=Math.max(1,Math.min(20,+v.textContent+ +b.dataset.q));calc();}));});
  if(care)$('[data-care] [data-qv]').textContent='1';
  const qv=el=>+$('[data-qv]',el).textContent;
  function boxes(){if(care)return qv($('[data-care]'));const r=qv($('[data-eye="R"]'));return diff()?r+qv(rowL):r*1;}
  function calc(){
    const b=care?boxes():(diff()?boxes():qv($('[data-eye="R"]'))*2);
    const tot=b*p.price;$$('[data-total]').forEach(x=>x.textContent=aed(tot));
    let line=b+(b===1?(care?' bottle':' box'):(care?' bottles':' boxes'));
    if(!care){const lenses=b*p.pack/2;const per=p.rep==='Daily'?1:p.rep==='2-weekly'?14:30;const days=Math.round(lenses*per);
      line+=` · about ${days>=60?Math.round(days/30)+' months':days+' days'}, both eyes`;}
    $('[data-totline]').textContent=line;
    document.dispatchEvent(new CustomEvent('sso:qty'));
  }
  // same-eye mode: "boxes" means per eye -> total = 2x
  calc();
  const reveal=()=>{
    $$('[data-reveal]',form).forEach(r=>{const k=r.dataset.reveal;const on=(k==='collect'?form.del.value==='collect':form.rx&&form.rx.value===k);r.classList.toggle('hide',!on);});};
  $$('input[name=rx],input[name=del]',form).forEach(r=>r.addEventListener('change',reveal));
  const errs=k=>$(`[data-err="${k}"]`,form);
  const mark=(el,bad)=>{el.classList.toggle('err',bad);if(bad)el.setAttribute('aria-invalid','true');else el.removeAttribute('aria-invalid');};
  form.addEventListener('change',e=>{if(e.target.matches('.sel.err')&&e.target.value)mark(e.target,false);});
  form.addEventListener('submit',e=>{
    e.preventDefault();let first=null;const fail=(el,k,msg)=>{if(!first)first=el;if(k)errs(k).textContent=msg;};
    $$('.ferr',form).forEach(x=>x.textContent='');
    if(!care){
      const rows=diff()?['R','L']:['R'];
      rows.forEach(r=>{const row=$(`[data-eye="${r}"]`);const sels=[$('[data-pow]',row)].concat(toric?[$('[data-cyl]',row),$('[data-axis]',row)]:[]);
        sels.forEach(s=>{const bad=!s.value;mark(s,bad);if(bad)fail(s,'pow',toric?'Choose power, CYL and axis for each eye (from your prescription or last box).':'Choose the power for '+(diff()?'each eye':'your eyes')+' (from your prescription or last box).');});});
      if(!form.rx.value){fail($('input[name=rx]',form),'rx','Choose how we get your prescription.');}
      else if(form.rx.value==='store'&&!$('#rxstore').value){mark($('#rxstore'),true);fail($('#rxstore'),'rx','Choose the store that tested you.');}
      else if(form.rx.value==='upload'&&!$('#rxfile').files.length){fail($('#rxfile'),'rx','Choose a photo or PDF, or pick another option.');}
    }
    if(form.del.value==='collect'&&!$('#cstore').value){mark($('#cstore'),true);fail($('#cstore'),'del','Choose a store to collect from.');}
    if(first){errs('all').textContent='Please check the highlighted fields above.';if(form.dataset.extra){form.dataset.extra='';toast('Choose your lens options first, then add the bundle.');}first.focus();return;}
    const eyes=care?null:(diff()?['R','L']:['B']).map(k=>{const row=k==='L'?rowL:$('[data-eye="R"]');return {eye:k,p:$('[data-pow]',row).value,cyl:toric?$('[data-cyl]',row).value:'',ax:toric?$('[data-axis]',row).value:'',q:k==='B'?qv(row)*2:qv(row)};});
    const c=getCart();
    c.push({id:p.id,name:p.name,brand:p.brand,img:p.img,price:p.price,eyes:eyes,q:care?boxes():undefined,rx:care?'':form.rx.value,del:form.del.value,store:form.del.value==='collect'?$('#cstore').value:''});
    const extra=(form.dataset.extra||'').split(',').filter(Boolean);form.dataset.extra='';
    extra.forEach(id=>{const x=D.lenses.find(l=>l.id===id);if(!x)return;const ex=c.find(l=>l.id===id&&!l.eyes);if(ex)ex.q++;else c.push({id:x.id,name:x.name,brand:x.brand,img:x.img,price:x.price,q:1,del:form.del.value,store:form.del.value==='collect'?$('#cstore').value:''});});
    setCart(c);
    if(extra.length)toast((extra.length===1?'Added both':'Added all '+(extra.length+1))+' to cart · <a href="cart.html">View cart</a>');else added();
  });
  window.SSOpdp={p,care,form,perEye:()=>care?boxes():(diff()?Math.min(qv($('[data-eye="R"]')),qv(rowL)):qv($('[data-eye="R"]'))),
    boxes:()=>care?boxes():(diff()?boxes():qv($('[data-eye="R"]'))*2),
    setPerEye:n=>{$$('[data-qv]',tbl).forEach(v=>v.textContent=n);calc();}};
  document.dispatchEvent(new CustomEvent('sso:pdp'));
}

/* ---------- cart page ---------- */
const linesEl=$('[data-lines]');
const STN={karama:'Al Karama',burjuman:'BurJuman',dip:'Dubai Investment Park'};
function renderCart(){
  const c=getCart();
  if(!c.length){linesEl.innerHTML=`<div class="empty" style="text-align:start"><h2 class="d3">Your cart is empty.</h2><p class="muted" style="margin:10px 0 20px">We sell soft and coloured contact lenses and lens care online. Frames and specialist lenses are fitted in store.</p><div class="ctas"><a class="btn btn-ink" href="contact-lenses.html">Shop contact lenses</a><a class="btn btn-line" href="eyewear.html">Shop frames &amp; sunglasses</a></div></div>`;}
  else linesEl.innerHTML=c.map((l,i)=>{
    const q=lineQty(l);
    const eyes=l.opt?esc(l.opt):l.eyes?l.eyes.map(e=>`${e.eye==='B'?'Both eyes':e.eye==='R'?'Right (OD)':'Left (OS)'}: ${e.p}${e.cyl?' / '+e.cyl+' × '+e.ax:''} · ${e.q} box${e.q>1?'es':''}`).join('<br>'):`Qty ${l.q}`;
    const rx={upload:'Prescription: photo uploaded',wa:'Prescription: send on WhatsApp',store:'Prescription: on file at our store'}[l.rx]||'';
    const del=l.del==='collect'?'Collect from '+(STN[l.store]||'store'):'Delivery · UAE';
    return `<div class="cl-line"><div class="pl"><img src="${l.img}" alt=""></div><div><span class="mono">${esc(l.brand)}</span><h3>${esc(l.name)}</h3><p class="meta">${eyes}${rx?'<br>'+rx:''}${l.plan?'<br>'+esc(l.plan):''}<br>${del}</p></div>
    <div class="right"><b>${aed(q*l.price)}</b><button class="lnk" type="button" data-rm="${i}" aria-label="Remove ${esc(l.name)}">${'Remove'}</button></div></div>`;}).join('');
  const sub=c.reduce((a,l)=>a+lineQty(l)*l.price,0);
  $('[data-t="sub"]').textContent=aed(sub);$('[data-t="tot"]').textContent=aed(sub)+(c.some(l=>l.del!=='collect')?' + delivery':'');
}
if(linesEl){renderCart();document.addEventListener('sso:cart',renderCart);linesEl.addEventListener('click',e=>{const b=e.target.closest('[data-rm]');if(!b)return;const c=getCart();c.splice(+b.dataset.rm,1);setCart(c);renderCart();toast('Removed from cart');const h=$('h1');h.setAttribute('tabindex','-1');h.focus();});}

/* ---------- booking ---------- */
const bk=$('#bkf');
if(bk){
  const S=s=>bk.querySelector(`input[name="${s}"]:checked`);
  const txt=el=>el?strip(el.closest('label').querySelector('h3, b')?el.closest('label').querySelector('h3').innerHTML:el.value):'';
  const dayTxt=v=>{const d=new Date(v+'T12:00:00');return d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});};
  const pre=(n,v)=>{const r=v&&bk.querySelector(`input[name="${n}"][value="${v}"]`);if(r&&!r.disabled)r.checked=true;};
  pre('svc',Q.get('s'));pre('store',Q.get('store'));pre('day',Q.get('d'));
  function upd(){
    const sv=S('svc'),st=S('store'),dy=S('day'),sl=S('slot');
    const svT=sv?strip(sv.closest('label').querySelector('h3').innerHTML):'';const stT=st?strip(st.closest('label').querySelector('h3').innerHTML):'';
    $('[data-sum="svc"]').innerHTML=sv?esc(svT)+'<br><span class="small muted">'+esc((()=>{const m=sv.closest('label').querySelector('.meta').children;return m[0].firstChild.textContent+(m[0].querySelector('.ex')?'':'')+' · '+m[1].textContent;})())+'</span>':'Not chosen yet';
    $('[data-sum="store"]').textContent=st?stT:'Not chosen yet';
    $('[data-sum="time"]').innerHTML=dy?esc(dayTxt(dy.value)+(sl?', '+sl.value:' (pick a time)'))+'':'Not chosen yet';
    const msg='Hello Sight Savers Optics, I’d like to book '+(sv?'a '+svT.replace(/^./,c=>c.toLowerCase()):'an appointment')+(st?' at '+stT:'')+(dy?', preferably '+dayTxt(dy.value)+(sl?', '+sl.value:''):'')+'.';
    $('[data-wa-preview]').textContent=msg;$$('[data-wa-book]').forEach(a=>{a.dataset.wa=msg;a.href='https://wa.me/'+WA+'?text='+encodeURIComponent(msg);});
    $$('.step',bk).forEach(s=>{const k=s.dataset.step;const e=$(`[data-err="${k}"]`,s);if(e&&e.textContent){
      if((k==='svc'&&sv)||(k==='store'&&st)||(k==='time'&&dy&&sl))e.textContent='';}});
  }
  bk.addEventListener('change',upd);upd();
  const tel=$('#f-tel'),nm=$('#f-name'),em=$('#f-mail');
  const mark=(el,bad)=>{el.classList.toggle('err',bad);if(bad)el.setAttribute('aria-invalid','true');else el.removeAttribute('aria-invalid');};
  const telOk=v=>/^(?:\+?971|0)?5\d{8}$/.test(v.replace(/[\s-]/g,''));
  bk.addEventListener('submit',e=>{
    e.preventDefault();let first=null;const E=k=>$(`[data-err="${k}"]`,bk);$$('.ferr').forEach(x=>x.textContent='');
    const need=(cond,el,k,msg)=>{if(!cond){if(!first)first=el;E(k).textContent=msg;}};
    need(S('svc'),bk.querySelector('input[name=svc]'),'svc','Choose a service.');
    need(S('store'),bk.querySelector('input[name=store]'),'store','Choose a store.');
    need(S('day'),bk.querySelector('input[name=day]'),'time','Choose a day and a time.');
    if(S('day'))need(S('slot'),bk.querySelector('input[name=slot]:not(:disabled)'),'time','Choose a time.');
    const msgs=[];
    if(!nm.value.trim()){mark(nm,true);msgs.push('Enter your name.');if(!first)first=nm;}else mark(nm,false);
    if(!telOk(tel.value)){mark(tel,true);msgs.push('Enter a UAE mobile number, e.g. 050 123 4567.');if(!first)first=tel;}else mark(tel,false);
    if(em.value&&!/^\S+@\S+\.\S+$/.test(em.value)){mark(em,true);msgs.push('Check the email address, or leave it empty.');if(!first)first=em;}else mark(em,false);
    E('details').textContent=msgs.join(' ');
    if(first){$('[data-err="all"]').textContent='Please complete the highlighted steps.';first.focus();return;}
    const ref='SSO-'+String(Math.floor(1000+Math.random()*9000));
    const sv=strip(S('svc').closest('label').querySelector('h3').innerHTML),st=strip(S('store').closest('label').querySelector('h3').innerHTML);
    const when=dayTxt(S('day').value)+', '+S('slot').value;
    const cmsg='Hello Sight Savers Optics, I need to change or cancel my booking '+ref+' ('+sv+', '+st+', '+when+').';
    const cf=$('');
    cf.innerHTML=`<span class="mono">Request sent · ref ${ref}</span><h2>Thank you, ${esc(nm.value.trim().split(' ')[0])}.</h2>
      <p class="lead">We’ve received your request for <b>${esc(sv)}</b> at <b>${esc(st)}</b>, ${esc(when)}. We confirm every booking on WhatsApp.</p>
      <div class="ctas" style="margin-top:24px"><button class="btn btn-ink" type="button" data-mock="Add to calendar downloads an .ics file on the live site.">Add to calendar</button>
      <a class="btn btn-wa" href="https://wa.me/${WA}?text=${encodeURIComponent(cmsg)}" data-wa="${esc(cmsg)}">Need to change or cancel? WhatsApp us</a><a class="btn btn-line" href="index.html">Back to home</a></div>`;
    bk.classList.add('hide');cf.classList.remove('hide');$('.aside').classList.add('hide');$('.mbar')&&$('.mbar').classList.add('hide');cf.focus();window.scrollTo(0,cf.getBoundingClientRect().top+scrollY-100);
  });
}
})();
/* ---------- v2: tabs, shop listing, frames PDP, pack/subscribe pricing, cart announcements ---------- */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const A=window.SSOapp;if(!A)return;const D=window.SSO||{};const Q=new URLSearchParams(location.search);const aed=A.aed;
// cart: announce item count changes to screen readers
const live=$('[data-cart-live]');let lastN=null;
const cnt=()=>A.getCart().reduce((a,l)=>a+(l.eyes?l.eyes.reduce((x,e)=>x+e.q,0):l.q),0);
lastN=cnt();document.addEventListener('sso:cart',()=>{const n=cnt();if(live&&n!==lastN)live.textContent=(A.AR?'السلة: ':'Cart updated: ')+n+(A.AR?'':(n===1?' item':' items'));lastN=n;});
// tabs (best sellers)
$$('[data-tabs]').forEach(tl=>{const tabs=$$('[role=tab]',tl);
  const sel=t=>{tabs.forEach(x=>{const on=x===t;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;document.getElementById(x.getAttribute('aria-controls')).hidden=!on;});};
  tabs.forEach((t,i)=>{t.addEventListener('click',()=>sel(t));t.addEventListener('keydown',e=>{const d={ArrowRight:1,ArrowLeft:-1}[e.key];if(!d)return;e.preventDefault();const n=tabs[(i+d+tabs.length)%tabs.length];sel(n);n.focus();});});});
// shop listing filters
const pf=$('[data-plp]');
if(pf){const grid=$('[data-plp-grid]');const c0=Q.get('c');if(c0){const b=pf.querySelector(`input[name=c][value="${c0}"]`);if(b)b.checked=true;}
  if(matchMedia('(max-width:860px)').matches)$('[data-plp-side]').open=false;
  const vals=n=>$$(`input[name=${n}]:checked`,pf).map(x=>x.value);
  const apply=()=>{const c=vals('c'),sh=vals('shape'),rp=vals('rep'),tp=vals('type');let n=0;
    $$('.pcard',grid).forEach(el=>{const d=el.dataset;let ok=(!c.length||c.includes(d.cat))&&(!sh.length||sh.includes(d.shape))&&(!rp.length||rp.includes(d.rep))&&(!tp.length||tp.includes(d.type));
      el.classList.toggle('hide',!ok);if(ok)n++;});
    $('[data-plp-count]').textContent=n+(n===1?' product':' products');$('[data-plp-empty]').classList.toggle('hide',n>0);};
  pf.addEventListener('change',apply);pf.addEventListener('reset',()=>setTimeout(apply));
  $$('[data-plp-reset]').forEach(b=>b.addEventListener('click',e=>{if(b.type!=='reset'){pf.reset();}setTimeout(()=>{apply();pf.querySelector('input').focus();});}));apply();}
// lens PDP: pack size + subscribe & save change the price (Bite pattern). Discounts are EXAMPLE.
const bf=$('#buyf'),P=window.SSOpdp;
if(bf&&P&&!P.care){const p=P.p;const PACK={1:0,3:.05,6:.10},SUB=.05;
  const disc=n=>n>=6?PACK[6]:n>=3?PACK[3]:0;
  $$('[data-pp]',bf).forEach(x=>{const k=+x.dataset.pp;x.textContent=aed(p.price*(1-PACK[k]))+'/box';});
  const sync=()=>{const per=P.perEye();$$('input[name=packsz]',bf).forEach(r=>r.checked=+r.value===per);};
  const reprice=()=>{const b=P.boxes(),per=P.perEye();const base=b*p.price;const pd=disc(per);const sub=bf.plan&&bf.plan.value==='sub';
    const tot=base*(1-pd)*(sub?1-SUB:1);const once=base*(1-pd);
    $$('[data-total]').forEach(x=>x.textContent=aed(tot));const sv=base-tot;const s=$('[data-saving]');if(s)s.textContent=sv>0.5?'You save '+aed(sv)+'':'Save up to 10% on 6 boxes, plus 5% with Subscribe & save';
    const o=$('[data-once]');if(o)o.textContent=aed(once);const sp=$('[data-subp]');if(sp)sp.textContent=aed(once*(1-SUB));
    const btn=$('button[type=submit]',bf);if(btn&&!btn.dataset.l)btn.dataset.l=btn.innerHTML;};
  $$('input[name=packsz]',bf).forEach(r=>r.addEventListener('change',()=>{P.setPerEye(+r.value);}));
  $$('input[name=plan]',bf).forEach(r=>r.addEventListener('change',reprice));
  document.addEventListener('sso:qty',()=>{sync();reprice();});sync();reprice();
  // remember discount on the cart line
  bf.addEventListener('submit',()=>setTimeout(()=>{const c=A.getCart();const l=c[c.length-1];if(!l||l.id!==p.id||!l.eyes||l.disc!==undefined)return;
    const pd=disc(P.perEye()),sub=bf.plan.value==='sub';l.disc=1-(1-pd)*(sub?1-SUB:1);l.price=+(p.price*(1-l.disc)).toFixed(2);l.plan=sub?'Subscribe & save':'One-time';A.setCart(c);}),true);
  // coloured shade picker
  const sn=$('[data-shade-n]');if(sn){$$('[data-shade]').forEach(a=>{const on=a.dataset.shade===p.id;if(on){a.setAttribute('aria-current','true');sn.textContent=a.title;}});}
}
// frames PDP
const ff=$('#framef');
if(ff){const F=(D.frames||[]),C=D.cols||{};const f=F.find(x=>x.id===Q.get('p'))||F.find(x=>x.id===$('[data-frame]').dataset.frame);
  const set=(k,v)=>$$(`[data-ff="${k}"]`).forEach(x=>x.textContent=v);const cat=f.cat==='optical'?'Optical frame':'Sunglasses';
  set('brand',f.brand);set('name',f.name);set('cat',cat);set('cat2',cat);set('crumb',f.brand+' '+f.name);set('price',aed(f.price));set('br',f.bridge);set('tp',f.temple);
  if(f.cat==='sun')set('demo','Standard sun lenses');
  document.title=f.brand+' '+f.name+' · Sight Savers Optics';
  $('[data-sw]').innerHTML=f.cols.map((c,i)=>`<label class="sw" title="${C[c][0]}"><input class="sr" type="radio" name="col" value="${c}"${i?'':' checked'}><span style="background:${C[c][1]}" aria-hidden="true"></span><span class="sr">${C[c][0]}</span></label>`).join('');
  $('[data-sz]').innerHTML=f.sizes.map(([s,w],i)=>`<label class="chip"><input class="sr" type="radio" name="size" value="${s}"${(s==='M'||f.sizes.length===1)?' checked':''}> ${s} · ${w}</label>`).join('');
  const img=$('[data-ff="img"]'),alt=$('[data-ff="alt"]');
  const upd=()=>{const c=ff.col.value;img.src=`assets/img/frames/${f.id}-${c}.svg`;img.alt=`${f.brand} ${f.name}, ${C[c][0]}`;set('coln',C[c][0]);
    const o=f.cols.find(x=>x!==c);alt.src=`assets/img/frames/${f.id}-${o}.svg`;const sz=f.sizes.find(s=>s[0]===(ff.size&&ff.size.value))||f.sizes[0];set('lw',sz[1]);
    set('total',aed(f.price));set('addl','Add to cart · '+aed(f.price));set('line','1 frame · '+C[c][0]+' · size '+sz[0]);};
  ff.addEventListener('change',upd);upd();
  $$('[data-also] .pcard').forEach(c=>{if(c.querySelector(`a[href="frame.html?p=${f.id}"]`))c.remove();});
  if(!$$('[data-also] .pcard').length===false&&$$('[data-also] .pcard').length>3)$$('[data-also] .pcard')[3].remove();
  ff.addEventListener('submit',e=>{e.preventDefault();const c=A.getCart();const col=ff.col.value,sz=ff.size.value,ln=ff.lens.value;
    c.push({id:f.id,name:f.name,brand:f.brand,img:`assets/img/frames/${f.id}-${col}.svg`,price:f.price,q:1,del:ff.del.value,frame:true,
      opt:`${C[col][0]} · size ${sz} · ${ln==='store'?'lenses added in store':(f.cat==='sun'?'standard sun lenses':'demo lenses')}`});
    A.setCart(c);A.added();});
}
})();

/* Label table cells so rows can stack as cards on small screens */
document.querySelectorAll('table.sp-tbl').forEach(t=>{const h=[...t.querySelectorAll('thead th')].map(x=>x.textContent.trim());t.querySelectorAll('tbody tr').forEach(r=>[...r.children].forEach((c,i)=>{if(c.tagName==='TD'&&h[i])c.setAttribute('data-l',h[i]);}));});
