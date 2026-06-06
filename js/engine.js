/* ============================================================
   engine.js — game state, persistence, core actions, turn loop
   ============================================================ */

const SAVE_KEY = 'TG3_SAVE';
let G = null;

/* ---------- relation key helpers ---------- */
function relKey(a, b){ return [a, b].sort().join('|'); }
function getRel(a, b){ if(a===b) return 0; return (G.relations[relKey(a,b)] ?? 0); }
function setRel(a, b, v){ G.relations[relKey(a,b)] = Math.max(-100, Math.min(100, Math.round(v))); }
function adjRel(a, b, d){ setRel(a, b, getRel(a,b) + d); }
function relWord(v){
  if(v>=60) return {t:'รักใคร่ดั่งพี่น้อง', c:'rel-love'};
  if(v>=20) return {t:'นับถือ/ชื่นชม', c:'rel-like'};
  if(v>-20) return {t:'เฉยๆ', c:'rel-neutral'};
  if(v>-60) return {t:'ระแวง/ไม่ลงรอย', c:'rel-dislike'};
  return {t:'เกลียดชัง', c:'rel-hate'};
}
/* family tie between two generals: 'pc' = พ่อแม่–ลูก, 'sib' = พี่น้อง, 'spouse' = คู่สมรส, else null */
function kinship(aKey, bKey){
  const a=genById(aKey), b=genById(bKey);
  if(!a||!b||aKey===bKey) return null;
  const aPar=a.parents||[], bPar=b.parents||[];
  if(aPar.includes(bKey) || bPar.includes(aKey)) return 'pc';                 // parent ↔ child
  if(aPar.length && bPar.length && aPar.some(p=>p && bPar.includes(p))) return 'sib'; // share a parent
  if((G.unions||[]).some(u=>(u.mother===aKey&&u.father===bKey)||(u.mother===bKey&&u.father===aKey))) return 'spouse';
  if((a.consortOf && a.consortOf===b.faction && b.lord) || (b.consortOf && b.consortOf===a.faction && a.lord)) return 'spouse';
  return null;
}
/* kinship-aware relationship label — falls back to plain affinity wording for non-kin */
function relLabel(aKey, bKey){
  const v=getRel(aKey,bKey), kin=kinship(aKey,bKey);
  if(kin==='pc'){
    if(v>=20) return {t:'ผูกพันฉันพ่อแม่ลูก', c:'rel-love'};
    if(v>-20) return {t:'พ่อแม่ลูกที่เหินห่าง', c:'rel-neutral'};
    return {t:'พ่อแม่ลูกที่บาดหมาง', c:'rel-dislike'};
  }
  if(kin==='sib'){
    if(v>=20) return {t:'รักใคร่ฉันพี่น้องร่วมสายเลือด', c:'rel-love'};
    if(v>-20) return {t:'พี่น้องที่เหินห่าง', c:'rel-neutral'};
    return {t:'พี่น้องที่ชิงดีกัน', c:'rel-dislike'};
  }
  if(kin==='spouse'){
    if(v>=20) return {t:'คู่สมรสที่รักใคร่กลมเกลียว', c:'rel-love'};
    if(v>-20) return {t:'คู่สมรส', c:'rel-like'};
    return {t:'คู่สมรสที่ร้าวฉาน', c:'rel-dislike'};
  }
  return relWord(v);
}

/* ---------- accessors ---------- */
function genById(key){ return G.generals.find(g=>g.key===key); }
function generalsIn(provKey){ return G.generals.filter(g=>g.prov===provKey && !g.child && (g.faction===G.owner[provKey] || (g.faction==='player'&&G.owner[provKey]==='player'))); }
function commanderOf(provKey){ // top general stationed (highest war+ldr)
  const gs = generalsIn(provKey); if(!gs.length) return null;
  return gs.slice().sort((a,b)=>(b.war+b.cha)-(a.war+a.cha))[0];
}
function factionProvinces(f){ return Object.keys(G.owner).filter(k=>G.owner[k]===f); }
function isPlayer(f){ return f==='player'; }
function factionName(f){
  if(f==='player') return G.factionName;
  if(f===null) return 'หัวเมืองอิสระ';
  if(f==='neutral') return 'ขุนพลเร่ร่อน';
  return FACTIONS[f] ? FACTIONS[f].th : f;
}
function factionColor(f){
  if(f==='player') return G.playerColor;
  return FACTIONS[f] ? FACTIONS[f].color : '#6b6257';
}
function hasReform(f, key){ return (G.reforms[f]||[]).includes(key); }

