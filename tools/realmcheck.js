/* 境界体检：校验 REALMS 九境表与总表「境界总表」一致，以及境界抽象函数在炼气段的正确性。
   node tools/realmcheck.js
   阶段 A 起，每次动 REALMS 或抽象函数后都跑一下。 */
const fs = require('fs'), path = require('path');
const FILE = path.resolve(__dirname, '..', 'prototype', 'index.html');
const html = fs.readFileSync(FILE, 'utf8');
const SRC = html.match(/<script>([\s\S]*)<\/script>/)[1];

function mkEl(id) {
  return { id, innerHTML: '', textContent: '', value: '', style: {}, dataset: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    querySelectorAll() { return []; }, querySelector() { return null; },
    addEventListener() {}, appendChild() {}, remove() {}, onclick: null };
}
const els = {};
const documentStub = {
  body: { classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } } },
  getElementById(id) { return els[id] || (els[id] = mkEl(id)); }
};
const store = {};
const ls = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
const win = { localStorage: ls, addEventListener() {} };

const HOOK = ';globalThis.__A={get G(){return G;},set G(v){G=v;},REALMS,REALM_NAMES,needOf,realmNeed,realmInfo,realmLayerCount,realmLife,realmFull,realmBrim,realmOf,realmLayerName,LAYER_NEED,CFG,nextRealmIdx,nextBtBase,canBreak,doBreak,curRealmTxt,objRealmTxt,realmFullNeed,newGame,chooseChild,beginCultivation};';
new Function('document', 'localStorage', 'confirm', 'alert', 'window', 'Math', 'console', SRC + HOOK)(
  documentStub, ls, () => true, () => {}, win, Object.create(Math), { log() {}, error() {}, warn() {} });

const A = globalThis.__A;
let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log('  ✗ ' + msg); } };

/* 1. 九境齐全 */
ok(A.REALMS.length === 9, '九境齐全');
/* 2. 每境层数照搬总表：炼气13 + 其余各4 + 渡劫9 */
const expect = [13, 4, 4, 4, 4, 4, 4, 4, 9];
A.REALMS.forEach((r, i) => ok(r.layers.length === expect[i], '层数 ' + r.name + ' = ' + expect[i]));

/* 3. 炼气需求 123 / 1335 / 6846（与 CFG.totalNeed + layerRatio 生成的一致） */
ok(A.REALMS[0].layers[0] === 123, '炼气首层 123');
ok(A.REALMS[0].layers[12] === 1335, '炼气末层 1335');
ok(A.REALMS[0].layers.reduce((a, b) => a + b, 0) === 6846, '炼气合计 6846');

/* 4. needOf 炼气段 === LAYER_NEED（阶段 A 行为不变的回归门槛） */
let s1 = true; for (let i = 1; i <= 13; i++) if (A.needOf(i) !== A.LAYER_NEED[i - 1]) s1 = false;
ok(s1, 'needOf 炼气段与 LAYER_NEED 逐位一致');

/* 5. realmNeed(0) === needOf */
let s2 = true; for (let i = 1; i <= 13; i++) if (A.realmNeed(0, i) !== A.needOf(i)) s2 = false;
ok(s2, 'realmNeed(0) 与 needOf 一致');

/* 6. 寿元序列 */
ok(A.REALMS.map(r => r.life).join(',') === '100,200,400,800,1500,3000,6000,10000,10000', '寿元序列');

/* 7. 突破基础成功率首末（炼气90%→66%，渡劫末重21%） */
ok(A.REALMS[0].bt[0] === 0.90, '炼气首阶成功率 90%');
ok(A.REALMS[0].bt[12] === 0.66, '炼气末阶成功率 66%');
ok(A.REALMS[8].bt[8] === 0.21, '渡劫九重成功率 21%');

/* 8. 抽象函数 */
const g = { realm: 0, layer: 13, cult: 6846 };
ok(A.realmOf(g) === 0, 'realmOf=0');
ok(A.realmFull(g) === true, 'realmFull（层满）true');
ok(A.realmBrim(g) === true, 'realmBrim（修为满）true');
ok(A.realmBrim({ realm: 0, layer: 13, cult: 100 }) === false, 'realmBrim 修为不满=false');
ok(A.realmLayerName(0, 5) === '炼气五', '炼气五层名');
ok(A.realmLayerName(1, 3) === '筑基后', '筑基后');
ok(A.realmLayerName(8, 9) === '渡劫九', '渡劫九重');

