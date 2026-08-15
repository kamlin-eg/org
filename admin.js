const STORAGE_KEY="kamlin_bookings_v2";
const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];

function load(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")}catch{return []}
}
function save(items){localStorage.setItem(STORAGE_KEY,JSON.stringify(items));}
function isPest(s=""){return /مكافحة|النمل|الصراصير|بق|قوارض|حشرات|عقارب|زواحف|آفات|فلل والحدائق/.test(s)}
function esc(v=""){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function badge(status){let c=status==="مكتمل"?"done":status==="ملغي"?"cancel":"";return `<span class="badge ${c}">${esc(status||"جديد")}</span>`}
function fmtDate(v){if(!v)return "—";try{return new Intl.DateTimeFormat("ar-EG",{dateStyle:"medium"}).format(new Date(v))}catch{return v}}
function money(v){return v?new Intl.NumberFormat("ar-EG",{style:"currency",currency:"EGP",maximumFractionDigits:0}).format(Number(v)):"—"}

function render(){
  const items=load();
  q("#kpiTotal").textContent=items.length;
  q("#kpiNew").textContent=items.filter(x=>x.status==="جديد").length;
  q("#kpiPest").textContent=items.filter(x=>isPest(x.service)).length;
  q("#kpiFollow").textContent=items.filter(x=>x.followUp).length;

  q("#latestBookings").innerHTML=items.slice(0,6).map(x=>`<div class="row-card"><div><b>${esc(x.name)}</b><small>${esc(x.service)} · ${esc(x.phone)}</small></div>${badge(x.status)}</div>`).join("")||'<p class="muted">لا توجد طلبات بعد.</p>';

  const statuses=["جديد","تم التواصل","معاينة","عرض سعر","مؤكد","قيد التنفيذ","مكتمل","ملغي"];
  q("#statusSummary").innerHTML=statuses.map(s=>`<div class="status-item"><span>${s}</span><b>${items.filter(x=>x.status===s).length}</b></div>`).join("");

  renderBookings(items); renderPest(items); renderCustomers(items); renderFollowups(items); renderContracts(items);
}
function renderBookings(all){
  const term=(q("#searchInput")?.value||"").trim().toLowerCase(), sf=q("#statusFilter")?.value||"";
  const items=all.filter(x=>(!sf||x.status===sf)&&(!term||[x.name,x.phone,x.service,x.area].join(" ").toLowerCase().includes(term)));
  q("#bookingRows").innerHTML=items.map(x=>`<tr><td>${esc(x.id)}</td><td><b>${esc(x.name)}</b><br><small>${esc(x.phone)}</small></td><td>${esc(x.service)}</td><td>${esc(x.area||"—")}</td><td>${badge(x.status)}</td><td>${fmtDate(x.followUp)}</td><td><button class="action-btn" onclick="editBooking('${x.id}')">فتح</button> <button class="action-btn delete-btn" onclick="deleteBooking('${x.id}')">حذف</button></td></tr>`).join("")||'<tr><td colspan="7">لا توجد نتائج.</td></tr>';
}
function renderPest(items){
  const rows=items.filter(x=>isPest(x.service));
  q("#pestRows").innerHTML=rows.map(x=>`<tr><td>${esc(x.id)}</td><td><b>${esc(x.name)}</b><br><small>${esc(x.phone)}</small></td><td>${esc(x.service)}</td><td>${badge(x.status)}</td><td>${fmtDate(x.followUp)}</td><td>${esc(x.warranty||"—")}</td><td><button class="action-btn" onclick="editBooking('${x.id}')">فتح</button></td></tr>`).join("")||'<tr><td colspan="7">لا توجد طلبات مكافحة آفات بعد.</td></tr>';
}
function renderCustomers(items){
  const map={};
  items.forEach(x=>{const k=x.phone||x.name;if(!map[k])map[k]={name:x.name,phone:x.phone,count:0,last:x};map[k].count++;if(new Date(x.createdAt)>new Date(map[k].last.createdAt))map[k].last=x});
  q("#customerRows").innerHTML=Object.values(map).map(c=>`<tr><td>${esc(c.name)}</td><td>${esc(c.phone)}</td><td>${c.count}</td><td>${esc(c.last.service)}</td><td>${badge(c.last.status)}</td></tr>`).join("")||'<tr><td colspan="5">لا يوجد عملاء بعد.</td></tr>';
}
function renderFollowups(items){
  const rows=items.filter(x=>x.followUp||x.warranty);
  q("#followRows").innerHTML=rows.map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.service)}</td><td>${fmtDate(x.followUp)}</td><td>${esc(x.warranty||"—")}</td><td>${badge(x.status)}</td></tr>`).join("")||'<tr><td colspan="5">لا توجد متابعات مسجلة.</td></tr>';
}
function renderContracts(items){
  const rows=items.filter(x=>x.quote);
  q("#contractRows").innerHTML=rows.map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.service)}</td><td>${money(x.quote)}</td><td>${badge(x.status)}</td><td>${esc(x.id)}</td></tr>`).join("")||'<tr><td colspan="5">لا توجد قيم عروض أو عقود مسجلة.</td></tr>';
}
function switchView(id){
  qa(".view").forEach(v=>v.classList.toggle("active",v.id===id));
  qa(".nav-link[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===id));
}
qa(".nav-link[data-view]").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.view)));
q("#searchInput").addEventListener("input",()=>renderBookings(load()));
q("#statusFilter").addEventListener("change",()=>renderBookings(load()));

const dialog=q("#bookingDialog"), form=q("#editForm");
function openNewBooking(){
  form.reset(); form.elements.id.value=""; q("#dialogTitle").textContent="طلب جديد"; dialog.showModal();
}
function editBooking(id){
  const x=load().find(i=>i.id===id); if(!x)return;
  q("#dialogTitle").textContent=`تعديل ${id}`;
  ["id","name","phone","service","area","status","assignedTo","followUp","quote","warranty","notes"].forEach(k=>{if(form.elements[k])form.elements[k].value=x[k]||""});
  dialog.showModal();
}
function deleteBooking(id){
  if(!confirm("حذف الطلب نهائيًا من هذه النسخة؟"))return;
  save(load().filter(x=>x.id!==id)); render();
}
form.addEventListener("submit",e=>{
  e.preventDefault();
  const d=Object.fromEntries(new FormData(form).entries()), items=load();
  if(d.id){
    const i=items.findIndex(x=>x.id===d.id); if(i>=0)items[i]={...items[i],...d};
  }else{
    d.id="KML-"+Date.now().toString().slice(-8); d.createdAt=new Date().toISOString(); d.source="الإدارة"; items.unshift(d);
  }
  save(items); dialog.close(); render();
});
render();
