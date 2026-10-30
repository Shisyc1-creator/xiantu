// Read-only runtime survey. Does not alter gameplay or any player save.
const assert=require('node:assert/strict'),{loadGame}=require('./staff53-check.cjs');
const g=loadGame({currentOpening:true});g.run('Math.random=()=>.4;XTDeveloper47.scenario("寒门散修",{root:"三灵根"});G.realm=0;G.layer=1;G.cult=0;G.attr={gen:5,wu:5,qi:5,xin:5};G.coef=.97;G.buff={};G.injured=0;G.arts={};G.learned={};G.equipment={};XTSandbox.state().mind=null;XTSandbox.state().books={};XTQi51.state().aux=[];');
const report=JSON.parse(g.run(`JSON.stringify((()=>{const places=Object.entries(PLACES).map(([id,p])=>({id,label:p.name,qi:p.qi,needRealm:p.needRealm||0}));const rows=REALMS.map((r,i)=>{G.realm=i;G.layer=1;G.cult=0;const sites=[];for(const [id,p]of Object.entries(PLACES)){G.place=id;if(placeAvailable(id)&&qiGateStatus().enough)sites.push({id,qi:p.qi,output:yearOutput()});}sites.sort((a,b)=>b.output-a.output);const need=(i===0?LAYER_NEED:r.layers).reduce((a,b)=>a+b,0);return {realm:r.name,life:r.life,pace:r.pace,qiGate:r.qiGate,need,validPlaces:sites.map(s=>s.id),bestOutput:sites[0]?.output??null,optimisticYears:sites[0]?need/sites[0].output:null};});const travel=[-1,0,1,2,3].map(realm=>{G.realm=realm;const nodes=Object.keys(PLACES).filter(placeAvailable),links=ROUTES.filter(routeAvailable);let maxDays=0,pair=null;for(const start of nodes){const d=Object.fromEntries(nodes.map(n=>[n,n===start?0:Infinity])),left=new Set(nodes);while(left.size){const at=[...left].sort((a,b)=>d[a]-d[b])[0];left.delete(at);if(!Number.isFinite(d[at]))break;for(const r of links){const to=r.a===at?r.b:r.b===at?r.a:null;if(to&&left.has(to))d[to]=Math.min(d[to],d[at]+travelDays(r.li));}}for(const end of nodes)if(Number.isFinite(d[end])&&d[end]>maxDays){maxDays=d[end];pair=[start,end];}}return {realm,nodes:nodes.length,links:links.length,maxShortestDays:maxDays,pair,oneDayLinks:links.filter(r=>travelDays(r.li)===1).length};});return {scope:'Runtime snapshot in isolated developer VM. Optimistic years are arithmetic lower bounds at best existing legal environment, with equal attributes/root and no manual, no failures, no economy, no travel; not a life simulation.',maxQi:Math.max(...places.map(p=>p.qi)),birthTemplates:XTBackground47.contexts.length,places,rows,travel};})())`));
// Names/administrative context do not imply separate route graphs or cross-region travel.
report.geography=JSON.parse(g.run(`JSON.stringify({
  scope:'Existing birth contexts share runtime place IDs and route topology; no cross-context links are implemented.',
  contexts:XTBackground47.contexts.map(c=>({id:c.id,country:c.country,state:c.state,prefecture:c.prefecture,county:c.county,
    locations:Object.keys(PLACES).map(id=>({runtimePlaceId:id,label:c.places[id]||PLACES[id].name}))})),
  routes:ROUTES.map(r=>({from:r.a,to:r.b,li:r.li,days:[-1,0,1,2,3].map(realm=>{G.realm=realm;return {realm,available:routeAvailable(r),days:travelDays(r.li)};})}))
})`));
assert.equal(new Set(report.geography.contexts.map(c=>c.id)).size,report.birthTemplates);
const placeIds=new Set(report.places.map(p=>p.id));
for(const c of report.geography.contexts){
  assert(c.country&&c.state&&c.prefecture&&c.county);
  assert.equal(c.locations.length,placeIds.size);
  assert(c.locations.every(p=>placeIds.has(p.runtimePlaceId)&&p.label));
}
for(const r of report.geography.routes){
  assert(placeIds.has(r.from)&&placeIds.has(r.to));
  assert(Number.isFinite(r.li)&&r.li>0);
  assert(r.days.every(d=>Number.isInteger(d.days)&&d.days>=1));
}
assert(Number.isFinite(report.maxQi));assert(report.rows.every(r=>r.need>0&&r.life>0));assert(report.travel.every(r=>r.nodes>0&&Number.isFinite(r.maxShortestDays)));for(const row of report.rows)for(const id of row.validPlaces)assert(report.places.find(p=>p.id===id).qi>=row.qiGate);console.log(JSON.stringify(report,null,2));process.exit(0);
