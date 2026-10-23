#!/usr/bin/env node
/**
 * 无头模拟器 —— 开发期用来验证数值，不参与游戏本体。
 *
 *   node tools/sim.js                        # 全部出身，每样 400 局
 *   node tools/sim.js --origin=寒门散修 --runs=2000
 *   node tools/sim.js --policy=walk          # smart(默认) | walk | retreat | break0
 *   node tools/sim.js --events=off           # 关掉事件，只看数值底板
 *   node tools/sim.js --seed=42              # 固定随机种子，改数值前后可直接对比
 *   node tools/sim.js --verbose              # 打印一局的逐年流水
 *   node tools/sim.js --file=prototype/index.html
 *
 * 它只调用规则层的 tickYear / applyOption / doBreak 等纯逻辑函数，
 * 渲染层被替换成空壳——所以模拟结果和真人玩到的是同一套规则。
 */
const fs = require('fs');
const path = require('path');

/* ---------- 参数 ---------- */
const argv = process.argv.slice(2);
const arg = (k, d) => {
  const hit = argv.find(a => a === '-' + k || a.startsWith('--' + k + '='));
  if (!hit) return d;
  if (hit.startsWith('--') && hit.includes('=')) return hit.split('=').slice(1).join('=');
  return d;
};
const flag = k => argv.includes('--' + k);

const FILE   = path.resolve(arg('file', path.join(__dirname, '..', 'prototype', 'index.html')));
const RUNS   = parseInt(arg('runs', '400'), 10);
const ORIGIN = arg('origin', 'all');
const POLICY = arg('policy', 'smart');
const EVENTS = arg('events', 'on') !== 'off';
const SEED   = arg('seed', null);
const VERBOSE= flag('verbose');

/* ---------- 载入游戏脚本 ---------- */
if (!fs.existsSync(FILE)) { console.error('找不到文件：' + FILE); process.exit(1); }
const html = fs.readFileSync(FILE, 'utf8');
const m = html.match(/<script>([\s\S]*)<\/script>/);
if (!m) { console.error('文件里没有 <script> 段'); process.exit(1); }
const SRC = m[1];

/* ---------- 假的 DOM ---------- */
function mkEl(id) {
  return {
    id, innerHTML: '', className: '', textContent: '', value: '', style: {}, dataset: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    querySelectorAll() { return []; }, querySelector() { return null; },
    addEventListener() {}, appendChild() {}, remove() {}, onclick: null
  };
}
const els = {};
const documentStub = {
  body: { classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } } },
  getElementById(id) { return els[id] || (els[id] = mkEl(id)); }
};
const store = {};
const localStorageStub = {
  getItem(k) { return k in store ? store[k] : null; },
  setItem(k, v) { store[k] = String(v); },
  removeItem(k) { delete store[k]; }
};
const windowStub = { localStorage: localStorageStub, addEventListener() {} };

/* ---------- 可复现随机 ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(SEED != null ? (parseInt(SEED, 10) >>> 0) : ((Date.now() ^ (Math.random() * 0xffffffff)) >>> 0));
const MathStub = Object.create(Math);
MathStub.random = rng;

/* ---------- 注入 ---------- */
const HARNESS = `
;globalThis.__api = { get G(){return G;}, set G(v){G=v;},
  CFG, ORIGINS, ROOTS, REALM_NAMES, REALMS, EVENTS, CN_NUM,
  newGame, chooseChild, beginCultivation, tickYear, applyOption, doBreak,
  canBreak, breakRate, needOf, yearOutput, retreatEfficiency,
  rollHeirRoot, randMateRoot, TIER_OF, GEN, LAYER_NEED,
  realmBrim, realmFull, realmLayerCount, realmOf, realmLife, realmFullNeed, realmNeed,
  get layerCount(){return CFG.layerCount;} };
`;
let api;
const testHook = HARNESS + `
;(function(){
  const A = globalThis.__api;
  const out = { ok:true };
  return out;
})();
`;

try {
  const fn = new Function('document', 'localStorage', 'confirm', 'alert', 'window', 'Math', 'console', SRC + testHook);
  fn(documentStub, localStorageStub, () => true, () => {}, windowStub, MathStub, { log() {}, error() {}, warn() {} });
  api = globalThis.__api;
} catch (e) {
  console.error('脚本载入失败：' + e.message);
  process.exit(1);
}

const { CFG } = api;

