function switchView(id){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));document.querySelectorAll('.nav-link[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));document.getElementById(id)?.classList.add('active');document.querySelector('.admin-top h1').textContent=document.querySelector('.nav-link[data-view="'+id+'"]')?.textContent||'لوحة التحكم';renderAll()}
document.querySelectorAll('.nav-link[data-view]').forEach(b=>b.onclick=()=>switchView(b.dataset.view));
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));const id=()=>crypto.randomUUID();const today=()=>new Date().toISOString().slice(0,10);
function renderAll(){renderBookings();renderWorkers();renderAssignments();renderAttendance();renderTools();renderCustomers();renderFollowups();renderContracts();renderDashboard()}
function renderDashboard(){document.getElementById('kpiTotal').textContent=bookings.length;document.getElementById('kpiNew').textContent=bookings.filter(x=>x.status==='جديد').length;document.getElementById('kpiWorkers').textContent=workers.length;document.getElementById('kpiFollow').textContent=bookings.filter(x=>x.followUp&&x.followUp>=today()).length;const latest=[...bookings].slice(0,5);document.getElementById('latestBookings').innerHTML=latest.length?'<div class="mini-list">'+latest.map(x=>`<div class="mini-row"><b>${esc(x.name)}</b><span>${esc(x.service)}</span><small>${esc(x.status||'جديد')}</small></div>`).join('')+'</div>':'<div class="empty">لا توجد طلبات محفوظة حتى الآن.</div>';const counts={};bookings.forEach(x=>counts[x.status||'جديد']=(counts[x.status||'جديد']||0)+1);document.getElementById('statusSummary').innerHTML=Object.entries(counts).map(([k,v])=>`<div><span>${esc(k)}</span><b>${v}</b></div>`).join('')||'<div class="empty">لا توجد بيانات.</div>'}
function renderBookings(){const q=(document.getElementById('searchInput')?.value||'').toLowerCase(),st=document.getElementById('statusFilter')?.value||'';const a=bookings.filter(x=>(!st||x.status===st)&&(!q||[x.name,x.phone,x.service,x.area].join(' ').toLowerCase().includes(q)));document.getElementById('bookingRows').innerHTML=a.length?a.map(x=>`<tr><td>${esc(x.date||'')}<small class="order-reference">${esc(x.reference||x.id)}</small></td><td>${esc(x.name)}</td><td><a href="tel:${esc(x.phone)}">${esc(x.phone)}</a></td><td>${esc(x.service)}</td><td>${esc(x.area||'')}</td><td>${esc(x.status||'جديد')}</td><td><button onclick="editBooking('${x.id}')">تعديل</button> <button class="danger" onclick="deleteBooking('${x.id}')">حذف</button></td></tr>`).join(''):'<tr><td colspan="7" class="empty">لا توجد طلبات محفوظة حتى الآن.</td></tr>'}
function openNewBooking(){const f=document.getElementById('editForm');f.reset();f.elements.phone.setCustomValidity('');document.querySelectorAll('.dialog-error').forEach(x=>x.remove());f.elements.id.value='';document.getElementById('dialogTitle').textContent='طلب جديد';document.getElementById('bookingDialog').showModal()}
function editBooking(i){const x=bookings.find(x=>x.id===i);if(!x)return;const f=document.getElementById('editForm');f.reset();f.elements.phone.setCustomValidity('');document.querySelectorAll('.dialog-error').forEach(x=>x.remove());Object.keys(x).forEach(k=>{if(f.elements[k])f.elements[k].value=x[k]??''});document.getElementById('dialogTitle').textContent='تعديل الطلب';document.getElementById('bookingDialog').showModal()}
const configs={workers:{title:'عامل',key:'workers',fields:[['name','الاسم','text'],['phone','الهاتف','tel'],['role','الوظيفة','text'],['status','الحالة','select','متاح|في مهمة|إجازة'],['notes','ملاحظات','text']]},assignments:{title:'تكليف',key:'assignments',fields:[['date','التاريخ','date'],['worker','العامل','text'],['task','المهمة','text'],['location','الموقع','text'],['status','الحالة','select','جديد|قيد التنفيذ|مكتمل']]},attendance:{title:'حضور',key:'attendance',fields:[['date','التاريخ','date'],['worker','العامل','text'],['in','الحضور','time'],['out','الانصراف','time'],['notes','ملاحظات','text']]},tools:{title:'تسليم أدوات',key:'tools',fields:[['date','التاريخ','date'],['worker','العامل','text'],['tool','الأداة','text'],['qty','الكمية','number'],['status','الحالة','select','مُسلّم|مُعاد|تالف']]}};let genericType='',genericId='';
function openGeneric(type,itemId=''){document.querySelectorAll('.dialog-error').forEach(x=>x.remove());genericType=type;genericId=itemId;const c=configs[type],arr=getList(type),x=arr.find(y=>y.id===itemId)||{};document.getElementById('genericTitle').textContent=itemId?'تعديل '+c.title:'إضافة '+c.title;document.getElementById('genericFields').innerHTML=c.fields.map(([n,l,t,opts])=>`<label>${l}${t==='select'?`<select name="${n}">${opts.split('|').map(o=>`<option ${x[n]===o?'selected':''}>${o}</option>`).join('')}</select>`:`<input name="${n}" type="${t}" value="${esc(x[n]||(t==='date'?today():''))}" ${n==='name'||n==='worker'||n==='task'||n==='tool'?'required':''}>`}</label>`).join('');document.getElementById('genericDialog').showModal()}
function openWorker(i=''){openGeneric('workers',i)}function openAssignment(i=''){openGeneric('assignments',i)}function openAttendance(i=''){openGeneric('attendance',i)}function openTool(i=''){openGeneric('tools',i)}
function renderWorkers(){document.getElementById('workerRows').innerHTML=workers.length?workers.map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.phone)}</td><td>${esc(x.role)}</td><td>${esc(x.status)}</td><td>${esc(x.notes)}</td><td><button onclick="openWorker('${x.id}')">تعديل</button> <button class="danger" onclick="delGeneric('workers','${x.id}')">حذف</button></td></tr>`).join(''):'<tr><td colspan="6" class="empty">لا توجد بيانات.</td></tr>'}
function renderAssignments(){document.getElementById('assignmentRows').innerHTML=assignments.length?assignments.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.worker)}</td><td>${esc(x.task)}</td><td>${esc(x.location)}</td><td>${esc(x.status)}</td><td><button onclick="openAssignment('${x.id}')">تعديل</button> <button class="danger" onclick="delGeneric('assignments','${x.id}')">حذف</button></td></tr>`).join(''):'<tr><td colspan="6" class="empty">لا توجد بيانات.</td></tr>'}
function renderAttendance(){document.getElementById('attendanceRows').innerHTML=attendance.length?attendance.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.worker)}</td><td>${esc(x.in)}</td><td>${esc(x.out)}</td><td>${esc(x.notes)}</td><td><button onclick="openAttendance('${x.id}')">تعديل</button> <button class="danger" onclick="delGeneric('attendance','${x.id}')">حذف</button></td></tr>`).join(''):'<tr><td colspan="6" class="empty">لا توجد بيانات.</td></tr>'}
function renderTools(){document.getElementById('toolRows').innerHTML=tools.length?tools.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.worker)}</td><td>${esc(x.tool)}</td><td>${esc(x.qty)}</td><td>${esc(x.status)}</td><td><button onclick="openTool('${x.id}')">تعديل</button> <button class="danger" onclick="delGeneric('tools','${x.id}')">حذف</button></td></tr>`).join(''):'<tr><td colspan="6" class="empty">لا توجد بيانات.</td></tr>'}
function renderCustomers(){const m=Object.create(null);bookings.forEach(x=>{const k=x.phone||x.name;if(!m[k])m[k]={name:x.name,phone:x.phone,count:0,service:x.service,status:x.status};m[k].count++});document.getElementById('customerRows').innerHTML=Object.values(m).map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.phone)}</td><td>${x.count}</td><td>${esc(x.service)}</td><td>${esc(x.status)}</td></tr>`).join('')||'<tr><td colspan="5" class="empty">لا توجد بيانات.</td></tr>'}
function renderFollowups(){const a=bookings.filter(x=>x.followUp||x.warranty);document.getElementById('followRows').innerHTML=a.map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.service)}</td><td>${esc(x.followUp)}</td><td>${esc(x.warranty)}</td><td>${esc(x.status)}</td></tr>`).join('')||'<tr><td colspan="5" class="empty">لا توجد متابعات.</td></tr>'}
function renderContracts(){const a=bookings.filter(x=>Number(x.quote)>0);document.getElementById('contractRows').innerHTML=a.map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.service)}</td><td>${esc(x.quote)}</td><td>${esc(x.status)}</td><td>${esc(x.id)}</td></tr>`).join('')||'<tr><td colspan="5" class="empty">لا توجد عروض أو عقود مسجلة.</td></tr>'}
function csv(){const rows=[['التاريخ','العميل','الهاتف','الخدمة','المنطقة','الحالة'],...bookings.map(x=>[x.date,x.name,x.phone,x.service,x.area,x.status])];const blob=new Blob(['\ufeff'+rows.map(r=>r.map(v=>'"'+String(/^[=+@\-\t\r]/.test(String(v??''))?"'"+v:(v??'')).replaceAll('"','""')+'"').join(',')).join('\n')],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='kamlin-bookings.csv';a.click();URL.revokeObjectURL(a.href)}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).close());
let bookings=[],workers=[],assignments=[],attendance=[],tools=[];
const sb=window.kamlinDB;
let authorized=false,busy=false;
const getList=type=>({workers,assignments,attendance,tools})[type];
const feedback=document.getElementById('adminFeedback');
function message(text,error=false){feedback.textContent=text;feedback.classList.toggle('error',error);}
function lockWorkspace(){
  authorized=false;document.getElementById('adminWorkspace').hidden=true;document.getElementById('adminWorkspace').inert=true;
  document.getElementById('adminLogin').style.display='grid';
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  bookings=[];workers=[];assignments=[];attendance=[];tools=[];
  document.querySelectorAll('#prices input').forEach(x=>x.value='');renderAll();
}
const unpack=row=>({...row.data,id:row.id,reference:row.reference,date:row.data.date||row.created_at.slice(0,10),version:row.version});
async function readRows(table){
  const result=[];let from=0;
  while(true){const {data,error}=await sb.from(table).select('*').order('created_at',{ascending:false}).order('id').range(from,from+499);if(error)throw error;result.push(...data);if(data.length<500)break;from+=500;}
  return result;
}
async function refresh(){
  if(!authorized)return;
  const [orders,records,prices]=await Promise.all([readRows('kamlin_bookings'),readRows('kamlin_records'),sb.from('site_settings').select('value').eq('key','prices').maybeSingle()]);
  if(prices.error)throw prices.error;
  if(!authorized)return;
  bookings=orders.map(unpack);workers=records.filter(x=>x.kind==='workers').map(unpack);
  assignments=records.filter(x=>x.kind==='assignments').map(unpack);attendance=records.filter(x=>x.kind==='attendance').map(unpack);tools=records.filter(x=>x.kind==='tools').map(unpack);
  for(const key of Object.keys(window.KAMLIN_PRICES))document.getElementById(key).value=prices.data?.value?.[key]??'';
  renderAll();document.getElementById('syncTime').textContent='آخر تحديث: '+new Date().toLocaleTimeString('ar-EG');
}
async function authenticate(session){
  lockWorkspace();if(!session)return;
  const {data,error}=await sb.from('kamlin_admins').select('user_id').eq('user_id',session.user.id).maybeSingle();
  if(error||!data)throw Error('هذا الحساب لا يملك صلاحية الإدارة أو لم يتم تجهيز قاعدة البيانات.');
  authorized=true;
  try{await refresh();}catch(e){lockWorkspace();throw e;}
  document.getElementById('adminLogin').style.display='none';document.getElementById('adminWorkspace').hidden=false;document.getElementById('adminWorkspace').inert=false;
}
async function mutate(action,dialogId){
  if(!authorized||busy)return;busy=true;
  document.querySelectorAll('button').forEach(b=>b.disabled=true);message('جارٍ الحفظ…');
  try{await action();if(dialogId)document.getElementById(dialogId).close();message('تم حفظ التغيير في قاعدة البيانات.');try{await refresh()}catch{message('تم الحفظ، لكن تعذر تحديث القائمة. اضغط تحديث البيانات.',true)}}
  catch(e){message('لم يتم حفظ التغيير. '+(e.message||'تحقق من الاتصال والصلاحيات.'),true);const dialog=document.querySelector('dialog[open]');if(dialog){let status=dialog.querySelector('.dialog-error');if(!status){status=document.createElement('p');status.className='dialog-error';status.setAttribute('role','alert');dialog.querySelector('form').append(status);}status.textContent=feedback.textContent;}}
  finally{busy=false;document.querySelectorAll('button').forEach(b=>b.disabled=false);}
}
async function writeRow(table,values,existing,kind){
  const clean={...values};delete clean.id;delete clean.version;delete clean.reference;
  const record={data:clean,...(kind?{kind}:{})};
  const query=existing?sb.from(table).update(record).eq('id',existing.id).eq('version',existing.version):sb.from(table).insert({id:values.id||crypto.randomUUID(),...record});
  const {data,error}=await query.select('id');if(error)throw error;
  if(!data?.length)throw Error('السجل تغير أو حُذف بواسطة مستخدم آخر. حدّث البيانات قبل إعادة المحاولة.');
}
document.getElementById('editForm').onsubmit=e=>{
  e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));
  if(!d.name.trim()||!d.service.trim()||!validPhone(d.phone)){message('أدخل اسمًا وخدمة ورقم هاتف صحيحًا.',true);e.currentTarget.elements.phone.setCustomValidity('أدخل رقمًا صحيحًا من 10 إلى 15 رقمًا');e.currentTarget.elements.phone.reportValidity();return;}
  const old=bookings.find(x=>x.id===d.id);d.phone=normalizePhone(d.phone);d.date=old?.date||today();
  mutate(()=>writeRow('kamlin_bookings',{...old,...d},old),'bookingDialog');
};
document.querySelector('#editForm [name=phone]').oninput=e=>e.target.setCustomValidity('');
document.getElementById('genericForm').onsubmit=e=>{
  e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));d.id=genericId;
  if(genericType==='tools'&&(!Number.isInteger(Number(d.qty))||Number(d.qty)<=0)){const input=e.currentTarget.elements.qty;input.setCustomValidity('أدخل كمية صحيحة أكبر من صفر');input.reportValidity();input.oninput=()=>input.setCustomValidity('');return;}
  mutate(()=>writeRow('kamlin_records',d,getList(genericType).find(x=>x.id===genericId),genericType),'genericDialog');
};
async function removeRow(table,item){
  const {data,error}=await sb.from(table).delete().eq('id',item.id).eq('version',item.version).select('id');
  if(error)throw error;if(!data.length)throw Error('السجل تغير. حدّث البيانات وأعد المحاولة.');
}
function deleteBooking(i){const item=bookings.find(x=>x.id===i);if(item&&confirm('حذف هذا الطلب نهائيًا؟'))mutate(()=>removeRow('kamlin_bookings',item));}
function delGeneric(type,i){const item=getList(type).find(x=>x.id===i);if(item&&confirm('حذف هذا السجل نهائيًا؟'))mutate(()=>removeRow('kamlin_records',item));}
document.getElementById('exportBookings').onclick=csv;
document.getElementById('searchInput').oninput=renderBookings;document.getElementById('statusFilter').onchange=renderBookings;
document.getElementById('savePricesBtn').onclick=()=>{
  const value={};for(const key of Object.keys(window.KAMLIN_PRICES)){const input=document.getElementById(key);if(!input.reportValidity())return;if(input.value!=='')value[key]=Number(input.value);}
  mutate(async()=>{const {error}=await sb.from('site_settings').upsert({key:'prices',value,updated_at:new Date().toISOString()});if(error)throw error;});
};
document.getElementById('refreshData').onclick=async()=>{try{await refresh();message('تم تحديث البيانات.')}catch{message('تعذر تحديث البيانات. تحقق من الاتصال والصلاحيات.',true)}};
document.getElementById('logoutBtn').onclick=async()=>{const {error}=await sb.auth.signOut({scope:'local'});if(error){message('تعذر تسجيل الخروج. حاول مرة أخرى.',true);return;}lockWorkspace();};
document.getElementById('adminLoginForm').onsubmit=async e=>{
  e.preventDefault();const button=e.currentTarget.querySelector('button');button.disabled=true;const status=document.getElementById('loginError');status.textContent='جارٍ التحقق…';
  try{requireDB();const {data,error}=await sb.auth.signInWithPassword({email:document.getElementById('adminEmail').value.trim(),password:document.getElementById('adminPassword').value});if(error)throw Error('تعذر الدخول. تحقق من البريد وكلمة المرور والاتصال.');await authenticate(data.session);document.getElementById('adminPassword').value='';status.textContent='';}
  catch(error){status.textContent=error.message;}finally{button.disabled=false;}
};
renderAll();
if(sb){
  sb.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'||!session)lockWorkspace();});
  sb.auth.getSession().then(async({data,error})=>{if(error)throw error;await authenticate(data.session)}).catch(()=>{document.getElementById('loginError').textContent='تعذر استعادة الجلسة أو تحميل البيانات. سجّل الدخول وحاول مرة أخرى.';});
}else document.getElementById('loginError').textContent='يلزم ضبط اتصال Supabase قبل استخدام الإدارة. راجع دليل التشغيل.';
