/* Sight Savers Optics · P2 · smart search: index (assets/search-index.json), fuzzy matching, header dropdown and search.html results. */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const AR=document.documentElement.lang==='ar';
const V=(document.currentScript&&(document.currentScript.src.split('v=')[1]||''))||'';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const aed=n=>'AED '+Math.round(n).toLocaleString('en-US');
const T=AR?{sug:'اقتراحات',prod:'المنتجات',brand:'الماركات',care:'الخدمات والعيادة',store:'الفروع',faq:'مساعدة',all:'عرض كل النتائج',pop:'عمليات بحث شائعة',recent:'شوهدت مؤخراً',popd:'الأكثر طلباً في دبي',none:'لا توجد نتائج مطابقة.',book:'احجز',res:'نتيجة'}
  :{sug:'Suggestions',prod:'Products',brand:'Brands',care:'Services & clinic',store:'Stores',faq:'Help',all:'See all results',pop:'Popular searches',recent:'Recently viewed',popd:'Popular in Dubai',none:'No matches.',book:'Book',res:'results'};

/* ---------- normalising + matching ---------- */
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي')
  .replace(/[^\p{L}\p{N}+]+/gu,' ').trim();
const arVar=t=>(/^ال[\u0621-\u064A]{2,}/.test(t)?[t,t.slice(2)]:[t]);
const toks=s=>{const o=[];norm(s).split(' ').filter(Boolean).forEach(t=>arVar(t).forEach(x=>o.push(x)));return o;};
const STOP=new Set(['for','the','a','an','and','of','to','in','my','me','near','with','lens','lenses','store','shop','buy','عدسات','في','من']);
const SYN={astig:['toric'],astigmatism:['toric'],cyl:['toric'],cylinder:['toric'],dailies:['daily'],daily:['dailies'],oneday:['daily'],'1day':['daily'],
  fortnightly:['weekly'],biweekly:['weekly'],color:['coloured'],colored:['coloured'],colour:['coloured'],contacts:['contact'],specs:['glasses'],spectacles:['glasses'],
  kc:['keratoconus'],shortsighted:['myopia'],nearsighted:['myopia'],amblyopia:['lazy'],orthok:['ortho'],licence:['license'],license:['licence'],drop:['drops'],
  solutions:['solution'],kids:['children'],kid:['child'],child:['children'],blurred:['blurry'],blur:['blurry'],
  'يوميه':['daily'],'شهريه':['monthly'],'ملونه':['coloured'],'نظارات':['glasses'],'محلول':['solution'],'قطره':['drops'],'كرامه':['karama'],'برجمان':['burjuman']};
const MED=['keratoconus','cornea','corneal','scleral','myopia','shortsighted','blurry','lazy','amblyopia','halos','ghosting','glare','vision','reading','magnifier','ortho',
  'قرنيه','مخروطيه','قصر','ضعف','كسل'];
// Damerau-Levenshtein (optimal string alignment) with a cut-off
function dl(a,b,lim){if(Math.abs(a.length-b.length)>lim)return lim+1;const m=a.length,n=b.length;let d=[];for(let i=0;i<=m;i++){d[i]=[i];}for(let j=0;j<=n;j++)d[0][j]=j;
  for(let i=1;i<=m;i++){let rowMin=1e9;for(let j=1;j<=n;j++){const c=a[i-1]===b[j-1]?0:1;let v=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+c);
    if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])v=Math.min(v,d[i-2][j-2]+1);d[i][j]=v;if(v<rowMin)rowMin=v;}if(rowMin>lim)return lim+1;}return d[m][n];}
function tokScore(q,list){let best=0;const lim=q.length>=8?2:(q.length>=4?1:0);
  for(const t of list){if(t===q)return 1;
    if(q.length>=2&&t.startsWith(q)){best=Math.max(best,.86-Math.min(.12,(t.length-q.length)*.01));continue;}
    if(lim){const d=Math.min(dl(q,t,lim),t.length>q.length?dl(q,t.slice(0,q.length),lim):9);if(d<=lim)best=Math.max(best,d===1?.66:.5);}}
  return best;}
const variants=q=>[[q,1]].concat((SYN[q]||[]).map(s=>[s,.92]));
let IDX=null,loading=null;
function prep(d){d._t=toks(d.title);d._b=toks(d.brand||'');d._a=toks((d.aliases||[]).join(' '));d._y=toks(d.body||'');d._n=norm(d.title);return d;}
function load(){if(IDX)return Promise.resolve(IDX);if(loading)return loading;
  loading=fetch('assets/search-index.json'+(V?'?v='+V:'')).then(r=>r.json()).then(j=>{j.docs.forEach(prep);j._s=j.suggest.map(s=>({s,_t:toks(s)}));IDX=j;return j;});return loading;}
