/* ============================================================
   ai.js — AI faction behaviour (expand, war, diplomacy, spy)
   ============================================================ */

const AI = {
  runAll(){
    Espionage.tickSpies();
    Diplo.aliveFactions().forEach(f=>this.takeTurn(f));
    // decay favors slightly toward 0
    Object.values(G.diplomacy).forEach(d=>{ if(d.favor) d.favor*=0.92; });
  },

  takeTurn(f){
    // 1. income
    let inc=0;
    factionProvinces(f).forEach(k=>{ inc+=Math.floor(G.wealth[k]*0.4)+ (hasReform(f,'r_market')?6:0); });
    G.treasury[f]=(G.treasury[f]||0)+inc;

    // 2. reinforce weakest border province
    const provs=factionProvinces(f);
    provs.forEach(k=>{ if(Math.random()<0.4 && G.treasury[f]>=20){ G.treasury[f]-=20; G.troops[k]+=12; } });

    // 3. consider one attack
    if(Math.random()<0.75) this.tryAttack(f);

    // 4. diplomacy toward player (occasional)
    if(Math.random()<0.25) this.tryDiplomacy(f);

    // 5. espionage against player (occasional, for strong scheming factions)
    if(Math.random()<0.12) this.trySpy(f);
  },

  tryAttack(f){
    const provs=factionProvinces(f);
    let best=null;
    provs.forEach(src=>{
      if(G.troops[src]<25) return;
      (ADJACENCY[src]||[]).forEach(tgt=>{
        const ow=G.owner[tgt];
        if(ow===f) return;
        if(allied(f,ow)) return;
        // don't attack player if at peace unless aggressive & strong
        if(ow==='player' && !atWar(f,'player')){
          if(G.troops[src] < G.troops[tgt]*1.8) return; // only opportunistic
        }
        const ratio = G.troops[src]/(G.troops[tgt]+1);
        if(ratio>1.15){
          const score = ratio + (ow===null?0.4:0) + (G.wealth[tgt]/40);
          if(!best || score>best.score) best={src,tgt,score,ow};
        }
      });
    });
    if(!best) return;
    const {src,tgt,ow}=best;
    // auto-resolve
    const atk=G.troops[src]-5, def=G.troops[tgt];
    let aR=atk*(0.7+Math.random()*0.5), dR=def*(0.8+Math.random()*0.5);
    const ag=G.generals.find(g=>g.prov===src&&g.faction===f); if(ag&&(ag.cls==='vanguard'||ag.cls==='champion')) aR*=1.2;
    if(ag) aR *= 1 + genTreasureBonus(ag.key).war/300;
    const dg=G.generals.find(g=>g.prov===tgt&&g.faction===ow); if(dg&&(dg.cls==='sentinel')) dR*=1.3;
    if(aR>dR){
      G.troops[src]=5; G.troops[tgt]=Math.max(5,Math.floor(atk-def*0.4));
      const wasPlayer = ow==='player';
      G.owner[tgt]=f;
      onCityCaptured(tgt, f);
      if(ow==='player'){ setDiplo('player',f,'war'); }
      if(ag){ /* general advances */ }
      if(wasPlayer){ pushLog(`🔥 ${factionName(f)}ตียึดเมือง ${provName(tgt)} ของท่านไป!`, 'sys'); toast(`🔥 เสียเมือง ${provName(tgt)} ให้${factionName(f)}!`); }
      else pushLog(`⚔️ ${factionName(f)}ยึด ${provName(tgt)} จาก${factionName(ow)}`, 'sys');
    } else {
      G.troops[src]=Math.max(5,Math.floor(G.troops[src]-atk*0.5));
    }
  },

  tryDiplomacy(f){
    const att=Diplo.attitude(f);
    if(atWar(f,'player') && att>50 && Math.random()<0.5){
      setDiplo('player',f,'peace'); pushLog(`🕊️ ${factionName(f)}ส่งสาส์นขอสงบศึกกับท่าน`, 'sys'); return;
    }
    if(!atWar(f,'player') && !allied(f,'player')){
      const mine=factionProvinces('player').length, theirs=factionProvinces(f).length;
      // a weak faction may seek alliance with strong player
      if(theirs<mine && att>55 && Math.random()<0.4){
        setDiplo('player',f,'alliance'); pushLog(`🤝 ${factionName(f)}เสนอเป็นพันธมิตรกับท่าน (ยอมรับอัตโนมัติ)`, 'sys');
      }
      // a strong faction may declare war on a weak player
      else if(theirs>mine*1.5 && att<40 && Math.random()<0.3){
        setDiplo('player',f,'war'); pushLog(`💢 ${factionName(f)}ประกาศสงครามรุกรานก๊กท่าน!`, 'sys'); toast(`💢 ${factionName(f)}ประกาศสงคราม!`);
      }
    }
  },

  trySpy(f){
    if(!factionProvinces('player').length) return;
    // chance to incite a low-loyalty player general or steal gold
    const weak=G.generals.filter(g=>g.faction==='player'&&!g.lord&&g.loyalty<55);
    if(weak.length && Math.random()<0.5){
      const g=weak[Math.floor(Math.random()*weak.length)];
      g.loyalty=Math.max(0,g.loyalty-15);
      pushLog(`🕵️ สายลับ${factionName(f)}ยุยง ${g.short} ความภักดีลดลงเหลือ ${g.loyalty}`, 'sys');
    } else if(G.treasury.player>40 && Math.random()<0.4){
      const loot=Math.min(G.treasury.player, 25);
      G.treasury.player-=loot;
      pushLog(`🕵️ ไส้ศึก${factionName(f)}ลอบยักยอกทอง ${loot}💰 จากคลังหลวงของท่าน!`, 'sys');
    }
  },

  pickReform(f){
    const owned=G.reforms[f]||[];
    const avail=Object.keys(REFORMS).filter(r=>!owned.includes(r) && REFORMS[r].req.every(q=>owned.includes(q)));
    if(!avail.length) return;
    const pick=avail[Math.floor(Math.random()*avail.length)];
    if((G.treasury[f]||0)>=REFORMS[pick].cost){ G.treasury[f]-=REFORMS[pick].cost; G.reforms[f]=[...owned,pick]; }
  }
};
