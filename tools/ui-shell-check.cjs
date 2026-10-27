const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright'));
const base=path.resolve(__dirname,'../prototype');
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(base,'ui-preview/route-registry.js'),'utf8'),sandbox);
const registry=sandbox.window.XTUIRoutes,routes=registry.routes;
assert.equal(new Set(routes.map(r=>r.id)).size,routes.length,'duplicate route IDs');
assert.equal(new Set(routes.map(r=>r.path)).size,routes.length,'duplicate route paths');
for(const r of routes){
 assert(r.title&&r.source&&r.status,`missing audit fields: ${r.id}`);
 for(const reference of [r.parent,r.back])assert(reference==='overview'||reference==='context'||reference==='source'||reference?.startsWith('nav:')||registry.byId[reference],`broken reference ${r.id}: ${reference}`);
}
const required=['travel.scene','travel.map','travel.quests','travel.auction','travel.auction-hall','cult.practice','cult.retreat','cult.breakthrough','cult.arts','cult.spells','cult.loadout','cult.battle','cult.routes','cult.crafting','cult.arrays','cult.pets','cult.puppets','bag.items','bag.equipment','bag.books','bag.medicine','bag.materials','estate.staff','estate.home','estate.facilities','estate.warehouse','estate.property','self.profile','self.relations','self.sect','self.lineage','self.history','self.inherit','self.ledger','self.saves','self.settings','self.help','state.title','state.birth','state.childhood','state.measure','state.entry','state.event','state.result','state.journey','state.death','state.inheritance','state.difficulty','detail.person','detail.item','detail.staff'];
for(const id of required)assert(registry.byId[id],`missing known interface family: ${id}`);
console.log(`PASS registry: ${routes.length} unique routes, known interface families and navigation references`);
(async()=>{
 const browser=await chromium.launch({...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:['--no-sandbox','--disable-dev-shm-usage']}:process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:process.platform==='win32'?{channel:'msedge'}:{}),headless:true});let checks=0;
 try{
  for(const viewport of [{width:1440,height:1000},{width:390,height:844},{width:768,height:1024}]){
   const context=await browser.newContext({viewport});
   await context.addInitScript(()=>{window.__storageAccess=[];for(const key of ['localStorage','sessionStorage','indexedDB'])Object.defineProperty(window,key,{configurable:true,get(){window.__storageAccess.push(key);throw Error('Unexpected storage access');}});});
   const page=await context.newPage(),errors=[],network=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
   await page.goto(pathToFileURL(path.join(base,'ui-preview.html')).href);
   for(const route of routes){
    await page.keyboard.press('Escape');
    await page.locator('[data-shell="overview"]:visible').first().click();
    const link=page.locator(`[data-shell="route"][data-id="${route.id}"]:visible`).first();
    assert(await link.count(),`missing clickable overview entry ${route.id}`);await link.click();
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${viewport.width} overflow: ${route.id}`);
    if(route.kind==='detail'){
     assert(await page.locator('#details').isVisible(),`detail not shown: ${route.id}`);
     assert.equal(await page.locator('#details').getAttribute('data-route'),route.id,`wrong common detail: ${route.id}`);
     await page.locator('[data-testid="detail-close"]:visible').click();
     assert(await page.locator('#main').evaluate(el=>!el.inert),`detail failed to release background: ${route.id}`);
    }else{
     assert.equal(await page.evaluate(()=>window.XTUIShell.route),route.id,`wrong route: ${route.id}`);
     assert(await page.locator('body').innerText().then(s=>s.includes(route.title)),`title missing: ${route.id}`);
     const back=page.locator('[data-shell="back"]:visible').first();
     assert(await back.count(),`missing back affordance: ${route.id}`);await back.click();
     assert.equal(await page.evaluate(()=>window.XTUIShell.route),'overview',`back did not return to source: ${route.id}`);
    }
    checks++;
   }
   const output=path.resolve(__dirname,'../outputs/ui-shell');fs.mkdirSync(output,{recursive:true});
   for(const id of ['cult.practice','bag.items','self.relations','self.saves']){
    await page.keyboard.press('Escape');await page.locator('[data-shell="overview"]:visible').first().click();
    await page.locator(`[data-shell="route"][data-id="${id}"]:visible`).first().click();
    await page.screenshot({path:path.join(output,`${id}-${viewport.width}.png`),fullPage:true});
   }
   await page.locator('[data-shell="overview"]:visible').first().click();
   await page.screenshot({path:path.join(output,`overview-${viewport.width}.png`),fullPage:true});
   async function atlas(id){await page.keyboard.press('Escape');await page.locator('[data-shell="overview"]:visible').first().click();await page.locator(`[data-shell="route"][data-id="${id}"]:visible`).first().click();}
   await atlas('bag.items');await page.locator('#bag-search').fill('青叶草');
   await page.locator('[data-nav="cult"]:visible').first().click();await page.locator('[data-nav="bag"]:visible').first().click();
   assert.equal(await page.locator('#bag-search').inputValue(),'青叶草','bag query lost across navigation');
   assert.equal(await page.locator('#bag-results .shell-row:visible').count(),1,'bag filter results not restored');
   await page.locator('#bag-search').fill('');
   await page.locator('[data-shell="item"][data-id="sword"]').first().click();
   assert(await page.locator('#details').textContent().then(s=>s.includes('青钢短剑')),'wrong bag item');
   await page.locator('#details [data-shell="route"][data-id="cult.crafting"]').click();
   await page.locator('[data-shell="back"]:visible').first().click();
   assert.equal(await page.evaluate(()=>XTUIShell.route),'bag.items','related crafting lost bag return context');
   await atlas('self.relations');await page.locator('[data-shell="person"][data-id="lin"]').click();
   assert(!await page.locator('#details').innerText().then(s=>s.includes('undefined')),'missing person topic');
   await page.locator('#details [data-action="talk"]').click();
   assert(!await page.locator('#details').innerText().then(s=>s.includes('undefined')),'missing person reply');
   await page.keyboard.press('Escape');await atlas('self.settings');await page.locator('#shell-font').selectOption('large');
   assert(await page.locator('body').evaluate(el=>el.classList.contains('shell-large')),'font option did not apply');
   for(const id of ['cult.practice','bag.items','estate.staff','self.profile','travel.scene']){
    await atlas(id);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`large text overflow ${id}`);
    const group=id.split('.')[0];
    for(const nav of ['.primary','.bottom-nav']){
     assert.equal(await page.locator(`${nav} [data-nav].active`).count(),1,`multiple selected tabs: ${nav} ${id}`);
     assert.equal(await page.locator(`${nav} [data-nav].active`).getAttribute('data-nav'),group,`wrong selected tab: ${nav} ${id}`);
    }
   }
   await atlas('bag.items');await page.screenshot({path:path.join(output,`bag-large-${viewport.width}.png`),fullPage:true});
   assert.deepEqual(errors,[],`runtime errors ${viewport.width}`);assert.deepEqual(network,[],`external requests ${viewport.width}`);
   assert(await page.evaluate(()=>window.__storageAccess.length===0),`storage access ${viewport.width}`);
   console.log(`PASS ${viewport.width}: ${routes.length} clickable routes, no overflow/runtime errors/storage/network`);await context.close();
  }
  console.log(`${checks} route/viewport checks passed`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

