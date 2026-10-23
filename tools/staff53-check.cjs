// Headless logic checks: real game scripts, minimal DOM/storage adapters.
// This is not browser layout or mobile-device verification.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),{test}=require('node:test');
const root=path.resolve(__dirname,'..');
function loadGame(){
 const nodes=new Map();
 function node(){return {value:'',checked:false,innerHTML:'',textContent:'',style:{setProperty(){}},dataset:{},classList:{add(){},remove(){},toggle(){},contains(){return false}},addEventListener(){},appendChild(){},after(){},before(){},append(){},prepend(){},insertAdjacentHTML(position,html){this.innerHTML+=html},remove(){},focus(){},close(){},showModal(){},scrollIntoView(){},closest(){return null},setAttribute(){},getAttribute(){return ''},querySelectorAll(){return []},querySelector(){return node()},getBoundingClientRect(){return {width:400,height:600,left:0,top:0}},getContext(){return null}};}
 const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),clear:()=>m.clear()};};
 const ctx=vm.createContext({console,URLSearchParams,URL,structuredClone,TextEncoder,TextDecoder,
  setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},requestAnimationFrame:()=>0,cancelAnimationFrame(){},
  localStorage:storage(),sessionStorage:storage(),location:{search:'?developer=1',href:'http://localhost/prototype/index.html?developer=1'},
  navigator:{userAgent:'logic-test'},performance:{now:()=>0},confirm:()=>true,alert(){},innerWidth:400,innerHeight:800,
  document:{body:node(),documentElement:node(),getElementById(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)},querySelector(){return node()},querySelectorAll(){return []},createElement:node,addEventListener(){}}
 });
 ctx.window=ctx;ctx.globalThis=ctx;ctx.addEventListener=()=>{};ctx.matchMedia=()=>({matches:false,addEventListener(){}});
 const html=fs.readFileSync(path.join(root,'prototype/index.html'),'utf8');
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
  const src=m[1].match(/src=["']([^"']+)["']/);
  vm.runInContext(src?fs.readFileSync(path.join(root,'prototype',src[1]),'utf8'):m[2],ctx,{filename:src?src[1]:'prototype/index.html',timeout:10000});
 }
 return {ctx,run:code=>vm.runInContext(code,ctx,{timeout:10000})};
}

test('game scripts load and existing developer scenario starts',()=>{
 const game=loadGame();
 assert.equal(game.run("XTDeveloper47.scenario('寒门散修');G.mode"),'idle');
});

module.exports={loadGame};

function fixture(){
 const game=loadGame();
 game.run(`XTDeveloper47.scenario('寒门散修');tryEvent=()=>null;meetLive=()=>null;tryRoadEvent=()=>null;pickRetreatEvent=()=>null;
 economyFactor=()=>1;G.realm=0;G.layer=4;G.mode='idle';G.lastResult=null;G.stones=3000;
 G.place='county';XTSandbox.state().roomAt='county';XTSandbox.state().room='agency';XTWorld36.sync();
 XTSandbox.dispatch('buyProperty','courtyard');`);
 return game;
}
function hire(game,id='lin'){
 game.run(`G.place='county';XTSandbox.state().roomAt='county';XTSandbox.state().room='agency';XTWorld36.sync();XTSandbox.dispatch('hire','${id}');`);
}
function heir(game){
 game.run(`const w53=XTWorld36.world();w53.people.child53={id:'child53',name:'沈承行',realm:0,layer:1,root:'五灵根',birth:XTSandbox.now()-8*360,life:100,alive:true,place:'county',room:'home',sex:'男',parents:[w53.playerId,'N04'],source:'受控测试中已出生八年的后人'};w53.children.push('child53');G.mode='dead';XTSandbox.dispatch('r36:inherit','child53');`);
}

test('same-realm recruitment uses existing fee and cannot duplicate payment',()=>{
 const game=fixture();const before=game.run('G.stones');hire(game);
 assert.equal(game.run('XTSandbox.state().staff.length'),1);
 assert.equal(game.run('G.stones'),before-30);
 const after=game.run('G.stones');hire(game);
 assert.equal(game.run('G.stones'),after);
 assert.equal(game.run('XTSandbox.state().staff.length'),1);
});

