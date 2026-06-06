/* ============================================================
   diplomacy.js — Diplomacy, Espionage, Political Marriage, Events
   ============================================================ */

const Diplo = {
  /* ---------- list of AI factions still alive ---------- */
  aliveFactions(){ return FACTION_KEYS.filter(f=>factionProvinces(f).length>0); },

  /* ---------- relation score 0..100 toward player (affects acceptance) ---------- */
  attitude(f){
    let a = 50;
    if(allied('player',f)) a+=30;
    if(atWar('player',f)) a-=40;
    // power gap — strong player intimidates / is envied
    const mine=factionProvinces('player').length, theirs=factionProvinces(f).length;
    a += Math.max(-20, Math.min(20, (mine-theirs)*-2));
    a += (playerHoldsEmperor() || (G.flags.emperorEvent && emperorHolder()==='player')) ? 15 : 0;
    a += (G.court && G.court.titles && G.court.titles[f]) ? 12 : 0;  // appointed to a court office → grateful
    a += (G.diplomacy[relKey('player',f)]?.favor||0);
    return Math.max(0, Math.min(100, a));
  },
  addFavor(f, d){ const k=relKey('player',f); G.diplomacy[k]=G.diplomacy[k]||{state:'peace',turns:0}; G.diplomacy[k].favor=(G.diplomacy[k].favor||0)+d; },

  /* ---------- player diplomatic actions ---------- */
  gift(f, amount){
    if(G.treasury.player<amount) return {ok:false, msg:'ทองในคลังไม่พอ'};
    G.treasury.player-=amount; G.treasury[f]=(G.treasury[f]||0)+amount;
    this.addFavor(f, Math.floor(amount/8));
    pushLog(`🎁 มอบบรรณาการ ${amount}💰 แก่${factionName(f)} (สัมพันธ์ดีขึ้น)`, 'player');
    return {ok:true, msg:`ความสัมพันธ์กับ${factionName(f)}ดีขึ้น`};
  },
  proposePeace(f){
    if(!atWar('player',f)) return {ok:false, msg:'ไม่ได้อยู่ในภาวะสงคราม'};
    const acc = this.attitude(f) + 20 > 55 + Math.random()*30;
    if(acc){ setDiplo('player',f,'peace'); pushLog(`🕊️ ${factionName(f)}ยอมรับการสงบศึก`, 'player'); return {ok:true, msg:'สงบศึกสำเร็จ'}; }
    return {ok:false, msg:`${factionName(f)}ปฏิเสธ ยังพยาบาทอยู่`};
  },
  declareWar(f){
    setDiplo('player',f,'war'); this.addFavor(f,-30);
    pushLog(`⚔️ ประกาศสงครามกับ${factionName(f)}!`, 'sys');
    return {ok:true, msg:`ประกาศสงครามกับ${factionName(f)}แล้ว`};
  },
  proposeAlliance(f){
    if(allied('player',f)) return {ok:false, msg:'เป็นพันธมิตรอยู่แล้ว'};
    const acc = this.attitude(f) > 62 + Math.random()*25;
    if(acc){ setDiplo('player',f,'alliance'); pushLog(`🤝 ${factionName(f)}ตอบรับเป็นพันธมิตร!`, 'player'); return {ok:true, msg:'ตั้งพันธมิตรสำเร็จ'}; }
    return {ok:false, msg:`${factionName(f)}ยังไม่ไว้ใจพอจะเป็นพันธมิตร`};
  },
  buyProvince(f){
    // find a weak border province of f adjacent to player
    const cand = factionProvinces(f).filter(k=> (ADJACENCY[k]||[]).some(n=>G.owner[n]==='player'));
    if(!cand.length) return {ok:false, msg:'ไม่มีดินแดนติดกับเราให้เจรจาซื้อ'};
    const target = cand.sort((a,b)=>G.wealth[a]-G.wealth[b])[0];
    const price = (G.wealth[target]+G.troops[target])*6;
    if(G.treasury.player<price) return {ok:false, msg:`ต้องใช้ ${price}💰 (คลังไม่พอ)`, price};
    const acc = this.attitude(f) > 58 + Math.random()*30;
    if(acc){
      G.treasury.player-=price; G.treasury[f]=(G.treasury[f]||0)+price;
      G.owner[target]='player';
      pushLog(`💱 เจรจาซื้อเมือง ${provName(target)} จาก${factionName(f)} (${price}💰)`, 'player');
      return {ok:true, msg:`ได้ ${provName(target)} มาครอบครอง`};
    }
    return {ok:false, msg:`${factionName(f)}ไม่ยอมขายดินแดน`, price};
  },
  demandProvince(f){ // threaten — works only if much stronger
    const cand = factionProvinces(f).filter(k=> (ADJACENCY[k]||[]).some(n=>G.owner[n]==='player'));
    if(!cand.length) return {ok:false, msg:'ไม่มีดินแดนติดกันให้ขู่เข็ญ'};
    const target = cand.sort((a,b)=>G.troops[a]-G.troops[b])[0];
    const mine=factionProvinces('player').length, theirs=factionProvinces(f).length;
    const acc = mine > theirs*2 && Math.random()<0.5;
    if(acc){ G.owner[target]='player'; this.addFavor(f,-25);
      pushLog(`😨 ขู่เข็ญสำเร็จ! ${factionName(f)}ยกเมือง ${provName(target)} ให้ด้วยความหวาดกลัว`, 'player');
      return {ok:true, msg:`ยึด ${provName(target)} ด้วยการขู่`}; }
    setDiplo('player',f,'war'); this.addFavor(f,-30);
    pushLog(`💢 ${factionName(f)}โกรธแค้นการขู่เข็ญ ประกาศสงครามตอบโต้!`, 'sys');
    return {ok:false, msg:`${factionName(f)}ไม่ยอมและประกาศสงคราม!`};
  },

  /* ---------- POLITICAL MARRIAGE ---------- */
  marriageCandidates(){
    // women: from any AI faction OR wandering (neutral) — court them into our clan
    // men:   only from AI factions — a diplomatic clan-marriage
    return G.generals.filter(g=>{
      if(g.faction==='player'||g.lord||g.married||g.child||g.consortOf) return false;
      if(g.sex==='f') return g.faction==='neutral' || factionProvinces(g.faction).length>0;
      return g.faction!=='neutral' && factionProvinces(g.faction).length>0;
    });
  },
  /* our unmarried ladies we can send to seal an alliance */
  ourLadies(){
    return G.generals.filter(g=> g.faction==='player' && g.sex==='f' && !g.married && !g.child && !g.consortOf);
  },
  /* eligible bachelors in a target faction to receive our lady */
  bachelorsOf(f){
    return G.generals.filter(g=> g.faction===f && g.sex==='m' && !g.married && !g.child);
  },
  /* send one of OUR ladies to a target faction's bachelor → favor + a child-bearing union */
  sendBride(ladyKey, targetFaction, groomKey){
    const lady=genById(ladyKey); if(!lady) return {ok:false,msg:'ไม่พบสตรี'};
    const groom = groomKey?genById(groomKey):this.bachelorsOf(targetFaction)[0];
    if(!groom) return {ok:false,msg:`${factionName(targetFaction)}ไม่มีบุรุษที่เหมาะสมรับเป็นคู่`};
    const acc = this.attitude(targetFaction) > 45 + Math.random()*30;
    lady.married=true;
    this.addFavor(targetFaction, 28);
    if(atWar('player',targetFaction)) setDiplo('player',targetFaction,'peace');
    // the union bears the next generation INTO our family (the bride keeps our clan ties)
    registerUnion(ladyKey, groom.key, 'player');
    G.marriages.push({lady:ladyKey, groom:groom.key, faction:targetFaction, year:G.year});
    if(acc){
      pushLog(`💞 อภิเษก ${lady.short} กับ ${groom.short} แห่ง${factionName(targetFaction)} — ผูกสัมพันธ์เครือญาติแน่นแฟ้น`, 'player');
      return {ok:true, msg:`${factionName(targetFaction)}ยินดีรับ ${lady.short} เป็นสะใภ้ — สัมพันธ์ดีขึ้นมาก`};
    }
    pushLog(`💞 ${lady.short}สมรสกับ ${groom.short} แต่${factionName(targetFaction)}ยังเย็นชา`, 'player');
    return {ok:true, msg:`สมรสสำเร็จ แต่${factionName(targetFaction)}ยังไม่ไว้ใจเต็มที่`};
  },
  proposeMarriage(genKey){
    const g=genById(genKey); if(!g) return {ok:false,msg:'ไม่พบขุนพล'};
    if(g.married||g.consortOf) return {ok:false,msg:`${g.short}เป็นคู่ครองผู้อื่นอยู่แล้ว สู่ขอมิได้`};
    const f=g.faction;
    // wandering lady (neutral) — court her directly into our family; success scales with her charm vs our prestige
    if(f==='neutral'){
      const lord=G.generals.find(p=>p.faction==='player'&&p.lord);
      const acc = (40 + ((lord?lord.cha:70)-70)*0.7 + factionProvinces('player').length*1.5 + (playerHoldsEmperor()||G.flags.emperorEvent?10:0)) > 45 + Math.random()*40;
      if(acc){
        g.married=true; g.faction='player'; g.prov=FACTIONS.player.capital||factionProvinces('player')[0]; g.loyalty=85;
        const partner = G.generals.find(p=>p.faction==='player'&&p.sex!==g.sex&&!p.married&&!p.child) || G.generals.find(p=>p.faction==='player'&&p.lord);
        if(partner){ if(partner!==g) partner.married=true; registerUnion(g.sex==='f'?g.key:partner.key, g.sex==='f'?partner.key:g.key, 'player'); }
        G.marriages.push({gen:genKey, faction:'neutral', year:G.year});
        pushLog(`💞 ${g.short} ยินดีอภิเษกเข้าสู่ตระกูลของท่าน — ได้สตรีผู้สูงศักดิ์มาเป็นเครือญาติ`, 'player');
        return {ok:true, msg:`${g.short} เข้าร่วมตระกูลของท่านแล้ว!`};
      }
      return {ok:false, msg:`${g.short}ยังไม่ยินยอม — เสริมบารมีก๊กแล้วลองใหม่`};
    }
    const acc = this.attitude(f) > 55 + Math.random()*30;
    if(acc){
      g.married=true;
      this.addFavor(f, 25);
      if(atWar('player',f)) setDiplo('player',f,'peace');
      // 50% the general defects to player over time → bind loyalty
      G.marriages.push({gen:genKey, faction:f, year:G.year});
      pushLog(`💞 แต่งงานการเมืองกับสายสกุล ${g.short} แห่ง${factionName(f)} — สัมพันธ์แน่นแฟ้น`, 'player');
      // chance the married general joins player
      if(Math.random()<0.5){ g.faction='player'; g.prov=FACTIONS.player.capital||factionProvinces('player')[0]; g.loyalty=85;
        pushLog(`💍 ${g.short} ย้ายเข้าร่วมก๊กท่านผ่านสายสัมพันธ์เครือญาติ!`, 'player'); }
      // pair with one of our ladies (or the lord) so the marriage may bear heirs into our family
      const partner = G.generals.find(p=>p.faction==='player'&&p.sex!==g.sex&&!p.married&&!p.child) || G.generals.find(p=>p.faction==='player'&&p.lord);
      if(partner){ g.married=true; if(partner!==g) partner.married=true; registerUnion(g.sex==='f'?g.key:partner.key, g.sex==='f'?partner.key:g.key, 'player'); }
      return {ok:true, msg:`สมรสกับ ${g.short} สำเร็จ! ${factionName(f)}กลายเป็นเครือญาติ`};
    }
    return {ok:false, msg:`${factionName(f)}ปฏิเสธข้อเสนอสมรส`};
  },

  /* ---------- historical events ---------- */
  tickEvents(){
    HISTORICAL_EVENTS.forEach(ev=>{
      if(ev.year===G.year && !G.flags.doneEvents.includes(ev.key)){
        G.flags.doneEvents.push(ev.key);
        // เหตุการณ์เปลี่ยนไปตามสภาพการเล่นจริง — ถ้าเงื่อนไขไม่ผ่าน เหตุการณ์นี้จะไม่เกิดขึ้น
        if(typeof ev.cond==='function' && !ev.cond(G)) return;
        if(ev.key==='ev_emperor'){ // whoever holds Luoyang/Chang'an holds emperor
          const holder = G.owner['P01']||G.owner['P02'];
          G.flags.emperorHolder = holder || 'none';
        }
        ev.effect(G);
        UI.queueEvent(ev);
      }
    });
  },

  /* ---------- random event deck (คอนเทนต์ระหว่างทาง) ----------
     สุ่มเหตุการณ์แบบมีตัวเลือก โผล่ระหว่างเทิร์น ตามน้ำหนัก+เงื่อนไขก๊กของท่าน
     ป้องกันโผล่ถี่/ซ้ำติดกันด้วยคูลดาวน์และประวัติเหตุการณ์ล่าสุด                     */
  rollRandomEvent(){
    if(typeof RANDOM_EVENTS==='undefined') return null;
    G.flags.randCooldown = (G.flags.randCooldown||0);
    if(G.flags.randCooldown>0){ G.flags.randCooldown--; return null; }
    if(Math.random() > 0.55) return null;                 // ~ไม่เกิดทุกเทิร์น เว้นจังหวะให้เกม
    const recent = G.flags.recentRand || [];
    const pool = RANDOM_EVENTS.filter(d=>{
      if(recent.includes(d.key)) return false;            // ไม่ซ้ำกับ 3 ใบล่าสุด
      try { return typeof d.cond!=='function' || d.cond(G); } catch(e){ return false; }
    });
    if(!pool.length) return null;
    let total=pool.reduce((s,d)=>s+(d.weight||5),0);
    let r=Math.random()*total, def=pool[0];
    for(const d of pool){ r-=(d.weight||5); if(r<=0){ def=d; break; } }
    let ctx=null;
    try { ctx = def.pick ? def.pick(G) : {}; } catch(e){ ctx=null; }
    if(ctx===null || ctx===undefined) return null;        // ไม่มีเป้าหมายเหมาะสม → ข้าม
    // bookkeeping
    G.flags.recentRand = [def.key, ...recent].slice(0,3);
    G.flags.randCooldown = 1 + Math.floor(Math.random()*2);
    return { _rand:true, def, ctx };
  },

  /* ---------- border raids (ภัยชายแดน) ----------
     หัวเมืองชายขอบถูกอนารยชน/โจรกดดันเป็นระยะ สร้างเป็น choice-event แบบไดนามิก   */
  rollBorderRaid(){
    if(typeof BORDER_RAIDS==='undefined') return null;
    G.flags.raidCooldown = (G.flags.raidCooldown||0);
    if(G.flags.raidCooldown>0){ G.flags.raidCooldown--; return null; }
    if(Math.random() > 0.4) return null;
    const mine = (typeof factionProvinces==='function') ? factionProvinces('player') : [];
    if(!mine.length) return null;
    // หาเผ่าที่มีหัวเมืองชายแดนของเราให้ปล้นได้
    const able = BORDER_RAIDS.map(rd=>({ rd, targets: rd.frontier.filter(p=>mine.includes(p)) }))
                             .filter(o=>o.targets.length>0);
    if(!able.length) return null;
    const choice = able[Math.floor(Math.random()*able.length)];
    const rd = choice.rd;
    const prov = choice.targets[Math.floor(Math.random()*choice.targets.length)];
    const power = 25 + Math.floor(Math.random()*30) + Math.floor((G.year-190)*1.5); // ยิ่งปีหลังยิ่งแรง
    const ctx = { prov, power, tribe:rd.tribe };
    G.flags.raidCooldown = 2 + Math.floor(Math.random()*2);

    // สร้าง def ของ choice-event แบบไดนามิก เพื่อใช้โมดัลเดิมร่วมกัน
    const def = {
      key:rd.key, title:rd.title, zh:rd.zh,
      body:(S,c)=>`${rd.blurb} บัดนี้ยกเข้าตีเมือง${provName(c.prov)}ของท่าน กำลังข้าศึกประมาณ ${c.power} กอง เสนาเข้ามาทูลถามว่าจะรับมือประการใด`,
      choices:[
        { label:'ส่งแม่ทัพออกต้านทานข้าศึก', hint:'ชี้ขาดด้วยกำลังพล + บู๊แม่ทัพประจำเมือง',
          effect:(S,c)=>{
            const cmd = (typeof commanderOf==='function') ? commanderOf(c.prov) : null;
            const def = (S.troops[c.prov]||0) + (cmd ? cmd.war*0.6 : 0) + Math.random()*25;
            if(def >= c.power){
              const loss = Math.floor(c.power*0.15);
              S.troops[c.prov] = Math.max(0,(S.troops[c.prov]||0)-loss);
              if(cmd) cmd.loyalty = Math.min(100,(cmd.loyalty||60)+4);
              S.loyalty[c.prov] = Math.min(100,(S.loyalty[c.prov]||50)+6);
              return `${cmd?cmd.short:'แม่ทัพ'}คุมพลออกตีกระหนาบ พวก${c.tribe}แตกพ่ายล่าถอยไป เมือง${provName(c.prov)}รอดพ้นภัย เสียไพร่พลเพียง ${loss} กอง ราษฎรสรรเสริญในความกล้าหาญ`;
            } else {
              const loss = Math.floor(c.power*0.5);
              S.troops[c.prov] = Math.max(0,(S.troops[c.prov]||0)-loss);
              S.wealth[c.prov] = Math.max(0,Math.floor((S.wealth[c.prov]||0)*0.8));
              S.loyalty[c.prov] = Math.max(0,(S.loyalty[c.prov]||50)-8);
              return `กำลังเมือง${provName(c.prov)}เหลือน้อย มิอาจต้านทานพวก${c.tribe}ได้ ข้าศึกบุกเข้าปล้นเสบียงเสียหายยับเยิน ไพร่พลล้มตาย ${loss} กอง ราษฎรเดือดร้อนระส่ำระสาย`;
            }
          } },
        { label:'มอบบรรณาการกล่อมให้ถอยทัพ', hint:'−คลังตามกำลังข้าศึก · รักษาเมืองไว้',
          enabled:(S,c)=> S.treasury.player >= c.power,
          effect:(S,c)=>{ const pay=c.power; S.treasury.player-=pay;
            return `ท่านให้นำทองและของกำนัล ${pay} ตำลึง ออกไปกล่อมหัวหน้าพวก${c.tribe} ข้าศึกได้ลาภก็ยอมถอยทัพกลับไป เมือง${provName(c.prov)}รอดพ้นโดยมิเสียเลือดเนื้อ`; } },
        { label:'ปิดเมืองตั้งรับอย่างเดียว', hint:'เสียกำลัง/ขวัญ แต่ไม่เสียเมือง',
          effect:(S,c)=>{ const loss=Math.floor(c.power*0.35);
            S.troops[c.prov]=Math.max(0,(S.troops[c.prov]||0)-loss);
            S.loyalty[c.prov]=Math.max(0,(S.loyalty[c.prov]||50)-5);
            return `ท่านสั่งปิดประตูเมือง${provName(c.prov)}ตั้งมั่นรับศึก พวก${c.tribe}ปล้นชานเมืองอยู่หลายเพลาแล้วถอยไปเอง รักษาเมืองไว้ได้แต่เสียไพร่พล ${loss} กอง ราษฎรหวาดหวั่น`; } }
      ]
    };
    return { _rand:true, def, ctx, _raid:true };
  },

  /* ---------- recruitment quests (เนื้อเรื่องชวนขุนพลคนสำคัญ) ----------
     เรื่องราวการได้ขุนพลระดับตำนาน ต่างกันทุกรอบ ใช้โมดัล choice-event ร่วมกัน
     ความคืบหน้าเก็บใน G.flags.quests[id]                                        */
  rollQuest(){
    G.flags.quests = G.flags.quests || {};
    const mine = (typeof factionProvinces==='function') ? factionProvinces('player') : [];
    if(!mine.length) return null;
    G.flags.questCooldown = (G.flags.questCooldown||0);
    if(G.flags.questCooldown>0){ G.flags.questCooldown--; return null; }

    const lord = G.generals.find(x=>x.faction==='player'&&x.lord);
    const Q=G.flags.quests;
    const lb=genById('g_liubei'), gy=genById('g_guanyu'), km=genById('g_zhugeliang'), lu=genById('g_lubu');
    const pool=[];

    /* — สามยอดกระท่อม: เยือนขงเบ้งสามครา — */
    if(km && km.faction==='neutral' && Q.kongming!=='done' && mine.length>=2 && lord && lord.cha>=70){
      pool.push('kongming');
    }
    /* — ลิโป้เร่ร่อนหานาย (หลังตั๋งโต๊ะดับ) — */
    if(lu && lu.faction==='neutral' && Q.lubu!=='done'){
      pool.push('lubu');
    }
    /* — บททดสอบความภักดีกวนอู (เจ้าเก่ายังอยู่) — */
    if(gy && gy.faction==='player' && Q.guanyu!=='done' && lb && lb.faction!=='player' &&
       (typeof factionProvinces==='function') && factionProvinces(lb.faction).length>0){
      pool.push('guanyu');
    }
    if(!pool.length) return null;
    if(Math.random() > 0.5) return null;          // เว้นจังหวะ ไม่ให้ถี่
    const id = pool[Math.floor(Math.random()*pool.length)];
    G.flags.questCooldown = 1 + Math.floor(Math.random()*2);

    let def=null, ctx={};
    if(id==='kongming'){
      const stage = Q.kongming||0;                 // 0,1,2 = เยือนแล้วกี่ครั้ง
      const ord=['ปฐมวาร','ทุติยวาร','ตติยวาร'][stage]||'อีกครา';
      const scene = [
        'ฝ่ายท่านได้ยินกิตติศัพท์ “มังกรหลับ” ขงเบ้ง บัณฑิตผู้หยั่งรู้ฟ้าดิน ซ่อนกายทำไร่อยู่ ณ เนินหลงต๋ง จึงดำริจะไปเยือนถึงกระท่อม',
        'ฝ่ายท่านเสด็จไปเยือนหลงต๋งอีกคำรบ แต่ขงเบ้งออกไปธุระมิอยู่ เด็กรับใช้บอกว่าอาจารย์ไปเที่ยวป่าเขายังมิกลับ ท่านได้แต่ฝากสาส์นไว้',
        'ฝ่ายท่านมุ่งสู่หลงต๋งเป็นวาระที่สาม ครานี้ขงเบ้งนอนหลับอยู่ในเรือน ท่านยืนคอยอยู่หน้ากระท่อมมิกล้าปลุก จนขงเบ้งตื่นแล้วจึงได้สนทนากัน'
      ][stage] || 'ฝ่ายท่านมุ่งสู่หลงต๋งอีกครา';
      def = {
        key:'q_kongming', title:'สามยอดกระท่อม', zh:'三顧茅廬',
        body:(S,c)=>`${scene}（เยือนแล้ว ${stage} ครา · ต้องครบสามคราจึงจะได้พบและเชิญมา）`,
        choices:[
          { label: stage<2 ? 'เสด็จไปเยือนถึงกระท่อมด้วยพระองค์เอง' : 'คำนับเชิญขงเบ้งออกช่วยบ้านเมือง',
            hint: stage<2 ? '−20 คลัง · นับเป็นการเยือน 1 ครา' : 'ครบสามครา · เชิญมังกรหลับสู่ก๊ก',
            enabled:(S)=> S.treasury.player>=20,
            effect:(S,c)=>{ S.treasury.player-=20; const v=(G.flags.quests.kongming||0)+1; G.flags.quests.kongming=v;
              if(v>=3){ const g=genById('g_zhugeliang'); G.flags.quests.kongming='done';
                if(g){ g.faction='player'; g.lord=false; g.loyalty=95; g.prov=FACTIONS.player.capital||factionProvinces('player')[0]||g.prov; }
                return `ครานี้ขงเบ้งเห็นความตั้งใจจริงของท่านที่อุตส่าห์มาเยือนถึงสามครา ก็ซาบซึ้งใจ กล่าวว่า “เมื่อท่านเห็นข้าฯ มีค่าถึงเพียงนี้ ข้าฯ ขอถวายชีวิตรับใช้จนสิ้นลม” แล้วยอมออกจากเนินหลงต๋งมาเป็นกุนซือเอกของท่าน ได้ “มังกรหลับ” ขงเบ้งมาแล้ว!`; }
              return `ท่านเยือนหลงต๋งเป็นครั้งที่ ${v} แม้ยังมิได้ตัวขงเบ้ง แต่ความเพียรของท่านเริ่มเลื่องลือ ผู้คนต่างสรรเสริญในความถ่อมตนใฝ่หาบัณฑิต（เหลืออีก ${3-v} ครา）`; } },
          { label:'ยังไม่ไปในคราวนี้', hint:'รอวาระอันควร',
            effect:(S,c)=>`ท่านเห็นว่ายังมิใช่เวลาอันควร จึงรอวาระต่อไป ขงเบ้งยังคงทำไร่ไถนาอยู่ ณ หลงต๋งดังเดิม` }
        ]
      };
    }
    else if(id==='lubu'){
      def = {
        key:'q_lubu', title:'ลิโป้แสวงหานาย', zh:'呂布投主',
        body:(S,c)=>`ฝ่ายลิโป้ “เทพสงครามไร้พ่าย” ยอดขุนพลหนึ่งเดียวใต้หล้า บัดนี้สิ้นที่พึ่งเร่ร่อนหานายเหนือหัว ผู้ใดมอบม้าเซ็กเธาว์และทองคำกล่อมได้ก่อนก็จะได้ตัวไป — แต่ผู้นี้ใจคอเอาแน่มิได้ เคยทรยศนายมาแล้วสองครา`,
        choices:[
          { label:'มอบม้าเซ็กเธาว์และทองคำเกลี้ยกล่อม', hint:'−130 คลัง · ได้ยอดขุนพล (แต่ภักดีต่ำ)',
            enabled:(S)=> S.treasury.player>=130,
            effect:(S,c)=>{ S.treasury.player-=130; const g=genById('g_lubu'); G.flags.quests.lubu='done';
              if(g){ g.faction='player'; g.lord=false; g.loyalty=45; g.prov=FACTIONS.player.capital||factionProvinces('player')[0]||g.prov; }
              return `ท่านให้นำม้าเซ็กเธาว์อันเลื่องชื่อกับทองคำไปมอบแก่ลิโป้ ลิโป้เห็นของกำนัลก็ยินดียอมสวามิภักดิ์ทันที ได้ยอดขุนพลบู๊ร้อยมาไว้ในก๊ก — หากแต่ความภักดียังน้อยนัก พึงระวังมิให้เอาใจออกห่าง`; } },
          { label:'มิไยดี ผู้ทรยศนายย่อมไว้ใจมิได้', hint:'+คุณธรรม · ลิโป้อาจไปเข้าก๊กอื่น',
            effect:(S,c)=>{ G.flags.quests.lubu='done'; const g=genById('g_lubu');
              if(g && Math.random()<0.5){ const facs=Diplo.aliveFactions().filter(f=>f!=='player');
                if(facs.length){ const f=facs[Math.floor(Math.random()*facs.length)]; g.faction=f; g.prov=factionProvinces(f)[0]||g.prov; g.loyalty=50;
                  return `ท่านเห็นว่าลิโป้เป็นคนทรยศนายมาแล้ว หาควรไว้วางใจไม่ จึงมิรับไว้ ภายหลังลิโป้ไปสวามิภักดิ์ก๊ก${factionName(f)}แทน — ชื่อเสียงด้านคุณธรรมของท่านเลื่องลือ`; } }
              return `ท่านปฏิเสธมิรับลิโป้ผู้ทรยศนายเก่า ลิโป้ได้แต่เร่ร่อนต่อไป ขุนนางทั้งปวงสรรเสริญท่านในความหนักแน่นมีคุณธรรม`; } }
        ]
      };
    }
    else if(id==='guanyu'){
      def = {
        key:'q_guanyu', title:'น้ำใจกวนอู', zh:'關羽掛印',
        body:(S,c)=>`ฝ่ายกวนอูแม้รับใช้อยู่ใต้ธงของท่าน แต่ใจยังคำนึงถึงเล่าปี่พี่น้องร่วมสาบาน ณ สวนท้อมิเสื่อมคลาย บัดนี้รู้ว่าเล่าปี่ยังอยู่ ณ ก๊ก${factionName(lb.faction)} จึงมาขอลาท่านเพื่อตามไปหาพี่ใหญ่`,
        choices:[
          { label:'แขวนตราปล่อยกวนอูกลับไปโดยมีน้ำใจ', hint:'เสียกวนอู · +คุณธรรมเลื่องลือทั่วหล้า',
            effect:(S,c)=>{ G.flags.quests.guanyu='done'; const g=genById('g_guanyu');
              if(g && lb){ g.faction=lb.faction; g.loyalty=90; g.prov=factionProvinces(lb.faction)[0]||g.prov;
                if(typeof setRel==='function'){ try{ setRel('g_guanyu', lord?lord.key:'g_liubei', 60); }catch(e){} } }
              return `ท่านมีน้ำใจอันกว้างขวาง ยอมแขวนตราปล่อยกวนอูกลับไปหาเล่าปี่ แม้ต้องเสียยอดขุนพลไป แต่กิตติศัพท์ความมีคุณธรรมของท่านเลื่องลือไปทั่วแผ่นดิน ขุนพลทั้งหลายต่างนิยมยกย่อง`; } },
          { label:'หน่วงเหนี่ยวรั้งกวนอูไว้', hint:'เก็บกวนอูไว้ · แต่ความภักดีตกฮวบ',
            effect:(S,c)=>{ G.flags.quests.guanyu='done'; const g=genById('g_guanyu');
              if(g) g.loyalty=Math.max(15,(g.loyalty||60)-35);
              return `ท่านมิยอมปล่อยกวนอูไป สั่งให้หน่วงเหนี่ยวไว้ กวนอูจำต้องอยู่ต่อ แต่ใจมิสมัครรักใคร่ ความภักดีเสื่อมถอยลงอย่างหนัก พึงระวังวันหนึ่งจะจากไป`; } }
        ]
      };
    }
    if(!def) return null;
    return { _rand:true, def, ctx, _quest:true };
  }
};

