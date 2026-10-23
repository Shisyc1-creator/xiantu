/* 界面状态自检：不装浏览器，直接跑渲染函数，查按钮与文案。
   node tools/uicheck.js */
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

const HOOK = `;globalThis.__ui = { get G(){return G;}, set G(v){G=v;},
  CFG, ROOTS, newGame, chooseChild, beginCultivation, tickYear, stepYear, render,
  renderActions, renderHUD, renderScene, canBreak, needOf, gainCult };`;

new Function('document', 'localStorage', 'confirm', 'alert', 'window', 'Math', 'console', SRC + HOOK)(
  documentStub, ls, () => true, () => {}, win, Object.create(Math), { log() {}, error() {}, warn() {} });

const A = globalThis.__ui;
let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; console.log('  ✓ ' + msg); } else { fail++; console.log('  ✗ ' + msg); } };

/* 开局，测灵，入道 */
A.newGame('自检', '寒门散修');
A.chooseChild(0);
A.beginCultivation();
const G = A.G;
console.log('开局：' + G.age + ' 岁，炼气' + G.layer + '层，' + G.root);

/* 入道后停在结果页，行动按钮不渲染；自检要从「能动」的状态开始 */
const show = () => { G.mode = 'idle'; G.lastResult = null; A.render(); };

/* 1. 冲到圆满 */
G.layer = A.CFG.layerCount;
G.cult = A.needOf(A.CFG.layerCount);
show();
ok(A.canBreak(), '修为满时可以冲关');
ok(/btnBreak/.test(els.actions.innerHTML), '满修时出现「冲击筑基」按钮');
ok(/btnRetreat/.test(els.actions.innerHTML) === false, '满修时不再提示闭关（闭关无用）');

/* 2. 手动制造一次冲关失败后的状态 */
G.cult = Math.floor(A.needOf(A.CFG.layerCount) * 0.75);
G.injured = 3;
show();
ok(!A.canBreak(), '冲关失败后不能再冲（修为不够）');
ok(/btnRetreat/.test(els.actions.innerHTML), '冲关失败后仍有「闭关」按钮——能补修');
ok(/btnBreak/.test(els.actions.innerHTML) === false, '补修未满时不出现冲关按钮');
ok(/补修/.test(els.scene.innerHTML), '场景文案说明「还得补」');

/* 3. 补修一年确实涨修为 */
const before = G.cult;
A.tickYear({ act: 'walk' });
ok(G.cult > before, '行走一年后修为回升：' + before + ' → ' + Math.floor(G.cult));

/* 4. 补满后可以再冲 */
G.cult = A.needOf(A.CFG.layerCount);
show();
ok(A.canBreak(), '补满后重新可以冲关');

/* 5. 寿元将尽：设计上允许孤注一掷。冲关不推进年龄，
      失败也只扣 3 年且 lifespan 兜底到 age+1，所以不该禁掉按钮 */
G.lifespan = G.age + 1;
show();
ok(/btnBreak/.test(els.actions.innerHTML), '寿元将尽仍可冲关（孤注一掷，失败不致死）');

console.log('\n' + (fail ? '✗ ' + fail + ' 项未通过' : '全部通过') + '　（' + pass + ' 项）');
process.exit(fail ? 1 : 0);
