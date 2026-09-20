/* Only the public project URL and publishable key are exposed to the browser. */
const env = window.KAMLIN_ENV || {};
window.kamlinDB = env.url && env.key && window.supabase
  ? window.supabase.createClient(env.url, env.key) : null;
window.requireDB = function () {
  if (!window.kamlinDB) throw new Error('الحجز الإلكتروني غير متاح حاليًا. تواصل معنا عبر الهاتف أو واتساب لإتمام طلبك.');
  return window.kamlinDB;
};
window.normalizePhone = value => String(value).replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/[۰-۹]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/[\s()-]/g,'');
window.validPhone = value => /^\+?[0-9]{10,15}$/.test(window.normalizePhone(value));

window.KAMLIN_PRICES = {"priceRegular":"التنظيف العادي","priceDeep":"التنظيف العميق","priceConstruction":"تنظيف ما بعد التشطيب","priceVillas":"الفلل والمساحات الكبيرة","priceCompanies":"الشركات والمكاتب","priceClinics":"العيادات والمراكز الطبية","priceSofa":"تنظيف الكنب","priceMattress":"تنظيف المرتبة","priceDisinfectSmall":"شقة صغيرة","priceDisinfectMedium":"شقة متوسطة","priceDisinfectLarge":"فيلا أو مساحة كبيرة","priceAnts":"النمل والحشرات الزاحفة","priceCockroaches":"الصراصير","priceFlying":"الحشرات الطائرة","priceRodents":"القوارض","priceBedbugs":"بق الفراش","priceEconomic":"الاقتصادية","priceComplete":"الشاملة","priceShine":"اللمعان","priceRoyal":"الملكية","priceMonthly4":"4 زيارات","priceMonthly8":"8 زيارات","priceMonthly12":"12 زيارة"};