/* ---------- 数值覆盖（不改文件即可做实验） ---------- */
const TUNE = {
  need:     arg('need', null),      // 炼气总需求
  life:     arg('life', null),      // 炼气寿元
  out:      arg('out', null),       // 年产灵气
  bt:       arg('bt', null),        // 筑基基础成功率
  walkIn:   arg('walkin', null),    // 行走年收入
  spread:   arg('spread', null),    // 灵根系数拉开倍数（1=原样，4=把 0.90~1.00 拉成 0.75~1.15）
};
const tuned = [];
for (const [k, cfgKey] of [['need','totalNeed'], ['life','lifespan'], ['out','baseOutput'], ['bt','btBase'], ['walkIn','walkIncome']]) {
  if (TUNE[k] != null) { CFG[cfgKey] = parseFloat(TUNE[k]); tuned.push(cfgKey + '=' + CFG[cfgKey]); }
}
/* 阶段 B 起 newGame 用 realmLife(0)（REALMS[0].life），--life 要一并覆盖它 */
if (TUNE.life != null) { api.REALMS[0].life = parseFloat(TUNE.life); }
/* 层需求表在载入时就算好了，改 totalNeed 要按比例重算 */
if (TUNE.spread != null) {
  const k = parseFloat(TUNE.spread);
  for (const name in api.ROOTS) {
    const r = api.ROOTS[name];
    r.coef = 0.95 + (r.coef - 0.95) * k;
  }
  tuned.push('coef×' + k);
}
if (TUNE.need != null) {
  const A = api.LAYER_NEED;
  const cur = A.reduce((x, y) => x + y, 0);
  const k = CFG.totalNeed / cur;
  for (let i = 0; i < A.length; i++) A[i] = Math.max(1, Math.round(A[i] * k));
  const d = CFG.totalNeed - A.reduce((x, y) => x + y, 0);
  A[A.length - 1] += d;
}

/* ---------- 一局 ---------- */
function pickOptionIndex(ev, stones) {
  const ok = [];
  for (let i = 0; i < ev.opts.length; i++) {
    const o = ev.opts[i];
    if (o.cost && stones < o.cost) continue;
    ok.push(i);
  }
  if (!ok.length) return -1;
  return ok[Math.floor(rng() * ok.length)];
}

function playOne(origin, variantIdx, policy, seed) {
  const A = api;
  A.newGame('sim', origin);
  A.chooseChild(variantIdx);
  A.beginCultivation();
  let G = A.G;
  G.mode = 'idle';

  if (seed) {
    G.root = seed.root;
    G.coef = A.ROOTS[seed.root].coef;
    G.cap = A.ROOTS[seed.root].cap;
    G.stones = seed.stones || 0;
    G.generation = seed.gen || 1;
    if (seed.ancestors) G.ancestors = seed.ancestors;
  }

  const r = {
    origin, root: G.root, variant: G.variant, gen: seed ? seed.gen : 1,
    ageFull: null, breakTried: false, breakOk: false, attempts: 0,
    events: 0, end: '', dead: false
  };

  let guard = 0;
  while (!r.dead && guard++ < 800) {
    G = A.G;
    if (G.age >= G.lifespan) { r.dead = true; r.end = r.end || '寿尽'; break; }

    /* 圆满之后：能冲就冲，冲败则回头再修，直到寿元耗尽 */
    const full = A.realmBrim();
    if (full && r.ageFull == null) r.ageFull = G.age;

    if (full && G.cap < 1) {
      r.end = '止步（上限）';
      const rr = A.tickYear({ act: 'idle', rate: 0 });
      if (rr.died) { r.dead = true; break; }
      if (rr.event) {
        const idx = pickOptionIndex(rr.event, A.G.stones);
        if (idx >= 0) A.applyOption(rr.event, idx);
        r.events++;
      }
      continue;
    }

    if (full && A.canBreak()) {
      if (G.age >= G.lifespan - 1) { r.end = r.end || '寿尽'; r.dead = true; break; }
      const invest = policy === 'break0' ? 0 : Math.min(G.stones, 600);
      r.attempts++;
      if (!r.end) r.end = '冲关失败';
      const realmBefore = A.G.realm|0;
      A.doBreak(invest);
      /* 阶段 B：突破成功 = realm 递增（不再 deathTitle==='筑基'）。sim 只验炼气段，突破筑基即记成功。 */
      if ((A.G.realm|0) > realmBefore) { r.breakOk = true; r.end = '筑基'; r.dead = true; break; }
      if (A.G.mode === 'dead') { r.dead = true; break; }   // 飞升/寿尽等终局
      A.G.mode = 'idle'; A.G.lastResult = null;
      continue;
    }

    /* 决定：走还是闭 */
    let useRetreat = false;
    if (policy === 'smart' || policy === 'retreat') {
      const eff = A.retreatEfficiency();
      let needRest = -G.cult;
      const lc = A.realmLayerCount();
      for (let L = G.layer; L < lc; L++) needRest += A.realmNeed(A.realmOf(), L);
      const perY = A.yearOutput() * eff;
      const maxY = Math.min(Math.floor(G.lifespan * CFG.retreatMaxPct), G.lifespan - G.age - 1, Math.ceil(needRest / perY));
      const afford = Math.floor(G.stones / CFG.retreatCost);
      if (maxY >= 2 && afford >= 2) useRetreat = true;
    }

    if (useRetreat) {
      const eff = A.retreatEfficiency();
      let needRest = -G.cult;
      const lc = A.realmLayerCount();
      for (let L = G.layer; L < lc; L++) needRest += A.realmNeed(A.realmOf(), L);
      const perY = A.yearOutput() * eff;
      const maxY = Math.min(Math.floor(G.lifespan * CFG.retreatMaxPct), G.lifespan - G.age - 1, Math.ceil(needRest / perY));
      const afford = Math.floor(G.stones / CFG.retreatCost);
      const years = Math.max(1, Math.min(maxY, afford));
      let done = 0;
      for (let i = 0; i < years; i++) {
        if (A.G.age >= A.G.lifespan - 1) break;
        const rr = A.tickYear({
          act: 'retreat', rate: eff, incomeMul: 0,
          cost: CFG.retreatCost, retreat: true,
          eventRate: (i === 0 ? 0 : CFG.retreatEventRate)
        });
        if (rr.broke) break;
        if (rr.died) { done++; break; }
        done++;
        if (A.realmBrim(A.G)) break;
        if (rr.event) {
          const idx = pickOptionIndex(rr.event, A.G.stones);
          if (idx >= 0) A.applyOption(rr.event, idx);
          r.events++;
          break;
        }
      }
      if (done > 0) A.G.rtCount = (A.G.rtCount || 0) + 1;
      if (A.G.age >= A.G.lifespan) { r.dead = true; r.end = '寿尽'; }
      continue;
    }

    /* 行走一年 */
    const rr = A.tickYear({ act: 'walk' });
    if (rr.died) { r.dead = true; r.end = '寿尽'; break; }
    if (rr.event) {
      const idx = pickOptionIndex(rr.event, A.G.stones);
      if (idx >= 0) A.applyOption(rr.event, idx);
      r.events++;
    }
  }

  G = A.G;
  r.age = G.age;
  r.layer = G.layer;
  r.stones = G.stones;
  r.evtCount = G.evtCount;
  if (!r.end) r.end = '未知';
  return r;
}

