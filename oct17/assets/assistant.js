/* Sight Savers Optics · scripted demo assistant. No network, no real AI — every reply below is pre-written.
   Loaded on every page. Persists the conversation in sessionStorage (this visit only) and saves demo
   bookings to a localStorage ss_ key, same pattern as the rest of the mockup. */
(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var AR = document.documentElement.lang === 'ar';
var WA = '971567103775';
var LOG_KEY = 'ss_chat_v1';
var BOOK_KEY = 'ss_chat_bookings';

var ICO = {
  chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="ico" aria-hidden="true" focusable="false"><path d="M4 11.5C4 7.4 7.8 4 12.5 4S21 7.4 21 11.5 17.2 19 12.5 19c-1 0-2-.15-2.9-.43L5 20l1.1-3.7C4.8 15 4 13.3 4 11.5z"/><circle cx="9" cy="11.5" r=".9" fill="currentColor" stroke="none"/><circle cx="12.5" cy="11.5" r=".9" fill="currentColor" stroke="none"/><circle cx="16" cy="11.5" r=".9" fill="currentColor" stroke="none"/></svg>',
  send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="ico" aria-hidden="true" focusable="false"><path d="M4 12l16-7-6 16-2.5-6.5L4 12z"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="ico" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>'
};

var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};

/* ---------------- static UI copy ---------------- */
var UI = AR ? {
  launch:'اسأل Sight Savers', title:'مساعد Sight Savers', subtitle:'اسأل عن العدسات أو فحوصات النظر أو عياداتنا',
  close:'إغلاق المحادثة', placeholder:'اكتب رسالة…', send:'إرسال',
  greet:'مرحبًا! يمكنني مساعدتك في العدسات وفحوصات النظر وعياداتنا ومتاجرنا. اختر أحد الخيارات أو اكتب سؤالك.',
  menuAgain:'كيف يمكنني مساعدتك أيضًا؟',
  chips:{lenses:'البحث عن عدسات لاصقة', book:'حجز فحص للعين', returns:'الإرجاع', hours:'مواعيد العمل', track:'تتبع طلبي', human:'التحدث مع شخص', menu:'القائمة الرئيسية', askMore:'سؤال آخر', talkPerson:'التحدث مع شخص'}
} : {
  launch:'Ask Sight Savers', title:'Sight Savers Assistant', subtitle:'Ask about lenses, eye tests or our clinics',
  close:'Close chat', placeholder:'Type a message…', send:'Send',
  greet:'Hello! I can help with lenses, eye tests, our clinics and stores. Pick an option below or type a question.',
  menuAgain:'What else can I help with?',
  chips:{lenses:'Find contact lenses', book:'Book an eye test', returns:'Returns', hours:'Store timings', track:'Track my order', human:'Talk to a person', menu:'Main menu', askMore:'Ask something else', talkPerson:'Talk to a person'}
};

var STORE_NAME = {karama:(AR?'الكرامة':'Al Karama'), burjuman:(AR?'بورجمان':'BurJuman'), dip:(AR?'دبي للاستثمار الصناعي':'Dubai Investment Park')};
var SVC_NAME = AR ? {eye:'فحص عين شامل', cl:'فحص عدسات لاصقة', kc:'تقييم القرنية المخروطية', ok:'عدسات Ortho-K', myo:'التحكم في قِصَر النظر', lv:'ضعف البصر', vt:'علاج تقويم البصر', revital:'RevitalVision'}
  : {eye:'Comprehensive eye test', cl:'Contact lens exam & fitting', kc:'Keratoconus / scleral assessment', ok:'Ortho-K overnight lenses', myo:'Myopia control (children)', lv:'Low-vision assessment', vt:'Vision therapy', revital:'RevitalVision'};

/* ---------------- FAQ + specialist topic table ---------------- */
/* Each topic: keywords (lower-case EN/AR fragments), then an EN and AR answer (HTML) with optional links. */
function link(href,label){return '<a href="'+href+'">'+esc(label)+'</a>'}
function btn(href,label,cls){return '<a class="btn '+(cls||'btn-ink')+' btn-sm" href="'+href+'">'+esc(label)+'</a>'}
function ex(txt){return '<span class="asst-ex">'+esc(txt)+'</span>'}

