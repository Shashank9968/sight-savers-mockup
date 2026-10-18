/* Sight Savers Optics · PLP filters: faceted multi-select chips, price buckets, sort, URL sync, mobile drawer.
   Markup contract (see shop.html/contact-lenses.html/coloured.html/eyewear.html):
   <div class="pf" data-pf data-pf-grid="#id">
     <div class="pf-bar"><button data-pf-open>Filters</button><select data-pf-sort>…</select></div>
     <div data-pf-activechips></div>
     <div class="pf-side" data-pf-panel>
       <div class="fgroup" data-pf-group="b" data-pf-legacy="b">…checkboxes/radios, values on inputs…</div>
       …
       <button data-pf-clearall>Clear all</button><button data-pf-show>Show N results</button>
     </div>
     <span data-pf-count></span>
     <div data-grid>…cards with data-* attributes matching group keys…</div>
   </div>
   Reuses .drawer/.scrim/.panel (site.css) for the mobile overlay and .chip (site.css/components.css) for pills. */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const AR=document.documentElement.lang==='ar';
const T=AR?{filters:'الفلاتر',clearAll:'مسح الكل',show:'عرض',results:'نتيجة',sort:'الترتيب'}
  :{filters:'Filters',clearAll:'Clear all',show:'Show',results:'results',sort:'Sort'};

