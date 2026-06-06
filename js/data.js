/* ============================================================
   data.js — all static game data
   三國 · 群雄逐鹿 (190 AD)
   ============================================================ */

/* ---------------- 五行 FIVE-ELEMENT HERO CLASSES ---------------- */
const HERO_CLASSES = {
  commander: { zh:'帥', el:'土', elTh:'ดิน', th:'แม่ทัพใหญ่',  en:'Commander', color:'var(--el-earth)', cls:'el-earth',
    desc:'ผู้นำที่เพิ่มขวัญกำลังใจทั้งกองทัพ และบริหารเมืองให้ราษฎรพอใจ', troop:'spear', troopTh:'ทหารราบหอก' },
  champion:  { zh:'猛', el:'木', elTh:'ไม้', th:'ยอดนักรบ',   en:'Champion',  color:'var(--el-wood)',  cls:'el-wood',
    desc:'นักรบแนวหน้าพลังชีวิตสูง เก่งการท้าดวล และเพิ่มเสบียงให้เมือง', troop:'guard', troopTh:'ทหารดาบโล่' },
  vanguard:  { zh:'銳', el:'火', elTh:'ไฟ', th:'ทัพหน้า',    en:'Vanguard',  color:'var(--el-fire)',  cls:'el-fire',
    desc:'แม่ทัพสายลุยพลังโจมตีรุนแรง นำทหารม้าพุ่งทะลวงทัพศัตรู', troop:'cavalry', troopTh:'ทหารม้า' },
  sentinel:  { zh:'衛', el:'金', elTh:'ทอง', th:'ผู้พิทักษ์',  en:'Sentinel',  color:'var(--el-metal)', cls:'el-metal',
    desc:'ขุนพลสายตั้งรับ หลบหลีกสูง ถึกทน เหมาะเฝ้าเมืองและยื้อแนวรบ', troop:'halberd', troopTh:'ทหารง้าว' },
  strategist:{ zh:'謀', el:'水', elTh:'น้ำ', th:'กุนซือ',     en:'Strategist',color:'var(--el-water)', cls:'el-water',
    desc:'สมองเพชรปลดล็อกแผนการรบ (ซุ่มโจมตี/ธนูไฟ) และเพิ่มกระสุนพลธนู', troop:'archer', troopTh:'พลธนู' }
};

/* ---------------- FACTIONS ---------------- */
const FACTIONS = {
  player:   { zh:'主公', th:'ก๊กของท่าน', color:'#c9a24a', isPlayer:true },
  cao_cao:  { zh:'曹',  th:'โจโฉ',       leader:'曹操 โจโฉ',     color:'#3060a8', capital:'P03' },
  liu_bei:  { zh:'劉',  th:'เล่าปี่',     leader:'劉備 เล่าปี่',   color:'#3f9d5a', capital:'P05' },
  sun_jian: { zh:'孫',  th:'ซุนเกี๋ยน',   leader:'孫堅 ซุนเกี๋ยน', color:'#c0392b', capital:'P04' },
  yuan_shao:{ zh:'袁',  th:'อ้วนเสี้ยว',  leader:'袁紹 อ้วนเสี้ยว',color:'#c9a83c', capital:'P08' },
  dong_zhuo:{ zh:'董',  th:'ตั๋งโต๊ะ',     leader:'董卓 ตั๋งโต๊ะ',  color:'#6b2d8a', capital:'P02' },
  ma_teng:  { zh:'馬',  th:'ม้าเท้ง',      leader:'馬騰 ม้าเท้ง',   color:'#d3691b', capital:'P13' },
  gongsun:  { zh:'公孫',th:'กงซุนจ้าน',    leader:'公孫瓚 กงซุนจ้าน',color:'#5d7d8a', capital:'P09' },
  liu_biao: { zh:'劉表',th:'เล่าเปียว',    leader:'劉表 เล่าเปียว',  color:'#7a9b3c', capital:'P06' },
  yuan_shu: { zh:'袁術',th:'อ้วนสุด',      leader:'袁術 อ้วนสุด',    color:'#9c7a2c', capital:'P10' },
  liu_zhang:{ zh:'劉焉',th:'เล่าเอี๋ยน',   leader:'劉焉 เล่าเอี๋ยน', color:'#3c8a8a', capital:'P05' },
  tao_qian: { zh:'陶',  th:'โตเกี๋ยม',     leader:'陶謙 โตเกี๋ยม',   color:'#c0577e', capital:'P07' },
  han_fu:   { zh:'韓',  th:'หันฮก',        leader:'韓馥 หันฮก',     color:'#8c4a3a', capital:'P35' },
  shi_xie:  { zh:'士',  th:'สื้อเซี่ย',     leader:'士燮 สื้อเซี่ย',  color:'#138d75', capital:'P68' },
  liu_chong:{ zh:'陳',  th:'เล่าฉง',       leader:'劉寵 เล่าฉง',    color:'#9e2b35', capital:'P40' }
};
const FACTION_KEYS = Object.keys(FACTIONS).filter(k => k !== 'player');

/* ---------------- STARTING REGION & HOLDINGS (ใช้แสดงในหน้าจอเลือกขุนศึก) ---------------- */
const FACTION_START = {
  cao_cao:  { region:'yan',  cities:['P23','P45'],      note:'ยกธงต้านตั๋งโต๊ะที่ตันลิ่ว มีกุนซือและขุนพลตระกูลโจ–แฮหัวล้นหลาม' },
  liu_bei:  { region:'qing', cities:['P37'],            note:'พึ่งใบบุญกงซุนจ้านที่ผิงหยวน เริ่มจากเมืองเดียวกับสามทหารเสือ' },
  sun_jian: { region:'jing', cities:['P20'],            note:'เจ้าเมืองเตียงสา ยกทัพพยัคฆ์กังตั๋งสมทบพันธมิตรปราบตั๋งโต๊ะ' },
  yuan_shao:{ region:'ji',   cities:['P36','P08'],      note:'เจ้าเมืองปัวไฮ ผู้นำพันธมิตร 18 ก๊ก ฐานอำนาจตระกูลอ้วนสี่ชั่วคน' },
  dong_zhuo:{ region:'sili', cities:['P02','P01'],      note:'กุมองค์ฮ่องเต้ที่ลกเอี๋ยง–เตียงอัน มีลิโป้เทพสงครามอยู่ในมือ' },
  ma_teng:  { region:'liang',cities:['P13','P28'],      note:'ขุนศึกชายแดนตะวันตก กองม้าเหล็กซีเหลียงเลื่องชื่อ' },
  gongsun:  { region:'you',  cities:['P09'],            note:'ขุนพลม้าขาวแห่งแดนเหนือ แกร่งแต่โดดเดี่ยวไกลศูนย์กลาง' },
  liu_biao: { region:'jing', cities:['P06','P52'],      note:'เจ้าเกงจิ๋วผู้มั่งคั่ง ดินแดนกว้างใหญ่อุดมสมบูรณ์' },
  yuan_shu: { region:'jing', cities:['P18','P44'],      note:'ครองลำหยง–ยื่อหนาน ฐานตระกูลอ้วนสายใต้ ใฝ่ตั้งตนเป็นฮ่องเต้' },
  liu_zhang:{ region:'yi',   cities:['P05','P48','P55'],note:'เล่าเอี๋ยนปลีกเอ๊กจิ๋วตั้งตนอิสระ ภูมิประเทศเสฉวนป้องกันแน่นหนา' },
  tao_qian: { region:'xu',   cities:['P07','P41','P42'],note:'เจ้าชีจิ๋วผู้สูงวัย แผ่นดินมั่งคั่งพลเมืองหนาแน่น' },
  han_fu:   { region:'ji',   cities:['P35'],            note:'เจ้ามณฑลกิจิ๋ว คลังเสบียงล้นแต่กำลังรบอ่อน ถูกอ้วนเสี้ยวจ้องชิง' },
  shi_xie:  { region:'jiao', cities:['P68','P69','P70','P72'], note:'ตระกูลสื้อครองเจียวจิ๋วกึ่งอิสระ มั่งคั่งจากการค้าทางทะเล พี่น้องคุมหัวเมืองทักษิณ' },
  liu_chong:{ region:'yu',   cities:['P40'],            note:'ตันอ๋องเชื้อพระวงศ์ฮั่น พลธนูหน้าไม้ฝีมือเยี่ยม ตรึงเมืองเฉินต้านโพกผ้าเหลือง แต่โดดเดี่ยวกลางที่ราบ' }
};

/* ============================================================
   WARLORD GOALS — เป้าหมาย/โจทย์ประจำก๊ก (แต่ละก๊กให้ประสบการณ์ต่างกัน)
   - intro : สถานการณ์เริ่มต้นเฉพาะก๊ก (แสดงครั้งเดียวตอนเปิดเกม)
   - trait : จุดเด่น–จุดอ่อนประจำก๊ก
   - goal  : โจทย์รอง { title, desc, target(G)→{cur,need}, reward(G)→string }
             เมื่อทำสำเร็จจะได้รางวัลครั้งเดียว
   provNum(G) = จำนวนหัวเมืองของผู้เล่น
   ============================================================ */
function _pn(){ return (typeof factionProvinces==='function') ? factionProvinces('player').length : 0; }
function _own(k){ return G.owner && G.owner[k]==='player'; }
function _grantGold(n){ G.treasury.player += n; }
function _grantLoyAll(d){ (typeof factionProvinces==='function'?factionProvinces('player'):[]).forEach(k=>{ G.loyalty[k]=Math.max(0,Math.min(100,(G.loyalty[k]||50)+d)); }); }
function _boostLord(stat,n){ const l=G.generals.find(g=>g.faction==='player'&&g.lord); if(l){ l[stat]=Math.min(100,(l[stat]||60)+n); return l; } return null; }

const WARLORD_GOALS = {
  cao_cao: {
    intro:'ท่านยกธงต้านตั๋งโต๊ะ ณ ตันลิ่ว มีกุนซือและขุนพลตระกูลโจ–แฮหัวล้นหลาม แต่กลางแผ่นดินเต็มไปด้วยขุนศึกแย่งชิง ผู้ใดกุมองค์ฮ่องเต้ก่อนย่อมได้เปรียบทั้งปวง',
    trait:'จุดเด่น: ขุนพล–กุนซือมากฝีมือ บริหารคลังเก่ง · จุดอ่อน: อยู่กลางวงล้อมศัตรูรอบด้าน',
    goal:{ title:'อ้างพระบรมราชโองการบัญชาแผ่นดิน', zh:'挾天子以令諸侯',
      desc:'ยึดลกเอี๋ยงหรือเตียงอัน แล้วกุมองค์ฮ่องเต้ไว้ในกำมือ',
      target:(G)=>({cur:(_own('P01')||_own('P02'))?1:0, need:1}),
      check:(G)=> (typeof playerHoldsEmperor==='function' ? playerHoldsEmperor() : false) || _own('P01') || _own('P02'),
      reward:(G)=>{ _grantGold(150); _grantLoyAll(8); return 'ท่านกุมองค์ฮ่องเต้ไว้ได้ อาจอ้างพระบรมราชโองการบัญชาขุนศึกทั้งปวง บารมีแผ่ไพศาล (+150 คลัง · +ขวัญราษฎรทั่วก๊ก)'; } }
  },
  liu_bei: {
    intro:'ท่านเริ่มต้นด้วยเมืองเดียวพึ่งใบบุญกงซุนจ้าน เคียงข้างสามทหารเสือผู้ร่วมสาบาน ณ สวนท้อ ปณิธานของท่านคือฟื้นฟูราชวงศ์ฮั่นจากแผ่นดินอันน้อยนิด',
    trait:'จุดเด่น: คุณธรรมซื้อใจราษฎร มีกวนอู–เตียวหุย–จูล่ง · จุดอ่อน: เริ่มต้นเล็กและยากจน',
    goal:{ title:'ปณิธานสวนท้อ ตั้งฐานบารมี', zh:'桃園之志',
      desc:'แผ่บารมีจากเมืองเดียวให้ครองครบ 6 หัวเมือง',
      target:(G)=>({cur:_pn(), need:6}),
      check:(G)=> _pn()>=6,
      reward:(G)=>{ _grantLoyAll(12); _grantGold(80); return 'กิตติศัพท์คุณธรรมของท่านเลื่องลือ ราษฎรแห่แหนมาสวามิภักดิ์ ฐานบารมีมั่นคงขึ้น (+ขวัญราษฎรมากทั่วก๊ก · +80 คลัง)'; } }
  },
  sun_jian: {
    intro:'ท่านคือพยัคฆ์แห่งกังตั๋ง เจ้าเมืองเตียงสา ยกทัพเรือสมทบพันธมิตรปราบตั๋งโต๊ะ กองทัพของท่านบุกทะลวงดุดัน หมายปักธงครองแดนใต้ลุ่มน้ำแยงซี',
    trait:'จุดเด่น: กองทัพบุกแกร่ง เชี่ยวยุทธนาวี · จุดอ่อน: ขุนศึกใต้แย่งชิงกันเอง',
    goal:{ title:'พยัคฆ์ครองกังตั๋ง', zh:'虎踞江東',
      desc:'ยึดครองหัวเมืองลุ่มน้ำแยงซีให้ครบ 6 เมือง',
      target:(G)=>({cur:_pn(), need:6}),
      check:(G)=> _pn()>=6,
      reward:(G)=>{ _grantGold(120); _boostLord('war',3); return 'ธงพยัคฆ์ปักเหนือกังตั๋ง กองทัพเรือเกรียงไกรไร้ผู้ต้านทาน (+120 คลัง · บู๊ผู้นำเพิ่มขึ้น)'; } }
  },
  yuan_shao: {
    intro:'ท่านคือผู้นำพันธมิตร 18 ก๊ก เจ้าตระกูลอ้วนสี่ชั่วคนผู้ทรงอิทธิพลภาคเหนือ เริ่มเกมด้วยเสบียงและทองมหาศาล แผ่นดินเหนือสี่มณฑลคือสิ่งที่ท่านหมายครอง',
    trait:'จุดเด่น: ทรัพย์–กำลังมหาศาล ฐานอำนาจมั่นคง · จุดอ่อน: ลังเลตัดสินใจ ขุนนางแตกคอ',
    goal:{ title:'รวมแผ่นดินเหนือสี่มณฑล', zh:'總攬河北',
      desc:'ครอบครองหัวเมืองภาคเหนือให้ครบ 9 เมือง',
      target:(G)=>({cur:_pn(), need:9}),
      check:(G)=> _pn()>=9,
      reward:(G)=>{ _grantGold(200); return 'แผ่นดินเหนือทั้งสี่มณฑลตกอยู่ในกำมือ ตระกูลอ้วนรุ่งเรืองสุดขีด (+200 คลัง)'; } }
  },
  dong_zhuo: {
    intro:'ท่านคือทรชนผู้กุมองค์ฮ่องเต้ ณ ลกเอี๋ยง–เตียงอัน มีลิโป้เทพสงครามอยู่ในมือ แต่ขุนศึกทั่วหล้าต่างชิงชังตั้งพันธมิตรมาปราบ ท่านต้องอยู่รอดท่ามกลางความแค้นของคนทั้งแผ่นดิน',
    trait:'จุดเด่น: กุมฮ่องเต้ มีลิโป้ไร้พ่าย · จุดอ่อน: ทุกก๊กเป็นศัตรู ลิโป้ภักดีต่ำ',
    goal:{ title:'ทรราชครองหล้า', zh:'暴主臨朝',
      desc:'ยืนหยัดกุมอำนาจให้ถึงศักราช ค.ศ. 195 โดยไม่ล่มสลาย',
      target:(G)=>({cur:Math.min(G.year,195), need:195}),
      check:(G)=> G.year>=195 && _pn()>0,
      reward:(G)=>{ _grantGold(150); _grantLoyAll(6); return 'แม้ทั้งแผ่นดินจ้องทำลาย ท่านก็ยังยืนหยัดกุมอำนาจไว้ได้ ความน่าเกรงขามแผ่ปกคลุม (+150 คลัง · +ขวัญ)'; } }
  },
  ma_teng: {
    intro:'ท่านคือขุนศึกชายแดนตะวันตก ผู้นำกองม้าเหล็กซีเหลียงอันเลื่องชื่อ ดินแดนของท่านห่างไกลศูนย์กลาง หมายกรีฑาทัพม้าบุกเข้ายึดเตียงอันคืนสู่ราชสำนัก',
    trait:'จุดเด่น: ทหารม้าเหล็กทรงพลัง · จุดอ่อน: ห่างไกล เสบียงจำกัด',
    goal:{ title:'ทัพม้าเหล็กบุกเตียงอัน', zh:'鐵騎入關',
      desc:'กรีฑาทัพม้าเข้ายึดเมืองเตียงอัน (長安)',
      target:(G)=>({cur:_own('P02')?1:0, need:1}),
      check:(G)=> _own('P02'),
      reward:(G)=>{ _grantGold(130); _boostLord('war',4); return 'ทัพม้าเหล็กซีเหลียงทะลวงเข้าเตียงอันสำเร็จ ชื่อกระฉ่อนทั่วแดนตะวันตก (+130 คลัง · บู๊ผู้นำเพิ่ม)'; } }
  },
  gongsun: {
    intro:'ท่านคือขุนพลม้าขาวแห่งแดนเหนือ แกร่งกล้าแต่โดดเดี่ยวไกลศูนย์กลางอำนาจ ต้องฝ่าทั้งอนารยชนเหนือและอ้วนเสี้ยวเพื่อแผ่อำนาจลงใต้',
    trait:'จุดเด่น: ทหารม้าขาวเกรียงไกร · จุดอ่อน: โดดเดี่ยว ถูกขนาบสองด้าน',
    goal:{ title:'ทหารม้าขาวแผ่อำนาจ', zh:'白馬揚威',
      desc:'แผ่อำนาจจากแดนเหนือให้ครองครบ 5 หัวเมือง',
      target:(G)=>({cur:_pn(), need:5}),
      check:(G)=> _pn()>=5,
      reward:(G)=>{ _grantGold(110); _boostLord('war',3); return 'กองทหารม้าขาวควบทะยานแผ่อำนาจลงใต้ แดนเหนือสะท้านเกรง (+110 คลัง · บู๊ผู้นำเพิ่ม)'; } }
  },
  liu_biao: {
    intro:'ท่านคือเจ้าเกงจิ๋วผู้มั่งคั่ง ดินแดนกว้างใหญ่อุดมสมบูรณ์กลางลุ่มน้ำ ท่านต้องผดุงเกงจิ๋วให้รุ่งเรืองและมั่นคงท่ามกลางก๊กที่จ้องฮุบดินแดนอันอุดมนี้',
    trait:'จุดเด่น: มั่งคั่ง ดินแดนกว้าง · จุดอ่อน: ตั้งรับ ไร้ทายาทเข้มแข็ง',
    goal:{ title:'ผดุงเกงจิ๋วให้รุ่งเรือง', zh:'坐鎮荊州',
      desc:'ครอบครองหัวเมืองให้ครบ 7 เมือง พร้อมคลังหลวงมั่งคั่ง 400',
      target:(G)=>({cur:_pn(), need:7}),
      check:(G)=> _pn()>=7 && G.treasury.player>=400,
      reward:(G)=>{ _grantLoyAll(10); return 'เกงจิ๋วภายใต้การปกครองของท่านรุ่งเรืองเป็นปึกแผ่น ราษฎรอยู่เย็นเป็นสุข (+ขวัญราษฎรมากทั่วก๊ก)'; } }
  },
  yuan_shu: {
    intro:'ท่านคือเจ้าตระกูลอ้วนสายใต้ ครองลำหยง–ยื่อหนาน ความทะเยอทะยานของท่านสูงเสียดฟ้า ใฝ่ฝันจะได้ตราหยกแล้วสถาปนาตนขึ้นเป็นฮ่องเต้',
    trait:'จุดเด่น: ฐานตระกูลใหญ่ ทะเยอทะยาน · จุดอ่อน: อหังการ เสียพันธมิตรง่าย',
    goal:{ title:'สถาปนาราชวงศ์จ้ง', zh:'僭號稱帝',
      desc:'ครอบครองตราลัญจกรหยก พร้อมครองครบ 6 หัวเมือง',
      target:(G)=>({cur:((typeof playerHasTreasure==='function'&&playerHasTreasure('jade_seal'))?1:0)+(_pn()>=6?1:0), need:2}),
      check:(G)=> (typeof playerHasTreasure==='function' && playerHasTreasure('jade_seal')) && _pn()>=6,
      reward:(G)=>{ _grantGold(180); _grantLoyAll(-4); return 'ท่านได้ตราหยกแล้วสถาปนาตนเป็นฮ่องเต้ราชวงศ์จ้ง! เกียรติยศสูงสุด—แต่ขุนศึกทั่วหล้าจ้องปราบ (+180 คลัง · ราษฎรบางส่วนหวั่นเกรง)'; } }
  },
  liu_zhang: {
    intro:'ท่านสืบทอดเอ๊กจิ๋วจากเล่าเอี๋ยน ปิดด่านเสฉวนตั้งตนเป็นอิสระ ภูมิประเทศขุนเขาป้องกันแน่นหนา ท่านต้องตรึงเสฉวนให้มั่นคงพ้นเงื้อมมือผู้รุกราน',
    trait:'จุดเด่น: ด่านเสฉวนป้องกันแน่น เสบียงสมบูรณ์ · จุดอ่อน: ผู้นำอ่อนแอ ขุนนางคิดกบฏ',
    goal:{ title:'ปิดด่านเสฉวนมั่นคง', zh:'坐守益州',
      desc:'ครอบครองหัวเมืองเอ๊กจิ๋วให้ครบ 6 เมือง',
      target:(G)=>({cur:_pn(), need:6}),
      check:(G)=> _pn()>=6,
      reward:(G)=>{ _grantGold(140); _grantLoyAll(6); return 'เสฉวนภายใต้ด่านขุนเขาตรึงมั่นไร้ผู้รุกล้ำ บ้านเมืองสงบมั่งคั่ง (+140 คลัง · +ขวัญ)'; } }
  },
  tao_qian: {
    intro:'ท่านคือเจ้าชีจิ๋วผู้สูงวัย แผ่นดินมั่งคั่งพลเมืองหนาแน่น ทว่าโจโฉจ้องล้างแค้นบิดาจะยกทัพมาในไม่ช้า ท่านต้องรักษาชีจิ๋วให้รอดพ้นเงื้อมมือทรชน',
    trait:'จุดเด่น: แผ่นดินมั่งคั่ง พลเมืองมาก · จุดอ่อน: ชราภาพ ตกเป็นเป้าแค้นโจโฉ',
    goal:{ title:'รักษาชีจิ๋วให้รอดพ้นภัย', zh:'保境徐州',
      desc:'ยืนหยัดครองเมืองแหฺ่ผีไว้จนถึงศักราช ค.ศ. 196',
      target:(G)=>({cur:Math.min(G.year,196), need:196}),
      check:(G)=> G.year>=196 && _own('P07'),
      reward:(G)=>{ _grantGold(120); _grantLoyAll(8); return 'ท่านรักษาชีจิ๋วให้รอดพ้นจากทรชนมาได้ ราษฎรซาบซึ้งในพระคุณ (+120 คลัง · +ขวัญราษฎร)'; } }
  },
  han_fu: {
    intro:'ท่านคือเจ้ามณฑลกิจิ๋ว คลังเสบียงล้นเหลือแต่กำลังรบอ่อนแอ อ้วนเสี้ยวจ้องชิงดินแดนของท่านตั้งแต่ต้นเกม ท่านต้องพลิกชะตามิให้ถูกกลืนดังในประวัติศาสตร์',
    trait:'จุดเด่น: คลังเสบียงมหาศาล · จุดอ่อน: กำลังรบอ่อน ขุนพลน้อย ถูกอ้วนเสี้ยวจ้อง',
    goal:{ title:'พลิกชะตากิจิ๋ว', zh:'力保冀州',
      desc:'ยืนหยัดไม่ถูกกลืนจนถึงศักราช ค.ศ. 194 และครองครบ 3 เมือง',
      target:(G)=>({cur:Math.min(G.year,194), need:194}),
      check:(G)=> G.year>=194 && _pn()>=3,
      reward:(G)=>{ _grantGold(160); _boostLord('war',4); return 'ท่านพลิกชะตาหนีเงื้อมมืออ้วนเสี้ยว รักษากิจิ๋วไว้ได้เหนือประวัติศาสตร์ (+160 คลัง · บู๊ผู้นำเพิ่ม)'; } }
  },
  shi_xie: {
    intro:'ท่านคือเจ้าตระกูลสื้อแห่งเจียวจิ๋ว เจ้าสมุทรทักษิณผู้มั่งคั่งจากการค้าทางทะเล ปลอดภัยไกลศึกกลาง แต่การจะแผ่อำนาจขึ้นเหนือนั้นยากนัก',
    trait:'จุดเด่น: มั่งคั่งจากการค้า ปลอดภัยห่างศึก · จุดอ่อน: ห่างไกล ขยายอำนาจยาก',
    goal:{ title:'เจ้าสมุทรทักษิณ', zh:'雄長交州',
      desc:'ครองเจียวจิ๋วแล้วสะสมคลังหลวงให้ถึง 500 ตำลึงทอง',
      target:(G)=>({cur:Math.min(G.treasury.player,500), need:500}),
      check:(G)=> G.treasury.player>=500 && _pn()>=5,
      reward:(G)=>{ _grantLoyAll(8); return 'การค้าทางทะเลของท่านรุ่งเรือง เจียวจิ๋วกลายเป็นขุมทรัพย์แห่งทักษิณ (+ขวัญราษฎรทั่วก๊ก)'; } }
  },
  liu_chong: {
    intro:'ท่านคือตันอ๋องเชื้อพระวงศ์ฮั่น พลธนูหน้าไม้ฝีมือเยี่ยม ตรึงเมืองเฉินต้านโพกผ้าเหลืองไว้ได้ แต่โดดเดี่ยวกลางที่ราบ ถูกอ้วนสุดจ้องชิง ท่านต้องผดุงเชื้อสายฮั่นให้ยืนยง',
    trait:'จุดเด่น: พลธนูหน้าไม้ทรงพลัง เชื้อพระวงศ์ · จุดอ่อน: โดดเดี่ยวกลางที่ราบ',
    goal:{ title:'ตันอ๋องผดุงฮั่น', zh:'宗室守土',
      desc:'แผ่อำนาจจากเมืองเฉินให้ครองครบ 4 หัวเมือง',
      target:(G)=>({cur:_pn(), need:4}),
      check:(G)=> _pn()>=4,
      reward:(G)=>{ _grantGold(120); _grantLoyAll(8); return 'ท่านผดุงเชื้อสายราชวงศ์ฮั่นให้ยืนหยัด แผ่อำนาจมั่นคงกลางที่ราบ (+120 คลัง · +ขวัญราษฎร)'; } }
  },
  _default: {
    intro:'ท่านลุกขึ้นกรีฑาทัพในยุคแผ่นดินแตกเป็นเสี่ยง ขุนศึกทั่วหล้าต่างชิงชัย ท่านต้องสร้างฐานบารมีจากศูนย์สู่การรวมแผ่นดินใต้หล้า',
    trait:'จุดเด่น: กำหนดวิถีของท่านเอง · จุดอ่อน: ไร้ฐานอำนาจตั้งต้น',
    goal:{ title:'สร้างฐานบารมีใต้หล้า', zh:'逐鹿中原',
      desc:'แผ่อำนาจให้ครองครบ 6 หัวเมือง',
      target:(G)=>({cur:_pn(), need:6}),
      check:(G)=> _pn()>=6,
      reward:(G)=>{ _grantGold(120); _grantLoyAll(8); return 'ท่านสร้างฐานบารมีอันมั่นคงขึ้นจากศูนย์ ชื่อเสียงเริ่มกระฉ่อนทั่วแผ่นดิน (+120 คลัง · +ขวัญ)'; } }
  }
};
function warlordGoal(){ return (WARLORD_GOALS[G.baseWarlord]) || WARLORD_GOALS._default; }

