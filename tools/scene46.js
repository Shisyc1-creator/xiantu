/* 到地点再进入设施；已接任务只读追踪，接取与交付留在场景。 */
(()=>{'use strict';
const S=XTSandbox,W=XTWorld36,V=S.view;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const B=(text,a,arg='')=>`<button class="sb-btn" data-sb="${a}" data-arg="${esc(arg)}">${esc(text)}</button>`;
const facilities={auction43:['county','青石拍场','进入拍场查看告示，登记后才开始竞价。'],counter44:['prefecture','拍行柜台','进入柜台办理鉴定、寄拍、取物与结款。'],auction44:['prefecture','云安会场','进入会场查看本届会期与拍品，正式登记另收入场费。'],lounge44:['prefecture','会后茶厅','进入茶厅与在场的实际竞买人交谈。']};
let note='';
function isInside(room){if((room==='auction43'&&G.auction43?.session?.status==='active')||(room==='auction44'&&G.auction44?.session?.status==='active'))V.facility46={room,place:G.place};return !!(V.facility46?.room===room&&V.facility46.place===G.place);}
function roomName(room,place){const names={shops:'商街 / 摊市',wild:'采集地',hall:'宗门前院',residence36:'住处门厅',h41_inner:'个人居室',inn45:'来安客栈',river45:'城东河埠',granary45:'仓廪外院',counter44:'拍行柜台',square:'入口'};return (G.place===place?S.roomDefs().find(r=>r[0]===room)?.[1]:null)||names[room]||'入口';}
function location(place,room){return placeName(place)+' → '+roomName(room,place);}
function actionGuide(d){
 const home=G.homes41?.places?.find(h=>h.id===G.homes41.residenceId),count=G.inventory?.herb||0;
 if(d.action==='h41:letter')return {room:'h41_inner',next:'打开家园 → '+(home?.name||'出身住处')+' → 进入门厅 → 进入个人居室 → 点击「整理家中旧物 · 1日」',need:'无需另找“起居簿”道具；它就是这次整理旧物的经历。'+(home?.letterRead?'此处旧物已经整理过，不能重复操作。':'' )};
 if(d.action==='work')return {room:'shops',next:'在当地地图走到商街 / 摊市，点击「做短工」',need:'不需要交付物品；实际耗时和报酬以行动按钮为准。'};
 if(d.action==='gather')return {room:'wild',next:'在当地地图走到采集地，点击「采集灵材」并完成一次采集',need:'耗7日，不另收采集费；实际完成采集才算履行，持有或买入药材不能代替。'};
 if(d.action==='sectTask')return {room:'hall',next:'到宗门前院，选中监院 → 山门事务 → 点击「交付草药」'+(!d.arg?'（也可交付矿砂）':''),need:'青叶草 '+count+'/4 株'+(!d.arg?'，或赤铁砂 '+(G.inventory?.ironOre||0)+'/3 份':'')+'；须有本门弟子资格，受每月差事次数限制。'};
 return {room:'square',next:d.label,need:'到目标地点查看当地可办事务。'};
}
function accepted(){const rows=[],d=G.opening46?.duty,q=G.places45?.chains?.[G.world36?.playerId],local=G.local37?.contract,t=G.tasks46?.herb;
 if(d?.status==='accepted'&&d.ownerId===G.world36?.playerId){const g=actionGuide(d);rows.push({title:'起步约定',text:d.label,status:'进行中',next:g.next,where:location(d.place,g.room),need:g.need,finish:'实际行动成功后自动记为履行；不另发一份奖励，无须额外交付。'});}
 const f=window.XTChildhood49?.followup();if(f&&['pending','performed'].includes(f.status)){const n=W.get(f.contactId),g=actionGuide(f),report='找到'+(n?.name||'引荐人')+'，点击「当面交代已经做过的事」';rows.push({title:'童年引荐后的约定',text:f.label,status:f.status==='performed'?'待交代':'进行中',next:f.status==='performed'?report:g.next,where:f.status==='performed'?(n?location(n.place,n.room):'引荐人位置待查'):location(f.place,g.room),need:f.status==='performed'?'行动已完成，无需再做一次。'+(n&&!W.alive(n)?'引荐人已故，当前无法当面交代。':''):g.need,finish:'完成行动后，去'+(n?location(n.place,n.room):'引荐人处')+'，'+report+'。原行动奖励不重复发放。'});}
 if(q&&!['done','failed','cancelled'].includes(q.stage)){const at=XTCounty45.stages.findIndex(s=>s[0]===q.stage);rows.push({title:'药货回执',text:'下一步：'+(XTCounty45.stages[at+1]?.[1]||'交还结款')+'；余'+Math.max(0,q.due-S.now())+'日',status:q.paused?'上步中断':'进行中'});}
 if(local?.status==='active')rows.push({title:'运药约定',text:(local.cargo?'携货回百草铺交付':'先到白水渡找白船主提货')+'；余'+Math.max(0,local.due-S.now())+'日',status:'进行中'});
 if(t?.status==='accepted'&&t.ownerId===G.world36?.playerId)rows.push({title:'百草铺采药',text:'交青叶草3株，酬钱10灵石',status:(G.inventory.herb||0)>=3?'待交付':'待备药',where:location('county','shops'),next:'走到商街，选中'+(W.get(XTShop38.operator())?.name||'在任药铺掌柜')+'，点击「当面交付 · 1日」',need:'青叶草 '+(G.inventory.herb||0)+'/3 株；不足可在采集地采集或向有货的商户购买。',finish:'当面交付后扣除3株药材，领取10灵石；药铺钱款不足时暂不能结算。'});
 for(const c of G.auction44?.contracts||[])if(c.ownerId===G.world36?.playerId&&c.status==='sold'&&!c.paid)rows.push({title:'寄拍净款',text:'凭据'+c.id+'：到云安拍行柜台领取'+c.net+'灵石',status:'待领取'});
 const chain={accepted:['river_boat45','询问旧船货去向 · 1日'],river:['granary_clerk45','核底册取回执 · 1日'],receipt:[window.XTShop38?.operator(),'出示回执核验 · 1日'],verified:['inn_host45','交还回执 · 1日 / 酬钱6灵石']};
 const row=rows.find(r=>r.title==='药货回执'),step=chain[q?.stage];if(row&&step){const n=W.get(step[0]);Object.assign(row,{where:n?location(n.place,n.room):'县中当事人位置待查',next:'选中'+(n?.name||'在任掌柜')+'，点击「'+step[1]+'」',need:'本人回执随任务记录保存，无须在背包找道具；余'+Math.max(0,q.due-S.now())+'日。',finish:'河埠问讯 → 仓廪取回执 → 药铺核验 → 客栈交还，最后结款6灵石。'});}
 const transport=rows.find(r=>r.title==='运药约定');if(transport){const n=W.get(local.cargo?XTShop38.operator():'ferry');Object.assign(transport,{where:n?location(n.place,n.room):'当事人位置待查',next:'选中'+(n?.name||'当事人')+'，点击「'+(local.cargo?'交付运药':'提取运药货物')+'」',need:local.cargo?'已提封装药材12株，不必另买药。':'到渡口提取委托货物12株；不要用自己的药材代替。'});}
 const funds=rows.filter(r=>r.title==='寄拍净款');for(const row of funds)Object.assign(row,{where:location('prefecture','counter44'),next:'走到拍行柜台 → 进入柜台 → 找到对应寄拍凭据领取净款'});
 return rows;
}
function board(){const rows=window.XTScene46?XTScene46.accepted():accepted();return `<details class="taskboard46" ${V.taskOpen46?'open':''}><summary>已接事项 · ${rows.length}${rows[0]?'<small class="task-preview46">下一步：'+esc(rows[0].next||rows[0].text)+'</small>':''}</summary><div>${rows.map(r=>`<article class="task-card46"><b>${esc(r.title)}</b><span class="state44 pending">${esc(r.status)}</span><small>${esc(r.text)}</small>${[['前往',r.where],['下一步',r.next],['准备',r.need],['完成',r.finish]].filter(x=>x[1]).map(([label,text])=>'<p><strong>'+label+'：</strong>'+esc(text)+'</p>').join('')}</article>`).join('')||'<p>暂无已接事项。委托在人物或当地告示处接取。</p>'}</div></details>`;}
function questAction(a){
 if(!systemReady()||G.place!=='county'||V.tab!=='scene')return;
 if(a==='accept'){
  if(S.state().room!=='notice45'||G.tasks46?.herb){note='须在县衙照壁读告示；此份约定已接或已经办过。';return;}
  G.tasks46=G.tasks46||{};G.tasks46.herb={status:'accepted',ownerId:G.world36.playerId,source:XTShop38.operator(),at:S.now()};addLog('已读县衙照壁告示，接下百草铺三株采药委托；须到商街当面交付。','mute');save();return;
 }
 const q=G.tasks46?.herb,id=XTShop38.operator();if(!q||q.status!=='accepted'||!id||!W.present(id)||V.actor!==id){note='请带着已接凭据，到商街找在任掌柜当面交付。';return;}
 if((G.inventory.herb||0)<3){note='青叶草不足三株，尚未交付。';return;}
 const shop=S.shopState('grocer');if(shop.wallet<10){note='药铺钱匣暂不足十枚，请稍后当面结算。';return;}
 const r=advanceDays(1,{act:'交付采药委托',rate:0,incomeMul:0},{stopOnEvent:true});if(r.died){die('寿元耗尽');return;}if(r.event){startEvent(r.event);return;}if(r.days<1||!W.present(id)){note='交付被中断，本次未交货、未领钱。';return;}
 const before=JSON.stringify(G);try{const st=S.shopState('grocer');if(st.wallet<10)throw Error('钱匣变化');G.inventory.herb-=3;st.stock.herb=(st.stock.herb||0)+3;st.wallet-=10;stoneChange(G,10,'百草铺采药委托');G.tasks46.herb.status='done';G.tasks46.herb.completedAt=S.now();addLog('三株采药委托已完成，药铺实收货物，付酬十枚灵石。','up');const raw=JSON.stringify(G);localStorage.setItem(SAVE_KEY,raw);if(localStorage.getItem(SAVE_KEY)!==raw)throw Error('校验失败');}catch(e){G=JSON.parse(before);try{localStorage.setItem(SAVE_KEY,before);}catch(_){}note='交付保存失败，本次货物、报酬与完成记录已撤回。';}
}
function dispatch(a,arg){
 if(a==='room'&&V.facility46?.room!==arg)V.facility46=null;
 if(a==='subScene'&&arg==='quests'){V.taskOpen46=!V.taskOpen46;render();return true;}
 if(!a.startsWith('u46:')&&!a.startsWith('q46:'))return false;
 if(!systemReady())return true;note='';
 if(a==='u46:enter'){const f=facilities[S.state().room];if(f&&G.place===f[0]&&V.tab==='scene'){V.facility46={room:S.state().room,place:G.place};render();}return true;}
 if(a==='u46:exit'){
  if(G.auction43?.session?.status==='active'){S.dispatch('a43:leave');return true;}
  if(G.auction44?.session?.status==='active'){S.dispatch('a44:leave');return true;}
  V.facility46=null;render();return true;
 }
 if(a.startsWith('q46:')){questAction(a.slice(4));render();return true;}return true;
}
function bind(el){el.querySelectorAll('[data-sb]').forEach(b=>b.onclick=()=>S.dispatch(b.dataset.sb,b.dataset.arg));}
function decorate(){if(!G?.root||G.mode!=='idle')return;const scene=document.getElementById('scene');
 if(V.tab==='quests'){scene.querySelector('.scene-progress44')?.remove();const scroll=scene.querySelector('.sb-scroll');if(scroll)scroll.innerHTML=board();return;}
 if(V.tab==='scene'){
  const tools=scene.querySelector('.sb-location-tools');if(tools){tools.querySelector('[data-arg="quests"]')?.remove();const wrap=document.createElement('div');wrap.innerHTML=board();tools.append(wrap);wrap.querySelector('details').ontoggle=e=>{V.taskOpen46=e.target.open;};}
  const room=S.state().room,f=facilities[room],place=scene.querySelector('.sb-place');if(f&&place){place.querySelector(':scope>p').textContent='你已到'+f[1]+'门前。'+f[2];const actions=place.querySelector(':scope>.sb-buttons');actions.innerHTML=B('进入'+f[1],'u46:enter');bind(actions);}
  if(place&&G.place==='county'&&room==='notice45'){const box=document.createElement('section');box.className='notice46';box.innerHTML='<h4>百草铺采药告示</h4><p>需要青叶草三株，酬十枚灵石。先读告示接下，再到商街找在任掌柜交付；此份约定每人一次。</p>'+(G.tasks46?.herb?'<small>你已接过这份告示，可在已接事项核对当前状态。</small>':B('接下这份告示','q46:accept'))+(note?'<p>'+esc(note)+'</p>':'');place.append(box);bind(box);}
  const header=scene.querySelector('.auction43 .sb-head');if(header&&!header.querySelector('[data-sb="u46:exit"]')){const b=document.createElement('div');b.innerHTML=B('返回地点','u46:exit');header.append(b);bind(b);}
 }
}
const old={renderScene,renderView:W.renderView,actorPanel:W.actorPanel,restore,newGame};
W.actorPanel=function(id){let html=old.actorPanel(id);if(G.tasks46?.herb?.status==='accepted'&&id===XTShop38.operator()&&W.present(id))html+='<section class="notice46"><h4>已接：三株采药委托</h4><p>交付青叶草3株，收取约定报酬10灵石。</p>'+B('当面交付 · 1日','q46:deliver')+(note?'<p>'+esc(note)+'</p>':'')+'</section>';return html;};
W.renderView=function(){if(V.tab==='quests'&&G.mode==='idle'){document.getElementById('scene').innerHTML='<section class="sb-shell"><header class="sb-head"><h2>已接事项</h2></header><div class="sb-scroll">'+board()+'</div></section>';document.querySelector('.taskboard46').open=true;return true;}return old.renderView();};
renderScene=function(){old.renderScene();decorate();};
function resumeFacility(){const room=S.state().room;if((room==='auction43'&&G.auction43?.session?.status==='active')||(room==='auction44'&&G.auction44?.session?.status==='active'))V.facility46={place:G.place,room};}
restore=function(raw){V.facility46=null;const ok=old.restore(raw);if(ok)resumeFacility();return ok;};
newGame=function(...args){V.facility46=null;V.taskOpen46=false;return old.newGame(...args);};
window.XTScene46={isInside,dispatch,accepted,facilities};if(G){resumeFacility();render();}
})();
