// Real Edge in fresh contexts; developer-only saves, no player profile.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/EDY/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'outputs/event-economy58');
fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});let checks=0;try{
 for(const width of [1440,390]){const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(root,'prototype/index.html')).href+'?developer=1');
 const reset=()=>page.evaluate(()=>{XTDeveloper47.scenario('寒门散修');tryEvent=()=>null;meetLive=()=>null;tryRoadEvent=()=>null;pickRetreatEvent=()=>null;G.age=25;G.lifespan=200;G.mode='idle';G.stones=100;XTContent47.money().wen=1000;Math.random=()=>.99;});
 await reset();await page.evaluate(()=>{XTDeveloper47.teleport('county','inn45');XTContent47.money().wen=0;startEvent(EVENTS.find(e=>e.id==='E026'));});
 assert(await page.locator('.choice[data-i="0"]').isDisabled());checks++;
 assert.match(await page.locator('#scene').innerText(),/40文/);checks++;
 await page.screenshot({path:path.join(out,'wine-disabled-'+width+'.png')});
 await page.evaluate(()=>{XTContent47.money().wen=1000;render();});await page.locator('.choice[data-i="0"]').click();
 assert.deepEqual(await page.evaluate(()=>[G.stones,XTContent47.money().wen,!!G.eventsDone.E026]),[100,960,true]);checks++;
 await reset();await page.evaluate(()=>{XTDeveloper47.teleport('ridge','wild');G.inventory={herb:3,beastFood52:2};XTSandbox.state().books['同息御兽篇']={level:1,xp:0};globalThis.started=XTSandbox.now();startEvent(EVENTS.find(e=>e.id==='E019'));});
 await page.locator('.choice[data-i="0"]').click();assert.deepEqual(await page.evaluate(()=>[XTQi52.state().pet.name,G.inventory.herb,G.inventory.beastFood52,XTSandbox.now()-started,G.stones]),['青纹狼',0,0,7,100]);checks++;
 await page.evaluate(()=>{G.mode='idle';XTQi52.open();XTSandbox.dispatch('q52:route','pet');});
 assert.match(await page.locator('#scene').innerText(),/青纹狼/);checks++;
 assert(!await page.locator('#scene').innerText().then(t=>t.includes('青耳灵狐 · 亲近')));checks++;
 await page.getByText('灵兽 · 独立一个协同位',{exact:true}).scrollIntoViewIfNeeded();
 await page.screenshot({path:path.join(out,'wolf-companion-'+width+'.png')});
 await page.evaluate(()=>{G.inventory.beastFood52=1;XTQi52.state().pet.fedUntil=XTSandbox.now();render();});
 await page.locator('[data-sb="q52:feed"]').click();assert(await page.evaluate(()=>G.inventory.beastFood52===0&&XTQi52.state().pet.fedUntil>XTSandbox.now()));checks++;
 await reset();await page.evaluate(()=>{XTDeveloper47.teleport('ridge','wild');G.inventory={};globalThis.started=XTSandbox.now();actHerb();});
 assert(await page.evaluate(()=>G.stones===100&&G.inventory.herb>0&&XTSandbox.now()-started===7));checks++;
 assert(await page.evaluate(()=>localStorage.getItem('xiuxian_slice_v1')===null&&localStorage.getItem('xiuxian_slots_v1')===null));checks++;
 assert.deepEqual(errors,[]);checks++;
 await context.close();
 }
 console.log('PASS '+checks+' browser checks at 1440/390px; no page errors; fresh developer contexts.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