/* ---------- new game ---------- */
function newGame(setup){
  G = {
    year: 190, turn: 1, season: 0,
    playerFaction: 'player',
    playerName: setup.playerName, factionName: setup.factionName, playerColor: setup.color,
    baseWarlord: setup.warlord,   // which historical faction the player embodies (for roster)
    owner:{}, troops:{}, wealth:{}, loyalty:{}, managedThisTurn:{},
    treasury:{ player: 200 },
    generals: normalizeGenerals(GENERAL_ROSTER.map(g=>({ ...g, loyalty: g.lord?100:(70+Math.floor(Math.random()*20)), hp: CLASS_HP[g.cls], maxhp: CLASS_HP[g.cls] }))),
    relations:{},
    reforms:{ player:[] }, reformProgress:{ player:5 },
    appointments:{ player:{} },                 // ตำแหน่งราชการ (post -> genKey)
    lastIncome:0, lastUpkeep:0, lastNet:0,        // for the treasury tooltip
    diplomacy:{}, marriages:[], spies:[],
    flags:{ doneEvents:[], reformReady:true, quests:{} }, log:[], chronicle:[], peakProv:0,
    /* ---- Imperial Court & legendary treasures ---- */
    court:{ emperorProv:'P02', han:true, founder:null, titles:{}, edictsThisReign:0 },
    treasures:{
      jade_seal:  { found:false, owner:null, prov:'P01' },  // hidden in the Luoyang palace well
      red_hare:   { found:true,  owner:'g_lubu' },          // 呂布 rides the Red Hare
      seven_star: { found:true,  owner:'g_caocao' },         // 曹操 bears the Seven-Stars Sabre
      art_of_war: { found:true,  owner:'g_zhouyu' }          // 周瑜 keeps Sunzi's Art of War
    },
    activeProvince:null, attackSource:null, transferSource:null, genTransferSource:null,
    pendingBattle:null
  };
  RELATION_SEED.forEach(([a,b,v])=>setRel(a,b,v));

  // ownership setup
  Object.keys(PROVINCES).forEach(k=>{
    G.owner[k]=null; G.troops[k]=PROVINCES[k].baseTroops; G.wealth[k]=PROVINCES[k].baseWealth;
    G.loyalty[k]=60; G.managedThisTurn[k]=false;
  });
  // capitals + a couple holdings per AI faction — historically aligned to 190 AD
  const holdings = {
    cao_cao:['P23','P45'],          // 陳留 Chenliu (raised anti-Dong levy) + 譙 Qiao (hometown)
    liu_bei:['P37'],                // 平原 Pingyuan (under Gongsun Zan's sphere)
    sun_jian:['P20'],               // 長沙 Changsha (Grand Administrator)
    yuan_shao:['P36','P08'],        // 渤海 Bohai + 鄴 Ye (Ji province power base)
    dong_zhuo:['P02','P01'],        // 長安 Chang'an (holds the Emperor) + 洛陽 Luoyang
    ma_teng:['P13','P28'],          // 涼州 Liang province
    gongsun:['P09'],                // 北平 Beiping (You province)
    liu_biao:['P06','P52'],         // 襄陽 Xiangyang + 江夏 Jiangxia (Jing province)
    yuan_shu:['P18','P44'],         // 南陽 Nanyang + 汝南 Runan (Yuan ancestral home)
    liu_zhang:['P05','P48','P55'],  // 成都 Chengdu + 梓潼 + 犍為 (Yi province · Liu Yan/Liu Zhang)
    tao_qian:['P07','P41','P42'],   // 下邳 Xiapi + 彭城 + 東海 (Xu province)
    han_fu:['P35']                  // 信都 Xindu (Ji province seat — soon ceded to Yuan Shao)
    ,shi_xie:['P68','P69','P70','P72'] // 交趾 Jiaozhi + 合浦 + 南海 + 九真 (Jiao province — semi-independent Shi clan)
    ,liu_chong:['P40']               // 陳郡 Chenjun (Yu province — King of Chen, crossbow garrison)
  };
  Object.entries(holdings).forEach(([f,arr])=>arr.forEach(k=>{ G.owner[k]=f; }));

  // assign the player's chosen historical faction → become 'player'
  const w = setup.warlord;
  if(w !== 'custom' && holdings[w]){
    holdings[w].forEach(k=>{ G.owner[k]='player'; });
    // convert that faction's generals to player
    G.generals.forEach(g=>{ if(g.faction===w) g.faction='player'; });
    // lord stats override (rename lord general to player's name optionally kept)
    G.treasury.player = 200;
    FACTIONS.player.color = setup.color;
  } else if(w==='custom'){
    const sp = setup.spawn || 'P11';
    G.owner[sp]='player'; G.troops[sp]=50; G.wealth[sp]=60; G.loyalty[sp]=70;
    // create a custom lord general
    G.generals.unshift({ key:'g_player', zh:'主公', th:setup.playerName, short:setup.playerName,
      faction:'player', cls: setup.cls||'commander', war:setup.war||72, int:setup.int||72, pol:setup.pol||72, cha:80,
      lord:true, prov:sp, loyalty:100, sex:'m', age:30, deathAge:56+Math.floor(Math.random()*22), child:false,
      hp:CLASS_HP[setup.cls||'commander'], maxhp:CLASS_HP[setup.cls||'commander'] });
  }
  // init treasuries & reforms for AI
  FACTION_KEYS.forEach(f=>{ G.treasury[f] = 120 + Math.floor(Math.random()*60); G.reforms[f]=[]; G.reformProgress[f]=5;
    // start AI at war-neutral peace with player
    G.diplomacy[relKey('player',f)] = { state:'peace', turns:0 };
  });
  // AI-AI default peace
  for(let i=0;i<FACTION_KEYS.length;i++) for(let j=i+1;j<FACTION_KEYS.length;j++){
    G.diplomacy[relKey(FACTION_KEYS[i],FACTION_KEYS[j])] = { state:'peace', turns:0 };
  }

  // register lord-consort unions so every dynasty (incl. the player) can bear heirs
  G.generals.filter(g=>g.consortOf).forEach(w=>{
    const lord = G.generals.find(x=>x.lord && x.faction===w.faction && x.sex!=='f');
    if(lord) registerUnion(w.key, lord.key, w.faction);
  });

  pushLog(`⚔️ ศักราช 190 — ${G.factionName}ผงาดขึ้นในแผ่นดินที่แตกเป็นเสี่ยง! เริ่มต้นการพิชิตสามก๊ก`, 'sys');
  G.chronicle.push({ text:`⚔️ ศักราช 190 — ${G.factionName}ลุกขึ้นท่ามกลางแผ่นดินฮั่นที่แตกเป็นเสี่ยง`, year:190, type:'player' });
  saveGame();
}

/* ---------- persistence ---------- */
function saveGame(){
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); } catch(e){ console.warn('save failed', e); }
}
function loadGame(){
  const raw = localStorage.getItem(SAVE_KEY);
  if(!raw) return false;
  try { G = JSON.parse(raw); FACTIONS.player.color = G.playerColor; migrateSave(); return true; }
  catch(e){ console.warn('load failed', e); return false; }
}

/* ---------- save migration: heal older saves missing consort/clan metadata ----------
   normalizeGenerals() only runs on newGame; saves created before consort data existed
   leave lord-wives (e.g. นางเปียน) un-flagged → they wrongly appear as marriageable.
   Re-apply the metadata and re-seed any missing consort unions on every load.        */
function migrateSave(){
  // new systems added after launch — backfill so older saves keep working
  if(G.season===undefined) G.season = 0;
  if(G.appointments===undefined) G.appointments = { player:{} };
  if(G.appointments.player===undefined) G.appointments.player = {};
  if(G.lastIncome===undefined){ G.lastIncome=0; G.lastUpkeep=0; G.lastNet=0; }
  if(G.flags && G.flags.reformReady===undefined) G.flags.reformReady = (G.reformProgress.player<=0);
  if(G.flags && G.flags.quests===undefined) G.flags.quests = {};   // recruitment-quest progress
  (G.generals||[]).forEach(g=>{
    const m = (typeof GEN_META !== 'undefined') ? GEN_META[g.key] : null;
    if(m){
      if(g.clan===undefined)  g.clan  = m.clan;
      if(g.title===undefined) g.title = m.title;
      if(g.bio===undefined)   g.bio   = m.bio;
      if(!g.consortOf && m.consortOf) g.consortOf = m.consortOf;
    }
    if(g.consortOf) g.married = true;   // a lord's consort can never be courted away
  });
  reseedConsortUnions();
}
/* ensure every lord-consort has a child-bearing union registered (idempotent) */
function reseedConsortUnions(){
  G.unions = G.unions || [];
  G.generals.filter(g=>g.consortOf).forEach(w=>{
    if(G.unions.some(u=>u.mother===w.key || u.father===w.key)) return;   // already paired
    let lord = G.generals.find(x=>x.lord && x.faction===w.faction && x.sex!=='f');
    if(!lord && w.consortOf) lord = G.generals.find(x=>x.lord && x.faction===w.consortOf && x.sex!=='f');
    if(lord) registerUnion(w.key, lord.key, w.faction);
  });
}
function hasSave(){ return !!localStorage.getItem(SAVE_KEY); }

