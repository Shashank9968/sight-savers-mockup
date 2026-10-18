/* Sight Savers Optics · demo checkout (checkout.html only). Demo, no payment is taken. */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const A=window.SSOapp; if(!A) return;
const aed=A.aed, esc=A.esc;
const STN={karama:'Al Karama',burjuman:'BurJuman',dip:'Dubai Investment Park'};
const cart=A.getCart();
const emptyEl=$('[data-ckt-empty]'),flowEl=$('[data-ckt-flow]');
if(!cart.length){if(emptyEl)emptyEl.hidden=false;if(flowEl)flowEl.hidden=true;return;}
if(emptyEl)emptyEl.hidden=true;

const lineQty=l=>l.eyes?l.eyes.reduce((a,e)=>a+e.q,0):(l.q||1);
const subtotal=cart.reduce((a,l)=>a+lineQty(l)*l.price,0);
const VAT_RATE=0.05;
const rxLines=cart.map((l,i)=>({l,i})).filter(x=>x.l.eyes);

const user=A.getUser();
const signedIn=!!(user&&user.signedIn);

/* ---------- step state ---------- */
let step=1;
const steps=[1,2,3,4];
function showStep(n){
  step=n;
  $$('.ckt-panel').forEach(p=>p.hidden=(+p.dataset.panel!==n));
  $$('[data-step-dot]',$('[data-ckt-steps]')).forEach(li=>{
    const k=+li.dataset.stepDot;li.classList.toggle('on',k===n);li.classList.toggle('done',k<n);
  });
  if(n===4)renderReview();
  const h=$(`.ckt-panel[data-panel="${n}"] .ckt-h`);if(h){h.setAttribute('tabindex','-1');h.focus();}
}
$$('[data-step-dot]').forEach(li=>li.addEventListener('click',()=>{const k=+li.dataset.stepDot;if(k<step||li.classList.contains('done'))showStep(k);}));

/* ---------- step 1: contact & address ---------- */
if(signedIn){
  $('#ck-name').value=user.name||'';
  $('#ck-phone').value=user.phone||'';
  $('#ck-email').value=user.email||'';
}
const addrPickWrap=$('[data-addr-pick-wrap]'),addrPick=$('[data-addr-pick]'),addrNew=$('[data-addr-new]');
const addresses=(signedIn&&user.addresses)?user.addresses:[];
function buildAddrPick(){
  if(!addresses.length){addrPickWrap.hidden=true;addrNew.open=true;return;}
  addrPickWrap.hidden=false;
  addrPick.innerHTML=addresses.map(a=>`<label class="ch"><input type="radio" name="ckaddr" value="${a.id}" ${a.default?'checked':''}><span><b>${esc(a.label)}</b><br><span class="small muted">${esc(a.line1)}, ${esc(a.city)}</span></span></label>`).join('')
    +`<label class="ch"><input type="radio" name="ckaddr" value="new"><span><b>Use a different address</b></span></label>`;
  addrNew.open=false;
  addrPick.addEventListener('change',()=>{
    const v=$('input[name=ckaddr]:checked',addrPick).value;
    addrNew.open=(v==='new');
  });
}
buildAddrPick();

function validateStep1(){
  const errs=[];const f=$('[data-err="1"]');f.textContent='';
  const mark=(el,bad)=>el&&el.classList.toggle('err',bad);
  const name=$('#ck-name').value.trim();mark($('#ck-name'),!name);if(!name)errs.push('Enter your name.');
  const phone=$('#ck-phone').value.trim();
  const telOk=/^(?:\+?971|0)?5\d{8}$/.test(phone.replace(/[\s-]/g,''));
  mark($('#ck-phone'),!telOk);if(!telOk)errs.push('Enter a UAE mobile number, e.g. 050 123 4567.');
  let usingSaved=false;
  if(addresses.length){const sel=$('input[name=ckaddr]:checked',addrPick);usingSaved=sel&&sel.value!=='new';}
  if(!usingSaved){
    const line1=$('#ck-line1').value.trim(),city=$('#ck-city').value.trim();
    mark($('#ck-line1'),!line1);mark($('#ck-city'),!city);
    if(!line1||!city)errs.push('Enter your delivery address.');
  }
  if(errs.length){f.textContent=errs[0];return false;}
  return true;
}
function getAddress(){
  if(addresses.length){const sel=$('input[name=ckaddr]:checked',addrPick);
    if(sel&&sel.value!=='new'){const a=addresses.find(x=>x.id===sel.value);return {label:a.label,name:a.name,line1:a.line1,city:a.city,phone:a.phone};}
  }
  return {label:'Delivery address',name:$('#ck-name').value.trim(),line1:$('#ck-line1').value.trim(),city:$('#ck-city').value.trim()||'Dubai',phone:$('#ck-phone').value.trim()};
}

