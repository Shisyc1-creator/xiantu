/* 世界表体检：把 PLACES / ROUTES / NPCS 放到「物理规则」底下过一遍。
   node tools/worldcheck.js

   查的是人查不出来的东西：境界超过灵根上限、住在灵气不够的地方、
   一个村的修士比人口还多、两个地点之间没有路。这些错了不会报错，
   只会在半年后写事件时突然发现「这个人不该在这儿」。 */
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

const HOOK = `;globalThis.__wc = { PLACES, ROUTES, NPCS, QI_GATE, QI_MUL, qiTier, COUNTY, ROOTS, CFG, FATE_POOL, TIER_OF, fillFate };`;

new Function('document', 'localStorage', 'confirm', 'alert', 'window', 'Math', 'console', SRC + HOOK)(
  documentStub, ls, () => true, () => {}, win, Object.create(Math), { log() {}, error() {}, warn() {} });

const A = globalThis.__wc;
const { PLACES, ROUTES, NPCS, QI_GATE, QI_MUL, qiTier, COUNTY, ROOTS, CFG, FATE_POOL } = A;

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.log('  ✗ ' + msg); } };
const REALM_LIFE = { '凡人': 70, '炼气': 100, '筑基': 200 };
const TIERS = ['村', '野地', '城', '市', '山门'];
const ROADS = ['官道', '山径', '荒原', '水路', '经岭', '官道+石阶'];
const PLACE_IDS = Object.keys(PLACES);
const TOKENS = Object.keys(FATE_POOL);

console.log('\n【一】地点表 PLACES');
for (const id of PLACE_IDS) {
  const p = PLACES[id];
  for (const f of ['name', 'tier', 'qi', 'order', 'pop', 'cult', 'note', 'rumor']) {
    ok(p[f] !== undefined && p[f] !== null && p[f] !== '', `${id} 缺字段 ${f}`);
  }
  ok(TIERS.includes(p.tier), `${id} 的 tier「${p.tier}」不在枚举里`);
  ok(p.order >= 0 && p.order <= 3, `${id} 的 order 应在 0–3`);
  ok(p.qi > 0, `${id} 的 qi 必须为正`);
  ok(Array.isArray(p.rumor) && p.rumor.length >= 2, `${id} 的传闻少于 2 条`);
  /* 密度只对「有人世代居住」的地方成立：村和城。山门的人是招来的，野地的人是暂住的，
     都不从本地人口里长出来。村子放宽到 2，因为「三百人里出一个」正是主角那种孤例。 */
  if (p.tier === '村') ok(p.cult <= 2, `${id} 一个村有 ${p.cult} 个修士，村子不该有第三个`);
  if (p.tier === '城') ok(p.cult <= p.pop / 500, `${id} 修士 ${p.cult} 人，超出人口密度（${p.pop} 人）`);
  /* 地名 token（{乡}{观}）必须来自 FATE_POOL，否则运行时替换不掉，直接显示花括号 */
  for (const m of p.name.matchAll(/\{([^{}]+)\}/g)) {
    ok(TOKENS.includes(m[1]), `${id} 的 name 用了未登记的 token {${m[1]}}`);
  }
}

/* 灵气档由浓度算出，不许手填：这一条防的是「城里灵气比乡下厚」被悄悄改回来 */
ok(qiTier(0.60) === 0 && qiTier(0.70) === 0 && qiTier(0.80) === 0, '县城/坊市/山口都应是 0 档（人气浊）');
ok(qiTier(1.00) === 1, '村子应是 1 档');
ok(qiTier(1.80) === 2, '山门应是 2 档');
ok(qiTier(2.00) === 3, '断云崖应是 3 档（全县唯一）');
ok(QI_MUL.length === 4, 'QI_MUL 应有四档');
ok(PLACES.county.qi < PLACES.village.qi, '「城市灵气反比乡下薄」被改掉了');
ok(PLACES.cliff.qi >= QI_GATE['结丹'], '断云崖够不到结丹门槛，那句「全县唯一」就不成立');

