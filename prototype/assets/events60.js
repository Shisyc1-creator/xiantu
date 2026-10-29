/* Canonical event eligibility, bound people, item costs and atomic settlement. */
(()=>{'use strict';
const S=XTSandbox,W=XTWorld36,C=XTContent47,records=new Map(),battleHooks=new Map(),actions=new Map(),panels=new Map();
let activeId=null,locked=false;
const all=()=>EVENTS.concat(ROAD_EVENTS),find=id=>all().find(e=>e.id===id),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stopped=e=>!e||e.retired36||e.id==='E012';
function state(){if(!G?.world36?.playerId)return null;const ownerId=G.world36.playerId;if(G.events60?.ownerId!==ownerId)G.events60={version:1,ownerId,contexts:{},history:[],tasks:{}};return G.events60;}
function context(id){const e=find(id),d=state();if(d?.contexts[id]&&(activeId===id||G.mode==='event'&&G.curEvent?.id===id||G.eventsDone?.[id]&&d.contexts[id].settled60))return d.contexts[id];return e?.bind60?.(G)||{};}
function patch(id,def,reason=''){const e=find(id);if(!e)throw Error('Unknown event '+id);if(['H01','H02','H05','H07','H08'].includes(id)&&def.cond){const cond=def.cond;def={...def,cond:s=>Number.isFinite(s.age)&&s.age>=18&&cond(s)};}Object.assign(e,def);records.set(id,{id,name:e.name,status:stopped(e)?'replaced':'revised',reason});return e;}
function review(id,reason){const e=find(id);if(e)records.set(id,{id,name:e.name,status:stopped(e)?'replaced':'reviewed',reason});}
function eligible(e,ctx){
 if(stopped(e)||!G?.root||!['idle','event'].includes(G.mode)||window.XTQi51?.state()?.battle)return '这件事眼下不适用。';
 if(ctx?.settled60)return '本次选择已经结算。';
 if(e.once&&G.eventsDone?.[e.id]||(G.evtCd?.[e.id]||0)>G.age)return '这件事已经处理，或尚未到再次发生的时候。';
 if(e.road){if(!G.road)return '须在实际旅途中处理。';}
 else if(e.place&&e.place!=='any'&&e.place!=='home'&&G.place!==e.place||e.place==='home'&&G.place!==G.home)return '须到事情发生的地方。';
 if(e.cond&&!e.cond(G))return '相关人物或前因已不符合。';
 if(ctx?.actorId){const n=W.get(ctx.actorId);if(e.isDeceased60){if(!n||W.alive(n))return '追忆对象尚未核实。';}
  else if(!W.alive(n)||n.place!==G.place||e.actorMode60==='present'&&!W.present(ctx.actorId))return '原当事人已不在此处，不能换人办理。';}
 return '';
}
function optionReason(e,o,ctx){const why=eligible(e,ctx);if(why)return why;if(o.cost&&G.stones<o.cost)return '灵石不足。';if(o.wen&&C.money().wen<o.wen)return '凡钱不足。';if(o.need&&!hasRoute(G,o.need))return '尚未掌握所需术法。';
 for(const [id,n]of Object.entries(o.items||{}))if(!BAG_ITEMS[id]||!Number.isSafeInteger(n)||n<=0||(G.inventory?.[id]||0)<n)return '所需实物不足。';return o.check?.(G)||'';
}
function settle(ev,index,showResult=false){const e=find(ev?.id),o=e?.opts?.[index];if(!o||locked)return null;const d=state();if(!d)return null;const ctx=context(e.id);const why=optionReason(e,o,ctx);if(why){toast(why);return null;}
 let result=null;locked=true;activeId=e.id;
 try{const ok=C.atomic(()=>{const st=state();st.contexts[e.id]={...ctx,ownerId:st.ownerId};
  if(o.days){const r=advanceDays(o.days,{act:'事件经历',rate:0,incomeMul:0,eventRate:0},{stopOnEvent:true});if(r.died){G.curEvent=null;die('寿元耗尽');return;}if(r.event||r.days<o.days)return;}
  const reason=optionReason(e,o,state().contexts[e.id]);if(reason){toast(reason);return;}
  const before={stones:G.stones,wen:C.money().wen};if(o.cost)C.debit('stone',o.cost,e.name);if(o.wen)C.debit('wen',o.wen,e.name);for(const [id,n]of Object.entries(o.items||{}))G.inventory[id]-=n;
  let succ=null,res;if(typeof o.chance==='function'){succ=Math.random()<Math.max(.05,Math.min(.92,o.chance(G)));res=(succ?o.ok:o.no)(G);}else res=o.run(G);
  if(!res||typeof res.t!=='string')throw Error('事件结果缺失');
  G.eventsDone[e.id]=true;state().contexts[e.id].settled60=true;if(e.cd)G.evtCd[e.id]=G.age+e.cd;G.evtCount=(G.evtCount||0)+1;if(!e.road)G.evtGap=G.age+1;
  if(G.road){if(o.d)G.road.extra=(G.road.extra||0)+o.d;if(o.cancel)G.road.cancel=true;}
  if(res.log)addLog(res.log,succ===false?'dn':'');clampState();state().history.push({id:e.id,choice:index,at:S.now(),actorId:ctx.actorId||null,ownerId:state().ownerId,outcome:succ,text:res.log||e.name,stones:G.stones-before.stones,wen:C.money().wen-before.wen});state().history=state().history.slice(-160);result={res,succ};if(showResult){G.curEvent=null;G.lastResult={title:e.name,text:res.t};G.mode='result';}
 });if(!ok){result=null;if(G?.mode==='event'&&G.curEvent?.id)G.curEvent=find(G.curEvent.id)||null;toast(C.takeFailure()||'保存失败，尚未结算。');}return result;
 }finally{activeId=null;locked=false;}}
function touch(id,text,delta=1){const n=W.get(id),r=W.relation(id);if(!n||!r)return;if(delta)r.trust=Math.max(-100,Math.min(100,r.trust+delta));r.history.unshift({day:S.now(),text});r.history=r.history.slice(0,24);}
function button(label,action,arg='',off=false){return '<button class="sb-btn" data-sb="e60:'+esc(action)+'" data-arg="'+esc(arg)+'" '+(off?'disabled':'')+'>'+esc(label)+'</button>';}
const old={startEvent,chooseOption,restore,dispatch:S.dispatch,actorPanel:W.actorPanel,accepted:XTScene46.accepted,renderEvent};
applyOption=settle;
startEvent=function(ev){const e=find(ev?.id);if(!e)return;activeId=e.id;try{const ctx=e.bind60?.(G)||{},why=eligible(e,ctx);if(why){toast(why);return;}state().contexts[e.id]={...ctx,ownerId:state().ownerId};old.startEvent(e);}finally{activeId=null;}};
chooseOption=function(i){if(!G?.curEvent)return;const e=find(G.curEvent.id),r=settle(e,i,true);if(r)render();};
renderEvent=function(){if(G?.curEvent?.id)G.curEvent=find(G.curEvent.id)||G.curEvent;old.renderEvent();const el=document.getElementById('scene'),e=G.curEvent;if(!e)return;for(const b of el.querySelectorAll('.choice')){const o=e.opts[Number(b.dataset.i)];if(o&&optionReason(e,o,context(e.id)))b.disabled=true;}};
S.dispatch=function(a,arg){if(a?.startsWith('e60:')){if(!systemReady())return;const fn=actions.get(a.slice(4));if(fn)fn(arg);render();return;}return old.dispatch(a,arg);};
W.actorPanel=function(id){let html=old.actorPanel(id);for(const fn of panels.values())html+=fn(id)||'';return html;};
XTScene46.accepted=function(){const rows=old.accepted();for(const t of Object.values(state()?.tasks||{})){if(!t||!['active','won'].includes(t.status))continue;rows.push({title:t.title||find(t.id)?.name||'往来事件',status:t.status==='won'?'待交代':'进行中',text:t.description||'按约定自愿参与，可暂缓或取消。',next:t.status==='won'?'回原当事人处当面交代':t.next||'按约定地点与目标继续',where:t.sourceId?W.get(t.sourceId)?.name:'原地点'});}return rows;};
restore=function(raw){try{const x=JSON.parse(raw),d=x.events60;if(d&&(d.version!==1||d.ownerId!==x.world36?.playerId||!d.contexts||Array.isArray(d.contexts)||!d.tasks||Array.isArray(d.tasks)||!Array.isArray(d.history)||Object.values(d.contexts).some(c=>!c||typeof c!=='object'||c.ownerId!==d.ownerId||c.actorId!=null&&typeof c.actorId!=='string')))throw Error('事件记录无效');}catch(_){return false;}const ok=old.restore(raw);if(ok&&G.curEvent?.id)G.curEvent=find(G.curEvent.id)||null;return ok;};
window.XTEvents60={state,patch,review,context,touch,button,eligible,optionReason,registerBattle:(k,f)=>battleHooks.set(k,f),onBattle(b,outcome){for(const fn of battleHooks.values())fn(b,outcome);},registerAction:(k,f)=>actions.set(k,f),registerActorPanel:(k,f)=>panels.set(k,f),audit:()=>all().map(e=>records.get(e.id)||{id:e.id,name:e.name,status:'pending',reason:''})};
for(const e of all())if(stopped(e))review(e.id,e.id==='E012'?'已由真实拍场替代':'旧身份、婚育、债务或借洞快捷事件，改由真实人物/契约入口办理');
})();
