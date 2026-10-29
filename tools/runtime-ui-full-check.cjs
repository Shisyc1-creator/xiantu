const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});let count=0;
try{for(const width of [1440,768,390]){const context=await browser.newContext({viewport:{width,height:960},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const out=path.resolve(__dirname,'../outputs/runtime-ui-full');fs.mkdirSync(out,{recursive:true});
 async function check(stage,shot=true){assert.equal(await page.locator('body').getAttribute('data-ui-stage'),stage);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),stage+' overflow '+width);assert.equal(await page.locator('[data-live-nav]:visible').count(),stage==='play'?5:0);if(shot)await page.screenshot({path:path.join(out,`${stage}-${width}.png`),fullPage:true});count++;console.log('PASS '+stage+' '+width);}
 await page.goto(pathToFileURL(path.resolve(__dirname,'../prototype/index.html')).href+'?developer=1');await check('title');
 await page.locator('#coverBegin').click();await check('create');if(width===390)assert(await page.locator('#creationSheet').evaluate(e=>e.getBoundingClientRect().width>=innerWidth-1),'mobile creation must use full width');
 assert.equal(await page.locator('#originOpts [data-o]').count(),9);assert(!await page.locator('#creationSheet').innerText().then(s=>s.includes('自炼气一层起')));
 await page.locator('#inName').fill('沈新卷');await page.locator('#btnStart').click();
 if(await page.locator('[data-mode41="standard"]').count())await page.locator('[data-mode41="standard"]').click();
 await check('birth');assert.equal(await page.evaluate(()=>G.age),0);
 await page.locator('[data-v]:visible').first().click();await check('childhood');
 for(let i=0;i<4;i++){await page.locator('[data-childhood48="0"]').click();if(i<3)await check('childhood',false);}
 await check('entry');for(let i=0;i<4;i++){await page.locator('[data-opening46="0"]').click();if(i<3)await check('entry',false);}
 await check('measure');const root=await page.evaluate(()=>G.root);await page.locator('#btAwe').click();await check('result');await page.locator('#contBtn').click();await check('play');
 for(const group of ['scene','cult','bag','home','self']){await page.locator(`[data-live-nav="${group}"]`).click();await check('play',false);assert.equal(await page.evaluate(()=>XTSandbox.view.tab),group);await page.screenshot({path:path.join(out,`${group}-${width}.png`),fullPage:true});}
 const before=await page.evaluate(()=>JSON.stringify(G));await page.evaluate(()=>{render();render();});assert.equal(await page.evaluate(()=>JSON.stringify(G)),before,'UI render mutated state');
 await page.locator('[data-live="history"]').click();assert(await page.locator('body').evaluate(e=>e.classList.contains('drawer')),'history button must open actual log');assert(await page.locator('#log').isVisible());await page.locator('#logClose').click();assert(!await page.locator('body').evaluate(e=>e.classList.contains('drawer')));count++;
 await page.locator('[data-live="saves"]').click();assert(await page.locator('#modal').isVisible());await page.screenshot({path:path.join(out,`saves-${width}.png`),fullPage:true});await page.locator('#svClose').click();
 await page.evaluate(()=>save());await page.reload();assert.equal(await page.evaluate(()=>G.root),root);await check('play',false);
 const fontBefore=await page.locator('#scene .cult-next>p,#scene .sb-card p').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize));await page.locator('[data-live="settings"]').click();assert(await page.locator('#settingsPanel').isVisible());await page.screenshot({path:path.join(out,`settings-${width}.png`),fullPage:true});await page.locator('#prefFont').selectOption('large');await page.locator('#prefApply').click();await page.locator('#tClose').click();assert(await page.locator('#scene .cult-next>p,#scene .sb-card p').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize))>fontBefore,'large font setting must still work');await page.locator('[data-live="settings"]').click();await page.locator('#prefFont').selectOption('normal');await page.locator('#prefApply').click();await page.locator('#tClose').click();count++;
 await page.evaluate(()=>openMap());assert(await page.locator('.map-page').isVisible());await page.screenshot({path:path.join(out,`map-${width}.png`),fullPage:true});await page.evaluate(()=>closeMainOverlay());count++;
 const normal=await page.evaluate(()=>JSON.stringify(G));
 await page.evaluate(()=>{G.place='county';Object.assign(XTSandbox.state(),{roomAt:'county',room:'square'});XTWorld36.sync();XTSandbox.go('scene');XTQi51.startBattle('rat',true);});assert(await page.evaluate(()=>!!G.qi51.battle));await check('play',false);await page.screenshot({path:path.join(out,`battle-${width}.png`),fullPage:true});
 await page.evaluate(raw=>{restore(raw);startEvent(EVENTS.find(e=>e.opts?.length&&!e.retired36));},normal);await check('event');
 await page.evaluate(raw=>{restore(raw);die('寿元耗尽');},normal);await check('dead');
 await page.evaluate(raw=>{restore(raw);save();G=null;showStart();},normal);await check('title',false);await page.locator('#coverResume').click();await check('play',false);assert.equal(await page.evaluate(()=>G.root),root);
 assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>localStorage.getItem('xiuxian_slice_v1')),null);await context.close();
}console.log(count+' full UI state/viewport checks passed; real opening and save recovery verified');}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});