/* ---------- diplomacy state helpers ---------- */
function diploState(a,b){ const d=G.diplomacy[relKey(a,b)]; return d?d.state:'peace'; }
function setDiplo(a,b,state){ G.diplomacy[relKey(a,b)] = { state, turns:0 }; }
function atWar(a,b){ return diploState(a,b)==='war'; }
function allied(a,b){ return diploState(a,b)==='alliance'; }

/* ---------- fog of war: do WE (player) know this province's military intel? ---------- */
function hasSpyIn(faction){
  return (G.spies||[]).some(s=>s.target===faction)
      || G.generals.some(g=>g.onMission && g.spyFaction===faction);
}
function provinceKnown(key){
  const ow=G.owner[key];
  if(ow==='player') return true;            // our own land — always known
  if(!ow || ow==='neutral') return false;   // independent garrison — unknown until scouted
  if(allied('player',ow)) return true;      // allies share intel
  if(hasSpyIn(ow)) return true;             // a spy embedded in that faction reveals it
  return false;                             // fogged
}

/* ============================================================
   IMPERIAL COURT — the Emperor (漢獻帝) & legitimacy
   ============================================================ */
/* the faction that physically owns the Emperor's city holds the Son of Heaven */
function emperorHolder(){
  if(!G.court || !G.court.emperorProv) return null;
  const ow=G.owner[G.court.emperorProv];
  return (ow && ow!=='neutral') ? ow : null;   // neutral city = Emperor uncontrolled
}
function playerHoldsEmperor(){ return emperorHolder()==='player'; }
/* a holder may issue edicts only after the court is "activated" (196 event) or if they took the capital early */
function courtActive(){ return !!(G.flags.emperorEvent) || playerHoldsEmperor(); }

/* ---- legendary treasures ---- */
function treasureOwnerFaction(tk){
  const t=G.treasures && G.treasures[tk]; if(!t||!t.owner) return null;
  if(t.owner.indexOf && t.owner.indexOf('g_')===0){ const g=genById(t.owner); return g?g.faction:null; }
  return t.owner; // stored as a faction key
}
function playerHasTreasure(tk){ return treasureOwnerFaction(tk)==='player'; }
function genTreasureBonus(genKey){
  let b={war:0,int:0};
  if(!G.treasures) return b;
  Object.keys(G.treasures).forEach(tk=>{ if(G.treasures[tk].owner===genKey){ const bo=TREASURES[tk].bonus||{}; b.war+=bo.war||0; b.int+=bo.int||0; } });
  return b;
}
function effWar(g){ return g.war + genTreasureBonus(g.key).war; }
function effInt(g){ return g.int + genTreasureBonus(g.key).int; }

/* Sun Jian (or whoever holds Luoyang) discovers the Jade Seal in 191 */
function discoverJadeSeal(){
  const js=G.treasures.jade_seal; if(js.found) return;
  js.found=true;
  // historically Sun Jian found it; otherwise it falls to whoever holds the Luoyang ruins
  if(factionProvinces('sun_jian').length){ js.owner='g_sunjian'; js.prov=null;
    pushLog('🏵️ ซุนเกี๋ยนค้นพบตราลัญจกรหยกในซากวังลกเอี๋ยง!', 'sys'); }
  else { const ow=G.owner['P01']; if(ow && ow!=='neutral'){ js.owner=ow; js.prov=null;
      pushLog(`🏵️ ${factionName(ow)}ค้นพบตราลัญจกรหยกในซากวังลกเอี๋ยง!`,'sys'); }
    else { js.prov='P01'; pushLog('🏵️ ตราลัญจกรหยกซ่อนอยู่ในซากลกเอี๋ยง — ผู้ใดยึดเมืองนี้จะได้ครอง','sys'); } }
  if(treasureOwnerFaction('jade_seal')==='player') toast('🏵️ ท่านได้ครองตราลัญจกรหยก!');
}

/* AI Yuan Shu self-proclaims Emperor (197) — historical hubris & backlash */
function yuanShuProclaims(){
  if(!factionProvinces('yuan_shu').length) return;        // already destroyed
  if(G.baseWarlord==='yuan_shu') return;                  // player is Yuan Shu — let them choose
  // grab the seal if no one important holds it
  const sf=treasureOwnerFaction('jade_seal');
  if(sf!=='player'){ G.treasures.jade_seal.found=true; G.treasures.jade_seal.owner='yuan_shu'; G.treasures.jade_seal.prov=null; }
  // backlash: everyone (incl. player) goes to war with the usurper
  FACTION_KEYS.concat('player').forEach(f=>{ if(f!=='yuan_shu' && factionProvinces(f).length) setDiplo(f,'yuan_shu','war'); });
  Diplo.addFavor && Diplo.addFavor('yuan_shu',-40);
  // hubris: his cities lose loyalty, troops thin from desertion
  factionProvinces('yuan_shu').forEach(k=>{ G.loyalty[k]=Math.max(10,G.loyalty[k]-30); G.troops[k]=Math.max(8,Math.floor(G.troops[k]*0.8)); });
}