var TOPICS = [
  {key:'keratoconus', kw:['keratoconus','cornea thin','conical cornea','قرنية مخروطية'],
    en:'<p>Keratoconus is a condition where the cornea thins and bulges into a cone shape, which blurs vision. Scleral or specialist contact lenses can often help.</p><p>Our specialist clinic offers a keratoconus assessment in store.</p>',
    ar:'<p>القرنية المخروطية هي حالة تترقق فيها القرنية وتنتفخ لتأخذ شكل مخروط، مما يُضعف الرؤية. غالبًا ما تساعد العدسات الصُلبة (Scleral) أو العدسات المتخصصة.</p><p>تقدّم عيادتنا المتخصصة تقييمًا للقرنية المخروطية في المتجر.</p>',
    page:'keratoconus.html', svc:'kc'},
  {key:'scleral', kw:['scleral','sclerals','scleral lens','عدسات صلبة'],
    en:'<p>Scleral lenses are large, rigid lenses that vault over the whole cornea — often used for keratoconus, high astigmatism or very dry eyes. They’re fitted in store by our specialist team.</p>',
    ar:'<p>العدسات الصُلبة (Scleral) هي عدسات كبيرة وصلبة تغطي القرنية بالكامل — وتُستخدم غالبًا لحالات القرنية المخروطية أو الاستجماتيزم الشديد أو جفاف العين الحاد. يتم تركيبها في المتجر من قبل فريقنا المتخصص.</p>',
    page:'scleral-lenses.html', svc:'kc'},
  {key:'orthok', kw:['ortho-k','orthok','ortho k','overnight lens','corneal reshaping','عدسات ليلية'],
    en:'<p>Ortho-K lenses are worn overnight to gently reshape the cornea, so you can see clearly during the day without glasses or daytime contacts. It’s popular for myopia control in children too.</p>',
    ar:'<p>عدسات Ortho-K تُلبس أثناء النوم لإعادة تشكيل القرنية بلطف، فترى بوضوح خلال النهار دون نظارات أو عدسات. تُستخدم أيضًا للتحكم في قِصَر النظر لدى الأطفال.</p>',
    page:'ortho-k.html', svc:'ok'},
  {key:'myopia', kw:['myopia control','kids myopia','child myopia',"children's myopia",'myopia kids','short-sighted child','قصر النظر عند الأطفال'],
    en:'<p>Myopia (short-sightedness) in children can often be slowed down with specialist contact lenses, Ortho-K or eye drops, alongside regular eye tests to track changes.</p>',
    ar:'<p>يمكن غالبًا إبطاء تطور قِصَر النظر عند الأطفال باستخدام عدسات متخصصة أو Ortho-K أو قطرات للعين، إلى جانب فحوصات عين منتظمة لمتابعة التغيّرات.</p>',
    page:'myopia-control.html', svc:'myo'},
  {key:'lowvision', kw:['low vision','bioptic','telescope glasses','visually impaired','ضعف البصر'],
    en:'<p>Our low-vision service helps people with reduced sight (from conditions like macular degeneration) make the most of their remaining vision, with Ocutech bioptic telescope glasses.</p>',
    ar:'<p>تساعد خدمة ضعف البصر لدينا الأشخاص ذوي الرؤية المحدودة (مثل حالات الضمور البقعي) على الاستفادة القصوى من رؤيتهم المتبقية، باستخدام أجهزة تكبير ووسائل عملية.</p>',
    page:'low-vision.html', svc:'lv'},
  {key:'visiontherapy', kw:['vision therapy','lazy eye','amblyopia','prism','عين كسولة'],
    en:'<p>Vision therapy is a programme of guided exercises for things like a lazy eye (amblyopia), eye coordination or focusing problems — assessed and planned in store.</p>',
    ar:'<p>علاج تقويم البصر هو برنامج تمارين موجَّهة لحالات مثل العين الكسولة (الغمش) أو مشاكل تنسيق العينين أو التركيز — يتم تقييمه ووضع خطته في المتجر.</p>',
    page:'vision-therapy.html', svc:'vt'},
  {key:'revitalvision', kw:['revitalvision','revital vision','vision training'],
    en:'<p>RevitalVision is a clinically-studied, at-home visual training programme (done on a computer) that can improve contrast sensitivity and sharpness for some patients — only available in the UAE at Sight Savers.</p>',
    ar:'<p>RevitalVision هو برنامج تدريب بصري منزلي (عبر الكمبيوتر) مدروس سريريًا، يمكن أن يحسّن حساسية التباين ووضوح الرؤية لدى بعض المرضى — متوفر حصريًا في الإمارات لدى Sight Savers.</p>',
    page:'revitalvision.html', svc:''},
  {key:'dryeye', kw:['dry eye','dryness','جفاف العين'],
    en:'<p>Dry, gritty or tired eyes are common, especially for screen users and contact lens wearers. Lubricating drops can help day to day, and an eye test can check for an underlying cause.</p>',
    ar:'<p>جفاف العين أو الشعور بالحرقة أو التعب أمر شائع، خاصة لمستخدمي الشاشات ومرتدي العدسات اللاصقة. يمكن لقطرات الترطيب أن تساعد يوميًا، كما يمكن لفحص العين الكشف عن أي سبب كامن.</p>',
    page:'eye-tests.html', svc:'eye'},
  {key:'lens-types', kw:['contact lens types','types of contact lens','daily lens','monthly lens','which lens','what lens','bi-weekly','أنواع العدسات'],
    en:'<p>We stock daily, bi-weekly and monthly soft contact lenses, plus toric lenses for astigmatism, multifocal lenses and coloured lenses, from Acuvue, Alcon, CooperVision and Bausch + Lomb.</p>',
    ar:'<p>نوفّر عدسات لاصقة يومية وأسبوعية وشهرية، بالإضافة إلى عدسات تورية للاستجماتيزم وعدسات متعددة البؤر وعدسات ملونة، من Acuvue وAlcon وCooperVision وBausch + Lomb.</p>',
    page:'contact-lenses.html', svc:''},
  {key:'coloured', kw:['colour','color','coloured','tint','ملونة'],
    en:'<p>We carry coloured contact lenses (with or without your prescription) in several shades — you can filter by colour on our coloured lenses page.</p>',
    ar:'<p>نوفّر عدسات لاصقة ملونة (بدرجة بصرية أو بدونها) بعدة ألوان — يمكنك التصفية حسب اللون في صفحة العدسات الملونة.</p>',
    page:'coloured.html', svc:''},
  {key:'prescription', kw:['prescription','without prescription','need a prescription','rx','وصفة طبية'],
    en:'<p>Yes — contact lenses need a valid, in-date prescription. At checkout you can upload a photo, send it on WhatsApp, or use one already on file from a Sight Savers test. First time? Book a contact lens exam.</p>',
    ar:'<p>نعم — تحتاج العدسات اللاصقة إلى وصفة طبية سارية. عند الدفع يمكنك رفع صورة، أو إرسالها عبر واتساب، أو استخدام وصفة محفوظة من فحص سابق لدى Sight Savers. إذا كانت المرة الأولى، احجز فحص عدسات لاصقة.</p>',
    page:'lens.html', svc:'cl'},
  {key:'delivery', kw:['delivery','shipping','ship to','how long to deliver','توصيل'],
    en:'<p>We offer delivery across the UAE, or collection from any of our three stores. Our team will confirm delivery times and any fees for your order.</p>',
    ar:'<p>نوفّر التوصيل داخل الإمارات، أو الاستلام من أحد متاجرنا الثلاثة. سيؤكد فريقنا أوقات التوصيل وأي رسوم لطلبك.</p>',
    page:'cart.html', svc:''},
  {key:'payment', kw:['payment','pay','tabby','apple pay','cash on delivery','card payment','طرق الدفع'],
    en:'<p>Ask our team which payment options are available for your order.</p>',
    ar:'<p>اسأل فريقنا عن طرق الدفع المتاحة لطلبك.</p>',
    page:'checkout.html', svc:''},
  {key:'returns', kw:['return','refund','exchange','إرجاع','استرجاع'],
    en:'<p>Our team can confirm the returns options for your order.</p>',
    ar:'<p>يمكن لفريقنا تأكيد خيارات الإرجاع الخاصة بطلبك.</p>',
    page:'page.html?p=delivery', svc:''},
  {key:'stores', kw:['store location','where are you','address','which stores','branches','locations','مواقع المتاجر'],
    en:'<p>We have three stores: Al Karama, BurJuman and Dubai Investment Park. All three offer eye tests and contact lens fittings.</p>',
    ar:'<p>لدينا ثلاثة متاجر: الكرامة، وبورجمان، ودبي للاستثمار الصناعي. تقدّم المتاجر الثلاثة فحوصات العين وتركيب العدسات اللاصقة.</p>',
    page:'stores.html', svc:''},
  {key:'hours', kw:['opening hours','store hours','timing','what time do you open','when do you close','مواعيد العمل','ساعات العمل'],
    en:'<p>Opening hours can vary by store.</p>'+'<p>Check the current hours on the store page before you visit.</p>',
    ar:'<p>قد تختلف مواعيد العمل حسب المتجر.</p>'+'<p>يُرجى التحقق من المواعيد الحالية في صفحة المتجر قبل الزيارة.</p>',
    page:'stores.html', svc:''},
  {key:'eyetest', kw:['eye test','eye exam','vision test','فحص العين'],
    en:'<p>A comprehensive eye test checks your vision and eye health with an optometrist, who explains the result to you.</p>',
    ar:'<p>يتحقق فحص العين الشامل من رؤيتك وصحة عينيك مع أخصائي بصريات، الذي يشرح لك النتيجة.</p>',
    page:'eye-tests.html', svc:'eye'},
  {key:'kids', kw:['kids eye test',"children's eye test",'child eye test','فحص عين للأطفال'],
    en:'<p>We offer a gentle children’s eye test, explained in a way that’s easy for kids to understand.</p>',
    ar:'<p>نقدّم فحص عين لطيفًا للأطفال، يُشرح بطريقة سهلة الفهم لهم.</p>',
    page:'eye-tests.html', svc:'kids'}
];

