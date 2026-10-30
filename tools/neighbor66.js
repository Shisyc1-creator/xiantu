/* 首条邻府商道：2026-10-30确认的试玩参数。无定期补货，不改变县府旧路。 */
(()=>{'use strict';
const S=XTSandbox,W=XTWorld36,C=XTContent47,V=S.view;
const PLACE='qingNeighbor66',PERSON='qingMerchant66';
const old={depart:departTo,finish:finishRoad,advance:advanceDays,scene:renderScene,actions:renderActions,restore,available:placeAvailable,route:routeAvailable,label:W.locationLabel,map:showMap,die,render,actor:W.actorPanel};
let moving=false,notice='';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const local=()=>G?.birthContext?.id==='daliang-qing';
const trip=()=>G?.road?.cross66?G.road:null;
const pair=(a,b)=>(a==='prefecture'&&b===PLACE)||(a===PLACE&&b==='prefecture');
PLACES[PLACE]={name:'青州邻府城',tier:'府城',qi:PLACES.prefecture.qi,order:PLACES.prefecture.order,facilities:['trade'],needRealm:0,goods:['青髓矿','凝露芦收购'],note:'沿商道抵达的邻府城。商街有一批待售矿料，也收购水泽药材；现货售完后暂无到货日期。',rumor:[],sub:['城门','商街']};
ROUTES.push({a:'prefecture',b:PLACE,li:2400,road:'府际商道',risk:1,needRealm:0,cross66:true});
S.actors[PERSON]={name:'陶衡',role:'矿料商人',place:PLACE,room:'shops'};
placeAvailable=function(id){return id===PLACE?(local()||G?.place===PLACE):old.available(id);};
routeAvailable=function(r){return r?.cross66?(local()||G?.place===PLACE):old.route(r);};
W.locationLabel=function(){return G?.place===PLACE?'大梁 · 青州 · 邻府城':old.label();};
function market(){return G?.world36?.neighbor66;}
function ensure(){if(!G?.root||!G.world36||!local()&&!market())return;
 if(!market()){
  G.world36.neighbor66={version:1,ore:4,reedDemand:4,reeds:0,cash:48,revision:0};
  G.world36.people[PERSON]={id:PERSON,name:'陶衡',role:'矿料商人',realm:-1,layer:0,root:'无灵根',sex:'男',birth:S.now()-35*360,life:70,alive:true,place:PLACE,room:'shops',source:'邻府矿料商人，自有青髓矿四份与收购钱匣',goal:'卖出手中矿料，收一批凝露芦',need:'riverReed57'};
 }
}
function transact(fn){notice='';const ok=C.atomic(fn);if(!ok)notice=C.takeFailure()||'保存失败，本次行动已撤回。';render();return ok;}
function arrive(){const r=trip();if(!r)return;const to=r.returning?r.from:r.to;
 G.place=to;G.been||={};G.been[to]=1;G.road=null;G.mode='idle';G.curEvent=null;G.lastResult=null;
 Object.assign(S.state(),{roomAt:to,room:'square'});V.actor=null;V.detail=null;V.tab='scene';
 for(const id of W.world().followers){const n=W.get(id);if(W.alive(n)){n.place=to;n.room='square';}}
 W.sync();addLog('沿府际商道'+(r.returning?'返回':'抵达')+placeName(to)+'。行进与停留共 '+(r.spent+r.wait)+' 日。','mute');
}
function run(days){const r=trip();if(!r||G.mode!=='idle')return;
 const remaining=r.returning?r.progress:r.total-r.progress,n=Math.min(days,remaining);if(n<=0){arrive();return;}
 let out;moving=true;try{out=advanceDays(n,{act:'travel',rate:CFG.walkRate,incomeMul:0},{stopOnEvent:true});}finally{moving=false;}
 const live=trip();if(!live)return;live.progress+=live.returning?-out.days:out.days;live.spent+=out.days;live.days=live.returning?live.progress:live.total-live.progress;
 if(out.died){G.road=null;die('寿元耗尽');return;}
 if(out.event){startEvent(out.event);return;}
 if(live.days===0)arrive();
}
function depart(to){if(trip())return;if(!pair(G?.place,to))return old.depart(to);if(!systemReady()||trip()||!routeAvailable(routeOf(G.place,to)))return;
 ensure();closeMainOverlay();return transact(()=>{const from=G.place,total=travelDays(2400);G.road={cross66:true,version:1,from,to,total,progress:0,spent:0,wait:0,days:total,extra:0,cancel:false,returning:false};
  const e=tryRoadEvent(1,total,from,to);if(e)startEvent(e);else G.mode='idle';
 });}
departTo=depart;
die=function(...a){if(trip())G.road=null;return old.die(...a);};
advanceDays=function(n,ctx={},opt){const active=!!trip();const result=old.advance(n,active?{...ctx,incomeMul:0}:ctx,opt);if(active&&!moving&&trip())trip().wait+=result.days;return result;};
finishRoad=function(){if(!trip())return old.finish();return transact(()=>{G.mode='idle';G.curEvent=null;G.lastResult=null;const r=trip();
 if(r.extra){const n=r.extra;r.extra=0;const out=advanceDays(n,{act:'旅途停留',rate:0,incomeMul:0,eventRate:0},{stopOnEvent:true});if(out.died){G.road=null;die('寿元耗尽');return;}}
 if(r.cancel){r.returning=true;r.cancel=false;r.days=r.progress;}if(r.days===0)arrive();
 });};
function trade(kind,revision){ensure();const m=market();if(!m||!systemReady()||trip()||G.place!==PLACE||S.state().room!=='shops'||!W.present(PERSON)||Number(revision)!==m.revision)return;
 if(kind==='buy'&&(m.ore<1||G.stones<8)||kind==='sell'&&(m.reedDemand<1||m.cash<12||!(G.inventory.riverReed57>0)))return;
 return transact(()=>{const s=market();if(kind==='buy'){C.debit('stone',8,'向陶衡买青髓矿');s.cash+=8;s.ore--;G.inventory.blueOre57=(G.inventory.blueOre57||0)+1;}
 else {G.inventory.riverReed57--;s.reeds++;s.reedDemand--;s.cash-=12;stoneChange(G,12,'向陶衡交售凝露芦');}s.revision++;addLog(kind==='buy'?'向陶衡买得青髓矿一份，付8灵石。':'向陶衡交售凝露芦一份，得12灵石。','mute');});
}
function dispatch(a,arg){if(a?.startsWith('n66:')){const type=a.slice(4);if(type==='depart')depart(arg);else if(type==='buy'||type==='sell')trade(type,arg);else if(trip()&&G.mode==='idle'){
 if(type==='back')transact(()=>{const r=trip();r.returning=true;r.days=r.progress;if(!r.days)arrive();});
 if(type==='step'||type==='all')transact(()=>run(type==='step'?7:trip().days));}return true;}
 if(trip()&&!['saves','settings'].includes(a))return true;
 if(G?.place===PLACE&&['work','ask','visit','hunt','gather'].includes(a)){notice='眼下先到商街看货，或沿商道返回。';render();return true;}return false;}
const B=(text,type,arg='',disabled=false)=>`<button class="sb-btn" data-n66="${type}" data-arg="${esc(arg)}" ${disabled?'disabled':''}>${esc(text)}</button>`;
W.actorPanel=function(id){const html=old.actor(id);if(id!==PERSON||G.place!==PLACE||S.state().room!=='shops')return html;const m=market(),present=W.present(PERSON);return html+`<article class="sb-card"><h3>陶衡的矿料摊</h3><p>${present?'青髓矿剩 '+m.ore+' 份，每份8灵石；凝露芦还收 '+m.reedDemand+' 份，每份12灵石。':'陶衡已不在此处，暂不能交易。'}<br>这批货售完后暂无到货日期。</p><div class="sb-buttons">${B('买青髓矿 · 8灵石','buy',m.revision,!present||!m.ore||G.stones<8)}${B('交售凝露芦 · 得12灵石','sell',m.revision,!present||!m.reedDemand||m.cash<12||!(G.inventory.riverReed57>0))}</div></article>`;};
function bind(el){el.querySelectorAll('[data-n66]').forEach(b=>b.onclick=()=>dispatch('n66:'+b.dataset.n66,b.dataset.arg));}
function travelPanel(){const r=trip();const remaining=r.returning?r.progress:r.total-r.progress;return `<section class="sb-shell"><header class="sb-head"><h2>府际商道</h2></header><div class="sb-scroll"><article class="sb-card"><h3>${esc(placeName(r.from))} → ${esc(placeName(r.to))}</h3><p>${r.returning?'正在原路返回':'正在赶路'} · 还需 ${remaining} 日<br>距出发处 ${r.progress} 日路程 · 已行进 ${r.spent} 日 · 停留 ${r.wait} 日</p><p>赶路不自动赚取灵石。日子照常过去，人物、租期与家业仍随世界钟变化。</p>${notice?'<p role="status">'+esc(notice)+'</p>':''}<div class="sb-buttons">${B('继续赶路 · '+Math.min(7,remaining)+'日','step')}${B('走完余程 · '+remaining+'日','all')}${B(r.progress?'原路返回 · '+r.progress+'日':'暂不出发，返回城内','back','',r.returning)}</div></article></div></section>`;}
renderScene=function(...a){ensure();if(trip()&&G.mode==='idle'&&!G.qi51?.battle){document.body.classList.add('sb-screen');const el=document.getElementById('scene');el.innerHTML=travelPanel();bind(el);return;}const result=old.scene(...a);if(!G||G.mode!=='idle'||V.tab!=='scene')return result;
 const host=document.getElementById('scene')?.querySelector('.sb-scroll');if(!host)return result;
 if(G.place===PLACE){host.querySelector('.foundation-entry57')?.remove();host.querySelectorAll('[data-sb="work"],[data-sb="ask"]').forEach(b=>b.remove());}
 let html='';if((local()&&G.place==='prefecture')||G.place===PLACE){const to=G.place===PLACE?'prefecture':PLACE;html+=`<article class="sb-card"><h3>府际商道</h3><p>去往${esc(placeName(to))} · 2400里 · ${travelDays(2400)}日。沿路可能遇事；出发后可分段赶路或原路返回。</p>${B('沿商道出发','depart',to)}</article>`;}

 if(html){const div=document.createElement('div');div.innerHTML=html+(notice?'<p role="status">'+esc(notice)+'</p>':'');host.append(div);bind(div);}bind(host);return result;
};
render=function(...a){if(trip()&&G.mode==='idle'){V.tab='scene';V.sub='';}const out=old.render(...a);if(G?.place===PLACE){const label=document.querySelector('.next-vertical');if(label)label.textContent='邻府城 · 人间行旅';}return out;};
renderActions=function(...a){if(trip()){document.getElementById('actions').innerHTML='';return;}return old.actions(...a);};
showMap=function(...a){old.map(...a);if(!G||!((local()&&G.place==='prefecture')||G.place===PLACE))return;const host=document.getElementById('mapBody');if(!host)return;if(G.place===PLACE&&mapNav.level==='local'){host.innerHTML='';const crumb=document.querySelector('.mapcrumb .on');if(crumb)crumb.textContent='邻府城';}const div=document.createElement('div'),to=G.place===PLACE?'prefecture':PLACE;div.innerHTML='<article class="sb-card"><h3>府际商道</h3><p>'+esc(placeName(G.place))+' ↔ '+esc(placeName(to))+' · 2400里 · '+travelDays(2400)+'日</p>'+B('沿商道出发','depart',to)+'</article>';host.append(div);bind(div);};
function valid(x){const m=x.world36?.neighbor66;if(m){if(m.version!==1||!['ore','reedDemand','reeds','cash','revision'].every(k=>Number.isSafeInteger(m[k])&&m[k]>=0)||m.ore>4||m.reedDemand>4||m.reeds!==4-m.reedDemand||m.cash!==48+8*(4-m.ore)-12*m.reeds||m.revision!==4-m.ore+m.reeds||!x.world36.people?.[PERSON])throw Error('邻府库存无效');}
 const r=x.road;if(r?.cross66){if(r.version!==1||!pair(r.from,r.to)||x.place!==r.from||!['total','progress','spent','wait','days','extra'].every(k=>Number.isSafeInteger(r[k])&&r[k]>=0)||r.total<1||r.progress>r.total||r.spent<r.progress||typeof r.returning!=='boolean'||typeof r.cancel!=='boolean'||r.days!==(r.returning?r.progress:r.total-r.progress))throw Error('府际行程无效');}
 if(x.place===PLACE&&!m)throw Error('邻府记录缺失');}
restore=function(raw){let incoming;try{incoming=JSON.parse(raw);valid(incoming);}catch(_){return false;}const ok=old.restore(raw);if(ok){if(incoming.road?.cross66&&incoming.mode==='idle'&&trip()){G.mode='idle';G.lastResult=null;}ensure();}return ok;};
window.XTNeighbor66={dispatch,market,trip,ensure,place:PLACE,person:PERSON,valid};
})();
