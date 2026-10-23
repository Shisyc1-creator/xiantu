/* 场景样例：相连房间、具体物件、人物话题、真实结算反馈与可见修行录。 */
(()=>{
'use strict';
const S=XTSandbox,W=XTWorld36,V=S.view;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain=x=>String(x??'').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ');
const B=(label,action,arg='',off=false)=>`<button class="sb-btn" data-sb="${action}" data-arg="${esc(arg)}" ${off?'disabled':''}>${esc(label)}</button>`;
let busy=false,notice='',serial=0;
function data(){
 if(!G?.root)return null;
 if(!G.interaction42)G.interaction42={version:1,sequence:0,last:null};
 return G.interaction42;
}
function sample(){return !!G?.root;}
function edges(rooms){
 if(window.XTMap45)return XTMap45.edges(rooms);
 const ids=rooms.map(x=>x[0]),map=Object.fromEntries(ids.map(id=>[id,[]]));
 const connect=(a,b)=>{if(map[a]&&map[b]){map[a].push(b);map[b].push(a);}};
 for(const id of ids){
  if(['square','h41_inner','h41_storage','alchemy','forge','workshop','auction43','counter44','auction44','lounge44'].includes(id))continue;
  connect('square',id);
 }
 connect('shops','counter44');connect('counter44','auction44');connect('auction44','lounge44');connect('shops','auction43');connect('shops','workshop');if(!map.shops)connect('square','workshop');
 connect('residence36','h41_inner');connect('residence36','h41_storage');connect('home','alchemy');connect('home','forge');
 return map;
}
function roomNav(rooms){
 if(window.XTScene44)return XTScene44.roomNav(rooms);
 if(!sample())return '';
 const here=S.state().room,map=edges(rooms),names=Object.fromEntries(rooms);
 return `<div class="room-current42"><small>所在房间</small><b>${esc(names[here]||here)}</b><span>院落内移动不推进日期</span></div><div class="room-exits42"><small>相连出口</small>${(map[here]||[]).map(id=>B('前往 '+names[id],'room',id)).join('')||'<span>暂无出口</span>'}</div><details class="room-plan42"><summary>查看本地简图</summary><div>${rooms.map(([id,title])=>`<span class="${id===here?'here':(map[here]||[]).includes(id)?'near':''}">${esc(title)}${id===here?' · 当前':''}</span>`).join('')}</div><p>沿上方出口逐处行走，选中眼前的人或物件再互动。</p></details>`;
}
function stamp(at){if(!Number.isFinite(at)||at<0)return '旧事';const days=CFG.daysPerMonth,months=CFG.monthsPerYear,year=Math.floor(at/(days*months)),month=Math.floor(at/days)%months,day=at%days;return CFG.eraName+cnYear(year)+'年 '+monthName(month)+cnDay(day+1);}
function snapshot(){
 const n=V.actor&&W.get(V.actor),r=n&&W.relation(n.id,false);
 return {eventId:G.curEvent?.id,game:G,player:G.world36?.playerId,time:S.now(),stones:G.stones,items:{...G.inventory},room:S.state().room,place:G.place,layer:G.layer,cult:G.cult,injured:G.injured,mode:G.mode,actor:n?.id,relation:n?{trust:r?.trust||0,affinity:r?.affinity||0,respect:r?.respect||0}:null,lastLog:G.log?.at(-1),count:G.log?.length||0};
}
const names={buy:'购入物品',sell:'出售物品',gather:'采集灵材',hunt:'搜寻妖兽',work:'做短工',ask:'打听见闻',make:'制作',build:'修建设施',hire:'招募人手',assign:'委派',practice:'研习功法',learnRecipes:'学习工艺',rentWorkshop:'租用炉位',buyProperty:'签订房契',renew:'续租',marketQuest:'交付委托',claim:'领取悬赏','r36:talk':'交谈','r36:help':'互助','r36:study':'交流修行','s38:support':'赠资周转','s38:advance':'垫付寄售款','s38:claim':'领回垫款','l37:supply':'供药','l37:donate':'赠药','l37:premium':'议价供药','l37:promise':'承诺运药','l37:pickup':'提取运药货物','l37:deliver':'交付运药','h41:letter':'整理家中旧物','h41:renew':'续住','h41:deposit':'存入私人物柜','h41:withdraw':'取出私人物件','t42:reply':'与人物交谈',eventChoice:'处理事件',room:'房间移动'};
const navigation=new Set(['sub','page','map','routes','backScene','home','subScene','actor','clearActor','legacyActor','shop','craft','faction','propertyOffers','recruitOffers','selectWorker','legacySelf','saves','settings','lineage','world','guide','cultTab','r36:tab','r36:history','r36:travelMap','r36:localRules','r36:state','h41:help','h41:visit','h41:inner','h41:storage','h41:hall','h41:leave','h41:reclaim','t42:talk','t42:closeTalk','t42:news','t42:ledger','t42:journal']);
function failedReason(action,arg){
 if(action==='room')return '这里与目标房间不相连，请沿眼前出口行走。';
 if(action.startsWith('s38:'))return '本次未办理：请核对当面经办人、可用钱款与登记债权。';
 if(action.startsWith('l37:')){
  const s=XTLocal37.state();
  if(['supply','donate','premium'].includes(action.slice(4))&&(G.inventory.herb||0)<6)return '需备齐青叶草六株，本次没有交付。';
  if(s?.contract?.status==='done')return '这份运药约定已经结清，不能重复领取。';
  return '本次未办理：请核对药讯状态、经办人、货物与约定期限。';
 }
 if(action==='eventChoice'){const o=G.curEvent?.opts?.[Number(arg)];if(o&&G.mode==='event')return o.cost>G.stones?'灵石不足，此事仍待处理，没有扣款。':'选项条件尚未满足，此事仍待处理。';return '当前事件已结束，没有重复结算。';}
 return '条件尚未满足，本次没有完成结算。请查看行动所需条件。';
}
function speech(id,topic='news'){
 const n=W.get(id);if(!n||!W.present(id))return '';
 const remembered=window.XTCounty45?.response(id,topic);if(remembered)return remembered;
 const rel=W.relation(id,false),local=XTLocal37.state(),family=n.source==='开局家人档案';
 if(topic==='past'){
  if(family){const lost=Object.values(W.world().people).filter(x=>x.source==='开局家人档案'&&!W.alive(x));return lost.length?'有些人已经不在了，留下的家书和旧物，你有空去收拾收拾。':'家中的旧物还放在住处。出门修行，也别忘了回来看看。';}
  if((rel?.deeds.length||0)>0)return '你做过的事，我心里有数。来往不只凭几句话，往后的日子还长。';
  return '我们才刚相识。多见几面，做过些事，自然就知道彼此是什么样的人。';
 }
 if(topic==='livelihood'){
  if(n.id===XTShop38.operator())return local.phase==='shortage'?`连雨断了药路，还缺青叶草${Math.max(0,local.target-local.delivered)}株。愿意供药或去白水渡运药，就当面把约定说清。`:'药路已恢复，眼下按铺中现货和标价做生意，不再急购。';
  if(n.id==='dan')return '炉火、辅料和材料缺一不可。租炉和学丹方各有费用，动手之前先看清配方。';
  if(n.id==='smith')return '铁料要备好，工艺也要先学。器物能不能做成，要看手艺，不能只看名字。';
  if(n.id==='broker')return '住得下不等于能经营。宅院的租期、产权和工位都要写在契上，家族公产不能当个人宅子卖。';
  if(n.id==='ferry')return local.contract?.status==='active'?'封装货物须按运约提取，别和自己的草药混在一处。送回百草铺时再对凭据。':'船货看商路，也看时令。若要替药铺提货，先把那边的运约订妥。';
  return n.goal?`我眼下还要${n.goal.replace(/[。！]$/,'')}。有事相助，也得按实际所需来。`:'谋生和修行都得一步一步来，先把眼前的事做好。';
 }
 if(family)return '出门在外，先顾好自己。家中有能用的住处，记得沿路回来，别把别人的东西当自己的。';
 if(n.realm>realmOf())return '修行先看自身根基与眼前环境。若有疑难，等彼此相熟，再坐下细谈。';
 return n.goal?`近日我正为“${n.goal}”奔走。你若有空，我们也可以谈谈此地的见闻。`:'近日各有各的忙碌。你我既然见了面，就坐下说说近况。';
}
function dialog(id){
 const session=V.talk42;if(!session||session.id!==id||!W.present(id))return '';
 const n=W.get(id);
 return `<section class="conversation42" aria-label="与${esc(n.name)}对话"><h4>${esc(n.name)}</h4>${session.player?`<p class="player42">你：“${esc(session.player)}”</p>`:''}<p class="speech42">${esc(session.reply||'你想聊些什么？')}</p><div class="sb-buttons">${!session.used?B('问近况 · 1日','t42:reply',id+'|news|'+session.token)+B('问当地生计 · 1日','t42:reply',id+'|livelihood|'+session.token)+B('聊往事 · 1日','t42:reply',id+'|past|'+session.token):B('换个话题','t42:talk',id)}${B('结束交谈','t42:closeTalk')}</div><small>话题共用交谈间隔；只阅读和结束对话不推进日期。</small></section>`;
}
function observe(action,arg,fn){
 if(!G?.root||busy)return fn();
 const before=snapshot();notice='';busy=true;let value;
 try{value=fn();}finally{busy=false;}
 if(!G?.root)return value;
 if(navigation.has(action)||action.startsWith('a43:')||action.startsWith('a44:')||action.startsWith('p44:')||action.startsWith('m45:')||action.startsWith('c45:')||action.startsWith('u46:')||action.startsWith('q46:'))return value;
 const d=data(),elapsed=Math.max(0,S.now()-before.time),different=before.player!==G.world36?.playerId;
 const parts=[];if(elapsed)parts.push('经过'+elapsed+'日');
 if(!different){
  const gold=G.stones-before.stones;if(gold)parts.push('灵石'+(gold>0?'+':'')+gold);
  for(const id of new Set([...Object.keys(before.items),...Object.keys(G.inventory||{})])){const delta=(G.inventory[id]||0)-(before.items[id]||0);if(delta)parts.push((BAG_ITEMS[id]?.name||id)+(delta>0?'+':'')+delta);}
  const r=before.actor&&W.relation(before.actor,false);if(r&&before.relation)for(const [key,label]of [['trust','信任'],['affinity','相知'],['respect','敬重']]){const delta=r[key]-before.relation[key];if(delta)parts.push(label+(delta>0?'+':'')+delta);}
 }
 const externalFailure=window.XTContent47?.takeFailure();if(externalFailure)notice=externalFailure;
 const index=G.log?.indexOf(before.lastLog)??-1,newLogs=(G.log||[]).slice(index<0?-2:index+1),last=newLogs.at(-1);
 const moved=G.place!==before.place||S.state().room!==before.room;
 const social=['t42:reply','r36:talk','r36:help','r36:study'].includes(action),unavailable=social&&before.actor&&!W.present(before.actor);
 const failedNotice=notice&&/不足|不能|无法|需|尚|没有|已满|重复|未完成|刚进行|不在|缺|上限/.test(notice);
 const eventResolved=action==='eventChoice'&&before.eventId&&G.curEvent?.id!==before.eventId&&G.eventsDone?.[before.eventId];
 const changed=eventResolved||different||parts.length||newLogs.length||moved;
 let status=G.mode==='dead'?'寿尽':G.mode==='event'?(action==='eventChoice'&&before.eventId===G.curEvent?.id?'未完成':'被事件中断'):failedNotice||unavailable||notice&&!changed?'未完成':changed?'已完成':'未执行';
 if(eventResolved&&G.progress44?.events?.at(-1)?.outcome==='失利')status='失败';
 if(status==='已完成'&&/失手|失败|失利/.test(plain(last?.t)||notice))status='失败';
 if(action==='room'&&moved)parts.push('来到'+(S.roomDefs().find(r=>r[0]===S.state().room)?.[1]||'相连房间'));
 if(action==='t42:inspect')status='已查看';
 let message=notice||((status==='未执行'||action==='eventChoice'&&status==='未完成')?failedReason(action,arg):status==='被事件中断'?'先处理眼前事件；本次未完成的事项没有记为成功。':status==='寿尽'?'行动在寿元耗尽处停止。':last?plain(last.t):moved?'已沿出口移动。':'已结算。');
 const result={place:G.place,room:S.state().room,tab:V.tab,id:++d.sequence,at:S.now(),action,title:names[action]||'场景行动',status,effects:parts.slice(0,9),message};
 d.last=result;
 if(action==='t42:reply'&&V.talk42){const session=V.talk42;session.reply=status==='已完成'?speech(session.id,session.topic):message;}
 else if(/^r36:(talk|study|help)$/.test(action)&&status==='已完成'&&W.present(arg)){
  V.talk42={id:arg,token:++serial,used:true,player:action==='r36:study'?'请教修行中的疑难。':action==='r36:help'?'带来了你所需的东西。':'说说近日的事。',reply:action==='r36:study'?'今日先把调息和用功的疑难理清。交流不等于凭空增长修为，传承还要逐步研习。':action==='r36:help'?'东西合用，多谢你记得这件事。这次相助，我记下了。':speech(arg)};
 }
 addLog(result.title+' · '+status+(parts.length?'；'+parts.join('，'):'')+'。'+message,'mute');
 if(action==='t42:reply'&&status==='已完成'&&V.talk42?.reply)addLog(W.get(V.talk42.id).name+'：“'+V.talk42.reply+'”','mute');
 save();render();return value;
}
function dispatch(action,arg){
 if(action==='room'&&sample()){
  const here=S.state().room;if(here===arg){notice='你已经在这个房间。';return true;}if(!(edges(S.roomDefs())[here]||[]).includes(arg)){notice=failedReason(action,arg);return true;}
 }
 if(['actor','clearActor','room','backScene','h41:visit'].includes(action))V.talk42=null;
 if(!action.startsWith('t42:'))return false;
 const type=action.slice(4);
 if(type==='journal'){document.querySelector('.journal42 details')?.toggleAttribute('open');return true;}
 if(type==='closeTalk'){V.talk42=null;render();return true;}
 if(type==='talk'){
  if(!systemReady()||!W.present(arg)){notice='请先找到这个人，当面交谈。';return true;}
  V.talk42={id:arg,token:++serial,used:false,reply:null};V.actor=arg;V.detail=null;render();return true;
 }
 if(type==='reply'){
  const [id,topic,token]=String(arg).split('|'),session=V.talk42;
  if(!systemReady()||!session||session.used||session.id!==id||session.token!==Number(token)||!['news','livelihood','past'].includes(topic)){notice='这段话题已处理，或已经离开对话现场。';return true;}
  if(!W.present(id)){notice='对方已不在眼前，无法继续交谈。';return true;}
  session.used=true;session.topic=topic;session.player=({news:'近来过得如何？',livelihood:'这里的生计有什么门道？',past:'聊聊从前的事吧。'})[topic];
  W.dispatch('r36:talk',id);return true;
 }
 if(type==='news'||type==='ledger'){
  if(!systemReady()||G.place!=='county'){notice='需到青石县当地查看。';return true;}
  if(type==='ledger'&&S.state().room!=='shops'){notice='铺账放在百草铺柜台，请先到商街。';return true;}
  V.actor=null;V.talk42=null;V.detail={kind:type==='news'?'news42':'ledger42'};render();return true;
 }
 if(type==='inspect'){
  if(!systemReady())return true;
  const room=S.state().room;
  if(arg!==room){notice='这件物什不在当前房间。';return true;}
  const text=room==='shops'?'柜台上列着现货与价目，账簿另放一侧。办供药、借款或还款，要找当面经办的人。':room==='workshop'?'炉具与砧台各有工位。租炉、材料和学艺费用须分别确认，眼前的炉火并非免费公用。':room==='agency'?'契约分列租期、产权与安置费用。居住权不等于可以动用整个家族的产业。':room==='residence36'?'门厅连着个人居室与物柜。可取用哪些物件，要以你在这里的实际资格为准。':'你看清相邻出口和眼前的人物，记下可走的去处。';
  addLog(text,'mute');return true;
 }
 return true;
}
function bind(root){root.querySelectorAll('[data-sb]').forEach(b=>b.onclick=()=>S.dispatch(b.dataset.sb,b.dataset.arg));}
function decorate(){
 document.getElementById('scene').classList.toggle('scene-ui42',G?.mode==='idle'&&V.tab==='scene');
 if(!G?.root||['child','awaken','prologue'].includes(G.mode))return;
 const scene=document.getElementById('scene'),d=data();
 if(G.mode==='idle'&&V.tab==='scene'){
  const place=scene.querySelector('.sb-place'),detail=scene.querySelector('.sb-detail');
  if(place){
   const objects=document.createElement('section');objects.className='scene-objects42';objects.innerHTML='<h4>眼前物件</h4>'+B(S.state().room==='workshop'?'查看炉台':S.state().room==='agency'?'查看契约告示':'查看四周','t42:inspect',S.state().room)+(G.place==='county'&&S.state().room==='shops'?B('查看百草铺账簿','t42:ledger'):'');place.append(objects);bind(objects);
   if(G.place==='county'){
    const s=XTLocal37.state(),brief=s.phase==='shortage'?'县中缺药，尚缺青叶草'+Math.max(0,s.target-s.delivered)+'株':s.phase==='closed'?'旧药路急购已撤下':s.phase==='quiet'?'药路照常通行':'药路恢复，急购告示已撤下';
    const news=document.createElement('aside');news.className='county-news42';news.innerHTML='<span>青石药讯 · '+esc(brief)+'</span>'+B('查看药讯','t42:news');const actions=place.querySelector(':scope > .sb-buttons');if(actions)actions.after(news);else place.append(news);bind(news);
   }
  }
  if(detail&&V.detail?.kind==='news42'){detail.innerHTML='<div class="detail-return42">'+B('‹ 返回房间','clearActor')+'</div>'+XTLocal37.detail();scene.querySelector('.sb-room-layout').classList.add('actor-selected');bind(detail);}
  if(detail&&V.detail?.kind==='ledger42'){detail.innerHTML='<div class="detail-return42">'+B('‹ 返回房间','clearActor')+'</div>'+XTShop38.panel();scene.querySelector('.sb-room-layout').classList.add('actor-selected');bind(detail);}
 }
 if(G.mode==='idle'&&V.tab==='shop'&&['grocer',XTShop38.HEIR,XTShop38.BUYER].includes(V.detail?.id)){
  const footer=document.createElement('section');footer.className='counter-ledger42';footer.innerHTML=XTShop38.panel();scene.querySelector('.sb-scroll')?.append(footer);bind(footer);
 }
 const shell=scene.querySelector('.sb-shell');
 if(G.mode==='idle'&&d.last&&shell&&d.last.place===G.place&&d.last.room===S.state().room&&d.last.tab===V.tab&&!(d.last.action==='room'&&d.last.status==='已完成')){
  const r=d.last,node=document.createElement('section');node.className='action-result42';node.setAttribute('role','status');node.setAttribute('aria-live','polite');
  node.innerHTML=`<strong>${esc(r.title)} · ${esc(r.status)}</strong><span>${esc(r.effects.join(' · ')||r.message)}</span><details><summary>结果详情 · ${stamp(r.at)}</summary><p>${esc(r.message)}</p></details>`;
  const scroll=shell.querySelector('.sb-scroll');if(scroll)scroll.prepend(node);
 }
 const journal=document.createElement('section');journal.className='journal42';
 const rows=(G.log||[]).slice(-40).reverse(),last=rows[0];
 journal.innerHTML=`<details ${V.journalOpen42?'open':''}><summary><b>修行录</b><span>${esc(last?plain(last.t):'尚无记录')}</span></summary><div class="journal-rows42">${rows.map(e=>`<p><small>${esc(e.at==null?e.y+'岁':stamp(e.at))}</small> ${esc(plain(e.t))}</p>`).join('')||'<p>尚无记录。</p>'}</div></details>`;
 journal.querySelector('details').ontoggle=e=>{V.journalOpen42=e.target.open;};
 (shell||scene).append(journal);
}
const old={renderScene,toast,chooseOption,newGame,restore,actorPanel:W.actorPanel};
toast=function(message){if(busy){notice=plain(message);if(G?.mode==='idle'&&V.tab==='scene'&&!XTMode41.isPending())return;}return old.toast(message);};
W.actorPanel=function(id){let html=old.actorPanel(id).replace(/data-sb="r36:talk"/g,'data-sb="t42:talk"').replace('交谈 · 1日','交谈');return dialog(id)+html;};
renderScene=function(){old.renderScene();decorate();};
chooseOption=function(i){return observe('eventChoice',i,()=>old.chooseOption(i));};
newGame=function(...args){V.talk42=null;return old.newGame(...args);};
restore=function(raw){const prior=V.talk42;V.talk42=null;const ok=old.restore(raw);if(!ok)V.talk42=prior;return ok;};
window.XTInteraction42={get busy(){return busy;},observe,dispatch,roomNav,edges,data,decorate};
if(G)render();
})();