/* found a NEW DYNASTY — via the Emperor's abdication, or via the Jade Seal */
function canFoundDynasty(){
  if(!G.court.han) return {ok:false}; // already founded
  const mine=factionProvinces('player').length, total=Object.keys(PROVINCES).length;
  const viaEmperor = playerHoldsEmperor() && mine>=Math.ceil(total*0.40);
  const viaSeal    = playerHasTreasure('jade_seal');
  return { ok:viaEmperor||viaSeal, viaEmperor, viaSeal, mine, need:Math.ceil(total*0.40) };
}
function foundDynasty(dynName, via){
  G.court.han=false; G.court.founder='player'; G.court.dynastyName=dynName||'ใหม่';
  // legitimacy backlash if seized by force without the Emperor (seal usurpation)
  if(via==='seal' && !playerHoldsEmperor()){
    FACTION_KEYS.forEach(f=>{ if(factionProvinces(f).length && !allied('player',f)) setDiplo('player',f,'war'); });
    pushLog(`👑 ท่านอ้างตราลัญจกรหยกสถาปนาราชวงศ์${G.court.dynastyName}! แต่ขุนศึกผู้จงรักต่อฮั่นต่างยกทัพมาปราบกบฏ`, 'sys');
  } else {
    pushLog(`👑 ฮ่องเต้สละราชสมบัติ! ${G.factionName}สถาปนาราชวงศ์${G.court.dynastyName} ขึ้นครองแผ่นดินอย่างชอบธรรม`, 'player');
  }
  // permanent legitimacy buff: all your cities gain loyalty
  factionProvinces('player').forEach(k=>{ G.loyalty[k]=Math.min(100,G.loyalty[k]+20); });
  G.flags.dynastyFounded=true;
  saveGame();
}

/* hook whenever a city changes hands (player or AI) — Emperor & hidden Seal */
function onCityCaptured(key, newOwner){
  if(!newOwner || newOwner==='neutral') return;
  if(G.court && key===G.court.emperorProv){
    if(newOwner==='player'){ pushLog('🐉 ท่านยึดเมืองที่ฮ่องเต้ประทับ — ได้ตัวฮ่องเต้ไว้ในกำมือ! เปิดใช้ราชสำนักได้', 'player'); toast('🐉 ท่านได้ตัวฮ่องเต้!'); }
    else pushLog(`🐉 ${factionName(newOwner)}ยึดเมืองที่ฮ่องเต้ประทับ กุมอำนาจราชสำนักไว้!`, 'sys');
  }
  const js=G.treasures && G.treasures.jade_seal;
  if(js && js.found && js.prov===key){
    js.owner=newOwner; js.prov=null;
    if(newOwner==='player'){ pushLog('🏵️ ท่านค้นพบตราลัญจกรหยกซ่อนอยู่ในเมืองนี้!', 'player'); toast('🏵️ ได้ตราลัญจกรหยก!'); }
    else pushLog(`🏵️ ${factionName(newOwner)}ค้นพบตราลัญจกรหยกในเมืองนี้!`, 'sys');
  }
}

/* ---------- log + toast ---------- */
/* milestone-worthy log lines also enter the permanent chronicle (พงศาวดาร) for the end-game recap */
const MILESTONE_RE = /^(🔥|⚰️|💀|🏵️|👑|🐉|📜|🚨|🪓|🤝|🎎)/;
function pushLog(text, type){
  G.log.unshift({ text, type, year:G.year }); if(G.log.length>120) G.log.pop();
  if(G.chronicle && MILESTONE_RE.test(text)){
    const last=G.chronicle[G.chronicle.length-1];
    if(!last || last.text!==text){ G.chronicle.push({ text, year:G.year, type:type||'sys' }); if(G.chronicle.length>260) G.chronicle.shift(); }
  }
}
function toast(msg){
  let wrap = document.getElementById('toastWrap');
  if(!wrap){ wrap=document.createElement('div'); wrap.id='toastWrap'; document.body.appendChild(wrap); }
  const t=document.createElement('div'); t.className='toast'; t.textContent=msg; wrap.appendChild(t);
  setTimeout(()=>t.remove(), 2900);
}

/* ============================================================
   CORE ACTIONS
   ============================================================ */
function recruitTroops(key){
  const cost = hasReform('player','r_levy') ? 15 : 20;
  if(G.treasury.player < cost || G.managedThisTurn[key]) return;
  G.treasury.player -= cost; G.troops[key]+=15; G.managedThisTurn[key]=true;
  pushLog(`⚔️ เกณฑ์ไพร่พลที่ ${provName(key)} (+15 นาย)`, 'player');
  saveGame(); UI.refresh(); UI.showProvince(key);
}
function developCity(key){
  if(G.treasury.player < 25 || G.managedThisTurn[key]) return;
  G.treasury.player -= 25; G.wealth[key]+=10; G.loyalty[key]=Math.min(100,G.loyalty[key]+4); G.managedThisTurn[key]=true;
  pushLog(`🌾 พัฒนาเมือง ${provName(key)} (+10 มั่งคั่ง, +ความภักดี)`, 'player');
  saveGame(); UI.refresh(); UI.showProvince(key);
}
function pacify(key){ // raise loyalty to prevent rebellion
  if(G.treasury.player < 30 || G.managedThisTurn[key]) return;
  G.treasury.player -= 30; G.loyalty[key]=Math.min(100,G.loyalty[key]+18); G.managedThisTurn[key]=true;
  pushLog(`🕊️ ปลอบขวัญราษฎร ${provName(key)} (+18 ความภักดี)`, 'player');
  saveGame(); UI.refresh(); UI.showProvince(key);
}

/* ----- troop transfer ----- */
function doMoveTroops(fromKey, toKey){
  const amt = Math.min(20, G.troops[fromKey]-5);
  G.troops[fromKey]-=amt; G.troops[toKey]+=amt;
  pushLog(`🔄 เคลื่อนพล ${provName(fromKey)} → ${provName(toKey)} (${amt} นาย)`, 'player');
  saveGame(); UI.refresh(); UI.showProvince(toKey);
}
function doMoveGeneral(fromKey, toKey, genKey){
  const g = genKey ? genById(genKey) : commanderOf(fromKey);
  if(!g) return;
  g.prov = toKey;
  pushLog(`👑 ย้ายขุนพล ${g.short} ไปประจำ ${provName(toKey)}`, 'player');
  saveGame(); UI.refresh(); UI.showProvince(toKey);
}

/* ----- command from the Generals Hall: reassign to ANY owned city ----- */
function reassignGeneral(genKey, provKey){
  const g=genById(genKey); if(!g||g.faction!=='player') return {ok:false,msg:'ไม่พบขุนพลในสังกัด'};
  if(g.onMission) return {ok:false,msg:`${g.short}กำลังปฏิบัติภารกิจสายลับอยู่`};
  if(g.child) return {ok:false,msg:`${g.short}ยังเป็นทายาท ออกประจำการไม่ได้`};
  if(G.owner[provKey]!=='player') return {ok:false,msg:'มอบหมายได้เฉพาะเมืองของก๊กเรา'};
  g.prov=provKey;
  pushLog(`👑 มอบหมาย ${g.short} ไปประจำการ ณ ${provName(provKey)}`, 'player');
  saveGame(); return {ok:true,msg:`${g.short} เดินทางไปประจำ ${provName(provKey)}`};
}

