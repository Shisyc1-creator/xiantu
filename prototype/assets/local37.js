/* 青石县药路：世界状态驱动，沿用统一世界钟、人物、库存和存档。 */
(()=>{
'use strict';
const S=XTSandbox,W=XTWorld36;
const old={advanceDays,worldTick,renderScene,restore,newGame,actorPanel:W.actorPanel};
const medical=['herb','qiPill','healingPowder'];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(label,act,off=false)=>`<button class="sb-btn" data-sb="l37:${act}" ${off?'disabled':''}>${label}</button>`;
const living=id=>W.alive(W.get(id));
const present=id=>window.XTShop38?.present(id)??W.present(id);
const operational=()=>window.XTShop38?.canContinue()??living('grocer');
const ownerName=()=>window.XTShop38?.ownerName()||'王掌柜';
const amount=n=>Math.round(n*economyFactor());
function state(){
 if(!G)return null;
 if(!G.local37){
  if(!['idle','event','dead'].includes(G.mode))return null;
  G.local37={version:1,phase:'quiet',startAt:S.now()+14,last:S.now(),delivered:0,target:18,playerSupply:0,npcSupply:0,shops:{},history:[],credit:false,premium:false,contract:null,benefitUntil:0,markupUntil:0};
 }
 return G.local37;
}
function record(s,text,at=S.now()){
 s.history.unshift({day:at,text});s.history=s.history.slice(0,24);
 S.state().news.unshift({at,text});S.state().news=S.state().news.slice(0,40);addLog(text,'mute');
}
function relationship(s,id,text,trust,deed){
 id=window.XTShop38?.personId(id)||id;
 if(!living(id))return;
 const r=W.relation(id);r.trust=Math.max(0,Math.min(100,r.trust+trust));
 r.history.unshift({day:S.now(),text});r.history=r.history.slice(0,24);
 if(deed&&!r.deeds.includes(deed))r.deeds.push(deed);
 if(trust<0&&!r.bonds.includes('旧怨'))r.bonds.push('旧怨');
 S.state().relations[id]=Math.floor(r.trust/10);
}
function shopData(id){
 const s=state();if(!s||!['grocer','dan'].includes(id))return null;
 let st=s.shops[id];
 if(!st){const prev=S.state().shops[id];st=s.shops[id]=prev?JSON.parse(JSON.stringify(prev)):{month:absMonth(),stock:{...S.actors[id].stock},wallet:amount(240)};}
 if(st.month!==absMonth()){
  if(window.XTShop38?.freezeRestock(id)){st.month=absMonth();return st;}
  st.month=absMonth();st.wallet=amount(240);
  for(const [item,count]of Object.entries(S.actors[id].stock)){
   if(s.phase==='shortage'&&medical.includes(item))continue;
   st.stock[item]=count;
  }
 }
 return st;
}
function failContract(s,text){
 if(!s.contract||s.contract.status!=='active')return;
 s.contract.status='failed';s.contract.cargo=0;
 relationship(s,'grocer',text,-12,'medicine37_broken');record(s,text);
}
function finish(s,at){
 if(s.phase!=='shortage')return;
 s.phase='recovered';s.finishedAt=at;
 // Reserve deliveries have met local demand. The next monthly shipment restores shelves.
 const st=s.shops.grocer;if(st){st.stock.herb+=6;st.stock.qiPill+=2;st.stock.healingPowder+=3;}
 const dan=s.shops.dan;if(dan)dan.stock.healingPowder+=2;
 record(s,'青石县药材供应恢复，百草铺撤下急购告示，药价回落。',at);
 if(s.contract?.status==='active'&&!s.contract.cargo){s.contract.status='cancelled';record(s,'县中急缺已解，尚未提货的运药约定取消，不记失约。',at);}
}
function supply(s,count,source,at=S.now()){
 if(s.phase!=='shortage')return 0;
 const n=Math.min(count,s.target-s.delivered);s.delivered+=n;
 if(source==='npc')s.npcSupply+=n;else s.playerSupply+=n;
 if(s.delivered>=s.target)finish(s,at);
 return n;
}
function credit(s){
 if(s.credit||s.premium||s.playerSupply<6)return;
 s.credit=true;s.benefitUntil=S.now()+180;s.benefitOwnerId=window.XTShop38?.operator()||'grocer';
 relationship(s,'grocer','缺药时实供六株以上，记下这次支援，半年内购药九折。',10,'medicine37_aid');
 relationship(s,'dan','县中药源获得支援，炉坊也记下这次人情。',5,'medicine37_aid');
 record(s,ownerName()+'与柳丹师记下供药之情：半年内，两处药品报价九折。');
}
function tick(){
 const s=state();if(!s)return;
 const now=S.now();
 if(s.phase==='quiet'&&now>=s.startAt){
  if(!operational()){s.phase='closed';record(s,'百草铺掌柜已不在，县中药路急购未能组织。',s.startAt);}
  else{
   s.phase='shortage';s.beganAt=s.startAt;s.nextNpcAt=s.startAt+30;
   const g=shopData('grocer'),d=shopData('dan');
   g.stock.herb=Math.min(g.stock.herb,3);g.stock.qiPill=Math.min(g.stock.qiPill,2);g.stock.healingPowder=Math.min(g.stock.healingPowder,3);d.stock.healingPowder=Math.min(d.stock.healingPowder,1);
   record(s,'青石县连雨，山间药路塌方。百草铺存药告急，柳丹师减供养脉散，药价上涨。',s.startAt);
  }
 }
 if(s.phase==='shortage'&&!operational()){
  s.phase='closed';if(s.contract?.status==='active'){s.contract.status='cancelled';s.contract.cargo=0;}
  record(s,'王掌柜已故，原药路约定撤销，未交货物不再结算。');
 }
 // NPC deliveries are scheduled world actions, regardless of the player's location.
 while(s.phase==='shortage'&&s.nextNpcAt<=now){
  const at=s.nextNpcAt;
  if(s.contract?.status==='active'&&s.contract.due<at)failContract(s,'承诺的运药期限已过，王掌柜另作安排，记下一次失约。');
  if(!s.hired){s.hired=true;record(s,'百草铺按既定安排另托商队绕行白水渡采购，首批货预计十五日后到县。',at);}
  else{const n=supply(s,6,'npc',at);record(s,'另雇商队送到青叶草'+n+'株，优先补上县中欠供。',at);}
  s.nextNpcAt+=15;
 }
 if(s.contract?.status==='active'&&now>s.contract.due)failContract(s,'承诺的运药期限已过，王掌柜另作安排，记下一次失约。');
 s.last=now;
}
function quote(id,item){
 const s=state();if(!s||!['grocer','dan'].includes(id)||!medical.includes(item))return 1;
 return (s.phase==='shortage'?1.8:1)*(s.markupUntil>S.now()?1.1:s.benefitUntil>S.now()?.9:1);
}
function onTrade(id,item,selling){
 const s=state();if(!s||id!=='grocer'||item!=='herb'||!selling||s.phase!=='shortage')return;
 // Sold herbs are allocated to outstanding orders, so the same unit cannot be bought back and counted again.
 shopData(id).stock.herb--;supply(s,1,'player');credit(s);
}
function shopNote(id){
 const s=state();if(!s||!['grocer','dan'].includes(id))return '';
 return (s.phase==='shortage'?'药路受阻，药材与丹药暂不按月补货；百草铺急购的青叶草直接拨给欠供人家。':'药路平稳，药材与丹药随每月货运补给。')+(s.markupUntil>S.now()?' 因上次急购议价，当前药品报价加一成。':s.benefitUntil>S.now()?' 因供药旧恩，当前药品报价九折。':'');
}
function detail(){
 const s=state();if(!s)return '';
 const local=['county','riverTown'].includes(G.place);
 if(!local){
  const c=s.contract;if(c?.status!=='active')return '';
  return `<article class="sb-card local37"><h4>运药约定</h4><p>与王掌柜约定的期限还余 ${Math.max(0,c.due-S.now())} 日。${c.cargo?'封装青叶草十二株仍在随身货物中，须送回县城百草铺。':'需到白水渡找白船主提药十二株，再送回县城。'}</p></article>`;
 }
 let text=s.phase==='quiet'?'药铺尚有常备药材，白水渡商路照常通行。':s.phase==='shortage'?`连雨阻了山路，县中仍缺青叶草 ${s.target-s.delivered} 株。药铺与炉坊减少供药。` :s.phase==='closed'?'旧掌柜已故，原药路急购已撤销。':'山间药路恢复，药铺撤下急购告示。';
 let actions='';
 if(s.phase==='shortage'&&present('grocer')){
  const unavailable=(G.inventory.herb||0)<6||s.target-s.delivered<6;
  actions+=button('供药6株 · 1日 / '+amount(12)+'灵石','supply',unavailable);
  actions+=button('赠药6株 · 1日','donate',unavailable);
  if(!s.premium)actions+=button('急价供药6株 · 1日 / '+amount(30)+'灵石 · 伤交情','premium',unavailable);
  if(!s.contract)actions+=button('承诺运药 · 45日内 / 交货得'+amount(24)+'灵石','promise');
 }
 const c=s.contract;
 if(c?.status==='active'){
  text+=`<br>${esc(ownerName())}的运药约定：余 ${Math.max(0,c.due-S.now())} 日，${c.cargo?'已提青叶草12株，送回县城百草铺':'需到白水渡找白船主提药12株'}。`;
  if(!c.cargo&&present('ferry')&&operational())actions+=button('提取运药货物 · 1日','pickup');
  if(c.cargo&&present('grocer'))actions+=button('交付运药 · 1日 / '+amount(24)+'灵石','deliver');
 }
 const recent=s.history.slice().reverse().filter((h,i,a)=>a.findIndex(x=>x.text===h.text)===i).slice(0,3).reverse();
 const history=recent.length?'<details><summary>最近药讯</summary><p>'+recent.map(h=>esc(h.text)).join('<br>')+'</p></details>':'';
 return `<article class="sb-card local37"><h4>青石药讯</h4><p>${text}</p>${history}<div class="sb-buttons">${actions}</div></article>`;
}
function act(days,fn){
 if(!systemReady())return;
 closeMainOverlay();const r=advanceDays(days,{act:'medicine37',rate:0,incomeMul:0},{stopOnEvent:true});
 if(r.died){die('寿元耗尽');return;}if(r.event){startEvent(r.event);return;}if(r.days!==days){save();render();return;}
 fn();save();render();
}
function dispatch(action){
 if(!action?.startsWith('l37:'))return false;
 if(!systemReady())return true;
 tick();const s=state(),kind=action.slice(4);
 const say=t=>toast(t);
 if(['supply','donate','premium'].includes(kind)){
  if(!present('grocer')||s.phase!=='shortage')return say('请到百草铺找'+ownerName()+'确认当前需求。'),true;
  if((G.inventory.herb||0)<6)return say('需备齐青叶草6株。'),true;
  if(s.target-s.delivered<6)return say('急缺已不足六株，可按实际数量在铺中出售。'),true;
  if(kind==='premium'&&s.premium)return say('这次急购已经议过价。'),true;
  act(1,()=>{
   if(!present('grocer')||s.phase!=='shortage'||s.target-s.delivered<6||(G.inventory.herb||0)<6)return say('供需或人物处境已变化，未扣药材。');
   G.inventory.herb-=6;stoneChange(G,amount(kind==='donate'?0:kind==='premium'?30:12),'药路履约');
   if(kind==='premium'){
    s.premium=true;s.markupUntil=S.now()+180;s.markupOwnerId=window.XTShop38?.operator()||'grocer';s.benefitUntil=0;
    relationship(s,'grocer','急购时坚持高价供药，虽解了燃眉之急，却伤了交情。',-10,'medicine37_premium');
    relationship(s,'dan','听闻这次急购的高价，后续合作更为谨慎。',-5,'medicine37_premium');
   }
   supply(s,6,'player');credit(s);record(s,kind==='premium'?'以急价交付六株青叶草，得'+amount(30)+'灵石；两处药品半年内加价一成。':kind==='donate'?'赠出六株青叶草，优先供给欠药的人家。':'按约供药六株，结清'+amount(12)+'灵石。');
  });
 }else if(kind==='promise'){
  if(s.phase!=='shortage'||!present('grocer')||s.contract)return true;
  if(!living('ferry'))return say('白船主已不在，眼下无法安排这条运药线。'),true;
  s.contract={status:'active',accepted:S.now(),due:S.now()+45,cargo:0,playerId:W.world().playerId};
  relationship(s,'grocer','承诺四十五日内，从白水渡提药十二株送回百草铺。',0,'');record(s,'与'+ownerName()+'约定从白水渡运药，四十五日内交货结算。');save();render();
 }else if(kind==='pickup'){
  const c=s.contract;
  if(c?.status!=='active'||c.cargo||!present('ferry')||!operational())return true;
  const stock=S.shopState('ferry');if(stock.stock.herb<12)return say('白船主现货不足十二株，需等候补货或另选供药方式。'),true;
  act(1,()=>{
   if(c.status!=='active'||c.cargo||!present('ferry')||!operational()||S.shopState('ferry').stock.herb<12)return;
   S.shopState('ferry').stock.herb-=12;c.cargo=12;record(s,'从白船主处提取封装青叶草十二株，货属百草铺，须送回县城。');
  });
 }else if(kind==='deliver'){
  const c=s.contract;
  if(c?.status!=='active'||!c.cargo||!present('grocer'))return true;
  act(1,()=>{
   if(c.status!=='active'||!c.cargo||!present('grocer'))return;
   const count=c.cargo,used=supply(s,count,'player');
   shopData('grocer').stock.herb+=count-used;c.status='done';c.cargo=0;stoneChange(G,amount(24),'药路履约');
   credit(s);relationship(s,'grocer','亲自往返白水渡，按期将十二株青叶草送回。',12,'medicine37_kept');
   record(s,'按期送回运药货物，结清'+amount(24)+'灵石。');
  });
 }
 return true;
}
advanceDays=function(n,ctx,opt){state();const r=old.advanceDays(n,ctx,opt);tick();return r;};
worldTick=function(){old.worldTick();tick();};
restore=function(raw){const ok=old.restore(raw);if(ok){state();tick();}return ok;};
newGame=function(...args){
 const inherited=args.length>=4&&G?.local37?JSON.parse(JSON.stringify(G.local37)):null;
 const result=old.newGame(...args);
 if(inherited){G.local37=inherited;if(inherited.contract?.status==='active'){inherited.contract.status='cancelled';inherited.contract.cargo=0;record(inherited,'上一代的运药约定终止，地方药路与库存继续保留。');}}
 return result;
};
W.actorPanel=function(id){return old.actorPanel(id)+(['grocer','dan','ferry'].includes(id)||window.XTShop38?.shopId(id)==='grocer'?detail():'');};
renderScene=function(){
 if(G)tick();old.renderScene();if(!G||G.mode!=='idle'||S.view.tab!=='quests'||state()?.contract?.status!=='active')return;
 const content=detail(),target=document.querySelector('#scene .sb-scroll');
 if(content&&target){const wrap=document.createElement('div');wrap.innerHTML=content;target.append(wrap);wrap.querySelectorAll('[data-sb]').forEach(b=>b.onclick=()=>S.dispatch(b.dataset.sb,b.dataset.arg));}
};
window.XTLocal37={detail,state,tick,shopData,quote,onTrade,shopNote,dispatch};
if(G){tick();render();}
})();