/* ---------- step 2: delivery ---------- */
const daysWrap=$('[data-days]');
const DAY_NAMES=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function buildDays(){
  const out=[];const today=new Date();
  for(let i=0;i<7;i++){const d=new Date(today);d.setDate(today.getDate()+i);
    const iso=d.toISOString().slice(0,10);
    out.push(`<label><input class="sr" type="radio" name="ckday" value="${iso}" ${i===0?'checked':''}><span class="mono">${DAY_NAMES[d.getDay()]}</span><b>${d.getDate()}</b></label>`);}
  daysWrap.innerHTML=out.join('');
}
buildDays();
const delDeliver=$('[data-del-deliver]'),delCollect=$('[data-del-collect]');
$$('input[name=ckdel]').forEach(r=>r.addEventListener('change',()=>{
  const collect=$('input[name=ckdel]:checked').value==='collect';
  delDeliver.classList.toggle('hide',collect);delCollect.classList.toggle('hide',!collect);
}));

const rxItemsWrap=$('[data-rx-items]');
function buildRxItems(){
  if(!rxLines.length){rxItemsWrap.innerHTML='';return;}
  rxItemsWrap.innerHTML=`<p class="mono" style="margin-bottom:12px">Prescription for your lenses</p>`+rxLines.map(({l,i})=>{
    const cur=l.rx||'';
    return `<div class="ckt-rx-item"><div class="hd"><b>${esc(l.brand)} ${esc(l.name)}</b></div>
    <div class="choice c3" role="radiogroup" aria-label="Prescription method for ${esc(l.name)}">
      <label class="ch"><b><input type="radio" name="ckrx-${i}" value="upload" ${cur==='upload'?'checked':''}> Upload a photo</b>Checked before dispatch</label>
      <label class="ch"><b><input type="radio" name="ckrx-${i}" value="wa" ${cur==='wa'?'checked':''}> Send on WhatsApp</b>After you order</label>
      <label class="ch"><b><input type="radio" name="ckrx-${i}" value="store" ${cur==='store'?'checked':''}> On file with us</b>From a test at our store</label>
    </div></div>`;
  }).join('');
}
buildRxItems();

function validateStep2(){
  const f=$('[data-err="2"]');f.textContent='';
  const collect=$('input[name=ckdel]:checked').value==='collect';
  if(collect){
    if(!$('input[name=ckstore]:checked')){f.textContent='Choose a store to collect from.';return false;}
  }else{
    if(!$('input[name=ckslot]:checked')){f.textContent='Choose a delivery time window.';return false;}
  }
  for(const {i} of rxLines){if(!$(`input[name="ckrx-${i}"]:checked`)){f.textContent='Choose how we get your prescription for each lens item.';return false;}}
  return true;
}
function getDelivery(){
  const collect=$('input[name=ckdel]:checked').value==='collect';
  if(collect)return {type:'collect',store:$('input[name=ckstore]:checked').value};
  return {type:'deliver',day:$('input[name=ckday]:checked').value,slot:$('input[name=ckslot]:checked').value};
}

/* ---------- step 3: payment ---------- */
const cardForm=$('[data-card-form]'),tabbyNote=$('[data-tabby-note]');
function syncPay(){
  const v=$('input[name=ckpay]:checked').value;
  cardForm.classList.toggle('on',v==='card');
  tabbyNote.classList.toggle('on',v==='tabby');
  if(v==='tabby'){const total=subtotal*(1+VAT_RATE);const part=total/4;
    $('[data-tb-split]').innerHTML=[1,2,3,4].map(n=>`<span>Payment ${n}<b>${aed(part)}</b></span>`).join('');}
}
$$('input[name=ckpay]').forEach(r=>r.addEventListener('change',syncPay));
syncPay();
function validateStep3(){
  const f=$('[data-err="3"]');f.textContent='';
  const v=$('input[name=ckpay]:checked').value;
  if(v==='card'){
    const num=$('#ck-cnum').value.replace(/\s+/g,'');
    const exp=$('#ck-cexp').value.trim();
    const cvc=$('#ck-ccvc').value.trim();
    const mark=(el,bad)=>el.classList.toggle('err',bad);
    const numOk=/^\d{15,16}$/.test(num);mark($('#ck-cnum'),!numOk);
    const expM=exp.match(/^(\d{2})\/(\d{2})$/);
    let expOk=false;
    if(expM){const mm=+expM[1],yy=2000+ +expM[2];if(mm>=1&&mm<=12){const now=new Date();const expDate=new Date(yy,mm,0);expOk=expDate>=new Date(now.getFullYear(),now.getMonth(),1);}}
    mark($('#ck-cexp'),!expOk);
    const cvcOk=/^\d{3,4}$/.test(cvc);mark($('#ck-ccvc'),!cvcOk);
    const nameOk=$('#ck-cname').value.trim().length>0;mark($('#ck-cname'),!nameOk);
    if(!numOk||!expOk||!cvcOk||!nameOk){f.textContent='Check your card details (number, expiry, CVC and name).';return false;}
  }
  return true;
}
function getPayment(){
  const v=$('input[name=ckpay]:checked').value;
  const label={apple:'Apple Pay',card:'Card ending '+($('#ck-cnum').value.replace(/\s+/g,'').slice(-4)||'4242')+'',tabby:'Tabby · pay in 4',cod:'Cash on delivery'}[v];
  return {method:v,label};
}