/* ----- reward a general with gold to raise loyalty ----- */
function rewardGeneral(genKey, amount){
  amount = amount||30;
  const g=genById(genKey); if(!g||g.faction!=='player') return {ok:false,msg:'ไม่พบขุนพลในสังกัด'};
  if(g.lord) return {ok:false,msg:'เจ้าก๊กภักดีต่ออุดมการณ์ตนเสมอ'};
  if(G.treasury.player<amount) return {ok:false,msg:`ต้องใช้ ${amount}💰 (คลังไม่พอ)`};
  G.treasury.player-=amount;
  g.loyalty=Math.min(100, g.loyalty+12);
  pushLog(`🎖️ พระราชทานรางวัล ${amount}💰 แก่ ${g.short} — ความภักดีเพิ่มขึ้น`, 'player');
  saveGame(); return {ok:true,msg:`${g.short} ซาบซึ้งในน้ำใจ (ภักดี ${g.loyalty})`};
}

/* ----- attack → launches tactical battle overlay ----- */
function initiateAttack(fromKey, toKey){
  const atkFaction='player', defFaction=G.owner[toKey];
  if(defFaction==='player') return;
  // gather up to 3 generals each
  const atkGens = generalsIn(fromKey).slice(0,3);
  const defGens = G.generals.filter(g=>g.prov===toKey && g.faction===defFaction).slice(0,3);
  G.pendingBattle = {
    fromKey, toKey, atkFaction, defFaction,
    atkTroops: G.troops[fromKey]-5, defTroops: G.troops[toKey],
    atkGens: atkGens.map(g=>g.key), defGens: defGens.map(g=>g.key),
    playerSide:'attacker'
  };
  saveGame();
  Battle.open(G.pendingBattle);
}

/* called by battle.js when tactical battle resolves */
function resolveBattleResult(res){
  const pb = G.pendingBattle; if(!pb) return;
  const { fromKey, toKey } = pb;
  // apply casualties
  G.troops[fromKey] = Math.max(5, Math.round(res.atkTroopsLeft));
  if(res.attackerWon){
    G.troops[toKey] = Math.max(5, Math.round(res.defTroopsLeft));
    const prevOwner = G.owner[toKey];
    G.owner[toKey] = 'player'; G.loyalty[toKey]=Math.max(35, G.loyalty[toKey]-20);
    pushLog(`🔥 ยึดเมือง ${provName(toKey)} จาก${factionName(prevOwner)}สำเร็จ!`, 'player');
    onCityCaptured(toKey, 'player');
    // captured generals
    res.capturedGenerals.forEach(gk=>{ const g=genById(gk); if(g){ UI.queueCapture(g, toKey); } });
    // move one attacking general in to hold
    const survivor = pb.atkGens.map(genById).find(g=>g && g.hp>0);
    if(survivor) survivor.prov = toKey;
  } else {
    G.troops[toKey] = Math.max(5, Math.round(res.defTroopsLeft));
    pushLog(`❌ บุก ${provName(toKey)} ล้มเหลว ทัพถอยร่นกลับ ${provName(fromKey)}`, 'sys');
  }
  // restore general hp after battle (wounds heal partially)
  G.generals.forEach(g=>{ if(g.hp<=0 && res.slain && res.slain.includes(g.key)){
      // slain in duel — remove
      G.generals = G.generals.filter(x=>x.key!==g.key);
    } else { g.hp = Math.max(Math.round(g.maxhp*0.5), g.hp); g.hp=g.maxhp; }
  });
  G.pendingBattle=null;
  saveGame(); UI.refresh();
  UI.processCaptureQueue();
  if(G.activeProvince) UI.showProvince(G.activeProvince);
  checkVictory();
}

/* ---------- capture resolution ---------- */
function resolveCapture(genKey, action, provKey){
  const g = genById(genKey); if(!g) return;
  const seizeTreasures=()=>{ let got=[]; Object.keys(G.treasures||{}).forEach(tk=>{ if(G.treasures[tk].owner===genKey){ G.treasures[tk].owner='player'; got.push(TREASURES[tk].th); } }); if(got.length) pushLog(`🏵️ ยึดของวิเศษจาก ${g.short}: ${got.join(', ')}`, 'player'); };
  if(action==='recruit'){
    const isLord=!!g.lord;
    const chance = (isLord?0.25:0.45) + (g.loyalty<60?0.25:0) + (playerHoldsEmperor()||G.flags.emperorEvent?0.12:0) + (playerHasTreasure('jade_seal')?0.05:0);
    if(Math.random()<chance){
      g.faction='player'; g.prov=provKey; g.loyalty=isLord?60:70; g.lord=false;
      seizeTreasures();
      pushLog(`🤝 ${g.short} ซาบซึ้งยอมสวามิภักดิ์เข้าร่วมก๊กท่าน!`, 'player');
      toast(`🤝 ได้ ${g.short} มาเป็นพวก!`);
    } else {
      g.faction='neutral'; g.prov=provKey; g.lord=false;
      pushLog(`🏃 ${g.short} ปฏิเสธและหลบหนีไปเป็นขุนพลเร่ร่อน`, 'sys');
    }
  } else if(action==='execute'){
    seizeTreasures();
    G.generals = G.generals.filter(x=>x.key!==genKey);
    pushLog(`🪓 ประหาร ${g.short} เพื่อตัดเสี้ยนหนาม${g.lord?' — ก๊ก'+factionName(g.faction)+'สิ้นผู้นำ':''}`, 'sys');
    // executing generals upsets their friends
    G.generals.forEach(o=>{ if(getRel(o.key,genKey)>40) o.loyalty=Math.max(0,o.loyalty-10); });
  } else { // release
    g.faction='neutral'; g.prov=provKey; g.lord=false;
    pushLog(`🕊️ ปล่อย ${g.short} ไปอย่างมีน้ำใจ (เสริมบารมีคุณธรรม)`, 'player');
  }
  saveGame(); UI.refresh();
}

/* ============================================================
   GUANXI — loyalty drift + rebellion
   ============================================================ */