$$('[data-pf]').forEach(root=>{
  const grid=(root.dataset.pfGrid&&$(root.dataset.pfGrid))||$('[data-pgrid]',root);
  if(!grid)return;
  const cards=$$('.pcard',grid);
  cards.forEach((c,i)=>c.dataset.idx=i);
  const Q=new URLSearchParams(location.search);
  const groupEls=$$('[data-pf-group]',root);
  const groups=groupEls.map(el=>({
    key:el.dataset.pfGroup,
    prop:el.dataset.pfProp||el.dataset.pfGroup, // card dataset property to read (defaults to the group key)
    mode:el.dataset.pfMode||'multi', // multi | single | range
    legacy:(el.dataset.pfLegacy||'').split(',').filter(Boolean),
    el,
    inputs:$$('input',el)
  }));
  const state={};groups.forEach(g=>state[g.key]=new Set());

  // seed from URL: canonical param = group key (repeatable), plus legacy single-value params
  groups.forEach(g=>{
    Q.getAll(g.key).forEach(v=>{if(v&&g.inputs.some(i=>i.value===v))state[g.key].add(v);});
    g.legacy.forEach(p=>{const v=Q.get(p);if(v&&g.inputs.some(i=>i.value===v))state[g.key].add(v);});
  });
  groups.forEach(g=>g.inputs.forEach(i=>{i.checked=state[g.key].has(i.value);}));

  function optionMatches(card,g,input){
    if(g.mode==='range'){
      const price=+card.dataset.price||0;
      const min=input.dataset.min?+input.dataset.min:0;
      const max=input.dataset.max?+input.dataset.max:Infinity;
      return price>=min&&price<=max;
    }
    const raw=(card.dataset[g.prop]||'').trim();
    const vals=raw?raw.split(/\s+/):[];
    return vals.includes(input.value);
  }
  function groupOk(card,g){
    const sel=state[g.key];if(!sel.size)return true;
    return g.inputs.some(i=>sel.has(i.value)&&optionMatches(card,g,i));
  }
  function cardOk(card,exceptKey){
    return groups.every(g=>g.key===exceptKey?true:groupOk(card,g));
  }

  const sortSel=$('[data-pf-sort]',root);
  function sortCards(list){
    const by=sortSel?sortSel.value:'pop';
    const val=c=>{
      if(by==='price-asc')return +c.dataset.price||0;
      if(by==='price-desc')return -(+c.dataset.price||0);
      if(by==='name')return (c.dataset.name||'').toLowerCase();
      if(by==='new')return -(+c.dataset.idx||0);
      return -(+c.dataset.pop||0);
    };
    return list.slice().sort((a,b)=>{const va=val(a),vb=val(b);return va<vb?-1:va>vb?1:0;});
  }

  function labelFor(input){
    const lab=input.closest('label');
    if(!lab)return input.value;
    const t=lab.querySelector('.pf-lbl');
    return (t?t.textContent:lab.textContent).replace(/\s*\(\d+\)\s*$/,'').trim();
  }

  function renderChips(){
    const bar=$('[data-pf-activechips]',root);if(!bar)return;
    const chips=[];
    groups.forEach(g=>g.inputs.forEach(i=>{if(state[g.key].has(i.value))chips.push({g,i});}));
    if(!chips.length){bar.innerHTML='';bar.hidden=true;return;}
    bar.hidden=false;
    bar.innerHTML=chips.map(({g,i},idx)=>
      `<button type="button" class="pf-achip" data-pf-rm="${g.key}" data-pf-rv="${i.value.replace(/"/g,'&quot;')}">${(labelFor(i))}<svg class="ico s" aria-hidden="true" focusable="false"><use href="#i-x"/></svg><span class="sr">Remove ${labelFor(i)} filter</span></button>`
    ).join('')+`<button type="button" class="pf-clearall-i" data-pf-clearall>${T.clearAll}</button>`;
  }

  function apply(){
    let n=0;
    cards.forEach(c=>{const ok=cardOk(c);c.classList.toggle('hide',!ok);if(ok)n++;});
    /* only reorder the DOM when the shopper picks a non-default sort: keeps the curated
       card order (incl. inline editorial/promo tiles) intact at first load and after filtering. */
    if(sortSel&&sortSel.value&&sortSel.value!=='pop'){
      sortCards(cards.filter(c=>!c.classList.contains('hide'))).forEach(c=>grid.appendChild(c));
    }
    groups.forEach(g=>g.inputs.forEach(input=>{
      const cnt=cards.filter(c=>cardOk(c,g.key)&&optionMatches(c,g,input)).length;
      const nEl=input.closest('label')&&input.closest('label').querySelector('[data-pf-n]');
      if(nEl)nEl.textContent=cnt;
      const zero=cnt===0&&!input.checked;
      input.disabled=zero;
      const lab=input.closest('label');if(lab)lab.classList.toggle('pf-zero',zero);
      input.closest('[data-pf-group]')&&input.setAttribute('aria-pressed',String(input.checked));
    }));
    $$('[data-pf-count]',root).forEach(el=>el.textContent=n+(n===1?' product':' products'));
    $$('[data-pf-shown]',root).forEach(el=>el.textContent=n);
    const empty=$('[data-pf-empty]',root);if(empty)empty.classList.toggle('hide',n>0);
    renderChips();
    const activeN=groups.reduce((a,g)=>a+state[g.key].size,0);
    $$('[data-pf-activecount]',root).forEach(el=>{el.hidden=!activeN;el.textContent=activeN;});
    // URL sync: canonical keys only, repeated params for multi-selects
    const u=new URL(location);
    groups.forEach(g=>{u.searchParams.delete(g.key);g.legacy.forEach(p=>u.searchParams.delete(p));});
    groups.forEach(g=>state[g.key].forEach(v=>u.searchParams.append(g.key,v)));
    if(sortSel&&sortSel.value&&sortSel.value!=='pop')u.searchParams.set('sort',sortSel.value);else u.searchParams.delete('sort');
    history.replaceState(null,'',u);
  }

  groupEls.forEach(el=>{
    el.addEventListener('change',e=>{
      const input=e.target;if(input.tagName!=='INPUT')return;
      const g=groups.find(x=>x.el===el);
      if(input.type==='radio'){state[g.key]=new Set(input.checked?[input.value]:[]);}
      else{if(input.checked)state[g.key].add(input.value);else state[g.key].delete(input.value);}
      apply();
    });
  });
  root.addEventListener('click',e=>{
    const rm=e.target.closest('[data-pf-rm]');
    if(rm){const g=groups.find(x=>x.key===rm.dataset.pfRm);
      if(g){state[g.key].delete(rm.dataset.pfRv);g.inputs.forEach(i=>{if(i.value===rm.dataset.pfRv)i.checked=false;});apply();}
      return;}
    if(e.target.closest('[data-pf-clearall]')){groups.forEach(g=>{state[g.key].clear();g.inputs.forEach(i=>i.checked=false);});apply();return;}
  });
  if(sortSel)sortSel.addEventListener('change',apply);
  if(sortSel){const sv=Q.get('sort');if(sv&&$$('option',sortSel).some(o=>o.value===sv))sortSel.value=sv;}

  /* ---------- mobile drawer ---------- */
  const panel=$('[data-pf-panel]',root);
  const openBtn=$('[data-pf-open]',root);
  let lastFocus=null;
  const scrimEl0=$('[data-pf-scrim]',root);
  function setOpen(o){
    if(!panel)return;
    panel.classList.toggle('open',o);
    if(scrimEl0)scrimEl0.classList.toggle('open',o);
    if(openBtn)openBtn.setAttribute('aria-expanded',String(o));
    document.body.style.overflow=o?'hidden':'';
    if(o){lastFocus=document.activeElement;const f=$('.pf-pan-h [data-pf-close]',panel);f&&f.focus();}
    else if(lastFocus&&lastFocus.focus)lastFocus.focus();
  }
  if(openBtn)openBtn.addEventListener('click',()=>setOpen(!panel.classList.contains('open')));
  if(panel){
    panel.addEventListener('click',e=>{if(e.target.closest('[data-pf-close]')||e.target.closest('[data-pf-show]'))setOpen(false);});
    panel.addEventListener('keydown',e=>{
      if(e.key==='Escape'){setOpen(false);return;}
      if(e.key==='Tab'){const f=$$('a[href],button:not([disabled]),input:not([disabled]),select',panel).filter(x=>x.offsetParent);
        if(!f.length)return;const a=f[0],z=f[f.length-1];
        if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}
        else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}
    });
  }
  if(scrimEl0)scrimEl0.addEventListener('click',()=>setOpen(false));

  apply();
});
})();