/* 六处之和只算县内，府城在界外，不能并进青石县的人口账 */
const IN_COUNTY = PLACE_IDS.filter(id => id !== 'prefecture');
const cultSum = IN_COUNTY.reduce((s, id) => s + PLACES[id].cult, 0);
ok(cultSum <= COUNTY.cult, `县内六处修士合计 ${cultSum}，超过全县 ${COUNTY.cult}`);
console.log(`    县内六处修士合计 ${cultSum} 人，全县 ${COUNTY.cult} 人，另有 ${COUNTY.cult - cultSum} 人在别村与山中（不在图上）`);

console.log('\n【二】路程表 ROUTES');
const deg = {}; PLACE_IDS.forEach(id => deg[id] = 0);
const seen = new Set();
for (const r of ROUTES) {
  ok(PLACES[r.a] && PLACES[r.b], `边 ${r.a}-${r.b} 有一端不存在`);
  ok(r.a !== r.b, `边 ${r.a}-${r.b} 自环`);
  ok(r.li > 0, `边 ${r.a}-${r.b} 里数必须为正`);
  ok(ROADS.includes(r.road), `边 ${r.a}-${r.b} 的路况「${r.road}」不在枚举里`);
  ok(r.risk >= 0 && r.risk <= 3, `边 ${r.a}-${r.b} 的 risk 应在 0–3`);
  const key = [r.a, r.b].sort().join('-');
  ok(!seen.has(key), `边 ${key} 重复定义`);
  seen.add(key);
  deg[r.a]++; deg[r.b]++;
}
/* 连通性：从村子出发，能不能走到每一处（府城除外） */
const adj = {}; PLACE_IDS.forEach(id => adj[id] = []);
ROUTES.forEach(r => { adj[r.a].push(r.b); adj[r.b].push(r.a); });
const seenP = new Set(['village']); const q = ['village'];
while (q.length) { const c = q.shift(); for (const n of adj[c]) if (!seenP.has(n)) { seenP.add(n); q.push(n); } }
for (const id of PLACE_IDS) if (id !== 'prefecture') ok(seenP.has(id), `${id} 从村子出发走不到`);

/* 天数：炼气 80 里/日，筑基 800 里/日（时间与距离表 v1 §1） */
const days = (li, per) => Math.max(1, Math.ceil(li / per));
for (const r of ROUTES) {
  const dLQ = days(r.li, 80), dZJ = days(r.li, 800);
  ok(dZJ <= dLQ, `边 ${r.a}-${r.b} 筑基比炼气还慢`);
  ok(dLQ <= 380, `边 ${r.a}-${r.b} 炼气要走 ${dLQ} 天，超过一年`);
}
const inner = ROUTES.filter(r => r.b !== 'prefecture').map(r => r.li);
ok(Math.max(...inner) <= 400, `县内最远一条 ${Math.max(...inner)} 里，超过 5 天（350 里）的设计意图`);
console.log(`    县内最远 ${Math.max(...inner)} 里 = 炼气 ${days(Math.max(...inner), 80)} 天；出县 ${ROUTES.find(r => r.b === 'prefecture').li} 里 = ${days(ROUTES.find(r => r.b === 'prefecture').li, 80)} 天`);