function processGuanxi(){
  // for each player province, generals stationed together influence each other
  factionProvinces('player').forEach(k=>{
    const gs = generalsIn(k);
    for(let i=0;i<gs.length;i++) for(let j=i+1;j<gs.length;j++){
      const r=getRel(gs[i].key,gs[j].key);
      if(r<=-50){ gs[i].loyalty=Math.max(0,gs[i].loyalty-4); gs[j].loyalty=Math.max(0,gs[j].loyalty-4); }
      else if(r>=60){ gs[i].loyalty=Math.min(100,gs[i].loyalty+2); gs[j].loyalty=Math.min(100,gs[j].loyalty+2); }
    }
    // low city loyalty slowly bleeds general morale
    if(G.loyalty[k]<40) gs.forEach(g=>g.loyalty=Math.max(0,g.loyalty-2));
  });
  // rebellion check
  G.generals.filter(g=>g.faction==='player' && !g.lord && g.loyalty<=20).forEach(g=>{
    if(Math.random()<0.35){
      const k=g.prov;
      if(G.owner[k]==='player'){
        G.owner[k]=null; // breaks away as independent
        g.faction='neutral';
        pushLog(`🚨 กบฏ! ${g.short} ความจงรักภักดีตกต่ำ ยึดเมือง ${provName(k)} แยกตัวเป็นอิสระ!`, 'sys');
        toast(`🚨 ${g.short} ก่อกบฏที่ ${provName(k)}!`);
      }
    } else {
      pushLog(`⚠️ ${g.short} เริ่มกระด้างกระเดื่อง (ภักดี ${g.loyalty}) ควรปลอบขวัญด่วน`, 'sys');
    }
  });
}

/* ============================================================
   LIFESPAN, AGING & THE NEXT GENERATION (อายุขัย · ลูกหลาน)
   ============================================================ */
let _childSeq = 0;
function genUid(){ _childSeq++; return 'g_born_'+Date.now().toString(36)+'_'+_childSeq; }

/* register a marriage union that may bear children over the years */
function registerUnion(motherKey, fatherKey, faction){
  G.unions = G.unions || [];
  G.unions.push({ mother:motherKey, father:fatherKey, faction:faction||'player', since:G.year, kids:0 });
}

/* create a newborn into a faction's family; returns the new general (a child, age 0) */
function bearChild(union){
  const mum=genById(union.mother), dad=genById(union.father);
  const sex = Math.random()<0.5 ? 'm' : 'f';
  const avg=(a,b,d)=>Math.max(15,Math.min(99, Math.round(((a||60)+(b||60))/2 + (Math.random()*2-1)*d)));
  const war=avg(mum&&mum.war, dad&&dad.war, 18);
  const int=avg(mum&&mum.int, dad&&dad.int, 16);
  const pol=avg(mum&&mum.pol, dad&&dad.pol, 14);
  const cha=avg(mum&&mum.cha, dad&&dad.cha, 12);
  const cls = war>=80?'champion': war>=70?'vanguard': int>=80?'strategist': pol>=72?'commander':'sentinel';
  const surname = (dad&&dad.zh&&dad.zh[0]) || (mum&&mum.zh&&mum.zh[0]) || '';
  const child = {
    key:genUid(), zh:surname+'?', th:'(ยังไม่ตั้งชื่อ)', short:'ทายาท',
    faction:union.faction, cls, war, int, pol, cha, sex, age:0, child:true,
    deathAge:58+Math.floor(Math.random()*22), loyalty:100, lord:false,
    prov: factionProvinces(union.faction)[0] || (mum&&mum.prov) || (dad&&dad.prov),
    parents:[union.mother, union.father], _surname:surname,
    hp:CLASS_HP[cls], maxhp:CLASS_HP[cls]
  };
  // AI dynasties name their heirs at once; only the player's heirs await a naming ceremony
  if(union.faction!=='player'){ autoName(child); }
  G.generals.push(child);
  union.kids++;
  return child;
}

/* pick a random given-name + Thai reading, honouring the family surname */
function autoName(g){
  const pool = g.sex==='f'?FEMALE_GIVEN_NAMES:MALE_GIVEN_NAMES;
  const n = pool[Math.floor(Math.random()*pool.length)];
  const sur = g._surname || (g.zh&&g.zh[0]) || '';
  const surTh = (genById((g.parents||[])[1])||{}).clan || (genById((g.parents||[])[0])||{}).clan || '';
  g.zh = sur + n.zh;
  g.th = (surTh?surTh:'') + n.th;
  g.short = g.th;
  return g;
}

/* yearly tick — called once per turn after the year advances */
function ageTick(){
  const births=[], comings=[], deaths=[];
  G.generals.forEach(g=>{ g.age=(g.age||30)+1; if(g.child && g.age>=15){ g.child=false; comings.push(g); } });
  (G.unions||[]).forEach(u=>{
    if(!genById(u.mother) || !genById(u.father)) return;            // a parent died
    if(u.kids>=3) return;                                            // cap family size
    const motherAge = (genById(u.mother)||{}).age||30;
    if(motherAge>44) return;                                         // too old to bear
    if(Math.random()<0.28){ const c=bearChild(u); if(u.faction==='player'){ births.push(c); pushLog('🎎 ตระกูลได้ทายาทคนใหม่ถือกำเนิด', 'player'); } }
  });
  G.generals.slice().forEach(g=>{
    if(g.child) return;
    const over = g.age - g.deathAge;
    const dieChance = over>=0 ? 0.5 + over*0.12 : (g.age>=55 ? (g.age-55)*0.015 : 0);
    if(Math.random()<dieChance){ deaths.push(g); onGeneralDeath(g); }
  });
  return { births, comings, deaths };
}

/* rank heirs to a faction: blood children first (eldest), then clansfolk, then loyal officers */
function successionCandidates(dead, fac){
  const adults = G.generals.filter(x=>x.faction===fac && !x.child);
  const males = adults.filter(x=>x.sex!=='f');
  const byAge=(a,b)=>b.age-a.age;
  const byCap=(a,b)=>(b.war+b.int+b.pol)-(a.war+a.int+a.pol);
  const blood = males.filter(x=>x.parents && x.parents.includes(dead.key)).sort(byAge);
  const clan  = males.filter(x=>!blood.includes(x) && dead.clan && x.clan===dead.clan).sort(byAge);
  const loyal = males.filter(x=>!blood.includes(x)&&!clan.includes(x)).sort((a,b)=>(b.loyalty-a.loyalty)||byCap(a,b));
  let ranked=[...blood,...clan,...loyal];
  if(!ranked.length){ ranked = adults.slice().sort(byCap); }   // last resort: a lady or anyone may carry the line
  return ranked;
}

