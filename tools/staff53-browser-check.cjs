// Real Chromium checks in isolated contexts; no daily player profile is opened.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.screenshots/staff53');
fs.mkdirSync(out,{recursive:true});

async function fixture(page){
 await page.evaluate(()=>{
  XTDeveloper47.scenario('寒门散修');tryEvent=()=>null;meetLive=()=>null;tryRoadEvent=()=>null;pickRetreatEvent=()=>null;
  economyFactor=()=>1;G.realm=0;G.layer=4;G.mode='idle';G.lastResult=null;G.stones=3000;
  XTDeveloper47.teleport('county','agency');XTSandbox.dispatch('buyProperty','courtyard');
 });
}
async function offers(page){
 await page.evaluate(()=>{XTDeveloper47.teleport('county','agency');XTSandbox.dispatch('recruitOffers');});
}
async function hire(page,id='lin'){
 await offers(page);
 await page.locator('[data-sb="hire"][data-arg="'+id+'"]').click();
}
async function staff(page){await page.evaluate(()=>XTSandbox.go('home','staff'));}
async function assign(page){
 await staff(page);
 await page.locator('[data-sb="selectWorker"][data-arg="lin"]').click();
 await page.locator('[data-sb="assign"][data-arg="lin:gather"]').click();
}
async function inherit(page){
 await page.evaluate(()=>{
  const w=XTWorld36.world();w.people.child53={id:'child53',name:'沈承行',realm:0,layer:1,root:'五灵根',birth:XTSandbox.now()-8*360,life:100,alive:true,place:'county',room:'home',sex:'男',parents:[w.playerId,'N04'],source:'受控测试中已出生八年的后人'};
  w.children.push('child53');G.mode='dead';openInherit();
 });
 await page.locator('[data-sb="r36:inherit"][data-arg="child53"]').click();
}

(async()=>{
 const browser=await chromium.launch({headless:true});const results=[];
 try{
  for(const device of [{name:'desktop',viewport:{width:1440,height:1000},isMobile:false,hasTouch:false},{name:'mobile',viewport:{width:390,height:844},isMobile:true,hasTouch:true}]){
   const context=await browser.newContext({viewport:device.viewport,isMobile:device.isMobile,hasTouch:device.hasTouch});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   try{
    await page.goto(pathToFileURL(path.join(root,'prototype/index.html')).href+'?developer=1');
    assert(await page.evaluate(()=>XTDeveloper47.isolated),'developer saves must be isolated');
    async function check(name,fn){await fn();results.push(device.name+': '+name);console.log('PASS '+device.name+': '+name);}
    await check('same-realm hire with real button, existing fee and duplicate protection',async()=>{
     await fixture(page);const before=await page.evaluate(()=>G.stones);await hire(page);
     assert.equal(await page.evaluate(()=>XTSandbox.state().staff.length),1);
     assert.equal(await page.evaluate(()=>G.stones),before-30);
     assert(await page.locator('[data-sb="hire"][data-arg="lin"]').isDisabled());
    });
    await check('same-realm job uses real controls and pays once',async()=>{
     await assign(page);
     assert.equal(await page.evaluate(()=>XTSandbox.state().staff[0]?.job?.type),'gather');
     await page.evaluate(()=>advanceDays(30,{act:'browser53',rate:0,incomeMul:0,eventRate:0}));
     assert.equal(await page.evaluate(()=>XTSandbox.state().warehouse.herb),4);
     await page.evaluate(()=>{XTSandbox.tick();XTSandbox.tick();});
     assert.equal(await page.evaluate(()=>XTSandbox.state().warehouse.herb),4);
    });
    await check('higher-realm worker retains work and displays actual realm',async()=>{
     await fixture(page);await hire(page);
     await page.evaluate(()=>{XTSandbox.state().staff[0].realm=1;XTWorld36.get('lin').realm=1;});
     await assign(page);
     assert((await page.locator('#scene').innerText()).includes('林修 · 筑基'));
     await page.evaluate(()=>advanceDays(30,{act:'browser53',rate:0,incomeMul:0,eventRate:0}));
     assert.equal(await page.evaluate(()=>XTSandbox.state().warehouse.herb),4);
    });
    await check('real inheritance button preserves employee and unfinished paid job',async()=>{
     await fixture(page);await hire(page);await assign(page);
     await page.evaluate(()=>{G.realm=2;globalThis.beforeStaff53=JSON.stringify(XTSandbox.state().staff);globalThis.birth53=XTWorld36.get('lin').birth;});
     await inherit(page);
     assert.equal(await page.evaluate(()=>G.world36.playerId),'child53');
     assert.equal(await page.evaluate(()=>G.realm),0);
     assert.equal(await page.evaluate(()=>JSON.stringify(XTSandbox.state().staff)),await page.evaluate(()=>beforeStaff53));
     assert.equal(await page.evaluate(()=>XTWorld36.get('lin').birth),await page.evaluate(()=>birth53));
    });
    await check('actual reload resumes developer save without duplicate reward',async()=>{
     await page.evaluate(()=>save());await page.reload();
     await page.evaluate(()=>{economyFactor=()=>1;tryEvent=()=>null;meetLive=()=>null;tryRoadEvent=()=>null;pickRetreatEvent=()=>null;});
     assert.equal(await page.evaluate(()=>G.world36.playerId),'child53');
     assert.equal(await page.evaluate(()=>XTSandbox.state().staff.length),1);
     await page.evaluate(()=>{advanceDays(30,{act:'browser53',rate:0,incomeMul:0,eventRate:0});save();});
     assert.equal(await page.evaluate(()=>XTSandbox.state().warehouse.herb),4);
     await page.reload();
     assert.equal(await page.evaluate(()=>XTSandbox.state().warehouse.herb),4);
     await staff(page);
    });
    await check('staff controls fit viewport and remain reachable',async()=>{
     await page.locator('[data-sb="selectWorker"][data-arg="lin"]').click();
     assert(await page.locator('[data-sb="dismiss"][data-arg="lin"]').isVisible());
     const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
     assert(overflow<=1,'horizontal overflow '+overflow);
     await page.screenshot({path:path.join(out,device.name+'.png'),fullPage:true});
    });
    await check('unrelated new game has no previous estate employees',async()=>{
     await page.evaluate(()=>newGame('新来客','寒门散修','男'));
     assert.equal(await page.evaluate(()=>XTSandbox.state().staff.length),0);
     assert.equal(await page.evaluate(()=>XTSandbox.state().property),null);
    });
    assert.deepEqual(errors,[],'uncaught browser errors');
   }catch(error){await page.screenshot({path:path.join(out,device.name+'-failure.png'),fullPage:true});throw error;}finally{await context.close();}
  }
  fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({ok:true,count:results.length,results,scope:'controlled desktop/mobile Chromium, not physical phone or full-game balance'},null,2));
  console.log('ALL '+results.length+' BROWSER CHECKS PASSED');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
