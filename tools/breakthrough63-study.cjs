// Historical pre-no-root candidate study; its first row was a cultivable absolute-root hypothesis, now superseded. NOT current no-root balance.
// Offline proposal study. Not loaded by the game; every trial parameter below is provisional.
const assert=require('node:assert/strict');
const roots=['绝灵根','五灵根','四灵根','三灵根','双灵根','变异灵根','天灵根'];
const foundation=[.10,.20,.30,.45,.65,.75,.90];
function prepared(base,coverage=0){if(!Number.isFinite(base)||base<0||base>1||!Number.isFinite(coverage)||coverage<0||coverage>1)throw Error('Invalid probability');return Math.min(.95,base+(1-base)*coverage);}
function rng(seed){let s=seed>>>0;return()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}
function run(data,{count=5000,coverage=0,heavySmall=false,preparationDays=0}={}){
 return data.map((d,index)=>{let wins=0,attempts=0,smallFailures=0,totalAge=0;const ages=[];
 for(let n=0;n<count;n++){const random=rng(0x6a09e667+n*7919);let age=d.startAge,life=100,failed=0,majorAttempts=0,finished=true;
  for(let layer=0;layer<13;layer++){age+=d.needs[layer]/d.output;
   if(age>=life){finished=false;break;}if(layer===12)break;
   const p=Math.max(.05,Math.min(.95,d.smallBase[layer+1]*(1+(d.coef-.95)*2)));let passed=false;
   for(let guard=0;guard<1000;guard++){age+=1/360;if(age>=life)break;if(random()<p){passed=true;break;}failed++;age+=(heavySmall?3:7/360)+(heavySmall?.25:.05)*d.needs[layer]/d.output;if(heavySmall)life-=3;}
   if(!passed){finished=false;break;}
  }
  if(finished){for(let guard=0;guard<1000;guard++){age+=(preparationDays+1)/360;if(age>=life)break;majorAttempts++;if(random()<prepared(foundation[index],coverage)){wins++;totalAge+=age;ages.push(age);break;}life-=3;age+=3+.25*d.needs[12]/d.output;}}
  smallFailures+=failed;attempts+=majorAttempts;
 }
 ages.sort((a,b)=>a-b);const median=ages.length?ages[Math.floor(ages.length/2)]:null;
 return {root:d.root,runs:count,successPercent:+(100*wins/count).toFixed(2),meanSmallFailures:+(smallFailures/count).toFixed(2),meanMajorAttemptsPerLife:+(attempts/count).toFixed(2),medianSuccessAge:median==null?null:+median.toFixed(2)};
 });
}
module.exports={roots,foundation,prepared,rng,run};
if(require.main===module){
 const {loadGame}=require('./staff53-check.cjs'),g=loadGame({currentOpening:true});
 const data=roots.map(root=>{g.run('Math.random=()=>.4;XTDeveloper47.scenario("寒门散修",{root:'+JSON.stringify(root)+',wu:5,gen:5});G.attr={gen:5,wu:5,qi:5,xin:5};G.lifespan=100;G.realm=0;G.layer=1;G.cult=0;G.buff={};G.injured=0;G.equipment={weapon:null,armor:null};XTQi51.state().aux=[];XTDeveloper47.teleport("village","square");');return JSON.parse(g.run('JSON.stringify({root:G.root,coef:G.coef,startAge:G.age+(G.month*30+G.day)/360,output:yearOutput(),needs:LAYER_NEED,smallBase:REALMS[0].bt})'));});
 assert(data.every(d=>d.needs.length===13&&d.output>0&&d.smallBase.length===13));
 const result={scope:'Offline candidate model, NOT gameplay or full economy validation. Actual opening ages, needs, baseline output and old small-stage table; candidate major probabilities. Constant environment/output, no events/travel/work/crafting, one day per attempt. Heavy-small: 25% progress, 3 years recovery and 3 lifespan; light-small: 5% progress, 7 days, no lifespan. Major failure retains current 25%/3-year injury/3-lifespan pattern; injury modelled as three years recovery without cultivation. Success means foundation before lifespan, never a guarantee. Preparation coverage and time are assumptions, NOT purchased or crafted pills.',data,cases:{heavySmallNoAid:run(data,{heavySmall:true}),lightSmallNoAid:run(data),lightSmallHalfCoverage:run(data,{coverage:.5}),halfCoverageOneYearPerAttempt:run(data,{coverage:.5,preparationDays:360}),halfCoverageThreeYearsPerAttempt:run(data,{coverage:.5,preparationDays:1080})}};
 console.log(JSON.stringify(result,null,2));process.exit(0);
}
