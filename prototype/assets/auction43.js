/* 青石县小拍：有限家底、逐件竞价、押款与钱物同时交割。 */
(()=>{
'use strict';
const S=XTSandbox,W=XTWorld36,V=S.view;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const B=(text,action,arg='',off=false)=>`<button class="sb-btn" data-sb="a43:${action}" data-arg="${esc(arg)}" ${off?'disabled':''}>${esc(text)}</button>`;
const catalog=[{item:'qiPill',qty:2,base:24,step:2},{item:'qiManual',qty:1,base:36,step:3},{item:'spiritBlade',qty:1,base:96,step:4}];
const purses={dan:{cash:88,limits:{qiPill:40,qiManual:48}},smith:{cash:132,limits:{qiPill:30,spiritBlade:128}},broker:{cash:72,limits:{qiManual:66}}};
let message='',inTransaction=false;
function state(){return G?.auction43||null;}
function make(){return {version:1,serial:0,house:{cash:0,stock:{qiPill:2,qiManual:1,spiritBlade:1}},buyers:Object.fromEntries(Object.entries(purses).map(([id,p])=>[id,{cash:p.cash,inventory:{},limits:{...p.limits}}])),session:null};}
function lot(){const s=state()?.session;return s?.status==='active'?s.lots[s.index]:null;}
function commit(fn){
 if(inTransaction)return false;
 const before=JSON.stringify(G);inTransaction=true;
 try{fn();const raw=JSON.stringify(G);localStorage.setItem(SAVE_KEY,raw);if(localStorage.getItem(SAVE_KEY)!==raw)throw Error('存档校验失败');return true;}
 catch(e){G=JSON.parse(before);try{localStorage.setItem(SAVE_KEY,before);}catch(_){}message='保存失败，本次竞拍操作已撤回，钱物与押款保持原状。请先导出存档并检查浏览器存储。';return false;}
 finally{inTransaction=false;}
}
function eligible(id){const n=W.get(id);return n&&W.alive(n)&&n.place==='county';}
function release(l,reason){if(l.hold){stoneChange(G,l.hold,'县拍退回押款');l.hold=0;}if(reason)l.history.push(reason);}
function cancel(reason){const a=state(),s=a?.session;if(s?.status!=='active')return;release(lot(),reason);for(const l of s.lots)if(l.status==='open'){a.house.stock[l.item]=(a.house.stock[l.item]||0)+l.qty;l.status='returned';}s.status='cancelled';addLog('县拍散场：'+reason+'；未成交拍品收回，玩家押款退清。','mute');}
function validPlace(){return G.place==='county'&&S.state().room==='auction43';}
function token(){const s=state()?.session;return s?s.id+'|'+s.index+'|'+s.revision:'';}
function minimum(l){return l.bid?l.bid+l.step:l.base;}
function begin(){
 const previous=state()?.session;
 if(previous?.status==='active')return;
 if(previous&&S.now()<previous.opened+30){message='下一场在本场开场三十日后，再来查看告示。';return;}
 commit(()=>{
  if(!G.auction43)G.auction43=make();const a=state();
  const lots=catalog.filter(x=>(a.house.stock[x.item]||0)>=x.qty).map(x=>({...x,status:'open',bid:0,leader:null,hold:0,history:[],winner:null,price:0}));
  if(!lots.length){message='拍场现有拍品已经售罄。';return;}
  for(const l of lots)a.house.stock[l.item]-=l.qty;
  a.session={id:++a.serial,opened:S.now(),index:0,revision:0,status:'active',participants:Object.keys(a.buyers).filter(eligible),lots};
  addLog('你进入青石县小拍。入场免费，本届拍品、竞买人和钱袋已登记；本场议价不另推进日期。','mute');
 });
}
function raise(l,who,price){
 if(l.leader==='player')release(l,'原押款释放。');
 if(who==='player'){stoneChange(G,-price,'县拍举牌押款');l.hold=price;}
 l.bid=price;l.leader=who;l.history.push((who==='player'?G.name:W.get(who).name)+'举牌 '+price+' 灵石。');
}
function hammer(l){
 const a=state(),s=a.session;
 if(l.leader==='player'){
  a.house.cash+=l.hold;l.hold=0;G.inventory[l.item]=(G.inventory[l.item]||0)+l.qty;
 }else if(l.leader){const n=a.buyers[l.leader];n.cash-=l.bid;a.house.cash+=l.bid;n.inventory[l.item]=(n.inventory[l.item]||0)+l.qty;}
 else a.house.stock[l.item]=(a.house.stock[l.item]||0)+l.qty;
 l.status=l.leader?'sold':'unsold';l.winner=l.leader;l.price=l.bid;
 const text=l.leader?(l.leader==='player'?G.name:W.get(l.leader).name)+'以 '+l.bid+' 灵石拍得'+BAG_ITEMS[l.item].name+' × '+l.qty:'无人应价，'+BAG_ITEMS[l.item].name+'流拍收回';
 l.history.push('落槌：'+text+'。');addLog('县拍落槌：'+text+'。','up');s.index++;
 if(s.index>=s.lots.length){s.status='finished';addLog('青石县小拍收场，全部成交与流拍已登记。','mute');}
}
function round(l,all=false){
 const a=state(),s=a.session;
 if(l.leader&&l.leader!=='player'&&!eligible(l.leader)){l.history.push('原竞买人离场，撤回其报价。');l.leader=null;l.bid=0;}
 let turns=0;
 do{
  const need=minimum(l),id=s.participants.find(id=>id!==l.leader&&eligible(id)&&a.buyers[id].cash>=need&&(a.buyers[id].limits[l.item]||0)>=need);
  if(!id){hammer(l);return;}
  raise(l,id,need);turns++;
 }while(all&&turns<1000);
}
function dispatch(action,arg){
 if(!action.startsWith('a43:')){if(state()?.session?.status==='active'&&['room','routes','map','r36:travelMap','h41:visit'].includes(action)){message='本届尚在竞拍，请先在拍场办理离场、退清押款。';render();return true;}return false;}
 message='';
 if(action==='a43:leave'){
  if(state()?.session?.status==='active'&&!commit(()=>cancel('你提前离场'))) {render();return true;}
  S.state().room=window.XTScene46?'auction43':'shops';V.facility46=null;V.tab='scene';render();return true;
 }
 if(!systemReady()||!validPlace()||(window.XTScene46&&!XTScene46.isInside('auction43'))){message='请到商街相连的青石拍场，当面办理。';render();return true;}
 if(action==='a43:open'){begin();render();return true;}
 const l=lot(),s=state()?.session;
 if(!l||String(arg)!==token()){message='这次举牌已过期，请按当前拍品与价格操作。';render();return true;}
 let amount=minimum(l);
 if(action==='a43:custom')amount=Number(document.getElementById('auction-price43')?.value);
 if(['a43:bid','a43:custom'].includes(action)){
  if(!Number.isSafeInteger(amount)||amount<minimum(l)||amount>G.stones+l.hold){message='出价无效：须为整数、不低于当前最低价，且不超过可用灵石加本件押款。';render();return true;}
  commit(()=>{raise(l,'player',amount);s.revision++;addLog('县拍举牌 '+amount+' 灵石，已转入本件押款。','mute');});
 }else if(action==='a43:wait'||action==='a43:pass'){
  commit(()=>{round(l,action==='a43:pass');s.revision++;});
 }
 render();return true;
}
function draw(){
 const a=state(),s=a?.session,l=lot(),available=catalog.filter(x=>(a?.house.stock[x.item]??x.qty)>=x.qty);
 let html='<p>青石县 · 商街内院。免费入场，本场在同日逐件议价。会后隔三十日可再开场；现有库存售完即止。</p>';
 if(message)html+='<p class="auction-notice43" role="alert">'+esc(message)+'</p>';
 if(l){
  const t=token(),title=BAG_ITEMS[l.item];
  html+=`<section class="auction-lot43"><small>本届第 ${s.index+1} / ${s.lots.length} 件</small><h3>${esc(title.name)} × ${l.qty}</h3><p>${esc(title.desc)}</p><p>底价 ${l.base} · 最低加价 ${l.step} 灵石</p><strong>当前 ${l.bid?l.bid+' 灵石 · '+esc(l.leader==='player'?G.name:W.get(l.leader)?.name):'尚无人出价'}</strong><p>可用 ${G.stones} · 本件押款 ${l.hold} 灵石</p><div class="sb-buttons">${B('举牌 '+minimum(l)+' 灵石','bid',t,minimum(l)>G.stones+l.hold)}${B('等候下一口 / 落槌','wait',t)}${B('不再加价 · 旁观至落槌','pass',t)}</div><label class="auction-input43">自定义出价 <input id="auction-price43" type="number" min="${minimum(l)}" step="1" value="${minimum(l)}" inputmode="numeric">${B('确认举牌','custom',t)}</label><p>被超价即退押款。等候一次听一口价；无人再加价才落槌。旁观时保留已举牌承诺；若仍领先便按此价成交。</p><ol class="auction-history43">${l.history.map(x=>'<li>'+esc(x)+'</li>').join('')||'<li>执事：请诸位依次举牌。</li>'}</ol></section>`;
  html+='<details><summary>在场竞买人</summary>'+s.participants.map(id=>'<p>'+esc(W.get(id)?.name)+' · '+(eligible(id)?'在场':'已离场')+' · 可用私款 '+a.buyers[id].cash+' 灵石</p>').join('')+'<p>各人使用登记私款，与铺面经营钱匣分开；按需要与自己的承受价出价，不随你的财富加码。私款不会按场次补满。</p></details>';
 }else{
  if(s)html+='<h3>'+(s.status==='finished'?'本届已散场':'本届已提前离场')+'</h3><ul>'+s.lots.map(x=>'<li>'+esc(BAG_ITEMS[x.item].name)+'：'+(x.status==='sold'?esc(x.winner==='player'?G.name:W.get(x.winner)?.name)+' · '+x.price+' 灵石':x.status==='unsold'?'流拍':'收回待拍')+'</li>').join('')+'</ul>';
  html+='<h3>待拍告示</h3>'+available.map(x=>`<p><b>${esc(BAG_ITEMS[x.item].name)} × ${x.qty}</b> · 底价 ${x.base} / 加价 ${x.step}<br>${esc(BAG_ITEMS[x.item].desc)}</p>`).join('');
  html+=available.length?B('登记入场 · 免费','open','',!!s&&S.now()<s.opened+30):'<p>本县拍场现有拍品已经售罄，暂无新货。</p>';
  if(s&&S.now()<s.opened+30)html+='<p>下次开场：本届开场三十日后。</p>';
 }
 html+='<p>拍场自有货品独立入账；拍得之物进入实际行囊，可按物品用途服用、装备或研读。</p>'+B('离开拍场 · 退清未成交押款','leave');
 document.body.classList.add('sb-screen');document.getElementById('scene').innerHTML='<section class="sb-shell auction43"><header class="sb-head"><div><small>青石县 · 商街内院</small><h2>青石拍场</h2></div><span>'+G.stones+' 灵石</span></header><div class="sb-scroll">'+html+'</div></section>';
 document.querySelectorAll('.auction43 [data-sb]').forEach(b=>b.onclick=()=>S.dispatch(b.dataset.sb,b.dataset.arg));
}
const old={renderView:W.renderView,renderScene,die,startEvent,restore,applyOption,newGame};
W.renderView=function(){if(G.mode==='idle'&&V.tab==='scene'&&validPlace()&&(!window.XTScene46||XTScene46.isInside('auction43'))){draw();return true;}return old.renderView();};
// 离开会场或寿尽先释放押款；已提交的成交不回滚。
renderScene=function(){const s=state()?.session;if(s?.status==='active'&&(!validPlace()||G.mode==='dead'))commit(()=>cancel('你已离开会场'));old.renderScene();};
die=function(...args){if(state()?.session?.status==='active'&&!commit(()=>cancel('你已无法继续竞拍')))cancel('寿尽，存储暂不可用，先清理当前占款');return old.die(...args);};
function retire(){G.mode='idle';G.curEvent=null;G.lastResult=null;V.tab='scene';if(G.place==='county'){S.state().roomAt='county';S.state().room='auction43';}addLog('旧县城拍卖改由商街内青石拍场办理。旧选项不再随机扣款或直接增加寿元。','mute');}
startEvent=function(ev){if(ev?.id==='E012'){retire();save();render();return;}return old.startEvent(ev);};
applyOption=function(ev,...args){if(ev?.id==='E012'){retire();save();render();return;}return old.applyOption(ev,...args);};
restore=function(raw){
 const previous=G;let migrating=false;
 try{const o=JSON.parse(raw);migrating=o.curEvent?.id==='E012'&&o.mode==='event';if(migrating){stoneBackup(raw);o.curEvent=null;o.mode='idle';o.lastResult=null;raw=JSON.stringify(o);}}
 catch(e){XTEconomy40.lastRestoreError='旧拍卖迁移前备份失败，原档保留。';return false;}
 if(!old.restore(raw))return false;
 if(migrating){retire();if(!XTMode41.isPending()&&!commit(()=>{})){G=previous;XTEconomy40.lastRestoreError='拍卖迁移保存失败，原档已备份。';return false;}}
 return true;
};
newGame=function(...args){const estate=args.length>=4&&G?.auction43?JSON.parse(JSON.stringify(G.auction43)):null;const result=old.newGame(...args);if(estate)G.auction43=estate;return result;};
const retired=EVENTS.find(e=>e.id==='E012');if(retired)retired.cond=()=>false;
window.XTAuction43={state,lot,token,dispatch,catalog,draw};
if(G?.curEvent?.id==='E012'&&G.mode==='event'){const raw=JSON.stringify(G);restore(raw);}
if(G)render();
})();