/* ============================================================
   RECRUIT — wandering officers (ขุนพลเร่ร่อน) appear, converse, decide
   ============================================================ */
const RECRUIT_LINES = {
  warm: [
    'ข้าได้ยินกิตติศัพท์คุณธรรมของท่านมาช้านาน หากท่านไม่รังเกียจ ข้าขออาสารับใช้ใต้ร่มธงนี้',
    'แผ่นดินกำลังลุกเป็นไฟ ข้ามองหานายเหนือหัวผู้คู่ควรมานาน — วันนี้ข้าพบแล้วกระมัง',
    'ชื่อเสียงของท่านเลื่องลือไปทั่ว ข้าเดินทางมาไกลเพียงเพื่อขอถวายตัวเป็นข้ารับใช้'
  ],
  neutral: [
    'ข้าเป็นเพียงผู้เร่ร่อน ยังมิได้ตัดสินใจฝากตัวกับผู้ใด... ท่านมีสิ่งใดให้ข้าเชื่อมั่นหรือ?',
    'โลกนี้มีขุนศึกมากมาย เหตุใดข้าจึงควรเลือกท่าน? ลองโน้มน้าวข้าดูสิ',
    'ข้ายังลังเลอยู่ หากท่านจริงใจ ก็จงแสดงให้ข้าเห็นเถิด'
  ],
  cold: [
    'ข้าเพียงผ่านทางมา มิได้คิดรับใช้ผู้ใดทั้งสิ้น อย่าได้เสียเวลาเลย',
    'ท่านยังบารมีไม่พอจะให้ข้าฝากชีวิตไว้ด้วย ข้าขอลาก่อน',
    'ฮึ! ก๊กเล็กๆ เช่นนี้มิคู่ควรกับความสามารถของข้า'
  ]
};

