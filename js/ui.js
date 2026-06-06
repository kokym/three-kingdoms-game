/* ============================================================
   ui.js — map render, panels, modals, reform tree, city view
   ============================================================ */
const UI = {
  captureQueue:[], eventQueue:[],

  init(){
    this.buildMap();
    MapView.init();
    this.refresh();
    const last=localStorage.getItem('TG3_lastProv');
    if(last && PROVINCES[last]) this.tileClick(last);
    if(G.flags.reformReady) this.flagReform(true);
    this.processEventQueue();
  },

  /* ---------------- MAP (hand-drawn vector) ---------------- */
  buildMap(){
    const stage=document.getElementById('mapStage');
    // compute Voronoi province regions from city coordinates
    const keys=Object.keys(PROVINCES).filter(k=>MAP_XY[k]);
    this.cells={};
    if(window.d3 && d3.Delaunay){
      const pts=keys.map(k=>[MAP_XY[k].x, MAP_XY[k].y]);
      const vor=d3.Delaunay.from(pts).voronoi([-10,-10,110,114]);
      keys.forEach((k,i)=>{ const poly=vor.cellPolygon(i);
        if(poly) this.cells[k]='M'+poly.map(p=>p[0].toFixed(2)+','+p[1].toFixed(2)).join('L')+'Z'; });
    }
    const cellSvg=keys.map(k=>`<path class="cell" id="cell-${k}" data-k="${k}" d="${this.cells[k]||''}"/>`).join('');
    const riverSvg=RIVERS.map(d=>`<path class="river" d="${d}"/>`).join('');
    const islandSvg=ISLANDS.map(o=>`<path class="island" d="${o.d}"/>`).join('');
    const waveSvg=[18,40,62,90].map(y=>`<path class="wave" d="M2,${y} q4,-1.6 8,0 t8,0 t8,0 t8,0"/>`).join('')
      + [30,72].map(y=>`<path class="wave" d="M70,${y} q3,-1.4 6,0 t6,0 t6,0 t6,0"/>`).join('');

    stage.innerHTML=`
      <svg class="vec-map" viewBox="0 0 100 103" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.018 0.022" numOctaves="2" seed="7" result="n"/>
            <feDisplacementMap in="SourceGraphic" in2="n" scale="1.1" xChannelSelector="R" yChannelSelector="G"/></filter>
          <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="f"/>
            <feColorMatrix in="f" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0"/>
            <feComposite operator="over" in2="SourceGraphic"/></filter>
          <clipPath id="landClip"><path d="${LAND_PATH}"/></clipPath>
        </defs>
        <rect x="0" y="0" width="100" height="103" fill="#8ba6b3"/>
        <g class="waves">${waveSvg}</g>
        <path class="land-shadow" d="${LAND_PATH}" filter="url(#rough)"/>
        <path class="landmass" d="${LAND_PATH}" filter="url(#rough)"/>
        <g clip-path="url(#landClip)">
          <g id="regions" class="regions">${cellSvg}</g>
          <g class="rivers" filter="url(#rough)">${riverSvg}</g>
        </g>
        <path class="land-outline" d="${LAND_PATH}" filter="url(#rough)"/>
        <g class="islands" filter="url(#rough)">${islandSvg}</g>
      </svg>
      <div class="region-layer" id="regionLayer"></div>
      <div class="marker-layer" id="markerLayer"></div>`;

    // region (州) name overlay
    const rlayer=document.getElementById('regionLayer');
    Object.keys(REGIONS).forEach(rk=>{
      const rg=REGIONS[rk];
      const r=document.createElement('div');
      r.className='region-label';
      r.style.left=rg.x+'%'; r.style.top=(rg.y/103*100)+'%';
      r.innerHTML=`<span class="rl-ch">${rg.zh}</span><span class="rl-th">${rg.th}</span><span class="rl-en">${rg.en}</span>`;
      rlayer.appendChild(r);
    });

    // delegated province click on regions
    const reg=document.getElementById('regions');
    reg.addEventListener('click', e=>{ const c=e.target.closest('.cell'); if(c) this.tileClick(c.dataset.k); });

    const layer=document.getElementById('markerLayer');
    keys.forEach(k=>{
      const p=PROVINCES[k], xy=MAP_XY[k];
      const nm=p.name.split(' ');
      const m=document.createElement('button');
      m.className=`marker m-${p.size}`; m.id=`tile-${k}`;
      m.style.left=xy.x+'%'; m.style.top=(xy.y/103*100)+'%';
      m.innerHTML=`
        <span class="m-badge" id="badge-${k}"></span>
        <span class="m-dot"></span>
        <span class="m-troop" id="troop-${k}">0</span>
        <span class="m-label"><span class="lb-ch">${nm[0]}</span><span class="lb-th">${nm[1]||nm[0]}</span><span class="lb-en">${PROVINCE_EN[k]||nm[0]}</span></span>`;
      m.onclick=()=>this.tileClick(k);
      m.addEventListener('pointerdown', e=>e.stopPropagation());
      layer.appendChild(m);
    });

    this.setLang(localStorage.getItem('TG3_lang')||'th');
    this.initLayers();
  },

  /* ---------------- MAP LANGUAGE (TH / EN / CH) ---------------- */
  setLang(lang){
    if(!['th','en','ch'].includes(lang)) lang='th';
    this.lang=lang; localStorage.setItem('TG3_lang',lang);
    const stage=document.getElementById('mapStage');
    if(stage) stage.classList.remove('lang-th','lang-en','lang-ch'), stage.classList.add('lang-'+lang);
    document.querySelectorAll('.lang-toggle button').forEach(b=>b.classList.toggle('on', b.dataset.lang===lang));
  },

  /* ---------------- MAP LAYER VISIBILITY (มณฑล / เมือง / กำลังพล) ---------------- */
  initLayers(){
    const def={regions:true, cities:true, troops:true};
    let saved; try{ saved=JSON.parse(localStorage.getItem('TG3_layers')); }catch(e){}
    this.layers = Object.assign(def, saved||{});
    this.applyLayers();
  },
  toggleLayer(layer){
    this.layers[layer]=!this.layers[layer];
    localStorage.setItem('TG3_layers', JSON.stringify(this.layers));
    this.applyLayers();
  },
  applyLayers(){
    const stage=document.getElementById('mapStage'); if(!stage) return;
    stage.classList.toggle('hide-regions', !this.layers.regions);
    stage.classList.toggle('hide-cities', !this.layers.cities);
    stage.classList.toggle('hide-troops', !this.layers.troops);
    document.querySelectorAll('.layer-toggle button').forEach(b=>b.classList.toggle('on', !!this.layers[b.dataset.layer]));
  },

  renderTerritory(){
    Object.keys(PROVINCES).forEach(k=>{
      const cell=document.getElementById(`cell-${k}`); if(!cell) return;
      const ow=G.owner[k];
      if(ow && ow!=='neutral'){ cell.setAttribute('fill', factionColor(ow)); cell.setAttribute('fill-opacity', ow==='player'?0.66:0.55); cell.classList.add('owned'); }
      else { cell.setAttribute('fill', '#e6d7b3'); cell.setAttribute('fill-opacity', 0.5); cell.classList.remove('owned'); }
      cell.classList.toggle('fogged', !provinceKnown(k));
      cell.classList.toggle('active-cell', k===G.activeProvince);
    });
  },

  tileClick(key){
    // command modes
    if(G.transferSource){ this.handleMode('transfer',key); return; }
    if(G.attackSource){ this.handleMode('attack',key); return; }
    if(G.genTransferSource){ this.handleMode('general',key); return; }
    G.activeProvince=key; localStorage.setItem('TG3_lastProv',key);
    document.querySelectorAll('.marker').forEach(t=>t.classList.remove('active'));
    document.getElementById(`tile-${key}`)?.classList.add('active');
    this.showProvince(key);
  },

  handleMode(mode,key){
    const src = mode==='transfer'?G.transferSource: mode==='attack'?G.attackSource:G.genTransferSource;
    if(key===src){ this.clearModes(); this.showProvince(src); return; }
    const adj=(ADJACENCY[src]||[]).includes(key);
    if(mode==='transfer'){ if(adj&&G.owner[key]==='player') doMoveTroops(src,key); else toast('โอนทหารไปเมืองเราที่ติดกันเท่านั้น'); }
    else if(mode==='attack'){ if(adj&&G.owner[key]!=='player'){ this.clearModes(); initiateAttack(src,key); return; } else toast('โจมตีเมืองข้าศึกที่ติดกันเท่านั้น'); }
    else if(mode==='general'){ if(adj&&G.owner[key]==='player') doMoveGeneral(src,key); else toast('ย้ายขุนพลไปเมืองเราที่ติดกันเท่านั้น'); }
    this.clearModes();
  },
  clearModes(){
    document.querySelectorAll('.marker').forEach(t=>t.classList.remove('attack-target','transfer-target'));
    G.attackSource=G.transferSource=G.genTransferSource=null;
  },
  startAttack(k){ this.clearModes(); G.attackSource=k; (ADJACENCY[k]||[]).forEach(n=>{ if(G.owner[n]!=='player') document.getElementById(`tile-${n}`)?.classList.add('attack-target'); }); toast('เลือกเมืองข้าศึกที่จะบุก'); },
  startTransfer(k){ this.clearModes(); G.transferSource=k; (ADJACENCY[k]||[]).forEach(n=>{ if(G.owner[n]==='player') document.getElementById(`tile-${n}`)?.classList.add('transfer-target'); }); toast('เลือกเมืองปลายทางที่จะส่งกำลัง'); },
  startGeneral(k){ this.clearModes(); G.genTransferSource=k; (ADJACENCY[k]||[]).forEach(n=>{ if(G.owner[n]==='player') document.getElementById(`tile-${n}`)?.classList.add('transfer-target'); }); toast('เลือกเมืองที่จะย้ายขุนพลไปประจำ'); },

  /* ---------------- TOP BAR + TILE REFRESH ---------------- */
  refresh(){
    document.getElementById('uiYear').textContent=G.year;
    const seasonEl=document.getElementById('uiSeason');
    if(seasonEl){ const s=SEASONS[G.season||0]; seasonEl.innerHTML=`${s.icon} ${s.th} <span class="zh">${s.zh}</span>`; }
    document.getElementById('uiTurn').textContent=G.turn;
    document.getElementById('uiGold').textContent=G.treasury.player.toLocaleString();
    this.updateGoldTip();
    document.getElementById('uiProvCount').textContent=factionProvinces('player').length;
    this.renderTerritory();
    Object.keys(PROVINCES).forEach(k=>{
      const m=document.getElementById(`tile-${k}`); if(!m) return;
      const ow=G.owner[k]; const col=factionColor(ow);
      m.classList.toggle('owned', !!(ow&&ow!=='neutral'));
      m.classList.toggle('mine', ow==='player');
      m.style.setProperty('--mc', ow&&ow!=='neutral'?col:'rgba(245,230,200,0.85)');
      const known=provinceKnown(k);
      m.classList.toggle('fogged', !known);
      const tEl=document.getElementById(`troop-${k}`);
      tEl.textContent = known ? G.troops[k] : '?';
      tEl.classList.toggle('unknown', !known);
      const badge=document.getElementById(`badge-${k}`);
      const cmd=commanderOf(k);
      if(cmd){ const c=HERO_CLASSES[cmd.cls]; badge.innerHTML=`<span class="el-badge zh" style="background:${c.color}" title="${cmd.short} · ${c.th}">${c.zh}</span>`; }
      else badge.innerHTML='';
    });
    document.getElementById('reformPip').textContent = G.reformProgress.player<=0?'พร้อม!':`${G.reformProgress.player} เทิร์น`;
    // court pip — glows when player can act in the Emperor's name or found a dynasty
    const cpip=document.getElementById('courtPip');
    if(cpip){ const can = (courtActive()&&playerHoldsEmperor()) || canFoundDynasty().ok;
      cpip.style.display = (G.court.han && can) ? 'inline-block' : 'none'; }
    // goal pip — glows gold when the faction objective is achieved
    const gpip=document.getElementById('goalPip');
    if(gpip) gpip.style.display = G.flags.goalDone ? 'inline-block' : 'none';
  },

  /* ---------------- PROVINCE PANEL ---------------- */
  showProvince(key){
    const p=PROVINCES[key]; if(!p) return;
    const ow=G.owner[key], mine=ow==='player';
    const gens=G.generals.filter(g=>g.prov===key && g.faction===ow);
    const adj=ADJACENCY[key]||[];
    const canAtk=mine&&G.troops[key]>15&&adj.some(k=>G.owner[k]!=='player');
    const canTr=mine&&G.troops[key]>20&&adj.some(k=>G.owner[k]==='player');
    const canGen=mine&&gens.length&&adj.some(k=>G.owner[k]==='player');
    const managed=G.managedThisTurn[key];
    const nm=p.name.split(' ');
    const known=provinceKnown(key);
    const sizeTh=p.size==='large'?'นครหลวงใหญ่':p.size==='medium'?'เมืองมณฑล':'เมืองยุทธศาสตร์';
    const loyCol=G.loyalty[key]>=60?'var(--el-wood)':G.loyalty[key]>=35?'var(--gold)':'var(--el-fire)';
    let html=`
      <div class="pv-head">
        <div><span class="zh pv-zh">${nm[0]}</span><div class="pv-th">${nm[1]} · <span class="muted">${sizeTh}</span></div></div>
        <span class="pv-owner" style="color:${factionColor(ow)}">${factionName(ow)}</span>
      </div>
      <div class="pv-stats">
        <div class="pv-stat"><span>⚔️ กำลังพล</span><b class="tnum${known?'':' tnum-fog'}">${known?G.troops[key].toLocaleString():'? ? ?'}</b></div>
        <div class="pv-stat"><span>🪙 มั่งคั่ง</span><b class="tnum${known?'':' tnum-fog'}">${known?G.wealth[key]:'??'}</b></div>
        <div class="pv-stat"><span>🛡️ ป้องกัน</span><b class="tnum">${p.def}</b></div>
        <div class="pv-stat"><span>👥 ภักดี</span><b class="tnum${known?'':' tnum-fog'}" ${known?`style="color:${loyCol}"`:''}>${known?G.loyalty[key]+'%':'??'}</b></div>
      </div>`;
    if(gens.length && (mine||known)){
      html+=`<div class="pv-gens">${gens.map(g=>{const c=HERO_CLASSES[g.cls];return `<span class="gen-chip ${c.cls}" style="border-color:${c.color}"><span class="zh" style="color:${c.color}">${c.zh}</span> ${g.short}${g.loyalty<40?' ⚠️':''}</span>`;}).join('')}</div>`;
    }
    if(mine){
      html+=`<div class="pv-actions">
        <button class="btn" onclick="recruitTroops('${key}')" ${managed||G.treasury.player<(hasReform('player','r_levy')?15:20)?'disabled':''}>⚔️ เกณฑ์พล <small>${hasReform('player','r_levy')?15:20}💰 · +15</small></button>
        <button class="btn" onclick="developCity('${key}')" ${managed||G.treasury.player<25?'disabled':''}>🌾 พัฒนา <small>25💰 · +10</small></button>
        <button class="btn" onclick="pacify('${key}')" ${managed||G.treasury.player<30?'disabled':''}>🕊️ ปลอบขวัญ <small>30💰 · +ภักดี</small></button>
        <button class="btn" onclick="UI.startGeneral('${key}')" ${canGen?'':'disabled'}>👑 ย้ายขุนพล</button>
        <button class="btn" onclick="UI.startTransfer('${key}')" ${canTr?'':'disabled'}>🔄 ส่งกำลัง</button>
        <button class="btn btn-primary" onclick="UI.startAttack('${key}')" ${canAtk?'':'disabled'}>🦅 ยกทัพบุก</button>
      </div>
      <button class="btn btn-gold pv-city" onclick="UI.openCity('${key}')">🏛️ เข้าสู่การบริหารเมือง</button>`;
    } else if(ow && ow!=='neutral'){
      const ds=diploState('player',ow);
      html+=`<div class="pv-diplo muted">สถานะการทูต: <b style="color:${ds==='war'?'var(--el-fire)':ds==='alliance'?'var(--el-wood)':'var(--gold)'}">${ds==='war'?'⚔️ สงคราม':ds==='alliance'?'🤝 พันธมิตร':'🕊️ สงบ'}</b></div>`;
      if(!known) html+=`<div class="pv-fog">🌫️ <b>ม่านหมอกสงคราม</b> — ยังไม่ทราบกำลังพลและขุนพลของ${factionName(ow)} ส่งสายลับแฝงตัวหรือผูกพันธมิตรเพื่อล่วงรู้ข่าวกรอง</div>`;
      html+=`<button class="btn" onclick="UI.openDiplomacy('${ow}')">📜 เปิดเจรจาการทูตกับ${factionName(ow)}</button>`;
    } else {
      html+=`<div class="muted" style="font-size:.82rem;text-align:center;padding:6px 0">หัวเมืองอิสระ — ยกทัพจากเมืองข้างเคียงเข้ายึดครองได้</div>
      <div class="pv-fog">🌫️ ไม่ทราบกำลังพลของหัวเมืองอิสระจนกว่าจะเข้าตี — ลองส่งทัพหยั่งเชิง</div>`;
    }
    document.getElementById('pvDetail').innerHTML=html;
    this.renderLog();
  },

  renderLog(){
    const box=document.getElementById('logBox');
    box.innerHTML=G.log.slice(0,40).map(e=>{
      const col=e.type==='player'?'var(--el-wood)':e.type==='sys'?'var(--cinnabar-br)':'var(--paper-dim)';
      return `<div class="log-row"><span class="log-yr">${e.year}</span><span style="color:${col}">${e.text}</span></div>`;
    }).join('');
  },

  /* ============================================================ MODAL CORE */
  modal(title, sub, bodyHtml, footHtml){
    document.getElementById('modalTitle').textContent=title;
    document.getElementById('modalSub').textContent=sub||'';
    document.getElementById('modalBody').innerHTML=bodyHtml;
    document.getElementById('modalFoot').innerHTML=footHtml||'<button class="btn btn-ghost" onclick="UI.closeModal()">ปิด</button>';
    document.getElementById('mainModal').classList.add('show');
  },
  closeModal(){ const m=document.getElementById('mainModal'); m.classList.remove('show'); m.classList.remove('wide'); },

  /* ---------------- DIPLOMACY ---------------- */
  openDiplomacy(preselect){
    const facs=Diplo.aliveFactions();
    const sel=preselect&&facs.includes(preselect)?preselect:facs[0];
    this._diploSel=sel;
    this.renderDiplomacy();
  },
  renderDiplomacy(){
    const facs=Diplo.aliveFactions();
    const sel=this._diploSel;
    const tabs=facs.map(f=>`<button class="dp-tab ${f===sel?'on':''}" onclick="UI._diploSel='${f}';UI.renderDiplomacy()" style="--fc:${FACTIONS[f].color}"><span class="zh">${FACTIONS[f].zh}</span> ${FACTIONS[f].th}</button>`).join('');
    const att=Diplo.attitude(sel), ds=diploState('player',sel);
    const attCol=att>=60?'var(--el-wood)':att>=40?'var(--gold)':'var(--el-fire)';
    const body=`
      <div class="dp-tabs">${tabs}</div>
      <div class="dp-info card-pad">
        <div class="dp-row"><span>ผู้นำก๊ก</span><b>${FACTIONS[sel].leader}</b></div>
        <div class="dp-row"><span>ดินแดนครอบครอง</span><b>${factionProvinces(sel).length} เมือง</b></div>
        <div class="dp-row"><span>สถานะปัจจุบัน</span><b style="color:${ds==='war'?'var(--el-fire)':ds==='alliance'?'var(--el-wood)':'var(--gold)'}">${ds==='war'?'⚔️ สงคราม':ds==='alliance'?'🤝 พันธมิตร':'🕊️ สงบศึก'}</b></div>
        <div class="dp-row"><span>ท่าทีต่อท่าน</span><b style="color:${attCol}">${att}/100</b></div>
        <div class="att-bar"><span style="width:${att}%;background:${attCol}"></span></div>
      </div>
      <div class="dp-acts">
        <button class="btn" onclick="UI.diploDo('gift')">🎁 มอบบรรณาการ (80💰)</button>
        <button class="btn" onclick="UI.diploDo('buy')">💱 เจรจาซื้อดินแดน</button>
        <button class="btn" onclick="UI.diploDo('alliance')">🤝 เสนอเป็นพันธมิตร</button>
        <button class="btn" onclick="UI.diploDo('peace')">🕊️ ขอสงบศึก</button>
        <button class="btn" onclick="UI.diploDo('demand')">😠 ขู่เข็ญเรียกดินแดน</button>
        <button class="btn btn-primary" onclick="UI.diploDo('war')">⚔️ ประกาศสงคราม</button>
      </div>`;
    this.modal('การทูตเชิงลึก','เจรจา ค้าขาย ขู่เข็ญ หรือผูกพันธมิตรกับขุนศึกทั่วแผ่นดิน',body);
  },
  diploDo(act){
    const f=this._diploSel; let res;
    if(act==='gift') res=Diplo.gift(f,80);
    else if(act==='buy') res=Diplo.buyProvince(f);
    else if(act==='alliance') res=Diplo.proposeAlliance(f);
    else if(act==='peace') res=Diplo.proposePeace(f);
    else if(act==='demand') res=Diplo.demandProvince(f);
    else if(act==='war') res=Diplo.declareWar(f);
    if(res) toast(res.msg);
    saveGame(); this.refresh(); this.renderDiplomacy();
    if(G.activeProvince) this.showProvince(G.activeProvince);
  },

  /* ---------------- IMPERIAL COURT ---------------- */
  openCourt(){ this._courtSel=null; this.renderCourt(); },
  renderCourt(){
    const holder=emperorHolder();
    const mine=playerHoldsEmperor();
    const active=courtActive();
    const eProv=G.court.emperorProv;
    const dyn=canFoundDynasty();
    let body='';

    // status banner
    const holderTxt = holder ? (mine?'<b style="color:var(--el-wood)">ท่านกุมตัวฮ่องเต้</b>':`<b style="color:var(--el-fire)">${factionName(holder)}กุมตัวฮ่องเต้</b>`) : '<b class="muted">ฮ่องเต้ยังลอยนวล (ไม่มีผู้ใดกุม)</b>';
    body+=`<div class="court-banner">
        <div class="court-seal zh">漢</div>
        <div>
          <div class="court-emp">ฮ่องเต้เหี้ยนเต้ (漢獻帝) ประทับ ณ <b>${provName(eProv)}</b></div>
          <div class="muted" style="font-size:.82rem;margin-top:3px">${holderTxt}</div>
        </div>
      </div>`;

    if(!G.court.han){
      body+=`<div class="court-dyn-done">👑 ท่านได้สถาปนา <b>ราชวงศ์${G.court.dynastyName}</b> ขึ้นปกครองแผ่นดินแล้ว — ราชสำนักฮั่นสิ้นสุดลง</div>`;
      this.modal('🐉 ราชสำนัก · 朝廷', 'ราชวงศ์ใหม่ถือกำเนิด', body);
      return;
    }

    if(!active){
      body+=`<div class="court-locked">🔒 ราชสำนักยังไม่เปิดทำการ<br><span class="muted">ท่านต้อง<b>ยึดเมืองที่ฮ่องเต้ประทับ</b> หรือรอเหตุการณ์ “อัญเชิญฮ่องเต้” (ค.ศ. 196) จึงจะออกราชโองการในพระนามฮ่องเต้ได้</span></div>`;
    } else if(!mine){
      body+=`<div class="court-locked">⚠️ ${factionName(holder)}เป็นผู้กุมตัวฮ่องเต้ จึงผูกขาดการออกราชโองการ<br><span class="muted">จงยกทัพยึด <b>${provName(eProv)}</b> มาให้ได้ เพื่อกุมอำนาจราชสำนักไว้ในมือท่าน</span></div>`;
    } else {
      // EDICT PANEL — player holds the Emperor
      const facs=Diplo.aliveFactions();
      const opts=facs.map(f=>`<option value="${f}">${factionName(f)}</option>`).join('');
      body+=`<div class="court-sec">
        <div class="court-h">📜 ออกราชโองการ <span class="muted">(อ้างพระบรมราชโองการบัญชาขุนศึก)</span></div>
        <div class="court-edict">
          <div class="court-edict-row">
            <span class="court-lbl">บัญชาให้สงบศึกกับเรา:</span>
            <select id="courtStand" class="court-select">${opts}</select>
            <button class="btn" onclick="UI.courtDo('standdown')">🕊️ ออกโองการ</button>
          </div>
          <div class="court-edict-row">
            <span class="court-lbl">บงการสองก๊กให้:</span>
            <select id="courtA" class="court-select">${opts}</select>
            <select id="courtRel" class="court-select"><option value="war">⚔️ ทำสงคราม</option><option value="peace">🕊️ สงบศึก</option></select>
            <select id="courtB" class="court-select">${opts}</select>
            <button class="btn" onclick="UI.courtDo('relation')">ออกโองการ</button>
          </div>
        </div>
      </div>`;

      // appoint titles
      const titleOpts=COURT_TITLES.map(t=>`<option value="${t.key}">${t.th} — ${t.cost}💰</option>`).join('');
      body+=`<div class="court-sec">
        <div class="court-h">🎖️ แต่งตั้งตำแหน่งราชสำนักฮั่น <span class="muted">(เพิ่มความชื่นชอบของก๊กนั้นอย่างมาก)</span></div>
        <div class="court-edict-row">
          <select id="courtTf" class="court-select">${opts}</select>
          <select id="courtTitle" class="court-select">${titleOpts}</select>
          <button class="btn btn-gold" onclick="UI.courtDo('appoint')">🎖️ แต่งตั้ง</button>
        </div>
        <div class="court-titles">${Object.keys(G.court.titles).length?Object.entries(G.court.titles).map(([f,tk])=>{const t=COURT_TITLES.find(x=>x.key===tk);return `<span class="court-tag">${factionName(f)} = ${t?t.th:tk}</span>`;}).join(''):'<span class="muted" style="font-size:.8rem">ยังไม่มีการแต่งตั้ง</span>'}</div>
        ${G.court.titles.player?'':'<button class="btn" style="margin-top:8px" onclick="UI.courtDo(\'self\')">👤 สถาปนาตนเป็นเสียงก๊ก (อัครมหาเสนาบดี)</button>'}
      </div>`;
    }

    // found a new dynasty
    body+=`<div class="court-sec court-dynsec">
        <div class="court-h">👑 สถาปนาราชวงศ์ใหม่ <span class="muted">(ปลดแอกจากราชวงศ์ฮั่น)</span></div>`;
    if(dyn.ok){
      const via = dyn.viaEmperor?'ฮ่องเต้สละราชสมบัติให้ท่านโดยชอบธรรม':'ท่านถือตราลัญจกรหยกอ้างสิทธิ์ราชบัลลังก์';
      body+=`<div class="muted" style="font-size:.82rem;margin-bottom:8px">เงื่อนไขครบถ้วน — ${via}</div>
        <div class="court-edict-row">
          <input id="dynName" class="court-input" placeholder="ชื่อราชวงศ์ เช่น เว่ย ฉู่ อู๋" maxlength="12">
          <button class="btn btn-primary" onclick="UI.courtDo('found')">👑 สถาปนาราชวงศ์</button>
        </div>`;
    } else {
      body+=`<div class="court-locked" style="margin:0">ยังไม่อาจตั้งราชวงศ์ได้ — ต้อง<b>กุมตัวฮ่องเต้พร้อมครองดินแดน ≥ ${dyn.need} เมือง</b> (ขณะนี้ ${dyn.mine}) หรือ<b>ครอบครองตราลัญจกรหยก</b></div>`;
    }
    body+=`</div>`;

    this.modal('🐉 ราชสำนัก · 朝廷', 'กุมองค์ฮ่องเต้ ออกราชโองการบัญชาขุนศึกทั้งแผ่นดิน', body);
  },
  courtDo(act){
    let res;
    if(act==='standdown') res=Court.decreeStandDown(document.getElementById('courtStand').value);
    else if(act==='relation'){ const a=document.getElementById('courtA').value, b=document.getElementById('courtB').value, r=document.getElementById('courtRel').value;
      if(a===b) res={ok:false,msg:'ต้องเลือกสองก๊กที่ต่างกัน'}; else res=Court.decreeRelation(a,b,r); }
    else if(act==='appoint') res=Court.appointTitle(document.getElementById('courtTf').value, document.getElementById('courtTitle').value);
    else if(act==='self') res=Court.selfAppoint();
    else if(act==='found'){ const nm=(document.getElementById('dynName').value||'').trim(); if(!nm){toast('โปรดตั้งชื่อราชวงศ์');return;} const d=canFoundDynasty(); foundDynasty(nm, d.viaEmperor?'emperor':'seal'); res={ok:true,msg:`สถาปนาราชวงศ์${nm}สำเร็จ!`}; }
    if(res) toast(res.msg);
    this.refresh(); this.renderCourt();
    if(G.activeProvince) this.showProvince(G.activeProvince);
  },

  /* ---------------- LEGENDARY TREASURES ---------------- */
  openTreasures(){
    const body=`<div class="trz-grid">${Object.keys(TREASURES).map(tk=>{
      const def=TREASURES[tk], st=G.treasures[tk];
      const ownerFac=treasureOwnerFaction(tk);
      const mine=ownerFac==='player';
      let holderTxt;
      if(!st.found) holderTxt='<span class="muted">ยังไม่ถูกค้นพบ</span>';
      else if(st.owner && String(st.owner).indexOf('g_')===0){ const g=genById(st.owner); holderTxt=g?`ถือโดย <b style="color:${factionColor(g.faction)}">${g.short}</b> (${factionName(g.faction)})`:'<span class="muted">สาบสูญ</span>'; }
      else if(ownerFac) holderTxt=`อยู่กับ <b style="color:${factionColor(ownerFac)}">${factionName(ownerFac)}</b>`;
      else holderTxt=`ซ่อนอยู่ ณ ${provName(st.prov)}`;
      return `<div class="trz-card ${mine?'mine':''} ${!st.found?'hidden':''}">
        <div class="trz-icon">${def.icon}</div>
        <div class="trz-body">
          <div class="trz-name"><span class="zh">${def.zh}</span> ${def.th}${mine?' <span class="trz-own">★ ในครอบครอง</span>':''}</div>
          <div class="trz-desc">${def.desc}</div>
          <div class="trz-eff">⚡ ${def.effect}</div>
          <div class="trz-holder">${holderTxt}</div>
        </div>
      </div>`;
    }).join('')}</div>`;
    this.modal('🏵️ ของวิเศษแห่งแผ่นดิน · 寶物', 'อาวุธ อาชา คัมภีร์ และตราอาญาสิทธิ์ที่เปลี่ยนชะตาสงคราม', body);
  },


  openEspionage(){ this.renderEspionage(); },
  renderEspionage(){
    const agents=Espionage.availableAgents();
    const active=G.generals.filter(g=>g.onMission);
    const targets=Diplo.aliveFactions();
    let body=`<div class="sp-section"><div class="sp-h">🕵️ สายลับที่ปฏิบัติการอยู่</div>`;
    if(active.length){
      body+=active.map(g=>{
        const acts=Espionage.actions(g.key);
        return `<div class="sp-card">
          <div class="sp-card-top"><b>${g.short}</b> <span class="muted">แฝงใน ${factionName(g.spyFaction)} · ขั้น ${g.spyRank}/3</span></div>
          <div class="sp-acts">${acts.map(a=>`<button class="btn" onclick="UI.spyDo('${g.key}','${a.id}')">${a.label}</button>`).join('')}</div>
        </div>`;
      }).join('');
    } else body+=`<div class="muted" style="padding:6px 0">ยังไม่มีสายลับแฝงตัว</div>`;
    body+=`</div><div class="sp-section"><div class="sp-h">📨 ส่งขุนพลแฝงตัวใหม่ (ต้องสติปัญญา ≥ 55)</div>`;
    if(agents.length){
      body+=`<div class="sp-send">
        <select id="spyGen" class="sel">${agents.map(g=>`<option value="${g.key}">${g.short} (สติปัญญา ${g.int})</option>`).join('')}</select>
        <select id="spyTarget" class="sel">${targets.map(f=>`<option value="${f}">${FACTIONS[f].th}</option>`).join('')}</select>
        <button class="btn btn-primary" onclick="UI.spySend()">ส่งแฝงตัว</button>
      </div><div class="muted" style="font-size:.78rem;margin-top:8px">สายลับจะค่อยๆ ไต่เต้า — ยิ่งขั้นสูง ยิ่งปลดล็อกการก่อวินาศกรรม (ยักยอกเงิน · เปิดประตูเมือง · ยุยงสงครามกลางเมือง)</div>`;
    } else body+=`<div class="muted">ไม่มีขุนพลว่างที่มีสติปัญญาเพียงพอ</div>`;
    body+=`</div>`;
    this.modal('เครือข่ายสายลับ','แฝงขุนพลเข้าก๊กศัตรู ไต่เต้าเป็นเจ้าเมือง แล้วบ่อนทำลายจากภายใน',body);
  },
  spySend(){ const g=document.getElementById('spyGen').value, t=document.getElementById('spyTarget').value;
    const r=Espionage.infiltrate(g,t); toast(r.msg); saveGame(); this.refresh(); this.renderEspionage(); },
  spyDo(g,a){ const r=Espionage.doAction(g,a); if(r&&r.msg) toast(r.msg); saveGame(); this.refresh(); this.renderEspionage(); if(G.activeProvince)this.showProvince(G.activeProvince); },

  /* ---------------- MARRIAGE ---------------- */
  openMarriage(tab){ this._mrTab = tab || this._mrTab || 'send'; this.renderMarriage(); },
  renderMarriage(){
    const tab=this._mrTab;
    const tabs=`<div class="mr-tabs">
      <button class="mr-tab ${tab==='match'?'on':''}" onclick="UI.openMarriage('match')">🪴 จับคู่ในก๊ก</button>
      <button class="mr-tab ${tab==='send'?'on':''}" onclick="UI.openMarriage('send')">👰 ส่งสตรีฝ่ายเรา</button>
      <button class="mr-tab ${tab==='take'?'on':''}" onclick="UI.openMarriage('take')">💍 รับเข้าตระกูล</button>
    </div>`;
    let body=tabs;
    if(tab==='match'){
      const men=clanBachelors('m'), women=clanBachelors('f');
      body+=`<p class="muted" style="margin:8px 0 10px">จับคู่อภิเษกระหว่างขุนพลและสตรีภายในก๊กของท่านเอง คู่สมรสจะให้กำเนิด<b style="color:var(--gold-bright)">ทายาทรุ่นใหม่</b>สืบสกุลเมื่อกาลเวลาผ่านไป (สิ้นสุดเทิร์นเพื่อให้เวลาเดินหน้า)</p>`;
      if(!men.length || !women.length){
        body+=`<div class="court-locked" style="margin:0">ต้องมีทั้งบุรุษและสตรีโสดในก๊กอย่างละหนึ่งจึงจะจับคู่ได้<br><span class="muted">บุรุษโสด: ${men.length} · สตรีโสด: ${women.length} — หาสตรีได้จากการรับเข้าตระกูล สวามิภักดิ์ หรือทายาทที่โตขึ้น</span></div>`;
      } else {
        const personBtn=(g,sel,fn)=>{const c=HERO_CLASSES[g.cls];return `<button class="mr-lady" ${sel===g.key?'data-sel="1"':''} onclick="UI.${fn}='${g.key}';UI.renderMarriage()"><span class="el-badge zh" style="background:${c.color}">${c.zh}</span><b>${g.short}</b><span class="muted">${g.sex==='m'?'武'+g.war+' 智'+g.int:'魅'+g.cha+' 智'+g.int} · อายุ ${g.age}</span></button>`;};
        const canWed = this._mrGroom && this._mrBride;
        body+=`<div class="mr-send">
          <label class="mr-lbl">บุรุษในก๊ก (เจ้าบ่าว)</label>
          <div class="mr-ladies">${men.map(g=>personBtn(g,this._mrGroom,'_mrGroom')).join('')}</div>
          <label class="mr-lbl">สตรีในก๊ก (เจ้าสาว)</label>
          <div class="mr-ladies">${women.map(g=>personBtn(g,this._mrBride,'_mrBride')).join('')}</div>
          <button class="btn btn-gold" style="margin-top:12px;width:100%" ${canWed?'':'disabled'} onclick="UI.weddDo()">🪴 จัดพิธีอภิเษกสมรส</button>
        </div>`;
      }
      this.modal('แต่งงานสร้างสายสกุล · 联姻','เชื่อมสัมพันธ์สองตระกูลด้วยสายเลือด สืบทายาทรุ่นใหม่',body);
      return;
    }
    if(tab==='send'){
      const ladies=Diplo.ourLadies();
      body+=`<p class="muted" style="margin:8px 0 10px">ส่งสตรีในก๊กของท่านไปอภิเษกกับขุนศึกก๊กอื่น เพื่อผูกพันธไมตรี เพิ่มความชื่นชอบอย่างมาก และมีโอกาสให้กำเนิด<b style="color:var(--gold-bright)">ทายาทรุ่นใหม่</b>เข้าสู่ตระกูลของท่าน</p>`;
      if(!ladies.length){
        body+=`<div class="court-locked" style="margin:0">ยังไม่มีสตรีที่พร้อมอภิเษกในก๊กของท่าน<br><span class="muted">สตรีอาจมาจากการรับเข้าตระกูล การสวามิภักดิ์ หรือทายาทที่เติบโตขึ้น</span></div>`;
      } else {
        const facs=Diplo.aliveFactions().filter(f=>Diplo.bachelorsOf(f).length);
        const facOpts=facs.map(f=>`<option value="${f}">${factionName(f)} (${Diplo.bachelorsOf(f).length} ผู้เหมาะสม)</option>`).join('');
        body+=`<div class="mr-send">
          <label class="mr-lbl">เลือกสตรีฝ่ายเรา</label>
          <div class="mr-ladies">${ladies.map(g=>`<button class="mr-lady" data-k="${g.key}" onclick="UI._mrLady='${g.key}';UI.renderMarriage()" ${UI._mrLady===g.key?'data-sel="1"':''}>
            <span class="zh">${g.zh}</span><b>${g.short}</b><span class="muted">เสน่ห์ ${g.cha} · อายุ ${g.age}</span></button>`).join('')}</div>
          <label class="mr-lbl">ส่งไปยังก๊ก</label>
          ${facs.length?`<select id="mrFac" class="court-select" style="width:100%">${facOpts}</select>
          <button class="btn btn-gold" style="margin-top:12px;width:100%" onclick="UI.sendBrideDo()">💞 จัดพิธีอภิเษก</button>`
          :`<div class="muted">ไม่มีก๊กที่มีบุรุษเหมาะสมรับเป็นคู่ในเวลานี้</div>`}
        </div>`;
      }
    } else {
      const cand=Diplo.marriageCandidates();
      const ladies=cand.filter(g=>g.sex==='f');
      const lords=cand.filter(g=>g.sex==='m');
      body+=`<p class="muted" style="margin:8px 0 10px">รับสตรีหรือขุนศึกเข้าเป็นเครือญาติ — สตรีจะเข้าร่วมตระกูลและให้กำเนิด<b style="color:var(--gold-bright)">ทายาทรุ่นใหม่</b> ส่วนขุนศึกก๊กอื่นจะลดความเป็นศัตรูและอาจสวามิภักดิ์ <span style="color:var(--paper-dim)">(ภรรยาเจ้าก๊กสู่ขอมิได้)</span></p>`;
      const cardHtml=(g)=>{const c=HERO_CLASSES[g.cls];return `
          <div class="mr-card ${g.sex==='f'?'is-lady':''}">
            <div class="mr-top"><span class="el-badge zh" style="background:${c.color}">${c.zh}</span><div><b>${g.short} <span class="zh muted" style="font-size:.78rem">${g.zh}</span></b><div class="muted" style="font-size:.72rem">${g.faction==='neutral'?'สตรีพเนจร':factionName(g.faction)} · ${g.clan?'ตระกูล'+g.clan:c.th} · ${g.sex==='f'?'หญิง':'ชาย'} ${g.age}</div></div></div>
            <div class="mr-bio">“${g.bio||''}”</div>
            <div class="mr-mini">魅 ${g.cha} · 智 ${g.int}${g.sex==='m'?' · 武 '+g.war:''}</div>
            <button class="btn btn-gold" onclick="UI.marryDo('${g.key}')">💞 ${g.sex==='f'?'สู่ขออภิเษก':'เสนอสมรสการเมือง'}</button>
          </div>`;};
      body+=`<div class="mr-sech">👰 สตรีโสด <span class="hall-ct">${ladies.length}</span></div>`;
      body+= ladies.length?`<div class="mr-grid">${ladies.slice(0,16).map(cardHtml).join('')}</div>`:`<div class="muted" style="margin-bottom:10px">ยังไม่มีสตรีที่พร้อมอภิเษกในเวลานี้</div>`;
      body+=`<div class="mr-sech" style="margin-top:14px">🤝 ขุนศึกก๊กอื่น (สมรสการเมือง) <span class="hall-ct">${lords.length}</span></div>`;
      body+= lords.length?`<div class="mr-grid">${lords.slice(0,12).map(cardHtml).join('')}</div>`:`<div class="muted">ไม่มีขุนศึกที่เหมาะสมในเวลานี้</div>`;
    }
    this.modal('แต่งงานการเมือง · 聯姻','เชื่อมสัมพันธ์สองตระกูลด้วยสายเลือด สืบทายาทรุ่นใหม่',body);
  },
  sendBrideDo(){
    const lady=this._mrLady, fac=document.getElementById('mrFac')?.value;
    if(!lady){ toast('เลือกสตรีที่จะส่งก่อน'); return; }
    if(!fac){ toast('เลือกก๊กปลายทาง'); return; }
    const r=Diplo.sendBride(lady, fac); toast(r.msg); this._mrLady=null;
    saveGame(); this.refresh(); this.renderMarriage(); if(G.activeProvince)this.showProvince(G.activeProvince);
  },
  marryDo(g){ const r=Diplo.proposeMarriage(g); toast(r.msg); saveGame(); this.refresh(); this.renderMarriage(); if(G.activeProvince)this.showProvince(G.activeProvince); },
  weddDo(){
    const r=weddInClan(this._mrGroom, this._mrBride);
    toast(r.msg);
    if(r.ok){ this._mrGroom=null; this._mrBride=null; }
    this.refresh(); this.renderMarriage(); if(G.activeProvince)this.showProvince(G.activeProvince);
  },

  /* ---------------- CLAN GENEALOGY · พงศาวลีตระกูล · 族譜 ---------------- */
  openClan(){ this.renderClan(); },
  /* build the family forest of the player's clan: lord → consorts → heirs → their unions, recursively */
  _buildClanForest(){
    const players = G.generals.filter(g=>g.faction==='player');
    const lord = players.find(g=>g.lord);
    // unions that involve at least one of our clansfolk
    const unions = (G.unions||[]).filter(u=>{
      const m=genById(u.mother), f=genById(u.father);
      return (m&&m.faction==='player')||(f&&f.faction==='player');
    });
    const spousesOf  = key => unions.filter(u=>u.mother===key||u.father===key)
                                    .map(u=> u.mother===key ? u.father : u.mother)
                                    .filter(k=>genById(k));
    const childrenOf = key => G.generals.filter(g=>g.parents && g.parents.includes(key));
    // family membership = everyone in a union + all their descendants + the lord
    const fam=new Set();
    unions.forEach(u=>{ fam.add(u.mother); fam.add(u.father); });
    if(lord) fam.add(lord.key);
    let grew=true;
    while(grew){ grew=false;
      G.generals.forEach(g=>{ if(!fam.has(g.key) && g.parents && g.parents.some(p=>fam.has(p))){ fam.add(g.key); grew=true; } });
    }
    const isChildInFam = key => { const g=genById(key); return !!(g && g.parents && g.parents.some(p=>fam.has(p))); };
    const seen=new Set();
    const build = key => {
      if(seen.has(key)) return null;
      const person=genById(key); if(!person) return null;
      seen.add(key);
      const spouses = spousesOf(key).filter(k=>!seen.has(k));
      spouses.forEach(k=>seen.add(k));
      const kidKeys=new Set();
      [key,...spouses].forEach(p=>childrenOf(p).forEach(c=>{ if(fam.has(c.key)) kidKeys.add(c.key); }));
      const children=[...kidKeys].map(build).filter(Boolean);
      return { person, spouses:spouses.map(genById).filter(Boolean), children, depth:0 };
    };
    // roots = family members who are not a child of another family member (lord first)
    const rootKeys=[...fam].filter(k=>genById(k) && !isChildInFam(k))
      .sort((a,b)=> (b===(lord&&lord.key)?1:0)-(a===(lord&&lord.key)?1:0));
    const trees=[];
    rootKeys.forEach(k=>{ if(!seen.has(k)){ const t=build(k); if(t) trees.push(t); } });
    // generation depth of the main (lord) tree
    const depthOf=n=> n.children.length ? 1+Math.max(...n.children.map(depthOf)) : 1;
    const gens = trees.length ? depthOf(trees[0]) : 1;
    return { lord, trees, kin:fam.size, gens };
  },
  _clanPerson(g, role){
    if(!g) return '';
    const c=HERO_CLASSES[g.cls]||{color:'#7d5a33',zh:'？'};
    const cls = g.lord?'is-lord':(g.consortOf||g.sex==='f'?'is-lady':'');
    const child = g.child?'is-child':'';
    const badge = g.child?'幼':(c.zh||(g.zh||'').slice(0,1));
    let tag;
    if(g.lord) tag='👑 เจ้าก๊ก';
    else if(g.consortOf) tag='💍 ชายาเอก';
    else if(g.child) tag=`👶 ทายาท ${g.age}/15`;
    else if(g.sex==='f') tag='💍 ชายา';
    else tag = g.title || (c.th||'ขุนพล');
    const stats = g.child ? `อายุ ${g.age} ปี` : `武${g.war} 智${g.int} 政${g.pol} 魅${g.cha}`;
    return `<div class="clan-person ${cls} ${child}" style="--pc:${c.color}" title="${g.title||''}">
        <span class="clan-badge zh">${badge}</span>
        <div class="clan-pi">
          <div class="clan-pname">${g.short} <span class="zh muted">${g.zh||''}</span></div>
          <div class="clan-prole">${tag}</div>
          <div class="clan-pstat tnum">${stats}</div>
        </div>
      </div>`;
  },
  _clanNode(node){
    const couple = `<div class="clan-couple">${this._clanPerson(node.person)}${
      node.spouses.map(s=>`<span class="clan-heart">❤</span>${this._clanPerson(s)}`).join('')}</div>`;
    const kids = node.children.length
      ? `<ul>${node.children.map(ch=>`<li>${this._clanNode(ch)}</li>`).join('')}</ul>` : '';
    return couple + kids;
  },
  renderClan(){
    const F=this._buildClanForest();
    if(!F.lord){ this.modal('พงศาวลีตระกูล · 族譜','',`<div class="court-locked" style="margin:0">ยังไม่พบเจ้าก๊กผู้นำตระกูล</div>`); return; }
    const lord=F.lord; const c=HERO_CLASSES[lord.cls]||{color:'var(--gold)',zh:'主'};
    const clanName = lord.clan ? 'ตระกูล'+lord.clan : G.factionName;
    const banner=`<div class="clan-banner">
        <span class="clan-crest zh" style="--pc:${c.color}">${c.zh}</span>
        <div class="clan-bmeta">
          <div class="clan-bname">${clanName} <span class="zh muted">${lord.zh||''}</span></div>
          <div class="clan-bsub">ปฐมวงศ์ ${lord.short} · ราชวงศ์แห่ง${G.factionName}</div>
          <div class="clan-bchips">
            <span class="clan-chip">👥 เครือญาติ ${F.kin}</span>
            <span class="clan-chip">🌿 ${F.gens} ชั่วอายุคน</span>
            <span class="clan-chip">📅 ค.ศ. ${G.year}</span>
          </div>
        </div>
      </div>`;
    // main tree = lord; any further trees are cadet branches married into the clan
    const main = F.trees.length ? `<div class="ftree"><ul><li>${this._clanNode(F.trees[0])}</li></ul></div>` : '';
    let branches='';
    if(F.trees.length>1){
      branches = `<div class="clan-sech">🌾 สายสกุลในเครือ (สมรสเข้าตระกูล)</div>`
        + F.trees.slice(1).map(t=>`<div class="ftree branch"><ul><li>${this._clanNode(t)}</li></ul></div>`).join('');
    }
    const onlyCouple = F.trees[0] && !F.trees[0].children.length && F.trees.length===1;
    const hint = onlyCouple
      ? `<div class="clan-hint">ยังไร้ทายาทสืบสกุล — เมื่อกาลเวลาผ่านไป ชายาจะให้กำเนิดทายาทรุ่นใหม่เข้าสู่ตระกูล (สิ้นสุดเทิร์นเพื่อให้เวลาเดินหน้า)</div>`
      : '';
    this.modal('พงศาวลีตระกูล · 族譜','สายเลือดและทายาทแห่งตระกูลที่ท่านสืบทอด',
      `${banner}<div class="clan-scroll">${main}${hint}${branches}</div>`);
    document.getElementById('mainModal').classList.add('wide');
  },

  /* ---------------- GENERALS HALL · ทำเนียบขุนพล ---------------- */
  openGenerals(tab){ this._gnTab = tab || this._gnTab || 'roster'; this._gnSel=null; this.renderHall(); },
  renderHall(){
    const tab=this._gnTab;
    const mineCount=G.generals.filter(g=>g.faction==='player').length;
    const wanderCount=Recruit.available().length;
    let body=`<div class="hall-tabs">
      <button class="hall-tab ${tab==='roster'?'on':''}" onclick="UI.openGenerals('roster')">⚔️ ขุนพลในสังกัด <span class="hall-ct">${mineCount}</span></button>
      <button class="hall-tab ${tab==='rels'?'on':''}" onclick="UI.openGenerals('rels')">🔗 สายสัมพันธ์</button>
      <button class="hall-tab ${tab==='wander'?'on':''}" onclick="UI.openGenerals('wander')">🚶 ขุนพลเร่ร่อน <span class="hall-ct">${wanderCount}</span></button>
    </div>`;
    if(this._gnSel && genById(this._gnSel)) body += this._hallDetail(genById(this._gnSel));
    else if(tab==='roster') body += this._hallRoster();
    else if(tab==='rels') body += this._hallRelations();
    else body += this._hallWanderers();
    this.modal('🏯 ทำเนียบขุนพล · 將府', 'ตรวจดูประวัติ บัญชาการ และเชิญขุนพลเร่ร่อนเข้าร่วมก๊ก', body);
  },
  _gnCard(g, onclick){
    const c=HERO_CLASSES[g.cls];
    const loyCol=g.loyalty>=60?'var(--el-wood)':g.loyalty>=40?'var(--gold)':'var(--el-fire)';
    const ageTag = g.child ? `👶 ทายาท ${g.age}/15` : `${g.sex==='f'?'♀':'♂'} ${g.age} ปี`;
    const where = g.onMission?'🕵️ ปฏิบัติการลับ':(g.faction==='neutral'?'พเนจร ณ '+provName(g.prov):provName(g.prov));
    return `<div class="gn-card ${c.cls} ${g.child?'is-child':''} ${g.sex==='f'?'is-lady':''}" style="border-left-color:${c.color}" onclick="${onclick}">
      <div class="gn-main">
        <span class="el-badge big zh" style="background:${c.color}">${g.child?'幼':c.zh}</span>
        <div class="gn-id"><b>${g.short} <span class="zh muted">${g.zh}</span></b>
          <div class="gn-title">${g.clan?'ตระกูล'+g.clan+' · ':''}${g.title||c.th}</div>
          <div class="gn-where">${where}</div>
        </div>
      </div>
      <div class="gn-stats"><span>武 ${g.war}</span><span>智 ${g.int}</span><span>政 ${g.pol}</span><span>魅 ${g.cha}</span><span style="color:${loyCol}">忠 ${g.loyalty}</span></div>
      <div class="gn-agetag">${ageTag}</div>
    </div>`;
  },
  _hallRoster(){
    const mine=G.generals.filter(g=>g.faction==='player').sort((a,b)=>(b.lord?1:0)-(a.lord?1:0) || (b.war+b.int+b.pol)-(a.war+a.int+a.pol));
    return `<div class="gn-list">${mine.map(g=>this._gnCard(g, `UI._gnSel='${g.key}';UI.renderHall()`)).join('')}</div>`;
  },
  _hallRelations(){
    const mine=G.generals.filter(g=>g.faction==='player'&&!g.child);
    // notable bonds across the whole roster
    const bonds=[];
    for(let i=0;i<mine.length;i++) for(let j=i+1;j<mine.length;j++){
      const v=getRel(mine[i].key,mine[j].key);
      if(Math.abs(v)>=30) bonds.push({a:mine[i],b:mine[j],v});
    }
    bonds.sort((x,y)=>Math.abs(y.v)-Math.abs(x.v));
    const bondHtml = bonds.length ? bonds.slice(0,12).map(p=>{const w=relLabel(p.a.key,p.b.key);return `
        <div class="rel-bond">
          <b>${p.a.short}</b><span class="rel-link ${w.c}">${p.v>0?'❤':'⚔️'}</span><b>${p.b.short}</b>
          <span class="rel-pill ${w.c}" style="margin-left:auto">${w.t}</span>
        </div>`;}).join('') : '<div class="muted" style="font-size:.82rem;padding:8px">ยังไม่มีสายสัมพันธ์ที่โดดเด่นในหมู่ขุนพล — เมื่อร่วมรบและประจำเมืองด้วยกัน ความผูกพันจะก่อตัวขึ้น</div>';
    // married couples
    const couples=(G.unions||[]).filter(u=>{const m=genById(u.mother),f=genById(u.father);return (m&&m.faction==='player')||(f&&f.faction==='player');})
      .map(u=>({m:genById(u.father),f:genById(u.mother),kids:u.kids})).filter(c=>c.m&&c.f);
    const coupleHtml=couples.length?couples.map(c=>`
        <div class="rel-bond"><b>${c.m.short}</b><span class="rel-link rel-love">🪅</span><b>${c.f.short}</b>
        <span class="rel-pill rel-love" style="margin-left:auto">ทายาท ${c.kids} คน</span></div>`).join('')
      :'<div class="muted" style="font-size:.82rem;padding:8px">ยังไม่มีคู่สมรสในก๊ก — จัดการสมรสในก๊กเพื่อสืบทายาท</div>';
    return `<div class="rel-sec"><div class="rel-h">🪅 คู่สมรสในตระกูล</div>${coupleHtml}</div>
      <div class="rel-sec"><div class="rel-h">🔗 สายสัมพันธ์เด่น (มิตร · อริ)</div>${bondHtml}</div>
      <p class="muted" style="font-size:.76rem;margin:10px 2px 0">เปิดประวัติขุนพลรายคนในแท็บ “ขุนพลในสังกัด” เพื่อดูสายสัมพันธ์เฉพาะตัว</p>`;
  },

  _hallWanderers(){
    const list=Recruit.available().sort((a,b)=>(b.war+b.int)-(a.war+a.int));
    if(!list.length) return `<div class="court-locked" style="margin:0">ยามนี้ไม่มีขุนพลเร่ร่อนให้เชิญ<br><span class="muted">ขุนพลอาจปรากฏตัวเมื่อก๊กท่านเรืองอำนาจ หรือเมื่อก๊กอื่นล่มสลาย</span></div>`;
    return `<p class="muted" style="margin:0 0 10px;font-size:.84rem">ขุนพลไร้สังกัดที่กระจายอยู่ทั่วแผ่นดิน — เชิญมาเจรจา หากเขาพอใจในบารมีของท่านก็จะเข้าร่วม มิฉะนั้นอาจปลีกตัวจากไป</p>
      <div class="gn-list">${list.map(g=>this._gnCard(g, `UI.showRecruit('${g.key}','hall')`)).join('')}</div>`;
  },
  _hallDetail(g){
    const c=HERO_CLASSES[g.cls];
    const mine=G.generals.filter(o=>o.faction==='player'&&o.key!==g.key);
    const rels=mine.map(o=>({o,v:getRel(g.key,o.key)})).filter(x=>Math.abs(x.v)>=20).sort((a,b)=>Math.abs(b.v)-Math.abs(a.v)).slice(0,4);
    const relHtml=rels.length?rels.map(x=>{const w=relLabel(g.key,x.o.key);return `<span class="rel-pill ${w.c}">${x.o.short}: ${w.t}</span>`;}).join(''):'<span class="muted" style="font-size:.78rem">ยังไม่มีความสัมพันธ์เด่นกับผู้ใด</span>';
    const loyCol=g.loyalty>=60?'var(--el-wood)':g.loyalty>=40?'var(--gold)':'var(--el-fire)';
    const treas=Object.keys(G.treasures||{}).filter(tk=>G.treasures[tk].owner===g.key).map(tk=>`${TREASURES[tk].icon} ${TREASURES[tk].th}`).join(' · ');
    // command panel
    let cmd='';
    if(!g.child && !g.lord){
      const provs=factionProvinces('player');
      cmd+=`<div class="gn-cmd">
        <div class="gn-cmd-row">
          <select id="gnProv" class="court-select">${provs.map(k=>`<option value="${k}" ${k===g.prov?'selected':''}>${provName(k)}</option>`).join('')}</select>
          <button class="btn" ${g.onMission?'disabled':''} onclick="UI.hallReassign('${g.key}')">👑 มอบหมายไปประจำ</button>
        </div>
        <div class="gn-cmd-row">
          <button class="btn" ${G.treasury.player<30?'disabled':''} onclick="UI.hallReward('${g.key}')">🎖️ พระราชทานรางวัล <small>30💰 · +ภักดี</small></button>`;
      if(g.sex==='f' && !g.married && !g.consortOf){
        cmd+=`<button class="btn btn-gold" onclick="UI.closeModal();UI.openMarriage('send')">💞 จัดการอภิเษกสมรส</button>`;
      } else if(g.int>=55 && !g.onMission){
        const targets=Diplo.aliveFactions();
        cmd+=`<button class="btn" onclick="UI.closeModal();UI.openEspionage()">🕵️ ส่งเป็นสายลับ</button>`;
      } else { cmd+=`<span></span>`; }
      cmd+=`</div></div>`;
    } else if(g.lord){
      cmd=`<div class="gn-note">👑 เจ้าก๊กผู้นำทัพ — บัญชาการศึกได้จากแผนที่โดยตรง</div>`;
    } else if(g.child){
      cmd=`<div class="gn-note">👶 ทายาทวัยเยาว์ — จะออกรับราชการเมื่ออายุครบ 15 ปี (อีก ${15-g.age} ปี)</div>`;
    }
    const consortTag = g.consortOf ? `<span class="gn-consort">💍 คู่ครองของ${factionName(g.consortOf==='player'||g.faction==='player'?'player':g.consortOf)}</span>` : '';
    return `<button class="hall-back" onclick="UI._gnSel=null;UI.renderHall()">‹ กลับสู่ทำเนียบ</button>
      <div class="gn-detail">
        <div class="gn-det-head">
          <span class="gn-portrait el-badge big zh" style="background:${c.color}">${g.child?'幼':c.zh}</span>
          <div>
            <div class="gn-det-name">${g.short} <span class="zh muted">${g.zh}</span> ${consortTag}</div>
            <div class="el-pill ${c.cls}" style="margin-top:4px"><span class="el-dot"></span>${c.el} ${c.th} · ${g.clan?'ตระกูล'+g.clan:'—'}</div>
            <div class="gn-det-title">${g.title||c.th} · ${g.sex==='f'?'หญิง':'ชาย'} อายุ ${g.age} ปี</div>
          </div>
        </div>
        <p class="gn-bio">“${g.bio||''}”</p>
        <div class="gn-det-stats">
          <div class="gn-st"><span>武 บู๊</span><b>${g.war}</b></div>
          <div class="gn-st"><span>智 สติปัญญา</span><b>${g.int}</b></div>
          <div class="gn-st"><span>政 การเมือง</span><b>${g.pol}</b></div>
          <div class="gn-st"><span>魅 เสน่ห์</span><b>${g.cha}</b></div>
          <div class="gn-st"><span>忠 ภักดี</span><b style="color:${loyCol}">${g.loyalty}</b></div>
          <div class="gn-st"><span>📍 ประจำ</span><b>${g.onMission?'ลับ':provName(g.prov)}</b></div>
        </div>
        ${treas?`<div class="gn-treas">🏵️ ของวิเศษ: ${treas}</div>`:''}
        <div class="gn-relwrap"><div class="gn-relh">สายสัมพันธ์</div>${relHtml}</div>
        ${cmd}
      </div>`;
  },
  hallReassign(key){ const k=document.getElementById('gnProv')?.value; const r=reassignGeneral(key,k); toast(r.msg); this.refresh(); this.renderHall(); if(G.activeProvince)this.showProvince(G.activeProvince); },
  hallReward(key){ const r=rewardGeneral(key,30); toast(r.msg); this.refresh(); this.renderHall(); },

  /* ---------------- RECRUIT WANDERER DIALOGUE ---------------- */
  showRecruit(genKey, from){
    this._recruitFrom = from || this._recruitFrom || 'queue';
    const g=genById(genKey); if(!g||g.faction!=='neutral'){ this._afterRecruit(); return; }
    const c=HERO_CLASSES[g.cls];
    const disp=Recruit.disposition(g); const tier=Recruit.tier(disp);
    const mood = tier==='warm'?{t:'โน้มเอียงเข้าร่วม',col:'var(--el-wood)'}:tier==='neutral'?{t:'ยังลังเล',col:'var(--gold)'}:{t:'เย็นชา',col:'var(--el-fire)'};
    const line = Recruit.line(g);
    const body=`<div class="rec-scene">
        <span class="rec-portrait el-badge big zh" style="background:${c.color}">${c.zh}</span>
        <div class="rec-who">
          <div class="rec-name">${g.short} <span class="zh muted">${g.zh}</span></div>
          <div class="el-pill ${c.cls}" style="margin-top:3px"><span class="el-dot"></span>${c.el} ${c.th} · ${g.clan?'ตระกูล'+g.clan:'—'}</div>
          <div class="rec-stats">武 ${g.war} · 智 ${g.int} · 政 ${g.pol} · 魅 ${g.cha} · อายุ ${g.age}</div>
        </div>
      </div>
      <p class="gn-bio" style="margin:10px 0 4px">“${g.bio||''}”</p>
      <div class="rec-bubble">「${line}」</div>
      <div class="rec-mood">ท่าที: <b style="color:${mood.col}">${mood.t}</b> <span class="rec-meter"><span style="width:${disp}%;background:${mood.col}"></span></span></div>`;
    let foot='';
    if(tier==='warm'){
      foot=`<button class="btn btn-primary" onclick="UI.recruitDo('${g.key}','accept')">🤝 รับเข้าก๊ก</button>
            <button class="btn" onclick="UI.recruitDo('${g.key}','decline')">🙅 ปฏิเสธ</button>`;
    } else if(tier==='neutral'){
      foot=`<button class="btn btn-primary" onclick="UI.recruitDo('${g.key}','persuade')">💬 เกลี้ยกล่อม</button>
            <button class="btn" ${G.treasury.player<60?'disabled':''} onclick="UI.recruitDo('${g.key}','gift')">🎁 มอบของกำนัล <small>60💰</small></button>
            <button class="btn" onclick="UI.recruitDo('${g.key}','decline')">👋 ปล่อยไป</button>`;
    } else {
      foot=`<button class="btn" ${G.treasury.player<60?'disabled':''} onclick="UI.recruitDo('${g.key}','gift')">🎁 มอบของกำนัล <small>60💰</small></button>
            <button class="btn" onclick="UI.recruitDo('${g.key}','persuade')">💬 ลองเกลี้ยกล่อม</button>
            <button class="btn" onclick="UI.recruitDo('${g.key}','decline')">👋 ปล่อยไป</button>`;
    }
    this.modal('🚶 ขุนพลเร่ร่อนมาเยือน · 訪賢', 'ศักราช '+G.year+' — โอกาสได้ขุนพลใหม่', body, foot);
  },
  recruitDo(key, act){
    let r;
    if(act==='accept') r=Recruit.accept(key);
    else if(act==='persuade') r=Recruit.persuade(key);
    else if(act==='gift'){ r=Recruit.gift(key); toast(r.msg); this.refresh(); this.showRecruit(key, this._recruitFrom); return; }
    else r=Recruit.decline(key);
    if(r&&r.msg) toast(r.msg);
    this.refresh(); if(G.activeProvince)this.showProvince(G.activeProvince);
    this._afterRecruit();
  },
  _afterRecruit(){
    if(this._recruitFrom==='hall'){ this._recruitFrom=null; this._gnSel=null; this.renderHall(); }
    else { this.closeModal(); setTimeout(()=>this.processRecruitQueue(),250); }
  },
  recruitQueue:[],
  queueRecruit(key){ this.recruitQueue.push(key); },
  processRecruitQueue(){
    if(!this.recruitQueue.length) return;
    const key=this.recruitQueue.shift();
    const g=genById(key);
    if(!g||g.faction!=='neutral'){ this.processRecruitQueue(); return; }
    this.showRecruit(key,'queue');
  },

  /* ---------------- REFORM (peach-blossom tree) ---------------- */
  openReform(){
    this.flagReform(false);
    const owned=G.reforms.player;
    const ready=!!G.flags.reformReady;
    const tiers={};
    Object.entries(REFORMS).forEach(([k,r])=>{ (tiers[r.tier]=tiers[r.tier]||[]).push({k,...r}); });
    let cols='';
    Object.keys(tiers).sort().forEach(tier=>{
      cols+=`<div class="rf-col">${tiers[tier].map(r=>{
        const has=owned.includes(r.k);
        const unlockable=r.req.every(q=>owned.includes(q));
        const canBuy=!has&&unlockable&&G.treasury.player>=r.cost&&ready;
        const st=has?'has':unlockable?'open':'locked';
        return `<div class="rf-node ${st}">
          <div class="rf-ic">${r.icon}</div>
          <div class="rf-zh zh">${r.zh}</div>
          <div class="rf-th">${r.th}</div>
          <div class="rf-eff muted">${r.effect}</div>
          ${has?'<div class="rf-tag done">✓ ปลดล็อกแล้ว</div>':
            `<button class="btn ${canBuy?'btn-gold':''}" ${canBuy?'':'disabled'} onclick="UI.buyReform('${r.k}')">${r.cost>0?r.cost+'💰 ':''}${ready?'ปลดล็อก':(unlockable?'รอวาระ':'ล็อคอยู่')}</button>`}
        </div>`;
      }).join('')}</div>`;
    });
    const body=`<div class="rf-branch"><span class="blossom b1"></span><span class="blossom b2"></span><span class="blossom b3"></span><span class="blossom b4"></span><span class="blossom b5"></span></div><div class="rf-banner">${ready?'🌸 ถึงวาระปฏิรูป! เลือกปลดล็อกได้ 1 อย่าง':`⏳ ปฏิรูปครั้งถัดไปในอีก ${G.reformProgress.player} ฤดู (ดูแผนผังล่วงหน้าได้)`}</div><div class="rf-tree">${cols}</div>`;
    this.modal('ปฏิรูปประเทศ · 改革','ต้นท้อบานสะพรั่ง — ปลดล็อกความก้าวหน้าทุก 5 ฤดู',body);
  },
  buyReform(k){
    const r=REFORMS[k];
    if(!G.flags.reformReady || G.treasury.player<r.cost) return;
    if(!r.req.every(q=>G.reforms.player.includes(q))) return;
    G.treasury.player-=r.cost; G.reforms.player.push(k);
    G.flags.reformReady=false; G.reformProgress.player=5;
    pushLog(`🌸 ปฏิรูปสำเร็จ: ${r.th} — ${r.effect}`, 'player'); toast(`🌸 ปลดล็อก ${r.zh}!`);
    saveGame(); this.refresh(); this.openReform(); if(G.activeProvince)this.showProvince(G.activeProvince);
  },
  flagReform(on){ const b=document.getElementById('btnReform'); if(b) b.classList.toggle('pulse',!!on); },

  /* ---------------- TREASURY BREAKDOWN TOOLTIP ---------------- */
  updateGoldTip(){
    const tip=document.getElementById('goldTip'); if(!tip) return;
    const buffs=factionBuffs('player');
    // projected income next season
    let baseInc=0;
    factionProvinces('player').forEach(k=>{
      let inc=Math.floor(G.wealth[k]*0.4);
      if(hasReform('player','r_market')) inc=Math.floor(inc*1.2);
      if(hasReform('player','r_agri')) inc+=2;
      const cmd=commanderOf(k); if(cmd&&cmd.cls==='strategist') inc+=8; if(cmd&&cmd.cls==='champion') inc+=4;
      baseInc+=inc;
    });
    const projInc=Math.round(baseInc*(1+buffs.incomePct));
    const officers=G.generals.filter(g=>g.faction==='player'&&!g.lord&&!g.child&&!g.onMission);
    const projUp=Math.round(officers.reduce((s,g)=>s+genUpkeep(g),0)*(1+buffs.upkeepPct));
    const projNet=projInc-projUp;
    const incPctTxt=buffs.incomePct?` <span style="color:var(--el-wood)">(+${Math.round(buffs.incomePct*100)}%)</span>`:'';
    const upPctTxt=buffs.upkeepPct?` <span style="color:var(--gold)">(${Math.round(buffs.upkeepPct*100)}%)</span>`:'';
    tip.innerHTML=`
      <div class="gtip-h">🪙 บัญชีคลังหลวง · 國庫</div>
      <div class="gtip-row"><span>📜 รายรับล่าสุด</span><b style="color:var(--el-wood)">+${(G.lastIncome||0).toLocaleString()}</b></div>
      <div class="gtip-row"><span>⚔️ ค่าบำรุงขุนพล (${officers.length} คน)</span><b style="color:var(--el-fire)">−${(G.lastUpkeep||0).toLocaleString()}</b></div>
      <div class="gtip-row gtip-net"><span>สุทธิฤดูที่แล้ว</span><b style="color:${(G.lastNet||0)>=0?'var(--el-wood)':'var(--el-fire)'}">${(G.lastNet||0)>=0?'+':''}${(G.lastNet||0).toLocaleString()}</b></div>
      <div class="gtip-div"></div>
      <div class="gtip-sub">ประมาณการฤดูถัดไป</div>
      <div class="gtip-row"><span>รายรับเมือง${incPctTxt}</span><b>+${projInc.toLocaleString()}</b></div>
      <div class="gtip-row"><span>ค่าบำรุง${upPctTxt}</span><b>−${projUp.toLocaleString()}</b></div>
      <div class="gtip-row gtip-net"><span>คาดสุทธิ</span><b style="color:${projNet>=0?'var(--el-wood)':'var(--el-fire)'}">${projNet>=0?'+':''}${projNet.toLocaleString()}</b></div>
      ${projNet<0?'<div class="gtip-warn">⚠️ รายจ่ายเกินรายรับ — พิจารณาตั้งขุนคลัง หรือลดจำนวนขุนพล</div>':''}`;
  },

  /* ---------------- SUCCESSION · การสืบทอดราชสมบัติ ---------------- */
  checkSuccession(){
    if(!G._succession){ return false; }
    const s=G._succession; const cands=s.candidates.map(genById).filter(Boolean);
    const heir=genById(s.heir);
    const row=(g)=>{
      const c=HERO_CLASSES[g.cls]||{color:'#7d5a33',zh:'？'};
      const isHeir=g.key===s.heir;
      const blood = g.parents&&g.parents.includes? null:null;
      const rel = (g.parents && s.deadClan && g.clan===s.deadClan && g.parents.length) ? 'บุตรชาย' : (s.deadClan&&g.clan===s.deadClan?'เครือญาติ':'ขุนพลคนสนิท');
      return `<div class="suc-cand ${isHeir?'on':''}" onclick="UI.pickSuccessor('${g.key}')">
        <span class="el-badge big zh" style="background:${c.color}">${c.zh}</span>
        <div class="suc-ci">
          <div class="suc-cn">${g.short} <span class="zh muted">${g.zh||''}</span> ${isHeir?'<span class="suc-tag">✓ เลือก</span>':''}</div>
          <div class="suc-cr">${rel} · อายุ ${g.age} · ภักดี ${g.loyalty}</div>
          <div class="suc-cs tnum">武${g.war} 智${g.int} 政${g.pol} 魅${g.cha}</div>
        </div></div>`;
    };
    const body=`<div class="suc-head">
        <div class="suc-zh zh">國喪</div>
        <p style="color:var(--paper-dim);line-height:1.7;margin-top:6px"><b style="color:var(--gold-bright)">${s.deadShort}</b> ผู้นำ${G.factionName} ถึงแก่อสัญกรรม (อายุ ${s.deadAge} ปี) บัดนี้ตระกูลต้องมีผู้สืบทอดบัลลังก์ — โปรดเลือกทายาทผู้สมควร</p>
      </div>
      <div class="suc-list">${cands.map(row).join('')}</div>`;
    const foot=`<button class="btn btn-gold" onclick="UI.confirmSuccession()">👑 สถาปนาผู้สืบทอด</button>`;
    this.modal('⚰️ สิ้นเจ้าก๊ก · 繼承','การสืบทอดอำนาจ',body,foot);
    return true;
  },
  pickSuccessor(key){ if(G._succession){ G._succession.heir=key; this.checkSuccession(); } },
  confirmSuccession(){
    const key=G._succession&&G._succession.heir; if(!key) return;
    confirmSuccessor(key);
    const g=genById(key);
    toast(`👑 ${g?g.short:''} สืบทอดเป็นผู้นำ${G.factionName}`);
    this.closeModal(); this.refresh(); if(G.activeProvince)this.showProvince(G.activeProvince);
    setTimeout(()=>this.processEventQueue(),250);
  },

  /* ---------------- GOVERNANCE · บริหารก๊ก · 朝政 ---------------- */
  openGovern(){
    const buffs=factionBuffs('player');
    const officers=G.generals.filter(g=>g.faction==='player'&&!g.child).sort((a,b)=>(b.lord?1:0)-(a.lord?1:0)||(b.war+b.int+b.pol+b.cha)-(a.war+a.int+a.pol+a.cha));
    const posts=Object.entries(COURT_POSTS).map(([pk,p])=>{
      const holder=postHolder('player',pk);
      const opts=`<option value="">— ว่าง —</option>`+officers.filter(g=>!g.lord).map(g=>`<option value="${g.key}" ${holder&&holder.key===g.key?'selected':''}>${g.short} (${p.stat==='war'?'武'+g.war:p.stat==='int'?'智'+g.int:'政'+g.pol})</option>`).join('');
      const c=holder?HERO_CLASSES[holder.cls]:null;
      return `<div class="gov-post">
          <div class="gov-pi"><span class="gov-pic">${p.icon}</span><div><div class="gov-pn">${p.th} <span class="zh muted">${p.zh}</span></div><div class="gov-pd muted">${p.desc}</div></div></div>
          ${holder?`<div class="gov-holder"><span class="el-badge zh" style="background:${c.color}">${c.zh}</span> <b>${holder.short}</b></div>`:''}
          <select class="court-select gov-sel" onchange="UI.appointDo('${pk}', this.value)">${opts}</select>
        </div>`;
    }).join('');
    const buffRows=[
      ['🪙','รายได้ทุกเมือง', buffs.incomePct>0?`+${Math.round(buffs.incomePct*100)}%`:'—'],
      ['⚔️','ค่าบำรุงขุนพล', buffs.upkeepPct<0?`${Math.round(buffs.upkeepPct*100)}%`:'—'],
      ['👥','ภักดีราษฎร/ฤดู', buffs.loyaltyBonus>0?`+${buffs.loyaltyBonus}`:'—'],
      ['🛡️','ป้องกันในศึก', buffs.defBonus>0?`+${buffs.defBonus}`:'—'],
      ['🦅','พลังบุก', buffs.battlePct>0?`+${Math.round(buffs.battlePct*100)}%`:'—'],
      ['📣','เกณฑ์พลพิเศษ', buffs.recruitBonus>0?`+${buffs.recruitBonus}`:'—']
    ].map(([i,l,v])=>`<div class="gov-buff"><span>${i} ${l}</span><b style="color:${v==='—'?'var(--paper-dim)':'var(--gold-bright)'}">${v}</b></div>`).join('');
    const body=`<p class="muted" style="margin:0 0 12px">แต่งตั้งขุนพลให้ดำรงตำแหน่งราชการ ความสามารถของผู้ดำรงตำแหน่งจะกลายเป็น<b style="color:var(--gold-bright)">บัฟทั่วทั้งก๊ก</b> ขุนพลหนึ่งคนรับได้หนึ่งตำแหน่ง</p>
      <div class="gov-buffs"><div class="gov-bh">🏯 บัฟก๊กรวม · 國運</div><div class="gov-bgrid">${buffRows}</div></div>
      <div class="gov-bh" style="margin-top:14px">🎎 ตำแหน่งราชการ · 官職</div>
      <div class="gov-posts">${posts}</div>`;
    this.modal('บริหารก๊ก · 朝政','แต่งตั้งเสนาบดี มอบหมายหน้าที่ และเสริมบัฟให้ก๊ก',body);
    document.getElementById('mainModal').classList.add('wide');
  },
  appointDo(post, key){ appointPost(post, key); this.refresh(); this.openGovern(); },

  flagReformEnd(){},

  /* ---------------- CITY VIEW ---------------- */
  openCity(key){
    const p=PROVINCES[key]; const nm=p.name.split(' ');
    const gens=G.generals.filter(g=>g.prov===key&&g.faction==='player');
    const loyCol=G.loyalty[key]>=60?'var(--el-wood)':G.loyalty[key]>=35?'var(--gold)':'var(--el-fire)';
    const body=`
      <div class="cty-hero">
        <div class="cty-zh zh">${nm[0]}</div><div class="cty-th">${nm[1]}</div>
      </div>
      <div class="cty-stats">
        <div class="cty-s"><span>🌾 เสบียง</span><b>${(G.wealth[key]*80).toLocaleString()} ถัง</b></div>
        <div class="cty-s"><span>🪙 รายได้/เทิร์น</span><b>${Math.floor(G.wealth[key]*0.4)} 💰</b></div>
        <div class="cty-s"><span>🛡️ ป้องกัน</span><b>${p.def}/100</b></div>
        <div class="cty-s"><span>👥 ภักดีราษฎร</span><b style="color:${loyCol}">${G.loyalty[key]}%</b></div>
      </div>
      <div class="cty-h">🏛️ โถงว่าราชการ</div>
      <div class="cty-acts">
        <button class="btn" onclick="developCity('${key}');UI.openCity('${key}')" ${G.managedThisTurn[key]||G.treasury.player<25?'disabled':''}>🌾 พัฒนาเกษตร/พาณิชย์</button>
        <button class="btn" onclick="recruitTroops('${key}');UI.openCity('${key}')" ${G.managedThisTurn[key]||G.treasury.player<(hasReform('player','r_levy')?15:20)?'disabled':''}>⚔️ เกณฑ์ไพร่พล</button>
        <button class="btn" onclick="pacify('${key}');UI.openCity('${key}')" ${G.managedThisTurn[key]||G.treasury.player<30?'disabled':''}>🕊️ ปลอบขวัญราษฎร</button>
      </div>
      <div class="cty-h">⚔️ ขุนพลประจำเมือง</div>
      <div class="cty-officers">${gens.length?gens.map(g=>{const c=HERO_CLASSES[g.cls];return `
        <div class="cty-off"><span class="el-badge zh" style="background:${c.color}">${c.zh}</span><div><b>${g.short}</b><div class="muted" style="font-size:.74rem">${c.th} · ภักดี ${g.loyalty}</div></div></div>`;}).join(''):'<div class="muted">ยังไม่มีขุนพลประจำเมือง</div>'}</div>`;
    this.modal('บริหารเมือง','จัดการเสบียง กำลังพล และขวัญราษฎรในเมือง',body);
  },

  /* ---------------- CAPTURE QUEUE ---------------- */
  queueCapture(g,prov){ this.captureQueue.push({g,prov}); },
  processCaptureQueue(){
    if(!this.captureQueue.length) return;
    const {g,prov}=this.captureQueue.shift();
    const c=HERO_CLASSES[g.cls];
    const body=`<div class="cap-gen">
      <span class="el-badge big zh" style="background:${c.color}">${c.zh}</span>
      <div><b style="font-size:1.1rem">${g.short} <span class="zh muted">${g.zh}</span></b>
      <div class="el-pill ${c.cls}" style="margin-top:4px"><span class="el-dot"></span>${c.el} ${c.th}</div>
      <div class="muted" style="margin-top:6px;font-size:.8rem">武 ${g.war} · 智 ${g.int} · 政 ${g.pol}</div></div>
    </div>
    <p style="margin-top:12px;color:var(--paper-dim)">จับกุมขุนพลข้าศึกได้ในศึก ${provName(prov)}! จะจัดการชะตากรรมเขาอย่างไร?</p>`;
    const foot=`
      <button class="btn btn-primary" onclick="UI.capDo('${g.key}','recruit','${prov}')">🤝 เกลี้ยกล่อม</button>
      <button class="btn" onclick="UI.capDo('${g.key}','release','${prov}')">🕊️ ปล่อยตัว</button>
      <button class="btn" style="border-color:var(--el-fire);color:var(--el-fire)" onclick="UI.capDo('${g.key}','execute','${prov}')">🪓 ประหาร</button>`;
    this.modal('จับกุมขุนศึกข้าศึก!','โชคชะตาของเขาอยู่ในกำมือท่าน',body,foot);
  },
  capDo(g,act,prov){ resolveCapture(g,act,prov); this.closeModal(); setTimeout(()=>this.processCaptureQueue(),250); if(G.activeProvince)this.showProvince(G.activeProvince); },

  /* ---------------- BIRTHS · COMING OF AGE · NAMING ---------------- */
  birthQueue:[],
  queueBirths(list){ list.forEach(c=>this.birthQueue.push({type:'birth', key:c.key})); },
  queueComingOfAge(g){ this.birthQueue.push({type:'coming', key:g.key}); },
  processBirthQueue(){
    if(!this.birthQueue.length){ this.processRecruitQueue(); return; }
    const item=this.birthQueue.shift();
    const g=genById(item.key);
    if(!g){ this.processBirthQueue(); return; }
    const c=HERO_CLASSES[g.cls];
    const sexTh=g.sex==='f'?'ธิดา':'บุตร';
    if(item.type==='birth'){
      this._namingKey=g.key;
      const body=`<div class="born-card">
          <div class="born-icon">🍼</div>
          <div class="born-zh zh">${sexTh==='ธิดา'?'千金':'麟兒'}</div>
          <p style="color:var(--paper-dim);line-height:1.7;margin-top:6px">ตระกูลของท่านได้${sexTh}คนใหม่! ทายาทผู้นี้จะเติบโตและพร้อมออกรบเมื่ออายุครบ 15 ปี โปรดประทานนามอันเป็นมงคล</p>
          <div class="born-stats">⚔️${g.war} · 📖${g.int} · 🏛️${g.pol} · ✨${g.cha} · ${g.sex==='f'?'หญิง':'ชาย'}</div>
        </div>
        ${this.nameFormHtml(g)}`;
      const foot=`<button class="btn btn-gold" onclick="UI.submitName('${g.key}')">ตั้งชื่อทายาท</button>`;
      this.modal('🍼 กำเนิดทายาท · 添丁','ศักราช '+G.year,body,foot);
    } else {
      const body=`<div class="born-card">
          <div class="born-icon">🎎</div>
          <div class="born-zh zh">成年</div>
          <p style="color:var(--paper-dim);line-height:1.7;margin-top:6px"><b style="color:var(--gold-bright)">${g.short}</b> เติบโตครบ 15 ปี พร้อมรับราชการออกรบเคียงข้างท่านแล้ว! (ประจำการที่ ${provName(g.prov)})</p>
          <div class="born-stats">${c.zh} ${c.th} · ⚔️${g.war} · 📖${g.int} · 🏛️${g.pol} · ✨${g.cha}</div>
        </div>`;
      const foot=`<button class="btn btn-gold" onclick="UI.closeModal();setTimeout(()=>UI.processBirthQueue(),250)">รับทราบ</button>`;
      this.modal('🎎 ทายาทบรรลุนิติภาวะ · 元服','ศักราช '+G.year,body,foot);
    }
    this.refresh();
  },
  nameFormHtml(g){
    const pool = g.sex==='f'?FEMALE_GIVEN_NAMES:MALE_GIVEN_NAMES;
    const sur=g._surname||'';
    const chips=pool.map((n,i)=>`<button class="name-chip" type="button" onclick="UI.pickName('${n.zh}','${n.th}')"><span class="zh">${sur}${n.zh}</span>${n.th}</button>`).join('');
    return `<div class="name-form">
        <label class="mr-lbl">เลือกนามมงคล (สกุล ${sur||'—'})</label>
        <div class="name-chips">${chips}</div>
        <div class="name-inputs">
          <input id="nameZh" class="court-input" placeholder="อักษรจีน" maxlength="3" value="">
          <input id="nameTh" class="court-input" placeholder="ชื่อไทย" maxlength="16" value="">
        </div>
      </div>`;
  },
  pickName(zh, th){ const z=document.getElementById('nameZh'), t=document.getElementById('nameTh'); if(z)z.value=zh; if(t)t.value=(genById(this._namingKey)?._surname?'':'')+th; this._pickedTh=th; },
  submitName(key){
    this._namingKey=key;
    const g=genById(key); if(!g){ this.closeModal(); this.processBirthQueue(); return; }
    let zh=(document.getElementById('nameZh')?.value||'').trim();
    let th=(document.getElementById('nameTh')?.value||'').trim();
    if(!th){ toast('โปรดตั้งชื่อทายาท'); return; }
    if(!zh){ const pool=g.sex==='f'?FEMALE_GIVEN_NAMES:MALE_GIVEN_NAMES; zh=pool[Math.floor(Math.random()*pool.length)].zh; }
    nameGeneral(key, zh, th);
    toast(`🎉 ขนานนามทายาทว่า ${th}`);
    this.closeModal(); this.refresh();
    setTimeout(()=>this.processBirthQueue(),250);
  },

  /* ---------------- EVENTS ---------------- */
  queueEvent(ev){ this.eventQueue.push(ev); },
  processEventQueue(){
    if(G._succession){ this.checkSuccession(); return; }   // a fallen lord must be succeeded first
    if(!this.eventQueue.length){ this.processBirthQueue(); return; }
    const ev=this.eventQueue.shift();
    if(ev && ev._goalDone){ this.showGoalComplete(ev.goal); return; }   // เป้าหมายประจำก๊กสำเร็จ
    if(ev && ev._rand){ this.showChoiceEvent(ev); return; }  // random event deck (มีตัวเลือก)
    const body=`<div class="ev-zh zh">${ev.zh}</div><p style="color:var(--paper-dim);line-height:1.7;margin-top:8px">${ev.body}</p>`;
    const foot=`<button class="btn btn-gold" onclick="UI.closeModal();setTimeout(()=>UI.processEventQueue(),250)">รับทราบ</button>`;
    this.modal('📜 เหตุการณ์ประวัติศาสตร์ · '+ev.title,'ศักราช '+ev.year,body,foot);
    this.refresh(); if(G.activeProvince)this.showProvince(G.activeProvince);
  },

  /* ---- random choice event (สำรับเหตุการณ์สุ่ม) ---- */
  _choiceEv:null,
  showChoiceEvent(ev){
    this._choiceEv=ev;
    const def=ev.def, ctx=ev.ctx;
    let prose=''; try{ prose=def.body(G,ctx); }catch(e){ prose='...'; }
    const choices=(def.choices||[]).map((ch,i)=>{
      let on=true; if(typeof ch.enabled==='function'){ try{ on=ch.enabled(G,ctx); }catch(e){ on=false; } }
      return `<button class="ev-choice${on?'':' is-disabled'}" ${on?'':'disabled'} onclick="UI.pickChoice(${i})">
        <span class="ev-choice-label">${ch.label}</span>
        ${ch.hint?`<span class="ev-choice-hint">${ch.hint}</span>`:''}
      </button>`;
    }).join('');
    const body=`<div class="ev-zh zh">${def.zh}</div>
      <p class="ev-body">${prose}</p>
      <div class="ev-choices">${choices}</div>`;
    const icon = ev._quest ? '🪶' : ev._raid ? '⚔️' : '🎴';
    this.modal(icon+' '+def.title, `${SEASONS[G.season].th} ค.ศ. ${G.year}`, body, '<span></span>');
    this.refresh(); if(G.activeProvince)this.showProvince(G.activeProvince);
  },
  pickChoice(i){
    const ev=this._choiceEv; if(!ev) return;
    const ch=ev.def.choices[i]; if(!ch) return;
    let result=''; try{ result=ch.effect(G,ev.ctx)||''; }catch(e){ result=''; }
    pushLog(`${ev._quest?'🪶':ev._raid?'⚔️':'🎴'} ${ev.def.title} — ${ch.label}`, 'player');
    // แสดงบทสรุปผลของการตัดสินใจ แล้วค่อยไปเหตุการณ์ถัดไป
    const body=`<div class="ev-zh zh">${ev.def.zh}</div><p class="ev-body ev-outcome">${result}</p>`;
    const foot=`<button class="btn btn-gold" onclick="UI.closeModal();setTimeout(()=>UI.processEventQueue(),250)">รับทราบ</button>`;
    const ric = ev._quest ? '🪶' : ev._raid ? '⚔️' : '🎴';
    this._choiceEv=null;
    this.modal(ric+' ผลแห่งการตัดสินใจ', `${SEASONS[G.season].th} ค.ศ. ${G.year}`, body, foot);
    this.refresh(); if(G.activeProvince)this.showProvince(G.activeProvince);
  },

  /* ---- faction goal / starting situation (เป้าหมายประจำก๊ก) ---- */
  showFactionIntro(){
    const w=warlordGoal(); const g=w.goal;
    const body=`<div class="ev-zh zh">${FACTIONS[G.baseWarlord]?FACTIONS[G.baseWarlord].zh:'主'}</div>
      <p class="ev-body" style="margin-top:6px">${w.intro}</p>
      <div class="goal-trait">${w.trait}</div>
      <div class="goal-card">
        <div class="goal-card-h"><span class="goal-zh zh">${g.zh}</span><div><div class="goal-card-title">🎯 เป้าหมายประจำก๊ก</div><div class="goal-card-name">${g.title}</div></div></div>
        <div class="goal-card-desc">${g.desc}</div>
      </div>`;
    const foot=`<button class="btn btn-gold" onclick="UI.closeModal()">รับคำท้า เริ่มศึก!</button>`;
    this.modal('📜 ลิขิตแห่ง'+G.factionName, `ศักราช ค.ศ. ${G.year} — รุ่งอรุณแห่งศึกชิงแผ่นดิน`, body, foot);
  },
  openGoal(){
    const w=warlordGoal(); const g=w.goal;
    const done = !!G.flags.goalDone;
    let cur=0,need=1; try{ const t=g.target(G); cur=t.cur; need=t.need; }catch(e){}
    const pct=Math.max(0,Math.min(100,Math.round((cur/need)*100)));
    const body=`<div class="ev-zh zh">${g.zh}</div>
      <div class="goal-card" style="margin-top:12px">
        <div class="goal-card-h"><span class="goal-zh zh">🎯</span><div><div class="goal-card-name">${g.title}</div><div class="goal-card-desc" style="margin:2px 0 0">${g.desc}</div></div></div>
        <div class="goal-prog"><div class="goal-prog-bar"><span style="width:${done?100:pct}%"></span></div>
          <div class="goal-prog-txt">${done?'<b style="color:var(--el-wood)">✓ สำเร็จลุล่วงแล้ว</b>':`ความคืบหน้า ${cur} / ${need}`}</div></div>
      </div>
      <div class="goal-trait" style="margin-top:14px">${w.trait}</div>
      <p class="ev-body" style="margin-top:12px;font-size:.92rem;color:var(--paper-dim)">${w.intro}</p>`;
    this.modal('🎯 เป้าหมายประจำ'+G.factionName, `ศักราช ค.ศ. ${G.year}`, body, `<button class="btn btn-ghost" onclick="UI.closeModal()">ปิด</button>`);
  },
  showGoalComplete(goal){
    let reward=''; try{ reward=goal.reward(G)||''; }catch(e){}
    pushLog(`🎯 บรรลุเป้าหมายประจำก๊ก: ${goal.title}!`, 'player');
    saveGame();
    const body=`<div class="ev-zh zh">${goal.zh}</div>
      <div class="goal-done-banner">🎯 บรรลุเป้าหมายประจำก๊ก!</div>
      <div class="goal-card-name" style="text-align:center;font-size:1.15rem;margin:4px 0 10px">${goal.title}</div>
      <p class="ev-body ev-outcome">${reward}</p>`;
    const foot=`<button class="btn btn-gold" onclick="UI.closeModal();setTimeout(()=>UI.processEventQueue(),250)">รับทราบ</button>`;
    this.modal('🏆 เป้าหมายสำเร็จ', `${SEASONS[G.season].th} ค.ศ. ${G.year}`, body, foot);
    this.refresh(); if(G.activeProvince)this.showProvince(G.activeProvince);
  },

  /* ---------------- END GAME ---------------- */
  endGame(win){
    if(G.flags.ended) return; G.flags.ended=true;
    const total=Object.keys(PROVINCES).length;
    const final=factionProvinces('player').length;
    const peak=Math.max(G.peakProv||0, final);
    const years=G.year-190;
    const ch=(G.chronicle||[]).slice();
    const conquests=ch.filter(c=>c.text.indexOf('🔥')===0).length;
    const players=G.generals.filter(g=>g.faction==='player');
    const heroes=players.filter(g=>!g.child).sort((a,b)=>(b.war+b.int+b.pol+b.cha)-(a.war+a.int+a.pol+a.cha)).slice(0,4);
    const born=G.generals.filter(g=>g.faction==='player'&&/^g_born_/.test(g.key)).length;
    const F=this._buildClanForest(); const gens=F.gens||1; const kin=F.kin||players.length;
    const treas=Object.keys(G.treasures||{}).filter(tk=>treasureOwnerFaction(tk)==='player').map(tk=>TREASURES[tk]);
    const reformsDone=(G.reforms.player||[]).length, reformsTotal=Object.keys(REFORMS).length;
    const dynasty=(G.court&&G.court.dynastyName)?G.court.dynastyName:null;
    const fallen=ch.filter(c=>c.type==='player' && (c.text.indexOf('⚰️')===0||c.text.indexOf('💀')===0));

    let rank;
    if(win) rank={zh:'太祖', th:'ปฐมจักรพรรดิ', d:'ผู้รวมแผ่นดินใต้หล้าเป็นปึกแผ่น'};
    else if(peak>=30) rank={zh:'霸主', th:'มหาราชาธิราช', d:'ผงาดเหนือปฐพีแม้มิอาจรวมเป็นหนึ่ง'};
    else if(peak>=16) rank={zh:'雄主', th:'เจ้าผู้ครองภาค', d:'ครองภูมิภาคอันกว้างใหญ่ในยุคแตกแยก'};
    else if(peak>=7) rank={zh:'諸侯', th:'เจ้าประเทศราช', d:'ขุนศึกผู้มีชื่อจารึกในพงศาวดาร'};
    else rank={zh:'流星', th:'ดาวตกแห่งยุคสมัย', d:'นามถูกจารึกไว้เพียงชั่วครู่ในกระแสธารประวัติศาสตร์'};

    const accent = win?'var(--gold-bright)':'var(--el-fire)';
    const narrative = win
      ? `ศักราช ค.ศ. ${G.year} — หลังศึกสงครามยาวนาน ${years} ปี ธง${G.factionName}โบกสะบัดเหนือ ${final} ใน ${total} หัวเมือง รวมแผ่นดินสามก๊กเป็นปึกแผ่น${dynasty?` สถาปนาราชวงศ์${dynasty}`:''} ยุคสมัยแห่งสงครามปิดฉากลง ราษฎรได้พักร่มเย็นอีกครา`
      : `ศักราช ค.ศ. ${G.year} — ${G.factionName}ที่ยืนหยัดมา ${years} ปี ถึงกาลอวสาน แผ่นดินในกำมือถูกกลืนหายสิ้น เหลือไว้เพียงนามจารึกในพงศาวดารยุคสามก๊ก ครั้งรุ่งเรืองเคยแผ่อาณาเขตถึง ${peak} หัวเมือง`;

    const statChips=[
      ['🗓️','ยืนหยัด', `${years} ปี`],
      ['🏯','หัวเมืองสูงสุด', `${peak}/${total}`],
      ['🔥','พิชิตเมือง', `${conquests} ครั้ง`],
      ['🌿','สืบราชวงศ์', `${gens} ชั่วคน`],
      ['👶','ทายาทประสูติ', `${born} คน`],
      ['🌸','ปฏิรูป', `${reformsDone}/${reformsTotal}`]
    ];
    const chips=statChips.map(([ic,lb,va])=>`<div style="border:1px solid var(--line);border-radius:11px;padding:9px 6px;text-align:center;background:rgba(255,255,255,.02)">
        <div style="font-size:1.05rem">${ic}</div>
        <div style="font-size:.64rem;color:var(--paper-dim);margin-top:2px">${lb}</div>
        <div style="font-size:.86rem;color:var(--gold-bright);font-weight:700;margin-top:1px">${va}</div></div>`).join('');

    const treasRow = treas.length
      ? `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 12px;justify-content:center">${treas.map(t=>`<span style="font-size:.78rem;color:var(--gold);border:1px solid var(--line);border-radius:20px;padding:4px 12px">${t.icon} ${t.th}</span>`).join('')}</div>`
      : '';

    const heroHtml=heroes.length? heroes.map(g=>{const c=HERO_CLASSES[g.cls]||{color:'#7d5a33',zh:'？'};return `<div style="display:flex;align-items:center;gap:9px;border:1px solid var(--line);border-radius:10px;padding:7px 10px;background:rgba(255,255,255,.02)">
        <span class="zh" style="width:30px;height:30px;border-radius:7px;display:grid;place-items:center;background:${c.color};color:#fff;font-size:.9rem;flex-shrink:0">${c.zh}</span>
        <div style="min-width:0"><div style="font-size:.85rem;color:var(--paper)">${g.short} <span class="zh muted" style="font-size:.7rem">${g.zh||''}</span></div>
        <div class="tnum" style="font-size:.66rem;color:var(--paper-dim)">武${g.war} 智${g.int} 政${g.pol} 魅${g.cha}</div></div></div>`;}).join('')
      : '<div class="muted" style="font-size:.8rem;grid-column:1/-1">— สิ้นแล้วซึ่งขุนพลในสังกัด —</div>';

    const memHtml = fallen.length
      ? fallen.slice(-8).map(c=>`<div style="font-size:.77rem;color:var(--paper-dim);line-height:1.5">${c.text} <span class="muted">· ค.ศ. ${c.year}</span></div>`).join('')
      : '<div class="muted" style="font-size:.78rem">ขุนพลของท่านยืนหยัดผ่านศึกโดยมิมีผู้ใดวายชนม์</div>';

    let annal=''; let py=null;
    ch.forEach(c=>{
      if(c.year!==py){ annal+=`<div class="zh" style="font-size:.78rem;color:var(--gold);margin:9px 0 3px;letter-spacing:.05em">— ค.ศ. ${c.year} —</div>`; py=c.year; }
      annal+=`<div style="font-size:.79rem;color:${c.type==='player'?'var(--paper)':'var(--paper-dim)'};line-height:1.55;border-left:2px solid ${c.type==='player'?'var(--gold)':'var(--line)'};margin-left:4px;padding:1px 0 1px 10px">${c.text}</div>`;
    });
    if(!ch.length) annal='<div class="muted" style="padding:10px">— ไร้บันทึกเหตุการณ์สำคัญ —</div>';

    const body=`<div style="max-height:72vh;overflow:auto;padding-right:6px">
      <div style="text-align:center;margin-bottom:4px">
        <div class="zh" style="font-size:2.3rem;letter-spacing:.16em;color:${accent};text-shadow:0 2px 24px rgba(201,162,74,.22)">${win?'天下一統':'群雄殞落'}</div>
        <div style="margin-top:9px;display:inline-flex;align-items:center;gap:10px">
          <span class="zh" style="font-size:1.4rem;color:${accent}">${rank.zh}</span>
          <span style="font-size:1rem;color:var(--paper)">${rank.th}</span>
        </div>
        <div style="font-size:.8rem;color:var(--paper-dim);margin-top:3px">${rank.d}</div>
      </div>
      <p style="color:var(--paper);line-height:1.85;margin:14px 4px;text-align:center;font-size:.92rem">${narrative}</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0">${chips}</div>
      ${treasRow}
      <div class="side-title" style="margin-top:4px">🏯 หอเกียรติยศ · 功臣閣</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:9px 0 16px">${heroHtml}</div>
      <div class="side-title">🕯️ วีรชนผู้ล่วงลับ · 追思</div>
      <div style="display:flex;flex-direction:column;gap:3px;margin:9px 0 16px">${memHtml}</div>
      <div class="side-title">📜 พงศาวดารแผ่นดิน · 編年史</div>
      <div style="margin-top:8px;display:flex;flex-direction:column;gap:1px">${annal}</div>
    </div>`;
    const foot=`<button class="btn btn-ghost" onclick="UI.closeModal()">ปิดดูแผนที่</button>
      <button class="btn btn-gold" onclick="localStorage.removeItem('TG3_SAVE');location.href='index.html'">⚔️ เริ่มศึกครั้งใหม่</button>`;
    this.modal(win?'🏆 รวมแผ่นดินสำเร็จ':'💀 อวสานก๊ก', win?'บทอวสานแห่งมหาบุรุษผู้รวมชาติ':'บทอวสานแห่งขุนศึก',body,foot);
    document.getElementById('mainModal').classList.add('wide');
  }
};