/* ---------------- state ---------------- */
var state = loadState();
function defaultState(){return {log:[], chips:null, booking:null, opened:false}}
function loadState(){
  try{var raw=sessionStorage.getItem(LOG_KEY); if(raw) return Object.assign(defaultState(), JSON.parse(raw));}catch(e){}
  return defaultState();
}
function saveState(){ try{ sessionStorage.setItem(LOG_KEY, JSON.stringify(state)); }catch(e){} }
function getBookings(){ try{ return JSON.parse(localStorage.getItem(BOOK_KEY))||[]; }catch(e){ return []; } }
function addBooking(b){ var list=getBookings(); list.unshift(b); try{ localStorage.setItem(BOOK_KEY, JSON.stringify(list)); }catch(e){} }

/* ---------------- DOM ---------------- */
var root, logEl, quickEl, inputEl, sendBtn, launchBtn, panelEl, scrimEl, closeBtn;
function build(){
  root = document.createElement('div');
  root.className = 'asst';
  root.id = 'asst';
  root.innerHTML =
    '<div class="asst-scrim" data-asst-scrim></div>'+
    '<div class="asst-launch-wrap"><button class="asst-launch" type="button" id="asst-launch" aria-haspopup="dialog" aria-expanded="false" aria-controls="asst-panel">'+ICO.chat+'<span class="lbl">'+esc(UI.launch)+'</span><span class="asst-dot" aria-hidden="true"></span></button></div>'+
    '<div class="asst-panel" id="asst-panel" role="dialog" aria-modal="true" aria-label="'+esc(UI.title)+'" aria-hidden="true">'+
      '<header class="asst-hd">'+
        '<span class="asst-avatar">'+ICO.chat+'</span>'+
        '<div class="asst-id"><b>'+esc(UI.title)+'</b><span class="asst-sub">'+esc(UI.subtitle)+'</span></div>'+
        '<button class="asst-x" type="button" id="asst-close" aria-label="'+esc(UI.close)+'">'+ICO.x+'</button>'+
      '</header>'+
      '<div class="asst-log" id="asst-log" role="log" aria-live="polite" aria-relevant="additions"></div>'+
      '<div class="asst-quick" id="asst-quick"></div>'+
      '<form class="asst-composer" id="asst-composer">'+
        '<label class="sr" for="asst-input">'+esc(UI.placeholder)+'</label>'+
        '<input id="asst-input" type="text" autocomplete="off" placeholder="'+esc(UI.placeholder)+'">'+
        '<button type="submit" class="asst-send" id="asst-send" aria-label="'+esc(UI.send)+'">'+ICO.send+'</button>'+
      '</form>'+
    '</div>';
  document.body.appendChild(root);
  logEl = $('#asst-log', root); quickEl = $('#asst-quick', root); inputEl = $('#asst-input', root);
  sendBtn = $('#asst-send', root); launchBtn = $('#asst-launch', root); panelEl = $('#asst-panel', root);
  scrimEl = $('[data-asst-scrim]', root); closeBtn = $('#asst-close', root);
}

