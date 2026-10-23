/* relcheck.js —— 后果链（F1）专项回归
   验证：G.rel 关系账本、pendingRel 分类、relDisp 显示、后果事件 E050–E053 的 cond/dyn/place。 */
const fs = require('fs');
const html = fs.readFileSync('prototype/index.html', 'utf8');
const SRC = html.match(/<script>([\s\S]*)<\/script>/)[1];

function mkEl(id){ return { id, innerHTML:'', textContent:'', value:'', style:{}, dataset:{},
  classList:{ add(){}, remove(){}, toggle(){}, contains(){ return false; } },
  querySelectorAll(){ return []; }, querySelector(){ return null; }, addEventListener(){},
  appendChild(){}, remove(){}, onclick:null }; }
const els = {};
const documentStub = { body:{ classList:{ add(){}, remove(){}, toggle(){}, contains(){ return false; } } },
  getElementById(id){ return els[id] || (els[id] = mkEl(id)); } };
const store = {};
const ls = { getItem:k=>(k in store?store[k]:null), setItem:(k,v)=>{ store[k]=String(v); }, removeItem:k=>{ delete store[k]; } };
const win = { localStorage:ls, addEventListener(){} };

const HOOK = ';globalThis.__A={get G(){return G;},set G(v){G=v;},newGame,chooseChild,beginCultivation,rel,pendingRel,relDisp,relName,EVENTS,NPCS};';
new Function('document','localStorage','confirm','alert','window','Math','console', SRC + HOOK)(
  documentStub, ls, ()=>true, ()=>{}, win, Object.create(Math), { log(){}, error(){}, warn(){} });
const A = globalThis.__A;

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  x ' + m); } };

A.newGame('测','寒门散修'); A.chooseChild(0); A.beginCultivation();

/* 1. rel 写关系 */
A.rel(A.G, '李师兄', 2, '借过灵石', '李师兄');
ok(A.G.rel['李师兄'].v === 2 && A.G.rel['李师兄'].name === '李师兄', 'rel 写恩');

/* 2. pendingRel 分类 */
ok(A.pendingRel(A.G,'恩').length === 1 && A.pendingRel(A.G,'恩')[0].nid === '李师兄', 'pendingRel 恩');
ok(A.pendingRel(A.G,'怨').length === 0, 'pendingRel 怨为空');
A.rel(A.G, '严九', -2, '打伤了劫修', '严九');
ok(A.pendingRel(A.G,'怨').length === 1 && A.pendingRel(A.G,'怨')[0].v === -2, 'pendingRel 怨');

/* 3. relDisp */
ok(A.relDisp(A.pendingRel(A.G,'恩')[0]) === '李师兄', 'relDisp 恩名');
ok(A.relDisp(A.pendingRel(A.G,'怨')[0]) === '严九', 'relDisp 怨名');
ok(A.relDisp(undefined) === '故人', 'relDisp 空安全');

/* 4. 后果事件 cond */
const e50 = A.EVENTS.find(x=>x.id==='E050');
const e52 = A.EVENTS.find(x=>x.id==='E052');
ok(e50.cond(A.G) === true, 'E050 有恩可触发');
ok(e52.cond(A.G) === true, 'E052 有怨可触发');
A.G.rel = {};
ok(e50.cond(A.G) === false, 'E050 无恩不可触发');
ok(e52.cond(A.G) === false, 'E052 无怨不可触发');

/* 5. dyn 动态文本 */
A.rel(A.G, '李师兄', 2, '借过灵石', '李师兄');
const t = A.EVENTS.find(x=>x.id==='E050').dyn(A.G);
ok(t.includes('李师兄') && t.includes('借过灵石'), 'E050 dyn 填名字+缘由');

/* 6. 后果事件有 place（走世事层，可错过） */
['E050','E051','E052','E053'].forEach(id=>{
  const e = A.EVENTS.find(x=>x.id===id);
  ok(e.place && e.place !== 'any', id + ' 有地点');
});

/* 7. 清账 */
A.rel(A.G, '李师兄', -2, '');
ok(!A.G.rel['李师兄'], '恩还清后删账');

console.log(fail === 0 ? ('全部通过：' + pass + ' 项') : ('通过 ' + pass + ' 项，失败 ' + fail + ' 项'));
process.exit(fail ? 1 : 0);
