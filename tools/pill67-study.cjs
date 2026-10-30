'use strict';
// OFFLINE CANDIDATES ONLY. No game script imports this file.
const candidate = Object.freeze({pillPrice:240, mainPrice:60, auxiliaryPrice:24,
  herbCount:4, recipePrice:40, days:30, firePerDay:1, commissionFee:30,
  minimumSkill:5, noviceChance:.55, skillStep:.04, maximumChance:.75,
  commissionChance:.8, pillModifier:.20, finishedStock:2, materialStock:3, furnaceSlots:1});
const clamp = n => Math.max(.05,Math.min(.95,n));
function pillRate(base, modifier, usePill, bonus=candidate.pillModifier) {
  return clamp(base*(1+modifier+(usePill?bonus:0)));
}
function production(skill, herbPrice=3) {
  if(!Number.isInteger(skill)||skill<candidate.minimumSkill||skill>10)throw Error('unqualified skill');
  const materials=candidate.mainPrice+candidate.auxiliaryPrice+candidate.herbCount*herbPrice;
  const fire=candidate.days*candidate.firePerDay;
  const chance=Math.min(candidate.maximumChance,candidate.noviceChance+(skill-candidate.minimumSkill)*candidate.skillStep);
  return {materials,fire,chance,selfExpected:(materials+fire)/chance,
    commissionExpected:(materials+fire)/candidate.commissionChance+candidate.commissionFee,
    selfThreeFailures:(1-chance)**3,commissionThreeFailures:(1-candidate.commissionChance)**3,
    selfFirstThreeExpectedPills:3*chance,commissionFirstThreeExpectedPills:3*candidate.commissionChance};
}
function fundDays(price, salePrice, roundTripDays=2, units=2, gatherDays=7) {
  if(![price,salePrice,units,gatherDays].every(n=>Number.isFinite(n)&&n>0)||roundTripDays<0)throw Error('invalid funding input');
  const cycles=Math.ceil(price/(salePrice*units));
  return {cycles,days:cycles*(gatherDays+roundTripDays),gross:cycles*salePrice*units};
}
function runtimeSurvey() {
  const assert=require('node:assert/strict');
  const {loadGame}=require('./staff53-check.cjs');
  const g=loadGame({currentOpening:true});
  g.run(`Math.random=()=>.4;XTDeveloper47.scenario('寒门散修',{root:'三灵根'});
    G.realm=0;G.layer=13;G.lifespan=realmLife(0);G.age=18;G.stones=0;G.inventory={};
    G.coef=.97;G.attr={gen:5,wu:5,qi:5,xin:5};G.arts={};G.learned={};G.equipment={};
    G.buff={};G.injured=0;G.karma=0;G.cult=realmFullNeed();
    XTSandbox.state().mind=null;XTSandbox.state().books={};XTQi51.state().aux=[];
    tryEvent=()=>null;meetLive=()=>null;tryRoadEvent=()=>null;pickRetreatEvent=()=>null;`);
  const baseline=JSON.parse(g.run(`JSON.stringify((()=>{
    const economy=economyFactor(), base=nextBtBase();G.stones=1000;
    const rates=['五灵根','三灵根','天灵根'].map(root=>{G.coef=ROOTS[root].coef;
      const modifier=(G.coef-.95)*2;return {root,modifier,none:breakRate(0),old800:breakRate(800),old1000:breakRate(1000)};});
    const growth=['五灵根','三灵根','天灵根'].flatMap(root=>['county','village','cliff'].map(place=>{
      G.coef=ROOTS[root].coef;G.place=place;const output=yearOutput(),need=LAYER_NEED.reduce((a,b)=>a+b,0);
      let smallExtraYears=0;for(let layer=1;layer<13;layer++){
        G.layer=layer;G.cult=realmNeed(0,layer);const p=breakRate(0),failures=(1-p)/p;
        smallExtraYears+=failures*(realmNeed(0,layer)*.05/output+7/360);
      }G.layer=13;G.cult=realmFullNeed();
      return {root,place,need,annualOutput:output,pureYears:need/output,smallExtraYears,life:realmLife(0),
        majorFailureDeficit:realmFullNeed()-Math.floor(realmFullNeed()*.75)};
    }));G.coef=.97;G.place='county';G.stones=0;
    return {economy,base,rates,growth,routeDays:{ridgeCounty:travelDays(60),countyPrefecture:travelDays(1200),prefectureMarket:travelDays(1800)},
      liveTimberSell:XTContent47.price('smith','spiritTimber47',true),liveHerbBuy:XTContent47.price('grocer','herb')};
  })())`));
  // Real gather/trade/clock calls in isolated VM, with explicit event-free
  // road traversal. No teleport income, grants or starting resources counted.
  const income=[];
  for(const factor of [1,baseline.economy]) {
    g.run(`economyFactor=()=>${factor};G.stones=0;G.inventory={};G.mode='idle';
      G.place='county';XTSandbox.state().roomAt='county';XTSandbox.state().room='workshop';
      globalThis.start67=XTSandbox.now();globalThis.cycles67=0;`);
    const target=Math.round(candidate.pillPrice*factor);
    while(g.run('G.stones')<target) {
      if(g.run('cycles67')>150)throw Error('funding path stalled');
      g.run(`advanceDays(travelDays(60),{act:'travel',rate:0,incomeMul:0,eventRate:0});
        G.place='ridge';XTSandbox.state().roomAt='ridge';XTSandbox.state().room='wild';
        XTContent47.gatherTimber();
        advanceDays(travelDays(60),{act:'travel',rate:0,incomeMul:0,eventRate:0});
        G.place='county';XTSandbox.state().roomAt='county';XTSandbox.state().room='workshop';
        XTWorld36.sync();XTSandbox.view.tab='shop';XTSandbox.view.detail={id:'smith'};
        XTContent47.trade('spiritTimber47',true);XTContent47.trade('spiritTimber47',true);cycles67++;`);
    }
    income.push(JSON.parse(g.run(`JSON.stringify({factor:${factor},target:${target},
      days:XTSandbox.now()-start67,cycles:cycles67,stones:G.stones,
      itemRemainder:G.inventory.spiritTimber47,smithPresent:XTWorld36.present('smith'),
      sellPrice:XTContent47.price('smith','spiritTimber47',true)})`)));
  }
  for(const row of baseline.rates){
    assert.equal(pillRate(baseline.base,row.modifier,false),row.none);
    assert.equal(pillRate(baseline.base,row.modifier,true),row.old800);
    assert.equal(row.old800,row.old1000);
  }
  for(const row of income){
    assert.equal(row.days,fundDays(row.target,row.sellPrice).days);
    assert.equal(row.itemRemainder,0);assert.equal(row.smithPresent,true);
  }
  // Separate controlled training fixture; supplied herbs are valued at the
  // current base quote, not advertised as free starting resources.
  g.run(`economyFactor=()=>1;G.stones=300;G.inventory={herb:10};G.mode='idle';
    G.place='county';XTSandbox.state().roomAt='county';XTSandbox.state().room='workshop';
    XTSandbox.state().skills.alchemy=0;XTSandbox.state().recipes=[];XTSandbox.state().workshop=null;
    XTWorld36.sync();globalThis.trainingStart67=XTSandbox.now();
    XTSandbox.dispatch('learnRecipes','alchemy');XTSandbox.dispatch('rentWorkshop');
    for(let i=0;i<5;i++){if(XTSandbox.state().workshop.until<XTSandbox.now()+10)XTSandbox.dispatch('rentWorkshop');XTContent47.make('qiPill');}
  `);
  const training=JSON.parse(g.run(`JSON.stringify({days:XTSandbox.now()-trainingStart67,
    skill:XTSandbox.state().skills.alchemy,stoneDelta:300-G.stones,
    herbUsed:10-(G.inventory.herb||0),herbValue:10*XTContent47.price('grocer','herb'),
    productCount:G.inventory.qiPill||0})`));
  assert.equal(training.skill,5);assert.equal(training.herbUsed,10);assert.equal(training.days,53);
  return {scope:'Event-free isolated real runtime actions; roads use actual duration and clock but no UI. Developer lifespan reset to real 100; no existing player save touched. Pure growth excludes costs, interruptions and breakthrough failures.',
    candidate,baseline,income,training,production:[5,8,10].map(skill=>({skill,...production(skill)})),
    prices:[180,240,300].map(price=>({price,...fundDays(price,4)})),
    bonuses:[.1,.2,.3].map(bonus=>({bonus,rate:pillRate(baseline.base,.04,true,bonus)}))};
}
module.exports={candidate,pillRate,production,fundDays,runtimeSurvey};
if(require.main===module){console.log(JSON.stringify(runtimeSurvey(),null,2));process.exit(0);}