/* ---------- step 4: review ---------- */
function renderReview(){
  $('[data-rev-items]').innerHTML=cart.map(l=>{
    const q=lineQty(l);
    return `<li class="ord-item"><img src="${l.img}" alt=""><div class="nm"><b>${esc(l.name)}</b><span>${esc(l.brand)} &middot; qty ${q}</span></div><b>${aed(q*l.price)}</b></li>`;
  }).join('');
  const addr=getAddress();
  $('[data-rev-address]').textContent=`${addr.name}, ${addr.phone||$('#ck-phone').value.trim()} — ${addr.line1||''} ${addr.city||''}`.trim();
  const del=getDelivery();
  $('[data-rev-delivery]').textContent=del.type==='collect'?('Click & collect at '+(STN[del.store]||del.store)+' (time confirmed by our team)'):('Delivery on '+del.day+', '+del.slot);
  $('[data-rev-payment]').textContent=getPayment().label;
  updSummary();
}
function updSummary(){
  const del=(($('input[name=ckdel]:checked')||{}).value)||'deliver';
  const delFee=0; // example: fee is "to be confirmed", shown as AED 0 (example) in the summary
  const vat=subtotal*VAT_RATE;
  $('[data-ckt-sub]').textContent=aed(subtotal);
  $('[data-ckt-delfee]').textContent=del==='collect'?'Confirmed by our team':'Confirmed by our team';
  $('[data-ckt-vat]').textContent=aed(vat);
  $('[data-ckt-total]').textContent=aed(subtotal+vat+delFee);
}
updSummary();

/* ---------- nav buttons ---------- */
$$('[data-next]').forEach(b=>b.addEventListener('click',()=>{
  const n=+b.dataset.next;
  if(n===1&&!validateStep1())return;
  if(n===2&&!validateStep2())return;
  if(n===3&&!validateStep3())return;
  showStep(n+1);
}));
$$('[data-back]').forEach(b=>b.addEventListener('click',()=>showStep(+b.dataset.back-1)));
$$('[data-edit-step]').forEach(b=>b.addEventListener('click',()=>showStep(+b.dataset.editStep)));

/* ---------- place order ---------- */
const form=$('#cktf');
form.addEventListener('submit',e=>{
  e.preventDefault();
  if(!validateStep1()||!validateStep2()||!validateStep3()){$('[data-err="4"]').textContent='Please check the earlier steps.';return;}
  const addr=getAddress(),del=getDelivery(),pay=getPayment();
  const vat=subtotal*VAT_RATE,total=subtotal+vat;
  const orderId='SSO-'+String(Math.floor(10000+Math.random()*89999));
  const order={
    id:orderId,date:new Date().toISOString().slice(0,10),status:'Processing',
    items:JSON.parse(JSON.stringify(cart)),
    address:addr,
    delivery:del,
    payment:pay.label,
    subtotal:subtotal,vat:vat,total:total
  };
  const orders=(window.SSOorders?window.SSOorders.getOrders():(()=>{try{return JSON.parse(localStorage.getItem('ss_orders'))||[]}catch(e){return []}})());
  orders.unshift(order);
  if(window.SSOorders)window.SSOorders.setOrders(orders);
  else try{localStorage.setItem('ss_orders',JSON.stringify(orders))}catch(e){}
  A.setCart([]);
  try{sessionStorage.setItem('ss_last_order',orderId)}catch(e){}
  location.href='order-confirmation.html?order='+encodeURIComponent(orderId);
});

showStep(1);
})();