/* ============================================================
   MapView — pan & zoom controller for the campaign map
   ============================================================ */
const MapView = {
  s:1, tx:0, ty:0, min:1, max:5, el:null, vp:null, drag:null, justDragged:false, pts:null, pinch:null,
  init(){
    this.el=document.getElementById('mapStage');
    this.vp=document.getElementById('mapViewport');
    if(!this.el||!this.vp) return;
    this.pts=new Map();
    this.reset();
    this.vp.addEventListener('wheel', e=>{
      e.preventDefault();
      const r=this.vp.getBoundingClientRect();
      const factor = e.deltaY<0 ? 1.18 : 1/1.18;
      this.zoomAt(e.clientX-r.left, e.clientY-r.top, factor);
    }, {passive:false});
    this.el.addEventListener('pointerdown', e=>{
      this.pts.set(e.pointerId, {x:e.clientX, y:e.clientY});
      this.el.setPointerCapture(e.pointerId);
      if(this.pts.size===2){            // begin pinch — suspend single-finger drag
        this.drag=null;
        const p=[...this.pts.values()];
        const r=this.vp.getBoundingClientRect();
        this.pinch={ dist:Math.hypot(p[0].x-p[1].x, p[0].y-p[1].y), s0:this.s,
          cx:(p[0].x+p[1].x)/2 - r.left, cy:(p[0].y+p[1].y)/2 - r.top };
      } else if(this.pts.size===1){
        this.drag={ x:e.clientX, y:e.clientY, tx:this.tx, ty:this.ty, moved:false };
        this.el.classList.add('grabbing');
      }
    });
    this.el.addEventListener('pointermove', e=>{
      if(this.pts.has(e.pointerId)) this.pts.set(e.pointerId, {x:e.clientX, y:e.clientY});
      if(this.pinch && this.pts.size>=2){
        const p=[...this.pts.values()];
        const d=Math.hypot(p[0].x-p[1].x, p[0].y-p[1].y);
        const ns=Math.min(this.max, Math.max(this.min, this.pinch.s0 * (d/this.pinch.dist)));
        this.tx = this.pinch.cx - (this.pinch.cx-this.tx)*(ns/this.s);
        this.ty = this.pinch.cy - (this.pinch.cy-this.ty)*(ns/this.s);
        this.s=ns; this.justDragged=true; this.clamp(); this.apply();
        return;
      }
      if(!this.drag) return;
      const dx=e.clientX-this.drag.x, dy=e.clientY-this.drag.y;
      if(Math.abs(dx)+Math.abs(dy)>3) this.drag.moved=true;
      this.tx=this.drag.tx+dx; this.ty=this.drag.ty+dy; this.clamp(); this.apply();
    });
    const up=e=>{
      this.pts.delete(e.pointerId);
      if(this.pts.size<2) this.pinch=null;
      if(this.pts.size===0){ this.el.classList.remove('grabbing'); if(this.drag&&this.drag.moved) this.justDragged=true; this.drag=null; }
    };
    this.el.addEventListener('pointerup', up);
    this.el.addEventListener('pointercancel', up);
    this.el.addEventListener('click', e=>{ if(this.justDragged){ e.stopPropagation(); e.preventDefault(); this.justDragged=false; } }, true);
  },
  apply(){
    this.el.style.transform=`translate(${this.tx}px,${this.ty}px) scale(${this.s})`;
    this.el.classList.toggle('zoomed', this.s>=1.8);
  },
  clamp(){
    const w=this.vp.clientWidth, h=this.vp.clientHeight;
    this.tx=Math.min(0, Math.max(w-w*this.s, this.tx));
    this.ty=Math.min(0, Math.max(h-h*this.s, this.ty));
  },
  zoomAt(cx, cy, factor){
    const ns=Math.min(this.max, Math.max(this.min, this.s*factor));
    if(ns===this.s) return;
    // keep point under cursor fixed
    this.tx = cx - (cx-this.tx)*(ns/this.s);
    this.ty = cy - (cy-this.ty)*(ns/this.s);
    this.s=ns; this.clamp(); this.apply();
  },
  zoomBy(factor){ const r=this.vp.getBoundingClientRect(); this.zoomAt(r.width/2, r.height/2, factor); },
  reset(){ this.s=1; this.tx=0; this.ty=0; this.apply(); }
};
