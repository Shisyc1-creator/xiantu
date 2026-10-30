'use strict';
// Read-only audit of the current game in isolated VMs. Supply regression included; no balance changes.
const assert=require('node:assert/strict');
const {loadGame}=require('./staff53-check.cjs');
function start(origin='寒门散修'){
 const g=loadGame({currentOpening:true});g.run(`Math.random=()=>.4;newGame('经济审计',${JSON.stringify(origin)},'男');chooseChild(XTBackground47.visibleOriginVariants(G.origin,G.birthContext)[0].i);for(let i=0;i<2;i++)XTOpening46.chooseChildhood(XTOpening46.childhoodToken(),0);beginCultivation();G.mode='idle';G.lastResult=null;`);return g;
}
function fixture(){const g=start();g.run(`economyFactor=()=>1;tryEvent=()=>null;meetLive=()=>null;tryRoadEvent=()=>null;pickRetreatEvent=()=>null;G.age=18;G.realm=0;G.layer=13;G.cult=0;G.lifespan=100;stoneSet(G,0,'审计归零');G.inventory={};XTContent47.money().wen=0;G.injured=0;G.karma=0;globalThis.auditStart=XTSandbox.now();`);return g;}
function data(g,expr){return JSON.parse(g.run('JSON.stringify('+expr+')'));}
function place(g,id,room){g.run(`G.place='${id}';Object.assign(XTSandbox.state(),{roomAt:G.place,room:'${room}'});XTWorld36.sync();`);}
const origins=data(start(),'Object.keys(ORIGINS)');
const openings=origins.map(origin=>{const g=start(origin);return data(g,'({origin:G.origin,stones:G.stones,wen:XTContent47.money().wen,age:G.age,root:G.root})');});
const flows=[];
for(const [name,ctx,seed] of [
 ['行走修行',{act:'walk'},0],['专心营生',{act:'idle',idle:true},0],
 ['旧路计时',{act:'travel',rate:.3},0],['闭关计时',{act:'retreat',retreat:true,rate:1,incomeMul:0,cost:8},100]]){
 for(const days of [30,360]){const g=fixture();g.run(`stoneSet(G,${seed},'审计启动资金');globalThis.out68=advanceDays(${days},${JSON.stringify(ctx)},{stopOnEvent:false});`);
 flows.push(data(g,`({name:'${name}',requestedDays:${days},days:out68.days,stones:G.stones-${seed},income:out68.income,cost:out68.cost,cult:G.cult,wen:XTContent47.money().wen})`));}
}
// Retreat probe uses its real annual upfront fee. Thirty days alone does not
// exercise the UI's interrupted-retreat refund; do not label it a monthly fee.
const jobs=[];
for(const p of ['county','prefecture','market','spiritMarket']){
 const g=fixture();place(g,p,'shops');let month;
 for(let i=0;i<12;i++){g.run(`actWork();G.mode='idle';G.lastResult=null;`);if(!i)month=data(g,'({stones:G.stones,wen:XTContent47.money().wen})');}
 jobs.push(data(g,`({place:'${p}',month:${JSON.stringify(month)},days:XTSandbox.now()-auditStart,stones:G.stones,wen:XTContent47.money().wen})`));
}
const timber=[];
for(const perTrip of [1,4]){
 const g=fixture();place(g,'county','workshop');
 for(let trip=0;trip<(perTrip===1?40:12);trip++){
  g.run(`advanceDays(1,{act:'travel',rate:0,incomeMul:0,eventRate:0});G.place='ridge';Object.assign(XTSandbox.state(),{roomAt:G.place,room:'wild'});for(let k=0;k<${perTrip};k++)XTContent47.gatherTimber();advanceDays(1,{act:'travel',rate:0,incomeMul:0,eventRate:0});G.place='county';Object.assign(XTSandbox.state(),{roomAt:G.place,room:'workshop'});XTWorld36.sync();Object.assign(XTSandbox.view,{tab:'shop',detail:{id:'smith'}});for(let k=0;k<${perTrip*2};k++)XTContent47.trade('spiritTimber47',true);`);
 }
 timber.push(data(g,`({perTrip:${perTrip},days:XTSandbox.now()-auditStart,stones:G.stones,remaining:G.inventory.spiritTimber47})`));
}
// Test real budget exhaustion, same-month save/load, and next-month refill.
const shop=fixture();place(shop,'county','workshop');shop.run(`G.inventory.spiritTimber47=100;Object.assign(XTSandbox.view,{tab:'shop',detail:{id:'smith'}});for(let i=0;i<100;i++)XTContent47.trade('spiritTimber47',true);`);
const exhausted=data(shop,'({stones:G.stones,stock:G.inventory.spiritTimber47,wallet:XTSandbox.shopState("smith").wallet})');
shop.run(`save();restore(localStorage.getItem(SAVE_KEY));`);place(shop,'county','workshop');shop.run(`Object.assign(XTSandbox.view,{tab:'shop',detail:{id:'smith'}});XTContent47.trade('spiritTimber47',true);`);
const restored=data(shop,'({stones:G.stones,stock:G.inventory.spiritTimber47,wallet:XTSandbox.shopState("smith").wallet})');assert.deepEqual(restored,exhausted);
shop.run(`advanceDays(30,{act:'audit',rate:0,incomeMul:0,eventRate:0});XTContent47.trade('spiritTimber47',true);`);
const replenished=data(shop,'({stones:G.stones,stock:G.inventory.spiritTimber47,wallet:XTSandbox.shopState("smith").wallet})');
assert.equal(exhausted.stones,240);assert.equal(replenished.stones,244);
// Approved procurement follows the existing economy factor; same-location resale must not profit.
const arbitrage=[];
for(const factor of [1,1.259712,Math.pow(1.08,7)]){const g=fixture();g.run(`economyFactor=()=>${factor};stoneSet(G,100,'审计交易本金');`);place(g,'spiritMarket','kiln57');g.run(`XTFoundation57.dispatch('buy','blueOre57');globalThis.auditAfterBuy68=G.stones;`);place(g,'spiritMarket','shops');g.run(`Object.assign(XTSandbox.view,{tab:'shop',detail:{id:'sunset'}});XTContent47.trade('blueOre57',true);`);arbitrage.push(data(g,`({factor:${factor},buy:100-auditAfterBuy68,sell:XTContent47.price('sunset','blueOre57',true),net:G.stones-100,days:XTSandbox.now()-auditStart})`));}
// Ordinary merchant loop spreads at base/current economy: quotes only, not all
// auction/NPC opportunities. Pairing distant counters omits required travel.
const spreads=[];for(const factor of [1,1.259712]){const g=fixture();g.run(`economyFactor=()=>${factor};`);spreads.push(data(g,`(()=>{const entries=Object.entries(XTSandbox.actors).filter(([id,a])=>a.stock),rows=[];for(const [id,it]of Object.entries(XTContent47.catalog)){const traders=entries.filter(([who,a])=>Object.hasOwn(a.stock,id));if(!traders.length)continue;const buys=traders.map(([who])=>XTContent47.price(who,id,false)),sells=traders.map(([who])=>XTContent47.price(who,id,true));if(Math.max(...sells)>Math.min(...buys))rows.push({id,buy:Math.min(...buys),sell:Math.max(...sells)});}return {factor:${factor},positive:rows};})()`));}
// Actual inheritance must not erase world supply or public shop budgets.
// Observe the migrated world ledger independently of the approved price correction.
const guild=fixture();guild.run(`G.realm=1;G.day=0;stoneSet(G,128,'审计购料本金');globalThis.startGuild68=XTSandbox.now();`);place(guild,'riverTown','wharf57');guild.run(`for(let i=0;i<16;i++)XTFoundation57.dispatch('buy','riverReed57');`);place(guild,'prefecture','guild57');guild.run(`for(let i=0;i<8;i++){XTFoundation57.dispatch('accept','reed');XTFoundation57.dispatch('report');}`);
const guildLedger=data(guild,'({days:XTSandbox.now()-startGuild68,stones:G.stones,net:G.stones-128,reed:G.inventory.riverReed57,markets:XTFoundation57.state().markets,tripDays:2*travelDays(820)})');assert.equal(guildLedger.net,144);
const heir=fixture();heir.run(`stoneSet(G,100,'审计本金');`);place(heir,'spiritMarket','kiln57');heir.run(`for(let i=0;i<5;i++)XTFoundation57.dispatch('buy','blueOre57');globalThis.oldMarket68=JSON.stringify(G.foundation57.markets);const w68=XTWorld36.world();w68.people.child68={id:'child68',name:'继承审计',realm:0,layer:1,root:'五灵根',birth:XTSandbox.now()-8*360,life:100,alive:true,place:'county',room:'home',sex:'男',parents:[w68.playerId,'N04'],source:'审计夹具'};w68.children.push('child68');G.mode='dead';XTSandbox.dispatch('r36:inherit','child68');`);
const inheritedBefore=data(heir,'({mode:G.mode,stones:G.stones,foundation:G.foundation57||null})');place(heir,'spiritMarket','kiln57');heir.run(`XTFoundation57.dispatch('buy','blueOre57');`);const inheritance=data(heir,'({mode:G.mode,stones:G.stones,oldMarkets:JSON.parse(oldMarket68),after:XTFoundation57.state()?.markets,player:G.world36.playerId})');inheritance.beforePurchase=inheritedBefore;assert.equal(inheritance.player,'child68');assert.equal(Object.values(inheritance.after)[0].stock.blueOre57,10);assert.equal(inheritedBefore.stones,16);
assert.equal(flows.find(r=>r.name==='闭关计时'&&r.days===360).income,0);
assert.equal(timber[0].stones,320);assert.equal(timber[1].stones,384);
assert.equal(jobs.find(r=>r.place==='county').stones,0);
assert.ok(arbitrage.every(row=>row.net<=0));assert.equal(arbitrage[2].buy,21);
console.log(JSON.stringify({scope:'Current real runtime, legitimate current opening; neutral fixtures zero capital and normalize economy. Event-free fixed random .4 probes, not population medians. Seeded budget/arbitrage/inheritance fixtures are labeled, not claimed earned capital.',openings,flows,jobs,timber,budgets:{exhausted,restored,replenished},arbitrage,spreads,guildLedger,inheritance},null,2));
process.exit(0);