/* handle a general's death — succession for lords, cleanup */
function onGeneralDeath(g){
  G.generals = G.generals.filter(x=>x.key!==g.key);
  const cands = successionCandidates(g, g.faction);
  Object.keys(G.treasures||{}).forEach(tk=>{ if(G.treasures[tk].owner===g.key){ G.treasures[tk].owner = cands[0]?cands[0].key:null; if(!cands[0]) G.treasures[tk].prov = g.prov; } });
  if(g.lord){
    if(cands.length){
      const heir=cands[0]; G.generals.forEach(x=>{ if(x.faction===g.faction) x.lord=false; });
      heir.lord=true; heir.loyalty=100;
      const rel = (heir.parents&&heir.parents.includes(g.key)) ? 'บุตร' : (g.clan&&heir.clan===g.clan?'เครือญาติ':'ขุนพลคนสนิท');
      pushLog(`⚰️ ${g.short}ถึงแก่กรรม (อายุ ${g.age}) — ${heir.short} (${rel}) สืบทอดเป็นผู้นำ${factionName(g.faction)}`, g.faction==='player'?'player':'sys');
      // the player decides succession personally among the eligible heirs
      if(g.faction==='player'){ G._succession = { deadShort:g.short, deadAge:g.age, deadClan:g.clan||'', heir:heir.key, candidates:cands.slice(0,6).map(c=>c.key) }; }
    } else {
      factionProvinces(g.faction).forEach(k=>{ G.owner[k]=null; });
      pushLog(`💀 ${g.short}ถึงแก่กรรมโดยไร้ทายาทสืบสกุล — ${factionName(g.faction)}ล่มสลาย`, 'sys');
    }
  } else {
    pushLog(`⚰️ ${g.short}ถึงแก่กรรมด้วยวัยชรา (อายุ ${g.age})`, g.faction==='player'?'player':'sys');
  }
}

/* the player confirms / changes the successor from the eligible heirs */
function confirmSuccessor(key){
  const g=genById(key); if(!g||g.faction!=='player') return;
  G.generals.forEach(x=>{ if(x.faction==='player') x.lord=false; });
  g.lord=true; g.loyalty=100;
  // the new lord inherits the imperial regalia his predecessor bore, if leaderless
  Object.keys(G.treasures||{}).forEach(tk=>{ if(G.treasures[tk].owner && !genById(G.treasures[tk].owner)) G.treasures[tk].owner=key; });
  G._succession=null; saveGame();
}

/* assign a name to a newborn/heir (called from the naming modal) */
function nameGeneral(key, zhGiven, thName){
  const g=genById(key); if(!g) return;
  const sur=g._surname||'';
  g.zh = sur ? sur+zhGiven : (zhGiven||g.zh);
  g.th = thName || g.th;
  g.short = thName || g.short;
  saveGame();
}

/* ============================================================
   ECONOMY · COURT POSTS · FACTION BUFFS (\u0e04\u0e48\u0e32\u0e1a\u0e33\u0e23\u0e38\u0e07 \u00b7 \u0e15\u0e33\u0e41\u0e2b\u0e19\u0e48\u0e07\u0e23\u0e32\u0e0a\u0e01\u0e32\u0e23 \u00b7 \u0e1a\u0e31\u0e1f\u0e01\u0e4a\u0e01)
   ============================================================ */
/* monthly stipend a serving officer draws from the treasury (the lord serves for free) */
function genUpkeep(g){
  if(!g || g.lord || g.child) return 0;
  const tier = Math.round((g.war+g.int+g.pol+g.cha)/160);   // 1..3
  return 1 + tier;                                           // ~2..4 per officer per season
}
/* total seasonal upkeep for a faction's serving officers */
function factionUpkeep(f){
  let s=0; G.generals.forEach(g=>{ if(g.faction===f && !g.lord && !g.child && !g.onMission) s+=genUpkeep(g); }); return s;
}
/* the officer currently appointed to a court post (player only keeps appointments) */
function postHolder(f, post){ const k=(G.appointments[f]||{})[post]; const g=genById(k); return (g&&g.faction===f&&!g.child)?g:null; }
/* aggregate the faction-wide bonuses granted by court appointments + reforms */
function factionBuffs(f){
  const b={ incomePct:0, upkeepPct:0, loyaltyBonus:0, defBonus:0, recruitBonus:0, battlePct:0 };
  const ch=postHolder(f,'chancellor');     if(ch) b.incomePct  += ch.pol*0.0030;            // up to +~30%
  const tr=postHolder(f,'treasurer');      if(tr) b.upkeepPct  -= tr.pol*0.0035;            // up to -~33%
  const insp=postHolder(f,'inspector');    if(insp) b.loyaltyBonus += Math.round(insp.int/34);// +1..3 / season
  const gc=postHolder(f,'grand_commander');if(gc) { b.recruitBonus += Math.round(gc.war/20); b.battlePct += gc.war*0.0015; }
  const st=postHolder(f,'strategist');     if(st) { b.defBonus += Math.round(st.int/12); b.battlePct += st.int*0.0015; }
  if(hasReform(f,'r_market')) b.incomePct += 0.10;
  if(hasReform(f,'r_govern')) b.loyaltyBonus += 1;
  return b;
}
/* appoint (or clear) an officer to a court post — one post per officer */
function appointPost(post, key){
  G.appointments.player = G.appointments.player || {};
  if(!key){ delete G.appointments.player[post]; saveGame(); return {ok:true}; }
  // an officer can hold only one post
  Object.keys(G.appointments.player).forEach(p=>{ if(G.appointments.player[p]===key) delete G.appointments.player[p]; });
  G.appointments.player[post]=key; saveGame(); return {ok:true};
}

/* ============================================================
   MARRIAGE WITHIN THE CLAN (\u0e2a\u0e21\u0e23\u0e2a\u0e20\u0e32\u0e22\u0e43\u0e19\u0e01\u0e4a\u0e01 \u2014 \u0e1c\u0e25\u0e34\u0e15\u0e17\u0e32\u0e22\u0e32\u0e17)
   ============================================================ */
