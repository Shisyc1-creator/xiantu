/* 《仙途》地方沙盒：场景、人物、设施、产业与委派。普通脚本，共用主程序世界钟。 */
(()=>{
'use strict';
const V={tab:'cult',sub:'',actor:null,detail:null,page:0};
const old={renderScene,renderActions,renderHUD,advanceDays,worldTick,restore,newGame,addArt,yearOutput,currentPlaceQi,openSelf};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const now=()=>absMonth()*CFG.daysPerMonth+(G.day||0);
const money=n=>Math.round(n*economyFactor());
const btn=(text,action,arg='',disabled=false,cls='')=>`<button class="sb-btn ${cls}" data-sb="${action}" data-arg="${esc(arg)}" ${disabled?'disabled':''}>${text}</button>`;
const card=(title,text,actions='')=>`<article class="sb-card"><h4>${title}</h4><p>${text}</p><div class="sb-buttons">${actions}</div></article>`;
const note=t=>`<p class="sb-note">${t}</p>`;
const name=id=>(BAG_ITEMS[id]||{}).name||id;
const recipes={
 qiPill:{name:'聚气散',type:'alchemy',days:10,fee:3,materials:{herb:2},skill:0},
 healingPowder:{name:'养脉散',type:'alchemy',days:7,fee:2,materials:{herb:2},skill:1},
 ironSword:{name:'青钢短剑',type:'forge',days:15,fee:8,materials:{ironOre:3},skill:0},
 clothArmor:{name:'青纹护衣',type:'forge',days:18,fee:10,materials:{ironOre:2,herb:1},skill:1}
};
Object.assign(BAG_ITEMS,{
 mobileFurnace:{name:'便携丹炉',price:65,desc:'安全落脚处可开炉；野外、山道和秘境不能使用。'},
 forgeKit:{name:'炼器工具箱',price:75,desc:'带小砧、锻锤与火匣；需安全作业场地。'},
 alchemyPrimer:{name:'基础丹方册',price:24,desc:'载聚气散、养脉散丹方。请在行囊阅读。'},
 forgePrimer:{name:'基础器谱',price:28,desc:'载短剑、护衣工艺。请在行囊阅读。'}
});
MANUALS['引气篇'].effect.absorb=.08;
const actors={
 grocer:{name:'周掌柜',role:'百草铺掌柜',place:'county',room:'shops',stock:{herb:60,qiPill:12,healingPowder:12,qiManual:3,alchemyPrimer:3}},
 smith:{name:'石师傅',role:'铁器铺匠人',place:'county',room:'workshop',stock:{ironOre:40,ironSword:4,clothArmor:4,forgeKit:3,forgePrimer:3}},
 dan:{name:'柳丹师',role:'炉坊主人',place:'county',room:'workshop',stock:{mobileFurnace:3,alchemyPrimer:3,healingPowder:8}},
 broker:{name:'何经纪',role:'牙行经纪',place:'county',room:'agency'},
 prefect:{name:'许掌柜',role:'万宝楼分号',place:'prefecture',room:'shops',stock:{herb:90,ironOre:60,qiPill:20,bloodQiPill:10,spiritBlade:5,clothArmor:5,mobileFurnace:4,forgeKit:4,qiManual:3,alchemyPrimer:5,forgePrimer:5}},
 ferry:{name:'白船主',role:'渡口行商',place:'riverTown',room:'shops',stock:{herb:35,ironOre:20,qiPill:6,healingPowder:6}},
 stall:{name:'顾散人',role:'杂货摊主',place:'market',room:'shops',stock:{herb:45,ironOre:25,qiPill:8,qiManual:2,alchemyPrimer:3}},
 sunset:{name:'陆执柜',role:'落霞商会',place:'spiritMarket',room:'shops',stock:{herb:100,ironOre:80,qiPill:25,bloodQiPill:20,spiritBlade:8,mobileFurnace:5,forgeKit:5,forgePrimer:5,alchemyPrimer:5}},
 mentor:{name:'观中执事',role:'道观传功执事',place:'temple',room:'hall',faction:'temple'},
 taiyue:{name:'太岳执事',role:'外山执事',place:'taiyueSect',room:'hall',faction:'taiyue'},
 elder:{name:'村中长者',role:'乡里长者',place:'village',room:'square'}
};
const factions={temple:{name:'青云观',need:0},taiyue:{name:'太岳宗',need:0}};
const recruits={
 an:{name:'阿安',title:'凡人杂役',realm:-1,wage:2,fee:8,life:70},
 qiao:{name:'巧娘',title:'凡人管事',realm:-1,wage:3,fee:12,life:75},
 lin:{name:'林修',title:'炼气散修',realm:0,wage:7,fee:30,life:100},
 han:{name:'韩铸',title:'炼气器徒',realm:0,wage:9,fee:40,life:100}
};
function data(){
 if(!G)return null;
 ensureGameSystems();
 if(!G.sandbox35){
   const owned={};for(const n of Object.keys(G.arts||{}))owned[n]={level:1};
   if(G.learned.qiManual)owned['引气篇']={level:1};
   G.sandbox35={version:1,room:'square',roomAt:G.place,books:owned,mind:Object.keys(owned).find(n=>MANUALS[n]?.kind==='心法')||null,
     spells:Object.keys(owned).filter(n=>MANUALS[n]?.kind==='术法').slice(0,2),recipes:[],skills:{alchemy:0,forge:0},property:null,
     staff:[],warehouse:{},shops:{},relations:{},news:[],faction:null};
   if(G.sect && !['无门无派','散修互助会'].includes(G.sect.name))G.sandbox35.faction={id:G.sect.name.includes('太岳')?'taiyue':'temple',name:G.sect.name,rank:G.sect.rank,contribution:G.sect.contribution||0,cd:{}};
 }
 const d=G.sandbox35;
 d.roster=d.roster||{};
 if(d.roomAt!==G.place){d.room='square';d.roomAt=G.place;V.actor=null;V.detail=null;}
 return d;
}
function log(text){const d=data();d.news.unshift({at:now(),text});d.news=d.news.slice(0,40);addLog(text,'mute');}
function ownedHome(){const p=data().property;return !!p && (!p.expires||p.expires>=now());}
function atHome(){return ownedHome()&&data().property.place===G.place;}
function homeSize(){return {rental:2,courtyard:4,cave:6}[data().property?.type]||0;}
function workshop(type){
 const d=data(),safe=!['野地','秘境'].includes(PLACES[G.place]?.tier);
 if(!safe)return null;
 if(atHome()&&['home','alchemy','forge'].includes(d.room)&&d.property.rooms[type])return {label:'自家'+(type==='alchemy'?'丹房':'器室'),kind:'home'};
 const access=d.workshop;
 if(access&&access.place===G.place&&access.until>=now()&&d.room==='workshop')return {label:'租用炉坊',kind:'public',until:access.until};
 if(d.room!=='square'&&(G.inventory[type==='alchemy'?'mobileFurnace':'forgeKit']||0)>0)return {label:'随身'+(type==='alchemy'?'丹炉':'炼器工具'),kind:'tool'};
 return null;
}
function physicalActor(id){const a=actors[id],d=data();if(window.XTWorld36)return window.XTWorld36.present(id);return !!a&&a.place===G.place&&a.room===d.room;}
function shopState(id){
 const custom=window.XTLocal37?.shopData(window.XTShop38?.shopId(id)??id);if(custom)return custom;
 const d=data(),a=actors[id];
 if(!a?.stock)return null;
 let st=d.shops[id];const month=absMonth();
 if(!st||st.month!==month){st={month,stock:{...a.stock},wallet:money(240)};d.shops[id]=st;}
 return st;
}
function price(id,item){
 const a=actors[id],local=a.place==='market'||a.place==='spiritMarket'?1.18:1;
 const discount=G.localQuest?.ending==='aid'&&a.place==='prefecture'?.9:1;
 const rapport=(data().relations[id]||0)>=3?.95:1;
 return Math.max(1,Math.round(BAG_ITEMS[item].price*economyFactor()*local*discount*rapport*(window.XTShop38?.quote(id,item)??window.XTLocal37?.quote(id,item)??1)));
}
function canAct(){return systemReady();}
function act(days,kind,complete){
 if(!canAct())return false;
 closeMainOverlay();
 const r=advanceDays(days,{act:kind,rate:0,incomeMul:0},{stopOnEvent:true});
 if(r.died){die('寿元耗尽');return false;}
 if(r.event){startEvent(r.event);return false;}
 if(r.days<days){save();render();return false;}
 complete();save();render();return true;
}
function roomDefs(){
 const p=PLACES[G.place],d=data(),r=[['square','入口']];
 if(placeHas(p,'trade'))r.push(['shops',p.tier==='市'||p.tier==='大型坊市'?'摊市':'商街']);
 if(['county','prefecture','spiritMarket'].includes(G.place))r.push(['workshop','炉坊']);
 if(G.place==='prefecture')r.push(['counter44','拍行柜台'],['auction44','云安会场'],['lounge44','会后茶厅']);
 if(G.place==='county')r.push(['agency','牙行'],['auction43','青石拍场']);
 if(placeHas(p,'sect'))r.push(['hall','宗门前院']);
 if(placeHas(p,'gather'))r.push(['wild','采集地']);
 if(placeHas(p,'hunt'))r.push(['hunt','山野深处']);
 if(!['野地','秘境'].includes(p.tier)&&((G.inventory.mobileFurnace||0)>0||(G.inventory.forgeKit||0)>0))r.push(['camp','临时工位']);
 if(atHome())r.push(['home','自家院落'],...Object.keys(d.property.rooms).filter(k=>d.property.rooms[k]&&['alchemy','forge'].includes(k)).map(k=>[k,k==='alchemy'?'自家丹房':'自家器室']));
 if(window.XTWorld36)r.push(...window.XTWorld36.extraRooms());
 return window.XTMap45?XTMap45.rooms(r):r;
}
function page(title,body,tabs=[]){
 const scene=document.getElementById('scene');document.body.classList.add('sb-screen');
 scene.innerHTML=`<section class="sb-shell"><header class="sb-head"><div><small>${esc(window.XTWorld36?window.XTWorld36.locationLabel():placeName(G.place))} · ${eraLabel()} ${monthName(G.month||0)}${cnDay((G.day||0)+1)}</small><h2>${title}</h2></div><span class="sb-balance">${Math.floor(G.stones)} 灵石</span></header>${tabs.length?`<nav class="sb-tabs">${tabs.map(([id,label])=>btn(label,'sub',id,false,V.sub===id?'on':'')).join('')}</nav>`:''}<div class="sb-scroll">${body}</div></section>`;
 scene.querySelectorAll('[data-sb]').forEach(b=>b.onclick=()=>dispatch(b.dataset.sb,b.dataset.arg));
}
function renderRooms(){
 const d=data(),rooms=roomDefs();if(!rooms.some(r=>r[0]===d.room))d.room='square';
 const current=rooms.find(r=>r[0]===d.room),people=Object.entries(actors).filter(([id,a])=>physicalActor(id));
 const legacy=window.XTWorld36?[]:NPCS.filter(n=>n.place===G.place).slice(0,8);
 let actions='',desc='道路在此交汇。先选去处，再找人或设施办事。';
 if(d.room==='square')actions=btn('附近路线','routes')+btn('打听见闻 · 30日','ask');
 if(d.room==='shops'){desc='货物由商铺和摊主经营。选中一位商人，查看他收什么、卖什么。';actions=btn('做短工 · 30日','work');}
 if(d.room==='workshop'){desc='炉坊备有地火、炉具与砧台。租用场地或携带工具后才能制作。';actions=btn('租用炉位 · 30日 / '+money(6)+'灵石','rentWorkshop')+btn('炼丹','craft','alchemy')+btn('炼器','craft','forge');}
 if(d.room==='wild'){desc='草木与矿砂散在山间。采集耗时，有机会遇见世事。';actions=btn('采集灵材 · 7日','gather');}
 if(d.room==='hunt'){desc='更深处有妖兽踪迹。准备兵器与护具，再决定是否深入。';actions=btn('搜寻妖兽 · 30日','hunt');}
 if(d.room==='camp'){desc='你在安全落脚处安放随身工具。丹炉与器具只提供制作条件，工艺和耗材还需自己备齐。';actions=btn('使用丹炉','craft','alchemy',!(G.inventory.mobileFurnace>0))+btn('使用炼器工具','craft','forge',!(G.inventory.forgeKit>0));}
 if(d.room==='agency'){desc='这里有人出售宅院、介绍雇工。凡人照料日常，修士按住处与报酬商谈雇佣，境界高低不作硬性限制。';}
 if(d.room==='residence36'){desc='这是与你身世相连的家处。家人在这里生活，往来也要找具体的人；这里并非可以随意出售的个人产业。';}
 if(d.room==='hall'){desc='门规、传承和宗门差事都归执事管理。拜入哪座山门，就向哪座山门尽责。';}
 if(['home','alchemy','forge'].includes(d.room)){desc='自家产业须亲自到场使用。储物、设施与雇工都在这里。';actions=btn('管理产业','home')+btn('炼丹','craft','alchemy')+btn('炼器','craft','forge');}
 if(window.XTHome41?.isRoom(d.room)){const own=XTHome41.roomInfo(d.room);desc=own.description;actions=own.actions;}
 let peopleHtml=people.map(([id,a])=>`<button class="sb-person ${V.actor===id?'on':''}" data-sb="actor" data-arg="${id}"><b>${a.name}</b><span>${a.role}</span><i>›</i></button>`).join('');
 if(d.room==='square')peopleHtml+=legacy.map(n=>`<button class="sb-person" data-sb="legacyActor" data-arg="${esc(n.id)}"><b>${esc(personName(n))}</b><span>${esc(n.realm||'当地人')}</span><i>›</i></button>`).join('');
 let detail='';
 if(V.actor&&physicalActor(V.actor))detail=actorPanel(V.actor);
 else if(V.detail?.kind==='legacy'){
   const n=NPCS.find(n=>n.id===V.detail.id&&n.place===G.place);
   if(n)detail=card(esc(personName(n)),esc(fillFate(n.knows||n.want||'他正忙着手上的事。')),btn('交谈 · 1日','talkLegacy',n.id)+btn('拜访 · 30日','visitLegacy',n.id));
 }
 const nearby=liveAt(G.place).slice(0,2);
 const live=nearby.length?`<div class="sb-live">${nearby.map(x=>btn('赴「'+esc(liveName(x.id))+'」 · '+liveLeft(x)+'月内','chase',x.id)).join('')}</div>`:'';
 page('行走 · '+esc(placeName(G.place)),`<div class="sb-location-tools">${btn('山河地图','map')}${btn('本地委托','subScene','quests')}</div><div class="sb-room-layout ${detail?'actor-selected':''}"><nav class="sb-rooms">${window.XTInteraction42?.roomNav(rooms)||rooms.map(([id,label])=>btn(label,'room',id,false,d.room===id?'on':'')).join('')}</nav><section class="sb-place"><h3>${current?.[1]}</h3><p>${desc}</p><div class="sb-buttons">${actions}</div>${live}<h4 class="sb-section">眼前的人</h4>${peopleHtml||note('此处暂无人物。可使用上方设施，或去其他房间。')}</section><aside class="sb-detail"><div class="sb-detail-back">${btn('‹ 返回房间','clearActor')}</div>${detail||card('人与地方','点一个人物，交谈、交易或请托。人物只出现在他所在的房间。')}</aside></div>`);
}
function actorPanel(id){
 if(window.XTWorld36)return window.XTWorld36.actorPanel(id);
 const a=actors[id],r=data().relations[id]||0;
 let actions=btn('交谈 · 1日','talk',id);
 if(a.stock)actions+=btn('交易','shop',id);
 if(id==='broker')actions+=btn('看宅院','propertyOffers')+btn('招募人手','recruitOffers');
 if(a.faction)actions+=btn('山门事务','faction',a.faction);
 if(id==='dan')actions+=btn('请教丹方 · '+money(18)+'灵石','learnRecipes','alchemy');
 if(id==='smith')actions+=btn('请教器谱 · '+money(20)+'灵石','learnRecipes','forge');
 return card(a.name,`${a.role}<br>交情：${r>0?'相识 '+r:'初见'}`,actions);
}
function shop(id){
 if(!physicalActor(id)||!actors[id].stock){notify('先到商人的铺面，再当面交易。');return;}
 V.detail={kind:'shop',id};V.actor=id;V.tab='shop';V.sub=V.sub==='sell'?'sell':'buy';render();
}
function renderShop(){
 const id=V.detail?.id,a=actors[id];
 if(!id||!physicalActor(id)){V.tab='scene';renderRooms();return;}
 const st=shopState(id),selling=V.sub==='sell';
 const items=Object.keys(st.stock).filter(k=>!selling||(G.inventory[k]||0)>0);
 const rows=items.map(item=>{
   const unit=selling?Math.max(1,Math.floor(price(id,item)*.55)):price(id,item),count=selling?(G.inventory[item]||0):st.stock[item];
   return `<div class="sb-item"><div><b>${name(item)}</b><small>${selling?'持有':'现货'} ${count} · ${unit} 灵石 / 份</small></div>${btn(selling?'卖一份':'买一份',selling?'sell':'buy',item,count<1||(!selling&&G.stones<unit))}</div>`;
 }).join('');
 page(a.name+' · '+a.role,`${note((window.XTShop38?.shopNote(id)||window.XTLocal37?.shopNote(id)||'商人每月补货。')+' 收购钱匣余 '+st.wallet+' 灵石。仅收购本店经营的货物。')}${rows||note('没有可出售给这位商人的物品。')}${btn('离开铺面','backScene')}`,[['buy','购入'],['sell','出售']]);
}
function trade(item,selling){
 if(!canAct())return;
 const id=V.detail?.id,a=actors[id];if(!a?.stock||!physicalActor(id)||!Object.hasOwn(a.stock,item))return notify('这位商人不经营此物。');
 const st=shopState(id),unit=selling?Math.max(1,Math.floor(price(id,item)*.55)):price(id,item);
 if(selling){if((G.inventory[item]||0)<1)return;if(st.wallet<unit)return notify('商人钱匣不足，待下月补货。');G.inventory[item]--;stoneChange(G,unit,'地方交易与经营');st.wallet-=unit;st.stock[item]++;}
 else{if(st.stock[item]<1||G.stones<unit)return notify('货物或灵石不足。');stoneChange(G,-(unit),'地方交易与经营');G.inventory[item]=(G.inventory[item]||0)+1;st.stock[item]--;st.wallet+=unit;}
 window.XTLocal37?.onTrade(window.XTShop38?.shopId(id)??id,item,selling);
 G.marketTrades++;log(`${selling?'卖给':'向'}${a.name}${selling?'':'购入'}${name(item)}，${selling?'得':'花'} ${unit} 灵石。`);save();render();
}
function renderBag(){
 const keys=Object.keys(BAG_ITEMS).filter(id=>(G.inventory[id]||0)>0),filter=V.sub||'all';
 const category=id=>['qiPill','healingPowder','bloodQiPill','lowTalisman'].includes(id)?'medicine':['ironSword','clothArmor','spiritBlade','mobileFurnace','forgeKit'].includes(id)?'gear':['qiManual','alchemyPrimer','forgePrimer'].includes(id)?'books':'material';
 const show=keys.filter(k=>filter==='all'||category(k)===filter);
 const size=6,total=Math.max(1,Math.ceil(show.length/size));V.page=Math.min(V.page,total-1);
 const body=show.slice(V.page*size,(V.page+1)*size).map(id=>{
  const type=category(id);let actions='';
  if(type==='medicine')actions+=btn('使用','use',id);
  if(['ironSword','spiritBlade','clothArmor'].includes(id))actions+=btn('装备','equip',id);
  if(id==='mobileFurnace'||id==='forgeKit')actions+=btn('布置工具','deploy',id);
  if(type==='books')actions+=btn('阅读','read',id);
  if(atHome())actions+=btn('存入仓库','deposit',id);
  return `<div class="sb-item"><div><b>${name(id)} × ${G.inventory[id]}</b><small>${esc(BAG_ITEMS[id].desc)}</small></div><div class="sb-buttons">${actions}</div></div>`;
 }).join('');
 page('行囊',`${body||note('这个分类暂时没有物品。交易请到场景里找商人。')}${total>1?`<div class="sb-pagination">${btn('上一页','page','-1',V.page===0)}<span>${V.page+1} / ${total}</span>${btn('下一页','page','1',V.page===total-1)}</div>`:''}`,[['all','全部'],['medicine','丹药'],['gear','装备工具'],['material','材料'],['books','书册']]);
}
function read(id){
 if(!canAct()||(G.inventory[id]||0)<1)return;
 if(id==='qiManual'){
  if(data().books['引气篇'])return notify('已经收录过《引气篇》，可去功法页研习。');
  G.inventory[id]--;data().books['引气篇']={level:0};log('把《引气篇》收进书架，尚待研习。');
 }else{
  const type=id==='alchemyPrimer'?'alchemy':'forge';
  const ids=Object.keys(recipes).filter(k=>recipes[k].type===type);
  if(ids.every(k=>data().recipes.includes(k)))return notify('这本书中的工艺已经掌握。');
  G.inventory[id]--;data().recipes=[...new Set(data().recipes.concat(ids))];log('读过'+name(id)+'，记下两种工艺。');
 }
 save();render();
}
function renderArts(){
 const d=data();let body='';
 for(const [title,book] of Object.entries(d.books)){
   const m=MANUALS[title];if(!m)continue;
   const active=m.kind==='心法'?d.mind===title:d.spells.includes(title);
   body+=card('《'+title+'》',`${m.kind} · ${m.tier}品 · ${['未入门','入门','熟练','精通'][book.level]}<br>${m.desc}${active?'<br><b>当前运用</b>':''}`,
    btn(book.level?'研习 · 30日':'入门 · 10日','practice',title,book.level>=3)+btn(active?'已运用':'运用此法','activate',title,!book.level||active));
 }
 page('功法与术法',note('可运用一门心法、两门术法。')+(body||note('尚未得到功法书册。县城百草铺、坊市摊主和宗门藏经处都有不同来路。')),[['practice','修行'],['arts','功法']]);
}
function practice(title){
 if(!canAct())return;
 const d=data(),b=d.books[title];if(!b||b.level>=3)return;
 const fee=money(b.level?4:2);if(G.stones<fee)return notify('研习需要 '+fee+' 灵石备纸墨与修炼所需。');
 stoneChange(G,-(fee),'地方交易与经营');
 act(b.level?30:10,'study',()=>{b.level++;G.arts=G.arts||{};G.arts[title]=true;if(MANUALS[title].kind==='心法'&&!d.mind)d.mind=title;
   if(MANUALS[title].kind==='术法'&&!d.spells.includes(title)&&d.spells.length<2)d.spells.push(title);
   log('《'+title+'》研习至'+['','入门','熟练','精通'][b.level]+'。');});
}
function activate(title){if(!canAct())return;const d=data();if(!d.books[title]?.level)return;if(MANUALS[title].kind==='心法')d.mind=title;else{d.spells=d.spells.filter(n=>n!==title);if(d.spells.length>=2)d.spells.shift();d.spells.push(title);}save();render();}
function renderCraft(type){
 const d=data(),site=workshop(type);type=type==='forge'?'forge':'alchemy';
 const skill=d.skills[type]||0;
 const list=Object.entries(recipes).filter(([id,r])=>r.type===type).map(([id,r])=>{
   const learned=d.recipes.includes(id),mat=Object.entries(r.materials).map(([k,v])=>`${name(k)} ${G.inventory[k]||0}/${v}`).join(' · ');
   const level=skill>=r.skill,where=!!site;
   let why=!learned?'尚无丹方 / 器谱':!where?'缺少场地或工具':!level?'技艺不足':'可以制作';
   return card(r.name,`${mat}<br>${r.days} 日 · 耗 ${money(r.fee)} 灵石 · ${why}`,btn('开始制作','make',id,!learned||!where||!level));
 }).join('');
 page(type==='alchemy'?'炼丹':'炼器',note((site?'当前：'+site.label:'当前没有可用设施。到炉坊租炉，或在自家丹房、器室使用。携便携工具也须在安全落脚处。')+` · 技艺 ${skill}。失败或中断会损失耗材。`)+list+btn('返回场景','backScene'),[['alchemy','炼丹'],['forge','炼器']]);
}
function make(id){
 if(!canAct())return;
 const d=data(),r=recipes[id];if(!r||!d.recipes.includes(id)||d.skills[r.type]<r.skill)return notify('尚未掌握这项工艺。');
 const site=workshop(r.type);if(!site)return notify('缺少场地或工具。');
 if(site.until&&site.until<now()+r.days)return notify('炉位租期不足，请续租后开工。');
 if(data().property?.expires&&site.kind==='home'&&data().property.expires<now()+r.days)return notify('租住期限不足，请先续租。');
 if(G.stones<money(r.fee)||Object.entries(r.materials).some(([k,v])=>(G.inventory[k]||0)<v))return notify('材料或灵石不足。');
 stoneChange(G,-(money(r.fee)),'地方交易与经营');for(const [k,v]of Object.entries(r.materials))G.inventory[k]-=v;
 const chance=Math.min(.9,.65+d.skills[r.type]*.04+(G.attr.wu-5)*.01);
 act(r.days,'craft',()=>{d.skills[r.type]=Math.min(10,d.skills[r.type]+1);if(Math.random()<chance){G.inventory[id]=(G.inventory[id]||0)+1;log('制成'+r.name+'一份。');}else log('制作'+r.name+'失手，耗材已损失，也积累了一些经验。');});
}
function propertyPanel(){
 const d=data(),p=d.property;
 if(!p||!ownedHome())return note(p?'原租屋已到期。到青石县牙行续租或置业。':'尚无个人经营产业。已有住处可在上方查看；租院或置产请到青石县牙行。')+btn('查看所在场景','backScene');
 return card(({rental:'租住小院',courtyard:'自有宅院',cave:'自有洞府'})[p.type],`${esc(placeName(p.place))} · 可容 ${homeSize()} 名雇员${p.expires?' · 余 '+Math.max(0,p.expires-now())+' 日租期':' · 永久产权'}${p.type==='cave'?'<br>附属灵脉浓度2.1，进入自家院落后修炼产出 +15%。':''}<br>${atHome()?'你已在产业所在地区。':'你不在当地，需要先沿地图赶来。'}`,
   btn('进入院落','enterHome','',!atHome())+(p.expires?btn('续租一年 · '+XTContent47.coinText(XTContent47.estateRenewal(p).fee,p.currency||'stone'),'renew','',XTContent47.funds(p.currency||'stone')<XTContent47.estateRenewal(p).fee):''));
}
function renderHome(){
 const d=data(),sub=V.sub||'overview';let body='';
 if(sub==='overview')body=(window.XTHome41?.overview()||'')+propertyPanel();
 if(sub==='rooms'){
  body=note(ownedHome()?placeName(d.property.place)+' · '+(atHome()?'可在此修建设施。':'先沿地图前往产业所在地。'):'尚无产业，先到牙行租住或置业。');
  if(ownedHome())for(const [id,title,cost]of [['alchemy','丹房',60],['forge','器室',70],['garden','药圃',45]])body+=`<div class="sb-item"><div><b>${title}</b><small>${data().property.rooms[id]?'已经建成':`修建耗 30 日、${money(cost)} 灵石`}</small></div>${data().property.rooms[id]?'<span class="sb-note">已建成</span>':btn('修建','build',id,!atHome())}</div>`;
 }
 if(sub==='warehouse'){
   body=note(atHome()?'这里存放产业材料和雇员产出。行囊物品可在行囊页存入。':'仓库在产业所在地，只能亲自到场取放。');
   body+=Object.entries(d.warehouse).filter(([id,n])=>n>0).map(([id,n])=>card(name(id)+' × '+n,'产业库存',btn('取一份','withdraw',id,!atHome()))).join('')||note('仓库空空。');
 }
 if(sub==='staff')body=renderStaff();
 page('家园与产业',body,[['overview','住处'],['rooms','设施'],['warehouse','仓库'],['staff','人手']]);
}
function offers(kind){
 if(!physicalActor('broker'))return notify('请先亲自到县城牙行。');
 V.tab=kind;render();
}
function renderOffers(){
 if(!physicalActor('broker')){V.tab='scene';renderRooms();return;}
 const C=XTContent47;let body='';
 if(V.tab==='propertyOffers')for(const [id,title,extra]of [['rental','租住小院','一年租期，容两人，可修建作坊。'],['courtyard','购买宅院','永久产权，容四人。'],['cave','置办洞府','筑基后可购，容六人。']]){const q=C.propertyQuote(id);body+=card(title,C.coinText(q.fee,q.currency)+' · '+extra,btn('签约 · 1日','buyProperty',id,!!data().property&&ownedHome()&&(data().property.type===id||id==='rental')));}
 else for(const [id,r]of Object.entries(recruits)){const q=C.recruitQuote(id,r),debt=window.XTStaff54?.debtOf(id);body+=card(r.name+' · '+r.title,'安置费 '+C.coinText(q.fee,q.currency)+'，含首月食宿。月俸 '+C.coinText(q.wage,q.currency)+'。'+(r.realm>=0?'按既定报酬与住处签约，不要求雇主境界高于本人。':'负责采购、药圃与家务。'),debt?btn('结清旧欠薪 · '+C.coinText(debt,XTStaff54.debtCurrency(id)),'s54:payFormer',id):btn('招募 · 1日','hire',id,data().staff.some(w=>w.id===id)));}
 page(V.tab==='propertyOffers'?'何经纪 · 宅院契约':'何经纪 · 招募人手',body+btn('返回牙行','backScene'));
}
function buyProperty(type){
 if(!physicalActor('broker')||!canAct())return;
 const C=XTContent47,q=C.propertyQuote(type);if(!q)return;
 const d=data();if(d.property&&ownedHome()&&d.property.type===type)return;
 if(type==='rental'&&ownedHome())return notify('已有产业，可在家园续租。');
 if(type==='cave'&&realmOf()<1)return notify('洞府契约需筑基修为。');
 if(C.funds(q.currency)<q.fee)return notify((q.currency==='wen'?'凡钱':'灵石')+'不足。');
 C.atomic(()=>act(1,'contract',()=>{if(!physicalActor('broker')||C.funds(q.currency)<q.fee)return;C.debit(q.currency,q.fee,'签订'+({rental:'租院',courtyard:'宅院',cave:'洞府'})[type]+'契约');data().property={type,place:'county',currency:q.currency,renewalAmount:type==='rental'?q.fee:null,expires:type==='rental'?now()+360:null,rooms:d.property?.rooms||{}};log('签下'+({rental:'小院租契',courtyard:'宅院地契',cave:'洞府地契'})[type]+'，付'+C.coinText(q.fee,q.currency)+'。');}));
}

function build(id){
 if(!atHome()||!canAct()||data().property.rooms[id])return;
 const fee={alchemy:60,forge:70,garden:45}[id];if(!fee||G.stones<money(fee))return notify('灵石不足。');
 if(data().property.expires&&data().property.expires<now()+30)return notify('租期不足，先续租。');
 stoneChange(G,-(money(fee)),'地方交易与经营');act(30,'build',()=>{data().property.rooms[id]=true;log('产业增建'+({alchemy:'丹房',forge:'器室',garden:'药圃'})[id]+'。');});
}
function hire(id){
 if(!physicalActor('broker')||!canAct())return;
 const d=data(),r=recruits[id];if(!r||d.staff.some(w=>w.id===id))return;
 if(window.XTStaff54?.debtOf(id))return notify('须先结清本人旧欠薪，才能重新商议招募。');
 const person=window.XTWorld36?.get(id),born=person?.birth??d.roster[id]?.born??now()-20*360;
 if(person?.alive===false||now()-born>=(person?.life??r.life)*360)return notify('这位故人已经寿尽，不能重新招募。');
 if(!ownedHome()||d.staff.length>=homeSize())return notify('需要有效产业与空余住处。');
 const C=XTContent47,q=C.recruitQuote(id,r);if(C.funds(q.currency)<q.fee)return notify('安置费不足，需'+C.coinText(q.fee,q.currency)+'。');
 C.atomic(()=>act(1,'hire',()=>{const n=window.XTWorld36?.get(id);if(!physicalActor('broker')||!ownedHome()||d.staff.length>=homeSize()||d.staff.some(w=>w.id===id)||n?.alive===false||now()-born>=(n?.life??r.life)*360||C.funds(q.currency)<q.fee)return;C.debit(q.currency,q.fee,r.name+'安置费');d.roster[id]={born};d.staff.push({id,name:r.name,realm:n?.realm??r.realm,currency:q.currency,wage:q.wage,wageFixed:q.wage,nextWage:now()+30,born,life:n?.life??r.life,job:null});log(r.name+'前来效力，付安置费'+C.coinText(q.fee,q.currency)+'，首月食宿已结清。');}));
}

const jobs={purchase:{name:'采购草药',days:30,fee:8,output:{herb:3}},garden:{name:'照料药圃',days:30,fee:1,output:{herb:2}},gather:{name:'外出采集',days:30,fee:2,output:{herb:4}},alchemy:{name:'代炼聚气散',days:10,fee:3,materials:{herb:2},output:{qiPill:1}},forge:{name:'代制青钢短剑',days:15,fee:8,materials:{ironOre:3},output:{ironSword:1}}};
function staffDetails(w){
 const person=window.XTWorld36?.get(w.id),t=now();
 const born=Number.isFinite(person?.birth)?person.birth:w.born;
 const elapsed=Number.isFinite(born)&&born<=t?t-born:null;
 const age=elapsed===null?'未核定':Math.floor(elapsed/360)+'岁'+Math.floor(elapsed%360)+'日';
 const life=Number.isFinite(w.life)?w.life+'岁':'未核定';
 const pay=Number.isFinite(w.nextWage)?(w.nextWage<=t?'已到期':Math.ceil(w.nextWage-t)+'日后'):'未核定';
 const arrears=Number.isFinite(w.arrears)?w.arrears:0;
 return `产业雇佣 · 年龄 ${age} · 寿限 ${life}。<br>月俸 ${XTContent47.coinText(XTContent47.staffWage(w),w.currency||'stone')} · 下次发薪 ${pay} · 欠薪 ${arrears}个月。<br>`;
}
function renderStaff(){
 const d=data();
 const selected=d.staff.find(w=>w.id===V.worker);
 const detail=selected?card(selected.name+' · 委派',staffDetails(selected)+(selected.job?`正在${jobs[selected.job.type].name}，还需 ${Math.max(0,selected.job.due-now())} 日。`:'选择一项工作，产出送往仓库。代工耗材从仓库扣除，月俸另计。'),
 (selected.job?btn('取消工作（耗材不退）','cancelJob',selected.id):Object.entries(jobs).map(([id,j])=>btn(j.name+' · '+j.days+'日 / '+money(j.fee)+'灵石','assign',selected.id+':'+id,!ownedHome())).join(''))+btn('遣散','dismiss',selected.id)):'';
 return note(`已招募 ${d.staff.length}/${homeSize()} 人。欠薪三月会离去。`)+
 (d.staff.map(w=>`<div class="sb-item"><div><b>${w.name} · ${w.realm<0?'凡人':(REALM_NAMES[w.realm]||'修士')}</b><small>月俸 ${XTContent47.coinText(XTContent47.staffWage(w),w.currency||'stone')} · ${w.contract?.status==='pending'?'聘约待确认':w.training?'修行培养 · 余'+Math.max(0,w.training.end-now())+'日':w.job?jobs[w.job.type].name:'待命'}</small></div>${btn('安排','selectWorker',w.id)}</div>`).join('')||note('还没有人手。到县城牙行招募。'))+detail;
}
function assign(arg){
 if(!canAct())return;
 const [id,type]=arg.split(':'),d=data(),w=d.staff.find(w=>w.id===id),j=jobs[type];if(!w||!j||w.job||w.training||w.contract?.kind==='personal'&&w.contract.status==='pending')return;
 if(!ownedHome())return notify('产业已经到期，先续租。');
 const p=d.property;
 if(type==='garden'&&!p.rooms.garden)return notify('需要先修建药圃。');
 if(type==='gather'&&w.realm<0)return notify('凡人不宜独入灵材险地，请委派低阶修士。');
 if(['alchemy','forge'].includes(type)&&(!p.rooms[type]||w.realm<0||!d.recipes.includes(type==='alchemy'?'qiPill':'ironSword')))return notify('代工需要对应作坊、工艺与修士手下。');
 if(type==='forge'&&id!=='han')return notify('这位手下未学过炼器工艺，可请韩铸代工。');
 if(p.expires&&p.expires<now()+j.days)return notify('产业租期不足以完成这项工作。');
 if(G.stones<money(j.fee)||Object.entries(j.materials||{}).some(([k,v])=>(d.warehouse[k]||0)<v))return notify('灵石或仓库耗材不足。');
 stoneChange(G,-(money(j.fee)),'地方交易与经营');for(const [k,v]of Object.entries(j.materials||{}))d.warehouse[k]-=v;
 w.job={type,due:now()+j.days};log('委派'+w.name+j.name+'，'+j.days+'日后查看仓库。');save();render();
}
function tick(){
 if(!G?.sandbox35)return;
 const d=data(),t=now();if(!window.XTContent47)return;
 window.XTStaff54?.tick();
 for(const w of [...d.staff]){
   if(Number.isFinite(w.born)&&Number.isFinite(w.life)&&t-w.born>=w.life*360){log(w.name+'寿尽，离开了人世。');d.staff=d.staff.filter(x=>x!==w);continue;}
   if(!ownedHome()){if(w.job){w.job=null;log('租期已满，'+w.name+'的工作中止。');}continue;}
   if(t>=w.nextWage){
     const C=XTContent47,currency=w.currency||'stone',count=Math.floor((t-w.nextWage)/30)+1,each=C.staffWage(w),owed=(w.arrears||0)+count,affordable=Math.min(owed,Math.floor(C.funds(currency)/each));
     C.debit(currency,affordable*each,w.name+'月俸');w.nextWage+=count*30;w.arrears=owed-affordable;
     if(w.arrears){window.XTStaff54?.stop(w,'欠薪暂停');w.job=null;log(w.name+'未收到月俸，暂停工作。');}
     if(w.arrears>=3){window.XTStaff54?.recordDebt(w);log(w.name+'因欠薪三月离去。');d.staff=d.staff.filter(x=>x!==w);continue;}
   }
   if(w.job&&w.job.due<=t){
    const j=jobs[w.job.type];
    for(const [k,v]of Object.entries(j.output))d.warehouse[k]=(d.warehouse[k]||0)+v;
    log(w.name+'完成'+j.name+'，产出已入仓。');w.job=null;
   }
 }
}
function renderFaction(){
 const d=data(),f=d.faction,aid=V.detail?.faction||actors[V.actor]?.faction||f?.id,a=Object.entries(actors).find(([id,a])=>a.faction===aid),present=a&&physicalActor(a[0]);
 if(!f){page('山门',note('尚无门派。去道观或太岳宗前院找执事，选择师承。')+(present?card(factions[aid].name,'入门需 '+money(12)+' 灵石作仪礼，耗三日。',btn('申请入门','join',aid)):btn('回场景寻访','backScene')));return;}
 let body=card(f.name,`${f.rank} · 贡献 ${f.contribution}。${present?'你正在执事面前。':'宗门差事、考核与藏经兑换需要亲至本门执事面前。'}`);
 if(present&&aid===f.id){
  const mind=f.id==='taiyue'?'太岳养气诀':'青云引气诀',spell=f.id==='taiyue'?'厚土护身诀':'定风咒';
  body+=card('宗门差事','交青叶草 ×4：贡献 +2；交赤铁砂 ×3：贡献 +3。各差事每月一次，交接耗一日。',btn('交付草药','sectTask','herb')+btn('交付矿砂','sectTask','ironOre'));
  body+=card('藏经与晋升',`贡献10可晋内门。引气篇需2贡献，${mind}需6贡献，${spell}需8贡献（限内门）。`,btn('兑换引气篇','sectBook','引气篇')+btn('兑换'+mind,'sectBook',mind)+btn('兑换'+spell,'sectBook',spell,f.rank!=='内门弟子')+btn('内门考核 · 10贡献 / 3日','promote','',f.rank==='内门弟子'));
 }
 page('宗门与师承',body);
}
function sectPresent(id){const a=Object.entries(actors).find(([k,a])=>a.faction===id);return a&&physicalActor(a[0]);}
function join(id){
 if(!canAct()||!sectPresent(id)||data().faction)return;
 const f=factions[id];if(realmOf()<f.need)return notify('修为还不足以获得这座宗门的接引。');if(G.stones<money(12))return notify('仪礼需 '+money(12)+' 灵石。');
 stoneChange(G,-(money(12)),'地方交易与经营');act(3,'sect',()=>{data().faction={id,name:f.name,rank:'外门弟子',contribution:0,cd:{}};G.sect={name:f.name,rank:'外门弟子',contribution:0};log('拜入'+f.name+'，暂列外门。');});
}
function factionTask(item){
 if(!canAct())return;
 const f=data().faction;if(!f||!sectPresent(f.id))return notify('请回本门执事处交差。');
 const amount={herb:4,ironOre:3}[item];if(!amount)return;
 if((f.cd[item]||0)>now())return notify('这项差事还未重新开放。');
 if((G.inventory[item]||0)<amount)return notify('携带材料不足。');
 G.inventory[item]-=amount;act(1,'sectTask',()=>{f.contribution+=item==='herb'?2:3;f.cd[item]=now()+30;G.sect.contribution=f.contribution;log('完成'+f.name+'的差事，贡献已记入本门。');});
}
function sectBook(title){
 if(!canAct())return;
 const f=data().faction,fee={'引气篇':2,'青云引气诀':6,'定风咒':8,'太岳养气诀':6,'厚土护身诀':8}[title];if(!f||!sectPresent(f.id)||!fee)return;
 const own=f.id==='taiyue'?['引气篇','太岳养气诀','厚土护身诀']:['引气篇','青云引气诀','定风咒'];if(!own.includes(title))return;
 if(['定风咒','厚土护身诀'].includes(title)&&f.rank!=='内门弟子')return;
 if(data().books[title])return notify('已经得到此书。');if(f.contribution<fee)return notify('贡献不足。');
 f.contribution-=fee;G.sect.contribution=f.contribution;data().books[title]={level:0};log('从藏经处换得《'+title+'》。');save();render();
}
function renderSelf(){
 const sub=V.sub||'profile',d=data();let body='';
 if(sub==='profile')body=card(esc(G.name),`${esc(G.root)} · ${curRealmTxt()}<br>${G.age}/${G.lifespan} 岁 · 所在 ${esc(placeName(G.place))}<br>兵器：${name(G.equipment.weapon)||'未装备'} · 护具：${name(G.equipment.armor)||'未装备'}`)+btn('查看详细档案','legacySelf');
 if(sub==='relations')body=window.XTWorld36?window.XTWorld36.relationsPanel():Object.entries(d.relations).map(([id,v])=>card(actors[id]?.name||id,`交情 ${v}`)).join('')||note('尚未结识新的人。到场景里交谈。');
 if(sub==='news')body=d.news.slice(0,8).map(n=>`<div class="sb-item"><small>${Math.floor(n.at/360)}载</small><p>${esc(n.text)}</p></div>`).join('')||note('暂无产业与地方记录。');
 if(sub==='settings')body=card('本地卷宗','游戏与界面设置保存在当前浏览器。',btn('存档管理','saves')+btn('界面设置','settings')+btn('族谱','lineage')+btn('修行见闻','world')+btn('玩法说明','guide'));
 if(sub==='sect'){renderFaction();return;}
 page('人物',body,[['profile','档案'],['relations','关系'],['sect','宗门'],['news','近况'],['settings','设置']]);
}
function renderQuests(){
 const d=data(),f=d.faction;
 page('本地委托',`<div class="sb-quest">${localQuestPanel()}</div>`+card('坊市采药',`交付青叶草3株，得10灵石。每年一次。`,btn('交付 · 1日','marketQuest','',!placeHas(PLACES[G.place],'trade')))+card('清理山道',`击退妖兽 ${(G.huntBounty||{}).progress||0}/3。奖励24灵石，由商人结算。`,btn('领取悬赏','claim','',!placeHas(PLACES[G.place],'trade'))));
 const scene=document.getElementById('scene');scene.querySelectorAll('[data-local-quest]').forEach(b=>b.onclick=()=>actLocalQuest(b.dataset.localQuest));
}
function notify(t){toast(t);}
function renderGuide(){
 if(window.XTHelp40)return window.XTHelp40.render();
 page('帮助','<p>正在准备帮助条目。</p>');
}
function go(tab,sub=''){V.tab=tab;V.sub=sub;V.page=0;V.detail=null;closeMainOverlay();render();}
function dispatch(action,arg){
 if(action?.startsWith('e60:')&&window.XTEvents60){window.XTSandbox.dispatch(action,arg);return;}
 if(action?.startsWith('s54:')&&window.XTStaff54){window.XTStaff54.dispatch(action.slice(4),arg);return;}
 if(G?.root&&window.XTInteraction42&&!XTInteraction42.busy)return XTInteraction42.observe(action,arg,()=>dispatch(action,arg));
 if(window.XTChildhood49?.dispatch(action,arg))return;
 if(window.XTBackground47?.dispatch(action,arg))return;
 if(window.XTContent47?.dispatch(action,arg))return;
 if(window.XTScene46?.dispatch(action,arg))return;
 if(window.XTAuction44?.dispatch(action,arg))return;
 if(window.XTMap45?.dispatch(action,arg))return;
 if(window.XTCounty45?.dispatch(action,arg))return;
 if(window.XTScene44?.dispatch(action,arg))return;
 if(window.XTAuction43?.dispatch(action,arg))return;
 if(window.XTInteraction42?.dispatch(action,arg))return;
 if(window.XTHome41?.dispatch(action,arg))return;
 if(window.XTShop38?.dispatch(action,arg))return;
 if(window.XTLocal37?.dispatch(action,arg))return;
 if(window.XTWorld36?.dispatch(action,arg))return;
 if(action==='sub'){V.sub=arg;V.page=0;render();return;}
 if(action==='page'){V.page=Math.max(0,V.page+Number(arg));render();return;}
 if(action==='map'){openMap();return;}
 if(action==='routes'){openTravel();return;}
 if(action==='backScene'){V.tab='scene';V.sub='';render();return;}
 if(action==='home'){go('home','overview');return;}
 if(action==='subScene'){V.tab='quests';render();return;}
 if(action==='room'){data().room=arg;V.actor=null;V.detail=null;render();return;}
 if(action==='actor'){V.actor=arg;V.detail=null;render();return;}
 if(action==='clearActor'){V.actor=null;V.detail=null;render();return;}
 if(action==='legacyActor'){V.actor=null;V.detail={kind:'legacy',id:arg};render();return;}
 if(action==='shop'){shop(arg);return;}
 if(action==='buy'||action==='sell'){trade(arg,action==='sell');return;}
 if(action==='propertyOffers'||action==='recruitOffers'){offers(action);return;}
 if(action==='buyProperty'){buyProperty(arg);return;}
 if(action==='hire'){hire(arg);return;}
 if(action==='enterHome'){if(atHome()){V.tab='scene';data().room='home';V.actor=null;render();}return;}
 if(action==='renew'){
   const p=data().property;if(!canAct()||!p?.expires||G.place!==p.place||!atHome()&&!physicalActor('broker'))return notify('须到产业院落或当地牙行续租。');
   const C=XTContent47,q=C.estateRenewal(p);if(C.funds(q.currency)<q.fee)return notify('续租需'+C.coinText(q.fee,q.currency)+'。');
   C.atomic(()=>act(1,'renew',()=>{if(data().property!==p||G.place!==p.place||C.funds(q.currency)<q.fee)return;C.debit(q.currency,q.fee,'小院续租');p.expires=Math.max(now(),p.expires)+360;log('付'+C.coinText(q.fee,q.currency)+'，续租一年。');}));return;
 }
 if(action==='build'){build(arg);return;}
 if(action==='assign'){assign(arg);return;}
 if(action==='selectWorker'){V.worker=arg;render();return;}
 if(action==='dismiss'){if(window.XTStaff54){window.XTStaff54.dispatch('leave',arg);return;}if(!canAct())return;const d=data(),w=d.staff.find(w=>w.id===arg);if(w){d.staff=d.staff.filter(x=>x!==w);log('遣散了'+w.name+'，未完工作的耗材不退。');save();render();}return;}
 if(action==='cancelJob'){const w=data().staff.find(w=>w.id===arg);if(w){w.job=null;log(w.name+'的委派已取消，耗材不返。');save();render();}return;}
 if(action==='deposit'||action==='withdraw'){
   if(!canAct()||!atHome())return;const d=data(),from=action==='deposit'?G.inventory:d.warehouse,to=action==='deposit'?d.warehouse:G.inventory;
   if((from[arg]||0)>0){from[arg]--;to[arg]=(to[arg]||0)+1;save();render();}return;
 }
 if(action==='craft'){V.tab='craft';V.sub=arg;render();return;}
 if(action==='deploy'){
   if(!canAct()||!['mobileFurnace','forgeKit'].includes(arg)||!(G.inventory[arg]>0))return;
   if(['野地','秘境'].includes(PLACES[G.place].tier))return notify('这里过于危险，不能布置随身工具。');
   data().room='camp';V.tab='scene';V.actor=null;V.detail=null;render();return;
 }
 if(action==='make'){make(arg);return;}
 if(action==='rentWorkshop'){
   if(!canAct()||data().room!=='workshop'||!['county','prefecture','spiritMarket'].includes(G.place))return;
   if(G.stones<money(6))return notify('租炉需 '+money(6)+' 灵石。');stoneChange(G,-(money(6)),'地方交易与经营');
   const until=data().workshop?.place===G.place?Math.max(now(),data().workshop.until):now();data().workshop={place:G.place,until:until+30};log('租下三十日炉位，丹炉与砧台均可使用。');save();render();return;
 }
 if(action==='learnRecipes'){
   const teacher=arg==='alchemy'?'dan':'smith',fee=arg==='alchemy'?18:20;
   if(!physicalActor(teacher)||!canAct())return;if(G.stones<money(fee))return notify('灵石不足。');
   const ids=Object.keys(recipes).filter(k=>recipes[k].type===arg);if(ids.every(k=>data().recipes.includes(k)))return notify('这些基础工艺已经学过。');
   stoneChange(G,-(money(fee)),'地方交易与经营');act(3,'learnCraft',()=>{data().recipes=[...new Set(data().recipes.concat(ids))];log('向'+actors[teacher].name+'学了两项基础工艺。');});return;
 }
 if(action==='read'){read(arg);return;}
 if(action==='practice'){practice(arg);return;}
 if(action==='activate'){activate(arg);return;}
 if(action==='use'){sysUse(arg);return;}
 if(action==='equip'){sysEquip(arg,arg==='clothArmor'?'armor':'weapon');return;}
 if(action==='gather'){sysGather();return;}
 if(action==='hunt'){sysHunt();return;}
 if(action==='ask'){actAsk();return;}
 if(action==='work'){actWork();return;}
 if(action==='chase'){actChase(arg);return;}
 if(action==='visitLegacy'){actVisit(arg);return;}
 if(action==='talkLegacy'){
  const n=NPCS.find(n=>n.id===arg&&n.place===G.place);if(n)act(1,'talk',()=>{log(personName(n)+'说：'+fillFate(n.knows||n.want||'人在江湖，先保重自身。'));});return;
 }
 if(action==='talk'){
  if(!physicalActor(arg))return;const d=data();
  if((d.talkCd?.[arg]||0)>now())return notify('今日已经聊过。');
  act(1,'talk',()=>{d.relations[arg]=(d.relations[arg]||0)+1;d.talkCd=d.talkCd||{};d.talkCd[arg]=now()+30;log(actors[arg].name+'与你聊了当地的生计与规矩。');});return;
 }
 if(action==='faction'){V.tab='faction';V.detail={faction:arg};render();return;}
 if(action==='join'){join(arg);return;}
 if(action==='sectTask'){factionTask(arg);return;}
 if(action==='sectBook'){sectBook(arg);return;}
 if(action==='promote'){
  const f=data().faction;if(!canAct()||!f||!sectPresent(f.id)||f.rank==='内门弟子')return;if(f.contribution<10)return notify('贡献不足。');
  f.contribution-=10;act(3,'promotion',()=>{f.rank='内门弟子';G.sect.rank=f.rank;G.sect.contribution=f.contribution;log('通过内门考核。');});return;
 }
 if(action==='marketQuest'){
   if(!canAct()||!placeHas(PLACES[G.place],'trade'))return;
   const key='gather_'+G.age;if(G.quests[key])return notify('今年已经交付过。');if((G.inventory.herb||0)<3)return notify('青叶草不足。');
   G.inventory.herb-=3;act(1,'quest',()=>{G.quests[key]=true;stoneChange(G,money(10),'地方交易与经营');log('交付坊市采药委托。');});return;
 }
 if(action==='claim'){sysClaimBounty();return;}
 if(action==='legacySelf'){old.openSelf();return;}
 if(action==='saves'){openSaves();return;}
 if(action==='settings'){openSettings();return;}
 if(action==='lineage'){openLineage();return;}
 if(action==='world'){openWorldPanel();return;}
 if(action==='guide'){openGuide();return;}
}
// Integrate the sandbox with existing gameplay. No separate clock or alternate save file.
advanceDays=function(n,ctx,opt){data();const r=old.advanceDays(n,ctx,opt);tick();return r;};
worldTick=function(){old.worldTick();tick();};
restore=function(raw){const ok=old.restore(raw);if(ok){data();tick();V.tab='cult';V.sub='';}return ok;};
newGame=function(...args){
 const inherited=args.length>=4&&G?.mode==='dead'&&G?.sandbox35?JSON.parse(JSON.stringify({property:G.sandbox35.property,warehouse:G.sandbox35.warehouse,staff:G.sandbox35.staff||[],roster:G.sandbox35.roster||{}})):null;
 V.tab='cult';V.sub='';const result=old.newGame(...args);
 if(inherited){const d=data();d.property=inherited.property;d.warehouse=inherited.warehouse;d.staff=inherited.staff;d.roster=inherited.roster;}
 return result;
};
addArt=function(s,title){const result=old.addArt(s,title);if((!s||s===G)&&G){const d=data();d.books[title]={level:Math.max(1,d.books[title]?.level||0)};if(MANUALS[title]?.kind==='心法'&&!d.mind)d.mind=title;if(MANUALS[title]?.kind==='术法'&&!d.spells.includes(title)&&d.spells.length<2)d.spells.push(title);}return result;};
artMindSum=function(s){
 s=s||G;const d=s.sandbox35;
 if(!d){let a=0,b=0,l=0;for(const n of Object.keys(s.arts||{})){const m=MANUALS[n];if(m?.kind==='心法'){a+=m.effect.absorb;b+=m.effect.bt;l+=m.effect.life;}}return {absorb:a,bt:b,life:l};}
 const m=MANUALS[d.mind],level=d.books[d.mind]?.level||0;
 if(!m||!level)return {absorb:0,bt:0,life:0};const k=.5+level*.5;return {absorb:m.effect.absorb*k,bt:m.effect.bt*k,life:Math.round(m.effect.life*k)};
};
hasRoute=function(s,tag){s=s||G;const d=s.sandbox35;return (d?d.spells:Object.keys(s.arts||{})).some(n=>MANUALS[n]?.effect.route===tag&&(!d||d.books[n]?.level>0));};
function caveActive(s){const d=s.sandbox35,p=d?.property;return p?.type==='cave'&&p.place===s.place&&['home','alchemy','forge'].includes(d.room)&&(!p.expires||p.expires>=now());}
currentPlaceQi=function(s){s=s||G;return caveActive(s)?2.1:old.currentPlaceQi(s);};
yearOutput=function(s){s=s||G;return old.yearOutput({...s,learned:{...s.learned,qiManual:false}})*(caveActive(s)?1.15:1);};
openHere=function(){if(G?.mode==='idle')go('scene');};
openSelf=function(){go('self','profile');};
openGuide=function(){go('guide','start');};
openBagPanel=function(){if(G)go('bag','all');};
finishSystemAction=function(){save();render();};
afterAct=function(r){if(r.died){die('寿元耗尽');return;}if(r.event){startEvent(r.event);return;}save();render();};
sysBuy=function(id){trade(id,false);};sysSell=function(id){trade(id,true);};
sysBrew=function(){make('qiPill');};
sysStudy=function(){practice('引气篇');};
sysJoinSect=function(){const id=actors[V.actor]?.faction;if(id)join(id);else notify('请亲至宗门前院拜见执事。');};
sysSectPromote=function(){dispatch('promote','');};
sysQuest=function(){dispatch('marketQuest','');};
const claimBounty=sysClaimBounty;
sysClaimBounty=function(){const contribution=G?.sect?.contribution;claimBounty();if(G?.sect&&contribution!=null)G.sect.contribution=contribution;save();render();};
renderScene=function(){
 if(!G||G.mode!=='idle'){document.body.classList.remove('sb-screen');old.renderScene();return;}
 data();
 if(window.XTWorld36?.renderView())return;
 if(V.tab==='cult'){
  if(V.sub==='arts'){renderArts();return;}
  document.body.classList.remove('sb-screen');old.renderScene();
  const el=document.getElementById('scene'),strip=document.createElement('nav');strip.className='sb-tabs';strip.innerHTML=btn('修行','cultTab','practice',false,'on')+btn('功法','cultTab','arts');el.prepend(strip);strip.querySelectorAll('[data-sb]').forEach(b=>b.onclick=()=>{V.sub=b.dataset.arg;render();});return;
 }
 if(V.tab==='scene')renderRooms();else if(V.tab==='bag')renderBag();else if(V.tab==='home')renderHome();else if(V.tab==='self')renderSelf();else if(V.tab==='shop')renderShop();else if(V.tab==='craft')renderCraft(V.sub);else if(V.tab==='faction')renderFaction();else if(V.tab==='quests')renderQuests();else if(V.tab==='guide')renderGuide();else renderOffers();
};
renderActions=function(){
 const el=document.getElementById('actions');
 if(!G||G.mode!=='idle'||V.tab!=='cult'||V.sub==='arts'){el.innerHTML='';return;}
 el.innerHTML=btn('修行至年末','year')+btn('连续修行','auto')+btn('闭关','retreat')+(canBreak()?btn('突破'+(REALM_NAMES[realmOf()+1]||'飞升'),'break'):'');
 el.querySelectorAll('[data-sb]').forEach(b=>b.onclick=()=>{if(b.dataset.sb==='year')stepYear(false);if(b.dataset.sb==='auto')autoRun();if(b.dataset.sb==='retreat')openRetreat();if(b.dataset.sb==='break')openBreak();});
};
renderHUD=function(){old.renderHUD();const gold=document.querySelector('#hud .hud-right .stat:last-child .v');if(gold)gold.textContent=Math.floor(G.stones);const nav=document.getElementById('primaryNav');
 const selected=['guide','history36'].includes(V.tab)?'self':['shop','craft','faction','quests','propertyOffers','recruitOffers','world36'].includes(V.tab)?'scene':V.tab;
 nav.innerHTML=[['cult','修行'],['scene','场景'],['bag','行囊'],['home','家园'],['self','人物']].map(([id,label])=>`<button class="nav-tab ${selected===id?'active':''}" data-sb-nav="${id}"><span class="nav-label">${label}</span></button>`).join('');
 nav.querySelectorAll('[data-sb-nav]').forEach(b=>b.onclick=()=>go(b.dataset.sbNav,b.dataset.sbNav==='bag'?'all':''));
};
window.XTSandbox={roomDefs,state:data,view:V,dispatch,go,workshop,actors,recipes,now,tick,price,shopState,physicalActor};
if(G){data();render();}
})();
