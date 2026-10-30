'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame}=require('./staff53-check.cjs');
function fixture(){const g=loadGame({currentOpening:true});g.run(`Math.random=()=>.4;newGame('账本回归','寒门散修','男');chooseChild(XTBackground47.visibleOriginVariants(G.origin,G.birthContext)[0].i);for(let i=0;i<2;i++)XTOpening46.chooseChildhood(XTOpening46.childhoodToken(),0);beginCultivation();G.mode='idle';G.lastResult=null;economyFactor=()=>1;tryEvent=()=>null;meetLive=()=>null;tryRoadEvent=()=>null;G.realm=1;G.stones=1000;G.inventory.blueOre57=0;G.inventory.riverReed57=0;`);return g;}
function go(g,place,room){g.run(`G.place='${place}';Object.assign(XTSandbox.state(),{roomAt:G.place,room:'${room}'});XTWorld36.sync();render();`);}
function inherit(g,id){g.run(`{const w=XTWorld36.world();w.people['${id}']={id:'${id}',name:'账本后人',realm:1,layer:1,root:'五灵根',birth:XTSandbox.now()-8*360,life:200,alive:true,place:'spiritMarket',room:'home',sex:'男',parents:[w.playerId,'N04'],source:'受控已出生后人'};w.children.push('${id}');G.mode='dead';XTSandbox.dispatch('r36:inherit','${id}');}`);assert.equal(g.run('G.world36.playerId'),id);}
function buy(g,n=1){go(g,'spiritMarket','kiln57');g.run(`for(let i=0;i<${n};i++)XTFoundation57.dispatch('buy','blueOre57');`);}
test('same-month successors consume the original public supply, even after reload',()=>{
 const g=fixture();buy(g,5);assert.equal(g.run('G.stones'),940);
 inherit(g,'heir68a');assert.equal(g.run('G.stones'),376);buy(g);assert.equal(g.run('G.stones'),364);
 assert(g.run('save();restore(localStorage.getItem(SAVE_KEY))'));inherit(g,'heir68b');buy(g,20);
 assert.equal(g.run('G.inventory.blueOre57'),10); // 16 original - 5 ancestor - 1 parent
 const before=g.run('G.stones');buy(g);assert.equal(g.run('G.stones'),before);
});
test('legacy personal supply is preserved when inheritance precedes any new transaction',()=>{
 const g=fixture();g.run(`G.foundation57={version:1,ownerId:G.world36.playerId,markets:{['spiritMarket_'+Math.floor(XTSandbox.now()/30)]:{stock:{blueOre57:2},spent:168,paid:0}},order:null,history:[],wins:{},crafted:{}};`);
 assert(g.run('restore(JSON.stringify(G))'));inherit(g,'legacy68');buy(g,3);assert.equal(g.run('G.inventory.blueOre57'),2);
});
test('public guild budget persists across inheritance; personal order does not',()=>{
 const g=fixture();go(g,'prefecture','guild57');g.run(`G.inventory.riverReed57=30;for(let i=0;i<8;i++){XTFoundation57.dispatch('accept','reed');XTFoundation57.dispatch('report');}XTFoundation57.dispatch('accept','ore');`);
 inherit(g,'guild68');assert.equal(g.run('XTFoundation57.state()?.order??null'),null);
 go(g,'prefecture','guild57');g.run(`G.inventory.riverReed57=2;XTFoundation57.dispatch('accept','reed');globalThis.before68=G.stones;XTFoundation57.dispatch('report');`);
 assert.equal(g.run('G.stones'),g.run('before68'));assert.equal(g.run('G.inventory.riverReed57'),2);
});
test('world supply refills only on the existing month boundary and never carries into a new game',()=>{
 const g=fixture();buy(g,16);assert(g.run('save();restore(localStorage.getItem(SAVE_KEY))'));buy(g);assert.equal(g.run('G.inventory.blueOre57'),16);
 g.run(`advanceDays(30,{act:'audit',rate:0,incomeMul:0,eventRate:0},{stopOnEvent:false});`);buy(g);assert.equal(g.run('G.inventory.blueOre57'),17);
 g.run(`newGame('独立世界','寒门散修','男');`);assert.equal(g.run('G.world36?.foundationMarkets57??null'),null);
});
test('failed save rolls back migrated public supply as well as money and cargo',()=>{
 const g=fixture();buy(g);go(g,'spiritMarket','kiln57');const before=g.run('JSON.stringify(G)');g.run(`localStorage.setItem=()=>{throw Error('quota')};XTFoundation57.dispatch('buy','blueOre57');`);assert.equal(g.run('JSON.stringify(G)'),before);
});
test('malformed public stock and conflicting legacy copies cannot overwrite a valid save',()=>{
 const g=fixture();buy(g);const good=g.run('JSON.stringify(G)');
 for(const change of [`Object.values(bad.world36.foundationMarkets57)[0].stock.blueOre57=17`, `Object.values(bad.world36.foundationMarkets57)[0].paid=301`, `Object.values(bad.foundation57.markets)[0].stock.blueOre57=16`, `bad.world36.foundationMarkets57=[]`]){
  g.run(`globalThis.bad=JSON.parse(${JSON.stringify(good)});${change}`);
  assert.equal(g.run('restore(JSON.stringify(bad))'),false);assert.equal(g.run('JSON.stringify(G)'),good);
 }
});
test('failed first procurement does not leave an initialized world ledger or migrate a legacy save',()=>{
 const g=fixture();g.run(`G.foundation57={version:1,ownerId:G.world36.playerId,markets:{},order:null,history:[],wins:{},crafted:{}};`);go(g,'spiritMarket','kiln57');const before=g.run('JSON.stringify(G)');
 g.run(`localStorage.setItem=()=>{throw Error('quota')};XTFoundation57.dispatch('buy','blueOre57');`);assert.equal(g.run('JSON.stringify(G)'),before);
});
test('ordinary resale and repurchase do not replenish the special supply ledger',()=>{
 const g=fixture();buy(g,16);go(g,'spiritMarket','shops');g.run(`Object.assign(XTSandbox.view,{tab:'shop',detail:{id:'sunset'}});XTContent47.trade('blueOre57',true);XTContent47.trade('blueOre57',false);`);
 assert.equal(g.run('G.inventory.blueOre57'),16);buy(g);assert.equal(g.run('G.inventory.blueOre57'),16);
});
test('inherited guild budget becomes available again in the next existing month',()=>{
 const g=fixture();go(g,'prefecture','guild57');g.run(`G.inventory.riverReed57=16;for(let i=0;i<8;i++){XTFoundation57.dispatch('accept','reed');XTFoundation57.dispatch('report');}`);
 inherit(g,'nextmonth68');go(g,'prefecture','guild57');g.run(`advanceDays(30,{act:'audit',rate:0,incomeMul:0,eventRate:0},{stopOnEvent:false});G.inventory.riverReed57=2;XTFoundation57.dispatch('accept','reed');globalThis.before68=G.stones;XTFoundation57.dispatch('report');`);
 assert.equal(g.run('G.stones'),g.run('before68+34'));assert.equal(g.run('G.inventory.riverReed57'),0);
});
module.exports={fixture,go,inherit};