/* ---------------- PROVINCES (grid map laid out as China) ---------------- */
const PROVINCES = {
  'P13': { name: '西涼 ซีเหลียง', size: 'medium', r:1, c:1, baseWealth:25, baseTroops:35, def:55 },
  'P26': { name: '金城 กิมเสีย',  size: 'small',  r:1, c:3, baseWealth:20, baseTroops:20, def:50 },
  'P14': { name: '晉陽 จิ้นหยาง', size: 'small',  r:1, c:4, baseWealth:25, baseTroops:25, def:55 },
  'P15': { name: '薊縣 จี้เสี้ยน', size: 'medium', r:1, c:6, baseWealth:30, baseTroops:25, def:50 },
  'P09': { name: '北平 ปักเป๋ง',  size: 'small',  r:1, c:8, baseWealth:30, baseTroops:35, def:50 },
  'P25': { name: '襄平 เซียงผิง', size: 'small',  r:1, c:10, baseWealth:25, baseTroops:25, def:55 },
  'P28': { name: '武威 อู่เวย',   size: 'small',  r:2, c:1, baseWealth:22, baseTroops:20, def:45 },
  'P29': { name: '張掖 จางเย่',   size: 'small',  r:2, c:2, baseWealth:20, baseTroops:18, def:45 },
  'P08': { name: '鄴城 เย่เฉิง',  size: 'large',  r:2, c:4, baseWealth:55, baseTroops:55, def:70 },
  'P16': { name: '北海 ปักไฮ',    size: 'medium', r:2, c:7, baseWealth:35, baseTroops:25, def:45 },
  'P30': { name: '代郡 ไต้กุ๋น',   size: 'small',  r:2, c:6, baseWealth:24, baseTroops:22, def:50 },
  'P31': { name: '遼東 เหลียวตง', size: 'small',  r:2, c:9, baseWealth:26, baseTroops:30, def:60 },
  'P32': { name: '安定 อันเต็ง',  size: 'small',  r:3, c:2, baseWealth:22, baseTroops:20, def:50 },
  'P33': { name: '上郡 ซ่างกุ๋น',  size: 'small',  r:3, c:4, baseWealth:20, baseTroops:20, def:45 },
  'P34': { name: '平陽 ผิงหยาง',  size: 'small',  r:3, c:5, baseWealth:28, baseTroops:24, def:50 },
  'P35': { name: '信都 สินตู',    size: 'small',  r:3, c:6, baseWealth:30, baseTroops:25, def:45 },
  'P36': { name: '南皮 น่ำพี',    size: 'medium', r:3, c:8, baseWealth:40, baseTroops:35, def:55 },
  'P37': { name: '平原 ผิงหยวน',  size: 'small',  r:3, c:9, baseWealth:32, baseTroops:25, def:45 },
  'P12': { name: '天水 เทียนสุ่ย', size: 'small',  r:4, c:1, baseWealth:25, baseTroops:25, def:55 },
  'P02': { name: '長安 เตียงอัน', size: 'large',  r:4, c:2, baseWealth:50, baseTroops:60, def:80 },
  'P01': { name: '洛陽 ลกเอี๋ยง', size: 'large',  r:4, c:4, baseWealth:60, baseTroops:70, def:85 },
  'P17': { name: '濮陽 พกเอี๋ยง', size: 'small',  r:4, c:7, baseWealth:35, baseTroops:30, def:50 },
  'P38': { name: '臨淄 หลินจือ',  size: 'medium', r:4, c:9, baseWealth:42, baseTroops:35, def:55 },
  'P39': { name: '琅邪 ลังเย่',   size: 'small',  r:4, c:10, baseWealth:30, baseTroops:22, def:45 },
  'P40': { name: '陳郡 เฉินกุ๋น',  size: 'small',  r:5, c:4, baseWealth:32, baseTroops:25, def:45 },
  'P23': { name: '陳留 ตันลิ่ว',  size: 'medium', r:5, c:5, baseWealth:40, baseTroops:35, def:50 },
  'P03': { name: '許昌 ฮูโต๋',    size: 'medium', r:5, c:6, baseWealth:45, baseTroops:45, def:65 },
  'P07': { name: '下邳 แห้ฝือ',   size: 'medium', r:5, c:8, baseWealth:35, baseTroops:35, def:50 },
  'P41': { name: '彭城 เผิงเฉิง', size: 'small',  r:5, c:9, baseWealth:36, baseTroops:28, def:50 },
  'P42': { name: '東海 ตงไห่',    size: 'small',  r:5, c:10, baseWealth:34, baseTroops:24, def:45 },
  'P11': { name: '漢中 ฮันต๋ง',   size: 'medium', r:6, c:2, baseWealth:35, baseTroops:30, def:65 },
  'P43': { name: '上庸 ซ่างยง',   size: 'small',  r:6, c:3, baseWealth:24, baseTroops:18, def:50 },
  'P24': { name: '新野 ซินเอี๋ย', size: 'small',  r:6, c:5, baseWealth:20, baseTroops:15, def:40 },
  'P18': { name: '宛城 อ้วนเซีย', size: 'small',  r:6, c:6, baseWealth:30, baseTroops:25, def:45 },
  'P44': { name: '汝南 ยื่อหนาน', size: 'medium', r:6, c:7, baseWealth:38, baseTroops:30, def:50 },
  'P45': { name: '譙郡 เฉียวกุ๋น', size: 'small',  r:6, c:8, baseWealth:35, baseTroops:25, def:45 },
  'P46': { name: '廣陵 กวางหลิง', size: 'small',  r:6, c:10, baseWealth:32, baseTroops:26, def:45 },
  'P48': { name: '梓潼 จื่อถง',   size: 'small',  r:7, c:1, baseWealth:28, baseTroops:22, def:55 },
  'P49': { name: '巴西 ปาซี',     size: 'small',  r:7, c:2, baseWealth:26, baseTroops:20, def:50 },
  'P06': { name: '襄陽 เซียงหยาง', size: 'large', r:7, c:4, baseWealth:45, baseTroops:40, def:60 },
  'P50': { name: '樊城 ฟานเฉิง',  size: 'small',  r:7, c:5, baseWealth:30, baseTroops:25, def:55 },
  'P10': { name: '壽春 โซ่วชุน',  size: 'medium', r:7, c:7, baseWealth:40, baseTroops:35, def:55 },
  'P51': { name: '廬江 หลูเจียง', size: 'small',  r:7, c:8, baseWealth:34, baseTroops:25, def:45 },
  'P05': { name: '成都 เฉิงตู',   size: 'large',  r:8, c:1, baseWealth:50, baseTroops:45, def:75 },
  'P27': { name: '巴郡 ปากุ๋น',   size: 'small',  r:8, c:2, baseWealth:30, baseTroops:20, def:55 },
  'P52': { name: '江夏 กังแฮ',    size: 'medium', r:8, c:5, baseWealth:36, baseTroops:30, def:50 },
  'P53': { name: '濡須 ยวี๋ซี',   size: 'small',  r:8, c:7, baseWealth:28, baseTroops:24, def:60 },
  'P04': { name: '建業 เกี๋ยนเงียบ', size:'large', r:8, c:8, baseWealth:50, baseTroops:50, def:70 },
  'P54': { name: '吳興 อู๋ซิง',   size: 'small',  r:8, c:10, baseWealth:30, baseTroops:22, def:45 },
  'P55': { name: '犍為 เจียนเวย', size: 'small',  r:9, c:1, baseWealth:24, baseTroops:18, def:45 },
  'P56': { name: '永安 หย่งอัน',  size: 'small',  r:9, c:3, baseWealth:28, baseTroops:25, def:60 },
  'P19': { name: '江陵 กังเหลง',  size: 'medium', r:9, c:4, baseWealth:35, baseTroops:30, def:50 },
  'P22': { name: '柴桑 ชายซาง',   size: 'small',  r:9, c:6, baseWealth:30, baseTroops:25, def:45 },
  'P21': { name: '吳郡 อู๋จวิ้น',  size: 'medium', r:9, c:9, baseWealth:35, baseTroops:30, def:45 },
  'P57': { name: '會稽 ห้อยเข',   size: 'medium', r:9, c:10, baseWealth:38, baseTroops:28, def:50 },
  'P58': { name: '越巂 เยว่ซี',   size: 'small',  r:10, c:1, baseWealth:18, baseTroops:15, def:45 },
  'P59': { name: '牂牁 ซางกอ',    size: 'small',  r:10, c:2, baseWealth:16, baseTroops:14, def:40 },
  'P60': { name: '武陵 บูเหลง',   size: 'small',  r:10, c:4, baseWealth:26, baseTroops:20, def:45 },
  'P20': { name: '長沙 ฉางซา',    size: 'medium', r:10, c:5, baseWealth:35, baseTroops:25, def:45 },
  'P61': { name: '豫章 ยี่เจียง', size: 'medium', r:10, c:7, baseWealth:32, baseTroops:24, def:45 },
  'P62': { name: '丹陽 ตันหยาง',  size: 'small',  r:10, c:8, baseWealth:30, baseTroops:22, def:45 },
  'P63': { name: '建寧 เจี้ยนหนิง', size:'small',  r:11, c:1, baseWealth:20, baseTroops:18, def:50 },
  'P64': { name: '零陵 เลงเหลง',  size: 'small',  r:11, c:4, baseWealth:25, baseTroops:20, def:45 },
  'P65': { name: '桂陽 กุ้ยหยาง', size: 'small',  r:11, c:5, baseWealth:24, baseTroops:18, def:45 },
  'P66': { name: '廬陵 หลูหลิง',  size: 'small',  r:11, c:7, baseWealth:22, baseTroops:16, def:40 },
  'P67': { name: '臨賀 หลินเฮ่อ',  size: 'small',  r:11, c:8, baseWealth:20, baseTroops:15, def:40 },
  'P68': { name: '交趾 เจียวจื่อ', size: 'small',  r:12, c:3, baseWealth:25, baseTroops:20, def:50 },
  'P69': { name: '合浦 เหอผู่',   size: 'small',  r:12, c:5, baseWealth:20, baseTroops:15, def:40 },
  'P70': { name: '南海 น่ำไฮ',    size: 'small',  r:12, c:7, baseWealth:26, baseTroops:18, def:45 },
  'P71': { name: '建安 เจี้ยนอัน', size: 'small',  r:12, c:9, baseWealth:22, baseTroops:16, def:45 },
  'P72': { name: '九真 จิ่วเจิน',  size: 'small',  r:13, c:3, baseWealth:15, baseTroops:12, def:40 },
  'P73': { name: '日南 ยื่อหนานใต้', size:'small', r:13, c:4, baseWealth:12, baseTroops:10, def:40 }
};

/* ---------------- 州 REGIONS (historical zhou — map overlay labels) ---------------- */
/* x,y in the 0-100 × 0-103 map viewBox; th = Thai (Sam Kok) reading */
const REGIONS = {
  liang: { zh:'涼州', th:'เลียงจิ๋ว', en:'Liangzhou', x:21, y:15 },
  sili:  { zh:'司隸', th:'ซีลี่',     en:'Sili',       x:45, y:33 },
  bing:  { zh:'并州', th:'เป๊งจิ๋ว',  en:'Bingzhou',   x:49, y:24 },
  ji:    { zh:'冀州', th:'กิจิ๋ว',    en:'Jizhou',     x:62, y:25 },
  you:   { zh:'幽州', th:'อิ้วจิ๋ว',  en:'Youzhou',    x:76, y:8  },
  qing:  { zh:'青州', th:'เฉงจิ๋ว',   en:'Qingzhou',   x:82, y:32 },
  yan:   { zh:'兗州', th:'เอี้ยนจิ๋ว',en:'Yanzhou',    x:63, y:38 },
  xu:    { zh:'徐州', th:'ชีจิ๋ว',    en:'Xuzhou',     x:73, y:41 },
  yu:    { zh:'豫州', th:'อี่จิ๋ว',   en:'Yuzhou',     x:57, y:46 },
  yi:    { zh:'益州', th:'เอ๊กจิ๋ว',  en:'Yizhou',     x:34, y:53 },
  jing:  { zh:'荊州', th:'เกงจิ๋ว',   en:'Jingzhou',   x:54, y:59 },
  yang:  { zh:'揚州', th:'เอียงจิ๋ว', en:'Yangzhou',   x:75, y:56 },
  jiao:  { zh:'交州', th:'เจียวจิ๋ว', en:'Jiaozhou',   x:49, y:81 }
};

/* ---------------- ENGLISH / PINYIN city names ---------------- */
const PROVINCE_EN = {
  P13:'Xiliang', P26:'Jincheng', P14:'Jinyang', P15:'Jixian', P09:'Beiping', P25:'Xiangping',
  P28:'Wuwei', P29:'Zhangye', P08:'Yecheng', P16:'Beihai', P30:'Daijun', P31:'Liaodong',
  P32:'Anding', P33:'Shangjun', P34:'Pingyang', P35:'Xindu', P36:'Nanpi', P37:'Pingyuan',
  P12:'Tianshui', P02:"Chang'an", P01:'Luoyang', P17:'Puyang', P38:'Linzi', P39:'Langye',
  P40:'Chenjun', P23:'Chenliu', P03:'Xuchang', P07:'Xiapi', P41:'Pengcheng', P42:'Donghai',
  P11:'Hanzhong', P43:'Shangyong', P24:'Xinye', P18:'Wancheng', P44:'Runan', P45:'Qiaojun',
  P46:'Guangling', P48:'Zitong', P49:'Baxi', P06:'Xiangyang', P50:'Fancheng', P10:'Shouchun',
  P51:'Lujiang', P05:'Chengdu', P27:'Bajun', P52:'Jiangxia', P53:'Ruxu', P04:'Jianye',
  P54:'Wuxing', P55:'Qianwei', P56:"Yong'an", P19:'Jiangling', P22:'Chaisang', P21:'Wujun',
  P57:'Kuaiji', P58:'Yuesui', P59:'Zangke', P60:'Wuling', P20:'Changsha', P61:'Yuzhang',
  P62:'Danyang', P63:'Jianning', P64:'Lingling', P65:'Guiyang', P66:'Luling', P67:'Linhe',
  P68:'Jiaozhi', P69:'Hepu', P70:'Nanhai', P71:"Jian'an", P72:'Jiuzhen', P73:'Rinan'
};

