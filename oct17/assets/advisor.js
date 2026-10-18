/* Lens advisor: rule-based scoring over window.SSO.lenses (Clear/Toric/Coloured only). */
(function(){
const root=document.querySelector('[data-qa]');if(!root)return;
const A=window.SSOapp,D=window.SSO,$=(s,e)=>(e||document).querySelector(s),$$=(s,e)=>[...(e||document).querySelectorAll(s)];
const form=$('[data-qa-form]',root),steps=$$('.qa-step',form),res=$('[data-qa-res]',root),err=$('[data-qa-err]',root),
  back=$('[data-qa-back]',root),next=$('[data-qa-next]',root),bar=$('.qa-bar',root),cnt=$('[data-qa-count]',root);
let cur=0;
const MOIST={'11441':'Made with a moisture-retaining technology (HydraLuxe) designed for comfort','11501':'Water-gradient material designed for all-day comfort',
 '11506':'Designed to hold moisture through the day','11465':'Designed with a comfort-releasing agent','11503':'Lubricating agent designed for comfort through the month'};
const BR=+(new Date().getFullYear());
// approx cost per month for both eyes (box covers: daily 30 = 1 month/eye; 2-weekly 6 = 3 months/eye; monthly 6 = 6 months/eye; coloured 2 = 1 month/pair)
function perMonth(l){if(l.type==='Coloured')return l.price;const m=l.rep==='Daily'?l.pack/30:l.rep==='2-weekly'?l.pack/2:l.pack;return l.price*2/m;}
const BAND={low:[0,150],mid:[150,300],high:[300,1e9]};
function ans(){const a={};steps.forEach(s=>{const r=$('input:checked',s);if(r)a[r.name]=r.value;});return a;}
function score(a){
  let pool=D.lenses.filter(l=>['Clear','Toric','Coloured'].includes(l.type));
  if(a.look==='colour')pool=pool.filter(l=>l.type==='Coloured');
  else if(a.look==='toric')pool=pool.filter(l=>l.type==='Toric');
  else pool=pool.filter(l=>l.type==='Clear');
  return pool.map(l=>{let s=l.pop*0.5;const why=[];const pm=perMonth(l);
    if(a.look==='toric')why.push('A toric lens, made for astigmatism (you said your prescription has a CYL value)');
    if(a.look==='colour')why.push('A coloured lens; available with or without power');
    if(a.look==='unsure')why.push('A clear spherical lens. If you do have astigmatism, an eye test will tell us');
    const daily=l.rep==='Daily';
    if(a.rep==='daily'){if(daily){s+=4;why.push('A fresh pair every day, as you prefer: no cleaning');}else s-=3;}
    if(a.rep==='monthly'){if(!daily){s+=4;why.push(`Replaced ${l.rep==='2-weekly'?'every two weeks':'monthly'}, matching your routine`);}else s-=3;}
    const comfy=MOIST[l.id];
    if((a.dry==='often'||a.dry==='some'||a.screen==='high')&&comfy){s+=a.dry==='often'?4:a.dry==='some'?2:0;s+=a.screen==='high'?2:a.screen==='mid'?1:0;
      why.push(comfy+(a.screen==='high'?', useful for long screen days':'')+' (maker’s description)');}
    if(a.dry==='often'&&daily){s+=1;why.push('Daily lenses avoid deposit build-up, which many dry-eye wearers find more comfortable');}
    const b=BAND[a.budget];
    if(b){if(pm>=b[0]&&pm<b[1]){s+=3;why.push(`About AED ${Math.round(pm)} a month for both eyes, inside your budget`);}
      else if(pm<b[0]){s+=1;why.push(`About AED ${Math.round(pm)} a month for both eyes, under your budget`);}
      else s-=Math.min(4,(pm-b[1])/50);}
    else why.push(`About AED ${Math.round(pm)} a month for both eyes`);
    return {l,s,why:why.slice(0,4),pm};}).sort((x,y)=>y.s-x.s).slice(0,3);
}
function show(i,focus){steps.forEach((s,j)=>s.hidden=j!==i);cur=i;back.disabled=i===0;next.textContent=i===steps.length-1?'See my lenses':'Next';
  bar.setAttribute('aria-valuenow',i+1);$('span',bar).style.width=((i+1)/steps.length*100)+'%';cnt.textContent=`Question ${i+1} of ${steps.length}`;err.textContent='';
  if(focus)$('h2',steps[i]).focus();}
form.addEventListener('submit',e=>{e.preventDefault();if(!$('input:checked',steps[cur])){err.textContent='Choose one option to continue.';$('input',steps[cur]).focus();return;}
  if(cur<steps.length-1)show(cur+1,true);else results();});
back.addEventListener('click',()=>{if(cur>0)show(cur-1,true);});
const card=(r)=>{const l=r.l;return `<article class="pcard qa-pick"><a class="ph" href="lens.html?p=${l.id}" tabindex="-1" aria-hidden="true"><img src="${l.img}" alt=""></a>
<span class="mono">${A.esc(l.brand)} · ${l.rep.toLowerCase()}${l.type==='Toric'?' · toric':l.type==='Coloured'?' · coloured':''}</span><h3><a href="lens.html?p=${l.id}">${A.esc(l.name)}</a></h3>
<p class="meta">${l.pack} lenses per box · AED ${l.price.toFixed(0)} per box</p><h4 class="mono qa-why">Why it fits</h4><ul class="qa-ul">${r.why.map(w=>`<li>${A.esc(w).replace('EXAMPLE','')}</li>`).join('')}</ul>
<div class="row"><b>AED ${l.price.toFixed(0)}</b><span class="qa-btns"><a class="btn btn-line btn-sm" href="lens.html?p=${l.id}">View product</a><button class="btn btn-ink btn-sm" type="button" data-qa-add="${l.id}" aria-label="Add to cart: ${A.esc(l.brand+' '+l.name)}">Add to cart</button></span></div></article>`;};
function results(){const a=ans();const picks=score(a);
  const exam=a.dry==='spec'||a.look==='unsure'||(a.look==='colour'&&false);
  const specMsg=a.dry==='spec'?`<div class="notice qa-exam">${'<span class="mono">Please see an optometrist first</span>'}<p>Blurred or painful vision even with glasses needs an eye examination before any lenses. If it is something like keratoconus, our specialist clinic fits scleral and other specialist lenses in store; these are never sold online.</p><div class="ctas"><a class="btn btn-book" href="book.html?s=eye">Book an eye test</a><a class="btn btn-line" href="keratoconus.html">About keratoconus</a></div></div>`:'';
  const unsure=a.look==='unsure'&&a.dry!=='spec'?`<div class="notice qa-exam"><span class="mono">Not sure about astigmatism?</span><p>A contact lens exam checks this and fits the right lens. Toric lenses are available if you need them.</p><div class="ctas"><a class="btn btn-book" href="book.html?s=cl">Book an eye test</a></div></div>`:'';
  steps.forEach(s=>s.hidden=true);$('.qa-nav',form).hidden=true;$('.qa-prog',root).hidden=true;
  res.innerHTML=`<div class="sh qa-rh"><div><span class="mono">Your suggestions</span><h2 class="d2" tabindex="-1" id="qa-rh">${a.dry==='spec'?'Start with an eye test.':'Lenses that suit your day.'}</h2></div></div>${specMsg}
  ${a.dry==='spec'?'<p class="muted">If your optometrist confirms soft lenses are fine, these would match your other answers:</p>':''}<div class="qa-grid">${picks.map(card).join('')}</div>${unsure}
  <p class="small muted qa-disc">Needs a valid prescription; your optometrist will confirm fit. You add your power on the product page or at checkout.</p>
  <div class="ctas"><button class="btn btn-line" type="button" data-qa-restart>Start again</button><a class="btn btn-line" href="contact-lenses.html">See all contact lenses</a></div>`;
  res.hidden=false;$('#qa-rh').focus();}
res.addEventListener('click',e=>{const ad=e.target.closest('[data-qa-add]');
  if(ad){const l=D.lenses.find(x=>x.id===ad.dataset.qaAdd);const c=A.getCart();c.push({id:l.id,name:l.name,brand:l.brand,img:l.img,price:l.price,q:2,opt:'Both eyes · 1 box each · power to add before checkout',del:'deliver'});A.setCart(c);A.added(l.name);ad.textContent='Added';return;}
  if(e.target.closest('[data-qa-restart]')){form.reset();res.hidden=true;res.innerHTML='';$('.qa-nav',form).hidden=false;$('.qa-prog',root).hidden=false;show(0,true);}});
// picking an option on a single-answer step is enough; keep explicit Next for clarity
show(0,false);
})();