console.log('\n【三】人物表 NPCS');
const ids = new Set(), names = new Set(), perPlace = {}, zjNamed = { n: 0 };
for (const n of NPCS) {
  ok(!ids.has(n.id), `id 重复：${n.id}`);
  ids.add(n.id);
  ok(!names.has(n.name), `重名：${n.name}`);
  names.add(n.name);
  ok(PLACES[n.place], `${n.name} 的地点「${n.place}」不存在`);
  ok(n.look && n.want && n.knows, `${n.name} 缺 look/want/knows（写事件时要靠这三个字段）`);

  /* 出生地 token */
  for (const m of String(n.name).matchAll(/\{([^{}]+)\}/g)) {
    ok(TOKENS.includes(m[1]), `${n.name} 用了未登记的 token {${m[1]}}`);
  }

  /* 境界与字段自洽 */
  ok(REALM_LIFE[n.realm] !== undefined, `${n.name} 的境界「${n.realm}」本切片不支持`);
  if (n.realm === '炼气') {
    ok(n.layer >= 1 && n.layer <= CFG.layerCount, `${n.name} 的层数 ${n.layer} 越界`);
    ok(n.stage === undefined, `${n.name} 是炼气却带了 stage`);
  } else if (n.realm === '筑基') {
    ok(['初', '中', '后', '圆满'].includes(n.stage), `${n.name} 的筑基阶「${n.stage}」非法`);
    ok(n.layer === undefined, `${n.name} 是筑基却带了 layer`);
    zjNamed.n++;
  }

  /* 灵根 */
  ok(n.root === '无灵根' || ROOTS[n.root], `${n.name} 的灵根「${n.root}」不在 ROOTS 里`);
  if (n.realm === '凡人') ok(n.root === '无灵根', `${n.name} 是凡人却有灵根「${n.root}」`);
  else ok(n.root !== '无灵根', `${n.name} 有修为却是「无灵根」`);

  /* ★ 关键不变量：境界不得超过灵根上限。没有这条，迟早写出一个绝灵根的筑基。 */
  if (n.realm === '筑基') {
    ok(ROOTS[n.root].cap >= 1, `${n.name} 是 ${n.root}（上限 ${ROOTS[n.root].cap}），不可能筑基`);
  }

  /* ★ 住在灵气够得着的地方 */
  const gate = QI_GATE[n.realm];
  if (gate !== undefined) {
    ok(PLACES[n.place].qi >= gate, `${n.name}（${n.realm}）住在 ${PLACES[n.place].name}，灵气 ${PLACES[n.place].qi} < 门槛 ${gate}`);
  }

  /* 寿元 */
  ok(n.age > 0 && n.age < n.life, `${n.name} 的年龄 ${n.age} 不在 (0, ${n.life}) 内`);
  ok(n.life === REALM_LIFE[n.realm], `${n.name} 的寿元 ${n.life} 与 ${n.realm}（${REALM_LIFE[n.realm]}）不符`);

  if (n.realm !== '凡人') perPlace[n.place] = (perPlace[n.place] || 0) + 1;
}
for (const pid in perPlace) {
  ok(perPlace[pid] <= PLACES[pid].cult, `${PLACES[pid].name} 点名了 ${perPlace[pid]} 个修士，但该处只有 ${PLACES[pid].cult} 人`);
}
ok(zjNamed.n <= COUNTY.byRealm['筑基'], `点名筑基 ${zjNamed.n} 人，超过全县 ${COUNTY.byRealm['筑基']}`);

/* 切片边界：一县无结丹 */
ok(!NPCS.some(n => n.realm === '结丹'), '本切片出现了结丹——一县无结丹是总纲的推论');

/* 随机地名：正文里写死 FATE_POOL 的名字，会和玩家那一套地名打架 */
const flatPool = [].concat(...Object.values(FATE_POOL));
for (const n of NPCS) {
  const hard = flatPool.find(x => String(n.knows).includes(x) || String(n.want).includes(x) || String(n.look).includes(x));
  ok(!hard, `${n.name} 的文本里写死了随机地名「${hard}」，应改 token`);
}

console.log(`\n地点 ${PLACE_IDS.length} 处 · 路程 ${ROUTES.length} 条 · 人物 ${NPCS.length} 人（点名筑基 ${zjNamed.n} / 全县 ${COUNTY.byRealm['筑基']}）`);
console.log(`通过 ${pass} 项，失败 ${fail} 项\n`);
process.exit(fail ? 1 : 0);