function scoreDoc(d,qt){let total=0,matched=0,need=0;
  for(const q of qt){const stop=STOP.has(q);if(!stop)need++;let best=0;
    for(const [v,w] of variants(q)){best=Math.max(best,w*Math.max(4*tokScore(v,d._t),3*tokScore(v,d._b),2.5*tokScore(v,d._a),1*tokScore(v,d._y)));}
    if(best>0){total+=best;if(!stop)matched++;}}
  return {total,matched,need};}
function medIntent(qt){return qt.some(q=>q.length>=4&&MED.some(m=>m.startsWith(q)||(q.length>=5&&dl(q,m.slice(0,q.length),1)<=1)||m===q));}
function search(q){
  const qt=toks(q);if(!qt.length||!IDX)return {qt,res:[],med:false};
  let res=[];
  for(const d of IDX.docs){const s=scoreDoc(d,qt);if(s.total>0&&s.matched>=s.need)res.push({d,s:s.total});}
  if(!res.length){for(const d of IDX.docs){const s=scoreDoc(d,qt);if(s.matched>=1)res.push({d,s:s.total*.4});}}
  const nq=norm(q);
  res.forEach(r=>{if(r.d._n.startsWith(nq))r.s+=2;r.s*=1+.08*(r.d.pop||0);});
  const med=medIntent(qt);
  res.sort((a,b)=>(med?((b.d.type==='clinic')-(a.d.type==='clinic')):0)||b.s-a.s);
  return {qt,res,med};
}
function suggest(qt,n=3){if(!IDX||!qt.length)return [];return IDX._s.map(x=>{let ok=0,sc=0;for(const q of qt){let b=0;for(const [v,w] of variants(q))b=Math.max(b,w*tokScore(v,x._t));if(b>0){ok++;sc+=b;}}return {s:x.s,ok,sc};})
  .filter(x=>x.ok===qt.length).sort((a,b)=>b.sc-a.sc).slice(0,n).map(x=>x.s);}
window.SSOsearch={load,search,suggest,norm,dl};