const ADJACENCY = {
  'P13':['P12','P26','P28'], 'P26':['P13','P28','P29'], 'P14':['P01','P02','P08','P30','P33','P34'],
  'P15':['P08','P09','P30','P35','P36'], 'P09':['P15','P16','P25','P31','P36','P37'], 'P25':['P09','P31'],
  'P28':['P13','P26','P29','P32'], 'P29':['P26','P28','P32'], 'P08':['P14','P15','P17','P23','P34','P35'],
  'P16':['P07','P09','P17','P37','P38'], 'P30':['P14','P15'], 'P31':['P09','P25'],
  'P32':['P28','P29','P12','P02','P33'], 'P33':['P32','P14','P02','P34'], 'P34':['P33','P14','P08','P35','P01'],
  'P35':['P34','P08','P15','P36'], 'P36':['P35','P15','P09','P37'], 'P37':['P36','P09','P16','P17','P38'],
  'P12':['P02','P13','P32'], 'P02':['P01','P11','P12','P14','P24','P32','P33'],
  'P01':['P02','P03','P06','P08','P14','P18','P23','P34','P40'], 'P17':['P03','P07','P08','P16','P23','P37','P38','P45'],
  'P38':['P16','P37','P17','P39','P41'], 'P39':['P38','P09','P07','P42'],
  'P40':['P01','P23','P03','P18','P24','P44'], 'P23':['P01','P03','P08','P17','P40','P45'],
  'P03':['P01','P06','P07','P10','P17','P18','P23','P40','P44','P45'], 'P07':['P03','P10','P16','P17','P39','P41','P42','P46'],
  'P41':['P07','P38','P42','P45','P46'], 'P42':['P39','P07','P41','P46'],
  'P11':['P02','P05','P24','P27','P43','P48','P49'], 'P43':['P11','P24','P18','P06','P49','P50'],
  'P24':['P02','P11','P18','P40','P43','P06','P50'], 'P18':['P01','P03','P06','P24','P40','P43','P44'],
  'P44':['P18','P03','P40','P45','P10','P51'], 'P45':['P23','P17','P03','P44','P41','P07'],
  'P46':['P07','P41','P42','P10','P53'], 'P48':['P11','P49','P05'],
  'P49':['P11','P43','P48','P27','P56'], 'P06':['P01','P03','P18','P19','P43','P24','P50','P52'],
  'P50':['P06','P24','P43'], 'P10':['P03','P04','P07','P22','P44','P46','P51','P53'],
  'P51':['P44','P10','P52','P22','P61'], 'P05':['P11','P27','P48','P55','P58'],
  'P27':['P05','P11','P49','P56','P55','P59'], 'P52':['P06','P51','P19','P22','P60','P61'],
  'P53':['P10','P46','P04','P62'], 'P04':['P10','P21','P22','P53','P54','P62'],
  'P54':['P04','P21','P57','P62'], 'P55':['P05','P27','P56','P58','P59','P63'],
  'P56':['P49','P27','P55','P19'], 'P19':['P06','P20','P22','P56','P52','P60'],
  'P22':['P04','P19','P20','P10','P51','P52','P61'], 'P21':['P04','P54','P57'],
  'P57':['P21','P54','P62','P71'], 'P58':['P05','P55','P59','P63'],
  'P59':['P27','P55','P58','P63','P60','P64'], 'P60':['P19','P52','P59','P20','P64'],
  'P20':['P19','P22','P60','P61','P64','P65','P67'], 'P61':['P51','P52','P22','P20','P62','P66'],
  'P62':['P53','P04','P54','P57','P61','P66'], 'P63':['P55','P58','P59','P68'],
  'P64':['P59','P60','P20','P65','P69'], 'P65':['P20','P64','P66','P67','P69','P70'],
  'P66':['P61','P62','P65','P67','P70','P71'], 'P67':['P20','P65','P66','P70'],
  'P68':['P63','P69','P72'], 'P69':['P64','P65','P68','P70','P72'],
  'P70':['P65','P66','P67','P69','P71'], 'P71':['P57','P66','P70'],
  'P72':['P68','P69','P73'], 'P73':['P72']
};

const TERRAINS = {
  'T01':{name:'河', th:'ฮวงโห', type:'river', r:2, c:2}, 'T02':{name:'河', th:'ฮวงโห', type:'river', r:3, c:3},
  'T03':{name:'河', th:'ฮวงโห', type:'river', r:2, c:8}, 'T04':{name:'河', th:'ฮวงโห', type:'river', r:4, c:3},
  'T05':{name:'河', th:'ฮวงโห', type:'river', r:4, c:5}, 'T06':{name:'江', th:'แยงซี', type:'river', r:8, c:3},
  'T07':{name:'江', th:'แยงซี', type:'river', r:8, c:4}, 'T08':{name:'江', th:'แยงซี', type:'river', r:8, c:6},
  'T09':{name:'江', th:'แยงซี', type:'river', r:8, c:9}, 'T10':{name:'江', th:'แยงซี', type:'river', r:7, c:10},
  'T11':{name:'山', th:'กิสาน', type:'mountain', r:3, c:1}, 'T12':{name:'山', th:'ไท่หาง', type:'mountain', r:1, c:2},
  'T13':{name:'山', th:'ไท่หาง', type:'mountain', r:2, c:11}, 'T14':{name:'山', th:'จงหนาน', type:'mountain', r:5, c:1},
  'T15':{name:'山', th:'อู๋ซาน', type:'mountain', r:8, c:11}
};

