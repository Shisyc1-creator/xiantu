'use strict';
// Normal current opening; isolated storage. Event-free route comparisons, not population forecasts.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {loadGame}=require('./staff53-check.cjs');
function run(strategy,seed){const g=loadGame({currentOpening:true});
 g.run(`Math.random=()=>.4;newGame('收支实走','寒门散修','男');chooseChild(XTBackground47.visibleOriginVariants(G.origin,G.birthContext)[0].i);for(let i=0;i<2;i++)XTOpening46.chooseChildhood(XTOpening46.childhoodToken(),0);beginCultivation();G.mode='idle';G.lastResult=null;
 let seed71=${seed};Math.random=()=>{seed71=(Math.imul(seed71,1664525)+1013904223)>>>0;return seed71/4294967296;};
 tryEvent=()=>null;meetLive=()=>null;tryRoadEvent=()=>null;pickRetreatEvent=()=>null;
 globalThis.clock71={};const engine71=advanceDays;advanceDays=function(n,ctx={},opt){const r=engine71(n,ctx,opt);clock71[ctx.act||'walk']=(clock71[ctx.act||'walk']||0)+r.days;return r;};
 globalThis.read71=()=>({day:XTSandbox.now(),age:G.age,root:G.root,realm:G.realm,layer:G.layer,cult:G.cult,stones:G.stones,wen:XTContent47.money().wen,place:G.place,mode:G.mode});
 globalThis.walk71=(dest)=>{if(G.mode!=='idle')return false;const queue=[[G.place]],seen=new Set([G.place]);while(queue.length){const r=queue.shift(),at=r.at(-1);if(at===dest){for(const to of r.slice(1)){departTo(to);if(G.mode!=='idle'||G.place!==to)return false;}return true;}for(const edge of ROUTES){const to=edge.a===at?edge.b:edge.b===at?edge.a:null;if(to&&!seen.has(to)&&placeAvailable(to)&&routeAvailable(edge)){seen.add(to);queue.push([...r,to]);}}}return false;};
 globalThis.room71=(to)=>{XTSandbox.go('scene');const r=XTScene44.route(to,XTSandbox.roomDefs());for(const next of r.slice(1))XTSandbox.dispatch('m45:walk',next);return XTSandbox.state().room===to;};
 globalThis.shop71=(id)=>{Object.assign(XTSandbox.view,{tab:'shop',detail:{id},sub:'buy'});};
 globalThis.resume71=()=>{if(G.mode==='result'){G.mode='idle';G.lastResult=null;}};
 `);
 const data=expr=>JSON.parse(g.run('JSON.stringify('+expr+')')),opening=data('read71()');
 const stats={strategy,seed,opening,setup:null,checkpoints:[],milestones:{},fallbackTrips:0,income:0,wenIncome:0,cycles:0,stop:null};
 // Buy and study real public books, with the actual opening funds and ordinary copper work.
 g.run(`walk71('county');room71('shops');actWork();room71('workshop');shop71('smith');XTContent47.trade('ironSword',false);XTSandbox.dispatch('equip','ironSword');if(G.stones<40){walk71('market');room71('shops');for(let i=0;i<6&&G.stones<40;i++){actWork();XTContent47.laborCommit(XTContent47.laborToken());}walk71('county');}room71('square');for(const title of ['养锋诀','点锋剑术']){XTQi51.dispatch('q51:buy',title);XTSandbox.dispatch('read',XTQi51.library[title].id);XTQi51.dispatch('q51:practice',title);}XTQi51.dispatch('q51:main','养锋诀');XTQi51.dispatch('q51:spell','点锋剑术');`);
 assert.equal(g.run("XTSandbox.state().books['养锋诀']?.level"),1);assert.equal(g.run("XTSandbox.state().books['点锋剑术']?.level"),1);
 stats.setup=data('({snapshot:read71(),weapon:G.equipment.weapon,books:XTSandbox.state().books})');
 const horizon=opening.day+(strategy.startsWith('balanced')?90:30)*360;let previousYear=0;
 for(let cycle=0;cycle<180&&g.run('G.mode')!=='dead'&&g.run('XTSandbox.now()')<horizon;cycle++){
  const start=data('read71()');let worked=0,earned=0,wen=0,why='';
  for(let i=0;i<6&&(!strategy.startsWith('balanced')||g.run('G.stones')<120);i++){
   if(strategy==='market'||strategy==='sunset'||strategy.startsWith('balanced')){
    const dest=strategy==='sunset'?'spiritMarket':'market';
    if(!g.run(`walk71('${dest}')&&room71('shops')`)){why='工作地点无法抵达';break;}
    const before=data('read71()');g.run('actWork();XTContent47.laborCommit(XTContent47.laborToken());resume71();');const after=data('read71()');
    worked+=after.day-before.day;earned+=after.stones-before.stones;
    if(strategy.startsWith('balanced')&&(after.day===before.day||after.stones===before.stones)){
     const fallbackBefore=data('read71()');
     if(!g.run(`walk71('ridge')&&room71('wild')`)){why='替代采集地无法抵达';break;}
     g.run('sysGather();');
     if(!g.run(`walk71('prefecture')&&room71('shops')`)){why='府城替代买家无法抵达';break;}
     g.run(`shop71('prefect');for(let j=0;j<20&&(G.inventory.herb||0)>0;j++){const n=G.inventory.herb;XTContent47.trade('herb',true);if(n===G.inventory.herb)break;}`);
     const fallbackAfter=data('read71()');worked+=fallbackAfter.day-fallbackBefore.day;earned+=fallbackAfter.stones-fallbackBefore.stones;stats.fallbackTrips++;
     if(fallbackAfter.stones===fallbackBefore.stones){why='替代府城收药也未能结款';break;}continue;
    }
    if(after.day===before.day||after.stones===before.stones){why=data(`({reason:'雇主不在或钱匣不足',alive:XTWorld36.alive(XTWorld36.get('${strategy==='sunset'?'sunset':'stall'}')),wallet:XTSandbox.shopState('${strategy==='sunset'?'sunset':'stall'}').wallet})`);break;}
   }else if(strategy==='herb'||strategy==='timber'){
    if(!g.run(`walk71('ridge')&&room71('wild')`)){why='采集地无法抵达';break;}
    const before=data('read71()');g.run(strategy==='herb'?'sysGather();':'XTContent47.gatherTimber();');worked+=g.run('XTSandbox.now()')-before.day;
    if(!g.run(`walk71('${strategy==='timber'?'spiritMarket':'market'}')&&room71('shops')`)){why='收购地点无法抵达';break;}
    const cash=g.run('G.stones');g.run(`shop71('${strategy==='timber'?'sunset':'stall'}');for(let j=0;j<20&&(G.inventory.${strategy==='herb'?'herb':'spiritTimber47'}||0)>0;j++){const n=G.inventory.${strategy==='herb'?'herb':'spiritTimber47'};XTContent47.trade('${strategy==='herb'?'herb':'spiritTimber47'}',true);if(n===G.inventory.${strategy==='herb'?'herb':'spiritTimber47'})break;}`);earned+=g.run('G.stones')-cash;
    if(g.run('G.stones')===cash){why=strategy==='timber'?data("({reason:'落霞当前无木料缺口或无法付款',demand:XTWorkshop70.demand(),cash:XTSandbox.shopState('sunset').wallet})"):'没有有效收购需求或商人无法付款';break;}
   }else{
    if(!g.run(`walk71('county')&&room71('shops')`)){why='凡钱工作地点无法抵达';break;}
    const before=data('read71()');g.run(`actWork();room71('workshop');shop71('smith');if(!XTSandbox.state().recipes.includes('ironSword')){XTContent47.trade('mundanePatterns47',false);XTSandbox.dispatch('read','mundanePatterns47');}for(let j=0;j<3;j++)XTContent47.trade('pigIron47',false);XTContent47.make('ironSword');shop71('smith');XTContent47.trade('ironSword',true);`);const after=data('read71()');worked+=after.day-before.day;earned+=after.stones-before.stones;wen+=after.wen-before.wen;
    if(after.day===before.day){why=data("({reason:'短工或凡器制作无法继续',smithAlive:XTWorld36.alive(XTWorld36.get('smith')),employerBudget:XTContent47.money().employers.county,crafted:G.content47?.crafted?.ironSword||0})");break;}
   }
   for(const target of [240,800])if(!stats.milestones[target]&&g.run('G.stones')>=target)stats.milestones[target]=data('read71()');
   if(g.run('G.mode')==='dead'){why='寿尽';break;}
  }
  stats.income+=earned;stats.wenIncome+=wen;stats.cycles++;
  for(const target of [240,800])if(!stats.milestones[target]&&g.run('G.stones')>=target)stats.milestones[target]=data('read71()');
  if(why){stats.stop={at:data('read71()'),reason:why};break;}
  // Actual calendar-year cultivation action, with real small-stage attempts.
  if(!g.run(`walk71('${strategy==='balanced_temple'?'temple':'village'}')`)){stats.stop={reason:'修行地无法抵达'};break;}
  g.run(`for(let tries=0;tries<30&&XTBreakthrough65.ready()&&G.mode==='idle';tries++){doBreak();resume71();}if(G.mode==='idle'&&!realmBrim()){${strategy.startsWith('balanced')?"const beforeRetreat=XTSandbox.now();if(G.stones>=currentRetreatCost())doRetreat(1,retreatEfficiency());if(G.mode==='idle'&&XTSandbox.now()===beforeRetreat)stepYear(false);":"stepYear(false);"}}resume71();`);
  const end=data('read71()');if(end.day===start.day){stats.stop={reason:'本轮行动未推进，保留真实阻断状态',at:end,details:data('({log:G.log.slice(-3),lastResult:G.lastResult,rt:G.rtCount,ready:XTBreakthrough65.ready(),brim:realmBrim()})')};break;}
  const year=Math.floor((end.day-opening.day)/360);if(year>=previousYear+5){stats.checkpoints.push(end);previousYear=year;}
  if(g.run('G.realm===0&&G.layer===13&&realmBrim()')){stats.stop={reason:'已达到炼气十三层满修为；未启用候选丹药数值'};break;}
 }
 stats.final=data('read71()');if(!stats.stop)stats.stop={reason:stats.final.mode==='dead'?'寿尽':stats.final.day>=horizon?'到达本组观察上限':'达到动作次数上限'};stats.elapsedDays=stats.final.day-opening.day;stats.timeByAction=data('clock71');assert.equal(Object.values(stats.timeByAction).reduce((a,b)=>a+b,0),stats.elapsedDays);
 stats.remaining=data('G.inventory');assert.equal(g.run('!!G.developer47'),false);assert.equal(g.run('localStorage.getItem("xiuxian_slice_v1")'),null);return stats;
}
const rows=[];for(const strategy of (process.argv[2]?process.argv[2].split(','):['market','sunset','herb','timber','craft','balanced','balanced_temple']))for(const seed of [11,29,71])rows.push(run(strategy,seed));
const report={scope:'21 controlled event-free routes; same legitimate ordinary-family opening, three seeded action samples per route. No money/root/age/realm grants. Thirty-year fixed-work comparisons; ninety-year cap for savings-aware retreat strategy. Shared startup earns actual wages to learn two books. 240/800 are savings checkpoints, not approved pill prices. No major breakthrough attempts; not a random-life median.',rows};
fs.mkdirSync(path.join(__dirname,'../outputs'),{recursive:true});fs.writeFileSync(path.join(__dirname,'../outputs/economy71-results.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(rows.map(r=>({route:r.strategy,seed:r.seed,opening:r.opening,setupStones:r.setup.snapshot.stones,years:r.elapsedDays/360,stones:r.final.stones,wen:r.final.wen,layer:r.final.layer,days240:r.milestones[240]?.day-r.opening.day||null,days800:r.milestones[800]?.day-r.opening.day||null,stop:r.stop})),null,2));process.exit(0);
