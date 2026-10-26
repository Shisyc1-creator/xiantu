const path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright'));
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});const ctx=await b.newContext();const p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));let n=0;
try{
 await p.goto(pathToFileURL(path.resolve(__dirname,'../prototype/index.html')).href+'?developer=1');
 await p.evaluate(()=>{XTDeveloper47.scenario('寒门散修');globalThis.oldAuto=localStorage.getItem(SAVE_KEY);globalThis.oldSlots='{"s1":{"ts":1,"d":"old"}}';localStorage.setItem(SLOT_KEY,oldSlots);globalThis.realSet=Storage.prototype.setItem;globalThis.realGet=Storage.prototype.getItem;});
 async function check(name,fn){assert(await p.evaluate(fn),name);console.log('PASS '+name);n++;}
 await check('quota keeps durable old auto and manual saves',()=>{Storage.prototype.setItem=function(){throw new DOMException('full','QuotaExceededError');};return save()===false&&saveToSlot(1)===false&&realGet.call(localStorage,SAVE_KEY)===oldAuto&&realGet.call(localStorage,SLOT_KEY)===oldSlots;});
 await check('manual failure is visible and repeated auto errors have one persistent warning',()=>{save();save();render();return document.querySelectorAll('#save-warning-r1').length===1&&document.getElementById('modal').textContent.includes('手动存档失败');});
 await check('read failure aborts manual save without changing old slots',()=>{Storage.prototype.setItem=realSet;Storage.prototype.getItem=function(){throw new DOMException('blocked','SecurityError');};const ok=saveToSlot(2);Storage.prototype.getItem=realGet;return ok===false&&localStorage.getItem(SLOT_KEY)===oldSlots;});
 await check('silent write drop does not claim success',()=>{Storage.prototype.setItem=function(){};G.name='读回核验';return save()===false;});
 await p.setViewportSize({width:390,height:844});
 await p.evaluate(()=>openSaves());
 await p.locator('.mini[data-act="save"][data-n="3"]').click();
 assert(await p.locator('#modal').textContent().then(s=>s.includes('手动存档失败')));n++;console.log('PASS phone save management remains clickable during warning');
 await p.locator('#tClose').click();
 await check('recover and save old/manual formats with independent developer keys',()=>{Storage.prototype.setItem=realSet;const ok=save()&&saveToSlot(2);return ok&&!document.getElementById('save-warning-r1')&&SAVE_KEY==='xiantu_developer47_v1'&&SLOT_KEY==='xiantu_developer47_slots_v1'&&!localStorage.getItem('xiuxian_slice_v1')&&!localStorage.getItem('xiuxian_slots_v1');});
 await p.reload();
 await check('reload restores verified auto save and manual slot',()=>G.name==='读回核验'&&slotData(2).o.name==='读回核验');
 assert.deepEqual(errors,[]);console.log(`${n} browser save checks passed; no page errors`);
}finally{await ctx.close();await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