var lastFocus = null;
function openPanel(){
  root.classList.add('open');
  launchBtn.setAttribute('aria-expanded','true');
  panelEl.setAttribute('aria-hidden','false');
  lastFocus = document.activeElement;
  state.opened = true; saveState();
  if(!state.log.length){ botSay(UI.greet); showChips(mainMenuChips()); }
  setTimeout(function(){ inputEl.focus(); }, 60);
}
function closePanel(){
  root.classList.remove('open');
  launchBtn.setAttribute('aria-expanded','false');
  panelEl.setAttribute('aria-hidden','true');
  state.opened = false; saveState();
  if(lastFocus && lastFocus.focus) lastFocus.focus(); else launchBtn.focus();
}
function togglePanel(){ root.classList.contains('open') ? closePanel() : openPanel(); }

/* ---------------- render ---------------- */
function scrollDown(){ logEl.scrollTop = logEl.scrollHeight; }
function pushMsg(from, html){
  state.log.push({from:from, html:html});
  saveState();
  renderMsg(from, html);
}
function renderMsg(from, html){
  var d = document.createElement('div');
  d.className = 'asst-msg ' + (from==='user' ? 'user' : 'bot');
  d.innerHTML = html;
  logEl.appendChild(d);
  scrollDown();
}
function botSay(html){ pushMsg('bot', html); }
function userSay(text){ pushMsg('user', esc(text)); }

