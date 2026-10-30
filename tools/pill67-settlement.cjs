'use strict';

// Pure preparation interface, NOT loaded by the game. No recipe, price,
// replenishment or success-rate defaults. Runtime integration must validate
// presence/ownership/current quote and commit with XTContent47.atomic.
const own = (o, k) => Object.hasOwn(o, k);
const integer = n => Number.isSafeInteger(n) && n >= 0;
const id = s => typeof s === 'string' && /^[A-Za-z][A-Za-z0-9_-]{0,79}$/.test(s)
  && !['constructor', 'prototype', '__proto__'].includes(s);
function demand(ok, reason) { if (!ok) throw new Error(reason); }
function validateAccount(a) {
  demand(a && id(a.id) && a.funds && a.items, 'invalid account');
  for (const currency of ['stone', 'wen']) demand(integer(a.funds[currency]), 'invalid funds');
  for (const [item, count] of Object.entries(a.items))
    demand(id(item) && integer(count), 'invalid inventory');
}
function settle(state, quote) {
  demand(state && integer(state.revision) && Array.isArray(state.receipts), 'invalid ledger');
  validateAccount(state.buyer); validateAccount(state.seller);
  demand(state.buyer.id !== state.seller.id, 'same account');
  demand(quote && id(quote.id) && id(quote.item), 'invalid quote');
  demand(quote.buyer === state.buyer.id && quote.seller === state.seller.id, 'wrong parties');
  demand(['stone', 'wen'].includes(quote.currency), 'invalid currency');
  demand(integer(quote.quantity) && quote.quantity > 0, 'invalid quantity');
  // Missing/zero prices cannot quietly become free supplies.
  demand(integer(quote.unitPrice) && quote.unitPrice > 0, 'unconfirmed price');
  demand(integer(quote.revision), 'invalid quote revision');
  demand(state.receipts.every(r => r && id(r.id)), 'invalid receipts');
  demand(!state.receipts.some(r => r.id === quote.id), 'already settled');
  demand(quote.revision === state.revision, 'stale quote');
  const total = quote.quantity * quote.unitPrice;
  const held = own(state.seller.items, quote.item) ? state.seller.items[quote.item] : 0;
  const before = own(state.buyer.items, quote.item) ? state.buyer.items[quote.item] : 0;
  demand(integer(total) && integer(before + quote.quantity)
    && integer(state.seller.funds[quote.currency] + total)
    && integer(state.revision + 1), 'numeric overflow');
  demand(held >= quote.quantity, 'insufficient stock');
  demand(state.buyer.funds[quote.currency] >= total, 'insufficient funds');
  // No mutation before or after rejection; caller swaps this snapshot only
  // inside its existing persistence transaction.
  const next = structuredClone(state);
  next.buyer.funds[quote.currency] -= total;
  next.seller.funds[quote.currency] += total;
  next.seller.items[quote.item] -= quote.quantity;
  if (!next.seller.items[quote.item]) delete next.seller.items[quote.item];
  next.buyer.items[quote.item] = before + quote.quantity;
  next.revision++;
  next.receipts.push({id: quote.id, buyer: quote.buyer, seller: quote.seller,
    item: quote.item, quantity: quote.quantity, currency: quote.currency,
    unitPrice: quote.unitPrice, total, revision: next.revision});
  return next;
}
module.exports = {settle};