/* ---------------- GENERAL ROSTER ----------------
   class ∈ commander|champion|vanguard|sentinel|strategist
   stats: war / int / pol / cha (0-100), hp scaled by class
*/
const GENERAL_ROSTER = [
  // CAO CAO
  { key:'g_caocao', zh:'曹操', th:'โจโฉ', short:'โจโฉ', faction:'cao_cao', cls:'commander', war:78, int:91, pol:96, cha:96, lord:true, prov:'P23' },
  { key:'g_xiahoudun', zh:'夏侯惇', th:'แฮหัวตุ้น', short:'แฮหัวตุ้น', faction:'cao_cao', cls:'vanguard', war:90, int:62, pol:68, cha:80, prov:'P23' },
  { key:'g_xunyu', zh:'荀彧', th:'ซุนฮก', short:'ซุนฮก', faction:'cao_cao', cls:'strategist', war:35, int:96, pol:94, cha:88, prov:'P23' },
  { key:'g_dianwei', zh:'典韋', th:'เตียนอุย', short:'เตียนอุย', faction:'cao_cao', cls:'champion', war:95, int:42, pol:30, cha:72, prov:'P23' },
  { key:'g_xiahouyuan', zh:'夏侯淵', th:'แฮหัวเอี๋ยน', short:'แฮหัวเอี๋ยน', faction:'cao_cao', cls:'vanguard', war:91, int:64, pol:55, cha:74, prov:'P45' },
  // LIU BEI
  { key:'g_liubei', zh:'劉備', th:'เล่าปี่', short:'เล่าปี่', faction:'liu_bei', cls:'commander', war:73, int:78, pol:80, cha:99, lord:true, prov:'P37' },
  { key:'g_guanyu', zh:'關羽', th:'กวนอู', short:'กวนอู', faction:'liu_bei', cls:'champion', war:97, int:75, pol:62, cha:94, prov:'P37' },
  { key:'g_zhangfei', zh:'張飛', th:'เตียวหุย', short:'เตียวหุย', faction:'liu_bei', cls:'vanguard', war:96, int:44, pol:30, cha:60, prov:'P37' },
  { key:'g_zhaoyun', zh:'趙雲', th:'จูล่ง', short:'จูล่ง', faction:'liu_bei', cls:'vanguard', war:95, int:76, pol:65, cha:88, prov:'P37' },
  // SUN JIAN
  { key:'g_sunjian', zh:'孫堅', th:'ซุนเกี๋ยน', short:'ซุนเกี๋ยน', faction:'sun_jian', cls:'vanguard', war:91, int:72, pol:70, cha:85, lord:true, prov:'P20' },
  { key:'g_sunce', zh:'孫策', th:'ซุนเซ็ก', short:'ซุนเซ็ก', faction:'sun_jian', cls:'champion', war:92, int:70, pol:72, cha:90, parents:['g_sunjian','g_wufuren'], prov:'P20' },
  { key:'g_chengpu', zh:'程普', th:'เทียเภา', short:'เทียเภา', faction:'sun_jian', cls:'sentinel', war:82, int:70, pol:74, cha:78, prov:'P20' },
  { key:'g_huanggai', zh:'黃蓋', th:'อึ้งกาย', short:'อึ้งกาย', faction:'sun_jian', cls:'sentinel', war:83, int:66, pol:70, cha:75, prov:'P20' },
  // YUAN SHAO
  { key:'g_yuanshao', zh:'袁紹', th:'อ้วนเสี้ยว', short:'อ้วนเสี้ยว', faction:'yuan_shao', cls:'commander', war:70, int:75, pol:80, cha:90, lord:true, prov:'P36' },
  { key:'g_yanliang', zh:'顏良', th:'งันเหลียง', short:'งันเหลียง', faction:'yuan_shao', cls:'champion', war:92, int:38, pol:32, cha:60, prov:'P36' },
  { key:'g_wenchou', zh:'文醜', th:'บุนทิว', short:'บุนทิว', faction:'yuan_shao', cls:'champion', war:91, int:36, pol:30, cha:58, prov:'P36' },
  { key:'g_jutshou', zh:'沮授', th:'จูจ้อ', short:'จูจ้อ', faction:'yuan_shao', cls:'strategist', war:40, int:92, pol:88, cha:80, prov:'P08' },
  // DONG ZHUO
  { key:'g_dongzhuo', zh:'董卓', th:'ตั๋งโต๊ะ', short:'ตั๋งโต๊ะ', faction:'dong_zhuo', cls:'commander', war:82, int:64, pol:42, cha:38, lord:true, prov:'P02' },
  { key:'g_lubu', zh:'呂布', th:'ลิโป้', short:'ลิโป้', faction:'dong_zhuo', cls:'vanguard', war:100, int:38, pol:26, cha:55, parents:['g_dongzhuo'], prov:'P02' },
  { key:'g_huaxiong', zh:'華雄', th:'ฮัวหยง', short:'ฮัวหยง', faction:'dong_zhuo', cls:'champion', war:88, int:40, pol:34, cha:50, prov:'P01' },
  { key:'g_ligu', zh:'李儒', th:'หลีฉี', short:'หลีฉี', faction:'dong_zhuo', cls:'strategist', war:30, int:90, pol:78, cha:40, prov:'P02' },
  // MA TENG
  { key:'g_mateng', zh:'馬騰', th:'ม้าเท้ง', short:'ม้าเท้ง', faction:'ma_teng', cls:'vanguard', war:88, int:62, pol:66, cha:82, lord:true, prov:'P13' },
  { key:'g_machao', zh:'馬超', th:'ม้าเฉียว', short:'ม้าเฉียว', faction:'ma_teng', cls:'vanguard', war:97, int:54, pol:48, cha:80, parents:['g_mateng','g_matengwife'], prov:'P13' },
  { key:'g_pangde', zh:'龐德', th:'บังเต๊ก', short:'บังเต๊ก', faction:'ma_teng', cls:'champion', war:90, int:64, pol:52, cha:74, prov:'P28' },
  // GONGSUN ZAN
  { key:'g_gongsun', zh:'公孫瓚', th:'กงซุนจ้าน', short:'กงซุนจ้าน', faction:'gongsun', cls:'vanguard', war:85, int:60, pol:58, cha:72, lord:true, prov:'P09' },
  { key:'g_zhaoyun2', zh:'嚴綱', th:'เงียมกัง', short:'เงียมกัง', faction:'gongsun', cls:'sentinel', war:78, int:50, pol:48, cha:60, prov:'P09' },
  // LIU BIAO
  { key:'g_liubiao', zh:'劉表', th:'เล่าเปียว', short:'เล่าเปียว', faction:'liu_biao', cls:'commander', war:58, int:74, pol:84, cha:80, lord:true, prov:'P06' },
  { key:'g_huangzu', zh:'黃祖', th:'อึ้งจอ', short:'อึ้งจอ', faction:'liu_biao', cls:'sentinel', war:74, int:54, pol:56, cha:58, prov:'P52' },
  { key:'g_caimao', zh:'蔡瑁', th:'ชัวมอ', short:'ชัวมอ', faction:'liu_biao', cls:'sentinel', war:70, int:66, pol:70, cha:55, prov:'P06' },
  // YUAN SHU
  { key:'g_yuanshu', zh:'袁術', th:'อ้วนสุด', short:'อ้วนสุด', faction:'yuan_shu', cls:'commander', war:58, int:60, pol:62, cha:64, lord:true, prov:'P18' },
  { key:'g_jiling', zh:'紀靈', th:'กิเหลง', short:'กิเหลง', faction:'yuan_shu', cls:'champion', war:85, int:52, pol:48, cha:62, prov:'P18' },
  // LIU ZHANG
  { key:'g_liuzhang', zh:'劉璋', th:'เล่าเจี้ยง', short:'เล่าเจี้ยง', faction:'liu_zhang', cls:'commander', war:42, int:58, pol:70, cha:66, parents:['g_liuyan','g_liuyanwife'], prov:'P05' },
  // FREE AGENTS (recruitable wanderers)
  { key:'g_zhugeliang', zh:'諸葛亮', th:'ขงเบ้ง', short:'ขงเบ้ง', faction:'neutral', cls:'strategist', war:38, int:100, pol:98, cha:92, prov:'P24' },
  { key:'g_zhouyu', zh:'周瑜', th:'จิวยี่', short:'จิวยี่', faction:'neutral', cls:'strategist', war:71, int:96, pol:86, cha:90, prov:'P22' },
  { key:'g_taishici', zh:'太史慈', th:'ไทสูจู้', short:'ไทสูจู้', faction:'neutral', cls:'champion', war:90, int:64, pol:55, cha:78, prov:'P16' },
  { key:'g_huatuo', zh:'華佗', th:'ฮัวโต๋', short:'ฮัวโต๋', faction:'neutral', cls:'strategist', war:20, int:88, pol:70, cha:80, prov:'P44' },

  // ============================================================
  //  ลูกน้อง / ขุนพลระดับล่าง (minor & mid-rank retainers, 190 AD)
  // ============================================================
  // --- CAO CAO retinue ---
  { key:'g_caoren', zh:'曹仁', th:'โจหยิน', short:'โจหยิน', faction:'cao_cao', cls:'sentinel', war:86, int:68, pol:66, cha:72, prov:'P45' },
  { key:'g_caohong', zh:'曹洪', th:'โจหอง', short:'โจหอง', faction:'cao_cao', cls:'vanguard', war:80, int:50, pol:52, cha:60, prov:'P23' },
  { key:'g_yuejin', zh:'樂進', th:'งักจิ้น', short:'งักจิ้น', faction:'cao_cao', cls:'champion', war:84, int:54, pol:48, cha:58, prov:'P23' },
  { key:'g_lidian', zh:'李典', th:'หลีเตียน', short:'หลีเตียน', faction:'cao_cao', cls:'sentinel', war:79, int:72, pol:66, cha:70, prov:'P23' },
  { key:'g_yujin', zh:'于禁', th:'หิกิ๋ม', short:'หิกิ๋ม', faction:'cao_cao', cls:'sentinel', war:82, int:60, pol:62, cha:62, prov:'P45' },
  { key:'g_xunyou', zh:'荀攸', th:'ซุนฮิว', short:'ซุนฮิว', faction:'cao_cao', cls:'strategist', war:34, int:94, pol:86, cha:80, prov:'P23' },
  // --- LIU BEI retinue ---
  { key:'g_mizhu', zh:'糜竺', th:'บิต๊ก', short:'บิต๊ก', faction:'liu_bei', cls:'strategist', war:22, int:68, pol:84, cha:80, prov:'P37' },
  { key:'g_sunqian', zh:'孫乾', th:'ซุนเขียน', short:'ซุนเขียน', faction:'liu_bei', cls:'strategist', war:26, int:70, pol:76, cha:78, prov:'P37' },
  { key:'g_jianyong', zh:'簡雍', th:'กั๋นหยง', short:'กั๋นหยง', faction:'liu_bei', cls:'strategist', war:28, int:68, pol:74, cha:82, prov:'P37' },
  // --- SUN JIAN retinue ---
  { key:'g_handang', zh:'韓當', th:'หันต๋ง', short:'หันต๋ง', faction:'sun_jian', cls:'sentinel', war:82, int:54, pol:50, cha:62, prov:'P20' },
  { key:'g_zumao', zh:'祖茂', th:'จอเม่า', short:'จอเม่า', faction:'sun_jian', cls:'champion', war:80, int:50, pol:44, cha:58, prov:'P20' },
  { key:'g_zhuzhi', zh:'朱治', th:'จูตี', short:'จูตี', faction:'sun_jian', cls:'sentinel', war:76, int:64, pol:66, cha:66, prov:'P20' },
  // --- YUAN SHAO retinue ---
  { key:'g_zhanghe', zh:'張郃', th:'เตียวคับ', short:'เตียวคับ', faction:'yuan_shao', cls:'vanguard', war:90, int:72, pol:60, cha:72, prov:'P08' },
  { key:'g_tianfeng', zh:'田豐', th:'เตียนฮอง', short:'เตียนฮอง', faction:'yuan_shao', cls:'strategist', war:30, int:93, pol:84, cha:66, prov:'P36' },
  { key:'g_shenpei', zh:'審配', th:'ซิมเพ้', short:'ซิมเพ้', faction:'yuan_shao', cls:'strategist', war:44, int:86, pol:82, cha:64, prov:'P08' },
  { key:'g_gaolan', zh:'高覽', th:'โกหลำ', short:'โกหลำ', faction:'yuan_shao', cls:'champion', war:84, int:50, pol:46, cha:56, prov:'P36' },
  // --- DONG ZHUO retinue ---
  { key:'g_xurong', zh:'徐榮', th:'ชีหยง', short:'ชีหยง', faction:'dong_zhuo', cls:'vanguard', war:85, int:70, pol:56, cha:60, prov:'P01' },
  { key:'g_lijue', zh:'李傕', th:'ลิฉุย', short:'ลิฉุย', faction:'dong_zhuo', cls:'vanguard', war:84, int:58, pol:44, cha:48, prov:'P02' },
  { key:'g_guosi', zh:'郭汜', th:'ก๊วยกี', short:'ก๊วยกี', faction:'dong_zhuo', cls:'champion', war:82, int:50, pol:40, cha:44, prov:'P02' },
  // --- MA TENG retinue ---
  { key:'g_hansui', zh:'韓遂', th:'หันซุย', short:'หันซุย', faction:'ma_teng', cls:'vanguard', war:82, int:74, pol:70, cha:76, prov:'P28' },
  { key:'g_madai', zh:'馬岱', th:'ม้าต้าย', short:'ม้าต้าย', faction:'ma_teng', cls:'vanguard', war:82, int:58, pol:52, cha:66, prov:'P13' },
  // --- GONGSUN ZAN retinue ---
  { key:'g_gongsunyue', zh:'公孫越', th:'กงซุนอวด', short:'กงซุนอวด', faction:'gongsun', cls:'champion', war:76, int:52, pol:50, cha:60, prov:'P09' },
  { key:'g_tiankai', zh:'田楷', th:'เตียนไค', short:'เตียนไค', faction:'gongsun', cls:'sentinel', war:72, int:56, pol:58, cha:58, prov:'P09' },
  // --- LIU BIAO retinue ---
  { key:'g_wenpin', zh:'文聘', th:'บุนเพ่ง', short:'บุนเพ่ง', faction:'liu_biao', cls:'sentinel', war:84, int:66, pol:64, cha:70, prov:'P06' },
  { key:'g_zhangyun', zh:'張允', th:'เตียวอุ๋น', short:'เตียวอุ๋น', faction:'liu_biao', cls:'sentinel', war:66, int:58, pol:56, cha:52, prov:'P06' },
  // --- YUAN SHU retinue ---
  { key:'g_zhangxun', zh:'張勳', th:'เตียวฮุน', short:'เตียวฮุน', faction:'yuan_shu', cls:'sentinel', war:74, int:54, pol:52, cha:56, prov:'P18' },
  { key:'g_qiaorui', zh:'橋蕤', th:'เกียวยุ้ย', short:'เกียวยุ้ย', faction:'yuan_shu', cls:'champion', war:76, int:48, pol:44, cha:52, prov:'P44' },
  // --- LIU ZHANG retinue ---
  { key:'g_zhangren', zh:'張任', th:'เตียวยิม', short:'เตียวยิม', faction:'liu_zhang', cls:'vanguard', war:85, int:70, pol:62, cha:70, prov:'P05' },
  { key:'g_yanyan', zh:'嚴顏', th:'งิ้มหัน', short:'งิ้มหัน', faction:'liu_zhang', cls:'sentinel', war:83, int:64, pol:60, cha:72, prov:'P48' },
  { key:'g_huangquan', zh:'黃權', th:'อึ้งกวน', short:'อึ้งกวน', faction:'liu_zhang', cls:'strategist', war:40, int:84, pol:80, cha:70, prov:'P05' },
  // --- FREE-AGENT WANDERERS (recruitable) ---
  { key:'g_ganning', zh:'甘寧', th:'กำเหลง', short:'กำเหลง', faction:'neutral', cls:'champion', war:90, int:64, pol:52, cha:74, prov:'P52' },
  { key:'g_zhangliao', zh:'張遼', th:'เตียวเลี้ยว', short:'เตียวเลี้ยว', faction:'neutral', cls:'vanguard', war:92, int:70, pol:58, cha:76, prov:'P14' },
  { key:'g_xuhuang', zh:'徐晃', th:'ชีหอง', short:'ชีหอง', faction:'neutral', cls:'vanguard', war:89, int:70, pol:58, cha:70, prov:'P01' },
  { key:'g_xushu', zh:'徐庶', th:'ชีซี', short:'ชีซี', faction:'neutral', cls:'strategist', war:46, int:90, pol:80, cha:78, prov:'P24' },
  { key:'g_pangtong', zh:'龐統', th:'บังทอง', short:'บังทอง', faction:'neutral', cls:'strategist', war:38, int:95, pol:82, cha:70, prov:'P06' },
  { key:'g_chengong', zh:'陳宮', th:'ตันเก็ง', short:'ตันเก็ง', faction:'neutral', cls:'strategist', war:40, int:88, pol:80, cha:74, prov:'P17' },
  // --- NEXT-GENERATION HEIRS (เด็ก — เติบโตแล้วออกศึกได้) ---
  { key:'g_sunquan', zh:'孫權', th:'ซุนกวน', short:'ซุนกวน', faction:'sun_jian', cls:'commander', war:68, int:80, pol:88, cha:90, parents:['g_sunjian','g_wufuren'], prov:'P20' },
  { key:'g_guanping', zh:'關平', th:'กวนเป๋ง', short:'กวนเป๋ง', faction:'liu_bei', cls:'vanguard', war:84, int:58, pol:52, cha:70, prov:'P37' },

  // ---- LADIES (สตรี) — marriageable, can bear the next generation ----
  { key:'g_lubian', zh:'卞夫人', th:'นางเปียน', short:'นางเปียน', faction:'cao_cao', cls:'strategist', war:24, int:72, pol:80, cha:88, sex:'f', prov:'P23' },
  { key:'g_ganfuren', zh:'甘夫人', th:'นางกำ', short:'นางกำ', faction:'liu_bei', cls:'strategist', war:20, int:64, pol:70, cha:86, sex:'f', prov:'P37' },
  { key:'g_sunshangxiang', zh:'孫尚香', th:'ซุนซางเซียง', short:'ซุนซางเซียง', faction:'sun_jian', cls:'champion', war:78, int:66, pol:60, cha:90, sex:'f', parents:['g_sunjian','g_wufuren'], prov:'P20' },
  { key:'g_zhenji', zh:'甄姬', th:'นางเจินจี', short:'นางเจินจี', faction:'yuan_shao', cls:'strategist', war:22, int:74, pol:72, cha:95, sex:'f', prov:'P36' },
  { key:'g_diaochan', zh:'貂蟬', th:'เตียวเสียน', short:'เตียวเสียน', faction:'neutral', cls:'strategist', war:30, int:84, pol:70, cha:100, sex:'f', prov:'P02' },
  { key:'g_xiaoqiao', zh:'小喬', th:'เซียวเกี้ยว', short:'เซียวเกี้ยว', faction:'neutral', cls:'strategist', war:18, int:70, pol:66, cha:96, sex:'f', prov:'P22' },
  { key:'g_daqiao', zh:'大喬', th:'ต้าเกี้ยว', short:'ต้าเกี้ยว', faction:'neutral', cls:'strategist', war:18, int:70, pol:66, cha:95, sex:'f', prov:'P20' },
  { key:'g_huangyueying', zh:'黃月英', th:'อึ้งง้วยเอ๋ง', short:'อึ้งง้วยเอ๋ง', faction:'neutral', cls:'strategist', war:26, int:95, pol:82, cha:70, sex:'f', prov:'P24' },
  { key:'g_wufuren', zh:'吳夫人', th:'นางง่อ', short:'นางง่อ', faction:'sun_jian', cls:'strategist', war:24, int:76, pol:82, cha:86, sex:'f', consortOf:'sun_jian', prov:'P20' },
  { key:'g_mifuren', zh:'糜夫人', th:'นางบิ', short:'นางบิ', faction:'liu_bei', cls:'strategist', war:22, int:62, pol:68, cha:88, sex:'f', prov:'P37' },
  { key:'g_caiwenji', zh:'蔡文姬', th:'ชัวเหวินจี', short:'ชัวเหวินจี', faction:'neutral', cls:'strategist', war:18, int:92, pol:78, cha:90, sex:'f', prov:'P02' },
  { key:'g_wangyi', zh:'王異', th:'อองอี้', short:'อองอี้', faction:'neutral', cls:'champion', war:80, int:78, pol:66, cha:78, sex:'f', prov:'P13' },
  // --- additional marriageable / wandering ladies (สตรีโสด) ---
  { key:'g_zhaoe', zh:'趙娥', th:'จูง้อ', short:'จูง้อ', faction:'neutral', cls:'champion', war:72, int:60, pol:55, cha:74, sex:'f', prov:'P28' },
  { key:'g_bulianshi', zh:'步練師', th:'โป้วเลี่ยนซือ', short:'โป้วเลี่ยนซือ', faction:'neutral', cls:'strategist', war:18, int:70, pol:70, cha:92, sex:'f', prov:'P21' },
  { key:'g_dufuren', zh:'杜氏', th:'นางตู้', short:'นางตู้', faction:'neutral', cls:'strategist', war:18, int:64, pol:66, cha:90, sex:'f', prov:'P07' },
  { key:'g_yinfuren', zh:'尹氏', th:'นางอิ๋น', short:'นางอิ๋น', faction:'neutral', cls:'strategist', war:18, int:66, pol:70, cha:86, sex:'f', prov:'P03' },
  { key:'g_fanfuren', zh:'樊氏', th:'นางฟาน', short:'นางฟาน', faction:'neutral', cls:'strategist', war:20, int:72, pol:68, cha:88, sex:'f', prov:'P65' },
  // --- lord-consorts (ภรรยาเจ้าก๊ก — สมรสแล้ว ห้ามไปสู่ขอ) ---
  { key:'g_dingfuren', zh:'丁夫人', th:'นางเตง', short:'นางเตง', faction:'cao_cao', cls:'strategist', war:16, int:68, pol:70, cha:80, sex:'f', consortOf:'cao_cao', prov:'P23' },
  { key:'g_caifuren', zh:'蔡夫人', th:'นางชัว', short:'นางชัว', faction:'liu_biao', cls:'strategist', war:18, int:70, pol:74, cha:78, sex:'f', consortOf:'liu_biao', prov:'P06' },

  // ============================================================
  //  NEW PLAYABLE LORDS & THEIR RETINUE (ก๊กที่เพิ่มให้เลือกเล่นได้)
  // ============================================================
  // --- TAO QIAN 陶 · เจ้าชีจิ๋ว (Xu province) ---
  { key:'g_taoqian', zh:'陶謙', th:'โตเกี๋ยม', short:'โตเกี๋ยม', faction:'tao_qian', cls:'commander', war:55, int:66, pol:74, cha:70, lord:true, prov:'P07' },
  { key:'g_caobao', zh:'曹豹', th:'โจป้าว', short:'โจป้าว', faction:'tao_qian', cls:'vanguard', war:76, int:48, pol:50, cha:55, prov:'P07' },
  { key:'g_chendeng', zh:'陳登', th:'ตันเต๋ง', short:'ตันเต๋ง', faction:'tao_qian', cls:'strategist', war:42, int:86, pol:84, cha:78, prov:'P07' },
  { key:'g_chengui', zh:'陳珪', th:'ตันกุย', short:'ตันกุย', faction:'tao_qian', cls:'strategist', war:30, int:82, pol:80, cha:74, prov:'P41' },
  { key:'g_taofuren', zh:'陶夫人', th:'นางโต', short:'นางโต', faction:'tao_qian', cls:'strategist', war:18, int:64, pol:66, cha:74, sex:'f', consortOf:'tao_qian', prov:'P07' },
  { key:'g_taoshang', zh:'陶商', th:'โตซง', short:'โตซง', faction:'tao_qian', cls:'sentinel', war:50, int:58, pol:60, cha:58, parents:['g_taoqian','g_taofuren'], prov:'P07' },
  { key:'g_taoying', zh:'陶應', th:'โตอิ้ง', short:'โตอิ้ง', faction:'tao_qian', cls:'sentinel', war:52, int:60, pol:58, cha:56, parents:['g_taoqian','g_taofuren'], prov:'P07' },
  // --- HAN FU 韓 · เจ้ามณฑลกิจิ๋ว (Ji province) ---
  { key:'g_hanfu', zh:'韓馥', th:'หันฮก', short:'หันฮก', faction:'han_fu', cls:'commander', war:38, int:60, pol:70, cha:52, lord:true, prov:'P35' },
  { key:'g_quyi', zh:'麴義', th:'เก็กหงี', short:'เก็กหงี', faction:'han_fu', cls:'vanguard', war:86, int:66, pol:48, cha:58, prov:'P35' },
  { key:'g_panfeng', zh:'潘鳳', th:'พัวฮอง', short:'พัวฮอง', faction:'han_fu', cls:'champion', war:72, int:34, pol:36, cha:48, prov:'P35' },
  { key:'g_gengwu', zh:'耿武', th:'เกงบู๊', short:'เกงบู๊', faction:'han_fu', cls:'sentinel', war:64, int:62, pol:66, cha:60, prov:'P35' },
  { key:'g_hanfuwife', zh:'韓夫人', th:'นางหัน', short:'นางหัน', faction:'han_fu', cls:'strategist', war:16, int:62, pol:64, cha:70, sex:'f', consortOf:'han_fu', prov:'P35' },
  { key:'g_hanjie', zh:'韓傑', th:'หันเกียด', short:'หันเกียด', faction:'han_fu', cls:'sentinel', war:55, int:58, pol:56, cha:54, parents:['g_hanfu','g_hanfuwife'], prov:'P35' },
  // --- 士 SHI XIE · เจ้าเจียวจิ๋ว (Jiao province · ตระกูลสื้อแห่งแดนใต้) ---
  { key:'g_shixie', zh:'士燮', th:'สื้อเซี่ย', short:'สื้อเซี่ย', faction:'shi_xie', cls:'commander', war:48, int:86, pol:94, cha:88, lord:true, prov:'P68' },
  { key:'g_shiyi', zh:'士壹', th:'สื้ออี๋', short:'สื้ออี๋', faction:'shi_xie', cls:'sentinel', war:64, int:68, pol:74, cha:66, prov:'P69' },
  { key:'g_shiwei', zh:'士佞', th:'สื้ออุ๋ย', short:'สื้ออุ๋ย', faction:'shi_xie', cls:'sentinel', war:62, int:62, pol:68, cha:62, prov:'P72' },
  { key:'g_shiwu', zh:'士武', th:'สื้ออู่', short:'สื้ออู่', faction:'shi_xie', cls:'vanguard', war:72, int:56, pol:60, cha:64, prov:'P70' },
  { key:'g_shixiewife', zh:'士夫人', th:'นางสื้อ', short:'นางสื้อ', faction:'shi_xie', cls:'strategist', war:16, int:70, pol:74, cha:80, sex:'f', consortOf:'shi_xie', prov:'P68' },
  { key:'g_shihui', zh:'士徽', th:'สื้อฮุย', short:'สื้อฮุย', faction:'shi_xie', cls:'vanguard', war:66, int:58, pol:56, cha:62, parents:['g_shixie','g_shixiewife'], prov:'P68' },
  // --- 陳 LIU CHONG · ตันอ๋องเล่าฉง เจ้าเมืองเฉิน (Yu province · พลธนูหน้าไม้) ---
  { key:'g_liuchong', zh:'劉寵', th:'เล่าฉง', short:'เล่าฉง', faction:'liu_chong', cls:'sentinel', war:86, int:70, pol:74, cha:80, lord:true, prov:'P40' },
  { key:'g_luojun', zh:'駱俊', th:'ลั่วจุ้น', short:'ลั่วจุ้น', faction:'liu_chong', cls:'strategist', war:36, int:84, pol:88, cha:76, prov:'P40' },
  { key:'g_liuchongwife', zh:'陳王妃', th:'นางเฉิน', short:'นางเฉิน', faction:'liu_chong', cls:'strategist', war:16, int:64, pol:68, cha:74, sex:'f', consortOf:'liu_chong', prov:'P40' },
  { key:'g_liuze', zh:'劉澤', th:'เล่าเจ๋อ', short:'เล่าเจ๋อ', faction:'liu_chong', cls:'sentinel', war:58, int:60, pol:62, cha:66, parents:['g_liuchong','g_liuchongwife'], prov:'P40' },

  // ============================================================
  //  CLAN MEMBERS — เติมสมาชิกตระกูลในประวัติศาสตร์ (พ่อ/พี่น้อง/บุตร)
  // ============================================================
  // --- 曹 CAO heirs ---
  { key:'g_caoang', zh:'曹昂', th:'โจงั้ง', short:'โจงั้ง', faction:'cao_cao', cls:'vanguard', war:62, int:64, pol:60, cha:74, parents:['g_caocao','g_dingfuren'], prov:'P23' },
  { key:'g_caopi', zh:'曹丕', th:'โจผี', short:'โจผี', faction:'cao_cao', cls:'commander', war:60, int:82, pol:84, cha:80, parents:['g_caocao','g_lubian'], prov:'P23' },
  // --- 袁 YUAN (north) consort + three sons ---
  { key:'g_yuanshaowife', zh:'劉夫人', th:'นางเล่า', short:'นางเล่า', faction:'yuan_shao', cls:'strategist', war:16, int:62, pol:66, cha:74, sex:'f', consortOf:'yuan_shao', prov:'P36' },
  { key:'g_yuantan', zh:'袁譚', th:'อ้วนถำ', short:'อ้วนถำ', faction:'yuan_shao', cls:'vanguard', war:78, int:62, pol:60, cha:68, parents:['g_yuanshao','g_yuanshaowife'], prov:'P36' },
  { key:'g_yuanxi', zh:'袁熙', th:'อ้วนฮี', short:'อ้วนฮี', faction:'yuan_shao', cls:'sentinel', war:70, int:64, pol:64, cha:66, parents:['g_yuanshao','g_yuanshaowife'], prov:'P36' },
  { key:'g_yuanshang', zh:'袁尚', th:'อ้วนเซียง', short:'อ้วนเซียง', faction:'yuan_shao', cls:'vanguard', war:74, int:66, pol:62, cha:78, parents:['g_yuanshao','g_yuanshaowife'], prov:'P36' },
  // --- 馬 MA consort + younger sons ---
  { key:'g_matengwife', zh:'馬夫人', th:'นางม้า', short:'นางม้า', faction:'ma_teng', cls:'champion', war:40, int:54, pol:50, cha:66, sex:'f', consortOf:'ma_teng', prov:'P13' },
  { key:'g_maxiu', zh:'馬休', th:'ม้าฮิว', short:'ม้าฮิว', faction:'ma_teng', cls:'vanguard', war:66, int:52, pol:50, cha:60, parents:['g_mateng','g_matengwife'], prov:'P13' },
  { key:'g_matie', zh:'馬鐵', th:'ม้าเทียด', short:'ม้าเทียด', faction:'ma_teng', cls:'vanguard', war:62, int:50, pol:48, cha:58, parents:['g_mateng','g_matengwife'], prov:'P13' },
  // --- 公孫 GONGSUN consort + heir ---
  { key:'g_gongsunwife', zh:'公孫夫人', th:'นางกงซุน', short:'นางกงซุน', faction:'gongsun', cls:'strategist', war:18, int:58, pol:60, cha:66, sex:'f', consortOf:'gongsun', prov:'P09' },
  { key:'g_gongsunxu', zh:'公孫續', th:'กงซุนซก', short:'กงซุนซก', faction:'gongsun', cls:'sentinel', war:58, int:56, pol:54, cha:60, parents:['g_gongsun','g_gongsunwife'], prov:'P09' },
  // --- 劉表 LIU BIAO two sons (劉琦 by first wife · 劉琮 by Lady Cai) ---
  { key:'g_liuqi', zh:'劉琦', th:'เล่ากี๋', short:'เล่ากี๋', faction:'liu_biao', cls:'sentinel', war:58, int:62, pol:64, cha:70, parents:['g_liubiao'], prov:'P06' },
  { key:'g_liucong', zh:'劉琮', th:'เล่าจ๋อง', short:'เล่าจ๋อง', faction:'liu_biao', cls:'sentinel', war:48, int:60, pol:62, cha:64, parents:['g_liubiao','g_caifuren'], prov:'P06' },
  // --- 袁術 YUAN SHU (south) consort + heir ---
  { key:'g_yuanshuwife', zh:'馮夫人', th:'นางฮอง', short:'นางฮอง', faction:'yuan_shu', cls:'strategist', war:16, int:58, pol:62, cha:70, sex:'f', consortOf:'yuan_shu', prov:'P18' },
  { key:'g_yuanyao', zh:'袁耀', th:'อ้วนเอี้ยว', short:'อ้วนเอี้ยว', faction:'yuan_shu', cls:'sentinel', war:54, int:58, pol:58, cha:62, parents:['g_yuanshu','g_yuanshuwife'], prov:'P18' },
  // --- 董 DONG ZHUO consort + granddaughter + adopted son (呂布 linked) ---
  { key:'g_dongfuren', zh:'董夫人', th:'นางตั๋ง', short:'นางตั๋ง', faction:'dong_zhuo', cls:'strategist', war:16, int:56, pol:58, cha:66, sex:'f', consortOf:'dong_zhuo', prov:'P02' },
  { key:'g_dongbai', zh:'董白', th:'ตั๋งแป๋', short:'ตั๋งแป๋', faction:'dong_zhuo', cls:'strategist', war:20, int:60, pol:56, cha:80, sex:'f', parents:['g_dongzhuo','g_dongfuren'], prov:'P02' },
  // --- 劉 LIU (Yi province) — 劉焉 patriarch · 劉璋 & brothers · 劉循 grandson ---
  { key:'g_liuyan', zh:'劉焉', th:'เล่าเอี๋ยน', short:'เล่าเอี๋ยน', faction:'liu_zhang', cls:'commander', war:48, int:74, pol:86, cha:78, lord:true, prov:'P05' },
  { key:'g_liuyanwife', zh:'費夫人', th:'นางฮุย', short:'นางฮุย', faction:'liu_zhang', cls:'strategist', war:16, int:64, pol:68, cha:72, sex:'f', consortOf:'liu_zhang', prov:'P05' },
  { key:'g_liumao', zh:'劉瑁', th:'เล่าเมา', short:'เล่าเมา', faction:'liu_zhang', cls:'sentinel', war:50, int:58, pol:60, cha:60, parents:['g_liuyan','g_liuyanwife'], prov:'P48' },
  { key:'g_liuxun', zh:'劉循', th:'เล่าสุน', short:'เล่าสุน', faction:'liu_zhang', cls:'sentinel', war:60, int:60, pol:60, cha:62, parents:['g_liuzhang'], prov:'P05' }
];