function showChips(list){
  state.chips = list; saveState();
  renderChips(list);
}
function renderChips(list){
  quickEl.innerHTML = '';
  if(!list || !list.length) return;
  list.forEach(function(c){
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'asst-chip' + (c.cls ? ' '+c.cls : '');
    b.textContent = c.label;
    b.setAttribute('data-kind', c.kind); b.setAttribute('data-value', c.value||'');
    b.addEventListener('click', function(){ dispatch(c.kind, c.value, c.label); });
    quickEl.appendChild(b);
  });
}

function chip(label, kind, value, cls){ return {label:label, kind:kind, value:value, cls:cls}; }
function mainMenuChips(){
  return [
    chip(UI.chips.lenses, 'intent', 'find-lenses'),
    chip(UI.chips.book, 'intent', 'book-eye-test', 'book'),
    chip(UI.chips.returns, 'intent', 'returns'),
    chip(UI.chips.hours, 'intent', 'store-timings'),
    chip(UI.chips.track, 'intent', 'track-order'),
    chip(UI.chips.human, 'intent', 'handover')
  ];
}
function askMoreChips(){ return [ chip(UI.chips.askMore, 'intent', 'menu'), chip(UI.chips.talkPerson, 'intent', 'handover') ]; }

/* ---------------- topic answers ---------------- */
function topicByKey(key){ for(var i=0;i<TOPICS.length;i++) if(TOPICS[i].key===key) return TOPICS[i]; return null; }
function answerTopic(t){
  var html = AR ? t.ar : t.en;
  var links = '<a class="lnk" href="'+t.page+'">'+(AR?'فتح الصفحة':'Open page')+'</a>';
  if(t.svc){ links += btn('book.html?s='+t.svc, AR?'الحجز الآن':'Book now', 'btn-book'); }
  else if(t.key === 'revitalvision'){ links += btn('book.html', AR?'الحجز الآن':'Book now', 'btn-book'); }
  botSay(html + '<div class="asst-links">' + links + '</div>');
  showChips(askMoreChips());
}

function matchFreeText(text){
  var q = text.toLowerCase();
  for(var i=0;i<TOPICS.length;i++){
    var t = TOPICS[i];
    for(var j=0;j<t.kw.length;j++){
      if(q.indexOf(t.kw[j].toLowerCase()) !== -1) return t;
    }
  }
  return null;
}