/* ---------- 跑 ---------- */
const origins = ORIGIN === 'all' ? Object.keys(api.ORIGINS) : [ORIGIN];
if (!api.ORIGINS[origins[0]]) { console.error('没有这个出身：' + origins[0]); process.exit(1); }

const realEventRate = CFG.eventRate, realRetreatRate = CFG.retreatEventRate;
if (!EVENTS) { CFG.eventRate = 0; CFG.retreatEventRate = 0; }

const stat = {};
let sample = null, errors = 0;
const POOL = api.EVENTS.length;

for (const o of origins) {
  const rows = [];
  const seen = new Set();
  for (let i = 0; i < RUNS; i++) {
    try {
      const one = playOne(o, i % api.ORIGINS[o].variants.length, POLICY);
      rows.push(one);
      for (const k in api.G.eventsDone) seen.add(k);
      if (VERBOSE && !sample) sample = one;
    } catch (e) {
      errors++;
      if (errors <= 3) console.error('  ! 第 ' + i + ' 局出错：' + e.message);
    }
  }
  const n = rows.length || 1;
  const pct = f => (rows.filter(f).length / n * 100);
  const avg = f => rows.reduce((s, r) => s + f(r), 0) / n;
  stat[o] = {
    n: rows.length,
    full: pct(r => r.ageFull != null),
    brk: pct(r => r.breakOk),
    ageFull: (() => { const a = rows.filter(r => r.ageFull != null); return a.length ? Math.round(a.reduce((s, r) => s + r.ageFull, 0) / a.length) : null; })(),
    life: Math.round(avg(r => r.age)),
    att: (avg(r => r.attempts)).toFixed(1),
    evts: (avg(r => r.evtCount)).toFixed(1),
    cover: seen.size,
    stones: Math.round(avg(r => r.stones)),
    ends: rows.reduce((m, r) => (m[r.end] = (m[r.end] || 0) + 1, m), {})
  };
}

CFG.eventRate = realEventRate; CFG.retreatEventRate = realRetreatRate;

