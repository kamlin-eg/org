function bookService(service) {
  const select=document.getElementById('serviceSelect');
  if(![...select.options].some(o=>o.value===service))select.add(new Option(service,service));
  select.value=service;document.getElementById('booking').scrollIntoView({behavior:'smooth'});select.focus({preventScroll:true});
}
function toggleMenu(force) {
  const nav=document.getElementById('mainNav'),open=typeof force==='boolean'?force:!nav.classList.contains('open');
  nav.classList.toggle('open',open);document.querySelector('.menu-btn').setAttribute('aria-expanded',String(open));
}
document.querySelectorAll('#mainNav a').forEach(a=>a.addEventListener('click',()=>toggleMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape')toggleMenu(false)});
document.addEventListener('click',e=>{if(!e.target.closest('.nav'))toggleMenu(false)});
document.getElementById('year').textContent=new Date().getFullYear();
function bindForm(id,statusId) {
  const form=document.getElementById(id),status=document.getElementById(statusId);
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(form.dataset.busy)return;
    const values=Object.fromEntries(new FormData(form)),button=form.querySelector('[type=submit]');
    status.className='form-status';
    if(!values.name.trim()||!validPhone(values.phone)){status.classList.add('error');status.textContent='أدخل الاسم ورقم هاتف صحيح من 10 إلى 15 رقمًا.';return;}
    form.dataset.busy='true';button.disabled=true;status.textContent='جارٍ إرسال طلبك…';
    // Reuse the ID after a network timeout to prevent duplicate submissions.
    form.dataset.requestId ||= crypto.randomUUID();
    try {
      const {data,error}=await requireDB().rpc('submit_kamlin_booking',{request_id:form.dataset.requestId,customer_name:values.name.trim(),customer_phone:normalizePhone(values.phone),requested_service:values.service,customer_area:(values.area||'').trim(),customer_notes:(values.notes||'').trim()});
      if(error)throw error;if(!data)throw Error('لم يصل تأكيد الطلب.');
      status.classList.add('success');status.textContent=`تم إرسال طلبك. رقم المرجع: ${data}. سنتواصل معك لتأكيد التفاصيل والموعد.`;
      form.reset();delete form.dataset.requestId;
    }catch(error){status.classList.add('error');status.textContent=window.kamlinDB?'لم يتم تأكيد الحجز. تحقق من الاتصال وحاول مرة أخرى، أو تواصل معنا عبر واتساب.':error.message;}
    finally{delete form.dataset.busy;button.disabled=false;}
  });
}
bindForm('quickBooking','quickStatus');bindForm('bookingForm','bookingStatus');
document.querySelectorAll('[data-book]').forEach(b=>b.onclick=()=>bookService(b.dataset.book));
async function showPrices(){
  if(!window.kamlinDB)return;
  const {data,error}=await kamlinDB.from('site_settings').select('value').eq('key','prices').maybeSingle();
  if(error||!data)return;
  const list=document.getElementById('priceList');
  for(const [key,label] of Object.entries(window.KAMLIN_PRICES||{})){
    const amount=data.value[key];if(amount==null||amount===''||!Number.isFinite(Number(amount))||Number(amount)<0)continue;
    const item=document.createElement('article');item.className='price-item';
    const title=document.createElement('h3');title.textContent=label;
    const price=document.createElement('p');price.textContent=`تبدأ من ${Number(amount).toLocaleString('ar-EG')} ج.م`;
    const button=document.createElement('button');button.className='btn ghost';button.textContent='اطلب عرض سعر';button.onclick=()=>bookService(label);
    item.append(title,price,button);list.append(item);
  }
  if(list.children.length)document.getElementById('pricesSection').hidden=false;
}
showPrices().catch(()=>{});
