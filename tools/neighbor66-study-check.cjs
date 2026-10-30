const {test}=require('node:test'),assert=require('node:assert/strict');
const {begin,advance,turnBack,restore}=require('./neighbor66-study.cjs');
const from={regionId:'daliang-qing',placeId:'prefecture'};
const to={regionId:'candidate-neighbor66',placeId:'prefecture'};
const trip=()=>begin(from,to,30); // Illustrative candidate, never a runtime default.
test('candidate namespaces distinguish two prefecture IDs and copy input',()=>{
  const s=trip();assert.notDeepEqual(s.from,s.to);s.from.placeId='changed';assert.equal(from.placeId,'prefecture');
  assert.throws(()=>begin(from,from,30));
});
test('candidate interrupted and restored journey charges remaining time only',()=>{
  const first=advance(trip(),11),s=restore(JSON.stringify(first));
  const last=advance(s,30);assert.equal(last.spentDays,30);assert.equal(last.status,'arrived');
  assert.equal(first.progressDays,11);assert.deepEqual(advance(last,9),last);
});
test('candidate cancellation before departure spends no invented return days',()=>{
  const s=turnBack(trip());assert.equal(s.status,'returned');assert.equal(s.spentDays,0);
});
test('candidate return uses elapsed distance, not half of remaining distance',()=>{
  const s=advance(turnBack(advance(trip(),11)),30);
  assert.equal(s.spentDays,22);assert.equal(s.progressDays,0);assert.equal(s.status,'returned');
});
test('candidate event delay ages player without moving along route',()=>{
  const s=advance(advance(trip(),11),7,{delay:true});
  assert.equal(s.progressDays,11);assert.equal(s.spentDays,18);
  assert.equal(advance(turnBack(s),11).spentDays,29);
});
test('candidate death never reports arrival or spends more time later',()=>{
  const s=advance(trip(),30,{died:true});assert.equal(s.status,'dead');
  assert.deepEqual(advance(s,20),s);assert.deepEqual(turnBack(s),s);
});
test('candidate restore rejects impossible progress and status',()=>{
  for(const patch of [{progressDays:31},{progressDays:1},{spentDays:-1},{status:'arrived'},
    {status:'teleport'},{totalDays:0},{from:{placeId:'prefecture'}}])
    assert.throws(()=>restore(JSON.stringify({...trip(),...patch})));
});