/* ---------- 传承：一条血脉连跑 N 代 ---------- */
const GENS = parseInt(arg('gens', '0'), 10);
let lineage = null;
if (GENS > 1) {
  const LO = ORIGIN === 'all' ? '寒门散修' : ORIGIN;
  const LINES = Math.max(20, Math.floor(RUNS / 4));
  lineage = [];
  for (let g = 1; g <= GENS; g++) lineage.push({ g, n: 0, brk: 0, life: 0, stones: 0, roots: {} });
  for (let i = 0; i < LINES; i++) {
    let seed = null;
    for (let g = 1; g <= GENS; g++) {
      const one = playOne(LO, (i + g) % 3, POLICY, seed);
      const row = lineage[g - 1];
      row.n++;
      if (one.breakOk) row.brk++;
      row.life += one.age;
      row.stones += one.stones;
      row.roots[one.root] = (row.roots[one.root] || 0) + 1;
      const mate = api.randMateRoot(api.G);
      const h = api.rollHeirRoot(one.root, mate);
      seed = { root: h.root, stones: Math.max(4, Math.floor(one.stones * 0.4)), gen: g + 1 };
    }
  }
}

/* ---------- 输出 ---------- */
const pad = (s, n) => {
  s = String(s);
  let w = 0;
  for (const ch of s) w += /[\u4e00-\u9fa5]/.test(ch) ? 2 : 1;
  return s + ' '.repeat(Math.max(0, n - w));
};

console.log('');
console.log('文件 ' + path.relative(process.cwd(), FILE).split(path.sep).join('/') + '　策略 ' + POLICY +
  '　事件 ' + (EVENTS ? '开' : '关') + '　每样 ' + RUNS + ' 局' +
  (SEED != null ? '　种子 ' + SEED : '') + (errors ? '　出错 ' + errors : '') +
  (tuned.length ? '\n调参 ' + tuned.join('　') : ''));
console.log('');
console.log(pad('出身', 16) + pad('圆满%', 7) + pad('筑基%', 7) + pad('圆满龄', 8) + pad('享年', 6) + pad('冲关/局', 9) + pad('事件/局', 9) + pad('覆盖', 9) + pad('余石', 7) + '结局分布');
console.log('-'.repeat(112));
for (const o of origins) {
  const s = stat[o];
  const ends = Object.entries(s.ends).sort((a, b) => b[1] - a[1])
    .map(([k, v]) => k + ' ' + Math.round(v / s.n * 100) + '%').join('　');
  console.log(
    pad(o, 16) + pad(Math.round(s.full), 7) + pad(Math.round(s.brk), 7) +
    pad(s.ageFull == null ? '-' : s.ageFull, 8) + pad(s.life, 6) + pad(s.att, 9) +
    pad(s.evts, 9) + pad(s.cover + '/' + POOL, 9) + pad(s.stones, 7) + ends
  );
}
console.log('');
const allBrk = origins.map(o => stat[o].brk);
console.log('筑基率区间 ' + Math.round(Math.min(...allBrk)) + '% – ' + Math.round(Math.max(...allBrk)) + '%　' +
  '（改动数值后，用同一个 --seed 再跑一次即可对比）');

if (VERBOSE && sample) {
  console.log('\n样例一局：' + sample.origin + ' / ' + sample.variant + ' / ' + sample.root +
    ' → ' + sample.end + '，' + sample.age + ' 岁，炼气' + sample.layer + '层，事件 ' + sample.evtCount);
}

/* ---------- 传承输出 ---------- */
if (lineage) {
  console.log('\n传承：' + (ORIGIN === 'all' ? '寒门散修' : ORIGIN) + '，' +
    lineage[0].n + ' 条血脉 × ' + GENS + ' 代（子代灵根按均值回归 + 变异判定）\n');
  console.log(pad('代', 6) + pad('筑基%', 8) + pad('享年', 7) + pad('终局余石', 10) + '灵根分布');
  console.log('-'.repeat(96));
  for (const row of lineage) {
    const dist = Object.entries(row.roots).sort((a, b) => b[1] - a[1]).slice(0, 4)
      .map(([k, v]) => k + ' ' + Math.round(v / row.n * 100) + '%').join('　');
    console.log(pad('第 ' + row.g + ' 代', 6) + pad(Math.round(row.brk / row.n * 100), 8) +
      pad(Math.round(row.life / row.n), 7) + pad(Math.round(row.stones / row.n), 10) + dist);
  }
  const first = lineage[0].brk / lineage[0].n, last = lineage[lineage.length - 1].brk / lineage[lineage.length - 1].n;
  console.log('\n第 1 代 → 第 ' + GENS + ' 代，筑基率变化 ' +
    (first * 100).toFixed(0) + '% → ' + (last * 100).toFixed(0) + '%' +
    '（' + (last - first > 0.03 ? '有复利' : (last - first < -0.03 ? '反而退步' : '基本持平')) + '）');
}
