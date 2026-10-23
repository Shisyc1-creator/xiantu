/* 持续存在的出身住处；居住、私人物柜和经营产业分别授权。 */
(()=>{
'use strict';
const S=XTSandbox,W=XTWorld36,V=S.view;
const escape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(text,action,arg='',disabled=false)=>`<button class="sb-btn" data-sb="h41:${action}" data-arg="${escape(arg)}" ${disabled?'disabled':''}>${escape(text)}</button>`;
const specs={
 '寒门散修':{name:'乡中旧居',kind:'family',owner:'家中共同住用',description:'土墙围着小院，旧木桌靠在窗边。这里有你的一间卧房与私人物柜。',letter:'旧纸上记着几笔柴米与药钱。你把它收好，记住家中当年的生计。'},
 '宗门外门弟子':{name:'观中弟子住处',kind:'sect',owner:'青云观公产 · 弟子借住',description:'弟子院内钟声隐约。你可使用自己的床位与物柜，炉房和库藏仍由观中执事管理。',letter:'床边抄着弟子院规：取用公物须登记，离观时应交还床位。'},
 '没落家族子弟':{name:'城西家族旧宅',kind:'family',owner:'家族共有 · 居住份额',description:'廊柱斑驳，旧宅里仍留着一间可住的房。私人物柜归你保管，祖产不能由你独自处置。',letter:'家书的墨迹已淡，末尾只写着：先把日子过下去，莫拿整个家族的旧物轻易换钱。'},
 '世家嫡系':{name:'宗族大宅',kind:'family',owner:'宗族共有 · 个人居所',description:'院门之后各有门户。你有自己的卧房与私人物柜，宗族库房和产业并未交由你支用。',letter:'你翻过自己的起居簿。族中供养与职责各有规矩，个人前途也要自己选择。'},
 '妖血遗孤':{name:'山间藏身处',kind:'personal',owner:'个人庇护处',description:'山石与枝叶掩着入口。这里可以落脚、保存私人物件，没有丹房、药圃或可雇人经营的工位。',letter:'你整理好养育者留下的寻路记号，重新辨认入口，记下附近安全的落脚处。'},
 '魔道弃徒':{name:'坊市暂居处',kind:'temporary',owner:'坊市借住房 · 有期限',description:'巷底的小房只供暂住。你的物柜单独上锁，期满后仍可到门厅取回私人物件。',letter:'暂住凭据夹在衣包里。旧师门的身份换不来这里的房契，你得为日后另寻安置。'}
};
function state(){
 if(!G?.root||!G.world36?.startGranted)return null;
 const w=W.world();
 if(!G.homes41){
  const spec=specs[G.origin];if(!spec)return null;
  const id='birth_'+w.playerId;
  G.homes41={version:1,lastPlayerId:w.playerId,residenceId:id,places:[{id,origin:G.origin,name:spec.name,kind:spec.kind,owner:spec.owner,place:G.home||XTWorld36.starts[G.origin].place,residentIds:[w.playerId],chestOwners:[w.playerId],storage:{},createdAt:S.now(),expires:spec.kind==='temporary'?S.now()+360:null,renewalQuote:Math.max(1,Math.round(12*economyFactor())),letterRead:false,history:[]}]};
 }
 const d=G.homes41;
 if(d.lastPlayerId!==w.playerId&&d.inheritedFrom){
  const heir=w.people[w.playerId],qualified=heir?.parents?.includes(d.inheritedFrom);
  if(qualified)for(const h of d.places){
   if(h.chestOwners.includes(d.inheritedFrom)&&!h.chestOwners.includes(w.playerId))h.chestOwners.push(w.playerId);
   if(['family','personal'].includes(h.kind)&&h.residentIds.includes(d.inheritedFrom)&&!h.residentIds.includes(w.playerId))h.residentIds.push(w.playerId);
  }
  d.lastPlayerId=w.playerId;delete d.inheritedFrom;
 }
 return d;
}
function residence(){const d=state();return d?.places.find(h=>h.id===d.residenceId);}
function rights(h=residence()){
 if(!h)return {live:false,retrieve:false,deposit:false,reason:'尚未安置住处。'};
 const id=W.world().playerId,member=h.residentIds.includes(id),retrieve=h.chestOwners.includes(id);
 let live=member,reason='';
 if(!member)reason='此住处的居住权没有转交给你。';
 else if(h.kind==='sect'&&S.state().faction?.id!=='temple'){live=false;reason='当前不再拥有青云观弟子床位资格。';}
 else if(h.expires!==null&&S.now()>=h.expires){live=false;reason='暂住期限已到，可续住或取回私人物件。';}
 return {live,retrieve,deposit:live&&retrieve,operate:false,sell:false,reason};
}
function extraRooms(){const h=residence();if(!h||G.place!==h.place)return [];const r=rights(h);return [['residence36',h.name+' · 门厅'],...(r.live?[['h41_inner','个人居室'],['h41_storage','私人物柜']]:[])];}
function isRoom(room){return ['residence36','h41_inner','h41_storage'].includes(room);}
function record(h,text){h.history.unshift({at:S.now(),text});h.history=h.history.slice(0,20);h.lastResult=text;addLog(text,'mute');S.state().news.unshift({at:S.now(),text});S.state().news=S.state().news.slice(0,40);}
function overview(){
 const h=residence();if(!h)return '';const r=rights(h),here=G.place===h.place;
 return `<article class="sb-card" id="residence41"><h4>${escape(h.name)}</h4><p>${escape(placeName(h.place))} · ${escape(h.owner)}</p><p>居住：${r.live?'可住':escape(r.reason)} · 储物：${r.retrieve?'仅你名下的私人物柜':'无取用权'}${h.expires!==null?' · 余 '+Math.max(0,h.expires-S.now())+' 日':''}</p><p>此处不含个人经营权，不可出售家族或宗门公产。</p><div class="sb-buttons">${button(here?'进入门厅':'沿路线前往','visit',h.id)}${button('住处与权限说明','help')}</div></article>`;
}
function roomInfo(room){
 const h=residence();if(!h||G.place!==h.place)return {description:'此处没有你的住处。',actions:''};
 const r=rights(h),spec=specs[h.origin];let actions=button('走出住处','leave');
 if(room==='residence36'){
  if(r.live)actions+=button('进入个人居室','inner')+button('打开私人物柜','storage');
  else if(r.retrieve)actions+=button('取回寄存物','reclaim');
  if(h.kind==='temporary'&&r.retrieve)actions+=button('续住360日 · '+h.renewalQuote+'灵石','renew','',G.stones<h.renewalQuote);
 }
 if(room==='h41_inner'&&r.live)actions+=button(h.letterRead?'已整理家中旧物':'整理家中旧物 · 1日','letter','',h.letterRead)+button('回门厅','hall');
 if(room==='h41_storage'&&r.live||room==='residence36'&&!r.live&&r.retrieve&&h.reclaiming){
  if(r.deposit)for(const [id,count]of Object.entries(G.inventory||{}))if(count>0)actions+=button('存入 '+(BAG_ITEMS[id]?.name||id)+' ×1','deposit',id);
  for(const [id,count]of Object.entries(h.storage))if(count>0)actions+=button('取出 '+(BAG_ITEMS[id]?.name||id)+' ×1（存有'+count+'）','withdraw',id);
  if(!Object.values(h.storage).some(n=>n>0))actions+='<p>私人物柜中暂无物品。</p>';
  actions+=button('回门厅','hall');
 }
 const suffix=h.lastResult?' 最近一事：'+h.lastResult:'';
 return {description:spec.description+(r.live?'':(' '+r.reason))+suffix,actions};
}
function dispatch(action,arg){
 if(!action.startsWith('h41:'))return false;
 if(!systemReady())return true;
 const type=action.slice(4),h=residence();if(type==='help'){S.go('guide','origin');return true;}if(!h)return true;
 if(type==='visit'){
  if(arg!==h.id)return true;
  if(G.place!==h.place){state().destination=h.id;openTravel(h.place);return true;}
  S.state().roomAt=G.place;S.state().room='residence36';V.actor=null;V.detail=null;S.go('scene');return true;
 }
 if(G.place!==h.place||!isRoom(S.state().room))return true;
 const r=rights(h);
 if(type==='leave'){if(window.XTMap45){const map=XTMap45.edges(XTSandbox.roomDefs()),target=(map.residence36||[]).find(id=>!['h41_inner','h41_storage'].includes(id));if(target)XTMap45.dispatch('m45:walk',target);}else S.state().room='square';V.actor=null;render();return true;}
 if(type==='hall'){S.state().room='residence36';h.reclaiming=false;render();return true;}
 if(['inner','storage'].includes(type)){
  if(!r.live){toast(r.reason);return true;}
  S.state().room=type==='inner'?'h41_inner':'h41_storage';V.actor=null;render();return true;
 }
 if(type==='reclaim'){if(r.retrieve){h.reclaiming=true;render();}return true;}
 if(type==='deposit'||type==='withdraw'){
  const atChest=S.state().room==='h41_storage'||S.state().room==='residence36'&&h.reclaiming;
  if(!atChest||type==='deposit'&&!r.deposit||type==='withdraw'&&!r.retrieve)return true;
  const from=type==='deposit'?G.inventory:h.storage,to=type==='deposit'?h.storage:G.inventory;
  if(!BAG_ITEMS[arg]||!Number.isSafeInteger(from[arg])||from[arg]<=0)return true;
  from[arg]--;to[arg]=(to[arg]||0)+1;record(h,(type==='deposit'?'存入':'取出')+(BAG_ITEMS[arg]?.name||arg)+'一份。');save();render();return true;
 }
 if(type==='renew'){
  if(h.kind!=='temporary'||!r.retrieve||G.stones<h.renewalQuote)return true;
  const quote=h.renewalQuote;
  const result=advanceDays(1,{act:'residence',rate:0,incomeMul:0},{stopOnEvent:true});
  if(result.died){die('寿元耗尽');return true;}if(result.event){startEvent(result.event);return true;}if(result.days<1||G.stones<quote)return true;
  stoneChange(G,-quote,'暂居处续住');h.expires=Math.max(S.now(),h.expires||0)+360;if(!h.residentIds.includes(W.world().playerId))h.residentIds.push(W.world().playerId);
  record(h,'续住凭据已签，付'+quote+'灵石，暂居期限延长360日。');save();render();return true;
 }
 if(type==='letter'){
  if(!r.live||S.state().room!=='h41_inner'||h.letterRead)return true;
  const result=advanceDays(1,{act:'residence',rate:0,incomeMul:0},{stopOnEvent:true});
  if(result.died){die('寿元耗尽');return true;}if(result.event){startEvent(result.event);return true;}if(result.days<1||!rights(h).live)return true;
  h.letterRead=true;record(h,specs[h.origin].letter);save();render();return true;
 }
 return true;
}
const oldNew=newGame,oldScene=renderScene,oldArrive=arriveAt;
newGame=function(...args){const carried=args.length>=4&&G?.mode==='dead'&&state()?JSON.parse(JSON.stringify(G.homes41)):null,from=carried&&W.world().playerId;const out=oldNew(...args);if(carried){carried.inheritedFrom=from;G.homes41=carried;}return out;};
W.extraRooms=extraRooms;
arriveAt=function(from,to,days){const out=oldArrive(from,to,days),d=state(),h=residence();if(d?.destination===h?.id&&G.mode==='idle'&&G.place===h.place){delete d.destination;S.state().roomAt=G.place;S.state().room='residence36';V.tab='scene';V.actor=null;save();render();}return out;};
renderScene=function(){if(G?.mode==='idle'){const h=residence();if(h&&G.place===h.place&&isRoom(S.state().room)&&!rights(h).live)S.state().room='residence36';}oldScene();};
window.XTHome41={specs,state,residence,rights,extraRooms,isRoom,roomInfo,overview,dispatch};
if(G){state();render();}
})();
