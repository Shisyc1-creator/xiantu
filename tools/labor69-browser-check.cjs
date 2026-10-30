const assert=require('node:assert/strict');
const {launchBrowser,gameUrl}=require('./browser-runtime.cjs');
(async()=>{const browser=await launchBrowser();let checks=0;try{for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(gameUrl()+'?developer=1');await require('./current-opening-fixture.cjs')(page);
 await page.evaluate(()=>{startCurrentOpening('寒门散修');tryEvent=()=>null;meetLive=()=>null;tryRoadEvent=()=>null;Math.random=()=>.4;economyFactor=()=>1;G.stones=0;XTDeveloper47.teleport('market','shops');globalThis.day69=XTSandbox.now();actWork();});
 const confirm=()=>page.locator('[data-sb="c47:laborCommit"]');
 assert((await page.locator('#scene').innerText()).includes('顾散人'));assert.equal(await page.evaluate(()=>XTSandbox.now()),await page.evaluate(()=>day69));checks++;
 await page.evaluate(()=>globalThis.old69=document.querySelector('[data-sb="c47:laborCommit"]'));
 await confirm().click();assert.equal(await page.evaluate(()=>G.stones),10);assert.equal(await page.evaluate(()=>XTSandbox.now()-day69),30);assert.equal(await page.evaluate(()=>XTSandbox.shopState('stall').wallet),230);checks++;
 await page.evaluate(()=>old69.click());assert.equal(await page.evaluate(()=>G.stones),10);checks++;
 await page.reload();assert.equal(await page.evaluate(()=>G.stones),10);checks++;
 await page.evaluate(()=>{tryEvent=()=>null;meetLive=()=>null;Math.random=()=>.4;economyFactor=()=>1;actWork();globalThis.raw69=JSON.stringify(G);globalThis.set69=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('quota')};});
 await confirm().click();assert.deepEqual(await page.evaluate(()=>{const b=JSON.parse(raw69);return Object.keys(G).filter(k=>JSON.stringify(G[k])!==JSON.stringify(b[k]));}),['log','interaction42']);assert.equal(await page.evaluate(()=>G.stones),10);assert.equal(await page.evaluate(()=>G.t),await page.evaluate(()=>JSON.parse(raw69).t));assert.equal(await page.evaluate(()=>G.day),await page.evaluate(()=>JSON.parse(raw69).day));await page.evaluate(()=>Storage.prototype.setItem=set69);checks++;
 await page.evaluate(()=>{XTSandbox.shopState('stall').wallet=0;actWork();});assert(await confirm().isDisabled());checks++;
 await page.evaluate(()=>{XTDeveloper47.teleport('county','shops');stepIdle();});await page.locator('[data-sb="c47:work"]').click();assert.equal(await page.evaluate(()=>G.stones),10);checks++;
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);for(const key of ['xiuxian_slice_v1','xiuxian_slots_v1'])assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),null);checks++;
 await page.screenshot({path:`outputs/labor69-${width}.png`,fullPage:true});await context.close();console.log('PASS labor '+width);
 }}finally{await browser.close();}console.log(checks+' browser checks passed');})().catch(e=>{console.error(e);process.exitCode=1});
