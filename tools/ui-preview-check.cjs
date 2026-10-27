const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {pathToFileURL} = require('node:url');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || (process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright') : 'playwright'));

(async()=>{
 const browser=await chromium.launch({...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH,args:['--no-sandbox','--disable-dev-shm-usage']}:process.env.PLAYWRIGHT_CHANNEL?{channel:process.env.PLAYWRIGHT_CHANNEL}:process.platform==='win32'?{channel:'msedge'}:{}),headless:true});
 const output=path.resolve(__dirname,'../outputs/ui-preview');fs.mkdirSync(output,{recursive:true});
 let count=0;
 try {
  for(const viewport of [{width:1440,height:1000},{width:390,height:844},{width:768,height:1024}]){
   const context=await browser.newContext({viewport});
   await context.addInitScript(()=>{
    window.__previewStorageCalls=[];
    for(const api of ['localStorage','sessionStorage','indexedDB'])Object.defineProperty(window,api,{configurable:true,get(){window.__previewStorageCalls.push(api);throw Error('Preview accessed '+api);}});
   });
   const page=await context.newPage(),errors=[],external=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url());});
   await page.goto(pathToFileURL(path.resolve(__dirname,'../prototype/ui-preview.html')).href);
   async function check(label,value){assert(value,`${viewport.width}: ${label}`);console.log(`PASS ${viewport.width}: ${label}`);count++;}
   await check('travel opens with no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await check('no persistence APIs used',await page.evaluate(()=>window.__previewStorageCalls.length===0));
   await page.screenshot({path:path.join(output,`travel-${viewport.width}.png`),fullPage:true});
   await page.locator('[data-testid="nav-estate"]:visible').first().click();
   await check('estate navigation has no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.screenshot({path:path.join(output,`estate-${viewport.width}.png`),fullPage:true});
   await page.getByTestId('staff-search').fill('韩铸');
   await check('search narrows the roster',await page.locator('#staff-list .person-row').count()===1 && await page.locator('#staff-list').textContent().then(s=>s.includes('韩铸')));
   await page.getByTestId('staff-search').fill('不存在的人');
   await check('search has a clear empty state',await page.locator('#staff-list .empty').isVisible());
   await page.getByTestId('staff-search').fill('');
   await page.locator('#staff-filter').selectOption('voluntary');
   await check('relationship filter is independent of jobs',await page.locator('#staff-list .person-row').count()===1 && await page.locator('#staff-list').textContent().then(s=>s.includes('巧娘')));
   await page.locator('#staff-filter').selectOption('all');
   await page.locator('[data-action="staff"][data-person="lin"]').click();
   await check('staff detail exposes motive and work',await page.locator('#details').textContent().then(s=>s.includes('林修')&&s.includes('心中所求')));
   await page.locator('[data-action="proposal"]').click();
   await page.getByLabel('培养内容').fill('药圃辨材');
   await page.getByLabel('培养约定说明').fill('与本人商量余暇指导，资源和时间未定。');
   await page.getByTestId('proposal-save').click();
   await check('proposal save updates detail without payment',await page.locator('.saved-note').textContent().then(s=>s.includes('药圃辨材')));
   await page.screenshot({path:path.join(output,`staff-detail-${viewport.width}.png`),fullPage:true});
   await page.getByTestId('detail-close').click();
   await page.locator('[data-action="staff"][data-person="han"]').click();
   await page.locator('[data-action="proposal"]').click();
   await page.getByLabel('培养内容').fill('器谱研读');
   await page.getByLabel('培养约定说明').fill('另一人的独立草稿，不替换林修安排。');
   await page.getByTestId('proposal-save').click();
   await page.getByTestId('detail-close').click();
   await page.locator('[data-action="staff"][data-person="lin"]').click();
   await check('different people retain separate drafts',await page.locator('.saved-note').textContent().then(s=>s.includes('药圃辨材')&&!s.includes('器谱研读')));
   await page.locator('[data-action="proposal"]').click();
   await page.getByLabel('培养内容').fill('尚未保存的新内容');
   await page.locator('[data-action="cancel-proposal"]').click();
   await check('cancel does not overwrite saved draft',await page.locator('.saved-note').textContent().then(s=>s.includes('药圃辨材')&&!s.includes('尚未保存')));
   await page.locator('[data-action="withdraw"]').click();
   await check('withdraw removes only the memory draft',await page.locator('.saved-note').count()===0);
   await page.getByTestId('detail-close').click();
   await page.locator('[data-action="staff"][data-person="han"]').click();
   await check('withdraw leaves other people drafts intact',await page.locator('.saved-note').textContent().then(s=>s.includes('器谱研读')));
   await page.getByTestId('detail-close').click();
   await page.getByTestId('heir-toggle').click();
   await page.locator('[data-action="staff"][data-person="qiao"]').click();
   await check('personal tie has a distinct heir response',await page.locator('#details').textContent().then(s=>s.includes('旧日情分')));
   await page.keyboard.press('Escape');
   await check('escape restores background interaction',await page.locator('#main').evaluate(el=>!el.inert));
   await page.locator('[data-testid="nav-travel"]:visible').first().click();
   await check('returning to travel works',await page.getByTestId('travel-scene').isVisible());
   await page.locator('[data-action="scene"][data-scene="forge"]').click();
   await check('scene switch updates local people',await page.locator('#travel-people').textContent().then(s=>s.includes('石师傅')));
   await page.locator('[data-action="person"][data-person="shi"]').click();
   await page.locator('[data-action="talk"]').click();
   await check('person conversation opens at selected person',await page.locator('#details').textContent().then(s=>s.includes('谈谈器物')));
   await page.locator('#details [data-action="person"]').first().click();
   await page.locator('[data-action="shop"]').click();
   await check('shop items match the selected craftsman',await page.locator('#details').textContent().then(s=>!s.includes('青叶草')));
   await page.locator('[data-action="item"]').click();
   await page.locator('#details [data-action="shop"]').click();
   await check('item returns to the same craftsman shop',await page.locator('#details').textContent().then(s=>s.includes('柜前陈列')&&s.includes('石师傅')));
   await page.keyboard.press('Escape');
   await page.locator('[data-action="track"]').first().click();
   await page.locator('[data-action="toggle-track"]').click();
   await page.locator('[data-action="find-wang"]').click();
   await check('tracked destination leads to the right person',await page.locator('#details').textContent().then(s=>s.includes('王掌柜')));
   await page.keyboard.press('Escape');
   await page.reload();
   await check('reload resets demonstration draft and owner',await page.evaluate(()=>!document.body.innerText.includes('药圃辨材')));
   await check('no runtime errors',errors.length===0);
   await check('runs without outside requests',external.length===0);
   await check('navigation never touches player storage',await page.evaluate(()=>window.__previewStorageCalls.length===0));
   await context.close();
  }
  console.log(`${count} layout/isolation checks passed`);
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

