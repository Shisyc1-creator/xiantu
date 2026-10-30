'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {settle} = require('./pill67-settlement.cjs');
// Existing ordinary item, illustrative quotes only; no foundation pill values.
const ledger = () => ({revision: 0, receipts: [],
  buyer: {id: 'player', funds: {stone: 30, wen: 1200}, items: {}},
  seller: {id: 'dan', funds: {stone: 7, wen: 50}, items: {qiPill: 2}}});
const quote = () => ({id: 'purchase1', buyer: 'player', seller: 'dan', item: 'qiPill',
  currency: 'stone', quantity: 2, unitPrice: 3, revision: 0});
test('settlement conserves money and goods and leaves source unchanged', () => {
  const s = ledger(), before = structuredClone(s), n = settle(s, quote());
  assert.deepEqual(s, before);
  assert.equal(n.buyer.funds.stone, 24); assert.equal(n.seller.funds.stone, 13);
  assert.equal(n.buyer.items.qiPill, 2); assert.equal('qiPill' in n.seller.items, false);
  assert.equal(n.buyer.funds.wen, 1200); assert.equal(n.receipts[0].total, 6);
});
test('serialized receipt rejects replay, including changed payload', () => {
  const n = JSON.parse(JSON.stringify(settle(ledger(), quote())));
  assert.throws(() => settle(n, quote()), /already settled/);
  assert.throws(() => settle(n, {...quote(), quantity: 1, revision: 1}), /already settled/);
});
test('stale buttons cannot consume newly changed inventory', () => {
  const n = settle(ledger(), {...quote(), quantity: 1});
  assert.throws(() => settle(n, {...quote(), id: 'purchase2', quantity: 1}), /stale/);
});
test('insufficient stock or funds leaves all input untouched', () => {
  for (const q of [{...quote(), quantity: 3}, {...quote(), unitPrice: 100}]) {
    const s = ledger(), before = structuredClone(s);
    assert.throws(() => settle(s, q)); assert.deepEqual(s, before);
  }
});
test('missing price and invalid currencies/counts cannot create free goods', () => {
  for (const patch of [{unitPrice: undefined}, {unitPrice: null}, {unitPrice: 0},
    {unitPrice: -1}, {currency: 'gold'}, {quantity: 0}, {quantity: 1.5},
    {quantity: NaN}, {revision: undefined}, {buyer: 'other'}, {item: 'constructor'}])
    assert.throws(() => settle(ledger(), {...quote(), ...patch}));
});
test('overflow is rejected without clipping or destroying value', () => {
  const s = ledger(); s.seller.funds.stone = Number.MAX_SAFE_INTEGER;
  assert.throws(() => settle(s, quote()), /overflow/);
  assert.throws(() => settle(ledger(), {...quote(), unitPrice: Number.MAX_SAFE_INTEGER}), /overflow/);
});
test('copper and spirit stones remain separate currencies', () => {
  const n = settle(ledger(), {...quote(), currency: 'wen', unitPrice: 60});
  assert.equal(n.buyer.funds.wen, 1080); assert.equal(n.seller.funds.wen, 170);
  assert.equal(n.buyer.funds.stone, 30); assert.equal(n.seller.funds.stone, 7);
});
test('partial sale and fresh quote exhaust exactly the actual stock', () => {
  const n = settle(ledger(), {...quote(), quantity: 1});
  const end = settle(n, {...quote(), id: 'purchase2', revision: 1, quantity: 1});
  assert.equal(end.buyer.items.qiPill, 2); assert.equal(end.receipts.length, 2);
  assert.throws(() => settle(end, {...quote(), id: 'purchase3', revision: 2, quantity: 1}), /stock/);
});
