/* Sight Savers Optics · demo account page (account.html only). Example data, nothing is sent anywhere. */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const A=window.SSOapp; if(!A) return;
const aed=A.aed, esc=A.esc, AR=A.AR;

/* ---------- seed demo data (first visit only) ---------- */
const todayISO=()=>new Date().toISOString().slice(0,10);
const addDays=(iso,n)=>{const d=new Date(iso+'T12:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};

const SEED_USER={
  signedIn:false,
  name:'Sara Ahmed',
  email:'sara.ahmed@example.com',
  initials:'SA',
  phone:'+971 50 000 0000',
  addresses:[
    {id:'addr-1',label:'Home',name:'Sara Ahmed',phone:'+971 50 000 0000',line1:'Villa 12, Street 4b, Al Barsha 1',city:'Dubai',emirate:'Dubai',default:true},
    {id:'addr-2',label:'Office',name:'Sara Ahmed',phone:'+971 50 000 0000',line1:'Office 304, Building 9, Dubai Internet City',city:'Dubai',emirate:'Dubai',default:false}
  ],
  rx:{
    contact:{expiry:addDays(todayISO(),150),OD:{SPH:'-2.00',CYL:'',AXIS:'',ADD:'',BC:'8.6',DIA:'14.2'},OS:{SPH:'-1.75',CYL:'',AXIS:'',ADD:'',BC:'8.6',DIA:'14.2'}},
    glasses:{expiry:addDays(todayISO(),150),PD:'62',OD:{SPH:'-2.25',CYL:'-0.50',AXIS:'180',ADD:''},OS:{SPH:'-2.00',CYL:'-0.75',AXIS:'170',ADD:''}}
  },
  subscription:{product:'Acuvue Oasys 1-Day with HydraLuxe',frequencyMonths:2,nextDelivery:addDays(todayISO(),18),status:'active'}
};

function seedOrders(){
  const d1=addDays(todayISO(),-6),d2=addDays(todayISO(),-34),d3=addDays(todayISO(),-71);
  return [
    {id:'SSO-10418',date:d1,status:'Out for delivery',
      items:[{id:'11441',name:'Oasys 1-Day with HydraLuxe',brand:'Acuvue',img:'assets/img/products/11441-0.jpg',price:218.5,eyes:[{eye:'B',p:'-2.00',cyl:'',ax:'',q:4}],rx:'store',rxStore:'karama',del:'deliver',plan:'Subscribe & save'}],
      address:{label:'Home',name:'Sara Ahmed',line1:'Villa 12, Street 4b, Al Barsha 1',city:'Dubai',phone:'+971 50 000 0000'},
      payment:'Card ending 4242',subtotal:874,vat:43.7,total:917.7},
    {id:'SSO-10299',date:d2,status:'Delivered',
      items:[{id:'solution-1',name:'Multi-purpose lens solution',brand:'Lens care',img:'assets/img/products/solution-1-0.jpg',price:45,q:2,del:'deliver'},
             {id:'drops-1',name:'Lubricating eye drops',brand:'Lens care',img:'assets/img/products/drops-1-0.jpg',price:35,q:1,del:'deliver'}],
      address:{label:'Home',name:'Sara Ahmed',line1:'Villa 12, Street 4b, Al Barsha 1',city:'Dubai',phone:'+971 50 000 0000'},
      payment:'Cash on delivery',subtotal:125,vat:6.25,total:131.25},
    {id:'SSO-10172',date:d3,status:'Delivered',
      items:[{id:'atelier-round',name:'Atelier round',brand:'Tom Ford',img:'assets/img/frames/atelier-round-tortoise.svg',price:1290,q:1,del:'collect',store:'burjuman',frame:true,opt:'Havana tortoise · size M · lenses added in store'}],
      address:{label:'Office',name:'Sara Ahmed',line1:'Office 304, Building 9, Dubai Internet City',city:'Dubai',phone:'+971 50 000 0000'},
      payment:'Tabby · pay in 4',subtotal:1290,vat:64.5,total:1354.5}
  ];
}
function ensureSeed(){
  if(!A.getUser())A.setUser(JSON.parse(JSON.stringify(SEED_USER)));
  try{if(localStorage.getItem('ss_orders')===null)localStorage.setItem('ss_orders',JSON.stringify(seedOrders()));}catch(e){}
}
ensureSeed();
const getOrders=()=>{try{return JSON.parse(localStorage.getItem('ss_orders'))||[]}catch(e){return []}};
const setOrders=o=>{try{localStorage.setItem('ss_orders',JSON.stringify(o))}catch(e){}};
window.SSOorders={getOrders,setOrders};

/* ---------- sign-in ---------- */
const signinSec=$('[data-acct-signin]'),dashSec=$('[data-acct-dash]');
function doSignIn(email){
  const u=A.getUser()||JSON.parse(JSON.stringify(SEED_USER));
  u.signedIn=true;if(email)u.email=email;
  A.setUser(u);render();
}
const signinf=$('#signinf');
if(signinf)signinf.addEventListener('submit',e=>{e.preventDefault();doSignIn($('#si-email').value.trim()||undefined);});
const demoBtn=$('[data-demo-signin]');
if(demoBtn)demoBtn.addEventListener('click',()=>doSignIn());
const signoutBtn=$('[data-signout]');
if(signoutBtn)signoutBtn.addEventListener('click',()=>{const u=A.getUser();if(u){u.signedIn=false;A.setUser(u);}render();});

/* ---------- render: top-level ---------- */
function render(){
  const u=A.getUser();
  const signedIn=!!(u&&u.signedIn);
  if(signinSec)signinSec.hidden=signedIn;
  if(dashSec)dashSec.hidden=!signedIn;
  if(!signedIn)return;
  $('[data-who-name]')&&($('[data-who-name]').textContent=u.name);
  $('[data-who-email]')&&($('[data-who-email]').textContent=u.email||u.phone||'');
  renderRx(u);renderAddr(u);renderOrders();renderSub(u);
}

/* ---------- prescription ---------- */
function rxRow(label,obj,fields,prefix){
  return `<tr><th>${label}</th>${fields.map(f=>`<td data-l="${f}"><label class="sr" for="${prefix}-${f}">${label} ${f}</label><input id="${prefix}-${f}" data-f="${f}" value="${esc(obj[f]||'')}" inputmode="decimal"></td>`).join('')}</tr>`;
}
function renderRx(u){
  const panel=$('[data-rx-panel]');if(!panel)return;
  const c=u.rx.contact,g=u.rx.glasses;
  panel.innerHTML=`<div class="rx-grid">
    <div class="rx-card">
      <div class="rx-top"><h3>Contact lens prescription</h3><span class="mono">Expires ${esc(c.expiry)}</span></div>
      <form data-rx-form="contact">
        <table class="rx-tbl"><thead><tr><th scope="col"></th><th scope="col">SPH</th><th scope="col">CYL</th><th scope="col">AXIS</th><th scope="col">ADD</th><th scope="col">BC</th><th scope="col">DIA</th></tr></thead>
        <tbody>${rxRow('OD · Right',c.OD,['SPH','CYL','AXIS','ADD','BC','DIA'],'c-od')}${rxRow('OS · Left',c.OS,['SPH','CYL','AXIS','ADD','BC','DIA'],'c-os')}</tbody></table>
        <div class="fld"><label class="mono" for="c-expiry">Expiry date</label><input class="in" type="date" id="c-expiry" value="${esc(c.expiry)}"></div>
        <div class="rx-foot"><button class="btn btn-ink btn-sm" type="submit">Save prescription</button><span class="small muted" data-saved-c hidden>Saved.</span></div>
      </form>
      <div class="rx-cta"><p>We&rsquo;ll suggest a check-up before your prescription expiry date.</p><a class="btn btn-book btn-sm" href="book.html?s=cl">Book an eye test</a></div>
    </div>
    <div class="rx-card">
      <div class="rx-top"><h3>Glasses prescription</h3><span class="mono">Expires ${esc(g.expiry)}</span></div>
      <form data-rx-form="glasses">
        <table class="rx-tbl"><thead><tr><th scope="col"></th><th scope="col">SPH</th><th scope="col">CYL</th><th scope="col">AXIS</th><th scope="col">ADD</th></tr></thead>
        <tbody>${rxRow('OD · Right',g.OD,['SPH','CYL','AXIS','ADD'],'g-od')}${rxRow('OS · Left',g.OS,['SPH','CYL','AXIS','ADD'],'g-os')}</tbody></table>
        <div class="fld" style="display:inline-block;margin-inline-end:14px"><label class="mono" for="g-pd">PD (pupillary distance)</label><input class="in" id="g-pd" value="${esc(g.PD)}" inputmode="decimal" style="max-width:120px"></div>
        <div class="fld"><label class="mono" for="g-expiry">Expiry date</label><input class="in" type="date" id="g-expiry" value="${esc(g.expiry)}"></div>
        <div class="rx-foot"><button class="btn btn-ink btn-sm" type="submit">Save prescription</button><span class="small muted" data-saved-g hidden>Saved.</span></div>
      </form>
      <div class="rx-cta"><p>Renew your glasses prescription with a comprehensive eye test in store.</p><a class="btn btn-book btn-sm" href="book.html?s=eye">Book an eye test</a></div>
    </div>
  </div>`;
  $('[data-rx-form="contact"]',panel).addEventListener('submit',e=>{
    e.preventDefault();const u2=A.getUser();const f=e.target;
    ['SPH','CYL','AXIS','ADD','BC','DIA'].forEach(k=>{u2.rx.contact.OD[k]=$(`#c-od-${k}`,f).value;u2.rx.contact.OS[k]=$(`#c-os-${k}`,f).value;});
    u2.rx.contact.expiry=$('#c-expiry',f).value||u2.rx.contact.expiry;
    A.setUser(u2);const s=$('[data-saved-c]',f);s.hidden=false;setTimeout(()=>s.hidden=true,2400);
  });
  $('[data-rx-form="glasses"]',panel).addEventListener('submit',e=>{
    e.preventDefault();const u2=A.getUser();const f=e.target;
    ['SPH','CYL','AXIS','ADD'].forEach(k=>{u2.rx.glasses.OD[k]=$(`#g-od-${k}`,f).value;u2.rx.glasses.OS[k]=$(`#g-os-${k}`,f).value;});
    u2.rx.glasses.PD=$('#g-pd',f).value;u2.rx.glasses.expiry=$('#g-expiry',f).value||u2.rx.glasses.expiry;
    A.setUser(u2);const s=$('[data-saved-g]',f);s.hidden=false;setTimeout(()=>s.hidden=true,2400);
  });
}

/* ---------- addresses ---------- */
function addrFormHTML(a){
  a=a||{id:'',label:'',name:'',phone:'',line1:'',city:'Dubai',emirate:'Dubai'};
  return `<div class="fld"><label for="af-label-${a.id||'new'}">Label</label><input id="af-label-${a.id||'new'}" data-k="label" value="${esc(a.label)}" placeholder="Home, Office…"></div>
  <div class="fld"><label for="af-name-${a.id||'new'}">Full name</label><input id="af-name-${a.id||'new'}" data-k="name" value="${esc(a.name)}"></div>
  <div class="fld"><label for="af-phone-${a.id||'new'}">Phone</label><input id="af-phone-${a.id||'new'}" data-k="phone" value="${esc(a.phone)}"></div>
  <div class="fld"><label for="af-city-${a.id||'new'}">City / emirate</label><input id="af-city-${a.id||'new'}" data-k="city" value="${esc(a.city)}"></div>
  <div class="fld w2"><label for="af-line1-${a.id||'new'}">Address</label><input id="af-line1-${a.id||'new'}" data-k="line1" value="${esc(a.line1)}"></div>
  <div class="frm-acts"><button class="btn btn-ink btn-sm" type="submit">Save address</button><button class="lnk" type="button" data-cancel-form>Cancel</button></div>`;
}
function renderAddr(u){
  const panel=$('[data-addr-panel]');if(!panel)return;
  const list=u.addresses||[];
  panel.innerHTML=`<div class="addr-grid">${list.map(a=>`
    <div class="addr-card" data-addr-card="${a.id}">
      <div class="addr-top"><b>${esc(a.label)}</b><label class="addr-default"><input type="radio" name="defAddr" value="${a.id}" ${a.default?'checked':''}> Default</label></div>
      <p>${esc(a.name)}<br>${esc(a.line1)}<br>${esc(a.city)}<br>${esc(a.phone)}</p>
      <div class="addr-acts"><button class="lnk" type="button" data-edit-addr="${a.id}">Edit</button><button class="lnk" type="button" data-del-addr="${a.id}">Remove</button></div>
      <form class="addr-form hide" data-addr-form="${a.id}">${addrFormHTML(a)}</form>
    </div>`).join('')}
    <div class="addr-card addr-add"><button class="btn btn-line btn-block" type="button" data-add-addr>+ Add a new address</button><form class="addr-form hide" data-addr-form="new">${addrFormHTML(null)}</form></div>
  </div>`;

  panel.addEventListener('click',e=>{
    const edit=e.target.closest('[data-edit-addr]');
    if(edit){const f=$(`[data-addr-form="${edit.dataset.editAddr}"]`,panel);f.classList.toggle('hide');return;}
    const add=e.target.closest('[data-add-addr]');
    if(add){const f=$('[data-addr-form="new"]',panel);f.classList.toggle('hide');return;}
    const cancel=e.target.closest('[data-cancel-form]');
    if(cancel){cancel.closest('.addr-form').classList.add('hide');return;}
    const del=e.target.closest('[data-del-addr]');
    if(del){const u2=A.getUser();u2.addresses=u2.addresses.filter(a=>a.id!==del.dataset.delAddr);
      if(u2.addresses.length&&!u2.addresses.some(a=>a.default))u2.addresses[0].default=true;
      A.setUser(u2);renderAddr(u2);return;}
  });
  panel.addEventListener('change',e=>{
    if(e.target.name==='defAddr'){const u2=A.getUser();u2.addresses.forEach(a=>a.default=(a.id===e.target.value));A.setUser(u2);}
  });
  $$('[data-addr-form]',panel).forEach(f=>f.addEventListener('submit',e=>{
    e.preventDefault();const u2=A.getUser();const id=f.dataset.addrForm;
    const vals={};$$('[data-k]',f).forEach(i=>vals[i.dataset.k]=i.value.trim());
    if(id==='new'){vals.id='addr-'+Date.now();vals.default=!u2.addresses.length;u2.addresses.push(vals);}
    else{const a=u2.addresses.find(x=>x.id===id);Object.assign(a,vals);}
    A.setUser(u2);renderAddr(u2);
  }));
}

/* ---------- orders ---------- */
const STN={karama:'Al Karama',burjuman:'BurJuman',dip:'Dubai Investment Park'};
function lineQty(l){return l.eyes?l.eyes.reduce((a,e)=>a+e.q,0):(l.q||1)}
function orderItemRow(it){
  const q=lineQty(it);
  return `<li class="ord-item"><img src="${it.img}" alt=""><div class="nm"><b>${esc(it.name)}</b><span>${esc(it.brand)} &middot; qty ${q}</span></div><b>${aed(q*it.price)}</b></li>`;
}
function renderOrders(){
  const panel=$('[data-orders-panel]');if(!panel)return;
  const orders=getOrders();
  if(!orders.length){panel.innerHTML='<p class="muted">No orders yet.</p>';return;}
  panel.innerHTML=`<div class="ord-list">${orders.map(o=>`
    <div class="ord-card" data-order="${o.id}">
      <div class="ord-top"><div><b>Order ${esc(o.id)}</b><span class="mono">${esc(o.date)}</span></div><span class="status-chip">${esc(o.status)}</span></div>
      <details class="ord-detail"><summary>Order details</summary>
        <ul class="ord-items">${o.items.map(orderItemRow).join('')}</ul>
        <p class="small muted">Delivered to ${esc(o.address.label)} &middot; ${esc(o.address.line1)}<br>Payment: ${esc(o.payment)}</p>
        <p class="small muted">Subtotal ${aed(o.subtotal)} + VAT ${aed(o.vat)} = <b>${aed(o.total)}</b></p>
      </details>
      <div class="ord-bottom"><b>${aed(o.total)}</b><button class="btn btn-ink btn-sm" type="button" data-reorder="${o.id}">Reorder</button></div>
    </div>`).join('')}</div>`;
  panel.addEventListener('click',e=>{
    const b=e.target.closest('[data-reorder]');if(!b)return;
    const o=orders.find(x=>x.id===b.dataset.reorder);if(!o)return;
    const cart=A.getCart();
    o.items.forEach(it=>{const copy=JSON.parse(JSON.stringify(it));cart.push(copy);});
    A.setCart(cart);
    A.added(o.items.length>1?'Order '+o.id+' items':o.items[0].name);
    location.href='cart.html';
  });
}

/* ---------- subscription ---------- */
function renderSub(u){
  const panel=$('[data-sub-panel]');if(!panel)return;
  const s=u.subscription;
  const statusLabel={active:'Active',paused:'Paused',cancelled:'Cancelled'}[s.status]||s.status;
  panel.innerHTML=`<div class="sub-card">
    <div class="sub-top"><h3>${esc(s.product)}</h3><span class="status-chip${s.status==='active'?' on':''}">${esc(statusLabel)}</span></div>
    <p class="small muted">You can skip, pause or cancel deliveries from this page.</p>
    <div class="sub-row"><span class="mono">Next delivery</span><b data-sub-next>${s.status==='cancelled'?'&ndash;':esc(s.nextDelivery)}</b></div>
    <div class="fld"><label class="mono" for="sub-freq">Delivery frequency</label>
      <select class="sel" id="sub-freq" ${s.status==='cancelled'?'disabled':''}>
        <option value="1" ${s.frequencyMonths===1?'selected':''}>Every 1 month</option>
        <option value="2" ${s.frequencyMonths===2?'selected':''}>Every 2 months</option>
        <option value="3" ${s.frequencyMonths===3?'selected':''}>Every 3 months</option>
      </select>
    </div>
    <div class="ctas">
      <button class="btn btn-line" type="button" data-sub-skip ${s.status!=='active'?'disabled':''}>Skip next delivery</button>
      <button class="btn btn-line" type="button" data-sub-pause ${s.status!=='active'?'disabled':''}>Pause</button>
      <button class="btn btn-line" type="button" data-sub-resume ${s.status!=='paused'?'disabled':''}>Resume</button>
      <button class="btn btn-line" type="button" data-sub-cancel ${s.status==='cancelled'?'disabled':''}>Cancel subscription</button>
    </div>
  </div>`;
  const freq=$('#sub-freq',panel);
  freq.addEventListener('change',()=>{const u2=A.getUser();u2.subscription.frequencyMonths=+freq.value;A.setUser(u2);renderSub(u2);});
  panel.addEventListener('click',e=>{
    const u2=A.getUser();const sub=u2.subscription;
    if(e.target.closest('[data-sub-skip]')){sub.nextDelivery=addDays(sub.nextDelivery,sub.frequencyMonths*30);A.setUser(u2);renderSub(u2);}
    else if(e.target.closest('[data-sub-pause]')){sub.status='paused';A.setUser(u2);renderSub(u2);}
    else if(e.target.closest('[data-sub-resume]')){sub.status='active';sub.nextDelivery=addDays(todayISO(),sub.frequencyMonths*30);A.setUser(u2);renderSub(u2);}
    else if(e.target.closest('[data-sub-cancel]')){sub.status='cancelled';A.setUser(u2);renderSub(u2);}
  });
}

render();
})();