/* 9. 灵气门槛 */
ok(A.REALMS[1].qiGate === 0.6, '筑基门槛 0.6');
ok(A.REALMS[8].qiGate === 20, '渡劫门槛 20');

/* 10. 脚程 */
ok(A.REALMS[0].pace === 80 && A.REALMS[1].pace === 800, '脚程 炼气80 / 筑基800');

/* 11. 空安全：G 为 null 时抽象函数不崩（主脚本未 newGame，闭包 G 恒 null） */
let nullsafe = true; try { A.needOf(1); A.realmOf(); } catch (e) { nullsafe = false; }
ok(nullsafe, 'G=null 时 needOf/realmOf 不崩');

/* 12. 突破链（阶段 B）：
   用可控随机数分别验证「炼气→筑基」「渡劫九重→飞升」「失败倒退」三条路径。
   Math.random 桩：0.0 恒成功，0.99 恒失败。 */
function mathStub(always) { const m = Object.create(Math); m.random = () => always; return m; }
function fresh(Ac, always) {
  new Function('document', 'localStorage', 'confirm', 'alert', 'window', 'Math', 'console', SRC + HOOK)(
    documentStub, ls, () => true, () => {}, win, mathStub(always), { log() {}, error() {}, warn() {} });
  const X = globalThis.__A;
  X.newGame('测', '寒门散修'); X.chooseChild(0); X.beginCultivation();
  return X;
}
{
  // 12a 炼气圆满 → 突破成功 → 筑基
  const X = fresh(0, 0.0);
  X.G.root = '三灵根'; X.G.coef = 0.97; X.G.cap = 3;
  X.G.realm = 0; X.G.layer = 13; X.G.cult = 6846; X.G.lifespan = 100; X.G.age = 80; X.G.stones = 1000;
  ok(X.canBreak() === true, '炼气圆满 canBreak=true');
  X.doBreak(100);
  ok(X.G.realm === 1 && X.G.layer === 1 && X.G.cult === 0 && X.G.lifespan === 200, '突破成功进入筑基(1/1/0/200)');
  ok(X.G.mode === 'result', '突破成功后 mode=result（非终局）');

  // 12b 渡劫九重圆满 → 突破成功 → 飞升终局
  const Y = fresh(0, 0.0);
  Y.G.root = '天灵根'; Y.G.coef = 1.0; Y.G.cap = 6;
  Y.G.realm = 8; Y.G.layer = 9; Y.G.cult = 22000000; Y.G.lifespan = 10000; Y.G.age = 9000; Y.G.stones = 100000;
  ok(Y.nextRealmIdx() === null, '渡劫后 nextRealmIdx=null（飞升）');
  ok(Y.canBreak() === true, '渡劫九重圆满 canBreak=true');
  Y.doBreak(1000);
  ok(Y.G.mode === 'dead' && Y.G.deathTitle === '飞升', '渡劫九重突破=飞升终局');

  // 12c 炼气圆满 → 突破失败 → 修为倒退、寿元-3
  const Z = fresh(0, 0.99);
  Z.G.root = '三灵根'; Z.G.coef = 0.97; Z.G.cap = 3;
  Z.G.realm = 0; Z.G.layer = 13; Z.G.cult = 6846; Z.G.lifespan = 100; Z.G.age = 80; Z.G.stones = 1000;
  const lp = Z.G.lifespan;
  Z.doBreak(100);
  ok(Z.G.realm === 0 && Z.G.lifespan === lp - 3, '突破失败 realm 不变、寿元 -3');
  ok(Z.G.cult === Math.floor(1335 * 0.75), '突破失败修为退到末层需求×0.75（1001）');
}

console.log('');
console.log(fail === 0 ? '全部通过：' + pass + ' 项' : '通过 ' + pass + ' 项，失败 ' + fail + ' 项');
process.exit(fail === 0 ? 0 : 1);