/* ---------------- CHARACTER METADATA (ตระกูล · ตำแหน่ง · ประวัติคร่าวๆ) ---------------- */
const GEN_META = {
  // CAO CAO 曹
  g_caocao:{clan:'โจ', title:'อัครมหาเสนาบดีวุย', bio:'ขุนศึกผู้เจ้าเล่ห์แต่ปรีชาสามารถ ยกธงปราบตั๋งโต๊ะ ภายหลังกุมองค์ฮ่องเต้บัญชาขุนศึกทั่วหล้า'},
  g_xiahoudun:{clan:'แฮหัว', title:'แม่ทัพคู่ใจ', bio:'ญาติผู้พี่ของโจโฉ ดุดันซื่อสัตย์ เสียตาข้างหนึ่งในศึกแต่ยังนำทัพไม่ย่อท้อ'},
  g_xunyu:{clan:'ซุน', title:'ที่ปรึกษาใหญ่', bio:'กุนซือเอกผู้วางรากฐานการปกครองให้วุยก๊ก ได้ฉายา “เสาหลักแห่งวุย”'},
  g_dianwei:{clan:'เตียน', title:'หัวหน้าองครักษ์', bio:'ยอดนักรบกำยำถือทวนคู่ พลีชีพปกป้องโจโฉในศึกอ้วนเซีย'},
  g_xiahouyuan:{clan:'แฮหัว', title:'แม่ทัพทัพหน้า', bio:'น้องแฮหัวตุ้น เชี่ยวการเดินทัพเร็วจู่โจมสายฟ้าแลบ'},
  g_caoren:{clan:'โจ', title:'แม่ทัพป้องกัน', bio:'ญาติโจโฉ แม่ทัพตั้งรับชั้นเยี่ยม ตรึงเมืองฟานเฉิงต้านกวนอูได้'},
  g_caohong:{clan:'โจ', title:'ขุนพลทหารม้า', bio:'ญาติโจโฉ เคยสละม้าช่วยชีวิตโจโฉในยามคับขัน'},
  g_yuejin:{clan:'งัก', title:'ขุนพลทัพหน้า', bio:'ขุนพลร่างเล็กแต่ใจกล้า มักปีนกำแพงเข้าตีเป็นคนแรก'},
  g_lidian:{clan:'หลี', title:'ขุนพลคุมเสบียง', bio:'ขุนพลหนุ่มผู้รักตำรา สุขุมไม่แก่งแย่งชิงดีกับผู้ใด'},
  g_yujin:{clan:'หิ', title:'ขุนพลวินัย', bio:'แม่ทัพเคร่งระเบียบวินัย ภายหลังพ่ายน้ำท่วมยอมจำนนต่อกวนอู'},
  g_xunyou:{clan:'ซุน', title:'กุนซือ', bio:'หลานซุนฮก กุนซือผู้ออกอุบายพิชิตศึกให้โจโฉนับครั้งไม่ถ้วน'},
  g_lubian:{clan:'เปียน', title:'ภริยาเอกโจโฉ', consortOf:'cao_cao', bio:'ภริยาเอกของโจโฉ มารดาโจผี เดิมเป็นนางรำ เฉลียวฉลาดรอบคอบ'},
  g_dingfuren:{clan:'เตง', title:'ภริยาเดิมโจโฉ', bio:'ภริยาคนแรกของโจโฉ ขุ่นเคืองที่โจงั้งบุตรบุญธรรมตายในศึกอ้วนเซีย'},
  // LIU BEI 劉
  g_liubei:{clan:'เล่า', title:'เจ้าผู้ทรงคุณธรรม', bio:'เชื้อสายราชวงศ์ฮั่น เปี่ยมเมตตา ได้ใจราษฎรและขุนพลด้วยคุณธรรม'},
  g_guanyu:{clan:'กวน', title:'เทพเจ้าแห่งสงคราม', bio:'พี่น้องร่วมสาบานสวนท้อ ซื่อสัตย์เป็นเลิศ ง้าวมังกรเขียวเลื่องลือ'},
  g_zhangfei:{clan:'เตียว', title:'ขุนพลพยัคฆ์', bio:'พี่น้องสาบานสวนท้อ ดุดั่งพยัคฆ์ คำรามที่สะพานเตียงปันจนทัพโจโฉถอย'},
  g_zhaoyun:{clan:'จู', title:'ทหารเสือ', bio:'จูล่งผู้กล้าหาญงามสง่า ฝ่าทัพแสนช่วยอาเต๊าออกจากเตียงปัน'},
  g_mizhu:{clan:'บิ', title:'เสนาบดีคลัง', bio:'พ่อค้ามั่งคั่งแห่งชีจิ๋ว สละทรัพย์อุปถัมภ์เล่าปี่ตั้งแต่ยามตกอับ'},
  g_sunqian:{clan:'ซุน', title:'ทูตเจรจา', bio:'ที่ปรึกษาฝีปากกล้า เชี่ยวการเจรจาผูกไมตรีแทนเล่าปี่'},
  g_jianyong:{clan:'กั๋น', title:'ที่ปรึกษา', bio:'สหายเก่าเล่าปี่ อารมณ์ขัน พูดจาตรงไม่เกรงแม้ต่อหน้าเจ้านาย'},
  g_guanping:{clan:'กวน', title:'ทายาททัพหน้า', bio:'บุตรบุญธรรมกวนอู ติดตามบิดาออกศึกตั้งแต่เยาว์วัย'},
  g_ganfuren:{clan:'กำ', title:'ชายาเล่าปี่', consortOf:'liu_bei', bio:'ชายาเล่าปี่ มารดาอาเต๊า งามพร้อมและอ่อนโยน'},
  g_mifuren:{clan:'บิ', title:'ชายาเล่าปี่', consortOf:'liu_bei', bio:'น้องสาวบิต๊ก ชายาเล่าปี่ สละชีวิตปกป้องอาเต๊าที่เตียงปัน'},
  // SUN JIAN 孫
  g_sunjian:{clan:'ซุน', title:'พยัคฆ์กังตั๋ง', bio:'ขุนศึกผู้กล้า เจ้าตำนานพยัคฆ์แห่งกังตั๋ง รบปราบโจรโพกผ้าเหลืองและตั๋งโต๊ะ'},
  g_sunce:{clan:'ซุน', title:'พญาเสือหนุ่ม', bio:'บุตรซุนเกี๋ยน ฉายา “เสียวป้าอ๋อง” พิชิตกังตั๋งทั้งแผ่นดินด้วยวัยเยาว์'},
  g_chengpu:{clan:'เทีย', title:'ขุนพลอาวุโส', bio:'แม่ทัพเก่าแก่ตั้งแต่ยุคซุนเกี๋ยน เป็นที่เคารพของขุนพลสามรุ่น'},
  g_huanggai:{clan:'อึ้ง', title:'ขุนพลทหารเรือ', bio:'ขุนพลภักดี ยอมรับโทษเฆี่ยนในกลลวงเพื่อเผาทัพเรือโจโฉที่เซ็กเพ็ก'},
  g_handang:{clan:'หัน', title:'ขุนพลทัพหน้า', bio:'แม่ทัพเก่าแก่ตระกูลซุน ออกรบเคียงข้างเจ้านายถึงสามรุ่น'},
  g_zumao:{clan:'จอ', title:'องครักษ์', bio:'ขุนพลผู้ภักดี ลวงข้าศึกด้วยการสวมหมวกซุนเกี๋ยนเพื่อช่วยนายหนีรอด'},
  g_zhuzhi:{clan:'จู', title:'ขุนพลปกครอง', bio:'แม่ทัพรอบรู้การปกครอง ค้ำจุนตระกูลซุนยามผลัดแผ่นดิน'},
  g_sunquan:{clan:'ซุน', title:'ทายาทกังตั๋ง', bio:'น้องชายซุนเซ็ก ผู้ภายหลังสถาปนาง่อก๊กครองกังตั๋งสืบมา'},
  g_wufuren:{clan:'ง่อ', title:'ชายาซุนเกี๋ยน', consortOf:'sun_jian', bio:'มารดาซุนเซ็กซุนกวน ปรีชาด้านการปกครอง ค้ำจุนตระกูลซุน'},
  g_sunshangxiang:{clan:'ซุน', title:'เจ้าหญิงนักรบ', bio:'น้องสาวซุนกวน ใจกล้าดั่งบุรุษ ฝึกอาวุธ ภายหลังอภิเษกกับเล่าปี่'},
  g_daqiao:{clan:'เกี้ยว', title:'นางงามกังตั๋ง', bio:'ภริยาซุนเซ็ก พี่สาวเซียวเกี้ยว สองศรีพี่น้องงามเลิศแห่งกังตั๋ง'},
  // YUAN SHAO 袁
  g_yuanshao:{clan:'อ้วน', title:'เจ้าสี่ชั่วคน', bio:'หัวหน้าพันธมิตรปราบตั๋งโต๊ะ ตระกูลขุนนางใหญ่สี่ชั่วคน ครองภาคเหนือ'},
  g_yanliang:{clan:'งัน', title:'ขุนพลทัพหน้า', bio:'ยอดขุนพลแห่งอ้วนเสี้ยว ฝีมือกล้าแต่ถูกกวนอูสังหารที่แปะแบ๋'},
  g_wenchou:{clan:'บุน', title:'ขุนพลทัพหน้า', bio:'ขุนพลคู่กับงันเหลียง ดุดันในสนามรบทุ่งราบ'},
  g_jutshou:{clan:'จู', title:'กุนซือ', bio:'กุนซือมองการณ์ไกล ทัดทานอ้วนเสี้ยวไม่ให้ผลีผลามที่กัวต๋อแต่ไม่ถูกฟัง'},
  g_tianfeng:{clan:'เตียน', title:'กุนซือ', bio:'ที่ปรึกษาตรงไปตรงมา ถูกจองจำเพราะทักท้วงไม่ให้ยกทัพศึกกัวต๋อ'},
  g_shenpei:{clan:'ซิม', title:'เสนาบดี', bio:'ขุนนางผู้ภักดี ตรึงเมืองเย่จนวันตายไม่ยอมสวามิภักดิ์โจโฉ'},
  g_gaolan:{clan:'โก', title:'ขุนพลทัพหน้า', bio:'ขุนพลแห่งอ้วนเสี้ยว ภายหลังสวามิภักดิ์โจโฉพร้อมเตียวคับ'},
  g_zhanghe:{clan:'เตียว', title:'ขุนพลทหารม้า', bio:'ยอดขุนพลผู้เชี่ยวกลศึก ภายหลังเป็นหนึ่งในห้าทหารเสือแห่งวุย'},
  g_zhenji:{clan:'เจิน', title:'นางงามเหอเป่ย', bio:'หญิงงามเลื่องชื่อแห่งเหอเป่ย ภายหลังเป็นชายาโจผี'},
  // DONG ZHUO 董
  g_dongzhuo:{clan:'ตั๋ง', title:'ทรชนกุมฮ่องเต้', bio:'ขุนศึกซีเหลียงผู้โหดเหี้ยม ยึดลกเอี๋ยง กุมองค์ฮ่องเต้สั่งการราชสำนัก'},
  g_lubu:{clan:'ลิ', title:'เทพสงครามไร้พ่าย', bio:'ยอดขุนพลหนึ่งเดียวใต้หล้า ขี่ม้าเซ็กเธาว์ถือทวน แต่ทรยศนายถึงสองครา'},
  g_huaxiong:{clan:'ฮัว', title:'ขุนพลเฝ้าด่าน', bio:'ขุนพลร่างยักษ์ของตั๋งโต๊ะ เฝ้าด่านกิก๋วน ก่อนถูกกวนอูบั่นคอ'},
  g_ligu:{clan:'หลี', title:'กุนซือ', bio:'ที่ปรึกษาเจ้าเล่ห์ของตั๋งโต๊ะ ออกอุบายโหดเหี้ยมหลายครั้ง'},
  g_xurong:{clan:'ชี', title:'ขุนพลทัพหน้า', bio:'แม่ทัพฝีมือฉกาจ เคยตีทัพโจโฉและซุนเกี๋ยนแตกในศึกปราบพันธมิตร'},
  g_lijue:{clan:'ลิ', title:'ขุนพลซีเหลียง', bio:'ขุนพลใต้ตั๋งโต๊ะ ภายหลังยกทัพยึดเตียงอันคุมฮ่องเต้ต่อ'},
  g_guosi:{clan:'ก๊วย', title:'ขุนพลซีเหลียง', bio:'ขุนพลคู่ลิฉุย ร่วมกุมอำนาจเตียงอันแล้วกลับรบกันเองภายหลัง'},
  g_diaochan:{clan:'', title:'หนึ่งในสี่ยอดหญิงงาม', bio:'สาวงามผู้ยอมพลีตนในกลสาวงาม ยุยงให้ลิโป้สังหารตั๋งโต๊ะ'},
  // MA TENG 馬
  g_mateng:{clan:'ม้า', title:'ขุนศึกชายแดน', bio:'เจ้าซีเหลียงเชื้อสายแม่ทัพม้าเอ๊ก ผู้นำกองม้าเหล็กเกรียงไกร'},
  g_machao:{clan:'ม้า', title:'ทัพม้าเทพ', bio:'ม้าเฉียวผู้งามสง่าดุจเทพ ฉายา “กิมม้าเฉียว” ไล่โจโฉจนตัดหนวดทิ้งเสื้อคลุม'},
  g_pangde:{clan:'บัง', title:'ขุนพลทัพหน้า', bio:'ขุนพลกล้าแห่งซีเหลียง แบกโลงออกรบท้ากวนอูไม่หวั่นความตาย'},
  g_hansui:{clan:'หัน', title:'ขุนศึกพันธมิตร', bio:'ขุนศึกซีเหลียงพันธมิตรม้าเท้ง ช่ำชองการรบชายแดนมาช้านาน'},
  g_madai:{clan:'ม้า', title:'ขุนพลทหารม้า', bio:'หลานม้าเท้ง ติดตามม้าเฉียวออกศึก ภักดีต่อตระกูลม้าจนวันสุดท้าย'},
  // GONGSUN 公孫
  g_gongsun:{clan:'กงซุน', title:'ขุนพลม้าขาว', bio:'เจ้าอิ้วจิ๋ว ผู้นำกองทหารม้าขาวเลื่องชื่อ ต้านอนารยชนภาคเหนือ'},
  g_zhaoyun2:{clan:'งึม', title:'ขุนพลทัพหน้า', bio:'ขุนพลใต้กงซุนจ้าน คุมแนวหน้าในศึกชิงกิจิ๋วกับอ้วนเสี้ยว'},
  g_gongsunyue:{clan:'กงซุน', title:'ขุนพลญาติ', bio:'น้องชายกงซุนจ้าน เสียชีวิตในศึกจนจุดชนวนสงครามกับอ้วนเสี้ยว'},
  g_tiankai:{clan:'เตียน', title:'เจ้าเมือง', bio:'ขุนพลใต้กงซุนจ้าน ได้รับมอบให้ครองเฉงจิ๋วต้านอ้วนเสี้ยว'},
  // LIU BIAO 劉表
  g_liubiao:{clan:'เล่า', title:'เจ้าเกงจิ๋ว', bio:'เชื้อสายฮั่น ปกครองเกงจิ๋วอันมั่งคั่งด้วยความสงบ แต่ขาดความทะเยอทะยาน'},
  g_huangzu:{clan:'อึ้ง', title:'เจ้าเมืองกังแฮ', bio:'เจ้าเมืองกังแฮผู้สังหารซุนเกี๋ยน จุดอาฆาตกับตระกูลซุน'},
  g_caimao:{clan:'ชัว', title:'ขุนพลทัพเรือ', bio:'พี่ภริยาเล่าเปียว คุมทัพเรือเกงจิ๋ว ภายหลังยอมสวามิภักดิ์โจโฉ'},
  g_wenpin:{clan:'บุน', title:'ขุนพลป้องกัน', bio:'ขุนพลซื่อสัตย์ เฝ้าชายแดนเกงจิ๋วให้โจโฉอย่างมั่นคงภายหลัง'},
  g_zhangyun:{clan:'เตียว', title:'ขุนพลทัพเรือ', bio:'ขุนพลทัพเรือเกงจิ๋วคู่ชัวมอ ภายหลังถูกโจโฉสั่งประหารด้วยกลลวง'},
  g_caifuren:{clan:'ชัว', title:'ภริยาเล่าเปียว', bio:'ภริยาเล่าเปียว น้องสาวชัวมอ ผลักดันบุตรตนขึ้นครองเกงจิ๋ว'},
  // YUAN SHU 袁術
  g_yuanshu:{clan:'อ้วน', title:'เจ้าทะเยอทะยาน', bio:'น้องอ้วนเสี้ยว ผู้ได้ตราหยกแล้วบังอาจตั้งตนเป็นฮ่องเต้จนถูกปราบ'},
  g_jiling:{clan:'กิ', title:'ขุนพลทัพหน้า', bio:'ยอดขุนพลแห่งอ้วนสุด ถือง้าวสามง่ามหนัก รบพันตูกวนอูหลายสิบเพลง'},
  g_zhangxun:{clan:'เตียว', title:'แม่ทัพใหญ่', bio:'แม่ทัพคนสำคัญของอ้วนสุด คุมทัพหลวงในศึกชิงห้วยหนาน'},
  g_qiaorui:{clan:'เกียว', title:'ขุนพลทัพหน้า', bio:'ขุนพลกองหน้าของอ้วนสุด ออกรบต้านลิโป้และเล่าปี่'},
  // LIU ZHANG 劉璋
  g_liuzhang:{clan:'เล่า', title:'ทายาทเอ๊กจิ๋ว', bio:'บุตรเล่าเอี๋ยน เจ้าเสฉวนผู้อ่อนแอลังเล สุดท้ายยกแผ่นดินให้เล่าปี่โดยไม่สู้รบ'},
  g_zhangren:{clan:'เตียว', title:'ขุนพลป้องกัน', bio:'ขุนพลภักดีแห่งเสฉวน ซุ่มยิงบังทองดับที่เนินห่านทอง'},
  g_yanyan:{clan:'งิ้ม', title:'ขุนพลเฒ่า', bio:'ขุนพลชราใจเด็ด ลั่นวาจา “เมืองนี้มีแต่ขุนพลคอขาด ไร้ขุนพลยอมแพ้”'},
  g_huangquan:{clan:'อึ้ง', title:'กุนซือ', bio:'ที่ปรึกษามองการณ์ไกล ทัดทานเล่าเจี้ยงไม่ให้เชิญเล่าปี่เข้าเสฉวน'},
  // NEUTRAL / FREE AGENTS
  g_zhugeliang:{clan:'จูกัด', title:'มังกรหลับ', bio:'ฉายา “ขงเบ้ง” อัจฉริยะแห่งหลงต๋ง ผู้หยั่งรู้ฟ้าดิน รอเจ้านายผู้คู่ควร'},
  g_zhouyu:{clan:'จิว', title:'แม่ทัพเรือกังตั๋ง', bio:'กุนซือรูปงามแห่งกังตั๋ง ผู้วางกลเผาทัพเรือโจโฉที่เซ็กเพ็ก'},
  g_taishici:{clan:'ไทสู', title:'ขุนพลธนู', bio:'ขุนพลธนูแม่นยำ เคยประลองกับซุนเซ็กทั้งวันจนเกิดความนับถือกัน'},
  g_huatuo:{clan:'ฮัว', title:'หมอเทวดา', bio:'ยอดแพทย์ผู้คิดยาสลบและการผ่าตัด รักษาขุนศึกทั่วแผ่นดิน'},
  g_ganning:{clan:'กำ', title:'ขุนพลโจรสลัด', bio:'อดีตหัวหน้าโจรสลัดติดกระดิ่ง กล้าบุกค่ายโจโฉด้วยทหารเพียงร้อยนาย'},
  g_zhangliao:{clan:'เตียว', title:'ขุนพลทัพหน้า', bio:'ยอดขุนพลผู้ภายหลังตรึงหับป๋าด้วยทหารแปดร้อยต้านทัพง่อนับแสน'},
  g_xuhuang:{clan:'ชี', title:'ขุนพลระเบียบทัพ', bio:'ขุนพลผู้เคร่งระเบียบ ฉายา “เนียอู๋” ตีทัพล้อมกวนอูแตกกระเจิง'},
  g_xushu:{clan:'ชี', title:'กุนซือ', bio:'กุนซือคนแรกของเล่าปี่ จำต้องจากไปเพราะโจโฉจับมารดาเป็นตัวประกัน'},
  g_pangtong:{clan:'บัง', title:'หงส์ดรุณ', bio:'ฉายา “หงส์ดรุณ” ปัญญาเทียบขงเบ้ง วางกลล่ามเรือให้โจโฉที่เซ็กเพ็ก'},
  g_chengong:{clan:'ตัน', title:'กุนซือ', bio:'กุนซือผู้เคยช่วยโจโฉ แต่ผิดหวังจึงไปสมคบลิโป้ต้านโจโฉจนวันตาย'},
  g_xiaoqiao:{clan:'เกี้ยว', title:'นางงามกังตั๋ง', bio:'ภริยาจิวยี่ น้องสาวต้าเกี้ยว เลื่องชื่อความงามคู่พี่สาว'},
  g_huangyueying:{clan:'อึ้ง', title:'ภริยาขงเบ้ง', bio:'ธิดาอึ้งสิงเอี๋ยน ปราดเปรื่องการช่าง รูปไม่งามแต่ปัญญาเลิศ เป็นคู่คิดขงเบ้ง'},
  g_caiwenji:{clan:'ชัว', title:'กวีหญิง', bio:'ธิดาชัวยง กวีและนักดนตรีหญิงผู้ปราดเปรื่อง เคยถูกชิงไปอยู่เผ่าซฺยงหนู'},
  g_wangyi:{clan:'ออง', title:'สตรีนักรบ', bio:'ภริยาเจ้าเมืองซีเหลียง จับอาวุธป้องเมืองสู้ม้าเฉียวด้วยตนเอง'},
  g_zhaoe:{clan:'จู', title:'สตรีล้างแค้น', bio:'หญิงกล้าแห่งลิอันจิ๋ว สังหารศัตรูล้างแค้นแทนบิดาด้วยมือตน'},
  g_bulianshi:{clan:'โป้ว', title:'นางใน', bio:'สตรีงามตระกูลโป้ว ภายหลังเป็นที่รักยิ่งของซุนกวน'},
  g_dufuren:{clan:'ตู้', title:'นางงาม', bio:'หญิงงามผู้ตกเป็นที่หมายปองของขุนศึกหลายนายกลางศึกสงคราม'},
  g_yinfuren:{clan:'อิ๋น', title:'นางใน', bio:'สตรีสุขุมรอบคอบ ปรีชาด้านกิจการในวัง'},
  g_fanfuren:{clan:'ฟาน', title:'แม่หม้ายงาม', bio:'แม่หม้ายงามแห่งเกงจิ๋วใต้ ผู้มีสติปัญญาเหนือหญิงทั่วไป'},
  // --- TAO QIAN 陶 ---
  g_taoqian:{clan:'โต', title:'เจ้าชีจิ๋ว', bio:'ขุนนางอาวุโสผู้ครองชีจิ๋วอันมั่งคั่ง สุขุมโอบอ้อมแต่ชราภาพ ภายหลังถูกโจโฉยกทัพล้างแค้นบิดาจนเมืองแหลกลาญ'},
  g_caobao:{clan:'โจ', title:'ขุนพลทัพหน้า', bio:'แม่ทัพคุมทหารตันจิ๋วใต้โตเกี๋ยม ภายหลังขัดแย้งกับเตียวหุยจนเปิดช่องให้ลิโป้ชิงชีจิ๋ว'},
  g_chendeng:{clan:'ตัน', title:'เจ้าเมืองปลัด', bio:'ปราชญ์หนุ่มแห่งแห้ฝือ ปัญญาเฉียบแหลม ภายหลังออกอุบายช่วยโจโฉกำราบลิโป้'},
  g_chengui:{clan:'ตัน', title:'ที่ปรึกษาอาวุโส', bio:'บิดาตันเต๋ง ขุนนางเจ้าเล่ห์ผู้วางแผนพลิกขั้วอำนาจในชีจิ๋วอย่างแยบยล'},
  g_taofuren:{clan:'โต', title:'ภริยาโตเกี๋ยม', bio:'ภริยาเจ้าชีจิ๋ว ค้ำจุนกิจการเรือนในยามบ้านเมืองไม่สงบ'},
  g_taoshang:{clan:'โต', title:'บุตรโตเกี๋ยม', bio:'บุตรชายโตเกี๋ยม บิดามิไว้วางใจให้สืบทอดชีจิ๋ว จึงยกเมืองให้เล่าปี่แทน'},
  g_taoying:{clan:'โต', title:'บุตรโตเกี๋ยม', bio:'บุตรคนรองโตเกี๋ยม ใช้ชีวิตเรียบง่ายมิข้องเกี่ยวการเมือง'},
  // --- HAN FU 韓 ---
  g_hanfu:{clan:'หัน', title:'เจ้ามณฑลกิจิ๋ว', bio:'เจ้ามณฑลกิจิ๋วผู้มั่งคั่งด้วยเสบียง ทว่าขลาดและลังเล สุดท้ายยกกิจิ๋วให้อ้วนเสี้ยวโดยไม่สู้'},
  g_quyi:{clan:'เก็ก', title:'ขุนพลพลธนู', bio:'แม่ทัพเชี่ยวศึกเชื้อสายเลียงจิ๋ว ใช้พลธนูดักปราบทัพม้าขาวกงซุนจ้านที่แม่น้ำกาย ภายหลังสวามิภักดิ์อ้วนเสี้ยว'},
  g_panfeng:{clan:'พัว', title:'ขุนพลขวานใหญ่', bio:'ขุนพลถือขวานใหญ่ของหันฮก อาสาออกรบฮัวหยงอย่างองอาจ แต่พลาดท่าถูกสังหารกลางสนาม'},
  g_gengwu:{clan:'เกง', title:'ขุนนางภักดี', bio:'ขุนนางกิจิ๋วผู้ภักดี ทัดทานหันฮกมิให้ยกเมืองแก่อ้วนเสี้ยวจนถูกสังหาร'},
  g_hanfuwife:{clan:'หัน', title:'ภริยาหันฮก', bio:'ภริยาเจ้ามณฑลกิจิ๋ว ร่วมทุกข์กับสามีในยามบ้านเมืองผันผวน'},
  g_hanjie:{clan:'หัน', title:'ทายาทหันฮก', bio:'บุตรหันฮก เติบโตท่ามกลางความวุ่นวายของศึกชิงกิจิ๋ว'},
  // --- clan heirs ---
  g_caoang:{clan:'โจ', title:'บุตรชายคนโต', bio:'บุตรคนโตของโจโฉ นางเตงเลี้ยงดู ภายหลังสละม้าให้บิดาหนีรอดแล้วพลีชีพที่อ้วนเซีย'},
  g_caopi:{clan:'โจ', title:'ทายาทตระกูลโจ', bio:'บุตรนางเปียน เฉลียวฉลาดเจ้ากลอุบาย ภายหลังสถาปนาราชวงศ์วุยเป็นปฐมกษัตริย์'},
  g_yuanshaowife:{clan:'เล่า', title:'ภริยาเอกอ้วนเสี้ยว', bio:'ภริยาเอกอ้วนเสี้ยว รักใคร่บุตรคนเล็กอ้วนเซียงจนผลักดันให้สืบทอดเหนือพี่ชาย'},
  g_yuantan:{clan:'อ้วน', title:'บุตรคนโต', bio:'บุตรคนโตอ้วนเสี้ยว ดุดันชอบศึก ภายหลังชิงอำนาจกับน้องอ้วนเซียงจนตระกูลแตกสลาย'},
  g_yuanxi:{clan:'อ้วน', title:'บุตรคนกลาง', bio:'บุตรคนกลางอ้วนเสี้ยว ครองอิ้วจิ๋ว สามีนางเจินจี ผู้สุขุมไม่ทะเยอทะยาน'},
  g_yuanshang:{clan:'อ้วน', title:'บุตรคนเล็กคนโปรด', bio:'บุตรคนเล็กรูปงามที่อ้วนเสี้ยวโปรดปราน ได้สืบทอดเหนือพี่จนจุดชนวนศึกพี่น้อง'},
  g_matengwife:{clan:'ม้า', title:'ภริยาม้าเท้ง', bio:'ภริยาม้าเท้งเชื้อสายเกี๋ยง มารดาม้าเฉียวผู้ห้าวหาญ'},
  g_maxiu:{clan:'ม้า', title:'บุตรม้าเท้ง', bio:'บุตรม้าเท้ง ติดตามบิดาเข้าราชสำนัก ภายหลังถูกโจโฉสังหารพร้อมตระกูล'},
  g_matie:{clan:'ม้า', title:'บุตรม้าเท้ง', bio:'บุตรคนเล็กม้าเท้ง ร่วมชะตากรรมตระกูลม้าในเตียงอัน'},
  g_gongsunwife:{clan:'กงซุน', title:'ภริยากงซุนจ้าน', bio:'ภริยาขุนพลม้าขาว ดูแลเรือนในยามสามีรบศึกชายแดนเหนือ'},
  g_gongsunxu:{clan:'กงซุน', title:'ทายาทม้าขาว', bio:'บุตรกงซุนจ้าน เคียงข้างบิดาในป้อมอี้จิงจนวาระสุดท้าย'},
  g_liuqi:{clan:'เล่า', title:'บุตรคนโต', bio:'บุตรคนโตเล่าเปียว อุปนิสัยดีแต่ถูกแม่เลี้ยงกีดกัน ภายหลังพึ่งขงเบ้งรักษาตัวรอด'},
  g_liucong:{clan:'เล่า', title:'บุตรคนเล็ก', bio:'บุตรนางชัว ได้สืบทอดเกงจิ๋ว แต่ยอมสวามิภักดิ์โจโฉโดยไม่สู้รบ'},
  g_yuanshuwife:{clan:'ฮอง', title:'ภริยาอ้วนสุด', bio:'ภริยาอ้วนสุด ร่วมเรืองอำนาจและร่วงโรยกับสามีผู้บังอาจตั้งตนเป็นฮ่องเต้'},
  g_yuanyao:{clan:'อ้วน', title:'ทายาทอ้วนสุด', bio:'บุตรอ้วนสุด ภายหลังตระกูลล่มสลาย บุตรีได้เป็นสะใภ้ตระกูลซุนแห่งกังตั๋ง'},
  g_dongfuren:{clan:'ตั๋ง', title:'ภริยาตั๋งโต๊ะ', bio:'สตรีในเรือนตั๋งโต๊ะ ใช้ชีวิตหรูหราในวังหลวงลกเอี๋ยง'},
  g_dongbai:{clan:'ตั๋ง', title:'หลานสาวตั๋งโต๊ะ', bio:'หลานสาวตั๋งโต๊ะวัยเยาว์ ได้รับยศสูงเกินวัยตามอำนาจของปู่'},
  // --- LIU (Yi province) 劉 ---
  g_liuyan:{clan:'เล่า', title:'เจ้ามณฑลเอ๊กจิ๋ว', bio:'เชื้อสายฮั่น ผู้เสนอให้ตั้งตำแหน่ง “มู่” คุมมณฑล แล้วปลีกเสฉวนตั้งตนเป็นอิสระเงียบๆ'},
  g_liuyanwife:{clan:'เล่า', title:'ภริยาเล่าเอี๋ยน', bio:'ภริยาเจ้าเอ๊กจิ๋ว มารดาของเหล่าบุตรตระกูลเล่าแห่งเสฉวน'},
  g_liumao:{clan:'เล่า', title:'บุตรเล่าเอี๋ยน', bio:'บุตรเล่าเอี๋ยน สุขภาพไม่แข็งแรง มิได้สืบทอดมณฑลเอ๊กจิ๋ว'},
  g_liuxun:{clan:'เล่า', title:'ทายาทเสฉวน', bio:'บุตรเล่าเจี้ยง เคยตรึงเมืองต้านทัพเล่าปี่อย่างกล้าหาญ'},
  // SHI XIE 士 — ตระกูลสื้อแห่งเจียวจิ๋ว
  g_shixie:{clan:'สื้อ', title:'เจ้าสมุทรทักษิณ', bio:'เจ้าเมืองเจียวจื่อผู้คงแก่เรียน ปกครองเจียวจิ๋วด้วยความสงบมั่งคั่ง เป็นที่พึ่งของปราชญ์ผู้ลี้ภัยสงครามลงใต้'},
  g_shiyi:{clan:'สื้อ', title:'เจ้าเมืองเหอผู่', bio:'น้องสื้อเซี่ย ครองเมืองเหอผู่ ดูแลเส้นทางการค้ามุกและไข่มุกแห่งทะเลใต้'},
  g_shiwei:{clan:'สื้อ', title:'เจ้าเมืองจิ่วเจิน', bio:'น้องสื้อเซี่ย ครองเมืองจิ่วเจินชายแดนใต้สุด รักษาความสงบแดนชายขอบ'},
  g_shiwu:{clan:'สื้อ', title:'เจ้าเมืองน่ำไฮ', bio:'น้องสื้อเซี่ย ครองเมืองน่ำไฮอันเป็นเมืองท่าค้าขายกับต่างแดน คุมกำลังรบของตระกูล'},
  g_shixiewife:{clan:'สื้อ', title:'ภริยาเจ้าเจียวจิ๋ว', consortOf:'shi_xie', bio:'ภริยาเอกสื้อเซี่ย แม่ศรีเรือนผู้ค้ำจุนกิจการตระกูลสื้อในแดนใต้'},
  g_shihui:{clan:'สื้อ', title:'ทายาทตระกูลสื้อ', bio:'บุตรสื้อเซี่ย ทายาทผู้สืบอำนาจเจียวจิ๋ว ใจร้อนทะเยอทะยานกว่าบิดา'},
  // LIU CHONG 陳 — ตันอ๋องแห่งเมืองเฉิน
  g_liuchong:{clan:'เล่า', title:'ตันอ๋อง · ฟูฮั่นเจียงจวิน', bio:'เชื้อพระวงศ์ฮั่นผู้ครองแคว้นเฉิน ยอดฝีมือธนูหน้าไม้ รวบรวมพลธนูตั้งรับต้านโพกผ้าเหลืองจนกบฏไม่กล้าล้ำเขตเฉิน'},
  g_luojun:{clan:'ลั่ว', title:'เสนาบดีแคว้นเฉิน', bio:'อัครเสนาบดีคู่ใจเล่าฉง ปกครองแคว้นเฉินให้ร่มเย็นมั่งคั่ง ภายหลังถูกอ้วนสุดสังหารพร้อมเล่าฉง'},
  g_liuchongwife:{clan:'เล่า', title:'พระชายาตันอ๋อง', consortOf:'liu_chong', bio:'ชายาเอกแห่งตันอ๋องเล่าฉง หนุนเจือกิจการแคว้นเฉินยามบ้านเมืองเผชิญศึก'},
  g_liuze:{clan:'เล่า', title:'ทายาทแคว้นเฉิน', bio:'โอรสเล่าฉง ฝึกปรือธนูหน้าไม้ตามรอยบิดา หมายมั่นสืบทอดปณิธานแคว้นเฉิน'}
};