/* ---------------- intents ---------------- */
function introFindLenses(){
  botSay(AR?'نوفّر عدسات يومية وأسبوعية وشهرية، وعدسات تورية للاستجماتيزم، وعدسات ملونة، وعدسات متعددة البؤر.':'We stock daily, bi-weekly and monthly lenses, toric lenses for astigmatism, coloured lenses and multifocal lenses.');
  showChips([
    chip(AR?'يومية':'Daily', 'nav', 'contact-lenses.html?t=Daily'),
    chip(AR?'شهرية':'Monthly', 'nav', 'contact-lenses.html?t=Monthly'),
    chip(AR?'تورية (استجماتيزم)':'Toric (astigmatism)', 'nav', 'contact-lenses.html?t=Toric'),
    chip(AR?'ملونة':'Coloured', 'nav', 'coloured.html'),
    chip(UI.chips.askMore, 'intent', 'menu')
  ]);
}

function trackOrder(){
  var orders = [];
  try{ orders = JSON.parse(localStorage.getItem('ss_orders'))||[]; }catch(e){}
  if(!orders.length){
    botSay(AR?
      '<p>لا يوجد لديك طلب محفوظ على هذا المتصفح بعد. إذا سبق أن أتممت الدفع أو سجّلت الدخول، تحقق من حسابك.</p><div class="asst-links">'+link('account.html','فتح حسابي')+'</div>':
      '<p>I can’t find a saved order on this browser yet. If you’ve checked out before or signed in, check your account.</p><div class="asst-links">'+link('account.html', 'Open my account')+'</div>'
    );
  } else {
    var o = orders[0];
    var statusLine = (AR?'الحالة: ':'Status: ') + esc(o.status);
    botSay(
      (AR?'<p>أحدث طلب: <b>':'<p>Your most recent order: <b>') + esc(o.id) + '</b> &middot; ' + esc(o.date) + '</p>' +
      '<p>' + statusLine + '<br>' + (AR?'الإجمالي: ':'Total: ') + 'AED ' + Math.round(o.total) + '</p>' +
      '<div class="asst-links">' + link('account.html', AR?'عرض كل الطلبات':'View all orders') + '</div>'
    );
  }
  showChips(askMoreChips());
}

function handover(){
  botSay(AR?
    '<p>يمكنك التواصل مع فريقنا مباشرة:</p>':
    '<p>You can reach our team directly:</p>'
  );
  var waMsg = AR ? 'مرحبًا Sight Savers Optics، أحتاج إلى مساعدة من فريقكم.' : 'Hello Sight Savers Optics, I need some help from your team.';
  var links = '<div class="asst-links">'+
    '<a class="btn btn-wa btn-sm" href="https://wa.me/'+WA+'?text='+encodeURIComponent(waMsg)+'" data-wa="'+esc(waMsg)+'" target="_blank" rel="noopener">'+(AR?'واتساب':'WhatsApp')+'</a>'+
    '<a class="btn btn-white btn-sm" href="stores.html">'+(AR?'زيارة متجر':'Visit a store')+'</a>'+
    '</div>';
  botSay(links);
  showChips(askMoreChips());
}

/* ---------------- in-chat booking flow ---------------- */
function dayList(){
  var out = []; var names = AR ? ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'] : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var today = new Date();
  for(var i=0;i<7;i++){
    var d = new Date(today); d.setDate(today.getDate()+i);
    out.push({iso:d.toISOString().slice(0,10), label: names[d.getDay()]+' '+d.getDate()});
  }
  return out;
}
var SLOTS = ['10:00','11:30','14:00','16:30','18:00'];
var telOk = function(v){ return /^(?:\+?971|0)?5\d{8}$/.test(String(v).replace(/[\s-]/g,'')); };

