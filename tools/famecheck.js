/* famecheck.js —— 名声/身份（F2）专项回归
   验证：G.fame 三圈档位、addFame 封顶、fameReach 跨地点规则（名气大走得远、名气小只在本地）、
   fameText 软提示、上门事件 E054–E057 的 cond 门槛。 */
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

const HOOK = ';globalThis.__A={get G(){return G;},set G(v){G=v;},EVENTS,ROUTES,addFame,fameReach,fameText,fameInit,isAdjacent,FAME_CIRCLES};';
new Function('document','localStorage','confirm','alert','window','Math','console', SRC + HOOK)(
  documentStub, ls, ()=>true, ()=>{}, win, Object.create(Math), { log(){}, error(){}, warn(){} });
const A = globalThis.__A;

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  x ' + m); } };

/* 1. fameInit 三圈，初始 0/null */
const fi = A.fameInit();
ok(Object.keys(fi).length === 3, 'fameInit 三圈');
ok(['修士','凡人','本地'].every(c => fi[c] && fi[c].v === 0 && fi[c].at === null), 'fameInit 初始 0/null');

/* 2. addFame 涨档 + 封顶 2 */
const s1 = { fame: A.fameInit() };
A.addFame(s1, '修士', 'temple', 1);
ok(s1.fame['修士'].v === 1 && s1.fame['修士'].at === 'temple', 'addFame 修士+1 记打响处 temple');
A.addFame(s1, '修士', 'temple', 1); A.addFame(s1, '修士', 'temple', 1);
ok(s1.fame['修士'].v === 2, 'addFame 封顶 2');

/* 3. fameReach：档 2 本处满档、相邻处有一名 */
ok(A.fameReach(s1, '修士', 'temple') === 2, '档2 打响处 = 2');
const adjT = A.ROUTES.filter(r => r.a === 'temple' || r.b === 'temple').map(r => r.a === 'temple' ? r.b : r.a);
adjT.forEach(p => ok(A.fameReach(s1, '修士', p) === 1, '档2 相邻处 ' + p + ' = 1'));

/* 4. fameReach：档 1 只在打响处，相邻处无名 ——「名气小，就只在本地」 */
const s2 = { fame: A.fameInit() };
A.addFame(s2, '凡人', 'village', 1);
ok(A.fameReach(s2, '凡人', 'village') === 1, '档1 打响处 = 1');
const adjV = A.ROUTES.filter(r => r.a === 'village' || r.b === 'village').map(r => r.a === 'village' ? r.b : r.a);
adjV.forEach(p => ok(A.fameReach(s2, '凡人', p) === 0, '档1 相邻处 ' + p + ' = 0'));

/* 5. 无名 / 无档 reach = 0 */
ok(A.fameReach({ fame: A.fameInit() }, '修士', 'temple') === 0, '无名 reach = 0');
ok(A.fameReach(s2, '修士', 'village') === 0, '别的圈子 reach = 0（不串圈）');

/* 6. fameText 软提示 */
ok(A.fameText({ fame: A.fameInit() }) === '', 'fameText 无名 = 空');
const s6 = { fame: A.fameInit() }; A.addFame(s6, '修士', 'temple', 1);
ok(A.fameText(s6).indexOf('修士') >= 0, 'fameText 有修士名');

/* 7. 上门事件 E054–E057 四条，cond 门槛 */
const evs = A.EVENTS.filter(e => e.id >= 'E054' && e.id <= 'E057');
ok(evs.length === 4, '上门事件 4 条 E054–E057');
ok(evs.every(e => e.cond({ fame: A.fameInit() }) === false), '无名时上门事件 cond 全假');

const s3 = { fame: A.fameInit() }; A.addFame(s3, '修士', 'temple', 1);
ok(A.EVENTS.find(e => e.id === 'E054').cond(s3) === true, '修士有名 → E054 真');
ok(A.EVENTS.find(e => e.id === 'E055').cond(s3) === false, '修士有名，E055(凡人) 仍假');

const s4 = { fame: A.fameInit() }; A.addFame(s4, '凡人', 'village', 1);
ok(A.EVENTS.find(e => e.id === 'E055').cond(s4) === true, '凡人有名 → E055 真');
ok(A.EVENTS.find(e => e.id === 'E054').cond(s4) === false, '凡人有名，E054(修士) 仍假');

const s5 = { fame: A.fameInit() }; A.addFame(s5, '本地', 'market', 1);
ok(A.EVENTS.find(e => e.id === 'E056').cond(s5) === true, '本地有名(market) → E056 真');
ok(A.EVENTS.find(e => e.id === 'E057').cond(s5) === false, '本地有名(market)，E057(county) 仍假');

console.log('\n全部通过：' + pass + ' 项' + (fail ? '　失败 ' + fail + ' 项' : ''));
process.exit(fail ? 1 : 0);
