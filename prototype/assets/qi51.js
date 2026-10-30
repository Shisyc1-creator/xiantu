/* 炼气篇：学习与配功、逐回合斗法、实际恢复、当面委托。首版数值为本项目平衡值。 */
(()=>{'use strict';
const S=XTSandbox,W=XTWorld36,V=S.view,C=XTContent47;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const B=(label,a,arg='',off=false)=>`<button class="sb-btn" data-sb="q51:${a}" data-arg="${esc(arg)}" ${off?'disabled':''}>${esc(label)}</button>`;
const card=(title,body,buttons='')=>`<article class="sb-card qi-card51"><h3>${esc(title)}</h3><p>${body}</p><div class="sb-buttons">${buttons}</div></article>`;
let message='';
function commit(fn){const ok=C.atomic(fn);if(!ok)message=C.takeFailure()||'保存失败，本次行动已撤回。';return ok;}
const library={
 '养锋诀':{id:'edge51',kind:'心法',desc:'凝气于锋，短促发力；持剑时擅长剑术。',flow:'burst',focus:'edge',bonus:'edge',price:18},
 '锻骨诀':{id:'body51',kind:'心法',desc:'以真元温养筋骨，发力迅猛，近身招式较稳。',flow:'burst',focus:'body',bonus:'body',price:18},
 '御器诀':{id:'spirit51',kind:'心法',desc:'以心神牵引器物，持续分念；需法器才能御器攻击。',flow:'steady',focus:'spirit',bonus:'spirit',price:18},
 '定神篇':{id:'focus51',kind:'心法',desc:'稳住分念，减轻精细运气消耗。',flow:'steady',focus:'spirit',bonus:'focus',price:10},
 '养元诀':{id:'restore51',kind:'心法',desc:'调息时收束散逸真元，擅长战中续气。',flow:'steady',focus:'body',bonus:'restore',price:10},
 '缓息诀':{id:'calm51',kind:'心法',desc:'维持舒缓气息，守势时加固气罩；与短促爆发的运气要求相冲。',flow:'slow',focus:'guard',bonus:'calm',price:10},
 '点锋剑术':{id:'sword51',kind:'术法',desc:'借剑锋刺破守势，须装备兵器。',route:'攻',move:'sword',price:8},
 '震脉掌':{id:'palm51',kind:'术法',desc:'近身发劲，击中后打乱敌人的蓄势。',route:'攻',move:'palm',price:8},
 '牵丝御器术':{id:'control51',kind:'术法',desc:'以法器牵制敌手，削弱下一次攻击；须装备法器。',route:'攻',move:'control',price:8}
};
Object.assign(library,window.XTQi52Data?.library||{});
for(const [title,m]of Object.entries(library)){
 const effects={'养锋诀':{absorb:.04,bt:.003,life:0},'锻骨诀':{absorb:.025,bt:0,life:2},'御器诀':{absorb:.035,bt:.004,life:0},'定神篇':{absorb:0,bt:.0025,life:0},'养元诀':{absorb:.035,bt:0,life:3},'缓息诀':{absorb:.02,bt:0,life:1}};
 MANUALS[title]={kind:m.kind,tier:m.tier||'黄',from:m.stage>1?'本地传习者核验修行经历后出售':'县中传习书摊、山门传习',desc:m.desc,effect:m.kind==='心法'?(m.effect||effects[title]):{route:m.route}};
 const name='《'+title+'》抄本';BAG_ITEMS[m.id]={name,price:m.price,desc:'在行囊阅读收录，再到修行 → 功法研习入门。'+m.desc};
 C.catalog[m.id]={id:m.id,name,price:m.price,currency:'stone',kind:'书册',grade:(m.tier||'黄')+'阶·'+(m.stage||1)+'层篇',source:MANUALS[title].from,desc:BAG_ITEMS[m.id].desc};
 C.manuals[title]={id:m.id,name:title,kind:m.kind,grade:(m.tier||'黄')+'阶',source:MANUALS[title].from,effect:MANUALS[title].effect};
}
function ownLevel(title){return S.state().books[title]?.level||0;}
function state(){if(!G?.root||!G.world36?.playerId)return null;const id=G.world36.playerId;if(!G.qi51||G.qi51.ownerId!==id)G.qi51={version:1,ownerId:id,aux:[],battle:null,record:null,quest:null,health:null};return G.qi51;}
function bind(root=document.getElementById('scene')){root?.querySelectorAll('[data-sb]').forEach(b=>b.onclick=()=>S.dispatch(b.dataset.sb,b.dataset.arg));}
function page(title,body){document.body.classList.add('sb-screen');document.getElementById('scene').innerHTML='<section class="sb-shell qi51"><header class="sb-head"><div><small>'+esc(W.locationLabel())+'</small><h2>'+esc(title)+'</h2></div></header><div class="sb-scroll">'+(message?'<p class="qi-notice51" role="status">'+esc(message)+'</p>':'')+body+'</div></section>';bind();}
function tell(text){message=text;render();}
function qiReady(){return !!G&&(G.realm===0||G.realm===1&&!!window.XTFoundation57)&&systemReady();}
function teacherHere(){if(G.realm===1)return !!window.XTFoundation57?.trainingHere();return G.place==='county'&&S.state().room==='square'||G.place==='temple'&&S.state().room==='hall';}
function studyShop(){page('当地传习',B('各路进阶传习与百艺','routes52')+card('抄本与来路','这里是当地公开传习处。购买得到未入门抄本，不直接学成；保留原有门派传承与家传进度。'+(teacherHere()?'':'须实际到县城入口或道观前院才能购买。'))+Object.entries(library).filter(([,m])=>!m.route52).map(([title,m])=>card(title,esc(m.desc)+'<br>'+m.price+' 灵石 · '+(S.state().books[title]?'已收录':'尚未收录'),B('购买抄本','buy',title,!teacherHere()||!!S.state().books[title]||(G.inventory[m.id]||0)>0))).join('')+B('返回场景','scene'));}
function readBook(id){const entry=Object.entries(library).find(([,m])=>m.id===id);if(!entry)return false;const [title]=entry;if(!systemReady()||(G.inventory[id]||0)<1)return true;if(S.state().books[title]){tell('此法已收录，去修行 → 功法研习即可。');return true;}commit(()=>{G.inventory[id]--;S.state().books[title]={level:0};addLog('收录《'+title+'》抄本，尚待研习入门。','mute');});render();return true;}
function guide(){
 if(G.realm>0)return card('炼气篇已走过','你已晋入'+esc(REALM_NAMES[G.realm])+'。主辅配功与已学进度保留，已完成的护路差事不会重开；筑基后可在府域行程继续传习、逐回合斗法与百艺生活。',B('功法与配招','arts')+B('继续修行','cult'));
 const d=S.state(),q=state(),hasMind=!!d.mind&&ownLevel(d.mind)>0,spells=d.spells.filter(n=>ownLevel(n)>0),quest=q.quest;
 let next=!hasMind?'先完成家传授法，或到县城入口 / 道观前院购买心法，收录并研习入门。':!spells.length?'到当地传习处取得招式抄本 → 行囊阅读 → 功法研习 → 运用招式。':(G.injured||0)>0?'你仍有伤势。先使用养脉散、凝血丹，或在安全地点休养。':!quest?'到县城入口查看护路告示，可先做无奖励的演练熟悉招式。':quest.status==='ready'?'护路任务已完成，回县城入口当面提交回报。':'到有妖兽出没地区的山野深处，寻找任务目标。';
 if(!canBreak()&&quest?.status==='done'){const c=commissions[quest.index+1];next=c?(G.layer<c.layer?'本段差事已结清；先修行到炼气'+c.layer+'层，再回县城入口接下一段护路差事。':'回县城入口接取「'+c.name+'」，检查气血、术法和器物后再出行。'):'三段护路已结清，继续积累至炼气圆满，在修行页准备筑基。';}
 if(canBreak())next='本境修为已满，检查伤势与灵石，在修行页点击突破筑基；可先完成仍在手中的差事。';
 return card('炼气行程',esc(next)+'<br>当前：'+esc(curRealmTxt())+' · 主修 '+esc(d.mind||'未定')+' · 已备术法 '+spells.length+'/2'+(canBreak()?'<br>本境修为已满，可在修行页准备突破筑基。':'<br>修为按原有地点灵气、资质和时日增长；战斗不直接送修为。'),B('功法与配招','arts')+B('修行','cult')+B('演练与斗法','hub')+B('各路修行与百艺','routes52'));
}
const old={renderScene,renderView:W.renderView,dispatch:S.dispatch,restore,newGame,systemReady,artMindSum,sysHunt,sysUse,renderActions,renderHUD};
function dispatch(a,arg){
 if(a==='read'&&readBook(arg))return true;
 if(!a.startsWith('q51:'))return false;if(!systemReady())return true;message='';
 const type=a.slice(4);
 if(type==='scene'){S.go('scene');return true;}
 if(type==='cult'){S.go('cult');return true;}
 if(type==='arts'){S.go('cult','arts');return true;}
 if(type==='shop'){V.tab='shop51';render();return true;}
 if(type==='buy'){
  const m=library[arg];if(!qiReady()||!teacherHere()||!m||S.state().books[arg]||(G.inventory[m.id]||0)>0)return true;
  const why=window.XTQi52?.acquireReason(arg);if(why){tell(why);return true;}
  if(G.stones<m.price){tell('灵石不足，抄本价格为'+m.price+'灵石。');return true;}
  commit(()=>{stoneChange(G,-m.price,'当地传习抄本');window.XTQi52?.onManualBought(m.price);G.inventory[m.id]=(G.inventory[m.id]||0)+1;addLog('购买《'+arg+'》抄本；须在行囊阅读后研习。','mute');});render();return true;
 }
 return extraDispatch(type,arg);
}
// 品阶折算只作用于该功法实际存在的条目；不存在的条目不生成收益。
const rules={auxLimit:2,grade:{黄:.10,玄:.15,地:.20,天:.25},cap:{absorb:.03,bt:.005,life:2}};
function compatibility(main,aux){const a=library[main],b=library[aux];if(!a||!b)return {label:'中性',scale:.5,burden:0,reason:'现有传承未记有专门配合，按中性发挥。'};if(a.flow==='burst'&&b.flow==='slow'||a.flow==='slow'&&b.flow==='burst')return {label:'冲突',scale:0,burden:1,reason:'主辅分别要求短促爆发与舒缓运气，每回合额外耗1真元。'};if(a.focus===b.focus||b.bonus==='focus'&&['edge','spirit'].includes(a.focus)||a.flow==='slow'&&b.flow==='slow')return {label:'适配',scale:1,burden:0,reason:'运气需求可以配合。'};return {label:'中性',scale:.5,burden:0,reason:'可共同运行，专项作用与叠加收益减半。'};}
function auxiliary(s=G){const d=s.sandbox35,q=s.qi51,result={absorb:0,bt:0,life:0,burden:0,focus:0,restore:0,calm:0,edge:0,body:0,spirit:0,details:[]};if(!d||q?.ownerId!==s.world36?.playerId)return result;
 for(const title of (q.aux||[]).slice(0,rules.auxLimit)){const m=MANUALS[title],level=d.books[title]?.level;if(title===d.mind||!m||m.kind!=='心法'||!level)continue;const c=compatibility(d.mind,title),factor=(.5+level*.5)*(rules.grade[m.tier]||.1)*c.scale;for(const k of ['absorb','bt','life'])result[k]+=(m.effect[k]||0)*factor;result.burden+=c.burden;const feature=library[title]?.bonus;if(feature)result[feature]=(result[feature]||0)+(c.label==='冲突'?.5:c.scale);result.details.push({title,...c});}
 for(const key of ['absorb','bt','life'])result[key]=Math.min(rules.cap[key],result[key]);return result;
}
artMindSum=function(s){s=s||G;const m=old.artMindSum(s),a=auxiliary(s);return {absorb:m.absorb+a.absorb,bt:m.bt+a.bt,life:m.life+a.life};};
function syncAuxLife(){const q=state(),next=auxiliary().life,prior=q.lifeApplied||0;G.lifespan+=next-prior;q.lifeApplied=next;}
const percent=n=>(n*100).toFixed(2).replace(/\.?0+$/,'')+'%';
function studyQuote(title){const b=G?.sandbox35?.books?.[title],level=b?.level||0;return {fee:Math.round((level?4:2)*economyFactor()),days:level?30:10,level,complete:level>=3};}
function effectText(e){return [['修炼效率',e.absorb,percent],['突破修正',e.bt,percent],['寿元',e.life,x=>Number(x.toFixed(2))+'年']].filter(([,v])=>v>0).map(([name,v,fmt])=>name+'+'+fmt(v)).join('、')||'无修炼效率、突破或寿元加成';}
function artsPage(){const d=S.state(),q=state(),a=auxiliary();page('功法与配招',card('当前运功', '主修：'+esc(d.mind||'未定')+'<br>辅修：'+esc(q.aux.join('、')||'无')+'<br>辅修叠加：'+esc(effectText(a))+'；每回合额外耗真元 '+a.burden+'<br>术法：'+esc(d.spells.join('、')||'未备')+'（研习等级与品阶影响招式威力）<br>主辅不能重复；战外可换，战中配置锁定。',B('炼气行程','hub')+B('返回修行','cult'))+Object.entries(d.books).filter(([title])=>MANUALS[title]).map(([title,b])=>{const m=MANUALS[title],isMind=m.kind==='心法',active=d.mind===title,aux=q.aux.includes(title),c=compatibility(d.mind,title),feature=library[title]?.desc||m.desc;return card('《'+title+'》',esc(m.kind+' · '+m.tier+'阶 · '+['未入门','入门','熟练','精通'][b.level])+'<br>'+esc(feature)+'<br>本法基础条目：'+esc(effectText(m.effect))+(isMind&&!active?'<br>作为辅修：'+esc(c.label+' · '+c.reason)+'<br>品阶只折算本法实际有的条目，不补齐其他加成。主修寿元沿原有突破结算，辅修寿元随配置折算增减。':''),B(b.level?'研习 · 30日':'入门 · 10日','practice',title,b.level>=3)+(isMind?B(active?'当前主修':'设为主修','main',title,!b.level||active)+B(aux?'移出辅修':'设为辅修','aux',title,!b.level||active||!aux&&q.aux.length>=rules.auxLimit):B(d.spells.includes(title)?'已备术法':'备入术法','spell',title,!b.level||d.spells.includes(title))));}).join(''));}
function stats(){const d=S.state(),layer=G.realm===1?13+(G.layer||1)*4:G.layer||1,m=library[d.mind],a=auxiliary();if(['focus','restore','calm'].includes(m?.bonus))a[m.bonus]+=1;const hp=48+layer*6+(G.attr.gen||5)*2+(m?.bonus==='body'?12:0),mp=16+layer*2+(m?.bonus==='spirit'?8:0);const value={maxHp:hp,maxMp:mp,attack:Math.max(2,6+Math.floor(layer*.9)-Math.min(4,G.injured||0)),defense:G.equipment?.armor==='clothArmor'?3:G.equipment?.armor==='linenArmor47'?1:0,weapon:G.equipment?.weapon||null,mind:d.mind,main:m?.bonus||null,mainLevel:ownLevel(d.mind),spellPower:Object.fromEntries(d.spells.map(n=>[n,1+Math.max(0,(d.books[n]?.level||1)-1)*.12+Math.max(0,['黄','玄','地','天'].indexOf(MANUALS[n]?.tier))*.08])),aux:JSON.parse(JSON.stringify(a)),spells:d.spells.filter(n=>ownLevel(n)>0),wound:G.injured||0};const result=window.XTQi52?.augmentStats(value)||value;return window.XTFoundation57?.augmentStats(result)||result;}
function vitals(){const q=state(),s=stats();if(!q.health)q.health={hp:s.maxHp,mp:s.maxMp};q.health.hp=Math.min(q.health.hp,s.maxHp);q.health.mp=Math.min(q.health.mp,s.maxMp);return {...s,hp:q.health.hp,mp:q.health.mp};}
const enemies={rat:{name:'荆背鼠',layer:1,hp:36,attack:7,defense:0,intents:['扑咬','蓄势','重扑']},wolf:{name:'青鬃狼',layer:4,hp:70,attack:12,defense:1,intents:['扑咬','重扑','蓄势']},boar:{name:'岩甲獠兽',layer:8,hp:112,attack:17,defense:3,intents:['蓄势','重扑','扑咬']}};
const commissions=[{name:'村道试差',target:'rat',need:2,reward:12,layer:1},{name:'狼患复查',target:'wolf',need:2,reward:24,layer:4},{name:'清理盘踞妖物',target:'boar',need:1,reward:40,layer:8}];
function questHere(){return G.place==='county'&&S.state().room==='square';}
function taskPanel(){const q=state(),index=q.quest?.index||0,c=commissions[index],active=q.quest;return card('护路告示',active?.status==='done'&&index===2?'三段护路差事已当面结清。炼气后续以研习、积累修为和准备筑基为主。':active&&active.status!=='done'?esc(c.name)+'：'+esc(enemies[c.target].name)+' '+active.progress+'/'+c.need+'<br>到可猎妖地区的山野深处寻找指定目标，胜利才计数。<br>回'+esc(placeName('county'))+'入口提交，酬钱 '+c.reward+' 灵石。':esc((active?commissions[index+1]:c)?.name||'护路差事')+'：实际击退指定妖兽，再回县城入口交代；依次面向炼气初、中、后段。',active?.status==='ready'?B('当面提交回报 · 1日','report','',!questHere()):!active||active.status==='done'&&index<2?B('接取护路差事','accept','',!questHere()):'');}
function hub(){const h=vitals(),q=state();page('炼气行程与斗法',guide()+card('状态与准备','气血 '+h.hp+'/'+h.maxHp+' · 真元 '+h.mp+'/'+h.maxMp+'<br>长期伤势 '+(G.injured||0)+'年；伤势影响斗法，养脉散 / 凝血丹可缓解。休养恢复气血真元，长期伤势仍按原有年限与丹药结算。',B('配功与备招','arts')+B('安全演练 · 1日','train','',!teacherHere())+B('安全休养 · 7日','rest')+B('服养脉散','medicine','healingPowder',!(G.inventory.healingPowder>0))+B('服凝血丹','medicine','bloodQiPill',!(G.inventory.bloodQiPill>0)))+taskPanel()+card('实地寻妖','需实际到可猎妖地区的「山野深处」。敌人有不同强弱，先观察境界与意图；寻找耗7日，途中事件会中断寻找。',Object.entries(enemies).map(([id,e])=>B(e.name+' · 炼气'+e.layer+'层','hunt',id,!huntHere())).join(''))+(q.record?card('最近斗法',esc(q.record.text),B('查看战报','record')):'')+B('返回场景','scene'));}
function huntHere(){return (G.realm===0||G.realm===1)&&placeHas(PLACES[G.place],'hunt')&&S.state().room==='hunt';}
function advance(days,act){const r=advanceDays(days,{act,rate:0,incomeMul:0},{stopOnEvent:true});if(r.died){die('寿元耗尽');return false;}if(r.event){startEvent(r.event);return false;}return r.days===days&&G.mode==='idle';}
function startBattle(id,training=false){if(!qiReady()||state().battle||training&&!teacherHere()||!training&&!huntHere()||!enemies[id]||!training&&(enemies[id].realm||0)>G.realm)return;
 const ok=commit(()=>{if(!advance(training?1:7,training?'斗法演练':'寻妖'))return;const q=state(),s=vitals();if(!training&&s.hp<=0)throw Error('须先恢复气血');const enemy=training?(G.realm===1?{...enemies.rat,name:'筑基演武傀',hp:180,attack:18}:{...enemies.rat,name:'演武木傀',hp:48,attack:6}):enemies[id];q.battle={id:'b51_'+S.now()+'_'+Math.floor(Math.random()*4294967295),target:id,place:G.place,region60:G.currentRegion48?.stateKey||G.birthContext?.stateKey||'',training,turn:0,seed:Math.floor(Math.random()*4294967295)>>>0,stats:s,hp:training?s.maxHp:s.hp,mp:training?s.maxMp:s.mp,enemy:{...enemy,maxHp:enemy.hp},shield:0,weaken:0,charged:false,log:['相遇'+enemy.name+'。敌方意图会在行动前显示。']};window.XTQi52?.beginBattle(q.battle);V.tab='battle51';});if(ok)render();}
function rand(b){b.seed=(Math.imul(b.seed,1664525)+1013904223)>>>0;return b.seed/4294967296;}
function intent(b){return b.enemy.intents[b.turn%b.enemy.intents.length];}
function addBattleLog(b,text){b.log.push(text);if(b.log.length>100)b.log.shift();}
function moveFor(title){if(library[title]?.move)return library[title].move;const tag=MANUALS[title]?.effect.route;return tag==='攻'?'fire':tag==='护'?'ward':tag==='遁'?'step':null;}
const moveDefs={attack:{label:'普通攻击',cost:0,desc:'稳定攻击，不消耗招式真元'},sword:{label:'点锋剑术',cost:4,desc:'伤害较高，需兵器'},palm:{label:'震脉掌',cost:3,desc:'打断当前蓄势'},control:{label:'牵丝御器术',cost:4,desc:'削弱本回合反击，需法器'},fire:{label:'攻伐术法',cost:4,desc:'真元攻击'},ward:{label:'护身术法',cost:3,desc:'加固本回合防护'},step:{label:'身法',cost:2,desc:'本回合回避，或为撤退保留余地'},guard:{label:'守势',cost:0,desc:'本回合降低受伤'},breathe:{label:'调息',cost:0,desc:'恢复真元，仍承受反击'},heal:{label:'用养脉散',cost:0,desc:'消耗行囊药散恢复气血'},flee:{label:'撤退',cost:0,desc:'敌人蓄势时可安全脱离，否则承受追击'}};
function cost(b,move){const base=moveDefs[move]?.cost||0,value=Math.max(0,base-(base&&b.stats.aux.focus>0?Math.min(1,b.stats.aux.focus):0))+b.stats.aux.burden;return window.XTQi52?.adjustCost(b,move,value)??value;}
function usable(b,move){if(!moveDefs[move])return false;if(['breathe','flee'].includes(move))return true;if(b.mp<cost(b,move))return false;if(move==='heal'&&!(G.inventory.healingPowder>0))return false;const extra=window.XTQi52?.canMove(b,move);if(extra!==undefined)return extra;if(move==='sword'&&!b.stats.weapon)return false;if(move==='control'&&b.stats.weapon!=='spiritBlade')return false;return ['attack','guard','breathe','heal','flee'].includes(move)||b.stats.spells.some(t=>moveFor(t)===move);}
function finishBattle(outcome){const q=state(),b=q.battle;if(!b)return;const won=outcome==='win',escaped=outcome==='flee';
 window.XTQi52?.finishBattle(b,outcome);window.XTFoundation57?.finishBattle(b,outcome);if(!b.training){q.health={hp:Math.max(1,b.hp),mp:Math.max(0,b.mp)};G.combatCount=(G.combatCount||0)+1;if(won){G.combatWins=(G.combatWins||0)+1;if(!b.enemy.actor60)G.inventory.herb=(G.inventory.herb||0)+1;const task=q.quest,c=commissions[task?.index];if(task?.status==='active'&&c.target===b.target){task.progress=Math.min(c.need,task.progress+1);if(task.progress===c.need)task.status='ready';}addBattleLog(b,b.enemy.actor60?'你击退了拦路者。':'胜利，取得青叶草1株；护路酬钱须回县城当面交付后领取。');}else if(!escaped){G.combatLosses=(G.combatLosses||0)+1;G.injured=(G.injured||0)+1;q.health.hp=Math.max(1,Math.floor(b.stats.maxHp*.2));addBattleLog(b,'不敌退回安全处，长期伤势增加1年。先恢复并调整配功。');}}
 window.XTEvents60?.onBattle(b,outcome);const text=(b.training?'演练':'实战')+' · '+(won?'获胜':escaped?'已撤退':'失利')+' · '+b.enemy.name+' · '+b.turn+'回合';q.record={id:b.id,outcome,training:b.training,text,log:b.log.slice(),at:S.now()};q.battle=null;V.tab='record51';addLog(text,'mute');}
function turn(token){const q=state(),b=q?.battle;if(!b||token.split('|').slice(0,2).join('|')!==b.id+'|'+b.turn)return;const move=token.split('|')[2];if(!usable(b,move)){tell('当前真元、药散、装备或已备术法不满足这项行动。');return;}
 commit(()=>{const b=state().battle,act=intent(b),s=b.stats;b.mp-=cost(b,move);let damage=0,guard=0,skip=false;addBattleLog(b,'第'+(b.turn+1)+'回合 · '+moveDefs[move].label+'；敌人'+act+'。');
  if(move==='flee'){b.mp=Math.max(0,b.mp);b.turn++;if(act!=='蓄势'){const hit=Math.max(0,b.enemy.attack-s.defense-(window.XTQi52?.escapeGuard(b)||0));b.hp=Math.max(0,b.hp-hit);addBattleLog(b,'撤退受到追击，气血−'+hit+'。');}finishBattle(b.hp>0?'flee':'loss');return;}
  const extra=window.XTQi52?.resolveMove(b,move,act);if(extra){damage=extra.damage||0;guard=extra.guard||0;skip=!!extra.skip;}
  if(move==='attack')damage=s.attack+(s.weapon==='spiritBlade'?5:s.weapon?3:0);
  if(['sword','palm','control','fire'].includes(move)){damage=s.attack+({sword:9,palm:6,control:7,fire:8}[move]);const type=move==='sword'?'edge':move==='palm'?'body':move==='control'?'spirit':null;if(type){damage+=s.main===type?Math.round(5*(.5+s.mainLevel*.5)):0;damage+=Math.floor((s.aux[type]||0)*3);}if(move==='palm'){b.charged=false;if(act==='蓄势')skip=true;}if(move==='control')b.weaken=4;}
  if(move==='guard'||move==='ward'){guard=move==='ward'?12:7;guard+=Math.floor(s.aux.calm*4);}
  if(move==='step'){guard=100;}
  if(move==='breathe'){const gain=7+Math.floor(s.aux.restore*3);b.mp=Math.min(s.maxMp,b.mp+gain);addBattleLog(b,'调息恢复'+gain+'真元。');}
  if(move==='heal'){G.inventory.healingPowder--;b.hp=Math.min(s.maxHp,b.hp+24);addBattleLog(b,'用去养脉散1份，恢复24气血；长期伤势须战外另行处理。');}
  if(damage){const skill=move==='attack'?1:Math.max(1,...s.spells.filter(t=>moveFor(t)===move).map(t=>s.spellPower?.[t]||1));damage=Math.max(1,Math.floor(damage*skill*(.95+rand(b)*.1))-Math.max(0,b.enemy.defense-(b.pierce52||0)));b.pierce52=0;b.enemy.hp=Math.max(0,b.enemy.hp-damage);addBattleLog(b,'造成'+damage+'伤害。');}
  const next=window.XTQi52?.afterPlayer(b,move,{guard,skip,act});if(next){guard+=next.guard||0;skip=skip||next.skip;}
  b.turn++;if(!b.enemy.hp){finishBattle('win');return;}
  if(!skip&&act==='蓄势'){b.charged=true;addBattleLog(b,'敌人正在蓄势，下一次攻击更重。');}else if(!skip){const raw=b.enemy.attack+(act==='重扑'?4:0)+(b.charged?6:0),hit=Math.max(0,raw-guard-s.defense-b.weaken);b.hp=Math.max(0,b.hp-hit);b.charged=false;addBattleLog(b,'受到'+hit+'伤害。');window.XTQi52?.afterEnemy(b,hit);}else addBattleLog(b,'敌人的蓄势被打断。');b.weaken=0;
  if(b.hp<=0)finishBattle('loss');else if(b.turn>=100){addBattleLog(b,'交手过久，双方脱离。');finishBattle('flee');}
 });render();}
function battlePage(){const b=state().battle;if(!b)return;const moves=[...new Set(['attack',...b.stats.spells.map(moveFor).filter(Boolean),'guard','breathe','heal','flee',...(window.XTQi52?.extraMoves(b)||[])])];page('斗法 · '+b.enemy.name,card('第'+(b.turn+1)+'回合','你的气血 '+b.hp+'/'+b.stats.maxHp+' · 真元 '+Number(b.mp.toFixed(1))+'/'+b.stats.maxMp+'<br>敌方气血 '+b.enemy.hp+'/'+b.enemy.maxHp+'<br><strong>敌方意图：'+esc(intent(b))+(b.charged?'（已蓄势）':'')+'</strong><br>配置已锁定：'+esc(b.stats.mind||'未定主修')+'；'+esc(b.stats.spells.join('、')||'普通攻击')+'<br>每回合兼修负担 '+b.stats.aux.burden+' 真元；真元不足时可调息或撤退。',moves.map(move=>B(moveDefs[move].label+' · '+Number(cost(b,move).toFixed(1))+'真元','turn',b.id+'|'+b.turn+'|'+move,!usable(b,move))).join(''))+(window.XTQi52?.battleInfo(b)||'')+'<p class="sb-note">'+moves.map(m=>esc(moveDefs[m].label+'：'+moveDefs[m].desc)).join('；')+'</p><ol class="qi-log51">'+b.log.slice(-12).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol>');}
function recordPage(){const r=state().record;page('斗法战报',(r?card(r.text,r.log.map(esc).join('<br>')):'')+guide()+B('返回炼气行程','hub')+B('返回场景','scene'));}
function extraDispatch(type,arg){if(window.XTNoRoot64?.isNone(G)&&['practice','main','aux','spell','train','hunt','routes52'].includes(type))return true;
 if(type==='turn'){turn(arg);return true;}
 if(state()?.battle)return true;
 if(type==='routes52'){window.XTQi52?.open();return true;}
 if(type==='hub'){V.tab='hub51';render();return true;}
 if(type==='record'){V.tab='record51';render();return true;}
 if(type==='practice'){const why=window.XTQi52?.studyReason(arg);if(why){tell(why);return true;}const d=S.state(),b=d.books[arg];if(!b||!MANUALS[arg]||b.level>=3)return true;const {fee,days}=studyQuote(arg);if(G.stones<fee){tell('研习灵石不足，需要'+fee+'灵石。');return true;}commit(()=>{if(!advance(days,'研习功法'))return;stoneChange(G,-fee,'功法研习');const d=S.state();d.books[arg].level++;G.arts[arg]=true;if(MANUALS[arg].kind==='心法'&&!d.mind)d.mind=arg;if(MANUALS[arg].kind==='术法'&&!d.spells.includes(arg)&&d.spells.length<2)d.spells.push(arg);syncAuxLife();addLog('《'+arg+'》研习至'+['未入门','入门','熟练','精通'][d.books[arg].level]+'。','mute');});render();return true;}
 if(['main','aux','spell'].includes(type)){const d=S.state(),q=state(),m=MANUALS[arg];if(!m||!ownLevel(arg))return true;commit(()=>{if(type==='main'&&m.kind==='心法'){d.mind=arg;q.aux=q.aux.filter(x=>x!==arg);}if(type==='aux'&&m.kind==='心法'&&d.mind!==arg){if(q.aux.includes(arg))q.aux=q.aux.filter(x=>x!==arg);else if(q.aux.length<rules.auxLimit)q.aux.push(arg);}if(type==='spell'&&m.kind==='术法'){d.spells=d.spells.filter(x=>x!==arg);if(d.spells.length>=2)d.spells.shift();d.spells.push(arg);}syncAuxLife();});render();return true;}
 if(type==='train'){startBattle('rat',true);return true;}
 if(type==='hunt'){startBattle(arg);return true;}
 if(type==='medicine'){if(['healingPowder','bloodQiPill'].includes(arg))sysUse(arg);return true;}
 if(type==='rest'){if(['野地','秘境'].includes(PLACES[G.place]?.tier)){tell('先回村落、城镇或山门等安全地点休养。');return true;}commit(()=>{if(advance(7,'休养')){const s=stats();state().health={hp:s.maxHp,mp:s.maxMp};addLog('休养七日，气血真元恢复；长期伤势仍按原有年限与药物结算。','mute');}});render();return true;}
 if(type==='accept'){if(G.realm!==0||!qiReady()||!questHere())return true;const q=state();if(q.quest&&q.quest.status!=='done')return true;const index=q.quest?q.quest.index+1:0,c=commissions[index];if(!c)return true;if(G.layer<c.layer){tell('这段差事至少需要炼气'+c.layer+'层，可先修行并备好功法器物。');return true;}commit(()=>{state().quest={index,status:'active',progress:0,acceptedAt:S.now(),ownerId:G.world36.playerId};addLog('接下护路差事：'+c.name+'。实地击退目标后回县城入口交代。','mute');});render();return true;}
 if(type==='report'){const q=state();if(!questHere()||q.quest?.status!=='ready')return true;commit(()=>{if(!advance(1,'护路交付'))return;const q=state(),c=commissions[q.quest.index];q.quest.status='done';q.quest.paidAt=S.now();stoneChange(G,c.reward,'护路告示当面结款');addLog('护路差事当面结清：'+c.name+'，酬钱'+c.reward+'灵石。','up');});render();return true;}
 return true;
}
systemReady=function(){if(G?.qi51?.battle){toast('斗法尚未结束，请先完成行动或撤退。');return false;}return old.systemReady();};
const timeActions={stepYear,stepIdle,autoRun,openRetreat,doRetreat,openBreak,doBreak,departTo};
const outsideBattle=fn=>function(...args){if(G?.qi51?.battle){toast('斗法尚未结束，请先完成行动或撤退。');return;}return fn.apply(this,args);};
stepYear=outsideBattle(timeActions.stepYear);stepIdle=outsideBattle(timeActions.stepIdle);autoRun=outsideBattle(timeActions.autoRun);openRetreat=outsideBattle(timeActions.openRetreat);doRetreat=outsideBattle(timeActions.doRetreat);openBreak=outsideBattle(timeActions.openBreak);doBreak=outsideBattle(timeActions.doBreak);departTo=outsideBattle(timeActions.departTo);
// 放在统一观察器之后分派，保证旧任务仍可观察实际行动；战中其他操作全部拦截。
S.dispatch=function(a,arg){if(state()?.battle){if(a==='q51:turn')return turn(arg);if(a==='q51:hub'){render();return;}toast('先完成斗法或撤退，战中不能移动或换功。');return;}if(a?.startsWith('q51:')){if(!old.systemReady())return;message='';const basic=['scene','cult','arts','shop','buy'].includes(a.slice(4));if(basic)return dispatch(a,arg);return extraDispatch(a.slice(4),arg);}if(a==='activate'&&[0,1].includes(G?.realm)&&old.systemReady())return extraDispatch(MANUALS[arg]?.kind==='心法'?'main':'spell',arg);if(a==='read'&&Object.values(library).some(m=>m.id===arg))return readBook(arg);return old.dispatch(a,arg);};
sysHunt=function(){if([0,1].includes(G?.realm)){if(huntHere()){V.tab='hub51';render();}else tell('请先到可猎妖地区的山野深处寻找目标。');return;}return old.sysHunt();};
sysUse=function(id){if([0,1].includes(G?.realm)&&['healingPowder','bloodQiPill'].includes(id)){if(!systemReady()||!(G.inventory[id]>0))return;const h=vitals(),heal=id==='bloodQiPill'?48:24;if(h.hp>=h.maxHp&&!(G.injured>0)){tell('当前无伤势，气血也已足，不消耗药物。');return;}commit(()=>{G.inventory[id]--;G.injured=Math.max(0,(G.injured||0)-(id==='bloodQiPill'?2:1));state().health.hp=Math.min(h.maxHp,h.hp+heal);addLog('服用'+BAG_ITEMS[id].name+'，恢复气血并缓解长期伤势。','up');});render();return;}return old.sysUse(id);};
W.renderView=function(){if(G?.mode==='idle'){if(V.tab==='cult'&&V.sub==='arts'){artsPage();return true;}if(V.tab==='record51'){recordPage();return true;}if(G.realm>0&&V.tab==='hub51'){page('炼气篇已完成',guide()+taskPanel()+B('返回场景','scene'));return true;}if([0,1].includes(G.realm)&&state()?.battle){battlePage();return true;}if(G.realm===0){if(state()?.battle){battlePage();return true;}if(V.tab==='shop51'){studyShop();return true;}if(V.tab==='hub51'){hub();return true;}}}return old.renderView();};
renderScene=function(){if(G?.root&&G.mode==='idle'&&[0,1].includes(G.realm)&&state()?.battle){battlePage();return;}old.renderScene();if(!G?.root||G.mode!=='idle'||G.realm!==0)return;const scene=document.getElementById('scene');
 if(V.tab==='cult'&&V.sub!=='arts'){scene.insertAdjacentHTML('afterbegin','<div class="qi-guide51">'+guide()+'</div>');bind(scene.querySelector('.qi-guide51'));}
 if(V.tab==='scene'&&teacherHere()){const place=scene.querySelector('.sb-place');if(place){place.insertAdjacentHTML('beforeend',card('当地传习', '心法与招式抄本可在此取得；先收录、研习，再决定如何运用。',B('查看传习抄本','shop')+B('炼气行程与护路告示','hub')));bind(place);}}
 if(V.tab==='scene'&&huntHere()){const b=scene.querySelector('.sb-place [data-sb="hunt"]');if(b)b.textContent='查看妖兽与任务目标（寻找耗7日）';}
};
renderActions=function(){if(G?.qi51?.battle){document.getElementById('actions').innerHTML='';return;}return old.renderActions();};
const accepted46=XTScene46.accepted;XTScene46.accepted=function(){const rows=accepted46(),q=state()?.quest,c=commissions[q?.index];if(q&&['active','ready'].includes(q.status))rows.push({title:c.name,status:q.status==='ready'?'待交付':'进行中',text:'护路：'+enemies[c.target].name+' '+q.progress+'/'+c.need,next:q.status==='ready'?'回县城入口 → 炼气行程与护路告示 → 当面提交回报':'到可猎妖地区 → 山野深处 → 搜寻妖兽 → 选择'+enemies[c.target].name,where:q.status==='ready'?placeName('county')+'入口':'可猎妖地区的山野深处',need:'胜利才计数；演练、撤退与失败不计数。',finish:'回县城入口当面交付，领取'+c.reward+'灵石。'});return rows;};
restore=function(raw){let incoming;try{incoming=JSON.parse(raw);const q=incoming.qi51;if(q){if(q.version!==1||!Array.isArray(q.aux)||q.aux.length>2||new Set(q.aux).size!==q.aux.length||q.aux.some(n=>!MANUALS[n]||MANUALS[n].kind!=='心法'))throw Error('配功数据无效');if(q.health&&(!Number.isFinite(q.health.hp)||!Number.isFinite(q.health.mp)||q.health.hp<0||q.health.mp<0))throw Error('气血数据无效');if(q.battle){const b=q.battle;if(q.ownerId!==incoming.world36?.playerId||!Number.isInteger(b.turn)||b.turn<0||b.turn>=100||![b.hp,b.mp,b.enemy?.hp,b.enemy?.maxHp,b.stats?.maxHp,b.stats?.maxMp].every(Number.isFinite)||!Array.isArray(b.log)||!Array.isArray(b.stats?.spells)||!b.stats?.aux||!enemies[b.target])throw Error('斗法数据无效');}}}catch(e){XTEconomy40.lastRestoreError='炼气配功或斗法存档无效，原档保留。';return false;}return old.restore(raw);};
window.XTQi51={state,library,guide,dispatch,compatibility,auxiliary,rules,stats,vitals,enemies,commissions,startBattle,turn,moveDefs,cost,usable,moveFor,syncAuxLife,commit,studyQuote,teacherHere};
})();