const Recruit = {
  /* wandering officers currently on the map */
  available(){ return G.generals.filter(g=> g.faction==='neutral' && !g.lord && !g.onMission && !g.child); },

  /* 0..100 how willing this wanderer is to serve the player */
  disposition(g){
    const lord = G.generals.find(x=>x.faction==='player'&&x.lord);
    let d = 42 + ((lord?lord.cha:70)-70)*0.6;
    d += Math.min(20, factionProvinces('player').length*1.5);
    d += (playerHoldsEmperor()||(G.flags.emperorEvent&&emperorHolder()==='player')) ? 10 : 0;
    d += hasReform('player','r_govern') ? 8 : 0;
    d += playerHasTreasure('jade_seal') ? 6 : 0;
    // talented wanderers are pickier
    const talent=(g.war+g.int)/2;
    d -= Math.max(0,(talent-78))*0.9;
    // friends already in our service warm them up
    const friends=G.generals.filter(x=>x.faction==='player'&&!x.child&&getRel(x.key,g.key)>=40).length;
    d += friends*12;
    d += (g._dispBias||0);
    return Math.max(2, Math.min(98, Math.round(d)));
  },
  tier(disp){ return disp>=58?'warm':disp>=32?'neutral':'cold'; },
  line(g){ const t=this.tier(this.disposition(g)); const a=RECRUIT_LINES[t]; const i=(g.key.length+G.turn)%a.length; return a[i]; },

  /* pick a wanderer to come visit this turn (or null) */
  rollVisit(){
    if(!factionProvinces('player').length) return null;
    const pool=this.available().filter(g=> (G.turn-(g._lastVisit||-99)) >= 3 );
    if(!pool.length) return null;
    if(Math.random() > 0.4) return null;
    // weight toward wanderers in/adjacent to our territory
    const mine=new Set(factionProvinces('player'));
    const weighted=[];
    pool.forEach(g=>{ let w=1; if(mine.has(g.prov)) w+=3; else if((ADJACENCY[g.prov]||[]).some(k=>mine.has(k))) w+=1; for(let i=0;i<w;i++) weighted.push(g); });
    return weighted[Math.floor(Math.random()*weighted.length)] || null;
  },

  /* accept a willing wanderer into the faction */
  accept(genKey){
    const g=genById(genKey); if(!g||g.faction!=='neutral') return {ok:false,msg:'ขุนพลผู้นี้ไม่อยู่แล้ว'};
    const disp=this.disposition(g);
    if(this.tier(disp)==='cold'){ return {ok:false, msg:`${g.short}ไม่ไยดี ต้องเกลี้ยกล่อมหรือมอบของกำนัลก่อน`}; }
    g.faction='player'; g.lord=false; g.prov=FACTIONS.player.capital||factionProvinces('player')[0];
    g.loyalty = Math.max(55, Math.min(95, 55 + Math.round((disp-50)*0.6)));
    delete g._dispBias;
    pushLog(`🤝 ${g.short} (${g.title||''}) เข้าร่วมก๊กท่านด้วยความเต็มใจ!`, 'player');
    saveGame(); return {ok:true, msg:`ได้ ${g.short} มาเป็นกำลังสำคัญ!`};
  },

  /* try to persuade a hesitant/cold wanderer (may fail → they leave) */
  persuade(genKey){
    const g=genById(genKey); if(!g||g.faction!=='neutral') return {ok:false,msg:'ขุนพลผู้นี้ไม่อยู่แล้ว'};
    const disp=this.disposition(g);
    const chance = disp/130 + (hasReform('player','r_govern')?0.08:0);
    if(Math.random()<chance){ return this.accept(genKey); }
    // failed — the wanderer departs to seek another lord
    this.leave(genKey, true);
    return {ok:false, msg:`${g.short}ส่ายหน้าปฏิเสธ แล้วลาจากไป`, left:true};
  },

  /* offer a gift to warm a wanderer up (costs gold, one step) */
  gift(genKey, cost){
    cost = cost||60;
    const g=genById(genKey); if(!g||g.faction!=='neutral') return {ok:false,msg:'ขุนพลผู้นี้ไม่อยู่แล้ว'};
    if(G.treasury.player<cost) return {ok:false,msg:`ต้องใช้ ${cost}💰 (คลังไม่พอ)`};
    G.treasury.player-=cost;
    g._dispBias=(g._dispBias||0)+26;
    pushLog(`🎁 มอบของกำนัล ${cost}💰 เอาใจ ${g.short}`, 'player');
    saveGame(); return {ok:true, msg:`${g.short}ดูผ่อนคลายขึ้น (ลองเกลี้ยกล่อมอีกครั้ง)`};
  },

  /* the wanderer leaves — politely declined OR failed persuasion */
  leave(genKey, byThemselves){
    const g=genById(genKey); if(!g) return {ok:true,msg:''};
    g._lastVisit=G.turn; delete g._dispBias;
    // 35% they join a random alive AI faction; otherwise drift to a random neutral province
    if(Math.random()<0.35){
      const facs=Diplo.aliveFactions(); if(facs.length){ const f=facs[Math.floor(Math.random()*facs.length)];
        g.faction=f; g.prov=factionProvinces(f)[0]||g.prov; g.loyalty=70;
        pushLog(`🏃 ${g.short} ผิดหวังในตัวท่าน หันไปเข้าร่วมก๊ก${factionName(f)}แทน`, 'sys');
        saveGame(); return {ok:true, msg:`${g.short}ไปสวามิภักดิ์${factionName(f)}`}; }
    }
    const spots=Object.keys(PROVINCES).filter(k=>!G.owner[k]||G.owner[k]==='neutral');
    if(spots.length) g.prov=spots[Math.floor(Math.random()*spots.length)];
    pushLog(`🚶 ${g.short} จากไปแสวงหานายเหนือหัวที่อื่นต่อไป`, 'sys');
    saveGame(); return {ok:true, msg:`${g.short}จากไปแล้ว`};
  },

  /* politely decline a willing wanderer */
  decline(genKey){ return this.leave(genKey, false); }
};

