const {test}=require('node:test');
const assert=require('node:assert/strict');
const {loadGame}=require('./staff53-check.cjs');
function game(){const g=loadGame();g.run("XTDeveloper47.scenario('寒门散修');G.place=G.home;G.family=[{alive:true}];G.age=7;");return g;}
test('unbound birth, marriage and debt events cannot enter the event pool',()=>{const g=game();for(const id of ['H03','H04','H09'])assert.equal(g.run(`EVENTS.find(e=>e.id==='${id}').cond(G)`),false,id);});
test('adult household scripts reject childhood and unknown ages',()=>{const g=game();for(const age of ['7','17','NaN'])for(const id of ['H01','H02','H05','H07','H08'])assert.equal(g.run(`G.age=${age};EVENTS.find(e=>e.id==='${id}').cond(G)`),false,id);});
test('stale unmarked event objects cannot bypass retirement or charge money',()=>{const g=game();const before=g.run('G.stones');assert.equal(g.run("applyOption({...EVENTS.find(e=>e.id==='H09'),retired36:false},0)"),null);assert.equal(g.run('G.stones'),before);});
test('household event rechecks age before entry and settlement',()=>{const g=game();g.run("startEvent(EVENTS.find(e=>e.id==='H01'))");assert.notEqual(g.run('G.mode'),'event');const before=g.run('G.stones');assert.equal(g.run("applyOption(EVENTS.find(e=>e.id==='H01'),0)"),null);assert.equal(g.run('G.stones'),before);});
test('eligible adult household event still works and cooldown prevents duplicate reward',()=>{const g=game();g.run("G.age=18;startEvent(EVENTS.find(e=>e.id==='H01'))");assert.equal(g.run('G.mode'),'event');assert.ok(g.run("applyOption(EVENTS.find(e=>e.id==='H01'),0)"));assert.equal(g.run("applyOption(EVENTS.find(e=>e.id==='H01'),0)"),null);});