function startBooking(presetSvc){
  state.booking = {step: presetSvc ? 'store' : 'svc', svc: presetSvc||'', store:'', day:'', slot:'', name:'', phone:''};
  saveState();
  if(presetSvc){
    botSay(AR?'رائع، سنحجز: <b>'+esc(SVC_NAME[presetSvc])+'</b>. أي متجر يناسبك؟':'Great, booking: <b>'+esc(SVC_NAME[presetSvc])+'</b>. Which store works for you?');
    showStoreChips();
  } else {
    botSay(AR?'بكل سرور. ما الخدمة التي تريد حجزها؟':'Sure. What would you like to book?');
    showChips([
      chip(SVC_NAME.eye,'svc','eye'), chip(SVC_NAME.cl,'svc','cl'),
      chip(AR?'عيادة متخصصة':'Specialist clinic','svc-specialist',''),
      chip(UI.chips.askMore,'booking','cancel')
    ]);
  }
}
function showSpecialistChips(){
  botSay(AR?'أي خدمة متخصصة؟':'Which specialist service?');
  showChips([
    chip(SVC_NAME.kc,'svc','kc'), chip(SVC_NAME.ok,'svc','ok'), chip(SVC_NAME.myo,'svc','myo'),
    chip(SVC_NAME.lv,'svc','lv'), chip(SVC_NAME.vt,'svc','vt'), chip(SVC_NAME.revital,'svc','revital'),
    chip(UI.chips.askMore,'booking','cancel')
  ]);
}
function showStoreChips(){
  showChips([
    chip(STORE_NAME.karama,'store','karama'), chip(STORE_NAME.burjuman,'store','burjuman'), chip(STORE_NAME.dip,'store','dip'),
    chip(UI.chips.askMore,'booking','cancel')
  ]);
}
function showDayChips(){
  botSay(AR?'أي يوم يناسبك؟':'Which day works?');
  var chips = dayList().map(function(d){ return chip(d.label,'day',d.iso); });
  chips.push(chip(UI.chips.askMore,'booking','cancel'));
  showChips(chips);
}
function showSlotChips(){
  botSay(AR?'أي وقت تفضل؟':'What time works best?');
  var chips = SLOTS.map(function(s){ return chip(s,'slot',s); });
  chips.push(chip(UI.chips.askMore,'booking','cancel'));
  showChips(chips);
}
function askName(){
  botSay(AR?'رائع. ما اسمك الكامل؟':'Great. What’s your full name?');
  showChips([chip(UI.chips.askMore,'booking','cancel')]);
  inputEl.focus();
}
function askPhone(){
  botSay(AR?'شكرًا. وما رقم جوالك في الإمارات؟ مثال: 050 123 4567':'Thanks. And your UAE mobile number? e.g. 050 123 4567');
  showChips([chip(UI.chips.askMore,'booking','cancel')]);
  inputEl.focus();
}
function confirmSummary(){
  var b = state.booking;
  var dayLabel = dayList().reduce(function(acc,d){return d.iso===b.day?d.label:acc;}, b.day);
  var html = (AR?'<p>يرجى تأكيد التفاصيل:</p><ul>':'<p>Please confirm your details:</p><ul>') +
    '<li>'+(AR?'الخدمة: ':'Service: ')+esc(SVC_NAME[b.svc]||b.svc)+'</li>'+
    '<li>'+(AR?'المتجر: ':'Store: ')+esc(STORE_NAME[b.store])+'</li>'+
    '<li>'+(AR?'الموعد: ':'When: ')+esc(dayLabel)+', '+esc(b.slot)+'</li>'+
    '<li>'+(AR?'الاسم: ':'Name: ')+esc(b.name)+'</li>'+
    '<li>'+(AR?'الجوال: ':'Phone: ')+esc(b.phone)+'</li></ul>';
  botSay(html);
  showChips([
    chip(AR?'تأكيد الحجز':'Confirm booking','booking','confirm','book'),
    chip(AR?'البدء من جديد':'Start over','booking','cancel')
  ]);
  state.booking.step = 'confirm'; saveState();
}
function finishBooking(){
  var b = state.booking;
  var ref = 'SSO-' + String(Math.floor(1000 + Math.random()*9000));
  var record = {ref:ref, svc:b.svc, svcLabel:SVC_NAME[b.svc]||b.svc, store:b.store, storeLabel:STORE_NAME[b.store], day:b.day, slot:b.slot, name:b.name, phone:b.phone, createdAt:new Date().toISOString()};
  addBooking(record);
  var bookUrl = 'book.html?' + (b.svc?('s='+encodeURIComponent(b.svc)+'&'):'') + 'store='+encodeURIComponent(b.store)+'&d='+encodeURIComponent(b.day);
  botSay(
    (AR?'<p>شكرًا. رقم طلبك: <b>':'<p>Thanks. Your request reference: <b>') + esc(ref) + '</b></p>' +
    '<p>'+(AR?'تم حفظ طلبك في هذا المتصفح. تابع إلى صفحة الحجز لإكماله.':'Your request is saved in this browser. Continue to the booking page to finish.')+'</p>'+
    '<div class="asst-links">' + link(bookUrl, AR?'متابعة إلى الحجز':'Continue to booking') + '</div>'
  );
  state.booking = null; saveState();
  showChips(askMoreChips());
}
function cancelBooking(){
  state.booking = null; saveState();
  botSay(AR?'تم إلغاء الحجز. '+UI.menuAgain:'Booking cancelled. '+UI.menuAgain);
  showChips(mainMenuChips());
}

