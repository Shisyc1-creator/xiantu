const assert=require('assert'),fs=require('fs'),path=require('path');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/EDY/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});let count=0;const errors=[];
try{for(const width of [1440,390]){
 const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.stack));
 await page.goto(pathToFileURL(path.resolve(__dirname,'../prototype/index.html')).href+'?developer=1');
 await page.evaluate(()=>{XTDeveloper47.scenario('寒门散修');XTDeveloper47.teleport('county','square');
  globalThis.offsets50=()=>{const m=document.querySelector('.map-pan44');return {content:document.querySelector('.sb-scroll')?.scrollTop,page:document.scrollingElement.scrollTop,mapX:m?.scrollLeft,mapY:m?.scrollTop};};
  document.addEventListener('click',e=>{if(e.target.closest('[data-sb="m45:walk"]'))globalThis.clicked50=offsets50();},true);
 });
 const settle=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 for(const destination of ['shops','workshop','notice45']){
  await page.evaluate(()=>document.querySelector('.sb-scroll').scrollTop=100);
  await page.locator('[data-sb="m45:walk"][data-arg="'+destination+'"]').click();await settle();
  const result=await page.evaluate(()=>({before:clicked50,after:offsets50(),room:XTSandbox.state().room}));
  assert.strictEqual(result.room,destination);for(const key of Object.keys(result.before))assert(Math.abs(result.before[key]-result.after[key])<=1,`${width}: ${destination}: ${key}`);
  count++;console.log('PASS '+width+'px 连续移动至 '+destination+' 保持正文、页面和地图位置');
 }
 await page.evaluate(()=>{const s=document.querySelector('.sb-scroll');s.scrollTop=100;globalThis.keyBefore50=offsets50();});
 await page.locator('[data-sb="m45:walk"][data-arg="workshop"]').focus();
 await page.evaluate(()=>globalThis.keyBefore50=offsets50());
 await page.keyboard.press('Enter');await settle();
 const keyed=await page.evaluate(()=>({before:keyBefore50,after:offsets50(),room:XTSandbox.state().room}));
 assert.strictEqual(keyed.room,'workshop');for(const key of Object.keys(keyed.before))assert(Math.abs(keyed.before[key]-keyed.after[key])<=1);
 count++;console.log('PASS '+width+'px 键盘移动保持滚动位置');
 const unchanged=await page.evaluate(()=>{const role=JSON.stringify(G),saved=localStorage.getItem(SAVE_KEY),slots=localStorage.getItem(SLOT_KEY),before=offsets50();render();return role===JSON.stringify(G)&&saved===localStorage.getItem(SAVE_KEY)&&slots===localStorage.getItem(SLOT_KEY)&&Math.abs(before.content-offsets50().content)<=1;});assert(unchanged);
 count++;console.log('PASS '+width+'px 位置保持不改角色数据或自动、手动档');
 await page.evaluate(()=>{XTSandbox.go('cult');XTSandbox.go('scene');});await settle();
 assert.strictEqual(await page.evaluate(()=>document.querySelector('.sb-scroll').scrollTop),0);
 count++;console.log('PASS '+width+'px 跨页面导航不套用旧场景位置');
 await page.evaluate(()=>{document.querySelector('.sb-scroll').scrollTop=100;XTDeveloper47.teleport('village','square');});await settle();
 assert.strictEqual(await page.evaluate(()=>document.querySelector('.sb-scroll').scrollTop),0);
 count++;console.log('PASS '+width+'px 切换区域重新显示当地场景');
 await page.evaluate(()=>startEvent(EVENTS.find(e=>e.id==='E001')));await settle();
 assert(await page.evaluate(()=>G.mode==='event'&&!document.querySelector('.sb-scroll')));
 count++;console.log('PASS '+width+'px 进入事件不套用场景滚动区');
 await context.close();
}
assert.deepStrictEqual(errors,[]);assert(fs.readFileSync(path.resolve(__dirname,'view50.js')).equals(fs.readFileSync(path.resolve(__dirname,'../prototype/assets/view50.js'))));console.log('ALL '+count+' VIEW CHECKS PASSED; no browser errors; source/published match.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