/* ---- historical ages in ค.ศ. 190 (สำหรับระบบอายุขัย) ---- */
const GEN_AGE_190 = {
  g_caocao:35, g_xiahoudun:33, g_xunyu:27, g_dianwei:30, g_xiahouyuan:30,
  g_liubei:29, g_guanyu:30, g_zhangfei:25, g_zhaoyun:22,
  g_sunjian:35, g_sunce:15, g_chengpu:40, g_huanggai:40,
  g_yuanshao:36, g_yanliang:30, g_wenchou:30, g_jutshou:35,
  g_dongzhuo:51, g_lubu:30, g_huaxiong:30, g_ligu:35,
  g_mateng:34, g_machao:15, g_pangde:20,
  g_gongsun:35, g_zhaoyun2:30,
  g_liubiao:48, g_huangzu:40, g_caimao:30,
  g_yuanshu:35, g_jiling:30, g_liuzhang:29,
  g_zhugeliang:9, g_zhouyu:16, g_taishici:24, g_huatuo:45,
  g_lubian:30, g_ganfuren:22, g_sunshangxiang:13, g_zhenji:7,
  g_diaochan:18, g_xiaoqiao:11, g_daqiao:13, g_huangyueying:13,
  /* --- minor & mid-rank retainers --- */
  g_caoren:22, g_caohong:21, g_yuejin:20, g_lidian:17, g_yujin:27, g_xunyou:33,
  g_mizhu:25, g_sunqian:28, g_jianyong:26,
  g_handang:25, g_zumao:30, g_zhuzhi:34,
  g_zhanghe:23, g_tianfeng:40, g_shenpei:35, g_gaolan:28,
  g_xurong:35, g_lijue:30, g_guosi:30,
  g_hansui:45, g_madai:15,
  g_gongsunyue:30, g_tiankai:30,
  g_wenpin:25, g_zhangyun:28,
  g_zhangxun:32, g_qiaorui:30,
  g_zhangren:30, g_yanyan:45, g_huangquan:22,
  g_ganning:22, g_zhangliao:21, g_xuhuang:21, g_xushu:14, g_pangtong:11, g_chengong:30,
  g_sunquan:8, g_guanping:12,
  g_wufuren:32, g_mifuren:20, g_caiwenji:13, g_wangyi:18,
  g_zhaoe:22, g_bulianshi:16, g_dufuren:18, g_yinfuren:19, g_fanfuren:24,
  g_dingfuren:30, g_caifuren:30,
  /* --- new playable lords & retinue --- */
  g_taoqian:55, g_caobao:38, g_chendeng:20, g_chengui:44, g_taofuren:40, g_taoshang:18, g_taoying:16,
  g_hanfu:42, g_quyi:33, g_panfeng:35, g_gengwu:40, g_hanfuwife:36, g_hanjie:12,
  /* --- clan members (fathers / brothers / heirs) --- */
  g_caoang:13, g_caopi:3,
  g_yuanshaowife:33, g_yuantan:17, g_yuanxi:14, g_yuanshang:9,
  g_matengwife:33, g_maxiu:10, g_matie:7,
  g_gongsunwife:30, g_gongsunxu:9,
  g_liuqi:16, g_liucong:12,
  g_yuanshuwife:30, g_yuanyao:9,
  g_dongfuren:34, g_dongbai:8,
  g_liuyan:55, g_liuyanwife:46, g_liumao:25, g_liuxun:10,
  g_shixie:53, g_shiyi:49, g_shiwei:46, g_shiwu:43, g_shixiewife:45, g_shihui:18,
  g_liuchong:52, g_luojun:45, g_liuchongwife:44, g_liuze:13
};

/* ---- pools for naming new-generation generals ---- */
const CHILD_SURNAME_OF = { /* a child inherits the father's clan surname when known */ };
const MALE_GIVEN_NAMES = [
  {zh:'承',th:'เฉิง'},{zh:'昭',th:'เจา'},{zh:'毅',th:'อี้'},{zh:'瑾',th:'จิ่น'},
  {zh:'霖',th:'หลิน'},{zh:'肅',th:'ซู่'},{zh:'晏',th:'เยี่ยน'},{zh:'琰',th:'เยี่ยน'},
  {zh:'恒',th:'เหิง'},{zh:'睿',th:'รุ่ย'},{zh:'淵',th:'เอวียน'},{zh:'軒',th:'ซวน'}
];
const FEMALE_GIVEN_NAMES = [
  {zh:'瑤',th:'เหยา'},{zh:'婉',th:'หว่าน'},{zh:'蓉',th:'หรง'},{zh:'雪',th:'เสวี่ย'},
  {zh:'凝',th:'หนิง'},{zh:'琳',th:'หลิน'},{zh:'妍',th:'เหยียน'},{zh:'蕊',th:'รุ่ย'}
];

/* apply default age/sex + metadata to every general at load time */
function normalizeGenerals(list){
  list.forEach(g=>{ if(g.sex===undefined) g.sex='m'; if(g.age===undefined) g.age=GEN_AGE_190[g.key] ?? 30;
    if(g.deathAge===undefined) g.deathAge = 56 + Math.floor(Math.random()*22); // 56–77
    if(g.child===undefined) g.child = g.age < 15;
    const m = GEN_META[g.key];
    if(m){ if(g.clan===undefined) g.clan=m.clan; if(g.title===undefined) g.title=m.title; if(g.bio===undefined) g.bio=m.bio; if(g.consortOf===undefined && m.consortOf) g.consortOf=m.consortOf; }
    if(g.clan===undefined) g.clan = (g.short||'').slice(0,2);   // fallback clan from name
    if(g.title===undefined) g.title = (HERO_CLASSES[g.cls]||{}).th || 'ขุนพล';
    if(g.bio===undefined) g.bio = genFallbackBio(g);
    if(g.consortOf) g.married = true;                            // lord-consorts cannot be courted
  });
  return list;
}

/* generated brief history for minor officers without a hand-written bio */
function genFallbackBio(g){
  const c = HERO_CLASSES[g.cls] || {};
  const fac = (FACTIONS[g.faction] && FACTIONS[g.faction].th) ? `ก๊ก${FACTIONS[g.faction].th}` : (g.faction==='neutral'?'ขุนพลพเนจร':'หัวเมืองอิสระ');
  const trait = g.war>=85?'ฝีมือการรบโดดเด่น' : g.int>=85?'สติปัญญาเฉียบแหลม' : g.pol>=80?'เชี่ยวการปกครอง' : 'รับใช้บ้านเมืองด้วยความซื่อสัตย์';
  return `${c.th||'ขุนพล'}แห่ง${fac} ${trait}`;
}

/* element-based hp + base power per class */
const CLASS_HP = { commander:120, champion:160, vanguard:130, sentinel:170, strategist:90 };

/* ---------------- 四季 FOUR SEASONS (1 เทิร์น = 1 ฤดู · 4 ฤดู = 1 ปี) ---------------- */
const SEASONS = [
  { zh:'春', th:'ฤดูใบไม้ผลิ', en:'Spring', icon:'🌸' },
  { zh:'夏', th:'ฤดูร้อน',     en:'Summer', icon:'☀️' },
  { zh:'秋', th:'ฤดูใบไม้ร่วง', en:'Autumn', icon:'🍂' },
  { zh:'冬', th:'ฤดูหนาว',     en:'Winter', icon:'❄️' }
];

/* ---------------- 官職 COURT POSTS (ตำแหน่งราชการ — แต่งตั้งแล้วได้บัฟทั้งก๊ก) ---------------- */
const COURT_POSTS = {
  chancellor:      { zh:'丞相', th:'อัครมหาเสนาบดี', icon:'🪶', stat:'pol', en:'Chancellor',
    desc:'เพิ่มรายได้ทุกเมืองตามการเมือง (政)' },
  grand_commander: { zh:'大都督', th:'แม่ทัพใหญ่', icon:'🎖️', stat:'war', en:'Grand Commander',
    desc:'เกณฑ์ไพร่ได้มากขึ้น และได้เปรียบในการศึก (武)' },
  strategist:      { zh:'軍師', th:'ที่ปรึกษาการศึก', icon:'📜', stat:'int', en:'Military Advisor',
    desc:'เสริมการป้องกันเมือง และกลศึก (智)' },
  treasurer:       { zh:'治粟', th:'ขุนคลัง', icon:'🪙', stat:'pol', en:'Treasurer',
    desc:'ลดค่าจ้าง/บำรุงขุนพล (政)' },
  inspector:       { zh:'御史', th:'ราชเลขาธิการ', icon:'⚖️', stat:'int', en:'Inspector',
    desc:'ราษฎรภักดีขึ้นทุกฤดู (智)' }
};

/* ---------------- GUANXI seed relationships (-100..100) ---------------- */
const RELATION_SEED = [
  ['g_liubei','g_guanyu',95],['g_liubei','g_zhangfei',95],['g_guanyu','g_zhangfei',92], // 桃園 oath brothers
  ['g_caocao','g_xunyu',70],['g_caocao','g_xiahoudun',80],['g_xiahoudun','g_xiahouyuan',75],
  ['g_sunjian','g_sunce',96],['g_chengpu','g_huanggai',60],
  ['g_lubu','g_dongzhuo',-30],['g_lubu','g_caocao',-60],['g_lubu','g_liubei',-50],
  ['g_guanyu','g_caocao',25],['g_machao','g_mateng',96],['g_machao','g_caocao',-90],
  ['g_yanliang','g_wenchou',70],['g_zhugeliang','g_zhouyu',-40],
  ['g_zhaoyun','g_liubei',60],['g_dianwei','g_caocao',80],
  // --- new retainer bonds ---
  ['g_caoren','g_caohong',78],['g_caoren','g_caocao',70],['g_yuejin','g_lidian',55],
  ['g_caocao','g_xunyou',66],['g_xunyu','g_xunyou',72],
  ['g_liubei','g_mizhu',62],['g_mizhu','g_mifuren',90],['g_liubei','g_mifuren',70],
  ['g_guanyu','g_guanping',92],
  ['g_sunjian','g_sunquan',86],['g_sunce','g_sunquan',82],['g_sunjian','g_wufuren',82],['g_wufuren','g_sunce',88],
  ['g_zhanghe','g_gaolan',58],['g_tianfeng','g_jutshou',62],['g_tianfeng','g_shenpei',50],
  ['g_lijue','g_guosi',60],['g_xurong','g_dongzhuo',40],
  ['g_machao','g_madai',88],['g_mateng','g_hansui',40],['g_madai','g_mateng',70],
  ['g_zhangren','g_yanyan',55],
  // --- 士 SHI clan of Jiao (brothers + heir) ---
  ['g_shixie','g_shiyi',85],['g_shixie','g_shiwei',82],['g_shixie','g_shiwu',80],
  ['g_shiyi','g_shiwei',75],['g_shiyi','g_shiwu',72],['g_shiwei','g_shiwu',70],
  ['g_shixie','g_shixiewife',80],['g_shixie','g_shihui',86],['g_shixiewife','g_shihui',88],
  // --- 陳 CHEN · Liu Chong's loyal court + feud with Yuan Shu ---
  ['g_liuchong','g_luojun',88],['g_liuchong','g_liuchongwife',80],
  ['g_liuchong','g_liuze',86],['g_liuchongwife','g_liuze',88],['g_luojun','g_liuze',60],
  ['g_liuchong','g_yuanshu',-70],['g_luojun','g_yuanshu',-65]
];

