/* ============================================================
   battle.js — 2D tactical battle (3 generals · retinues · duels)
   Five-element (五行) overcoming cycle drives combat advantage.
   ============================================================ */

/* 克 overcoming: key beats value  (advantage multiplier) */
const EL_BEATS = { champion:'commander', commander:'strategist', strategist:'vanguard', vanguard:'sentinel', sentinel:'champion' };

const Battle = {
  B:null,

  open(pb){
    const mk = (genKeys, totalTroops, faction, side)=>{
      const gens = genKeys.map(genById).filter(Boolean);
      const units=[];
      if(gens.length===0){
        units.push(this.unit(null, totalTroops, faction, side, 'นายกอง'));
      } else {
        const per = Math.floor(totalTroops/gens.length);
        gens.forEach((g,i)=> units.push(this.unit(g, i===gens.length-1? totalTroops-per*(gens.length-1):per, faction, side)));
      }
      return units;
    };
    this.B = {
      pb, round:1, maxRound:8, log:[], chosen:null, over:false,
      atk: mk(pb.atkGens, pb.atkTroops, pb.atkFaction, 'atk'),
      def: mk(pb.defGens, pb.defTroops, pb.defFaction, 'def'),
      playerSide: pb.playerSide==='attacker' ? 'atk':'def'
    };
    this.render();
    document.getElementById('battleOverlay').classList.add('show');
  },

  unit(g, troops, faction, side, fallbackName){
    const cls = g ? g.cls : 'sentinel';
    const c = HERO_CLASSES[cls];
    return {
      gen:g, key: g?g.key:'cap_'+side+Math.random().toString(36).slice(2,6),
      name: g?g.short:(fallbackName||'นายกอง'), zh: g?g.zh:'兵', cls, c,
      troops:Math.max(1,Math.round(troops)), maxTroops:Math.max(1,Math.round(troops)),
      hp: g?g.hp:90, maxhp:g?g.maxhp:90,
      morale:100, faction, side, routed:false, captured:false, slain:false
    };
  },

  alive(arr){ return arr.filter(u=>!u.routed && !u.captured && u.troops>0); },

  /* ---------- combat math ---------- */
  elFactor(a,d){ if(EL_BEATS[a.cls]===d.cls) return 1.3; if(EL_BEATS[d.cls]===a.cls) return 0.8; return 1; },
  unitAtk(u){
    let base = u.troops * (0.45 + (u.gen?effWar(u.gen):60)/220);
    if(u.cls==='vanguard') base*=1.25;
    if(u.cls==='champion') base*=1.12;
    if(u.cls==='strategist') base*=0.85;
    base *= (u.morale/100*0.5+0.5);
    if(u.gen && u.gen.faction==='player' && hasReform('player','r_smith')) base*=1.1;
    return base;
  },
  unitDef(u){
    let d = 1;
    if(u.cls==='sentinel') d=0.7;       // takes less damage
    if(u.cls==='commander') d=0.9;
    if(u.cls==='strategist') d=1.15;
    return d;
  },

  /* ---------- player order then resolve ---------- */
  choose(action){
    if(this.B.over) return;
    this.B.chosen=action;
    if(action==='duel'){ this.startDuel(); return; }
    this.resolveRound(action);
  },

  resolveRound(playerAction){
    const B=this.B;
    const pSide=B.playerSide, eSide=pSide==='atk'?'def':'atk';
    const pUnits=this.alive(B[pSide]), eUnits=this.alive(B[eSide]);
    if(!pUnits.length||!eUnits.length){ this.checkEnd(); return; }

    // player stance modifiers
    let pAtkMod=1, pDefMod=1;
    if(playerAction==='charge') pAtkMod=1.35;
    if(playerAction==='hold') pDefMod=0.6;
    if(playerAction==='tactic'){ this.runTactic(pSide); }

    // resolve player → enemy
    pUnits.forEach(u=>{
      const tgt = eUnits[Math.floor(Math.random()*eUnits.length)];
      if(!tgt) return;
      let dmg = this.unitAtk(u)*pAtkMod*this.elFactor(u,tgt)*this.unitDef(tgt);
      dmg = Math.round(dmg*(0.85+Math.random()*0.3));
      tgt.troops=Math.max(0,tgt.troops-dmg);
      tgt.morale=Math.max(0,tgt.morale - dmg/Math.max(1,tgt.maxTroops)*60);
    });
    // resolve enemy → player
    this.alive(B[eSide]).forEach(u=>{
      const tgt = pUnits[Math.floor(Math.random()*pUnits.length)];
      if(!tgt||tgt.troops<=0) return;
      let dmg = this.unitAtk(u)*this.elFactor(u,tgt)*this.unitDef(tgt)*pDefMod;
      dmg = Math.round(dmg*(0.85+Math.random()*0.3));
      tgt.troops=Math.max(0,tgt.troops-dmg);
      tgt.morale=Math.max(0,tgt.morale - dmg/Math.max(1,tgt.maxTroops)*60);
    });

    // commander morale aura (+) each side
    [B.atk,B.def].forEach(arr=>{ const hasCmd=this.alive(arr).some(u=>u.cls==='commander');
      if(hasCmd) this.alive(arr).forEach(u=>u.morale=Math.min(100,u.morale+6)); });

    // rout check
    [...B.atk,...B.def].forEach(u=>{ if(!u.routed && (u.troops<=0||u.morale<=0)){ u.routed=true;
      this.blog(`${u.name} ${u.troops<=0?'ถูกตีแตกพ่าย':'เสียขวัญแตกหนี'}!`); } });

    B.round++;
    this.render();
    this.checkEnd();
  },

  runTactic(side){
    const B=this.B;
    const strat=this.alive(B[side]).find(u=>u.cls==='strategist');
    const playerIsThisSide = side===B.playerSide;
    const canFire = playerIsThisSide ? hasReform('player','r_fire') : false;
    const enemy = side==='atk'?'def':'atk';
    if(strat){
      const dmgBase = canFire?0.35:0.2;
      this.alive(B[enemy]).forEach(u=>{ const d=Math.round(u.maxTroops*dmgBase); u.troops=Math.max(0,u.troops-d); u.morale=Math.max(0,u.morale-15); });
      this.blog(`🔥 ${strat.name} ใช้แผน${canFire?'ธนูไฟเผาทัพ':'ซุ่มโจมตี'} สร้างความเสียหายเป็นวงกว้าง!`);
    } else {
      this.blog('ไม่มีกุนซือในกองทัพ ใช้แผนการรบไม่ได้');
    }
  },

  /* ---------- DUEL ---------- */
  startDuel(){
    const B=this.B; const pSide=B.playerSide, eSide=pSide==='atk'?'def':'atk';
    const champ = this.alive(B[pSide]).filter(u=>u.gen && (u.cls==='champion'||u.cls==='vanguard'))
      .sort((a,b)=>b.gen.war-a.gen.war)[0];
    const foe = this.alive(B[eSide]).filter(u=>u.gen).sort((a,b)=>b.gen.war-a.gen.war)[0];
    if(!champ||!foe){ toast('ต้องมียอดนักรบ/ทัพหน้าฝ่ายเรา และมีแม่ทัพศัตรูจึงท้าดวลได้'); B.chosen=null; return; }
    this.renderDuel(champ, foe);
  },

  execDuel(champ, foe){
    const B=this.B;
    let cHP=champ.hp, fHP=foe.hp; const seq=[];
    let guard=0;
    while(cHP>0&&fHP>0&&guard<12){
      guard++;
      const cd=Math.round((effWar(champ.gen)*0.6)*(0.7+Math.random()*0.6))*(champ.cls==='champion'?1.15:1);
      const fd=Math.round((effWar(foe.gen)*0.6)*(0.7+Math.random()*0.6))*(foe.cls==='champion'?1.15:1);
      fHP-=cd; seq.push(`${champ.name} จู่โจม -${cd}`);
      if(fHP<=0) break;
      cHP-=fd; seq.push(`${foe.name} โต้กลับ -${fd}`);
    }
    const champWon = fHP<=0 ? true : (cHP<=0? false : cHP>=fHP);
    if(champWon){
      foe.hp=0; foe.routed=true; if(foe.gen){ foe.captured=true; }
      this.alive(B[B.playerSide]).forEach(u=>u.morale=Math.min(100,u.morale+30));
      this.alive(B[B.playerSide==='atk'?'def':'atk']).forEach(u=>u.morale=Math.max(0,u.morale-30));
      this.blog(`⚔️ ${champ.name} ชนะการท้าดวล ${foe.name}! ขวัญทัพเราพุ่งสูง ศัตรูเสียขวัญ`);
      champ.gen.hp=Math.max(20,cHP);
    } else {
      champ.hp=0; champ.routed=true; if(champ.gen){ champ.slain=Math.random()<0.4; }
      this.alive(B[B.playerSide==='atk'?'def':'atk']).forEach(u=>u.morale=Math.min(100,u.morale+25));
      this.alive(B[B.playerSide]).forEach(u=>u.morale=Math.max(0,u.morale-25));
      this.blog(`💀 ${champ.name} พ่ายแพ้การท้าดวล${champ.slain?'และสิ้นใจในสนาม':''}! ขวัญทัพเราตก`);
    }
    document.getElementById('duelStage').classList.remove('show');
    B.round++; this.render(); this.checkEnd();
  },

  /* ---------- end ---------- */
  checkEnd(){
    const B=this.B; if(B.over) return;
    const atkLive=this.alive(B.atk), defLive=this.alive(B.def);
    let done=false, attackerWon=false;
    if(!atkLive.length){ done=true; attackerWon=false; }
    else if(!defLive.length){ done=true; attackerWon=true; }
    else if(B.round>B.maxRound){
      done=true;
      const aStr=atkLive.reduce((s,u)=>s+u.troops,0), dStr=defLive.reduce((s,u)=>s+u.troops,0);
      attackerWon=aStr>=dStr;
    }
    if(done) this.finish(attackerWon);
  },

  finish(attackerWon){
    const B=this.B; B.over=true;
    const atkTroopsLeft=B.atk.reduce((s,u)=>s+(u.routed?0:u.troops),0);
    const defTroopsLeft=B.def.reduce((s,u)=>s+(u.routed?0:u.troops),0);
    // captured = enemy generals on losing side that routed/captured
    const loser = attackerWon?B.def:B.atk;
    const captured = loser.filter(u=>u.gen && (u.captured || (u.routed&&Math.random()<0.5))).map(u=>u.gen.key);
    const slain = [...B.atk,...B.def].filter(u=>u.slain&&u.gen).map(u=>u.gen.key);
    this.renderResult(attackerWon, ()=>{
      document.getElementById('battleOverlay').classList.remove('show');
      resolveBattleResult({ attackerWon,
        atkTroopsLeft: attackerWon?atkTroopsLeft:Math.max(5,atkTroopsLeft),
        defTroopsLeft: attackerWon?Math.max(5,defTroopsLeft):defTroopsLeft,
        capturedGenerals: attackerWon?captured:[], slain });
    });
  },

  blog(t){ this.B.log.unshift(t); if(this.B.log.length>6) this.B.log.pop(); },

  /* ============================================================ RENDER */
  render(){
    const B=this.B;
    const pSide=B.playerSide, eSide=pSide==='atk'?'def':'atk';
    const enemyName = factionName(pSide==='atk'?B.pb.defFaction:B.pb.atkFaction);
    const wrap=document.getElementById('battleBody');
    wrap.innerHTML=`
      <div class="bt-head">
        <div><span class="zh" style="font-size:1.4rem;color:var(--gold-bright)">會戰</span>
        <b style="margin-left:8px">สมรภูมิ ${provName(B.pb.toKey)}</b></div>
        <div class="muted">ยก ${Math.min(B.round,B.maxRound)} / ${B.maxRound}</div>
      </div>
      <div class="bt-field">
        <div class="bt-side bt-enemy">
          <div class="bt-side-label">⚔ ข้าศึก · ${enemyName}</div>
          ${this.alive(B[eSide]).map(u=>this.unitCard(u,false)).join('')||'<div class="muted bt-empty">— ทัพข้าศึกแตกพ่าย —</div>'}
        </div>
        <div class="bt-vs">✦</div>
        <div class="bt-side bt-mine">
          <div class="bt-side-label">🛡 ทัพของท่าน</div>
          ${this.alive(B[pSide]).map(u=>this.unitCard(u,true)).join('')||'<div class="muted bt-empty">— ทัพเราแตกพ่าย —</div>'}
        </div>
      </div>
      <div class="bt-log">${B.log.map(l=>`<div>• ${l}</div>`).join('')||'<div class="muted">เลือกคำสั่งบัญชาการในแต่ละยก…</div>'}</div>
      <div class="bt-orders">
        <button class="btn btn-primary" onclick="Battle.choose('charge')">⚔️ ระดมตี <small>+โจมตี</small></button>
        <button class="btn" onclick="Battle.choose('hold')">🛡️ ตั้งรับ <small>-เสียหาย</small></button>
        <button class="btn" onclick="Battle.choose('tactic')">📜 แผนกุนซือ <small>ซุ่ม/ธนูไฟ</small></button>
        <button class="btn btn-gold" onclick="Battle.choose('duel')">🐎 ท้าดวล <small>1v1</small></button>
      </div>`;
  },

  unitCard(u, mine){
    const tp=Math.round(u.troops/u.maxTroops*100);
    const pips=Math.max(0,Math.ceil(u.troops/u.maxTroops*6));
    const hpp=Math.round(u.hp/u.maxhp*100);
    return `<div class="bt-unit ${u.c.cls}" style="border-color:${u.c.color}">
      <div class="bt-unit-top">
        <span class="bt-shield zh" style="background:${u.c.color}">${u.c.zh}</span>
        <div class="bt-unit-id">
          <div class="bt-unit-name">${u.name} <span class="zh muted">${u.zh}</span></div>
          <div class="bt-el muted">${u.c.el} · ${u.c.th}</div>
        </div>
        <div class="bt-troops tnum">${u.troops}</div>
      </div>
      <div class="bt-retinue">${Array.from({length:6}).map((_,i)=>`<span class="pip ${i<pips?'on':''}" style="--pc:${u.c.color}"></span>`).join('')}</div>
      <div class="bt-bars">
        <div class="bar"><span style="width:${tp}%;background:${u.c.color}"></span></div>
        <div class="bar morale"><span style="width:${u.morale}%"></span></div>
      </div>
    </div>`;
  },

  renderDuel(champ, foe){
    const st=document.getElementById('duelStage');
    st.innerHTML=`
      <div class="duel-box card grain">
        <div class="duel-title zh">單挑 · การท้าดวลตัวต่อตัว</div>
        <div class="duel-arena">
          <div class="duel-fighter">
            <div class="bt-shield big zh" style="background:${champ.c.color}">${champ.c.zh}</div>
            <div class="duel-name">${champ.name}</div>
            <div class="muted">武 ${champ.gen.war} · ${champ.c.th}</div>
          </div>
          <div class="duel-vs zh">鬥</div>
          <div class="duel-fighter">
            <div class="bt-shield big zh" style="background:${foe.c.color}">${foe.c.zh}</div>
            <div class="duel-name">${foe.name}</div>
            <div class="muted">武 ${foe.gen.war} · ${foe.c.th}</div>
          </div>
        </div>
        <div class="modal-btn-row">
          <button class="btn btn-primary" onclick="Battle.execDuel(Battle._dc,Battle._df)">⚔️ ควบม้าเข้าปะทะ!</button>
          <button class="btn btn-ghost" onclick="document.getElementById('duelStage').classList.remove('show'); Battle.B.chosen=null;">ถอย</button>
        </div>
      </div>`;
    this._dc=champ; this._df=foe;
    st.classList.add('show');
  },

  renderResult(win, cb){
    const st=document.getElementById('duelStage');
    st.innerHTML=`<div class="duel-box card grain" style="text-align:center">
      <div class="duel-title zh" style="color:${win?'var(--gold-bright)':'var(--el-metal)'}">${win?'大捷 · มีชัย!':'敗北 · พ่ายแพ้'}</div>
      <p style="margin:14px 0;color:var(--paper-dim)">${win?'กองทัพของท่านมีชัยเหนือสมรภูมิ '+provName(this.B.pb.toKey)+'!':'ทัพของท่านพ่ายแพ้และต้องถอยร่น'}</p>
      <button class="btn btn-gold" onclick="(${''})">ดำเนินต่อ</button>
    </div>`;
    st.classList.add('show');
    st.querySelector('button').onclick=()=>{ st.classList.remove('show'); cb(); };
  }
};
