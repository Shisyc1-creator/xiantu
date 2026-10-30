// Candidate-only travel contract. Never loaded by prototype/index.html.
const assert = require('node:assert/strict');
const distances = [1600, 2400, 3200];
const location = x => x && typeof x.regionId === 'string' && x.regionId &&
  typeof x.placeId === 'string' && x.placeId;
function validate(s) {
  assert.equal(s.version, 1);
  assert(location(s.from) && location(s.to));
  assert.notDeepEqual(s.from, s.to);
  assert(Number.isSafeInteger(s.totalDays) && s.totalDays > 0);
  assert(Number.isSafeInteger(s.progressDays) && s.progressDays >= 0 && s.progressDays <= s.totalDays);
  assert(Number.isSafeInteger(s.spentDays) && s.spentDays >= s.progressDays);
  assert(['outbound', 'returning', 'arrived', 'returned', 'dead'].includes(s.status));
  if (s.status === 'arrived') assert.equal(s.progressDays, s.totalDays);
  if (s.status === 'returned') assert.equal(s.progressDays, 0);
  return s;
}
function begin(from, to, totalDays) {
  return validate({version:1, from:structuredClone(from), to:structuredClone(to),
    totalDays, progressDays:0, spentDays:0, status:'outbound'});
}
function advance(state, days, {delay=false, died=false}={}) {
  const s = structuredClone(validate(state));
  assert(Number.isSafeInteger(days) && days >= 0);
  if (!['outbound', 'returning'].includes(s.status)) return s;
  const remaining = s.status === 'outbound' ? s.totalDays-s.progressDays : s.progressDays;
  const spent = delay ? days : Math.min(days, remaining);
  s.spentDays += spent;
  if (!delay) s.progressDays += s.status === 'outbound' ? spent : -spent;
  if (died) s.status = 'dead';
  else if (s.status === 'outbound' && s.progressDays === s.totalDays) s.status='arrived';
  else if (s.status === 'returning' && s.progressDays === 0) s.status='returned';
  return validate(s);
}
function turnBack(state) {
  const s = structuredClone(validate(state));
  if (s.status === 'outbound') s.status=s.progressDays ? 'returning' : 'returned';
  return validate(s);
}
function restore(raw) { return validate(JSON.parse(raw)); }
module.exports = {distances, begin, advance, turnBack, restore};

if (require.main === module) {
  const {loadGame}=require('./staff53-check.cjs');
  const g=loadGame({currentOpening:true});
  g.run(`XTDeveloper47.scenario('寒门散修',{root:'三灵根'});G.place='prefecture';G.cult=0;tryEvent=()=>null;meetLive=()=>null;globalThis.fixture66=JSON.stringify(G);`);
  const baseline=g.run('JSON.stringify({places:PLACES,routes:ROUTES})');
  const rows=distances.map(li=>JSON.parse(g.run(`JSON.stringify([-1,0,1,2,3,4].map(realm=>{
    G=JSON.parse(fixture66);G.realm=realm;G.layer=realm<0?0:1;G.root=realm<0?'无灵根':'三灵根';G.lifespan=REALMS[Math.max(0,realm)].life;
    const leg=travelDays(${li}),approach=travelDays(routeOf('county','prefecture').li);
    const cash=G.stones;const elapsed=advanceDays(leg,{act:'travel',rate:CFG.walkRate,eventRate:0},{stopOnEvent:true});
    return {realm,pace:paceOf(G),oneWay:leg,roundTrip:leg*2,
      controlledCurrentTravel:{days:elapsed.days,stoneDelta:G.stones-cash,cultGain:elapsed.gain,explicitCost:elapsed.cost},
      countyRoundTrip:(approach+leg)*2,withOneDayDelivery:leg*2+1,
      roadEventChanceAtExistingRisk1:Math.min(.55,ROAD_RATE[1]*leg)};
  }))`)));
  assert.equal(g.run('JSON.stringify({places:PLACES,routes:ROUTES})'),baseline);
  const items=JSON.parse(g.run(`JSON.stringify(['riverReed57','blueOre57'].map(id=>({id,name:BAG_ITEMS[id].name,price:XTContent47.catalog[id].price,currency:XTContent47.catalog[id].currency})))`));
  console.log(JSON.stringify({status:'candidate-not-runtime',distances,rows,items,
    note:'Real current travelDays and pace; no new route, risk, goods, recipe or price installed. One-day delivery is a comparison with the existing guild action, not a confirmed new fee.'},null,2));
  process.exit(0); // loadGame also registers legacy tests; this command is a survey only.
}
