// CedarPin Sourcing only. Private request storage; no public read endpoint.
const COUNTRIES = {"AC":"+247","AD":"+376","AE":"+971","AF":"+93","AG":"+1","AI":"+1","AL":"+355","AM":"+374","AO":"+244","AR":"+54","AS":"+1","AT":"+43","AU":"+61","AW":"+297","AX":"+358","AZ":"+994","BA":"+387","BB":"+1","BD":"+880","BE":"+32","BF":"+226","BG":"+359","BH":"+973","BI":"+257","BJ":"+229","BL":"+590","BM":"+1","BN":"+673","BO":"+591","BQ":"+599","BR":"+55","BS":"+1","BT":"+975","BW":"+267","BY":"+375","BZ":"+501","CA":"+1","CC":"+61","CD":"+243","CF":"+236","CG":"+242","CH":"+41","CI":"+225","CK":"+682","CL":"+56","CM":"+237","CN":"+86","CO":"+57","CR":"+506","CU":"+53","CV":"+238","CW":"+599","CX":"+61","CY":"+357","CZ":"+420","DE":"+49","DJ":"+253","DK":"+45","DM":"+1","DO":"+1","DZ":"+213","EC":"+593","EE":"+372","EG":"+20","EH":"+212","ER":"+291","ES":"+34","ET":"+251","FI":"+358","FJ":"+679","FK":"+500","FM":"+691","FO":"+298","FR":"+33","GA":"+241","GB":"+44","GD":"+1","GE":"+995","GF":"+594","GG":"+44","GH":"+233","GI":"+350","GL":"+299","GM":"+220","GN":"+224","GP":"+590","GQ":"+240","GR":"+30","GT":"+502","GU":"+1","GW":"+245","GY":"+592","HK":"+852","HN":"+504","HR":"+385","HT":"+509","HU":"+36","ID":"+62","IE":"+353","IM":"+44","IN":"+91","IO":"+246","IQ":"+964","IR":"+98","IS":"+354","IT":"+39","JE":"+44","JM":"+1","JO":"+962","JP":"+81","KE":"+254","KG":"+996","KH":"+855","KI":"+686","KM":"+269","KN":"+1","KP":"+850","KR":"+82","KW":"+965","KY":"+1","KZ":"+7","LA":"+856","LB":"+961","LC":"+1","LI":"+423","LK":"+94","LR":"+231","LS":"+266","LT":"+370","LU":"+352","LV":"+371","LY":"+218","MA":"+212","MC":"+377","MD":"+373","ME":"+382","MF":"+590","MG":"+261","MH":"+692","MK":"+389","ML":"+223","MM":"+95","MN":"+976","MO":"+853","MP":"+1","MQ":"+596","MR":"+222","MS":"+1","MT":"+356","MU":"+230","MV":"+960","MW":"+265","MX":"+52","MY":"+60","MZ":"+258","NA":"+264","NC":"+687","NE":"+227","NF":"+672","NG":"+234","NI":"+505","NL":"+31","NO":"+47","NP":"+977","NR":"+674","NU":"+683","NZ":"+64","OM":"+968","PA":"+507","PE":"+51","PF":"+689","PG":"+675","PH":"+63","PK":"+92","PL":"+48","PM":"+508","PR":"+1","PS":"+970","PT":"+351","PW":"+680","PY":"+595","QA":"+974","RE":"+262","RO":"+40","RS":"+381","RU":"+7","RW":"+250","SA":"+966","SB":"+677","SC":"+248","SD":"+249","SE":"+46","SG":"+65","SH":"+290","SI":"+386","SJ":"+47","SK":"+421","SL":"+232","SM":"+378","SN":"+221","SO":"+252","SR":"+597","SS":"+211","ST":"+239","SV":"+503","SX":"+1","SY":"+963","SZ":"+268","TA":"+290","TC":"+1","TD":"+235","TG":"+228","TH":"+66","TJ":"+992","TK":"+690","TL":"+670","TM":"+993","TN":"+216","TO":"+676","TR":"+90","TT":"+1","TV":"+688","TW":"+886","TZ":"+255","UA":"+380","UG":"+256","US":"+1","UY":"+598","UZ":"+998","VA":"+39","VC":"+1","VE":"+58","VG":"+1","VI":"+1","VN":"+84","VU":"+678","WF":"+681","WS":"+685","XK":"+383","YE":"+967","YT":"+262","ZA":"+27","ZM":"+260","ZW":"+263"};
const COLUMNS = ['Received (UTC)','Request ID','Status','Name','Shop / Company','Phone country','Calling code','Phone number','Destination','Quantity','Product / Link','Target price','Notes'];
function setup() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('SHEET_ID')) {
    console.log(SpreadsheetApp.openById(props.getProperty('SHEET_ID')).getUrl());
    return;
  }
  const book = SpreadsheetApp.create('CedarPin Sourcing — Requests');
  const sheet = book.getSheets()[0];
  sheet.setName('Requests');
  sheet.appendRow(COLUMNS);
  sheet.setFrozenRows(1);
  sheet.getRange(1,1,1,COLUMNS.length).setFontWeight('bold').setBackground('#075b35').setFontColor('#ffffff');
  sheet.setColumnWidths(1,COLUMNS.length,160);
  sheet.setColumnWidth(11,360);
  sheet.setColumnWidth(13,300);
  props.setProperty('SHEET_ID',book.getId());
  console.log(book.getUrl());
}
function clean(value,max,required) {
  const s=String(value || '').trim();
  if ((required && !s) || s.length > max) throw new Error('Please check the required fields and text lengths.');
  return s;
}
function validate(p) {
  if (p.website) throw new Error('Request could not be accepted.');
  const region=clean(p.phone_country,2,true);
  if (!Object.prototype.hasOwnProperty.call(COUNTRIES,region)) throw new Error('Choose a supported calling country.');
  const phone=clean(p.phone,40,true);
  if (!/^[0-9 ()-]{4,40}$/.test(phone) || !/^[0-9]{4,15}$/.test(phone.replace(/[^0-9]/g,''))) throw new Error('Enter your local phone number using digits, without the country code.');
  const id=clean(p.request_id,36,true);
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(id)) throw new Error('Reload the form and try again.');
  return [new Date().toISOString(),id,'New',clean(p.name,120,true),clean(p.company,160,false),region,COUNTRIES[region],phone,clean(p.destination,160,true),clean(p.quantity,80,true),clean(p.product,4000,true),clean(p.target_price,120,false),clean(p.notes,2000,false)];
}
function doGet() {
  return receipt('CedarPin Sourcing','Submit your product request through the CedarPin Sourcing website.');
}
function doPost(e) {
  let lock;
  try {
    const row=validate((e && e.parameter) || {});
    const sheetId=PropertiesService.getScriptProperties().getProperty('SHEET_ID');
    if (!sheetId) throw new Error('Requests are not available yet. Please try again later.');
    lock=LockService.getScriptLock();
    if (!lock.tryLock(10000)) throw new Error('The service is busy. Please retry the same request.');
    const sheet=SpreadsheetApp.openById(sheetId).getSheetByName('Requests');
    const last=sheet.getLastRow();
    const duplicate=last>1 && sheet.getRange(2,2,last-1,1).createTextFinder(row[1]).matchEntireCell(true).findNext();
    if (!duplicate) {
      const props=PropertiesService.getScriptProperties();
      const day=row[0].slice(0,10);
      const count=props.getProperty('REQUEST_DAY')===day ? Number(props.getProperty('REQUEST_COUNT') || 0) : 0;
      if (count>=500) throw new Error('The request limit has been reached. Please try again later.');
      // Apostrophe prefix prevents formulas from visitor input.
      sheet.appendRow(row.map(value => "'" + String(value)));
      SpreadsheetApp.flush();
      props.setProperties({REQUEST_DAY:day,REQUEST_COUNT:String(count+1)});
    }
    return receipt('Request saved','Your reference: '+row[1]+'. CedarPin will review your product details. This is a research request, not a purchase or payment.');
  } catch(error) {
    const message=error && error.message || '';
    const safe=/^(Please|Choose|Enter|Reload|Requests|The service|The request|Request could)/.test(message) ? message : 'We could not confirm your request was saved. Please retry using the same form.';
    return receipt('Request not confirmed',safe);
  } finally { if(lock && lock.hasLock()) lock.releaseLock(); }
}
function receipt(title,message) {
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return HtmlService.createHtmlOutput('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font:18px Arial;max-width:620px;margin:60px auto;padding:24px;color:#102128"><h1>'+escape(title)+'</h1><p>'+escape(message)+'</p><a href="https://cedarpin-sourcing.vercel.app/" target="_top">Return to CedarPin Sourcing</a></body></html>').setTitle(title);
}