/* ============================================================
   ESPIONAGE
   ============================================================ */
const Espionage = {
  availableAgents(){ return G.generals.filter(g=>g.faction==='player' && !g.lord && !g.onMission && g.int>=55); },

  infiltrate(genKey, targetFaction){
    const g=genById(genKey); if(!g) return {ok:false,msg:'ไม่พบขุนพล'};
    if(!factionProvinces(targetFaction).length) return {ok:false,msg:'ก๊กนั้นล่มสลายแล้ว'};
    g.onMission=true; g.spyFaction=targetFaction; g.spyRank=1; g.spyTurns=0;
    g._homeProv=g.prov;
    G.spies.push({gen:genKey, target:targetFaction, rank:1});
    pushLog(`🕵️ ส่ง ${g.short} แฝงตัวเข้าก๊ก${factionName(targetFaction)}ในคราบขุนนางใหม่`, 'player');
    return {ok:true, msg:`${g.short} เริ่มภารกิจจารกรรมใน${factionName(targetFaction)}`};
  },

  /* called each turn from AI tick to advance spy ranks */
  tickSpies(){
    G.spies.forEach(s=>{
      const g=genById(s.gen); if(!g||!g.onMission) return;
      g.spyTurns++;
      // promotion chance scales with INT/CHA
      if(g.spyTurns%2===0 && g.spyRank<3 && Math.random() < (g.int+g.cha)/260){
        g.spyRank++; s.rank=g.spyRank;
        const titles=['','สายลับแฝงตัว','เจ้าเมือง (ปลอม)','แม่ทัพใหญ่ (ปลอม)'];
        pushLog(`🎭 ${g.short} ไต่เต้าเป็น “${titles[g.spyRank]}” ในก๊ก${factionName(g.spyFaction)}`, 'player');
      }
      // discovery risk
      if(Math.random() < 0.05){
        pushLog(`☠️ ${g.short} ถูกจับได้ว่าเป็นสายลับและถูกประหารในก๊ก${factionName(g.spyFaction)}!`, 'sys');
        G.generals=G.generals.filter(x=>x.key!==g.key);
        s._dead=true;
      }
    });
    G.spies=G.spies.filter(s=>!s._dead);
  },

  actions(genKey){
    const g=genById(genKey); if(!g||!g.onMission) return [];
    const list=[{id:'recall', label:'🚪 เรียกตัวกลับ', need:1}];
    if(g.spyRank>=2){ list.push({id:'embezzle', label:'💰 ยักยอกเงินคลัง', need:2}); }
    if(g.spyRank>=2){ list.push({id:'gates', label:'🏯 เปิดประตูเมืองรับทัพเรา', need:2}); }
    if(g.spyRank>=3){ list.push({id:'civilwar', label:'🔥 ยุยงสงครามกลางเมือง', need:3}); }
    return list;
  },

  doAction(genKey, action){
    const g=genById(genKey); if(!g) return {ok:false,msg:''};
    const tf=g.spyFaction;
    if(action==='recall'){
      g.onMission=false; g.faction='player'; g.prov=g._homeProv||factionProvinces('player')[0];
      G.spies=G.spies.filter(s=>s.gen!==genKey);
      return {ok:true, msg:`${g.short} กลับสู่มาตุภูมิอย่างปลอดภัย`};
    }
    if(action==='embezzle'){
      const loot=Math.min(G.treasury[tf]||0, 40+g.spyRank*20);
      G.treasury[tf]=Math.max(0,(G.treasury[tf]||0)-loot); G.treasury.player+=loot;
      pushLog(`💰 ${g.short} ยักยอกทอง ${loot}💰 จากคลัง${factionName(tf)}ส่งกลับมา`, 'player');
      return {ok:true, msg:`ยักยอกได้ ${loot}💰`};
    }
    if(action==='gates'){
      // pick a border province of tf adjacent to player and flip it
      const cand=factionProvinces(tf).filter(k=>(ADJACENCY[k]||[]).some(n=>G.owner[n]==='player'));
      if(!cand.length) return {ok:false, msg:'ยังไม่มีเมืองชายแดนติดกับเราให้เปิดประตู'};
      const target=cand.sort((a,b)=>G.troops[b]-G.troops[a])[0];
      G.owner[target]='player'; G.troops[target]=Math.max(10,Math.floor(G.troops[target]*0.5));
      g.onMission=false; g.faction='player'; g.prov=target; g.loyalty=80;
      G.spies=G.spies.filter(s=>s.gen!==genKey);
      pushLog(`🏯 ${g.short} เปิดประตูเมือง ${provName(target)} ยกให้ก๊กท่านโดยไม่เสียเลือดเนื้อ!`, 'player');
      return {ok:true, msg:`ยึด ${provName(target)} ด้วยไส้ศึก!`};
    }
    if(action==='civilwar'){
      // sap a chunk of target faction's troops & cause a province to defect to neutral
      factionProvinces(tf).forEach(k=>G.troops[k]=Math.max(5,Math.floor(G.troops[k]*0.7)));
      const cand=factionProvinces(tf);
      if(cand.length>1){ const t=cand[Math.floor(Math.random()*cand.length)]; G.owner[t]=null; }
      g.onMission=false; g.faction='player'; g.prov=g._homeProv||factionProvinces('player')[0];
      G.spies=G.spies.filter(s=>s.gen!==genKey);
      pushLog(`🔥 ${g.short} จุดชนวนสงครามกลางเมืองในก๊ก${factionName(tf)} กองทัพปั่นป่วนแตกแยก!`, 'player');
      return {ok:true, msg:`ก๊ก${factionName(tf)}ระส่ำระสายหนัก!`};
    }
    return {ok:false,msg:''};
  }
};