/* ---------------- REFORM TECH TREE (peach-blossom) ---------------- */
/* unlocked one node per 5 turns; tiers gate on prerequisites */
const REFORMS = {
  r_agri:   { zh:'屯田', th:'ทุนเถียน (เกษตรทหาร)', tier:0, req:[], cost:0,  effect:'+15% รายได้เสบียงทุกเมือง', icon:'🌾' },
  r_levy:   { zh:'徵兵', th:'ระบบเกณฑ์ไพร่', tier:0, req:[], cost:0, effect:'เกณฑ์ทหารถูกลง 25%', icon:'⚔️' },
  r_market: { zh:'通商', th:'เปิดเส้นทางการค้า', tier:1, req:['r_agri'], cost:80, effect:'+20% ทองคลังหลวงต่อเทิร์น', icon:'🪙' },
  r_smith:  { zh:'鍛冶', th:'โรงตีเหล็ก', tier:1, req:['r_levy'], cost:80, effect:'ปลดล็อกทหารชั้นสูง +10% โจมตี', icon:'🔨' },
  r_academy:{ zh:'學府', th:'สำนักตำราพิชัยสงคราม', tier:2, req:['r_market'], cost:140, effect:'กุนซือปลดล็อกแผน “ซุ่มโจมตี”', icon:'📜' },
  r_cavalry:{ zh:'西涼鐵騎', th:'ทหารม้าเหล็กซีเหลียง', tier:2, req:['r_smith'], cost:140, effect:'ทหารม้า +20% พลังทะลวง', icon:'🐎' },
  r_navy:   { zh:'樓船', th:'อู่ต่อเรือรบ', tier:2, req:['r_market'], cost:140, effect:'รบทางน้ำ/ข้ามแม่น้ำได้เปรียบ', icon:'⛵' },
  r_fire:   { zh:'火攻', th:'ตำราเพลิงพิโรธ', tier:3, req:['r_academy'], cost:220, effect:'กุนซือปลดล็อก “ธนูไฟ” เผาทัพ', icon:'🔥' },
  r_govern: { zh:'仁政', th:'ทศพิธราชธรรม', tier:3, req:['r_academy'], cost:220, effect:'+10% ความภักดีราษฎรทุกเมือง', icon:'🏛️' },
  r_empire: { zh:'王道', th:'ราชธรรมครองแผ่นดิน', tier:4, req:['r_fire','r_govern'], cost:360, effect:'รวมโบนัสทุกด้าน · เปิดทางสถาปนาราชวงศ์', icon:'👑' }
};

/* ---------------- LEGENDARY TREASURES (ของวิเศษ) ---------------- */
const TREASURES = {
  jade_seal:  { zh:'傳國玉璽', th:'ตราลัญจกรหยก', en:'Imperial Jade Seal', icon:'🏵️',
    desc:'ตราอาญาสิทธิ์แห่งแผ่นดินที่สืบทอดจากจิ๋นซีฮ่องเต้ ผู้ครอบครองย่อมอ้างสิทธิ์สถาปนาตนเป็นฮ่องเต้ได้ แม้มิได้กุมองค์ฮ่องเต้จริง',
    effect:'ปลดล็อก “ประกาศตั้งตนเป็นฮ่องเต้” แม้ไร้องค์ฮ่องเต้', bonus:{} },
  red_hare:   { zh:'赤兔馬', th:'ม้าเซ็กเธาว์', en:'Red Hare', icon:'🐎',
    desc:'ยอดอาชาวันละพันลี้ สีแดงดั่งเพลิง เสริมพละกำลังการบุกทะลวงของขุนพลผู้ขี่',
    effect:'+12 บู๊ แก่ขุนพลผู้ครอบครอง', bonus:{war:12} },
  seven_star: { zh:'七星寶刀', th:'กระบี่เจ็ดดารา', en:'Seven-Stars Sabre', icon:'🗡️',
    desc:'กระบี่ล้ำค่าฝังดาราเจ็ดดวงของอ้องอุ้น คมกริบปานสายฟ้า',
    effect:'+8 บู๊ แก่ขุนพลผู้ครอบครอง', bonus:{war:8} },
  art_of_war: { zh:'孫子兵法', th:'พิชัยสงครามซุนวู', en:"Sunzi's Art of War", icon:'📜',
    desc:'คัมภีร์ยุทธศาสตร์อมตะสิบสามบท เพิ่มพูนปัญญาการศึกแก่ผู้ศึกษา',
    effect:'+12 สติปัญญา แก่ขุนพลผู้ครอบครอง', bonus:{int:12} }
};


/* ============================================================
   HISTORICAL EVENTS
   - body    : เนื้อความเหตุการณ์ (ภาษาไทย)
   - cond(S) : ถ้าคืนค่าเท็จ เหตุการณ์จะ"ไม่เกิดขึ้น"ตามสภาพการเล่นจริง
               (เช่น ถ้าผู้เล่นปราบตั๋งโต๊ะไปก่อน หรือลิโป้ไม่ได้รับใช้ตั๋งโต๊ะ
                เหตุการณ์ลิโป้สังหารตั๋งโต๊ะจะไม่ปรากฏ)
   ============================================================ */
const HISTORICAL_EVENTS = [
  { year:191, key:'ev_coalition', title:'พันธมิตร 18 ก๊กปราบตั๋งโต๊ะ', zh:'討董聯盟',
    body:'เหล่าขุนศึกรวมตัวเป็นพันธมิตรบุกลกเอี๋ยง ตั๋งโต๊ะเผาเมืองหลวงหนีไปเตียงอันพร้อมอัญเชิญฮ่องเต้เหี้ยนเต้ไปด้วย! ความวุ่นวายแผ่ทั่วแผ่นดิน',
    cond:(S)=> S.owner['P01']==='dong_zhuo',
    effect:(S)=>{ if(S.owner['P01']==='dong_zhuo'){ S.owner['P01']=null; S.troops['P01']=40; } } },
  { year:191, key:'ev_jadeseal', title:'ตราลัญจกรหยกปรากฏในบ่อน้ำ', zh:'玉璽現世',
    body:'ท่ามกลางซากเพลิงของลกเอี๋ยง มีแสงประหลาดฉายจากบ่อน้ำในวัง ผู้พบศพนางในกุมตราลัญจกรหยก — ตราอาญาสิทธิ์แห่งฮ่องเต้! ผู้ใดครองตรานี้ย่อมมีสิทธิ์อ้างราชบัลลังก์',
    cond:(S)=> !(S.treasures && S.treasures.jade_seal && S.treasures.jade_seal.found),
    effect:(S)=>{ if(typeof discoverJadeSeal==='function') discoverJadeSeal(); } },
  { year:192, key:'ev_dongdie', title:'อวสานตั๋งโต๊ะ', zh:'董卓之死',
    body:'แผนกลยุทธ์สาวงามสำเร็จ! ลิโป้หันมาสังหารตั๋งโต๊ะ ก๊กตั๋งโต๊ะแตกกระเจิง ฮ่องเต้ตกอยู่ใต้อำนาจทหารกบฏที่เตียงอัน ลิโป้กลายเป็นขุนศึกเร่ร่อน',
    /* ไม่เกิดถ้าผู้เล่นปราบตั๋งโต๊ะไปก่อน หรือลิโป้ไม่ได้รับใช้ตั๋งโต๊ะแล้ว */
    cond:(S)=>{ const dz=(typeof genById==='function')?genById('g_dongzhuo'):null;
      const lb=(typeof genById==='function')?genById('g_lubu'):null;
      return !!dz && dz.faction==='dong_zhuo' && !!lb && lb.faction==='dong_zhuo'; },
    effect:(S)=>{ Object.keys(S.owner).forEach(k=>{ if(S.owner[k]==='dong_zhuo') S.owner[k]=null; });
      const lu=S.generals.find(g=>g.key==='g_lubu'); if(lu) lu.faction='neutral'; } },
  { year:194, key:'ev_famine', title:'ทุพภิกขภัยกลางแผ่นดิน', zh:'中原大饑',
    body:'ภัยแล้งและตั๊กแตนทำลายไร่นา เสบียงทั่วแผ่นดินร่อยหรอ ทุกก๊กสูญเสียความมั่งคั่ง',
    effect:(S)=>{ Object.keys(S.wealth).forEach(k=> S.wealth[k]=Math.floor(S.wealth[k]*0.85)); } },
  { year:196, key:'ev_emperor', title:'อัญเชิญฮ่องเต้ประทับฮูโต๋', zh:'挾天子以令諸侯',
    body:'ฮ่องเต้เหี้ยนเต้หลบหนีจากเตียงอันกลับสู่ลกเอี๋ยงอันรกร้าง ผู้ใดกุมตัวฮ่องเต้ไว้ ย่อมได้อ้างพระบรมราชโองการสั่งการขุนศึกทั้งปวง — เปิดใช้ “ราชสำนัก” ออกราชโองการได้',
    cond:(S)=> S.court ? (S.court.han !== false) : true,
    effect:(S)=>{ S.flags.emperorEvent=true; } },
  { year:197, key:'ev_yuanshu', title:'อ้วนสุดสถาปนาตนเป็นฮ่องเต้', zh:'袁術稱帝',
    body:'อ้วนสุดได้ครองตราลัญจกรหยก หลงระเริงประกาศตั้งราชวงศ์ “จ้ง” สถาปนาตนเป็นฮ่องเต้ที่ซิ่วชุน! ขุนศึกทั่วแผ่นดินตราหน้าว่าเป็นกบฏ ต่างยกทัพมาปราบ',
    cond:(S)=> (typeof genById==='function') && !!genById('g_yuanshu')
      && (typeof factionProvinces==='function') && factionProvinces('yuan_shu').length>0
      && S.baseWarlord!=='yuan_shu',
    effect:(S)=>{ if(typeof yuanShuProclaims==='function') yuanShuProclaims(); } },
  /* เล่าโต้ (劉度) เจ้าเมืองเลงเหลง — แปลจากต้นฉบับภาษาอังกฤษเป็นสำนวนเจ้าพระยาพระคลัง (หน) */
  { year:209, key:'ev_liubei_south', title:'เล่าปี่ตีได้สี่หัวเมืองใต้เกงจิ๋ว', zh:'劉備定荊南',
    body:'ฝ่ายเล่าโต้เป็นขุนนางผู้ครองหัวเมืองเลงเหลงมาแต่ครั้งราชวงศ์ฮั่นบูรพา ครั้นถึงศักราชนั้น เล่าปี่ยกกองทัพลงไปตีหัวเมืองทักษิณแห่งเกงจิ๋วทั้งสี่ คือเมืองบูเหลง เมืองฉางซา เมืองกุ้ยหยาง แลเมืองเลงเหลง เล่าโต้เห็นกองทัพเล่าปี่ใหญ่หลวงนัก ก็มิอาจต้านทาน จึงออกมาสวามิภักดิ์ยอมอ่อนน้อมโดยดี พร้อมด้วยเจ้าเมืองอีกสามหัวเมืองนั้นสิ้น เล่าปี่ก็ได้หัวเมืองฝ่ายใต้ไว้เป็นที่มั่นสืบมา',
    /* ไม่เกิดถ้าเล่าปี่ถูกปราบไปแล้ว หรือผู้เล่นคือก๊กเล่าปี่เอง */
    cond:(S)=> (typeof genById==='function') && !!genById('g_liubei')
      && (typeof factionProvinces==='function') && factionProvinces('liu_bei').length>0
      && S.baseWarlord!=='liu_bei',
    effect:(S)=>{ ['P64','P60','P20','P65'].forEach(k=>{ if(S.owner[k]==null){ S.owner[k]='liu_bei'; S.troops[k]=Math.max(S.troops[k]||0,30); } }); } }
];

/* helper getters */
function provName(k){ return PROVINCES[k] ? PROVINCES[k].name.split(' ')[1] : k; }
function provZh(k){ return PROVINCES[k] ? PROVINCES[k].name.split(' ')[0] : ''; }
function classOf(g){ return HERO_CLASSES[g.cls]; }

/* ============================================================
   RANDOM EVENT DECK — สำรับเหตุการณ์สุ่มแบบมีตัวเลือก (สำนวนเจ้าพระยาพระคลัง หน)
   เติม "คอนเทนต์ระหว่างทาง" ให้ช่วงกลางเกมมีชีวิต และต่างกันทุกรอบที่เล่น
   ----------------------------------------------------------------
   โครงสร้างแต่ละใบ:
     key, title, zh, weight        — น้ำหนักการสุ่ม (มาก=โผล่บ่อย)
     cond(S)        → bool          — เกิดได้ในสถานการณ์นี้หรือไม่
     pick(S)        → ctx | null    — เลือกเป้าหมาย (เมือง/ขุนพล); null = ข้ามไป
     body(S,c)      → string        — เนื้อความเหตุการณ์
     choices:[{ label, hint, enabled(S,c), effect(S,c)→ผลลัพธ์(string) }]
   ============================================================ */
function evRand(a){ return (a && a.length) ? a[Math.floor(Math.random()*a.length)] : null; }
function evClamp(v,lo,hi){ return Math.max(lo, Math.min(hi, v)); }
function evPlayerProvs(){ return (typeof factionProvinces==='function') ? factionProvinces('player') : []; }
function evPlayerOfficers(){ return G.generals.filter(g=>g.faction==='player' && !g.lord && !g.child && !g.onMission && g.sex!=='f'); }
function evPlayerLord(){ return G.generals.find(g=>g.faction==='player' && g.lord); }
function evLoyDelta(prov,d){ if(prov!=null) G.loyalty[prov]=evClamp((G.loyalty[prov]||50)+d,0,100); }
function evLoyAll(d){ evPlayerProvs().forEach(k=>{ G.loyalty[k]=evClamp((G.loyalty[k]||50)+d,0,100); }); }