/* ---------- header dropdown (combobox + listbox) ---------- */
const sp=$('#search'),sb=$('[data-search]'),qi=$('#q'),dd=$('#sdd'),st=$('[data-sstatus]');
let opts=[],act=-1,tmr;
const recs=()=>window.SSOrecs;
function opt(href,main,sub,thumb,kind,cls){return {href,html:`${thumb?`<span class="sdd-thumb"><img src="${thumb}" alt=""></span>`:''}<span class="sdd-main"><span class="sdd-t"${AR?' lang="en"':''}>${main}</span>${sub?`<span class="sdd-s">${sub}</span>`:''}</span>${kind?`<span class="sdd-k">${kind}</span>`:''}`,cls:cls||''};}
const prodOpt=d=>opt(d.url,esc(d.title),`${esc(d.brand)} · ${aed(d.price)}${d.ex?' · EXAMPLE':''}`,d.image,'','sdd-prod');
function groupsFor(q){
  const g=[];
  if(!q.trim()){
    g.push([T.pop,(IDX?IDX.popular:[]).map(s=>opt('search.html?q='+encodeURIComponent(s),esc(s),'','',''))]);
    const R=recs();if(R){const r=R.recent().slice(0,4).map(id=>R.BY[id]);if(r.length)g.push([T.recent,r.map(l=>opt('lens.html?p='+l.id,esc(l.name),`${esc(l.brand)} · ${aed(l.price)}`,l.img,'','sdd-prod'))]);
      g.push([T.popd,R.popular(3,l=>l.type!=='Care').map(l=>opt('lens.html?p='+l.id,esc(l.name),`${esc(l.brand)} · ${aed(l.price)}`,l.img,'','sdd-prod'))]);}
    return {g,total:0};
  }
  const {qt,res,med}=search(q);
  const by=t=>res.filter(r=>t.includes(r.d.type)).map(r=>r.d);
  const care=by(['clinic','service']).slice(0,3),prods=by(['product']).slice(0,4),brands=by(['brand']).slice(0,2),stores=by(['store']).slice(0,2);
  const careOpts=[];care.forEach((d,i)=>{careOpts.push(opt(d.url,esc(d.title),esc((d.body||'').split('.')[0]).slice(0,80),'',d.type==='clinic'?(AR?'العيادة':'Clinic'):'',d.type==='clinic'&&i===0&&med?'sdd-med':''));
    if(i===0&&d.cta&&(med||d.type==='clinic'))careOpts.push(opt(d.cta,(AR?'احجز تقييماً':'Book an assessment')+' →',esc(d.title),'',T.book,'sdd-cta'));});
  const nq=norm(q).trim(),s=suggest(qt).filter(x=>norm(x)!==nq);
  if(s.length)g.push([T.sug,s.map(x=>opt('search.html?q='+encodeURIComponent(x),esc(x),'','',''))]);
  if(med&&careOpts.length)g.push([T.care,careOpts]);
  if(prods.length)g.push([T.prod,prods.map(prodOpt)]);
  if(brands.length)g.push([T.brand,brands.map(d=>opt(d.url,esc(d.title),esc(d.body),'','',''))]);
  if(!med&&careOpts.length)g.push([T.care,careOpts]);
  if(stores.length){const so=[];stores.forEach((d,i)=>{so.push(opt(d.url,esc(d.title),esc(d.body).slice(0,70),'','',''));if(i===0&&d.cta&&res[0]&&res[0].d===d)so.push(opt(d.cta,(AR?'احجز هنا':'Book here')+' →',esc(d.title),'',T.book,'sdd-cta'));});g.push([T.store,so]);}
  return {g,total:res.length,res};
}
function render(){
  if(!dd)return;const q=qi.value;const {g,total}=groupsFor(q);opts=[];let html='',gi=0;
  for(const [label,list] of g){if(!list.length)continue;gi++;html+=`<div class="sdd-group" role="group" aria-labelledby="sdg-${gi}"><p class="sdd-gh mono" id="sdg-${gi}" role="presentation">${esc(label)}</p>`;
    for(const o of list){const id='sdo-'+opts.length;opts.push(o);html+=`<a class="sdd-opt ${o.cls}" role="option" id="${id}" href="${o.href}" tabindex="-1" aria-selected="false">${o.html}</a>`;}html+='</div>';}
  if(q.trim()){if(!total)html+=`<p class="sdd-none">${T.none} ${AR?'جرّب «عدسات يومية» أو اسألنا عبر واتساب.':'Try “daily lenses” or “eye test”, or ask us on WhatsApp.'}</p>`;
    const id='sdo-'+opts.length;opts.push({href:'search.html?q='+encodeURIComponent(q)});html+=`<a class="sdd-opt sdd-all" role="option" id="${id}" href="search.html?q=${encodeURIComponent(q)}" tabindex="-1" aria-selected="false">${T.all}${total?` (${total})`:''} →</a>`;}
  dd.innerHTML=html;act=-1;qi.removeAttribute('aria-activedescendant');
  const open=opts.length>0;qi.setAttribute('aria-expanded',open);dd.classList.toggle('open',open);
  clearTimeout(tmr);tmr=setTimeout(()=>{st.textContent=q.trim()?(total?`${total} ${T.res}`:T.none):'';},400);
}
function setAct(i){const els=$$('.sdd-opt',dd);if(!els.length)return;act=(i+els.length)%els.length;els.forEach((e,k)=>{e.classList.toggle('active',k===act);e.setAttribute('aria-selected',k===act);});
  qi.setAttribute('aria-activedescendant',els[act].id);els[act].scrollIntoView({block:'nearest'});}
function setSearch(o){if(!sp)return;sp.classList.toggle('open',o);sb.setAttribute('aria-expanded',o);
  if(o){qi.focus();load().then(render).catch(()=>{dd.innerHTML='<p class="sdd-none">Search index could not load.</p>';});}else{qi.setAttribute('aria-expanded','false');sb.focus();}}
if(sp&&qi){
  sb.addEventListener('click',()=>setSearch(!sp.classList.contains('open')));
  qi.addEventListener('input',()=>load().then(render));
  qi.addEventListener('focus',()=>load().then(()=>{if(!dd.innerHTML)render();}));
  qi.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){e.preventDefault();if(!dd.classList.contains('open'))render();setAct(act+1);}
    else if(e.key==='ArrowUp'){e.preventDefault();setAct(act<0?-1:act-1);}
    else if(e.key==='Enter'&&act>=0){e.preventDefault();location.href=$$('.sdd-opt',dd)[act].getAttribute('href');}
    else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(act>=0||qi.value){if(act>=0){act=-1;$$('.sdd-opt',dd).forEach(x=>{x.classList.remove('active');x.setAttribute('aria-selected','false');});qi.removeAttribute('aria-activedescendant');}else{qi.value='';render();}}else setSearch(false);}
  });
  dd.addEventListener('mousemove',e=>{const o=e.target.closest('.sdd-opt');if(o){const i=$$('.sdd-opt',dd).indexOf(o);if(i!==act)setAct(i);}});
  $('[data-search-close]').addEventListener('click',()=>setSearch(false));
  sp.addEventListener('keydown',e=>{if(e.key==='Escape')setSearch(false);});
  document.addEventListener('click',e=>{if(sp.classList.contains('open')&&!sp.contains(e.target)&&!e.target.closest('[data-search]'))setSearch(false);});
}