/* ============================================================
   Court — Imperial edicts in the Emperor's name (挾天子以令諸侯)
   ============================================================ */
const COURT_TITLES = [
  { key:'sankong',  th:'ซือคง (เสนาบดีโยธา)',    rank:1, cost:200 },
  { key:'situ',     th:'ซือทู่ (เสนาบดีราษฎร)',   rank:2, cost:300 },
  { key:'taiwei',   th:'ไทอุ่ย (เสนาบดีกลาโหม)',  rank:3, cost:400 },
  { key:'chengxiang', th:'เสียงก๊ก (อัครมหาเสนาบดี)', rank:4, cost:700 }
];

const Court = {
  canEdict(){ return courtActive() && playerHoldsEmperor(); },
  /* issue an edict ordering two AI factions to make peace or go to war */
  decreeRelation(fa, fb, state){
    if(!this.canEdict()) return {ok:false,msg:'ท่านต้องกุมตัวฮ่องเต้ก่อนจึงออกราชโองการได้'};
    setDiplo(fa, fb, state);
    G.court.edictsThisReign++;
    const verb = state==='war'?'ให้ทำสงครามต่อกัน':'ให้สงบศึก';
    pushLog(`📜 ราชโองการ: บัญชา${factionName(fa)}และ${factionName(fb)}${verb}`, 'player');
    // factions resent being ordered around; obeying costs the Emperor-holder a little favor
    Diplo.addFavor(fa,-6); Diplo.addFavor(fb,-6);
    saveGame(); return {ok:true, msg:'ราชโองการประกาศแล้ว'};
  },
  /* order an AI faction to cease attacking the player (they may resent it) */
  decreeStandDown(f){
    if(!this.canEdict()) return {ok:false,msg:'ต้องกุมตัวฮ่องเต้ก่อน'};
    setDiplo('player', f, 'peace'); G.court.edictsThisReign++;
    Diplo.addFavor(f,-10);
    pushLog(`📜 ราชโองการ: บัญชา${factionName(f)}ให้ถอนทัพยุติศึกกับราชสำนัก`, 'player');
    saveGame(); return {ok:true, msg:`${factionName(f)}จำต้องยุติศึก (แต่ไม่พอใจ)`};
  },
  /* appoint an AI faction's lord to a Han court office → big favor boost */
  appointTitle(f, titleKey){
    if(!this.canEdict()) return {ok:false,msg:'ต้องกุมตัวฮ่องเต้ก่อน'};
    const t=COURT_TITLES.find(x=>x.key===titleKey); if(!t) return {ok:false,msg:''};
    if(G.treasury.player<t.cost) return {ok:false,msg:'ทองในคลังไม่พอจัดพิธีแต่งตั้ง'};
    G.treasury.player-=t.cost;
    G.court.titles[f]=titleKey; G.court.edictsThisReign++;
    Diplo.addFavor(f, 25);
    pushLog(`📜 ราชโองการ: แต่งตั้ง${factionName(f)}เป็น ${t.th} (สัมพันธ์ดีขึ้นมาก)`, 'player');
    saveGame(); return {ok:true, msg:`${factionName(f)}ปลื้มปีติในพระมหากรุณาธิคุณ`};
  },
  /* self-appoint: the Emperor-holder names themselves Chancellor → loyalty buff at home */
  selfAppoint(){
    if(!this.canEdict()) return {ok:false,msg:'ต้องกุมตัวฮ่องเต้ก่อน'};
    if(G.court.titles.player) return {ok:false,msg:'ท่านดำรงตำแหน่งเสียงก๊กอยู่แล้ว'};
    G.court.titles.player='chengxiang';
    factionProvinces('player').forEach(k=> G.loyalty[k]=Math.min(100,G.loyalty[k]+10));
    pushLog('📜 ท่านสถาปนาตนเป็นเสียงก๊ก (อัครมหาเสนาบดี) กุมอำนาจราชสำนัก!', 'player');
    saveGame(); return {ok:true, msg:'ราษฎรในก๊กท่านภักดียิ่งขึ้น'};
  }
};
