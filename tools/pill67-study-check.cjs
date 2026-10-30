'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {candidate,pillRate,production,fundDays}=require('./pill67-study.cjs');
test('one pill replaces old capped modifier without changing no-pill rates',()=>{
  for(const modifier of [-.19,-.04,0,.04,.1,.9]){
    assert.equal(pillRate(.62,modifier,false),Math.max(.05,Math.min(.95,.62*(1+modifier))));
    assert.equal(pillRate(.62,modifier,true),Math.max(.05,Math.min(.95,.62*(1+modifier+.20))));
  }
});
test('production counts per-attempt material/fire and success-only commission',()=>{
  const p=production(5);assert.equal(p.materials,96);assert.equal(p.fire,30);
  assert.equal(p.commissionExpected,187.5);assert.equal(p.selfExpected,126/.55);
  assert.equal(production(10).selfExpected,168);assert.throws(()=>production(4));
  assert.ok(Math.abs(p.selfThreeFailures-.091125)<1e-10);
});
test('funding includes both road directions, rounds whole gathering cycles',()=>{
  assert.deepEqual(fundDays(240,4),{cycles:30,days:270,gross:240});
  assert.deepEqual(fundDays(241,4),{cycles:31,days:279,gross:248});
  assert.throws(()=>fundDays(240,0));
});
test('finite first batch is not misrepresented as infinite expected production',()=>{
  assert.equal(candidate.materialStock,3);assert.equal(candidate.finishedStock,2);
  assert.equal(candidate.furnaceSlots,1);assert.equal('refreshDays' in candidate,false);
  const p=production(5);assert.ok(p.selfFirstThreeExpectedPills<3);
  assert.ok(p.commissionThreeFailures>0);
});