/* ---------- search.html results page ---------- */
const page=$('[data-search-page]');
if(page){
  const inp=$('#sq'),list=$('[data-sres]'),cnt=$('[data-scount]'),empty=$('[data-sempty]');
  const P=new URLSearchParams(location.search);inp.value=P.get('q')||'';let ft=P.get('type')||'all';
  const isCare=d=>d.type==='product'&&d.brand==='Lens care';
  const TY={product:d=>d.type==='product'&&!isCare(d),care:isCare,brand:d=>d.type==='brand',service:d=>d.type==='clinic'||d.type==='service',store:d=>d.type==='store',faq:d=>d.type==='faq'};
  const label={product:'Product',brand:'Brand',clinic:'Specialist clinic',service:'Service',store:'Store',faq:'Help'};
  function item(d,i,med){
    const top=med&&i===0&&d.type==='clinic';
    const thumb=d.image?`<a class="sres-th" href="${d.url}" tabindex="-1" aria-hidden="true"><img src="${d.image}" alt="" loading="lazy"></a>`:`<span class="sres-th sres-ic" aria-hidden="true"><svg class="ico l"><use href="#i-${{brand:'star',clinic:'eye',service:'cal',store:'pin',faq:'info'}[d.type]||'search'}"/></svg></span>`;
    let acts='';
    if(d.type==='product')acts=`<b>${aed(d.price)}${d.ex?'<span class="ex">EXAMPLE</span>':''}</b>`+(d.brand==='Lens care'?`<button class="add" type="button" data-add="${d.id}">Add</button>`:`<a class="add" href="${d.url}">Choose power</a>`);
    else if(d.cta)acts=`<a class="btn ${top?'btn-book':'btn-ink'} btn-sm" href="${d.cta}">${d.type==='store'?'Book here':'Book an assessment'}</a>`;
    else if(d.type==='service'&&/book\.html/.test(d.url))acts=`<a class="btn btn-ink btn-sm" href="${d.url}">Book</a>`;
    return `<li class="sres-item${top?' sres-med':''}">${thumb}<div class="sres-b"><span class="mono">${label[d.type]}${d.brand&&d.type==='product'?' · '+esc(d.brand):''}${top?' · in store only':''}</span><h2><a href="${d.url}">${esc(d.title)}</a></h2><p class="small muted">${esc(d.body)}</p></div><div class="sres-acts">${acts}</div></li>`;}
  function run(){
    load().then(()=>{const q=inp.value.trim();const {res,med}=search(q);
      const counts={all:res.length};Object.keys(TY).forEach(k=>counts[k]=res.filter(r=>TY[k](r.d)).length);
      $$('[data-sf]').forEach(c=>{c.setAttribute('aria-pressed',c.dataset.sf===ft);$('.n',c).textContent=counts[c.dataset.sf]||0;});
      const shown=ft==='all'?res:res.filter(r=>(TY[ft]||(()=>true))(r.d));
      list.innerHTML=shown.slice(0,40).map((r,i)=>item(r.d,i,med)).join('');
      cnt.textContent=q?`${shown.length} result${shown.length===1?'':'s'} for “${q}”`:'Type to search';
      empty.hidden=!!(q&&shown.length);
      $('[data-sempty-h]').textContent=q?`No results for “${q}”.`:'Popular searches';
      const u=new URL(location);u.searchParams.set('q',q);if(ft!=='all')u.searchParams.set('type',ft);else u.searchParams.delete('type');history.replaceState(null,'',u);
      document.title=(q?`“${q}” · `:'')+'Search · Sight Savers Optics';});}
  let t;inp.addEventListener('input',()=>{clearTimeout(t);t=setTimeout(run,150);});
  $('#sform').addEventListener('submit',e=>{e.preventDefault();run();});
  $$('[data-sf]').forEach(c=>c.addEventListener('click',()=>{ft=c.dataset.sf;run();}));
  load().then(()=>{$('[data-spop]').innerHTML=IDX.popular.map(s=>`<a class="chip" href="search.html?q=${encodeURIComponent(s)}">${esc(s)}</a>`).join('');
    const R=recs();if(R){const r=R.recent().slice(0,4).map(id=>R.BY[id]);const rv=$('[data-srecent]');if(r.length){rv.innerHTML=`<p class="mono" style="margin:28px 0 12px">Recently viewed</p>`+R.rail(r,'Recently viewed');}
      $('[data-spopd]').innerHTML=R.rail(R.popular(4,l=>l.type!=='Care'),'Popular in Dubai');}
    run();});
}
})();
