/* 事件体检：把每条事件的每个选项都真跑一遍，查结构、查文案、查残留地名。
   node tools/eventcheck.js
   事件要涨到 50 条以上，手查不过来了，这个脚本每次改完都跑一下。 */
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

const HOOK = `;globalThis.__ev = { get G(){return G;}, set G(v){G=v;},
  CFG, EVENTS, ROAD_EVENTS, FATE_POOL, DYN_FATE, fillFate, genFate, newGame, chooseChild, beginCultivation };`;

new Function('document', 'localStorage', 'confirm', 'alert', 'window', 'Math', 'console', SRC + HOOK)(
  documentStub, ls, () => true, () => {}, win, Object.create(Math), { log() {}, error() {}, warn() {} });

const A = globalThis.__ev;
const ALL = A.EVENTS.concat(A.ROAD_EVENTS);

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log('  ✗ ' + msg); } };

A.newGame('体检', '寒门散修');
A.chooseChild(0);
A.beginCultivation();

function stub() {
  return {
    name: '体检', origin: '寒门散修', variant: null, variantIdx: 0,
    root: '四灵根', coef: 0.95, cap: 3, mark: '', fate: A.genFate(),
    age: 30, lifespan: 100, layer: 5, cult: 500, stones: 100,
    attr: { gen: 5, wu: 5, qi: 5, xin: 5 },
    karma: 0, injured: 0, renown: 0, debt: null,
    buff: {}, flag: {}, ward: false, hasMate: false, mateRoot: null,
    beast: null, ally: null, generation: 1, ancestors: [],
    eventsDone: {}, evtCd: {}, evtCount: 0, deaths: 0,
    /* 后果事件（E050–E053）的 run 要读关系，给 stub 备一恩一怨，让它能跑通 */
    rel: { '李师兄': { v: 2, note: '借过灵石', name: '李师兄', at: 30 },
           '严九':   { v: -2, note: '打伤了劫修', name: '严九', at: 30 } }
  };
}

/* 1. id 唯一 */
const seen = {};
for (const ev of ALL) {
  ok(!seen[ev.id], 'id 重复：' + ev.id);
  seen[ev.id] = 1;
}

/* 2. 结构 + 3. 每个分支真跑 */
const FATE_WORDS = [].concat(...Object.values(A.FATE_POOL));
let opts = 0;

for (const ev of ALL) {
  const tag = ev.id + ' ' + (ev.name || '（无名）');
  ok(!!ev.name, tag + '：缺 name');
  ok(typeof ev.text === 'string' && ev.text.length > 10, tag + '：text 太短');
  ok(Array.isArray(ev.opts) && ev.opts.length >= 2 && ev.opts.length <= 4, tag + '：选项数应为 2–4');
  ok(typeof ev.w === 'number', tag + '：缺权重 w');

  /* 2b. 文案里不该出现随机池里的具体地名，否则会和开局的身世打架 */
  for (const word of FATE_WORDS) {
    if (ev.text.includes(word)) { fail++; console.log('  ✗ ' + tag + '：正文写死了随机地名「' + word + '」，应改用 {乡}/{观} 之类的占位'); }
  }

  (ev.opts || []).forEach((o, i) => {
    opts++;
    const at = tag + ' 选项' + (i + 1);
    ok(typeof o.l === 'string' && o.l.length > 0, at + '：缺文案 l');
    ok(o.cost == null || typeof o.cost === 'number', at + '：cost 不是数字');

    const hasRun = typeof o.run === 'function';
    const hasChance = typeof o.chance === 'function';
    ok(hasRun !== hasChance, at + '：run 与 chance 必须二选一');
    if (hasChance) {
      ok(typeof o.ok === 'function' && typeof o.no === 'function', at + '：有 chance 就必须同时有 ok 和 no');
    }

    const branches = hasChance ? [['成功', o.ok], ['失败', o.no]] : [['', o.run]];
    for (const [label, fn] of branches) {
      const s = stub();
      let r;
      try { r = fn(s); } catch (e) { fail++; console.log('  ✗ ' + at + ' ' + label + '：跑出错　' + e.message); continue; }
      ok(r && typeof r.t === 'string' && r.t.length > 0, at + ' ' + label + '：没有返回 { t }');
      ok(r && typeof r.log === 'string' && r.log.length > 0, at + ' ' + label + '：没有返回 { log }');
      if (r && typeof r.t === 'string') {
        for (const word of FATE_WORDS) {
          if (r.t.includes(word)) { fail++; console.log('  ✗ ' + at + ' ' + label + '：结果里写死了「' + word + '」'); }
        }
      }
    }
  });

  /* 4. 未知占位符 */
  if (Array.isArray(ev.opts)) {
    const fake = stub();
    const before = ev;
    const tokens = (ev.text.match(/\{([^{}]+)\}/g) || []).map(x => x.slice(1, -1));
    for (const k of tokens) ok(k in A.FATE_POOL || A.DYN_FATE.includes(k), tag + '：正文里有未知占位 {' + k + '}');
  }
}

/* 5. 占位替换真的生效 */
A.G.fate = { 乡: '落雁村', 观: '白鹤观' };
const filled = A.fillFate('{乡}的{观}，还有一个{怪}');
ok(filled === '落雁村的 白鹤观，还有一个{怪}'.replace('的 ', '的'), '占位替换不对：' + filled);

console.log('');
console.log('事件 ' + ALL.length + ' 条（路上 ' + A.ROAD_EVENTS.length + ' 条），选项 ' + opts + ' 个');
console.log(fail === 0 ? '全部通过：' + pass + ' 项' : '通过 ' + pass + ' 项，失败 ' + fail + ' 项');
process.exit(fail === 0 ? 0 : 1);