const RANDOM_EVENTS = [
  /* ---------- ภัยพิบัติ + ภาวะวิกฤต (มีต้นทุนให้ตัดสินใจ) ---------- */
  { key:'rev_refugees', title:'ราษฎรอพยพมาพึ่งบารมี', zh:'流民來投', weight:10,
    cond:(S)=> evPlayerProvs().length>0,
    pick:(S)=>{ const p=evRand(evPlayerProvs()); return p?{prov:p}:null; },
    body:(S,c)=>`ฝ่ายราษฎรหนีศึกจากแดนไกลพากันอพยพมาเป็นอันมาก มาขออาศัยใต้ร่มบารมีของท่าน ณ เมือง${provName(c.prov)} เสนาอำมาตย์เข้ามาแจ้งว่าจะรับไว้หรือจะขับไล่เสียประการใด`,
    choices:[
      { label:'รับราษฎรไว้เป็นกำลังเมือง', hint:'−30 คลัง · +กำลังพล +ขวัญราษฎร',
        enabled:(S)=> S.treasury.player>=30,
        effect:(S,c)=>{ S.treasury.player-=30; S.troops[c.prov]=(S.troops[c.prov]||0)+12; evLoyDelta(c.prov,6);
          return `ท่านจึงให้เกลี้ยกล่อมรับราษฎรไว้ จัดที่ทำกินให้ทั่วกัน ผู้คนต่างสรรเสริญในพระคุณ เมือง${provName(c.prov)}ได้กำลังพลเพิ่มขึ้น ขวัญราษฎรก็ดีขึ้นด้วย`; } },
      { label:'ขับไล่ออกไปเสีย', hint:'−ขวัญราษฎร แต่ไม่เปลืองเสบียง',
        effect:(S,c)=>{ evLoyDelta(c.prov,-8);
          return `ท่านมิอาจเลี้ยงดูคนมากได้ จึงให้ขับราษฎรออกไปเสีย ผู้คนต่างน้อยใจ ขวัญกำลังใจในเมือง${provName(c.prov)}เสื่อมถอยลง`; } }
    ] },
  { key:'rev_flood', title:'ฮวงโหเอ่อท่วมหัวเมือง', zh:'河水氾濫', weight:8,
    cond:(S)=> evPlayerProvs().length>0,
    pick:(S)=>{ const p=evRand(evPlayerProvs()); return p?{prov:p}:null; },
    body:(S,c)=>`ฝ่ายว่าน้ำในแม่น้ำฮวงโหเอ่อล้นตลิ่ง ท่วมไร่นาบ้านเรือนในเมือง${provName(c.prov)}เสียหายยับเยิน ราษฎรเดือดร้อนร้องทุกข์มาถึงท่าน`,
    choices:[
      { label:'ทุ่มคลังหลวงบรรเทาทุกข์', hint:'−45 คลัง · รักษาขวัญราษฎร',
        enabled:(S)=> S.treasury.player>=45,
        effect:(S,c)=>{ S.treasury.player-=45; evLoyDelta(c.prov,5);
          return `ท่านจึงเปิดคลังหลวงออกแจกจ่ายข้าวปลา เกณฑ์ไพร่ซ่อมทำนบกั้นน้ำ ราษฎรเมือง${provName(c.prov)}สำนึกในพระคุณ บ้านเมืองกลับเป็นปกติโดยเร็ว`; } },
      { label:'ปล่อยให้ราษฎรช่วยตนเอง', hint:'−ความมั่งคั่ง −ขวัญราษฎรมาก',
        effect:(S,c)=>{ S.wealth[c.prov]=evClamp(Math.floor((S.wealth[c.prov]||0)*0.8),0,9999); evLoyDelta(c.prov,-12);
          return `ท่านนิ่งเฉยมิได้ช่วยเหลือ ราษฎรเมือง${provName(c.prov)}อดอยากล้มตาย ทรัพย์สินในเมืองเสียหาย ผู้คนต่างเคืองแค้นในใจ`; } }
    ] },
  { key:'rev_plague', title:'โรคห่าระบาดในเมือง', zh:'瘟疫流行', weight:7,
    cond:(S)=> evPlayerProvs().length>0,
    pick:(S)=>{ const p=evRand(evPlayerProvs()); return p?{prov:p}:null; },
    body:(S,c)=>`ฝ่ายเกิดโรคห่าระบาดขึ้นในเมือง${provName(c.prov)} ผู้คนล้มป่วยลงเป็นอันมาก ทั้งไพร่พลในกองทัพก็พลอยติดโรคด้วย`,
    choices:[
      { label:'ส่งหมอหลวงเข้าเยียวยา', hint:'−35 คลัง · คุมโรคได้',
        enabled:(S)=> S.treasury.player>=35,
        effect:(S,c)=>{ S.treasury.player-=35; evLoyDelta(c.prov,3);
          return `ท่านให้หมอหลวงตั้งโรงยาแจกจ่ายตัวยา ไม่ช้าโรคห่าก็สงบลง ราษฎรเมือง${provName(c.prov)}รอดพ้นภยันตราย`; } },
      { label:'สั่งกักโรคปิดเมือง', hint:'−กำลังพลในเมืองนั้น',
        effect:(S,c)=>{ S.troops[c.prov]=evClamp(Math.floor((S.troops[c.prov]||0)*0.78),0,9999);
          return `ท่านให้ปิดประตูเมืองกักกันโรคไว้ โรคห่าค่อยสงบ แต่ไพร่พลในเมือง${provName(c.prov)}ล้มตายไปไม่น้อย`; } }
    ] },

  /* ---------- โอกาส + ลาภลอย ---------- */
  { key:'rev_harvest', title:'ปีทองเก็บเกี่ยวงาม', zh:'五穀豐登', weight:9,
    cond:(S)=> evPlayerProvs().length>0,
    pick:(S)=>({}),
    body:(S,c)=>`ฝ่ายว่าปีนี้ฟ้าฝนตกต้องตามฤดูกาล ข้าวกล้าในนางอกงามอุดมสมบูรณ์ทั่วทุกหัวเมืองของท่าน ราษฎรต่างชื่นชมยินดี`,
    choices:[
      { label:'รับพรแห่งความอุดม', hint:'ทุกเมือง +ความมั่งคั่ง',
        effect:(S,c)=>{ evPlayerProvs().forEach(k=>{ S.wealth[k]=(S.wealth[k]||0)+8; }); evLoyAll(2);
          return `ฉางข้าวทุกหัวเมืองเต็มบริบูรณ์ ความมั่งคั่งเพิ่มพูนขึ้นทั่วแผ่นดินของท่าน ราษฎรอยู่เย็นเป็นสุข`; } }
    ] },
  { key:'rev_loyalgift', title:'ขุนพลถวายบรรณาการ', zh:'進貢獻寶', weight:7,
    cond:(S)=> evPlayerOfficers().some(g=>g.loyalty>=70),
    pick:(S)=>{ const g=evRand(evPlayerOfficers().filter(x=>x.loyalty>=70)); return g?{gen:g.key}:null; },
    body:(S,c)=>{ const g=genById(c.gen); return `ฝ่าย${g?g.short:'ขุนพล'}ผู้ภักดี นำทองและของกำนัลอันได้มาจากการศึก เข้ามาถวายแก่ท่านด้วยความสวามิภักดิ์`; },
    choices:[
      { label:'รับไว้ด้วยความยินดี', hint:'+60 คลัง · +ความภักดี',
        effect:(S,c)=>{ const g=genById(c.gen); S.treasury.player+=60; if(g) g.loyalty=evClamp(g.loyalty+4,0,100);
          return `ท่านรับบรรณาการไว้แล้วปูนบำเหน็จตอบแทน ${g?g.short:'ขุนพล'}ปลื้มปีติ ยิ่งภักดีต่อท่านมากขึ้น คลังหลวงเพิ่มพูน`; } }
    ] },
  { key:'rev_horse', title:'พ่อค้าม้าซีเหลียงเข้าเฝ้า', zh:'西涼販馬', weight:7,
    cond:(S)=> evPlayerProvs().length>0,
    pick:(S)=>{ const p=evRand(evPlayerProvs()); return p?{prov:p}:null; },
    body:(S,c)=>`ฝ่ายพ่อค้าจากแดนซีเหลียงนำฝูงม้าศึกชั้นดีหลายร้อยตัวมาเร่ขาย ว่าหากท่านซื้อไว้ก็จะได้กองทหารม้าอันเกรียงไกร`,
    choices:[
      { label:'ซื้อม้าศึกเสริมทัพ', hint:'−55 คลัง · +กำลังพล',
        enabled:(S)=> S.treasury.player>=55,
        effect:(S,c)=>{ S.treasury.player-=55; S.troops[c.prov]=(S.troops[c.prov]||0)+16;
          return `ท่านซื้อม้าศึกไว้ทั้งสิ้น ตั้งเป็นกองทหารม้าประจำเมือง${provName(c.prov)} กำลังทัพเข้มแข็งขึ้นเป็นอันมาก`; } },
      { label:'ปฏิเสธไป', hint:'ไม่เสียคลัง',
        effect:(S,c)=>`ท่านเห็นว่าราคาแพงนัก จึงมิได้ซื้อไว้ พ่อค้าก็ลาจากไปขายยังหัวเมืองอื่น` }
    ] },
  { key:'rev_sage', title:'ปราชญ์เร่ร่อนผ่านมา', zh:'隱士獻策', weight:6,
    cond:(S)=> G.generals.some(g=>g.faction==='neutral' && !g.child && (g.int>=82||g.war>=88)),
    pick:(S)=>{ const g=evRand(G.generals.filter(x=>x.faction==='neutral' && !x.child && (x.int>=82||x.war>=88))); return g?{gen:g.key}:null; },
    body:(S,c)=>`ฝ่ายมีปราชญ์ผู้หนึ่งเร่ร่อนผ่านมาขอพักพิง ครั้นสนทนาแล้วเห็นว่าเป็นผู้รู้ จึงบอกเบาะแสว่า ณ บัดนี้มีผู้มีฝีมือซ่อนเร้นอยู่ ณ หัวเมืองหนึ่ง`,
    choices:[
      { label:'เลี้ยงรับรองแล้วฟังเบาะแส', hint:'−25 คลัง · รู้ที่ตั้งขุนพลเก่ง',
        enabled:(S)=> S.treasury.player>=25,
        effect:(S,c)=>{ S.treasury.player-=25; const g=genById(c.gen);
          return g ? `ปราชญ์กระซิบว่า “${g.short} (${classOf(g)?classOf(g).th:''}) ผู้มีฝีมือ บัดนี้พำนักอยู่ ณ เมือง${provName(g.prov)} หากท่านไปเชิญมาไว้ ก็จะได้กำลังสำคัญ” แล้วก็ลาจากไป` : `ปราชญ์ให้คำพยากรณ์อันเป็นมงคลแล้วลาจากไป`; } },
      { label:'ให้ทานแล้วส่งไป', hint:'ไม่เสียคลัง',
        effect:(S,c)=>`ท่านให้ข้าวปลาอาหารแก่ปราชญ์พอประทังกาย แล้วปราชญ์ก็อำลาเดินทางต่อไป` }
    ] },

  /* ---------- การเมืองภายในก๊ก (ความภักดี/ขุนพล) ---------- */
  { key:'rev_feud', title:'ขุนพลสองนายแก่งแย่งกัน', zh:'將帥失和', weight:7,
    cond:(S)=> evPlayerOfficers().length>=2,
    pick:(S)=>{ const o=evPlayerOfficers().slice(); if(o.length<2) return null;
      const a=o.splice(Math.floor(Math.random()*o.length),1)[0]; const b=o.splice(Math.floor(Math.random()*o.length),1)[0];
      const strong = (a.war+a.int)>=(b.war+b.int)?a:b; const weak = strong===a?b:a;
      return {strong:strong.key, weak:weak.key}; },
    body:(S,c)=>{ const a=genById(c.strong),b=genById(c.weak); return `ฝ่าย${a?a.short:''}กับ${b?b.short:''} สองขุนพลในก๊กของท่านเกิดแก่งแย่งชิงดีกัน ถึงกับวิวาทกันต่อหน้าที่ประชุม ต่างฝ่ายต่างมาฟ้องร้องขอให้ท่านตัดสิน`; },
    choices:[
      { label:'เข้าข้างผู้มีฝีมือกว่า', hint:'คนเก่ง +ภักดี · อีกคน −ภักดี',
        effect:(S,c)=>{ const a=genById(c.strong),b=genById(c.weak); if(a)a.loyalty=evClamp(a.loyalty+6,0,100); if(b)b.loyalty=evClamp(b.loyalty-10,0,100);
          return `ท่านเข้าข้าง${a?a.short:''}ผู้มีฝีมือ ${a?a.short:''}ปลื้มใจในความไว้วางพระทัย แต่${b?b.short:''}กลับน้อยใจ ความภักดีเสื่อมถอย`; } },
      { label:'ไกล่เกลี่ยให้คืนดี', hint:'−25 คลัง · ทั้งคู่ +ภักดีเล็กน้อย',
        enabled:(S)=> S.treasury.player>=25,
        effect:(S,c)=>{ const a=genById(c.strong),b=genById(c.weak); S.treasury.player-=25; if(a)a.loyalty=evClamp(a.loyalty+3,0,100); if(b)b.loyalty=evClamp(b.loyalty+3,0,100);
          return `ท่านจัดงานเลี้ยงไกล่เกลี่ย พระราชทานรางวัลแก่ทั้งสองฝ่าย ${a?a.short:''}กับ${b?b.short:''}ก็คืนดีกัน ต่างซาบซึ้งในพระเมตตา`; } },
      { label:'ปล่อยให้ตกลงกันเอง', hint:'ทั้งคู่ −ภักดี',
        effect:(S,c)=>{ const a=genById(c.strong),b=genById(c.weak); if(a)a.loyalty=evClamp(a.loyalty-4,0,100); if(b)b.loyalty=evClamp(b.loyalty-4,0,100);
          return `ท่านมิได้ใส่ใจ ปล่อยให้สองขุนพลบาดหมางกันต่อไป ความระแวงลุกลาม ความภักดีของทั้งคู่เสื่อมลง`; } }
    ] },
  { key:'rev_comet', title:'ดาวหางปรากฏกลางเวหา', zh:'彗星示警', weight:6,
    cond:(S)=> evPlayerProvs().length>0,
    pick:(S)=>({}),
    body:(S,c)=>`ฝ่ายราตรีหนึ่งบังเกิดดาวหางพาดผ่านท้องฟ้า โหรหลวงทำนายว่าเป็นลางบอกเหตุ ราษฎรต่างหวาดหวั่นไปทั่วทั้งแผ่นดิน`,
    choices:[
      { label:'ตั้งพิธีบวงสรวงปัดเป่า', hint:'−30 คลัง · +ขวัญราษฎรทั่วแผ่นดิน',
        enabled:(S)=> S.treasury.player>=30,
        effect:(S,c)=>{ S.treasury.player-=30; evLoyAll(4);
          return `ท่านให้ตั้งพิธีบวงสรวงเทพยดาฟ้าดิน ราษฎรเห็นแล้วก็คลายความหวาดกลัว ขวัญกำลังใจกลับคืนมาทั่วทุกหัวเมือง`; } },
      { label:'เห็นว่าเป็นเรื่องงมงาย', hint:'−ขวัญราษฎรเล็กน้อย',
        effect:(S,c)=>{ evLoyAll(-3);
          return `ท่านเห็นว่าเป็นเพียงปรากฏการณ์ธรรมชาติ มิได้ทำพิธีใด ราษฎรบางส่วนหวาดหวั่นมิคลาย ขวัญกำลังใจถดถอยลงบ้าง`; } }
    ] },

  /* ---------- ได้ขุนพล / กำลังเสริม ---------- */
  { key:'rev_defector', title:'ขุนพลข้าศึกแปรพักตร์มาสวามิภักดิ์', zh:'敵將來降', weight:6,
    cond:(S)=> evPlayerProvs().length>0 && G.generals.some(g=>g.faction!=='player' && g.faction!=='neutral' && !g.lord && !g.child && g.sex!=='f' && (typeof factionProvinces==='function') && factionProvinces(g.faction).length>0),
    pick:(S)=>{ const cand=G.generals.filter(g=>g.faction!=='player' && g.faction!=='neutral' && !g.lord && !g.child && g.sex!=='f' && factionProvinces(g.faction).length>0);
      const g=evRand(cand); return g?{gen:g.key, from:g.faction}:null; },
    body:(S,c)=>{ const g=genById(c.gen); return `ฝ่าย${g?g.short:'ขุนพล'}แห่งก๊ก${factionName(c.from)} ผิดใจกับเจ้านายเดิม ลอบหนีมาขอสวามิภักดิ์ต่อท่าน ขอเข้ามาเป็นกำลังรับใช้ใต้ธง`; },
    choices:[
      { label:'รับไว้เป็นขุนพลของเรา', hint:'ได้ขุนพลใหม่ · อาจกระทบไมตรีก๊กเดิม',
        effect:(S,c)=>{ const g=genById(c.gen); if(!g) return 'แต่ผู้นั้นกลับใจหนีไปเสียก่อน'; const from=g.faction;
          g.faction='player'; g.lord=false; g.loyalty=70; g.prov=(FACTIONS.player.capital)||evPlayerProvs()[0]||g.prov;
          return `ท่านรับ${g.short}ไว้เป็นขุนพล มอบที่พำนัก ณ เมืองหลวง ${g.short}ซาบซึ้งยอมถวายชีวิตรับใช้ — แต่ก๊ก${factionName(from)}ย่อมแค้นเคืองในการนี้`; } },
      { label:'ไม่ไว้ใจ ขับไล่ไป', hint:'+คุณธรรม (ไม่รับคนทรยศ)',
        effect:(S,c)=>{ const g=genById(c.gen);
          return `ท่านเห็นว่าผู้ทรยศนายเก่าย่อมทรยศนายใหม่ได้ จึงมิรับไว้ ${g?g.short:'ผู้นั้น'}ได้แต่ผิดหวังจากไป ชื่อเสียงด้านคุณธรรมของท่านเลื่องลือ`; } }
    ] },
  { key:'rev_bandittreasure', title:'ปราบโจรป่าได้ขุมทรัพย์', zh:'剿匪獲財', weight:6,
    cond:(S)=> evPlayerOfficers().length>=1 && evPlayerProvs().length>0,
    pick:(S)=>{ const g=evRand(evPlayerOfficers()); const p=evRand(evPlayerProvs()); return (g&&p)?{gen:g.key,prov:p}:null; },
    body:(S,c)=>{ const g=genById(c.gen); return `ฝ่ายมีโจรป่าชุกชุมปล้นสะดมอยู่ชานเมือง${provName(c.prov)} ราษฎรเดือดร้อน ท่านจะให้${g?g.short:'ขุนพล'}ยกไปปราบหรือไม่`; },
    choices:[
      { label:'ส่งขุนพลยกไปปราบ', hint:'ขุนพลบู๊สูงยิ่งได้ผลดี',
        effect:(S,c)=>{ const g=genById(c.gen); const win = g && (g.war + Math.random()*40) > 70;
          if(win){ const loot=30+Math.floor(Math.random()*30); S.treasury.player+=loot; if(g)g.loyalty=evClamp(g.loyalty+4,0,100); evLoyDelta(c.prov,4);
            return `${g?g.short:'ขุนพล'}ยกทัพไปปราบโจรป่าแตกพ่าย ยึดได้ขุมทรัพย์ของโจรมาเข้าคลังหลวง ${loot} ตำลึงทอง ราษฎรเมือง${provName(c.prov)}สรรเสริญ`; }
          else { evLoyDelta(c.prov,-3); return `${g?g.short:'ขุนพล'}ยกไปปราบ แต่โจรป่าชำนาญภูมิประเทศ หลบหนีเข้าดงไปได้ การปราบมิสำเร็จดังหวัง`; } } },
      { label:'เพิกเฉยปล่อยไว้', hint:'−ขวัญราษฎรเมืองนั้น',
        effect:(S,c)=>{ evLoyDelta(c.prov,-6);
          return `ท่านมิได้ส่งทัพไปปราบ โจรป่ายิ่งกำเริบปล้นสะดมหนักขึ้น ราษฎรเมือง${provName(c.prov)}เดือดร้อนระส่ำระสาย`; } }
    ] }
];

/* ============================================================
   BORDER RAIDS — ภัยชายแดน (โจรโพกผ้าเหลือง / อนารยชน)
   เมืองชายขอบถูกกดดันเป็นระยะ ต้องคอยตั้งทัพรับมือตลอดเกม
   ----------------------------------------------------------------
   แต่ละเผ่ามี frontier = หัวเมืองชายแดนที่ตนเข้าปล้นได้
   ฝ่ายตั้งรับคำนวณจาก: กำลังพลในเมือง + บู๊ของแม่ทัพประจำเมือง
   ============================================================ */
const BORDER_RAIDS = [
  { key:'raid_qiang', tribe:'เกี๋ยง', zhTribe:'羌', title:'เกี๋ยงปล้นแดนตะวันตก', zh:'西羌入寇',
    frontier:['P29','P28','P26','P13','P12','P32','P33'],
    blurb:'ฝ่ายพวกเกี๋ยงอนารยชนแห่งแดนซีเหลียง ยกกองม้าเข้าปล้นสะดม' },
  { key:'raid_wuhuan', tribe:'อูหวน', zhTribe:'烏桓', title:'อูหวนปล้นแดนเหนือ', zh:'烏桓寇邊',
    frontier:['P15','P09','P31','P25','P30','P14','P36'],
    blurb:'ฝ่ายพวกอูหวนแลเซียนปีกองม้าลงมาจากแดนเหนือ เข้าปล้นเมืองชายแดน' },
  { key:'raid_nanman', tribe:'หนานหมาน', zhTribe:'南蠻', title:'หนานหมานกบฏแดนใต้', zh:'南蠻作亂',
    frontier:['P58','P59','P63','P68','P72','P73','P69','P67'],
    blurb:'ฝ่ายพวกหนานหมานอนารยชนแดนทักษิณ ก่อการกำเริบเข้าปล้นหัวเมือง' },
  { key:'raid_turban', tribe:'โจรโพกผ้าเหลือง', zhTribe:'黃巾', title:'โจรโพกผ้าเหลืองกำเริบ', zh:'黃巾餘黨',
    frontier:['P37','P16','P38','P44','P45','P40','P51','P66','P35','P17'],
    blurb:'ฝ่ายโจรโพกผ้าเหลืองที่ยังหลงเหลือ ซ่องสุมผู้คนกำเริบเสิบสานขึ้นอีก' }
];

/* ---------------- GEOGRAPHIC COORDS on Eastern-Han map (x%, y%) ---------------- */
const MAP_XY = {
  /* --- 涼州 Hexi corridor (NW thin peninsula) --- */
  P29:{x:15,y:13}, P28:{x:21,y:17}, P13:{x:26,y:22}, P26:{x:30,y:27}, P32:{x:35,y:29}, P12:{x:34,y:34},
  /* --- 關中 / 司隸 Guanzhong & central --- */
  P02:{x:43,y:37}, P33:{x:46,y:27}, P01:{x:52,y:39}, P17:{x:60,y:36}, P23:{x:57,y:38}, P03:{x:56,y:41},
  /* --- 益州 Shu / Sichuan --- */
  P11:{x:43,y:44}, P48:{x:36,y:47}, P49:{x:40,y:49}, P05:{x:31,y:51}, P27:{x:40,y:53}, P55:{x:35,y:56}, P56:{x:45,y:51},
  /* --- 并州 / 冀州 north-central --- */
  P14:{x:54,y:30}, P34:{x:51,y:34}, P30:{x:56,y:21}, P08:{x:58,y:32}, P35:{x:63,y:29},
  /* --- 幽州 You (far NE) --- */
  P15:{x:66,y:19}, P09:{x:71,y:17}, P36:{x:68,y:28}, P37:{x:69,y:33}, P25:{x:83,y:12}, P31:{x:85,y:10},
  /* --- 青州 / 徐州 Shandong & east --- */
  P16:{x:76,y:30}, P38:{x:75,y:33}, P39:{x:75,y:39}, P07:{x:71,y:43}, P41:{x:68,y:42}, P42:{x:74,y:44}, P46:{x:76,y:47},
  /* --- 豫州 central plains --- */
  P40:{x:60,y:42}, P18:{x:55,y:43}, P24:{x:52,y:45}, P44:{x:62,y:43}, P45:{x:65,y:41}, P43:{x:48,y:46},
  /* --- 荊州 Jing --- */
  P06:{x:53,y:48}, P50:{x:53,y:46}, P19:{x:54,y:52}, P52:{x:62,y:51}, P60:{x:50,y:55}, P20:{x:58,y:58}, P64:{x:53,y:64}, P65:{x:60,y:66},
  /* --- 揚州 Yang / 江東 Wu (SE) --- */
  P10:{x:68,y:46}, P51:{x:70,y:49}, P53:{x:72,y:50}, P04:{x:78,y:49}, P21:{x:82,y:48}, P54:{x:81,y:52}, P57:{x:81,y:56},
  P62:{x:75,y:53}, P22:{x:66,y:53}, P61:{x:70,y:58}, P66:{x:70,y:63}, P71:{x:77,y:62},
  /* --- 交州 far south --- */
  P67:{x:58,y:70}, P70:{x:64,y:76}, P69:{x:53,y:77}, P68:{x:42,y:85}, P72:{x:37,y:89}, P73:{x:37,y:94},
  /* --- 益州南 SW deep south --- */
  P58:{x:30,y:60}, P59:{x:41,y:61}, P63:{x:33,y:67}
};

/* ---------------- VECTOR LANDMASS (viewBox 0 0 100 103) ---------------- */
/* Eastern-Han China silhouette traced from the period map — NW Hexi corridor,
   Liaodong peninsula, Bohai bay, Shandong bulge, Yangtze delta, the southern
   Jiaozhi/Rinan panhandle and the SW Yunnan bulge. All city points fall on land. */
const LAND_PATH = 'M5,12 L10,9 L15,11 L20,14 L25,18 L30,22 L33,25 '          // 涼州 Hexi corridor (top edge)
 + 'L38,24 L44,26 L49,22 L52,17 L57,16 L62,15 L66,14 '                        // northern frontier
 + 'L71,13 L77,12 L82,9 L88,7 L91,9 L89,13 L86,14 '                           // 遼東 Liaodong (NE)
 + 'L84,18 L80,22 L76,25 L74,29 '                                             // 渤海 Bohai bay indent
 + 'L78,29 L84,31 L81,34 L77,37 '                                             // 青州 Shandong peninsula
 + 'L78,41 L78,45 L82,48 L85,51 L83,55 L80,58 '                               // east coast · 江東 Wu delta
 + 'L79,62 L75,66 L71,70 L68,74 L66,78 L61,80 L56,80 L51,79 '                 // 交州 SE coast
 + 'L47,81 L44,84 L41,88 L39,92 L38,96 L34,95 L34,90 '                        // 日南 Rinan panhandle
 + 'L37,85 L35,80 L33,75 L28,70 L23,65 L21,60 L25,56 L22,52 '                 // SW Yunnan bulge
 + 'L26,48 L24,44 L28,40 L30,36 L31,33 L30,29 L27,26 '                        // 益州 west frontier
 + 'L24,23 L18,19 L11,15 Z';                                                  // corridor bottom edge → tip

/* major rivers as flowing polylines (clipped to land) */
const RIVERS = [
  'M29,30 L35,32 L41,34 L46,35 L51,36 L56,34 L61,33 L66,32 L71,31 L77,30',   // 黃河 Yellow River
  'M30,52 L37,52 L44,53 L50,53 L55,52 L61,51 L67,51 L72,50 L78,49 L84,49'    // 長江 Yangtze
];

/* decorative islands (no provinces) */
const ISLANDS = [
  { d:'M48,83 L52,82 L53,85 L50,87 L47,85 Z', name:'珠崖' },   // 珠崖 Hainan (Gulf of Tonkin)
  { d:'M85,56 L88,57 L87,62 L84,61 Z', name:'夷洲' }            // 夷洲 Taiwan (off SE coast)
];