/* ---------------- dispatch ---------------- */
function dispatch(kind, value, label){
  if(label) userSay(label);
  if(kind === 'intent'){
    if(value === 'menu'){ botSay(UI.menuAgain); showChips(mainMenuChips()); }
    else if(value === 'find-lenses'){ introFindLenses(); }
    else if(value === 'book-eye-test'){ startBooking('eye'); }
    else if(value === 'returns'){ answerTopic(topicByKey('returns')); }
    else if(value === 'store-timings'){ answerTopic(topicByKey('hours')); }
    else if(value === 'track-order'){ trackOrder(); }
    else if(value === 'handover'){ handover(); }
    return;
  }
  if(kind === 'nav'){ location.href = value; return; }
  if(kind === 'svc-specialist'){ showSpecialistChips(); return; }
  if(kind === 'svc'){
    state.booking.svc = value; state.booking.step = 'store'; saveState();
    botSay(AR?'تم اختيار: <b>'+esc(SVC_NAME[value])+'</b>. أي متجر يناسبك؟':'Got it: <b>'+esc(SVC_NAME[value])+'</b>. Which store works for you?');
    showStoreChips();
    return;
  }
  if(kind === 'store'){
    state.booking.store = value; state.booking.step = 'day'; saveState();
    showDayChips();
    return;
  }
  if(kind === 'day'){
    state.booking.day = value; state.booking.step = 'slot'; saveState();
    showSlotChips();
    return;
  }
  if(kind === 'slot'){
    state.booking.slot = value; state.booking.step = 'name'; saveState();
    askName();
    return;
  }
  if(kind === 'booking'){
    if(value === 'cancel') cancelBooking();
    else if(value === 'confirm') finishBooking();
    return;
  }
}

function handleFreeText(text){
  var b = state.booking;
  if(b && b.step === 'name'){
    if(!text.trim()){ botSay(AR?'يرجى إدخال اسمك.':'Please enter your name.'); return; }
    b.name = text.trim(); b.step = 'phone'; saveState();
    askPhone();
    return;
  }
  if(b && b.step === 'phone'){
    if(!telOk(text)){ botSay(AR?'يرجى إدخال رقم جوال إماراتي صحيح، مثال: 050 123 4567':'Please enter a valid UAE mobile number, e.g. 050 123 4567'); return; }
    b.phone = text.trim(); saveState();
    confirmSummary();
    return;
  }
  var t = matchFreeText(text);
  if(t){ answerTopic(t); return; }
  botSay(AR?
    '<p>لا تتوفر لدي إجابة على ذلك بعد. جرّب أحد الخيارات، أو تحدّث مع فريقنا.</p>':
    '<p>I don’t have an answer for that yet. Try one of the options below, or talk to our team.</p>'
  );
  showChips(mainMenuChips());
}

/* ---------------- events ---------------- */
function bind(){
  launchBtn.addEventListener('click', togglePanel);
  closeBtn.addEventListener('click', closePanel);
  scrimEl.addEventListener('click', closePanel);
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && root.classList.contains('open')) closePanel();
  });
  panelEl.addEventListener('keydown', function(e){
    if(e.key !== 'Tab') return;
    var f = $$('a[href],button:not([disabled]),input',panelEl).filter(function(x){return x.offsetParent;});
    if(!f.length) return;
    var a=f[0], z=f[f.length-1];
    if(e.shiftKey && document.activeElement===a){ e.preventDefault(); z.focus(); }
    else if(!e.shiftKey && document.activeElement===z){ e.preventDefault(); a.focus(); }
  });
  var form = $('#asst-composer', root);
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var v = inputEl.value.trim();
    if(!v) return;
    userSay(v);
    inputEl.value = '';
    handleFreeText(v);
  });
}

/* ---------------- restore + init ---------------- */
function restore(){
  if(state.log && state.log.length){
    state.log.forEach(function(m){ renderMsg(m.from, m.html); });
    renderChips(state.chips || askMoreChips());
    if(state.opened){ root.classList.add('open'); launchBtn.setAttribute('aria-expanded','true'); panelEl.setAttribute('aria-hidden','false'); }
  }
}

function init(){
  build();
  bind();
  restore();
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

})();