test('same-realm employee can finish a paid assignment exactly once',()=>{
 const game=fixture();game.run('G.realm=2');hire(game);game.run('G.realm=0');
 game.run("XTSandbox.dispatch('assign','lin:gather');");
 assert.equal(game.run('XTSandbox.state().staff[0]?.job?.type'),'gather');
 game.run("advanceDays(30,{act:'test53',rate:0,incomeMul:0,eventRate:0});");
 assert.equal(game.run('XTSandbox.state().warehouse.herb'),4);
 game.run('XTSandbox.tick();XTSandbox.tick();');
 assert.equal(game.run('XTSandbox.state().warehouse.herb'),4);
});

test('existing higher-realm employee is not stopped by a weaker employer',()=>{
 const game=fixture();game.run('G.realm=2');hire(game);
 game.run("XTSandbox.state().staff[0].realm=1;XTWorld36.get('lin').realm=1;G.realm=0;XTSandbox.dispatch('assign','lin:gather');");
 assert.equal(game.run('XTSandbox.state().staff[0]?.job?.type'),'gather');
 game.run("advanceDays(30,{act:'test53',rate:0,incomeMul:0,eventRate:0});");
 assert.equal(game.run('XTSandbox.state().warehouse.herb'),4);
});

test('already-paid work completes if employer realm falls while waiting',()=>{
 const game=fixture();game.run('G.realm=2');hire(game);
 game.run("XTSandbox.dispatch('assign','lin:gather');G.realm=0;advanceDays(30,{act:'test53',rate:0,incomeMul:0,eventRate:0});");
 assert.equal(game.run('XTSandbox.state().warehouse.herb'),4);
});

test('estate employment preserves employee identity, arrears and paid work for a weaker heir',()=>{
 const game=fixture();game.run('G.realm=2');hire(game);
 game.run("XTSandbox.dispatch('assign','lin:gather');XTSandbox.state().staff[0].arrears=1;globalThis.beforeStaff53=JSON.stringify(XTSandbox.state().staff);globalThis.beforeBorn53=XTWorld36.get('lin').birth;");
 heir(game);
 assert.equal(game.run('G.world36.playerId'),'child53');
 assert.equal(game.run('G.realm'),0);
 assert.equal(game.run('JSON.stringify(XTSandbox.state().staff)'),game.run('beforeStaff53'));
 assert.equal(game.run("XTWorld36.get('lin').birth"),game.run('beforeBorn53'));
 assert.equal(game.run("XTWorld36.get('lin').room"),'home');
});

test('inherited job and wages survive actual save/restore without duplicate reward',()=>{
 const game=fixture();game.run('G.realm=2');hire(game);
 game.run("XTSandbox.dispatch('assign','lin:gather');");heir(game);
 game.run('save();globalThis.saved53=localStorage.getItem(SAVE_KEY);');
 assert.equal(game.run('restore(saved53)'),true);
 assert.equal(game.run('restore(saved53)'),true);
 game.run("advanceDays(30,{act:'test53',rate:0,incomeMul:0,eventRate:0});save();globalThis.completed53=localStorage.getItem(SAVE_KEY);restore(completed53);restore(completed53);");
 assert.equal(game.run('XTSandbox.state().warehouse.herb'),4);
 assert.equal(game.run('XTSandbox.state().staff.length'),1);
});

test('new unrelated game never inherits previous employees',()=>{
 const game=fixture();game.run('G.realm=2');hire(game);
 game.run("newGame('新来客','寒门散修','男');");
 assert.equal(game.run('XTSandbox.state().staff.length'),0);
 assert.equal(game.run('XTSandbox.state().property'),null);
});

