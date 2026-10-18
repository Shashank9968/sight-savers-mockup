/* Sight Savers Optics · order confirmation (order-confirmation.html only). Example data, demo order. */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const A=window.SSOapp; if(!A) return;
const aed=A.aed, esc=A.esc;
const Q=new URLSearchParams(location.search);
let orderId=Q.get('order');
if(!orderId){try{orderId=sessionStorage.getItem('ss_last_order')}catch(e){}}
const getOrders=()=>{try{return JSON.parse(localStorage.getItem('ss_orders'))||[]}catch(e){return []}};
const orders=getOrders();
const order=orders.find(o=>o.id===orderId)||orders[0];
const wrap=$('[data-conf-wrap]'),empty=$('[data-conf-empty]');
if(!order){if(wrap)wrap.hidden=true;if(empty)empty.hidden=false;return;}
if(empty)empty.hidden=true;

const lineQty=l=>l.eyes?l.eyes.reduce((a,e)=>a+e.q,0):(l.q||1);
$('[data-conf-id]').textContent=order.id;
$('[data-conf-date]').textContent=order.date;
$('[data-conf-items]').innerHTML=order.items.map(l=>{
  const q=lineQty(l);
  return `<li class="ord-item"><img src="${l.img}" alt=""><div class="nm"><b>${esc(l.name)}</b><span>${esc(l.brand)} &middot; qty ${q}</span></div><b>${aed(q*l.price)}</b></li>`;
}).join('');
$('[data-conf-address]').textContent=`${order.address.name} &middot; ${order.address.line1||''} ${order.address.city||''}`.replace('&middot;','·');
const del=order.delivery||{};
$('[data-conf-delivery]').textContent=del.type==='collect'?('Click & collect, example time, to be confirmed'):('Delivery '+(del.day||'')+' '+(del.slot||'')+' (example, to be confirmed)');
$('[data-conf-payment]').textContent=order.payment;
$('[data-conf-total]').textContent=aed(order.total)+' (incl. VAT, example)';
})();
