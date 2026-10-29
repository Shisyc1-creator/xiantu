// Retained four-stage opening regression; new two-decision flow is covered by opening61 checks.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const {pathToFileURL} = require('url');
const {chromium} = require('C:/Users/EDY/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({channel:'msedge', headless:true});
  const errors = [];
  let count = 0;
  try {
    const context = await browser.newContext({viewport:{width:1440,height:1000}});
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.stack));
    const url = pathToFileURL(path.resolve(__dirname,'../prototype/index.html')).href;
    await page.addInitScript(()=>{globalThis.__legacyOpeningFixture=true;});await page.goto(url);
    async function check(name, fn) {
      assert(await page.evaluate(fn), name);
      console.log('PASS ' + name);
      count++;
    }
    await page.evaluate(() => XTMode41.start('沈初生','港口船户','女','standard'));
    await check('出生页显示零岁、国家与家庭，不显示测灵年龄选择', () => G.age===0 && !G.root && document.querySelector('#scene').textContent.includes(G.birthContext.country) && !document.querySelector('[data-time46]'));
    await page.locator('[data-v]').first().click();
    await check('选择家庭后仍为零岁，灵根未测且无功法', () => G.age===0 && G.root===null && !Object.keys(G.arts).length && document.querySelectorAll('[data-childhood48]').length===2);
    const initial = await page.evaluate(() => JSON.stringify(G));
    await page.locator('[data-childhood48="0"]').click();
    await page.reload();
    await page.locator('#coverResume').click();
    await check('成长途中刷新续档保留年龄和篇章，不提前揭示灵根', () => G.age===3 && G.opening46.childhood.step===1 && G.root===null);
    await check('过期成长按钮不重复推进或发放属性', () => {const before=JSON.stringify(G);return !XTOpening46.chooseChildhood(G.origin+'|childhood|0|0',0) && JSON.stringify(G)===before;});
    await check('旧的直接选龄接口不能跳过新童年', () => {const before=JSON.stringify(G);return !XTOpening46.chooseMeasureAge(12) && JSON.stringify(G)===before;});
    await check('成长写盘失败回滚日期、属性与记录', () => {const before=JSON.stringify(G),saved=localStorage.getItem(SAVE_KEY),set=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw Error('full');};const ok=XTOpening46.chooseChildhood(XTOpening46.childhoodToken(),0);Storage.prototype.setItem=set;return !ok && JSON.stringify(G)===before && localStorage.getItem(SAVE_KEY)===saved;});
    await page.evaluate(raw => {restore(raw);render();}, initial);
    for(let i=0;i<4;i++) await page.locator('[data-childhood48="0"]').click();
    await check('真实成长选择触发测灵，出生测灵分开登记', () => G.age===8 && G.measureAge===8 && !!G.root && G.lifeEvents.filter(x=>x.kind==='测灵').length===1 && G.lifeEvents[0].age===0 && G.lifeEvents[0].country===G.birthContext.country && G.lifeEvents[0].place===placeName(G.home));
    for(let i=0;i<4;i++) await page.locator('[data-opening46="0"]').click();
    await page.evaluate(() => {globalThis.entryStart48=XTSandbox.now();globalThis.entryDays48=XTOpening46.entryDays();});
    await page.locator('#btAwe').click();
    await check('授法后按天赋实际经过引气天数', () => G.mode==='result' && XTSandbox.now()-entryStart48===entryDays48 && G.lifeEvents.at(-1).kind==='引气入体' && G.entry47.status==='complete');
    await check('九条出身各家庭分支都能从出生走通成长与引气', () => {
      for(const origin of Object.keys(ORIGINS)) for(let variant=0;variant<ORIGINS[origin].variants.length;variant++) {
        XTMode41.start('沈逐程',origin,'男','standard');
        const c=XTBackground47.contexts.find(c=>c.weights[origin]>0 && XTBackground47.visibleOriginVariants(origin,c).some(x=>x.i===variant));
        if(!c)return false;
        G.birthContext=JSON.parse(JSON.stringify(c));
        chooseChild(variant);
        if(G.age!==0||G.root!==null)return false;
        for(let step=0;step<4;step++)if(!XTOpening46.chooseChildhood(XTOpening46.childhoodToken(),variant%2))return false;
        if(G.measureAge!==G.age||G.t-G.opening46.birthT!==G.age*12||G.opening46.childhood.history.length!==4)return false;
        for(const f of G.family||[])if(Number.isFinite(f.ageAtEight)){
          const n=XTWorld36.get('family_'+XTWorld36.world().playerId+'_'+f.id);
          if(f.age!==Math.max(0,f.ageAtEight-8+G.age) || (n&&XTWorld36.age(n)!==f.age))return false;
        }
        for(let step=0;step<4;step++)if(!XTOpening46.dispatch(XTOpening46.token(),0))return false;
        beginCultivation();if(G.mode!=='result'||!G.entry47?.completedAt)return false;
      }
      return true;
    });
    await check('九组籍贯地图高亮、国家与县域入口一致，其他州不假冒本地', () => {
      for(const c of XTBackground47.contexts){G.birthContext=JSON.parse(JSON.stringify(c));
        const el=document.createElement('div');el.innerHTML=mortalMapSvg();const current=el.querySelectorAll('.mapstate.is-current');
        if(current.length!==1||current[0].dataset.state!==c.stateKey||!el.textContent.includes(c.country))return false;
        el.innerHTML=stateMapSvg('凡界',c.stateKey);if(!el.querySelector('.maplocal')||!el.textContent.includes(c.county)||!el.textContent.includes(c.country))return false;
        el.innerHTML=localMapSvg();if(!el.textContent.includes(c.country)||!el.textContent.includes(c.county))return false;
        el.innerHTML=stateMapSvg('凡界',c.stateKey==='青'?'冀':'青');if(el.querySelector('.maplocal'))return false;
      }return true;
    });
    await page.evaluate(() => openMap());
    await check('打开县图时面包屑也使用当前籍贯', () => mapNav.state===G.birthContext.stateKey && document.querySelector('.mapcrumb').textContent.includes(G.birthContext.county));
    await page.locator('[data-map-level="state"]').click();
    await check('真实点击州域进入本州并提供本县入口', () => mapNav.state===G.birthContext.stateKey && document.querySelector('#mapBody .maplocal') && document.querySelector('#mapBody').textContent.includes(G.birthContext.country));
    await page.locator('[data-map-level="local"]').click();
    await check('返回县内后地图与面包屑仍一致', () => mapNav.state===G.birthContext.stateKey && document.querySelector('.mapcrumb').textContent.includes(G.birthContext.county));
    await page.evaluate(() => closeMainOverlay());
    await check('已入门旧角色读档不重演成长、不重发心法资源', () => {G.mode='idle';G.lastResult=null;const raw=JSON.stringify(G),before={age:G.age,stones:G.stones,arts:JSON.stringify(G.arts),events:JSON.stringify(G.lifeEvents)};if(!restore(raw))return false;render();return G.age===before.age&&G.stones===before.stones&&JSON.stringify(G.arts)===before.arts&&JSON.stringify(G.lifeEvents)===before.events&&!document.querySelector('[data-childhood48]');});
    await check('旧版尚未测灵档迁移到成长篇章并保留原文备份', () => {XTMode41.start('沈旧年','寒门散修','男','standard');chooseChild(0);const o=JSON.parse(JSON.stringify(G));o.root=o.opening46.latentRoot;o.opening46.version=1;delete o.opening46.latentRoot;delete o.opening46.childhood;const raw=JSON.stringify(o);if(!restore(raw))return false;render();return G.age===0&&G.root===null&&G.opening46.childhood.step===0&&JSON.parse(localStorage.getItem('xiantu_migration40_backups')).some(x=>x.raw===raw);});
    const normal = await page.evaluate(() => ({auto:localStorage.getItem(SAVE_KEY),slots:localStorage.getItem(SLOT_KEY)}));
    const dev = await context.newPage();
    dev.on('pageerror', error => errors.push(error.stack));
    await dev.goto(url+'?developer=1');
    assert(await dev.evaluate(() => XTDeveloper47.scenario('北地部族家庭')));
    assert.deepStrictEqual(await dev.evaluate(() => ({auto:localStorage.getItem('xiuxian_slice_v1'),slots:localStorage.getItem('xiuxian_slots_v1')})),normal);
    count++;console.log('PASS 独立开发场景经过新童年，正常自动与手动档不变');
    await page.setViewportSize({width:390,height:844});
    await check('手机成长页选项可见且无横向溢出', () => document.querySelectorAll('[data-childhood48]').length===2&&document.documentElement.scrollWidth<=innerWidth);
    const screenshot=path.join(os.tmpdir(),'xiantu-childhood48-mobile.png');
    await page.screenshot({path:screenshot,fullPage:true});
    assert.deepStrictEqual(errors,[]);
    const root=path.resolve(__dirname,'..');
    for(const name of ['opening46.js','background47.js','developer47.js'])assert(fs.readFileSync(path.join(root,'tools',name)).equals(fs.readFileSync(path.join(root,'prototype/assets',name))));
    const atlas=fs.readFileSync(path.join(root,'tools/atlas32.js'),'utf8').replace(/\r\n/g,'\n').trim();
    assert(fs.readFileSync(path.join(root,'prototype/index.html'),'utf8').replace(/\r\n/g,'\n').includes(atlas));
    console.log('ALL '+count+' CHECKS PASSED; source copies match; no browser errors. Screenshot: '+screenshot);
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