test('remote recruitment and full homes still reject without charging',()=>{
 const game=fixture();game.run("G.place='ridge';globalThis.money53=G.stones;XTSandbox.dispatch('hire','an');");
 assert.equal(game.run('G.stones'),game.run('money53'));
 assert.equal(game.run('XTSandbox.state().staff.length'),0);
 game.run("G.place='county';XTSandbox.state().roomAt='county';XTSandbox.state().room='agency';XTSandbox.state().property.type='rental';");
 hire(game,'an');hire(game,'qiao');const cash=game.run('G.stones');hire(game);
 assert.equal(game.run('XTSandbox.state().staff.length'),2);
 assert.equal(game.run('G.stones'),cash);
});

test('unpaid and dead employees retain existing consequences',()=>{
 const game=fixture();hire(game,'an');game.run('G.stones=0');
 game.run("advanceDays(90,{act:'test53',rate:0,incomeMul:0,eventRate:0});");
 assert.equal(game.run('XTSandbox.state().staff.length'),0);
 const dead=fixture();hire(dead,'an');
 dead.run("XTWorld36.get('an').birth=XTSandbox.now()-100*360;XTWorld36.sync();");
 assert.equal(dead.run('XTSandbox.state().staff.length'),0);
});

test('employee details use actual person age and expose pay without advancing state',()=>{
 const game=fixture();hire(game);
 game.run("const worker54=XTSandbox.state().staff[0];worker54.born=XTSandbox.now()-18*360;XTWorld36.get('lin').birth=XTSandbox.now()-27*360-12;worker54.arrears=2;worker54.nextWage=XTSandbox.now()+11;XTSandbox.go('home','staff');");
 const before=game.run('JSON.stringify({day:XTSandbox.now(),stones:G.stones,staff:XTSandbox.state().staff,warehouse:XTSandbox.state().warehouse})');
 game.run("XTSandbox.dispatch('selectWorker','lin');XTSandbox.dispatch('selectWorker','lin');");
 const html=game.run("document.getElementById('scene').innerHTML");
 assert.match(html,/年龄 27岁12日/);assert.match(html,/寿限 100岁/);assert.match(html,/欠薪 2个月/);assert.match(html,/下次发薪 11日后/);assert.match(html,/产业雇佣/);
 assert.equal(game.run('JSON.stringify({day:XTSandbox.now(),stones:G.stones,staff:XTSandbox.state().staff,warehouse:XTSandbox.state().warehouse})'),before);
});

test('real legacy person birth falls back to saved employee birth without removing them',()=>{
 const game=fixture();hire(game);
 game.run("XTWorld36.get('lin').birth=null;XTSandbox.state().staff[0].born=XTSandbox.now()-22*360-5;XTSandbox.go('home','staff');XTSandbox.dispatch('selectWorker','lin');");
 assert.equal(game.run('XTSandbox.state().staff.length'),1);
 assert.match(game.run("document.getElementById('scene').innerHTML"),/年龄 22岁5日/);
 assert.equal(game.run("XTWorld36.get('lin').birth"),game.run('XTSandbox.state().staff[0].born'));
});

test('real missing birth stays unknown across rendering, time and save restore',()=>{
 const game=fixture();hire(game);
 game.run("delete XTWorld36.get('lin').birth;XTSandbox.state().staff[0].born=null;XTSandbox.state().staff[0].nextWage=XTSandbox.now();XTSandbox.go('home','staff');XTSandbox.dispatch('selectWorker','lin');");
 assert.equal(game.run('XTSandbox.state().staff.length'),1);
 const html=game.run("document.getElementById('scene').innerHTML");
 assert.match(html,/年龄 未核定/);assert.match(html,/下次发薪 已到期/);assert.doesNotMatch(html,/NaN|Infinity/);
 game.run("advanceDays(1,{act:'test54',rate:0,incomeMul:0,eventRate:0});save();restore(localStorage.getItem(SAVE_KEY));XTSandbox.go('home','staff');XTSandbox.dispatch('selectWorker','lin');");
 assert.equal(game.run('XTSandbox.state().staff.length'),1);
 assert.match(game.run("document.getElementById('scene').innerHTML"),/年龄 未核定/);
 assert.equal(game.run("XTWorld36.get('lin').alive"),true);
});