function clanBachelors(sex){
  return G.generals.filter(g=>g.faction==='player' && !g.child && g.sex===sex && !g.lord && !g.married && !g.consortOf);
}
function weddInClan(maleKey, femaleKey){
  const m=genById(maleKey), f=genById(femaleKey);
  if(!m||!f) return {ok:false,msg:'ไม่พบบุคคล'};
  if(m.sex!=='m'||f.sex!=='f') return {ok:false,msg:'ต้องเลือกบุรุษและสตรีอย่างละหนึ่ง'};
  if(m.married||f.married) return {ok:false,msg:'มีผู้สมรสแล้วในคู่นี้'};
  // forbid wedding full siblings
  if(m.parents && f.parents && m.parents.some(p=>f.parents.includes(p))) return {ok:false,msg:'สายเลือดใกล้ชิดเกินไป สมรสมิได้'};
  m.married=true; f.married=true;
  registerUnion(f.key, m.key, 'player');
  adjRel(m.key, f.key, 60);
  pushLog(`🪅 จัดพิธีอภิเษก ${m.short} กับ ${f.short} — ตระกูลรอคอยทายาทรุ่นใหม่`, 'player');
  saveGame();
  return {ok:true,msg:`🪅 ${m.short} × ${f.short} เข้าพิธีสมรสแล้ว`};
}
function endTurn(){
  if(G.attackSource||G.transferSource||G.genTransferSource){ toast('ยกเลิกคำสั่งที่ค้างอยู่ก่อน'); return; }
  const buffs=factionBuffs('player');
  // 1. player income (provinces + court bonuses)
  let income=0;
  factionProvinces('player').forEach(k=>{
    G.managedThisTurn[k]=false;
    let inc=Math.floor(G.wealth[k]*0.4);
    if(hasReform('player','r_market')) inc=Math.floor(inc*1.2);
    if(hasReform('player','r_agri')) inc+=2;
    const cmd=commanderOf(k); if(cmd && cmd.cls==='strategist') inc+=8;
    if(cmd && cmd.cls==='commander'){ G.loyalty[k]=Math.min(100,G.loyalty[k]+3); }
    if(cmd && cmd.cls==='champion'){ inc+=4; } // food bonus
    if(hasReform('player','r_govern')) G.loyalty[k]=Math.min(100,G.loyalty[k]+2);
    if(buffs.loyaltyBonus) G.loyalty[k]=Math.min(100,G.loyalty[k]+buffs.loyaltyBonus);
    income+=inc;
  });
  income = Math.round(income*(1+buffs.incomePct));
  // 1b. officer upkeep (ค่าจ้าง/บำรุงขุนพล)
  let upkeep = Math.round(factionUpkeep('player')*(1+buffs.upkeepPct));
  const net = income - upkeep;
  G.treasury.player += net;
  G.lastIncome=income; G.lastUpkeep=upkeep; G.lastNet=net;
  if(G.treasury.player<0){ // unpaid officers grow restless
    G.treasury.player=0;
    G.generals.forEach(g=>{ if(g.faction==='player'&&!g.lord) g.loyalty=Math.max(0,g.loyalty-4); });
    pushLog('🚨 คลังหลวงร่อยหรอ! จ่ายเบี้ยหวัดขุนพลไม่ครบ ความภักดีลดลง', 'player');
  }

  // 2. AI turns
  AI.runAll();

  // 3. guanxi & rebellion
  processGuanxi();

  // 4. reform progress
  Object.keys(G.reformProgress).forEach(f=>{ if(factionProvinces(f).length){ G.reformProgress[f]--; } });
  if(G.reformProgress.player<=0 && !G.flags.reformReady){ G.reformProgress.player=0; G.flags.reformReady=true;
    pushLog(`🌸 ถึงวาระปฏิรูปประเทศ! เปิดต้นไม้ปฏิรูปเพื่อปลดล็อกความก้าวหน้า`, 'player');
    toast('🌸 ปฏิรูปประเทศพร้อมแล้ว!'); }
  // AI auto-pick reforms
  FACTION_KEYS.forEach(f=>{ if(G.reformProgress[f]<=0 && factionProvinces(f).length){ G.reformProgress[f]=5; AI.pickReform(f); } });

  // 5. advance the season; a year passes every 4 seasons
  G.turn++;
  G.season=(G.season+1)%4;
  const newYear = (G.season===0);
  if(newYear){
    G.year++;
    Diplo.tickEvents();
    // 5b. aging, births, deaths — once per year
    const life = ageTick();
    if(life.births.length) UI.queueBirths(life.births);
    if(life.comings.length) life.comings.filter(g=>g.faction==='player').forEach(g=>UI.queueComingOfAge(g));
    pushLog(`🍂 ขึ้นศักราชใหม่ ค.ศ. ${G.year}`, 'sys');
  }
  // 5c. a wandering officer may come seeking service
  const visit = Recruit.rollVisit();
  if(visit) UI.queueRecruit(visit.key);

  // 5d. recruitment quests — เนื้อเรื่องชวนขุนพลคนสำคัญ (มีลำดับความสำคัญสูงสุด)
  const quest = Diplo.rollQuest();
  if(quest) UI.queueEvent(quest);

  // 5e. random event deck — เหตุการณ์ระหว่างทางแบบมีตัวเลือก (เล่นซ้ำได้หลากหลาย)
  const rev = (!quest) ? Diplo.rollRandomEvent() : null;
  if(rev) UI.queueEvent(rev);

  // 5f. border raids — ภัยชายแดน อนารยชน/โจรโพกผ้าเหลืองกดดันหัวเมืองชายขอบ
  const raid = (!quest && !rev) ? Diplo.rollBorderRaid() : null;   // ไม่ให้ซ้อนกันในเทิร์นเดียว
  if(raid) UI.queueEvent(raid);

  // 5g. faction goal — เป้าหมายประจำก๊กสำเร็จหรือยัง (ครั้งเดียว)
  if(!G.flags.goalDone && typeof warlordGoal==='function'){
    try{ const gl=warlordGoal().goal; if(gl && gl.check(G)){ G.flags.goalDone=true; UI.queueEvent({_goalDone:true, goal:gl}); } }catch(e){}
  }

  pushLog(`${SEASONS[G.season].icon} ${SEASONS[G.season].th} ค.ศ. ${G.year} — รายรับ +${income} ค่าบำรุง −${upkeep} (สุทธิ ${net>=0?'+':''}${net}) 💰`, 'sys');
  saveGame(); UI.refresh();
  if(G.activeProvince) UI.showProvince(G.activeProvince);
  if(G.flags.reformReady) UI.flagReform(true);
  UI.processEventQueue();
  checkVictory();
}

/* ---------- victory / defeat ---------- */
function checkVictory(){
  const mine=factionProvinces('player').length;
  const total=Object.keys(PROVINCES).length;
  if(mine>(G.peakProv||0)) G.peakProv=mine;
  if(mine===0){ UI.endGame(false); return; }
  if(mine >= Math.ceil(total*0.6)){ UI.endGame(true); }
}
