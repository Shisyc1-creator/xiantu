/* Memory-only UI shell. Formal actions, world clock and save data are never loaded. */
(()=>{'use strict';
const R=XTUIRoutes,base={render,navigate,openDetail,closeDetail,renderDetail,itemDetail},views=new Map(),history=[],lastGroup={...R.defaults};
const statusNames={existing:'有现有入口',partial:'部分实现',unreachable:'未发现普通入口',planned:'后续计划'};
Object.assign(people.lin,{topic:'问问近来的修行',reply:'采集的东西已交回仓中。把手上的事做好，余下的时日我想安稳吐纳。若有合用的法门，也愿与你慢慢商量。'});
Object.assign(people.han,{topic:'聊聊器谱',reply:'炼器不只靠炉火。我想寻些讲器纹的旧谱，先琢磨明白，再与你一同试着做。约好的活计，我会先交清。'});
Object.assign(people.qiao,{topic:'问问院里近况',reply:'院里一切还安稳。旁人为什么留下，各有各的缘由；若换了当家人，也先把人的话听完。'});
let current='travel.scene',overviewOrigin=current,detailOrigin=null,itemContext=null;
const memory={goal:'稳固根基',arts:new Set(['乡野吐纳诀']),equipped:null,read:new Set(),battle:[],array:null,pet:false,puppet:false,warehouse:false,compact:false,font:'normal',saves:{},eventChoice:null,relation:'尚未发起新的约定',mode:'大众',onRoad:false};
const E=esc;
const btn=(label,action,id='',cls='plain-btn',disabled=false)=>`<button class="${cls}" data-shell="${action}" data-id="${E(id)}" ${action==='route'?'data-route="'+E(id)+'"':''} ${action==='overview'?'data-testid="route-overview"':action==='back'?'data-testid="route-back"':''} ${disabled?'disabled':''}>${label}</button>`;
const route=(label,id,cls='plain-btn')=>btn(label,'route',id,cls);
const block=(title,body,buttons='')=>`<section class="shell-stage"><span class="shell-label">交互样板 · 演示卷</span><h2>${title}</h2><p>${body}</p><div class="shell-actions">${buttons}</div></section>`;
const row=(title,text,buttons='')=>`<div class="shell-row"><div><h3>${title}</h3><p>${text}</p></div><div class="shell-actions">${buttons}</div></div>`;
const itemData={herb:{name:'青叶草',type:'草木矿材',desc:'叶色新青，药铺逐包验过的药材。',action:'查看用途',verb:'材料用途已展开，可从炉坊查看相关配方。'},sword:{name:'青钢短剑',type:'兵器护具',desc:'锋口新磨，剑脊敛光。',action:'试装到演示栏',verb:'已试装到演示装备栏；正式角色装备未变化。'},manual:{name:'引气篇',type:'书册器谱',desc:'薄册记有调息与守一之法。',action:'翻阅此书',verb:'已翻阅演示书页；正式角色不会因此习得功法。'},pill:{name:'聚气散',type:'丹药符箓',desc:'药包收存妥当，使用前先看用途。',action:'查看使用确认',verb:'用药确认已展示；未消耗物品，也未产生修为。'},ore:{name:'赤铁砂',type:'草木矿材',desc:'矿材颗粒细密，可交工匠辨认。',action:'查看用途',verb:'可在器室与配方入口查看相关用途。'}};

function navIcon(id){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="${{travel:'m2 19 6-12 4 7 4-11 6 16H2Z',cult:'M12 3v5m-4-1 4-4 4 4M6 11q6 7 12 0M4 20q8-8 16 0M8 21h8',bag:'M7 7 5 21h14L17 7H7Zm2 0V5a3 3 0 0 1 6 0v2',estate:'m2 10 10-7 10 7M5 10v11h14V10M10 21v-7h4v7',self:'M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM4 22q0-8 8-8t8 8'}[id]}"/></svg>`;}
function installNav(){
 for(const el of document.querySelectorAll('.primary,.bottom-nav'))el.innerHTML=Object.entries(R.groups).filter(([id])=>R.defaults[id]).map(([id,name])=>`<button data-nav="${id}" data-testid="nav-${id}">${navIcon(id)}${name}</button>`).join('');
 const tools=document.createElement('div');tools.className='shell-utility';tools.innerHTML=btn('界面总览','overview','','text-btn');document.querySelector('.top-actions').prepend(tools);
}
function subnav(group){return `<nav class="shell-subnav" aria-label="${R.groups[group]}二级导航">${R.routes.filter(r=>r.group===group&&r.kind==='view'&&r.status!=='planned').map(r=>`<button data-shell="route" data-id="${r.id}" data-route="${r.id}" data-testid="route-${r.id}" aria-current="${r.id===current?'page':'false'}">${r.title}</button>`).join('')}</nav>`;}
function headingFor(r,desc){return `<div class="shell-breadcrumb">${btn('← 返回来源','back','','text-btn')}<span>${R.groups[r.group]||'界面总览'} / ${r.title}</span></div><header class="route-heading"><div class="eyebrow">A PATH THROUGH XIANTU</div><h1>${r.title}</h1><p>${desc}</p></header>`;}
function routeInfo(){return R.byId[current];}
function saveView(){
 const v=views.get(current)||{};v.scroll=window.scrollY;v.inputs={};
 document.querySelectorAll('#page input[id],#page select[id],#page textarea[id]').forEach(el=>v.inputs[el.id]={value:el.value,checked:el.checked});views.set(current,v);
}
function restoreView(){
 const v=views.get(current);if(!v){window.scrollTo({top:0,behavior:'instant'});return;}
 for(const[id,saved]of Object.entries(v.inputs||{})){const el=document.getElementById(id);if(el){el.value=saved.value;el.checked=saved.checked;if(el.tagName==='INPUT')el.dispatchEvent(new Event('input',{bubbles:true}));}}
 window.scrollTo({top:v.scroll||0,behavior:'instant'});
}
function go(id,push=true){
 if(id==='overview'){if(current!=='overview')overviewOrigin=current;}else if(!R.byId[id]){toast('这个入口尚未登记。');return;}
 const r=R.byId[id];if(r?.kind==='detail'){openRegisteredDetail(id);return;}
 saveView();closeDetail();if(push&&current!==id)history.push(current);current=id;state.detail='location';
 if(r?.group&&R.defaults[r.group]){state.page=r.group;lastGroup[r.group]=id;}
 if(id==='estate.home')state.homeTab='estate';if(id==='estate.staff')state.homeTab='staff';render();restoreView();
}
function back(){go(history.pop()||overviewOrigin||'travel.scene',false);}
function report(text){toast(text);const el=document.getElementById('shell-feedback');if(el){el.textContent=text;el.hidden=false;}}

function equipmentSilhouette(){return `<svg viewBox="0 0 90 140" fill="none"><path d="M15 133q5-30 10-61l10-17h20l12 18 12 60Z" fill="#84947c" opacity=".25"/><path d="m29 71-9 48 13 3 8-48m16-5 13 50 8-3-12-45M35 57l10 16 10-16M31 75l4 57h22l5-57M45 73v57" stroke="#617c66" stroke-width="1.5"/><path d="m28 90 33 2m-33 4 34 2m-26 13 2 19m16-18-2 18" stroke="#a09267"/><ellipse cx="45" cy="38" rx="12" ry="16" fill="#bdc2a3"/><path d="M32 39q-4-23 12-23t14 24l-6-14-14 2Z" fill="#526d5d"/><path d="m39 17 15 3m-33 61-8 32m3-33-7 32" stroke="#a7986c" stroke-width="2"/><path d="M32 131h29" stroke="#7e8f73"/></svg>`;}
function inventoryPage(key){
 const selected=({equipment:'gear',books:'book',medicine:'medicine',materials:'material'})[key]||'all',match={gear:['sword'],book:['manual'],medicine:['pill'],material:['herb','ore']},ids=selected==='all'?Object.keys(itemData):(match[selected]||[]);
 return `<div class="staff-tools"><label class="search"><span>⌕</span><input id="bag-search" aria-label="搜索行囊" placeholder="按名称寻找物品"></label></div><div id="bag-results">${ids.map(id=>row(itemData[id].name,itemData[id].type,btn('查看','item',id))).join('')}</div><div class="shell-equipment"><div>${row('兵器',memory.equipped?itemData[memory.equipped].name:'演示装备栏尚未试装',btn('选取兵器','item','sword'))}</div><div class="shell-silhouette" aria-hidden="true">${equipmentSilhouette()}</div><div>${row('护具','尚未选取演示护具',btn('查看空位','feedback','空位已选中。正式装备仍从实际行囊取用。'))}</div></div><p class="shell-note">这里展示物品查找、说明与动作确认，不增减正式物品。</p>`;
}
function cultivation(key){
 if(key==='practice')return block('收心，行一段路','先看眼前的目标、所修的法，再决定如何度过这一程。',route('安排一段闭关','cult.retreat','primary-btn')+route('看看当前心法','cult.arts'))+`<label class="shell-field">当前行程目标<select id="cult-goal"><option>稳固根基</option><option>寻访传习</option><option>整理术法</option></select></label><div class="shell-columns">${row('所修之法','乡野吐纳诀 · 正在运转',route('研习与配功','cult.loadout'))}${row('此身状态','可静修；伤势与环境条件在正式版核验',route('查看人物','self.profile'))}</div><div class="shell-meter" aria-label="示例修炼进度"><span></span></div><div class="shell-actions">${btn('选择行走修炼','feedback','已选行走修炼。只演示行动确认，不推进日期。','primary-btn')}${route('看看突破条件','cult.breakthrough')}</div>`;
 if(key==='retreat')return block('闭关之前，先有安排','安排时长、修行处与中断方式。实际消耗和修为由原有结算层计算。')+`<label class="shell-field">闭关安排<select id="retreat-length"><option>短时静修</option><option>一段时日</option><option>修至目标再出关</option></select></label><label class="shell-check"><input type="checkbox" id="retreat-stop" checked> 遇事时停下，先看事情</label><div class="shell-actions">${btn('预览入关确认','feedback','已展示入关确认。费用、时长和收益须由正式规则核算。','primary-btn')}${route('回修行行程','cult.practice')}</div><div class="shell-empty">条件示例：若所在地灵气不足，正式版应解释原因，而不是隐藏入口。</div>`;
 if(key==='breakthrough')return block('门前一步','看清所需、风险与自身状态，再决定是否冲关。',btn('查看条件不足示例','toggle','break-condition'))+`<div class="shell-list">${row('当前境界','炼气 · 示例档案，不以灵根封锁后续境界')}${row('冲关准备','修为尚未圆满','<button class="primary-btn" disabled title="演示角色修为未圆满">尚未满足条件</button>')}</div><div id="break-condition" class="shell-empty" hidden>需要先完成当前阶段修行。示例不决定突破费用、成算或寿元后果。</div>`;
 if(['arts','spells','loadout'].includes(key)){const spells=key==='spells';return block(spells?'术法在手，临事而用':'所学之法，各有其用',spells?'查看术法用途与条件，再选拟演示的招式。':'主修、辅修与实际运用形成自己的路数。这里不预设新的辅修上限。',route('主辅配功','cult.loadout')+route('斗法演示','cult.battle'))+[['乡野吐纳诀','基础心法 · 调息养气'],['养锋诀','剑术心法 · 所学示例'],['定风咒','术法 · 运用条件示例']].map(([n,t])=>row(n,t,btn(spells?'查看术法':'查看法门','manual',n))).join('')+`<div class="shell-actions">${btn('试选主修','feedback','已选演示主修。正式主辅适配与负担仍由原规则解释。')}${btn('预览辅修适配','feedback','适配说明已选中。此样板不另定数量上限或冲突代价。')}</div>`;}
 if(key==='battle')return block('一招之间，先看敌势','演练只记录你选择的招式，不计算真实伤害，不产生战利品。')+`<div class="shell-columns">${row('沈行舟','持剑而立 · 演示角色')}${row('演练木偶','示例意图：准备防守')}</div><div class="shell-actions">${['出剑','守势','调息','用药','撤出演练'].map(n=>btn(n,'battle',n,n==='出剑'?'primary-btn':'plain-btn')).join('')}</div><div class="turn-log" id="battle-log">${memory.battle.length?memory.battle.map(E).join('<br>'):'尚未选择招式。'}</div>`;
 if(key==='routes')return block('十途同归，自择所学','方向不锁成职业。逐层查看传习来处、经历与所需，再决定下一步。')+`<div class="shell-columns">${['剑术','筋骨近身','御器','五行','符箓','阵法','灵兽','傀儡','炼丹','炼器'].map(n=>row(n+'传习','先看经办人，再看要做何事',btn('查看传习','training-route',n))).join('')}</div>`;
 if(key==='crafting')return craftPage();
 if(key==='arrays')return block('一阵有一阵的安放处','野外临阵与居所固定阵分开；场所、用途、供能先说清楚。')+`<label class="shell-field">查看阵法<select id="array-kind"><option>临时攻阵</option><option>居所聚灵阵</option><option>示警阵</option></select></label><div class="shell-actions">${btn('查看放置条件','feedback','已展示放置条件：有使用权的场地、对应材料与供能。')}${btn('试选放置位置','array','院中空地','primary-btn')}</div><div class="shell-empty">${memory.array?'演示选址：'+E(memory.array)+'。尚未部署实际阵法。':'尚未选择演示阵位。'}</div>`;
 if(key==='pets'||key==='puppets'){const pet=key==='pets';return block(pet?'山中有灵，相伴有责':'机关有形，驱动有据',pet?'救助、喂养、训练、养伤与协同分别查看。':'制作、升级、驱动、维修有各自材料和条件。',btn(pet?'查看相伴灵兽':'查看现有傀儡','companion',pet?'pet':'puppet'))+`<div class="shell-empty">${memory[pet?'pet':'puppet']?(pet?'演示灵兽已展开，尚未建立正式灵契。':'演示傀儡已展开，尚未消耗驱动材料。'):(pet?'尚未展开演示灵兽。':'尚未展开演示傀儡。')}</div><div class="shell-actions">${(pet?['喂养说明','训练安排','养伤条件']:['制作条件','升级部件','维修说明']).map(n=>btn(n,'feedback',n+'已展开；正式资源与时间均未变化。')).join('')}</div>`;}
 if(key==='guide')return block('护路三段，先看经办人','初、中、后段护路按既有经历与修为核验；做完须回原处交代。',route('查看演练与实战','cult.battle'))+['初段护路','中段护路','后段护路'].map(n=>row(n,'前序经历与实际护路记录在正式档案核对',btn('看下一步','feedback',n+'的经办人与交代入口已展开，未接任务或发奖励。'))).join('');
 if(key==='battle-record')return block('一战之后，有据可回看','记录己方选择、敌方意图与结果；只展示演练选择，不伪造掉落与胜负。',route('回到演练','cult.battle'))+`<div class="turn-log">${memory.battle.length?memory.battle.map(E).join('<br>'):'尚无本页演练记录。'}</div>`;
 if(key==='study-shop')return block('传习抄本，先问来处','先看经办人、所需条件与书中内容，实际购买与阅读分别发生。',route('看十方传习','cult.routes'))+row('引气篇','翻阅同一册书，不因多入口复制物品',btn('查看抄本','item','manual'))+row('养锋诀抄本','地点与取得条件由正式传习确认',btn('问经办人','person','liu'));
 if(key==='supplies')return block('百艺物资，各有用处','纸墨、矿材与机关部件分开找，供货与现金在正式商店结算。')+`<label class="shell-field">物资分类<select id="supplies-filter"><option>纸墨符材</option><option>阵具矿材</option><option>傀儡部件</option></select></label>`+row('赤铁砂','查看材料的共同说明',btn('查看','item','ore'))+row('随身工具','已有工具须在安全场所部署',route('看工位与工具','travel.workshop'));
 return '';
}
function craftRows(kind){const d={炼丹:['聚气散','查看丹药用途与药材条件','pill'],炼器:['青钢短剑','查看器物用途与矿材条件','sword'],符箓:['护身符','纸墨、符样与工位须正式核验',null],阵具:['聚灵阵基','场地、阵材与供能须正式核验','ore'],傀儡部件:['木傀部件','器谱、灵木与驱动条件须正式核验','ore']}[kind];return row(d[0],d[1],d[2]?btn('查看关联物品','item',d[2]):btn('查看条件','feedback','已选符箓材料与工艺条件，正式角色未开工。'));}
function craftPage(){return block('炉边百艺，先识其方','看工艺、工位、材料与成品用途。此处只选取演示，不另做一套生产结算。',route('物品与材料','bag.materials'))+`<label class="shell-field">工艺分类<select id="craft-filter"><option>炼丹</option><option>炼器</option><option>符箓</option><option>阵具</option><option>傀儡部件</option></select></label><div id="craft-results">${row('聚气散','所需：配方、丹炉、药材；示例材料不足',btn('查看材料','item','herb'))}${row('青钢短剑','所需：器谱、可用工位、矿材',btn('查看成品','item','sword'))}</div><div class="shell-actions">${btn('查看开工确认','feedback','开工确认已展示。未扣耗材、未推进时间、未生成成品。','primary-btn')}</div>`;}

function travelPage(key){
 if(key==='map')return block('山河有界，行路有凭','只标示已经存在的地域。点地点查看信息，不在样板新增连线或瞬移。',route('天下地志','travel.geography'))+`<div class="route-map" aria-label="现有地域示意，无新道路">${[['青石县',20,54],['青云观',48,25],['云安府',68,60],['白水渡',50,76]].map(([n,x,y])=>`<button class="map-dot" style="left:${x}%;top:${y}%" data-shell="map-place" data-id="${n}">${n}</button>`).join('')}</div>`;
 if(key==='geography')return block('天下地志','九州与诸国各有疆域；修士分布与可达地图是不同的信息层。')+`<div class="shell-actions">${['九州','诸国','修士分布'].map(n=>btn(n,'geography',n)).join('')}</div><div id="geography-text" class="shell-empty">已登记：青州、云安府、青石县。其余区域资料在正式地志中核对，不由样板补造。</div>`;
 if(key==='quests')return block('约定要落到具体地方','从已接事项看下一步、发生地点和经办人，履约后还须当面交代。',btn('查看旧约回执','legacy-detail','track','primary-btn'))+row('旧约回执','下一步：商街，向王掌柜问凭据',btn('查看经办人','person','wang'))+row('童年留下的引荐','示例：已做完实际行动，待回原处交代',btn('查看交代入口','feedback','已选当面交代入口。正式任务状态与奖励未改变。'))+`<div class="shell-empty">空态示例：没有新约定时，显示可寻访的人与地点，不凭空生成奖励。</div>`;
 if(key==='events')return block('见闻随行，不必赶完','从这里查看仍待处理的事，也可在界面总览试看片段状态。',route('事件抉择样例','state.event'))+row('街口的旧信','待问来处',route('展开事件','state.event'))+row('已经交代的旧事','保留结果，不再显示领取奖励',route('看已结记录','self.history'));
 if(key==='trade')return block('各去各的柜前','药材、丹药与器物由具体人物经营。相同物品复用行囊中的说明入口。')+['wang','liu','shi'].map(id=>row(people[id].name,people[id].role,btn('当面查看','person',id))).join('');
 if(key==='auction'||key==='auction-hall'){const hall=key==='auction-hall';return block(hall?'云安会场，候会有期':'县中小拍，逐口竞价',hall?'柜台寄拍、凭据、候场、取回与款项各有回程。':'先看拍品与最低加价，押款、落槌与离场由正式钱物结算保护。')+`<div class="shell-actions">${(hall?['候场说明','寄拍凭据','取回物品','领取款项','提前离场']:['看拍品','报价确认','等候一口','旁观说明','正式离场']).map(n=>btn(n,'auction',n)).join('')}</div>${row('本场陈列 · 青钢短剑','拍品说明与其他物品入口复用',btn('验看物品','item','sword'))}<div id="auction-notice" class="shell-empty">尚未选择演示流程；不生成拍品、押款或成交。</div>`;}
 if(key==='recruit'||key==='property-offers')return block(key==='recruit'?'牙行问人，先谈所求':'牙行看契，先知权属',key==='recruit'?'报价与招募条件沿用正式代码；这里只查看具体人物。':'租住、产权与住处权限分开看，不在样板新定价格。')+(key==='recruit'?['lin','han','qiao'].map(id=>row(people[id].name,people[id].motive,btn('查看其人','staff',id))).join(''):['租住小院','购买宅院','洞府条件'].map(n=>row(n,'正式条件与费用待真实档案计算',btn('查看契据','feedback',n+'说明已展开，未签约或扣款。'))).join(''));
 if(key==='workshop')return block('炉位、工具与师傅','公用炉位、随身工具和当面学方是不同入口，各有真实场所条件。')+['租用公共炉位','部署随身工具','向丹师学习配方'].map(n=>row(n,'先核对所在场所与所需物品',btn('查看条件','feedback',n+'条件已展开；未付费、未消耗工具。'))).join('');
 if(key==='medicine-news')return block('药讯与铺中账簿','药铺自己的账，不是玩家自身收支。供药、垫款、赠资与债权分别确认。',btn('看看王掌柜','person','wang'))+['供药约定','垫款凭据','赠资说明','债权领取','经营者接续'].map(n=>row(n,n==='经营者接续'?'现经营者、往来凭据与接续资格须真实核对':'先看交易对象与实际凭据',btn('查看事项','feedback',n+'的凭据与后果说明已选中，未划转第三方或玩家钱物。'))).join('');
 return craftPage();
}
function residencePage(){return block('家有来处，物各有主','出身门厅、个人居室、公用物柜与旧物分别看权限；租期变化不抹去存物。')+['门厅往来','个人居室','公用物柜','家中旧物','到期取物'].map(n=>row(n,n==='到期取物'?'到期后的取物与使用权限应分别解释':'需核对实际居住与物品权限',btn('查看权限','feedback',n+'权限示例已展开，未移动物品。'))).join('');}
function estatePage(key){
 if(key==='residence')return residencePage();
 if(key==='warehouse')return block('入仓有来处，出仓有去处','仓房与随身行囊分开。演示只切换清单，不搬动实际物品。',btn(memory.warehouse?'看随身物品':'看仓内物品','warehouse'))+row(memory.warehouse?'青叶草 · 仓房示例':'赤铁砂 · 随身示例','查看物品，再预览存取确认',btn('查看','item',memory.warehouse?'herb':'ore'))+`<div class="shell-actions">${btn('预览存入','feedback','存入确认已展示；物品数量未改变。')}${btn('预览取出','feedback','取出确认已展示；物品数量未改变。')}</div>`;
 if(key==='facilities')return courtyard()+['器室','丹房','药圃'].map(n=>row(n,'查看设施用途、使用权和建设条件',btn('查看设施','legacy-property',n==='器室'?'forge':n==='药圃'?'garden':'hall'))).join('')+route('公用炉位与随身工具','travel.workshop');
 if(key==='property')return block('契据在手，也要看权限','自有、租住与公产使用权分别展示。续租不会在样板实际扣费。',route('到牙行看契','travel.property-offers'))+row('河畔小院','产业契据示例 · 当前由'+state.owner+'当家',route('查看院落','estate.home'))+row('租期与续租','条件示例：到期应解释权限变化',btn('看续租确认','feedback','续租确认已展开，尚未变更契据或费用。'));
 return block('培养是具体相助','传授、指导、场地与资源逐件商谈，仍是待审设计，不在普通导航伪装已开放玩法。',btn('看林修的草稿入口','staff','lin'));
}

function selfPage(key){
 if(key==='profile')return block('此身与来处','沈行舟 · 演示角色。出生、测灵、引气分开记，不以固定年龄替代经历。')+`<dl class="kv"><dt>现居</dt><dd>青石县 · 示例定位</dd><dt>所学</dt><dd>乡野吐纳诀</dd><dt>境界</dt><dd>炼气 · 演示档案</dd></dl><div class="shell-actions">${route('看看所修法门','cult.arts')}${route('翻看生平','self.history')}${route('查看关系','self.relations')}</div>`;
 if(key==='relations')return block('相识，才能有后来的事','共同经历与具体人物相连。先看近况，再谈结侣、同行或师承。')+['wang','liu','lin','han'].map(id=>row(people[id].name,people[id].role,btn('查看故人','person',id))).join('')+`<div class="shell-actions">${['结侣','解侣','结义','同行','拜师','生育计划'].map(n=>btn(n,'relation',n)).join('')}</div><div class="shell-empty" id="relation-state">${E(memory.relation)}</div>`;
 if(key==='sect')return block('山门有门规，同门有往来','差事、考核、藏经与贡献分别找到入口。样板不凭按钮增加贡献。')+['本门差事','藏经兑换','内门考核','师承来处'].map(n=>row(n,'条件与经办人在正式角色中核定',btn('查看','feedback',n+'入口已展开，未发生正式结算。'))).join('')+route('寻访传习','cult.routes');
 if(key==='lineage'||key==='inherit')return block(key==='lineage'?'一脉来处':'后人接续，也有自身来处','只呈现已有登记后人。缺失年龄、关系或资格时说明原因，不生成替代后人。')+`<div class="shell-tree"><span>沈行舟</span><span aria-hidden="true">→</span><span>沈承行<br><small>演示后人</small></span></div><div class="shell-actions">${route('查看独立传承状态','state.inheritance')}${btn('查看未知年龄空态','feedback','年龄未核定：正式版需先核实，不能绕过继承资格。')}</div>`;
 if(key==='history')return block('这一程，留在往事里','生平记录、共同经历与已结事件可互相寻到来处。')+`<ol class="timeline"><li class="current">走进青石县<small>场景与人物往来</small></li><li>一纸旧约<small>已做与待交代分别记录</small></li><li>童年引荐<small>出生、测灵与引气是不同经历</small></li></ol>${btn('查看共同经历','person','wang')}`;
 if(key==='ledger')return block('有收有支，有据可查','凡钱与灵石分账，正式流水来自真实交易。这里只切换演示视图。')+`<div class="shell-actions">${['灵石','凡钱','待结权益'].map(n=>btn(n,'ledger',n)).join('')}</div><div id="ledger-view">${row('柜前问物','尚未发生正式交易')}${row('样板卷宗','仅内存操作，不记入角色账目')}</div>`;
 if(key==='saves')return block('卷宗留在这一页','演示卷只放在内存，刷新即清空。不能导入、覆盖或读取玩家正常存档。')+['一','二','三'].map(n=>row('演示卷 '+n,memory.saves[n]?'已记下本页演示位置：'+memory.saves[n]:'空卷',btn('记下','save-demo',n)+btn('查看','load-demo',n,'plain-btn',!memory.saves[n])+btn('清空','clear-demo',n,'plain-btn',!memory.saves[n]))).join('');
 if(key==='settings')return block('读得舒服，也走得顺手','字号与疏密在样板即时生效，不写入浏览器设置或角色档案。')+`<label class="shell-field">阅读字号<select id="shell-font"><option value="normal" ${memory.font==='normal'?'selected':''}>标准</option><option value="large" ${memory.font==='large'?'selected':''}>较大</option></select></label><label class="shell-check"><input id="shell-compact" type="checkbox" ${memory.compact?'checked':''}> 紧凑排列名册与清单</label><label class="shell-check"><input id="shell-motion" type="checkbox"> 减少详情层动画</label><div class="shell-empty">读一段山水：山雨初歇，檐下的灯慢慢亮起。故人仍有话要说。</div>`;
 return block('修行见闻，按所需查','搜索玩法入口，先找到发生的场景和经办人。已存在、部分接入与待审内容在界面总览分开标注。')+`<label class="search"><span>⌕</span><input id="help-search" aria-label="搜索帮助" placeholder="试试：存档、拍卖、功法"></label><div id="help-results">${['cult.arts','travel.auction','self.saves','estate.staff'].map(id=>row(R.byId[id].title,'从帮助跳转后可返回来源',route('查看入口',id))).join('')}</div>`;
}

function supplementalState(key){
 if(key==='developer')return block('开发查看，与玩家权限分开','这里列出本样板的路由与状态。正式开发者查看可无角色浏览已登记实体，特权测试局另用独立存档键。',btn('回界面总览','overview','','primary-btn'))+row('实体总览','演示查看范围，不向正常角色发资源',btn('查看登记范围','feedback','这里展示登记范围；没有创建测试局或修改正常角色。'))+row('独立测试局','仅展示入口边界，不在样板启动真实测试局',btn('查看隔离说明','feedback','正式开发测试应使用独立上下文和独立自动/手动键。本样板不访问任何存储。'));
 if(key==='blocked')return `<section class="shell-event"><span class="shell-label">阻断状态示例</span><h2>这一步，先停一停</h2><p>迁移备份无法写入，原角色与原档应保留。条件不足、权限不足与存储故障需分别说明。</p><div class="shell-actions">${btn('看条件不足','feedback','条件不足：当前阶段尚未完成，说明具体缺项。')}${btn('看权限不足','feedback','权限不足：可查看，不可取用他人物品。')}${btn('退出演示，回总览','overview','','primary-btn')}</div></section>`;
 if(key==='journey'){memory.onRoad=true;return `<section class="shell-event"><span class="shell-label">旅行途中示例</span><h2>江风入道，行程未尽</h2><p>目的地、已行与余下路程由原世界钟记录。途中事件处理完，结果页应回到仍在进行的旅行。</p><div class="shell-actions">${route('看看途中事件','state.event','primary-btn')}${route('返回出发地图','travel.map')}${btn('退出状态演示','overview')}</div></section>`;}
 if(key==='result')return `<section class="shell-event"><span class="shell-label">行动结果示例</span><h2>这一事，已有回音</h2><p>${E(memory.eventChoice||'此处展示动作后果、实际所得与下一步；尚未作出片段选择。')}</p><div class="shell-actions">${route(memory.onRoad?'继续尚未完成的旅程':'回到事件来源',memory.onRoad?'state.journey':'state.event','primary-btn')}${btn('退出演示，回总览','overview')}</div></section>`;
 return null;
}
function statePage(key){
 const extra=supplementalState(key);if(extra)return extra;
 const body={
 title:['仙途','山河依旧，且行此生。',route('查看续缘界面','state.continue','primary-btn')+route('看开局成长','state.birth')],
 continue:['卷中旧缘','演示卷没有玩家角色。先看续缘条件，再决定返回首页。',route('回首页','state.title')+btn('查看空卷提示','feedback','没有本页演示卷，不能读取正常浏览器存档。')],
 birth:['从出生说起','出生家庭、籍贯与族属一并记录。这不是职业选择，也不直接选择测灵年龄。',route('进入童年片段','state.childhood','primary-btn')],
 childhood:['檐下初长','以关键经历推动成长。选择只展示分支说明，不替正式角色生成资质。',btn('帮家里照料药圃','state-choice','记下了药圃经历，可继续看测灵触发片段。')+route('查看测灵片段','state.measure')],
 measure:['遇见测灵的机会','家庭条件、当地机会与成长路线触发查验；不是统一年龄的按钮。',route('看引气入门','state.entry','primary-btn')],
 entry:['一息入道','授法、安置、引气各有来处。引气时间仍由已经确认的正式规则核算。',route('看看修行行程','cult.practice','primary-btn')],
 event:['街口来信','一封旧信交到你手中。你愿先问问来处，还是留待下次？',btn('当面问来处','state-choice','选择已记在演示结果中，不改变正式事件。','primary-btn')+btn('暂且收好','state-choice','选择暂存，正式背包没有新增物品。')+route('看结果界面','state.result')],
 death:['此生暂止','所留的是一段经历与已有家业。没有合格后人时，应明确不能凭空生成。',route('看看后人接续','state.inheritance','primary-btn')+route('翻看生平','self.history')],
 inheritance:['旧灯新续','后人有自己的年龄与境界。产业约定与私人追随应分别交代，不一律重签。',route('看家业回应','estate.staff','primary-btn')+btn('查看无后人空态','feedback','暂无已登记且资格可确认的后人；此处不生成替代人物。')],
 difficulty:['选择本局方式','大众与硬核的正式差异仍以已实现规则为准；此处只展示选择、说明与锁定状态。',btn('选择大众示例','mode','大众')+btn('选择硬核示例','mode','硬核')]
 }[key];
 return `<section class="shell-event"><span class="shell-label">独立界面状态 · 非玩家一级导航</span><h2>${body[0]}</h2><p>${body[1]}</p><div class="shell-choices">${body[2]}</div><p class="shell-note">这里只检查界面与回程，未创建角色、读档或推进正式剧情。</p></section>`;
}

function overview(){return `<div class="route-heading"><div class="eyebrow">DEVELOPER ROUTE ATLAS</div><h1>界面总览</h1><p>开发用页面树。下列状态描述原玩法实现边界；本样板全部仍是内存演示，未接正式规则。普通导航、共用详情与非普通状态分开，入口均返回来源。</p></div><div class="shell-actions">${btn('← 回到刚才界面','overview-back','','primary-btn')}</div>${Object.entries(R.groups).map(([g,title])=>`<section class="shell-overview-group"><h2>${title}</h2><div class="shell-route-chips">${R.routes.filter(r=>r.group===g).map(r=>btn(r.title,'route',r.id)).join('')}</div><details><summary>入口来源与实现边界</summary><table class="shell-route-table"><thead><tr><th>唯一路由</th><th>原功能边界</th><th>正式入口</th><th>返回</th></tr></thead><tbody>${R.routes.filter(r=>r.group===g).map(r=>`<tr><td><code>${r.path}</code></td><td>${statusNames[r.status]||r.status}</td><td>${E(r.source)}</td><td>${E(r.back)}</td></tr>`).join('')}</tbody></table></details></section>`).join('')}`;}
function customPage(r){const key=r.id.split('.')[1];if(r.group==='state')return statePage(key);if(r.group==='travel')return travelPage(key);if(r.group==='cult')return cultivation(key);if(r.group==='bag')return inventoryPage(key);if(r.group==='estate')return estatePage(key);return selfPage(key);}

render=function(){
 const r=routeInfo();
 if(current==='travel.scene'||current==='estate.staff'||current==='estate.home'){base.render();$('#page').insertAdjacentHTML('afterbegin',subnav(r.group)+`<div class="shell-breadcrumb">${btn('← 返回来源','back','','text-btn')}</div>`);}
 else{$('#page').innerHTML=current==='overview'?overview():subnav(r.group)+headingFor(r,'界面与操作样板，沿已有玩法寻找入口。')+customPage(r)+'<div class="shell-result-note" id="shell-feedback" role="status" hidden></div>';renderDetail();}
 document.querySelectorAll('[data-nav]').forEach(b=>{const active=b.dataset.nav===(r?.group||state.page);b.classList.toggle('active',active);b.setAttribute('aria-current',active?'page':'false');});
 if(r)$('#crumb').textContent=(R.groups[r.group]||'独立状态')+' · '+r.title;
 document.body.classList.toggle('shell-compact',memory.compact);document.body.classList.toggle('shell-large',memory.font==='large');
};
navigate=function(group){go(lastGroup[group]||R.defaults[group]||'travel.scene');};
renderDetail=function(){
 if(state.detail==='person'&&['lin','han','qiao'].includes(state.person)){$('#detail-content').innerHTML=detailHead('故 人 往 来')+staffDetail()+`<div class="detail-actions"><button class="plain-btn" data-action="talk">${people[state.person].topic}</button></div>`;return;}
 base.renderDetail();
 if(state.detail==='location'&&current!=='travel.scene'&&!current.startsWith('estate.')){const r=routeInfo();$('#detail-content').innerHTML=detailHead('此 页 来 处')+`<div class="eyebrow">THE NEXT STEP</div><h2>${r?.title||'界面总览'}</h2><p class="sub">${R.groups[r?.group]||'开发导航'} · 演示卷</p><div class="detail-art"><span class="seal">行<br>路</span></div><p class="intro-copy">从具体事情找到入口，也能沿来处返回。这里的操作只保留本页演示状态。</p><div class="detail-actions">${btn('返回来源','back')}${btn('查看全部界面','overview')}</div>`;}
};
openDetail=function(type,person){if(type!=='item')itemContext=null;if(type==='item'&&!itemContext){const n=offers[state.person]?.item;itemContext={id:n==='青钢短剑'?'sword':n==='聚气散'?'pill':'herb',back:'shop'};}detailOrigin={route:current,type};base.openDetail(type,person);$('#details').dataset.route='detail.'+type;};
closeDetail=function(){itemContext=null;detailOrigin=null;base.closeDetail();delete $('#details').dataset.route;};
itemDetail=function(){
 if(itemContext?.back==='shop'&&offers[state.person]?.route)return base.itemDetail();
 const c=itemContext||{id:'herb',back:'shop'},it=itemData[c.id]||itemData.herb;
 return `${c.back==='shop'?'<button class="back-btn" data-action="shop">← 返回柜前</button>':btn('← 返回'+(R.byId[current]?.title||'来源'),'detail-close','','back-btn')}<div class="eyebrow">ITEM RECORD</div><h2>${it.name}</h2><p class="sub">${it.type} · 演示说明</p><p class="dialogue">${it.desc}</p><p>从柜前、行囊或仓房进入，查看同一份物品说明。正式用途、库存与结算沿原有规则。</p><div class="detail-actions">${btn(it.action,'item-action',c.id,'primary-btn')}${route('查看相关制作','cult.crafting')}</div><div id="item-action-note" class="saved-note" hidden></div>`;
};
function openItem(id){itemContext={id,back:'source'};openDetail('item');}
function openRegisteredDetail(id){const type=id.split('.')[1];if(type==='item')openItem('herb');else if(type==='person'||type==='talk'||type==='shop'){state.person='wang';openDetail(type,'wang');}else if(type==='staff'||type==='proposal'){state.person='lin';openDetail(type,'lin');}else if(type==='property'){state.property='hall';openDetail('property');}else openDetail(type);}

document.addEventListener('click',event=>{
 const b=event.target.closest('[data-shell]');if(!b||b.disabled)return;event.preventDefault();event.stopImmediatePropagation();const a=b.dataset.shell,id=b.dataset.id;
 if(a==='route')go(id);
 else if(a==='back')back();else if(a==='overview')go('overview');else if(a==='overview-back')go(overviewOrigin,false);else if(a==='detail-close')closeDetail();
 else if(a==='feedback')report(id);else if(a==='toggle'){const el=document.getElementById(id);el.hidden=!el.hidden;}
 else if(a==='item')openItem(id);else if(a==='person')openDetail('person',id);else if(a==='staff')openDetail('staff',id);else if(a==='legacy-detail')openDetail(id);else if(a==='legacy-property'){state.property=id;openDetail('property');}
 else if(a==='item-action'){const it=itemData[id];if(id==='sword')memory.equipped=id;if(id==='manual')memory.read.add(id);const el=document.getElementById('item-action-note');el.hidden=false;el.textContent=it.verb;}
 else if(a==='manual')report(id+'说明已选中，可在配功页继续试选。');
 else if(a==='battle'){memory.battle.push('演示选择：'+id+'。未产生真实伤害或收益。');$('#battle-log').textContent=memory.battle.join('\n');}
 else if(a==='training-route')report(id+'传习：查看经办人、前序经历与所需实物。尚未接取正式任务。');
 else if(a==='array'){memory.array=id;render();}else if(a==='companion'){memory[id]=true;render();}
 else if(a==='map-place'){report(id+'已选中；请核对目的地条件和真实路程。');document.querySelectorAll('.map-dot').forEach(n=>n.classList.toggle('active',n.dataset.id===id));}
 else if(a==='geography')$('#geography-text').textContent=id+'资料层已展开。只读取登记范围，不新增地域或人口数值。';
 else if(a==='auction')$('#auction-notice').textContent='已选“'+id+'”流程，展示对应确认与返回，不产生钱物。';
 else if(a==='warehouse'){memory.warehouse=!memory.warehouse;render();}
 else if(a==='relation'){memory.relation='拟查看：'+id+'。须当面、本人意愿与资格可确认；此处不建立正式关系。';$('#relation-state').textContent=memory.relation;}
 else if(a==='ledger')$('#ledger-view').innerHTML=row(id+'账目','当前是演示空账，无正式收支记录');
 else if(a==='save-demo'){memory.saves[id]=current;render();report('已记入本页内存演示卷，刷新即清空。');}
 else if(a==='load-demo')report('已查看演示卷：'+memory.saves[id]+'。没有读取玩家存档。');else if(a==='clear-demo'){delete memory.saves[id];render();}
 else if(a==='state-choice'){memory.eventChoice=id;report(id);}else if(a==='mode'){memory.mode=id;report('已选'+id+'界面示例，未锁定或修改正式角色。');}
},true);
document.addEventListener('click',event=>{const b=event.target.closest('[data-action="home-tab"],[data-action="go-staff"],[data-action="find-wang"]');if(!b)return;event.preventDefault();event.stopImmediatePropagation();if(b.dataset.action==='home-tab')go(b.dataset.tab==='staff'?'estate.staff':'estate.home');else if(b.dataset.action==='go-staff')go('estate.staff');else{go('travel.scene');state.scene='street';render();openDetail('person','wang');}},true);
document.addEventListener('input',e=>{
 if(e.target.id==='bag-search'){const q=e.target.value;document.querySelectorAll('#bag-results .shell-row').forEach(el=>el.hidden=!el.textContent.includes(q));}
 else if(e.target.id==='help-search'){const q=e.target.value;$('#help-results').innerHTML=R.routes.filter(r=>r.kind==='view'&&r.status!=='planned'&&r.title.includes(q)).map(r=>row(r.title,R.groups[r.group],route('查看入口',r.id))).join('')||'<p class="shell-empty">尚未找到，可换个词试试。</p>';}
});
document.addEventListener('change',e=>{
 if(e.target.id==='craft-filter')$('#craft-results').innerHTML=craftRows(e.target.value);
 if(e.target.id==='shell-font'){memory.font=e.target.value;document.body.classList.toggle('shell-large',memory.font==='large');}
 if(e.target.id==='shell-compact'){memory.compact=e.target.checked;document.body.classList.toggle('shell-compact',memory.compact);}
 if(e.target.id==='shell-motion')document.body.classList.toggle('shell-no-motion',e.target.checked);
});
window.XTUIShell={go,back,get route(){return current;},get currentRoute(){return detailOrigin?'detail.'+state.detail:current;},registry:R,get memory(){return memory;}};
installNav();render();
})();
