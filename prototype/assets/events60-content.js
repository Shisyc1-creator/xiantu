/* Remaining discoveries, cultivation and travel use existing goods and clocks. */
(()=>{'use strict';
const E=XTEvents60,S=XTSandbox,W=XTWorld36,C=XTContent47;
const result=(t,log=t)=>({t,log}),leave={l:'暂不参与，继续自己的安排',run:()=>result('你收拾行装，继续原来的安排。','暂未参与这次往来')};
const stock=id=>S.shopState(id),has=(id,n=1)=>(G.inventory?.[id]||0)>=n;
function practice(days){gainCult(G,Math.max(0,yearOutput(G)*days/360*CFG.walkRate));return result('你循着当前主修功法反复运转周天，收功时将这次心得记下。','按实际功法修行'+days+'日');}
function patch(id,def,why){return E.patch(id,def,why);}
function bind(id,actor){const e=EVENTS.find(e=>e.id===id);const cond=e.cond;patch(id,{bind60:()=>({actorId:actor}),actorMode60:'present',cond:s=>W.present(actor)&&(!cond||cond(s))},'交易/服务须与原在世当事人当面办理');}
function creditOption(id,actor){const e=EVENTS.find(e=>e.id===id);for(const o of e.opts)for(const key of ['run','ok','no'])if(o[key]){const fn=o[key];o[key]=s=>{if(o.cost)stock(actor).wallet+=o.cost;if(o.wen){const n=W.get(actor);n.wen60=(n.wen60||0)+o.wen;}return fn(s);};}}
// The former stall shortcut now delivers an actual copy and debits actual stock.
patch('E001',{text:'摊主取出一册《引气篇》旧抄本，开价三十灵石。纸页有缺角，内容仍须买回后自行阅读、研习。',bind60:()=>({actorId:'stall'}),actorMode60:'present',cond:()=>W.present('stall'),opts:[
 {l:'付三十灵石买下抄本',cost:30,check:()=>stock('stall').stock.qiManual>0?'':'抄本已经售完。',run:s=>{stock('stall').stock.qiManual--;stock('stall').wallet+=30;s.inventory.qiManual=(s.inventory.qiManual||0)+1;s.flag['残页']=true;return result('你收好抄本，尚未据此学成功法。','购得《引气篇》旧抄本一册，付30灵石');}},leave]},'物品、货款和掌柜库存交割，不直接学成功法');
patch('E002',{text:'村中长者提起县城货街正在找短工。正式做工要到货街当面承接，做满三十日才结款；你可以先去看看，也可以另作安排。',bind60:()=>({actorId:'elder'}),actorMode60:'present',cond:()=>W.present('elder'),opts:[{l:'问清货街所在，记下门路',run:()=>{E.touch('elder','问清县城货街短工的去处。');return result('长者指明了县城货街的位置。是否承接、何时去，都由你决定。眼下没有预支工钱。','问得县城货街短工门路');}},leave]},'由已有有限预算短工入口替代无雇主的多年收入承诺');
// Existing robbers are defeated through the same real turn-based battle engine.
const bandits=()=>['ridge_shi','ridge_luo'].every(id=>W.present(id));
patch('E003',{text:'石二和罗六拦在山道前。可以交出身上四成半灵石脱身、退避一日，或准备与他们真正交手。',bind60:()=>({actorId:'ridge_shi'}),actorMode60:'present',cond:s=>s.realm===0&&bandits(),opts:[
 {l:'准备斗法，先观察敌手',run:()=>{E.state().tasks.E003={id:'E003',title:'山道交涉',ownerId:W.world().playerId,sourceId:'ridge_shi',place:G.place,status:'active',next:'在山野深处找到石二，选择当面斗法；也可取消。'};return result('你与二人拉开距离，准备好再当面交手。你仍可离开这处山道。','准备山道斗法，未直接判定胜负');}},
 {l:'交出四成半灵石，脱身',run:s=>{const n=Math.floor(s.stones*.45);C.debit('stone',n,'山道交涉');const p=W.get(E.context('E003').actorId);p.wallet52=(p.wallet52||0)+n;E.touch(p.id,'在山道收取了你的'+n+'灵石。',-1);return result('你交出'+n+'灵石，沿山道退开。','山道交出'+n+'灵石脱身');}},
 {l:'退避一日，另找时机通过',days:1,run:()=>result('你退回开阔处，耽搁一日后另寻通过时机。','山道退避一日')}]},'战斗须实际交手，交涉钱款转入真实人物');
XTQi51.enemies.bandit60={...XTQi51.enemies.wolf,name:'石二与罗六',actor60:true,layer:5};
E.registerAction('banditFight',()=>{const t=E.state().tasks.E003;if(t?.status==='active'&&bandits()&&G.place===t.place&&S.state().room==='hunt')XTQi51.startBattle('bandit60');});
E.registerAction('banditCancel',()=>{const t=E.state().tasks.E003;if(t?.status==='active')C.atomic(()=>{t.status='cancelled';addLog('放下山道斗法准备，另作安排。','mute');});});
E.registerActorPanel('bandits',id=>{const t=E.state().tasks.E003;if(t?.status!=='active')return '';return (id==='ridge_shi'&&bandits()?E.button('当面斗法 · 实际寻敌7日','banditFight'):'')+E.button('取消山道斗法准备','banditCancel');});
E.registerBattle('bandits',(b,outcome)=>{const t=E.state().tasks.E003;if(t?.status!=='active'||b.training||b.target!=='bandit60'||b.place!==t.place)return;if(outcome==='win'){t.status='done';for(const id of ['ridge_shi','ridge_luo']){const n=W.get(id);if(W.alive(n)){n.staff54||={};n.staff54.injuredUntil=S.now()+360;E.touch(id,'在山道实际交手，被你击退。',-2);}}}else t.status=outcome==='flee'?'cancelled':'failed';});
// Earlier item fixes retain their physical outcomes; now bind their sellers as well.
for(const [id,npc]of [['E007','dan'],['E029','stall'],['E030','stall'],['E036','mentor'],['E026','inn_host45'],['E037','mentor']])bind(id,npc);
for(const [id,npc]of [['E007','dan'],['E029','stall'],['E030','stall'],['E026','inn_host45'],['E037','mentor']])creditOption(id,npc);
const night=EVENTS.find(e=>e.id==='E030');const oldNight=night.opts[0].ok;night.opts[0].check=()=>stock('stall').wallet>=70&&(stock('stall').stock.qiPill||0)>=2?'':'这批货物或钱款已不齐，暂不成交。';night.opts[0].ok=s=>{stock('stall').wallet-=70;stock('stall').stock.qiPill-=2;return oldNight(s);};
patch('E008',{text:'雷击过的古树仍有半边新枝。树下可以静坐，所得仍来自自己的功法与实际修行时日。',opts:[{l:'在这里静修三年',days:1080,run:()=>practice(1080)},{l:'留七日梳理所学',days:7,run:()=>practice(7)},leave]},'修行用真实时间和既有功法公式，不永久提升悟性');
patch('E010',{name:'来历不明的招募帖',text:'街角贴着一张没有署名的招募帖，声称能让人迅速筑基。纸上没有可核验的经办人，也没有说明功法来历。',cond:()=>true,opts:[{l:'记下来，留待向实际传习者核问',run:s=>{s.flag.unverifiedRecruit60=true;return result('你抄下帖上的说法，没有签约，也没有领取所谓入门钱。','记录一张未核实的招募帖');}},leave]},'未核实的消息不生成组织身份、功法、金钱或魔道标签');
patch('E011',{name:'崖边泉息',text:'山腹泉边的灵气让你留意起来。这里尚无归你使用的洞府或阵地，可以短暂修行，不能凭发现一口泉取得产权。',opts:[{l:'在泉边修行七日',days:7,run:()=>practice(7)},{l:'记下地点，以后再来',run:s=>{s.flag.spring60={place:s.place,at:S.now()};return result('你记下泉边的方位，收好行装。','记录崖边泉水所在');}},leave]},'不虚构洞府、阵法、宗门赏金和内门身份');
patch('E014',{cond:s=>!!s.flag.heartDemon||(s.injured||0)>0,text:'现有的伤势或心神不宁影响着运功。你可以停功调整，也可以使用行囊中真实持有的药散。',opts:[{l:'停功调息七日',days:7,run:s=>{s.flag.heartDemon=false;return result('你暂缓运功，七日后心神安定下来。长期伤势仍照实际状态处理。','停功调息七日，平复心神');}},{l:'服养脉散一份，调息一日',days:1,items:{healingPowder:1},run:s=>{s.injured=Math.max(0,(s.injured||0)-1);return result('你服用养脉散，按原有药效缓解一年伤势。','服养脉散，伤势缓解一年');}},{l:'停功调养一年',days:360,run:()=>result('你用一年慢慢调养，伤势随实际日期与原有恢复规则变化。','停功调养一年')}]},'真实伤势前置，药效沿用现有药物，不凭空散功或减寿');
patch('E016',{text:'你收存的旧页上有些字迹模糊，需要花时间辨认。辨出字句也不等于已经找到密室或练成下卷。',cond:s=>!!s.flag['残页'],opts:[{l:'留七日辨认并誊录',days:7,run:s=>{s.flag.yujian='copied';return result('你将还能辨认的字句誊在旧页背后，收入原卷。未核实的地名也一并标明。','誊录旧页字句，地点尚待核实');}},leave]},'旧页只产生可核实记录，不虚构两年旅行与现成修为');
patch('E020',{cond:s=>s.age>=s.lifespan*.8&&!s.flag.warned,text:'岁月已占去寿限的大半。你重新算了一遍年月，往后怎样安排，仍由自己决定。',opts:[{l:'记清余年，调整自己的安排',run:s=>{s.flag.warned=true;return result('你记下尚余约'+Math.max(0,Math.floor(s.lifespan-s.age))+'年，将想做的事重新排了次序。','重新核对实际年龄与寿限');}}, {l:'照原来的步子走',run:s=>{s.flag.warned=true;return result('你放下笔，照常安排接下来的日子。','核对寿限后继续原有安排');}}]},'寿限警示不额外惩罚或造出延寿药');
patch('E021',{text:'闭关时心绪纷杂，几次运功都难以安定。可以停下来调息；强行追逐气机，可能散失已有修为。',opts:[{l:'停功七日，平复心绪',days:7,run:s=>{s.flag.heartDemon=false;return result('你暂时停功，将心绪慢慢理顺。','调息七日，心神安定');}},{l:'再试一日，若失控便收功',days:1,chance:s=>.5+(s.attr.xin-5)*.05,ok:s=>{s.flag.heartDemon=false;return practice(1);},no:s=>{s.cult=Math.floor(s.cult*.8);s.flag.heartDemon=true;return result('气机未能理顺，你收功时散失两成当前修为，心神仍未平复。','强行运功失利，当前修为减少20%，心神不宁');}}]},'心神状态有真实效果与化解入口，不因一夜凭空减寿');
patch('E022',{text:'静坐中，你察觉到一处以往忽略的运功细节。是否继续推敲，需要自己花时间。',opts:[{l:'留七日反复练习',days:7,run:()=>practice(7)},leave]},'心得以实际修炼兑现，不直接提升资质');
patch('E023',{text:'运功来到熟悉的关节，你可以继续梳理已学功法。正式突破仍须依自身修为、环境和准备判断。',opts:[{l:'按现有功法修行七日',days:7,run:()=>practice(7)},leave]},'不绕过实际圆满与突破规则');
patch('E028',{name:'摊前问药',text:'摊主摆出封存的聚气散，真假和数量都须看实货，不能只凭一句半价便当场吞服。',bind60:()=>({actorId:'stall'}),actorMode60:'present',cond:()=>W.present('stall'),opts:[{l:'问清现货与标价',run:()=>{E.touch('stall','问过聚气散现货，尚未购买。',0);return result('你问清了现货。要不要买，仍可在摊主面前逐件查看后决定。','问过聚气散现货，未付钱或服药');}},leave]},'购买和服用回到真实陈列与行囊入口，不凭空判假丹');
patch('E031',{text:'摊主谈起县城货街的营生，说明正式短工需在货街承接，不能在这里先领几个月工钱。',bind60:()=>({actorId:'stall'}),actorMode60:'present',cond:()=>W.present('stall'),opts:[{l:'问清短工去处',run:()=>{E.touch('stall','问清县城货街短工的去处。');return result('你记下县城货街的位置。正式做满三十日后，由当地货栈按已有预算结款。','问得县城短工去处，未预支报酬');}},leave]},'以已有实际营生替代零时间三个月工钱');
patch('E034',{cond:s=>(s.injured||0)>0||!!s.flag.heartDemon,text:'现有的伤势或心神不宁让气血难以安定。你可以先调息，或按原药效使用已有药散。',opts:[{l:'服养脉散一份，调息一日',days:1,items:{healingPowder:1},run:s=>{s.injured=Math.max(0,s.injured-1);return result('你服下养脉散，伤势按原药效缓解。','消耗养脉散一份，缓解一年伤势');}},{l:'调息七日，平复心神',days:7,run:s=>{s.flag.heartDemon=false;return result('你停功七日，心神慢慢平复。','调息七日，平复心神');}},leave]},'实际状态前置，不以睡不着为由永久改变根骨');
patch('E038',{bind60:()=>({actorId:'mentor'}),actorMode60:'present',cond:()=>W.present('mentor'),text:'观中执事正在讲解基础运功。你可用一日听讲，并以自己已学的功法慢慢印证。',opts:[{l:'听讲并印证一日',days:1,run:()=>{E.touch('mentor','听讲并印证基础运功一日。');return practice(1);}},leave]},'真实当事人与耗时，不靠一句答话永久加悟性');
patch('E040',{text:'崖下起了浓雾，药坡若隐若现。进雾寻路要耗一日，也可能空手而返。',opts:[{l:'进雾寻找药草一日',days:1,chance:()=>.45,ok:s=>{s.inventory.herb=(s.inventory.herb||0)+2;return result('雾散时，你辨回原路，带回青叶草两株。','雾中寻得青叶草2株');},no:()=>result('你在雾里绕了一日，最后仍回到原路，没有取得药材。','雾中寻路一日，未取得产物')},leave]},'真实时间与采集物，不饮泉凭空延寿');
patch('E042',{text:'焦黑的岩石里露出一块含灵矿砂。残留的雷气尚未散净，靠近有受伤风险。',opts:[{l:'花一日探取矿砂',days:1,chance:()=>.5,ok:s=>{s.inventory.ironOre=(s.inventory.ironOre||0)+1;return result('你避开仍带电光的裂缝，取出赤铁砂一份。','取得赤铁砂1份');},no:s=>{s.injured=Math.max(s.injured||0,1);return result('你被残雷击伤，未能取出矿砂，需要按现有伤势养伤。','被残雷所伤，伤势至少一年');}},leave]},'危险和实物对应，不虚构渡劫者死亡与灵骨感悟');
patch('E044',{name:'岭上旧路标',text:'岔路旁有一块旧路标，箭头旁刻着雨后绕行的记号。可以花一日查看附近路面。',opts:[{l:'查看雨后路况一日',days:1,run:s=>{s.knowsRidge=true;return result('你沿近处山道查过湿滑的石阶，将眼见的路况记下，没有据此推断远处也同样安全。','实地查看岭上雨后路况一日');}},leave]},'以可见路标替代重复出现且无档案的樵夫，不加属性');
const rest=EVENTS.find(e=>e.id==='E045');rest.opts[0].no=s=>{const n=Math.min(10,s.stones);C.debit('stone',n,'破庙遗失钱款');return result('醒来时布包破了一道口子，清点后少了'+n+'灵石，没能找回。','夜宿遗失'+n+'灵石');};E.review('E045','实际过夜与实际损失，不把匿名偷窃写成已确定的人物事实');
patch('E046',{text:'山洞深处传出长短不一的呜声，听不清是风还是别的动静。你可花一日沿安全处辨认，也可以离开。',opts:[{l:'沿安全处辨认声音一日',days:1,run:s=>{s.flag.ridgeSound60={at:S.now(),place:s.place};return result('你沿安全处听过，发现这一次的声音随洞口风向变化。没有追进更深的洞穴。','核实这次洞口风声，未深入险处');}},leave]},'只记录亲见结果，不造鬼物、人命与永久属性');
patch('E049',{text:'摊主正在收购青叶草。你可以按他眼前的钱匣和实际收购价交一株，也可以只问价。',bind60:()=>({actorId:'stall'}),actorMode60:'present',cond:()=>W.present('stall'),opts:[{l:'按现价交一株青叶草',days:1,items:{herb:1},check:()=>stock('stall').wallet>=C.price('stall','herb',true)?'':'摊主现有货款不足。',run:s=>{const n=C.price('stall','herb',true);stock('stall').wallet-=n;stock('stall').stock.herb=(stock('stall').stock.herb||0)+1;stoneChange(s,n,'当面出售青叶草');return result('你交出一株青叶草，结清'+n+'灵石。','出售青叶草1株，得'+n+'灵石');}},{l:'只问现价，不交货',run:()=>result('摊主报了当前收购价，你没有交货或收钱。','询问草药收购价')},leave]},'真实货款交割，不凭斗价提高属性');
const herbEvent=EVENTS.find(e=>e.id==='E004');herbEvent.opts[0].days=1;herbEvent.opts[0].hint='若被青鳞蛇咬伤，可能损寿6年并留下4年伤势。';
herbEvent.opts[1]={l:'在安全处留意七日，等待蛇外出',days:7,chance:()=>.6,ok:s=>{s.inventory.purpleFungus58=(s.inventory.purpleFungus58||0)+1;return result('第七日蛇离开石缝，你趁机采下紫芝，收入行囊。','等待七日，采得紫芝一株');},no:()=>result('留意了七日，始终没有安全下手的机会。你放弃这次采药，空手离开。','等待七日，未采得紫芝')};
patch('E032',{cond:s=>(s.injured||0)>0,text:'旧伤在运功时隐隐作痛。可以用手头的养脉散缓解，也可以花时间调养。',opts:[{l:'先休养七日',days:7,run:()=>result('你停下劳碌，休养七日，伤势仍照实际状态处理。','休养七日')},{l:'服养脉散一份，调息一日',days:1,items:{healingPowder:1},run:s=>{s.injured=Math.max(0,s.injured-1);return result('你服用养脉散，缓解一年伤势。','消耗养脉散一份，缓解一年伤势');}},{l:'停功调养一年',days:360,run:()=>result('你花了一年调养，伤势随现有恢复规则变化。','带伤调养一年')}]},'治疗有真实药物或实际时间，不凭空支付40灵石便根治');
// Earlier successful item and care paths are retained after explicit review.
for(const id of ['E004','E007','E019','E026','E029','E030','E032','E036','E037','E041'])E.review(id,'已核对现有实物/服务、时钟、NPC及原始费用；统一入口复核并原子结算');
// No travel choice pays an anonymous employer or changes permanent talent.
const roads={
 R01:['同路','背书箱的旅人问能否同行一段。他走得慢，你要为同行多留两日。',[['放慢脚步，与他同行',2,'你陪旅人走到岔路，多用了两日，随后各自继续赶路。'],['各走各的',0,'你说明自己另有行程，独自继续赶路。']]],
 R02:['断桥','前方木桥损坏，需要停下查看或从别处绕行。',[['绕路三日',3,'你沿上游绕过断桥，多走三日。'],['留一日查看安全过处',1,'你花一日查看河岸，从可通行的浅处绕过。']]],
 R03:['骡队','骡队走得慢，管事愿让你沿车辙同行，但没有与你订立护送雇约。',[['随骡队慢行两日',2,'你与骡队共走一段，多花两日。你没有领到尚未约定的护送工钱。'],['不搭伙，自己走',0,'你沿自己的路线继续走。']]],
 R04:['路沟里的遗物','路沟里散着破布与遗物，你无法据此确认失主身份或死因。',[['留一日查看并记下位置',1,'你没有私取来路不明的财物，记下位置后继续行程。'],['不动遗物，继续赶路',0,'你未动路边遗物，继续赶路。']]],
 R05:['野狗','几只野狗在前方徘徊。绕行要多花一日。',[['绕行一日',1,'你绕开狗群，多走一日。'],['停一日等它们散去',1,'你等了一日，狗群散去后再走。']]],
 R06:['连雨','连日下雨，山路泥泞。可以慢行，也可以停下避雨。',[['慢行两日',2,'你放慢脚步探路，多花两日。'],['停一日避雨',1,'你在石檐下避雨一日后继续走。']]],
 R07:['山火','前方山火未熄，不能安全穿过火线。可以绕远，或暂且折返。',[['绕远三日',3,'你从沟谷绕过山火，多走三日。'],['暂时折返',0,'你放下这次行程，退回原处。',true]]],
 R08:['旧物摊','路边有人卖来历未明的旧物。你没有凭据确认其归属，也未检验过成色。',[['问过来历，不买',0,'对方未能讲清来历，你没有付钱。'],['不驻足，继续赶路',0,'你没有购买旧物，继续赶路。']]]
};
for(const [id,[name,text,choices]]of Object.entries(roads))patch(id,{name,text,cond:()=>true,opts:choices.map(([l,d,t,cancel])=>({l,d,cancel:!!cancel,run:()=>result(t,name+'：'+t)}))},'路途延误由真实行程兑现，无零时间工钱、永久属性或不明寿元扣除');
})();
