const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadGame}=require('./staff53-check.cjs');
const scan=loadGame(),entries=JSON.parse(scan.run('JSON.stringify(XTEvents60.audit())'));
function prepare(id,index,roll){const g=loadGame(),origin={B47H:'港口船户',B47W:'湖泽水族寄养家庭',B47N:'北地部族家庭'}[id]||'寒门散修';g.run(`XTDeveloper47.scenario('${origin}');tryEvent=()=>null;tryRoadEvent=()=>null;meetLive=()=>null;pickRetreatEvent=()=>null;G.mode='idle';G.age=25;G.lifespan=200;G.stones=10000;XTContent47.money().wen=100000;for(const key of Object.keys(BAG_ITEMS))G.inventory[key]=100;G.injured=2;G.flag.heartDemon=true;G.flag['残页']=true;G.flag.warned=false;G.eventsDone={};G.evtCd={};XTSandbox.state().books['同息御兽篇']={level:1};XTQi52.state().pet=null;globalThis.ev=EVENTS.concat(ROAD_EVENTS).find(e=>e.id==='${id}');
const rooms={E001:'shops',E002:'square',E003:'hunt',E007:'workshop',E009:'square',E015:'square',E024:'agency',E026:'inn45',E027:'agency',E028:'shops',E029:'shops',E030:'shops',E031:'shops',E036:'hall',E037:'hall',E038:'hall',E047:'square',E048:'square',E049:'shops',E050:'shops',E051:'hall',E052:'agency',E053:'shops',E054:'hall',E055:'square',E056:'shops',E057:'square'};
let place=ev.place==='home'?G.home:!ev.place||ev.place==='any'?'county':ev.place;XTDeveloper47.teleport(place,ev.id.startsWith('H')?'residence36':ev.id.startsWith('B47')?'square':rooms[ev.id]||'square');
for(const key of ['elder','broker']){const n=XTWorld36.get(key);if(n){n.birth=XTSandbox.now()-40*360;n.life=100;n.alive=true;}}
for(const n of Object.values(XTWorld36.world().people)){n.inventory={...(n.inventory||{}),herb:10};const r=XTWorld36.relation(n.id);if(r){r.trust=ev.id==='E052'||ev.id==='E053'?-5:10;r.bonds=['旧恩','旧怨'];r.history=[{day:XTSandbox.now(),text:'你曾帮助本人，实际交付过草药。'}];}}
for(const key of ['stall','mentor','dan']){const n=XTWorld36.get(key);if(n)n.wallet52=1000;const shop=XTSandbox.shopState(key);if(shop)shop.wallet=1000;}
if(ev.id==='H06'){const f=G.family[0],n=Object.values(XTWorld36.world().people).find(n=>n.id.startsWith('family_'+G.world36.playerId+'_'));if(f)f.alive=false;if(n)n.alive=false;}
if(ev.id==='E020')G.age=170;
if(ev.road)G.road={from:'county',to:'market',extra:0};
for(const [kind,place]of [['修士','temple'],['凡人','village'],['本地','county'],['本地','market']])addFame(G,kind,place,5);
Math.random=()=>${roll};globalThis.begin60=XTSandbox.now();`);return g;}
for(const entry of entries)test('60 audit '+entry.id+' '+entry.name,()=>{if(entry.status==='replaced'){const g=prepare(entry.id,0,0);const n=g.run('G.stones');assert.equal(g.run('applyOption(ev,0)'),null);assert.equal(g.run('G.stones'),n);return;}
 const first=prepare(entry.id,0,0),count=first.run('ev.opts.length');
 for(let i=0;i<count;i++)for(const roll of [0,.99]){const g=prepare(entry.id,i,roll);assert.equal(g.run('!ev.cond||!!ev.cond(G)'),true,entry.id+' positive fixture');const reason=g.run(`XTEvents60.optionReason(ev,ev.opts[${i}],XTEvents60.context(ev.id))`);assert.equal(reason,'',entry.id+' choice '+i+' eligible');const r=g.run(`applyOption(ev,${i})`);assert.ok(r,entry.id+' '+i+' '+roll);assert.equal(g.run('XTSandbox.now()-begin60'),g.run(`ev.opts[${i}].days||0`));assert.equal(g.run('G.eventsDone[ev.id]'),true);assert.equal(g.run('XTEvents60.state().history.at(-1).id'),entry.id);assert.ok(g.run('G.stones>=0&&Number.isSafeInteger(G.stones)&&XTContent47.money().wen>=0'));assert.equal(g.run(`applyOption(ev,${i})`),null,entry.id+' duplicate blocked');}
});
