/* 来安客栈的回执短链：当面核对、真实时日、一次性结款与长期记忆。 */
(()=>{'use strict';
const S=XTSandbox,W=XTWorld36,V=S.view;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const B=(text,a)=>`<button class="sb-btn" data-sb="c45:${a}">${esc(text)}</button>`;
const people={inn_host45:{name:'杜娘',sex:'女',age:39,room:'inn45',role:'来安客栈掌柜',goal:'替住店商旅收妥货单'},river_boat45:{name:'周篙',sex:'男',age:34,room:'river45',role:'河埠船工',goal:'按凭据交清船货'},granary_clerk45:{name:'陈录',sex:'男',age:47,room:'granary45',role:'仓廪库吏',goal:'核对外院货物交接记录'}};
for(const [id,n]of Object.entries(people))S.actors[id]={name:n.name,role:n.role,place:'county',room:n.room};
const stages=[['accepted','客栈受托'],['river','河埠问讯'],['receipt','仓廪取回执'],['verified','药铺核验'],['done','客栈交还结款']];
const state=()=>G?.places45;
const owner=()=>G?.world36?.playerId;
const quest=()=>state()?.chains?.[owner()]||null;
let message='',messageRoom='',locked=false;
function init(){if(!G?.root)return;const w=W.world();if(!G.places45)G.places45={version:1,funds:{inn:24},chains:{}};for(const [id,n]of Object.entries(people))if(!w.people[id])w.people[id]={...n,id,realm:-1,layer:0,root:'无灵根',birth:CFG.eraStart*360-n.age*360,life:80,alive:true,place:'county',source:'青石县街巷常住人物'};}
function transact(fn){if(locked)return false;locked=true;const before=JSON.stringify(G);try{fn();const raw=JSON.stringify(G);localStorage.setItem(SAVE_KEY,raw);if(localStorage.getItem(SAVE_KEY)!==raw)throw Error('校验失败');return true;}catch(e){G=JSON.parse(before);try{localStorage.setItem(SAVE_KEY,before);}catch(_){}message='文书与结款未能保存，本次没有提交；已走过的日期照常经过。';return false;}finally{locked=false;}}
function remember(id,text,key){const r=W.relation(id);if(!r)return;r.history.unshift({day:S.now(),text});if(!r.deeds.includes(key))r.deeds.push(key);}
function refresh(){const q=quest();if(!q||['done','failed','cancelled'].includes(q.stage))return;if(S.now()>q.due||!W.alive(W.get('inn_host45'))){q.stage='failed';q.document=null;q.reason=S.now()>q.due?'超过约定三十日，回执作废，未支付报酬。':'委托人已故，未完成的回执约定终止。';q.history.push({at:S.now(),text:q.reason});addLog('回执委托失约：'+q.reason,'mute');save();}}
function response(id,topic){const q=quest();if(topic==='past'||!['inn_host45','river_boat45','granary_clerk45',XTShop38.operator()].includes(id))return '';
 if(q&&id===XTShop38.operator()&&q.verifierId&&q.verifierId!==id&&['done','verified'].includes(q.stage))return '前任留下的铺账记着这份回执已经核验。我可以依原账查证，不会再出一份报酬。';
 if(q?.stage==='done')return id==='inn_host45'?'那份药货回执多亏你沿河埠、仓廪和药铺一处处核清，六枚酬钱已经结给你。客人再来问，我也好交代了。':id==='river_boat45'?'上次那批回执你已经送妥了。船货还按各家货单交接，不会因你跑过一趟就任意放货。':id==='granary_clerk45'?'你取走的回执已经核销，原货仍按库册登记。同一张凭据不能再来领第二份。':'客栈那份回执已验过，也交还杜娘了。这件事我记得；铺中货物仍按现货买卖。';
 if(q?.stage==='failed'||q?.stage==='cancelled')return id==='inn_host45'?'那份回执的约定已经终止，酬钱没有付出。往后来往，还是先把约定说清。':'先前那份回执已经作废，不能再凭它交货或结款。';
 if(q){
  if(id==='inn_host45')return q.stage==='accepted'?'约定已经立好，先到城东河埠问周篙船货去向。三十日内交回核验过的回执，我付六枚灵石。':q.stage==='river'?'船货的去向既已问到，就去仓廪外院找陈录核底册；回执取到后还须药铺核验。':q.stage==='receipt'?'你带回了有仓廪记号的回执，还缺药铺掌柜核验。验齐后再交给我，别只把纸送到就算完事。':'药铺也验过了，这份回执可以交还。办完交接，我按原约付六枚灵石。';
  if(id==='river_boat45')return q.stage==='accepted'?'旧船货已交仓，底册留在仓廪外院。找陈录核对，别把我的指路当成领货凭据。':q.stage==='river'?'船货的去向我已经告诉你，下一步找仓廪陈录核底册，不用再重问同一趟船。':'你既带着盖记号的回执，后续就照原约核验交还；船上的货不能再领一次。';
  if(id==='granary_clerk45')return q.stage==='accepted'?'先向河埠船工问清船货来历，再来核底册。文书不能只凭一句话就交人。':q.stage==='river'?'船货来历已经对上，我可以按底册核查回执，原货仍归原货主。':q.stage==='receipt'?'盖记号的回执已交给你，还须药铺掌柜核验。同一份底册不再出第二张可结款回执。':'这份回执已经办到药铺核验，后面按你与杜娘的约定交还即可。';
  return q.stage==='receipt'?'回执上有仓廪记号，拿来后我按原货单逐项核验。核验只是对账，不另付一份报酬。':q.stage==='verified'?'回执已经核验好了，现在送还客栈杜娘；这里不会再给第二份货或第二次报酬。':'回执要先有仓廪记号才好核验，先把河埠和仓廪的手续办清。';
 }
 if(Object.values(state()?.chains||{}).some(q=>q.stage==='done'))return '你家前辈曾帮我们核清过回执，旧账还在。如今有事，仍要以你本人的约定办理。';
 return '';
}
function stageAction(id){const q=quest();if(!q&&id==='inn_host45')return B('接下回执委托 · 1日','start');if(!q||['done','failed','cancelled'].includes(q.stage))return '';
 if(q.stage==='accepted'&&id==='river_boat45')return B('询问旧船货去向 · 1日','river');
 if(q.stage==='river'&&id==='granary_clerk45')return B('核底册取回执 · 1日','receipt');
 if(q.stage==='receipt'&&id===XTShop38.operator())return B('出示回执核验 · 1日','verify');
 if(q.stage==='verified'&&id==='inn_host45')return B('交还回执 · 1日 / 酬钱6灵石','finish');
 return '';
}
function panel(id){if(G.place!=='county'||!W.present(id))return '';if(!Object.hasOwn(people,id)&&id!==XTShop38.operator())return '';const q=quest(),speech=response(id,'news');if(!q&&id!=='inn_host45')return '';
 return `<section class="quest45"><h4>${esc(W.get(id).name)} · 药货回执</h4><p class="speech45">${esc(speech||'住店客人少了一份药货回执。劳你从河埠查起，拿到仓廪盖记号的回执，再让药铺核验，三十日内交回来；我付六枚灵石。文书只作核对，不可支取别人的货。')}</p>${stageAction(id)}${q&&!['done','failed','cancelled'].includes(q.stage)&&id==='inn_host45'?B('终止约定 · 不领报酬','cancel'):''}${message&&messageRoom===S.state().room?'<p class="chain-message45" role="status">'+esc(message)+'</p>':''}</section>`;
}
function act(id,expected,next,fn){const q=quest();if(!W.present(id)||(expected&&q?.stage!==expected)||(!expected&&q)){message='这一步已处理、还没接到，或当事人不在眼前。';render();return;}
 if(!expected&&state().funds.inn<6){message='客栈尚无足够的委托钱款，杜娘没有另立新约。';render();return;}
 const r=advanceDays(1,{act:'核对回执',rate:0,incomeMul:0},{stopOnEvent:true});
 if(r.died){die('寿元耗尽');return;}if(r.event){if(quest())quest().paused=true;addLog('回执事务被途中事件打断，本步尚未完成。','mute');startEvent(r.event);return;}
 if(quest()&&S.now()>quest().due){refresh();message='约定已经逾期，本步没有结算。';render();return;}
 if(r.days<1||!W.present(id)){message='事务未办完，当事人暂不能继续核对；本步没有结算。';save();render();return;}
 transact(()=>{let c=quest();if(!c)c=G.places45.chains[owner()]={ownerId:owner(),ownerName:G.name,stage:'accepted',accepted:S.now(),due:S.now()+30,history:[],document:null,paid:false,paused:false};c.paused=false;c.stage=next;fn(c);const label=stages.find(x=>x[0]===next)?.[1]||'约定终止';c.history.push({at:S.now(),text:label});remember(id,label+'；与你当面办理。','county45_'+owner()+'_'+next);addLog('药货回执 · '+label+'。','mute');message=next==='done'?'回执已交还，六枚酬钱到账；此约已完成。':'本步已完成，请查看下一处核对地点。';});render();
}
function dispatch(a,arg){if(!a.startsWith('c45:'))return false;message='';messageRoom=S.state().room;if(!systemReady()||G.place!=='county'||V.tab!=='scene')return true;init();refresh();const type=a.slice(4);
 if(type==='start')act('inn_host45',null,'accepted',()=>{});
 if(type==='river')act('river_boat45','accepted','river',()=>{});
 if(type==='receipt')act('granary_clerk45','river','receipt',q=>{q.document={id:'receipt45_'+owner(),ownerId:owner(),valid:true};});
 if(type==='verify'){const q=quest();if(!q?.document?.valid||q.document.ownerId!==owner()){message='尚无本人有效回执，不能核验。';render();return true;}act(XTShop38.operator(),'receipt','verified',q=>{q.document.checked=true;q.verifierId=XTShop38.operator();});}
 if(type==='finish'){const q=quest();if(!q?.document?.checked||q.paid||state().funds.inn<6){message='凭据未核验、已经结款或委托钱款不足，没有重复结算。';render();return true;}act('inn_host45','verified','done',q=>{state().funds.inn-=6;stoneChange(G,6,'来安客栈回执报酬');q.paid=true;q.document=null;const rel=W.relation('inn_host45');rel.trust=Math.min(100,rel.trust+4);});}
 if(type==='cancel'&&quest()&&!['done','failed','cancelled'].includes(quest().stage)&&W.present('inn_host45'))transact(()=>{const q=quest();q.stage='cancelled';q.document=null;q.reason='你当面终止了约定，没有领取酬钱。';addLog(q.reason,'mute');});
 render();return true;
}
function decorate(){if(!G?.root||G.mode!=='idle'||!['scene','quests'].includes(V.tab))return;const q=quest(),scene=document.getElementById('scene');if(q){const host=scene.querySelector('.scene-progress44');if(host){const el=document.createElement('div');el.className='chain-progress45';const finished=q.stage==='done',closed=['failed','cancelled'].includes(q.stage),at=closed?Math.max(-1,...q.history.map(h=>stages.findIndex(x=>x[1]===h.text))):stages.findIndex(x=>x[0]===q.stage);el.innerHTML=`<strong class="state44 ${finished?'done':closed?'failed':'pending'}">${finished?'已完成':closed?'已终止':q.paused?'被事件中断':'进行中'}</strong>药货回执${!finished&&!closed?' · 距期限'+Math.max(0,q.due-S.now())+'日':''}<details><summary>已办 ${at+1}/5${!finished&&!closed?' · 下一步：'+esc(stages[at+1]?.[1]||'交还结款'):' · 查看记录'}</summary><ol>${stages.map(([id,label],i)=>`<li class="${i<=at?'done45':i===at+1&&!closed?'active45':''}">${i<=at?'✓':closed?'—':'○'} ${esc(label)}</li>`).join('')}</ol>${closed?'<p>'+esc(q.reason||'约定终止')+'</p>':''}</details>`;host.append(el);host.classList.remove('empty44');const pending=host.querySelectorAll('.state44.pending').length;if(pending)host.querySelector('.progress-head44 span').textContent='待办 '+pending;}}
 if(G.place==='county'){const p=scene.querySelector('.sb-place');if(p&&['inn45','river45','granary45','notice45','yamen45','academy45'].includes(S.state().room)){const n=document.createElement('p');n.className='county-place45';n.textContent=S.state().room==='inn45'?'杜娘在堂前理账，可先选她询问住店商旅的事情。':S.state().room==='river45'?'船工在河埠点货，可向周篙问讯。':S.state().room==='granary45'?'库吏在外院当值，可向陈录核对文书。':'公开告示可查看，院内公物不因走到这里而归你取用。';p.append(n);}}
}
const old={renderScene,actorPanel:W.actorPanel,newGame,die};
W.actorPanel=function(id){const base=old.actorPanel(id),extra=panel(id);return V.talk42?.id===id?base+extra:extra+base;};
renderScene=function(){if(G?.root&&G.mode==='idle'&&G.place==='county'){init();refresh();}old.renderScene();decorate();};
newGame=function(...args){const inherited=args.length>=4&&state()?JSON.parse(JSON.stringify(state())):null;const r=old.newGame(...args);if(inherited)G.places45=inherited;return r;};
die=function(...args){const q=quest();if(q&&!['done','failed','cancelled'].includes(q.stage)){q.stage='failed';q.document=null;q.reason='这一生已经结束，未完成的个人回执约定终止。';}return old.die(...args);};
window.XTCounty45={state,quest,dispatch,response,people,stages};if(G)render();
})();
