const fs=require('fs'),path=require('path'),assert=require('assert');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/EDY/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.screenshots/batch34');
fs.mkdirSync(out,{recursive:true});
const results=[],errors=[];
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1360,height:960}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(root,'prototype/index.html')).href);
 await page.evaluate(()=>{
   newGame('闭环核验','寒门散修');chooseChild(0);XTOpening46.chooseTimeline(8,8);if(window.XTOpening46?.pending())for(let openingStep46=0;openingStep46<4;openingStep46++)XTOpening46.dispatch(XTOpening46.token(),0);beginCultivation();ensureGameSystems();
   G.mode='idle';G.lastResult=null;G.place='village';G.day=0;G.month=0;G.stones=100;
   globalThis.fixture=JSON.stringify(G);globalThis.oldTryEvent=tryEvent;globalThis.oldMeetLive=meetLive;
   tryEvent=()=>null;meetLive=()=>null;
   globalThis.resetGame=(extra={})=>{G=JSON.parse(fixture);Object.assign(G,extra);ovHide();render();};
 });
 async function check(name,fn){assert(await page.evaluate(fn),name);results.push(name);console.log('PASS '+name);}
 await check('7日采集推进日期并扣费给材料',()=>{resetGame();sysGather();return G.day===7&&G.month===0&&G.age===8&&G.stones===99&&G.inventory.herb>=1;});
 await check('10日炼丹跨月推进世界钟',()=>{resetGame({day:25,inventory:{herb:2}});const t=G.t;sysBrew();return G.day===5&&G.month===1&&G.t===t+1&&G.stones===97&&G.inventory.herb===0&&G.alchemyCount===1;});
 await check('猎妖耗一月且年龄只在跨年变化',()=>{resetGame({place:'ridge'});const t=G.t;sysHunt();return G.month===1&&G.day===0&&G.age===8&&G.t===t+1&&G.combatCount===1;});
 await check('跨年同步年龄日期和世界钟',()=>{resetGame({place:'ridge',month:11,day:20});const t=G.t;sysHunt();return G.age===9&&G.month===0&&G.day===20&&G.t===t+1;});
 await check('材料不足不耗时不扣钱',()=>{resetGame({inventory:{herb:1}});const before=JSON.stringify(G);sysBrew();return JSON.stringify(G)===before;});
 await check('城镇不可采集且荒野不可开炉',()=>{resetGame({place:'county'});sysGather();const a=G.day===0&&G.stones===100;resetGame({place:'ridge',inventory:{herb:2}});sysBrew();return a&&G.day===0&&G.inventory.herb===2;});
 await check('临终采集无材料奖励',()=>{resetGame({age:99,lifespan:100,month:11,day:29,inventory:{}});sysGather();return G.mode==='dead'&&G.age===100&&!G.inventory.herb&&G.stones===99;});
 await check('临终炼丹耗材不返还且不成丹',()=>{resetGame({age:99,lifespan:100,month:11,day:29,inventory:{herb:2}});sysBrew();return G.mode==='dead'&&G.inventory.herb===0&&!G.inventory.qiPill&&G.alchemyCount===0&&G.stones===97;});
 await check('临终猎妖不发奖励不记胜负',()=>{resetGame({place:'ridge',age:99,lifespan:100,month:11,day:29});sysHunt();return G.mode==='dead'&&!G.combatCount&&!G.combatWins&&G.stones===100;});
 await check('临终营生不发整月报酬',()=>{resetGame({place:'county',age:99,lifespan:100,month:11,day:29});actWork();return G.mode==='dead'&&G.stones===100;});
 await check('采集中遇事中断且无产物',()=>{resetGame({month:11,day:29});tryEvent=()=>EVENTS[0];sysGather();tryEvent=()=>null;return G.mode==='event'&&G.day===0&&G.month===0&&!G.inventory.herb&&G.stones===99;});
 await check('未解决事件的读档恢复可执行选项',()=>{const raw=localStorage.getItem(SAVE_KEY);const id=G.curEvent.id;restore(raw);return G.mode==='event'&&G.curEvent.id===id&&G.curEvent.opts.some(o=>typeof o.run==='function'||typeof o.chance==='function');});
 await check('事件期间不能用旧按钮刷材料',()=>{const raw=JSON.stringify(G);sysGather();return JSON.stringify(G)===raw;});
 await check('所有地点按设施开放营生和交易',()=>{resetGame();return Object.entries(PLACES).every(([id,p])=>canWorkAt(p)===['county','market','prefecture','riverTown','spiritMarket'].includes(id)&&canTradeAt(p)===canWorkAt(p));});
 for(const place of ['prefecture','riverTown','spiritMarket']){
   await check(place+'可以买卖并营生',()=>true);
   assert(await page.evaluate(place=>{resetGame({place,realm:2});sysBuy('herb');if(G.inventory.herb!==1)return false;sysSell('herb');if(G.inventory.herb!==0||G.stones>=100)return false;const b=G.stones;actWork();return G.stones>b&&G.month===1;},place));
 }
 await check('荒野无法通过直接调用出售物品',()=>{resetGame({place:'ridge',inventory:{herb:1}});sysSell('herb');return G.inventory.herb===1&&G.stones===100;});
 await check('物价跟世界纪年而非年龄变化',()=>{resetGame({place:'county'});const a=marketPrice('herb',3);G.age=900;const b=marketPrice('herb',3);G.t+=12000;return a===b&&marketPrice('herb',3)>a;});
 await check('七种灵根在九境均无突破资格硬锁',()=>{resetGame();return Object.entries(ROOTS).every(([name,r])=>REALMS.every((info,i)=>{Object.assign(G,{root:name,coef:r.coef,cap:r.cap,realm:i,layer:info.layers.length,cult:info.layers.at(-1),age:20,lifespan:100});return canBreak()&&naturalBreakAllowed()&&breakRate(0)>0;}));});
 await page.evaluate(()=>{resetGame({root:'绝灵根',coef:.9,cap:0,layer:13,cult:1335});openBreak();});
 assert(await page.locator('#btGo').isVisible());
 await page.screenshot({path:path.join(out,'desktop-breakthrough.png')});
 results.push('真实突破面板可打开且零前端异常');
 await check('低灵根可实际筑基并保留原年龄',()=>{resetGame({root:'绝灵根',coef:.9,cap:0,layer:13,cult:1335});const old=Math.random;Math.random=()=>0;doBreak(0);Math.random=old;return G.realm===1&&G.age===8&&G.lifespan===200&&G.mode==='result';});
 await check('突破失败按修为寿元代价结算且不换代',()=>{resetGame({layer:13,cult:1335});const old=Math.random;Math.random=()=>.999;doBreak(10);Math.random=old;return G.realm===0&&G.stones===90&&G.lifespan===97&&G.injured===3&&G.cult===1001&&G.mode==='result';});
 await check('修为未满无法绕过界面直接突破',()=>{resetGame();const b=JSON.stringify(G);doBreak(-100);return JSON.stringify(G)===b;});
 await check('丹药按共用修为函数晋升小阶',()=>{resetGame({cult:120,inventory:{qiPill:1}});sysUse('qiPill');return G.layer===2&&G.inventory.qiPill===0&&G.cult<realmNeed(0,2);});
 await check('正常相邻旅行按两日结算后抵达府城',()=>{resetGame({place:'county',realm:1});const t=G.t;arriveAt('county','prefecture',2);return G.place==='prefecture'&&G.day===2&&G.age===8&&G.t===t;});
 await check('旅行中寿尽停在起点而非传送抵达',()=>{resetGame({place:'county',realm:1,age:199,lifespan:200,month:11,day:29});arriveAt('county','prefecture',2);return G.mode==='dead'&&G.place==='county'&&!G.been.prefecture;});
 await check('旅行遇事保留剩余日程',()=>{resetGame({place:'county',realm:1,month:11,day:29});tryEvent=()=>EVENTS[0];arriveAt('county','prefecture',2);tryEvent=()=>null;return G.mode==='event'&&G.place==='county'&&G.road.days===1;});
 await check('半路读档不会免除剩余行程',()=>{const raw=localStorage.getItem(SAVE_KEY);restore(raw);return G.mode==='event'&&G.place==='county'&&G.road.days===1;});
 await check('解决路途事件后续走一日再抵达',()=>{G.mode='result';G.lastResult={title:'继续',text:'继续赶路'};G.curEvent=null;finishRoad();return G.place==='prefecture'&&G.day===1&&!G.road;});
 await check('药路需筑基与三株材料',()=>{resetGame({place:'county',inventory:{herb:3}});actLocalQuest('accept');return !G.localQuest&&G.inventory.herb===3&&G.day===0;});
 await check('药路承接扣材料耗一日并登记两年期限',()=>{resetGame({place:'county',realm:1,inventory:{herb:3}});actLocalQuest('accept');return G.localQuest.stage==='carrying'&&G.inventory.herb===0&&G.day===1&&G.localQuest.deadline-(absMonth()*30+G.day)===720;});
 await page.evaluate(()=>{departTo('prefecture');if(G.mode==='event'){G.road.cancel=false;G.mode='result';finishRoad();}});
 await check('药路守约结局登记折扣且只领奖一次',()=>{if(G.place!=='prefecture')return false;const price=marketPrice('qiPill',18),b=G.stones;actLocalQuest('aid');const after=G.stones;actLocalQuest('aid');return G.localQuest.ending==='aid'&&G.flag.medicineTrusted&&G.stones===after&&after>b&&marketPrice('qiPill',18)<price;});
 await page.evaluate(()=>openBagPanel('quest'));
 await page.screenshot({path:path.join(out,'desktop-quest-aid.png')});
 await check('药路读档保留后果',()=>{save();const p=marketPrice('qiPill',18);return restore(localStorage.getItem(SAVE_KEY))&&G.localQuest.ending==='aid'&&marketPrice('qiPill',18)===p;});
 await check('转卖结局获得更多灵石但无折扣',()=>{resetGame({place:'county',realm:1,inventory:{herb:3}});actLocalQuest('accept');G.place='prefecture';const price=marketPrice('qiPill',18),before=G.stones;actLocalQuest('profit');return G.localQuest.ending==='profit'&&!G.flag.medicineTrusted&&G.stones>before+30&&G.karma===3&&marketPrice('qiPill',18)===price;});
 await check('药路过期无奖励且无法再次领奖',()=>{resetGame({place:'prefecture',localQuest:{stage:'carrying',deadline:absMonth()*30}});const b=G.stones;advanceDays(1,{act:'idle',rate:0,incomeMul:0,eventRate:0});actLocalQuest('aid');return G.localQuest.ending==='expired'&&G.stones===b;});
 await check('旧存档缺少新任务字段仍正常加载',()=>{const old=JSON.parse(fixture);delete old.localQuest;delete old.realm;return restore(JSON.stringify(old))&&G.realm===0&&!G.localQuest&&G.stones===100;});
 await check('原悬赏奖励不能重复领取',()=>{resetGame({place:'county',huntBounty:{progress:3,claimed:false}});sysClaimBounty();const b=G.stones;sysClaimBounty();return G.stones===b&&G.huntBounty.claimed;});
 // Real-engine early-game policy: acquire funds at the county, travel home, pay for retreats,
 // recover the retreat penalty by walking a year, and retry breakthroughs after failure.
 const paths=await page.evaluate(()=>{
   const all=[],old=Math.random;let seed=1;
   Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
   const originalEvent=tryEvent,originalRetreat=pickRetreatEvent;
   tryEvent=()=>null;pickRetreatEvent=()=>null;
   for(const [root,def] of Object.entries(ROOTS)){
     let wins=0,sum=0,fail=0;const ages=[];
     for(let k=0;k<24;k++){
       seed=1000+k*71;resetGame({root,coef:def.coef,cap:def.cap,place:'county',stones:20,age:8,lifespan:100,layer:1,cult:0,attr:{gen:5,wu:5,qi:5,xin:5}});
       G.live={};G.family=[];
       // 18 months of actual work and actual four-day travel back to the village.
       for(let m=0;m<18;m++){G.mode='idle';actWork();}
       G.mode='idle';arriveAt('county','village',travelDays(100));
       let guard=0;
       while(G.age<G.lifespan && G.realm===0 && guard++<180){
         G.mode='idle';
         if(realmBrim()){doBreak(Math.min(200,Math.floor(G.stones)));if(G.realm===1)break;fail++;continue;}
         if(G.stones>=currentRetreatCost() && G.lifespan-G.age>10){doRetreat(Math.min(8,Math.floor(G.stones/currentRetreatCost()),Math.floor(G.lifespan-G.age-10)),retreatEfficiency());}
         else{const r=tickYear({act:'walk',eventRate:0});if(r.died)break;}
         // Clear only the summary panel. All age/cost/efficiency calculations above are real.
         G.mode='idle';
         if(G.rtCount>0 && G.age<G.lifespan){tickYear({act:'walk',eventRate:0});}
       }
       if(G.realm===1){wins++;sum+=G.age;ages.push(G.age);}
     }
     all.push({root,trials:24,reachedFoundation:wins,meanFoundationAge:wins?Number((sum/wins).toFixed(1)):null,range:ages.length?[Math.min(...ages),Math.max(...ages)]:[],failedBreakthroughAttempts:fail});
   }
   Math.random=old;tryEvent=originalEvent;pickRetreatEvent=originalRetreat;return all;
 });
 assert(paths.every(x=>x.reachedFoundation>0),'all root types have a tested route to foundation');
 results.push('七种灵根各24条实际函数前期路径均存在筑基成功样本');
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>{resetGame({place:'county',realm:1,inventory:{herb:3}});openBagPanel('quest');});
 await page.screenshot({path:path.join(out,'mobile-quest.png')});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile page overflow');
 results.push('手机委托面板无页面横向溢出');
 assert.deepStrictEqual(errors,[],'browser errors');
 const report={checks:results.length,passed:results,errors,earlyPaths:paths,scope:'真实Edge浏览器。前期策略样本排除随机事件/家人变化，并固定采样种子，保留实际营生/旅行/闭关/受伤/失败消耗；不是全流程通关率或玩家胜率。'};
 fs.writeFileSync(path.join(out,'validation.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify({checks:results.length,earlyPaths:paths},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
