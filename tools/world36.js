/* 世界设定校准、稳定人物与有经历的关系。关系不创建匿名对象。 */
(()=>{
'use strict';
const S=XTSandbox,V=S.view;
const base={beginCultivation,chooseChild,newGame,restore,renderScene,worldTick,advanceDays,arriveAt,startEvent,applyOption,openInherit,placeName,die,rel,pendingRel};
const YEAR=CFG.monthsPerYear*CFG.daysPerMonth,EPOCH=CFG.eraStart*YEAR;
const html=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const B=(label,action,arg='',disabled=false)=>`<button class="sb-btn" data-sb="${action}" data-arg="${html(arg)}" ${disabled?'disabled':''}>${label}</button>`;
const C=(title,text,buttons='')=>`<article class="sb-card"><h4>${html(title)}</h4><p>${text}</p><div class="sb-buttons">${buttons}</div></article>`;
const log=t=>{addLog(t,'mute');const d=S.state();d.news.unshift({at:S.now(),text:t});d.news=d.news.slice(0,40);};
const starts={
 '寒门散修':{book:'乡野吐纳诀',place:'village',room:'square',method:'游方修士留下的入门口诀，经乡人抄传，足以引气，后续篇章仍需寻访。',absorb:.02,tag:'薄册入道，乡野求师'},
 '宗门外门弟子':{book:'青云入门诀',place:'temple',room:'hall',method:'测灵后由观中监院玄诚正式授予，先学调息和守一。',absorb:.04,tag:'观中授法，同门起步'},
 '没落家族子弟':{book:'家传养元篇',place:'county',room:'square',method:'旧藏与长辈口传补成的基础养元法，完整高阶传承仍然缺失。',absorb:.03,tag:'残卷续脉，旧宅起步'},
 '世家嫡系':{book:'宗族培元诀',place:'county',room:'square',method:'族中蒙学使用的基础传承，不等于可以随意支用整个家族的产业。',absorb:.04,tag:'宗族教习，责任随身'},
 '妖血遗孤':{book:'藏息养脉法',place:'ridge',room:'square',method:'养育者教下的调息法，依自身血脉修习，不凭空获得完整妖族传承。',absorb:.03,tag:'血脉异禀，藏息求生'},
 '魔道弃徒':{book:'残页纳气法',place:'market',room:'square',method:'逃离血河道统凡界别院时记下的基础纳气口诀，不含夺人修为的秘法。',absorb:.03,tag:'残页护身，旧师门未远'}
};
for(const v of Object.values(starts))MANUALS[v.book]={kind:'心法',tier:'黄',from:v.method,desc:v.method,effect:{absorb:v.absorb,bt:0,life:0}};
MANUALS['太岳养气诀']={kind:'心法',tier:'玄',from:'太岳宗外山藏经处',desc:'太岳外山传授的养气法，外山弟子修习的基础传承。',effect:{absorb:.06,bt:.01,life:2}};
MANUALS['厚土护身诀']={kind:'术法',tier:'玄',from:'太岳宗内门',desc:'借厚土之意稳固护身。',effect:{route:'护'}};
for(const [key,v]of Object.entries(starts))ORIGINS[key].tag=v.tag;
const specNPCs=NPCS.map(n=>({...n}));
const aliases={N02:'mentor',N08:'grocer',N16:'elder'};
const npcKey=id=>aliases[id]||id;
const actorSpecs={
 grocer:{realm:0,layer:9,age:58,life:100,root:'五灵根',sex:'男',name:'王掌柜',goal:'收购草药供给本地药铺',need:'herb'},
 smith:{realm:-1,age:46,life:70,root:'无灵根',sex:'男',goal:'维持铁器铺与修缮生意',need:'ironOre'},
 dan:{realm:0,layer:9,age:55,life:100,root:'四灵根',sex:'女',goal:'寻找稳定的草药供应',need:'herb'},
 broker:{realm:-1,age:42,life:70,root:'无灵根',sex:'男',goal:'撮合有信誉的雇主与人手',need:'herb'},
 prefect:{realm:1,layer:1,age:93,life:200,root:'四灵根',sex:'男',goal:'替分号经营商路，不在城中长期苦修',need:'ironOre'},
 ferry:{realm:0,layer:7,age:49,life:100,root:'五灵根',sex:'男',goal:'收购船队需要的药草',need:'herb'},
 stall:{realm:0,layer:5,age:38,life:100,root:'五灵根',sex:'男',goal:'寻觅可靠的散修货源',need:'ironOre'},
 sunset:{realm:1,layer:2,age:121,life:200,root:'三灵根',sex:'女',goal:'打理商会在坊市的货物',need:'ironOre'},
 mentor:{realm:1,layer:2,age:131,life:200,root:'四灵根',sex:'男',name:'玄诚',goal:'维持青云观的灵田和日常秩序',need:'herb'},
 taiyue:{realm:1,layer:3,age:142,life:200,root:'三灵根',sex:'男',goal:'处理外山差事，真正的高阶修士另居灵脉',need:'ironOre'},
 elder:{realm:-1,age:61,life:70,root:'无灵根',sex:'男',goal:'照看村里晚辈',need:'herb'}
};
const placeRules={
 village:{label:'乡村',qi:'1.0–1.2',usual:'凡人为主，炼气修士零散出现',upper:'筑基多为访客、隐居者或乡间灵地住客'},
 county:{label:'县城',qi:'0.6–0.9',usual:'凡人为主，炼气交易与谋生；少数筑基供奉、族人',upper:'结丹不作街头常驻人物；来访须有明确缘由'},
 market:{label:'县级坊市',qi:'0.6–0.9',usual:'炼气为主，筑基偶来交易',upper:'高阶修士短期来访，不等于坊市能供其长期修炼'},
 temple:{label:'县观／下院',qi:'1.6–2.0',usual:'炼气弟子，筑基主持和监院',upper:'结丹上院来人应是重要事件'},
 ridge:{label:'乡间山林',qi:'1.0–1.2',usual:'采药者、低阶散修，筑基可能在隐蔽据点停留',upper:'不能把筑基头领当成所有劫修的默认境界'},
 cliff:{label:'优质荒野灵地',qi:'约2.0',usual:'炼气采药者和少量筑基散修',upper:'浓度达到结丹门槛不代表有安全、稳定的结丹洞府'},
 prefecture:{label:'府城',qi:'0.6–0.9',usual:'炼气和筑基交易、任职、处理家族事务',upper:'结丹可因商路或势力事务来访，不长期坐街修炼'},
 riverTown:{label:'渡口镇',qi:'0.6–1.0',usual:'凡人船户、炼气行商，少量筑基过客',upper:'高阶修士不作为普通船工或廉价劳力'},
 spiritMarket:{label:'区域坊市',qi:'0.6–0.9',usual:'炼气与筑基经营，结丹作为顾客或势力代表',upper:'坊市之外的灵脉与城内交易场要分开'},
 taiyueSect:{label:'灵脉宗门外山',qi:'2.0以上',usual:'外山多炼气、筑基；结丹应在内院或主要灵脉',upper:'主事结丹属于势力关键人物，不能批量填满外山'},
 mistSecret:{label:'古修遗址',qi:'3.4（现有数据）',usual:'进入者由危险、禁制与开放期决定',upper:'元婴可短期探索，不可据此声称这里满足元婴修炼门槛5'}
};
const stat=realm=>realm<0?'凡人':REALM_NAMES[realm];
function world(){
 if(!G)return null;
 if(G.fate)G.fate['观']=G.birthContext?.places?.temple||'青云观';
 const d=S.state();
 if(!G.world36){
  const w=G.world36={version:1,people:{},relations:{},partnerId:null,followers:[],children:[],contracts:[],nextChild:1,playerId:'P'+G.generation+'_'+G.name,knownAt:S.now(),startGranted:false};
  for(const [id,a]of Object.entries(S.actors)){
   if(!actorSpecs[id])continue;const n={...a,...actorSpecs[id]};w.people[id]={...n,id,birth:EPOCH-n.age*YEAR,source:'已有店铺与执事',place:a.place,room:a.room,alive:true};
  }
  for(const n of specNPCs){
   const id=npcKey(n.id),realm=n.realm==='凡人'?-1:REALM_NAMES.indexOf(n.realm);
   const layer=n.layer||({'初':1,'中':2,'后':3,'圆满':4}[n.stage]||1);
   const room=n.place==='temple'?'hall':n.place==='ridge'?(n.id==='N14'?'hunt':'wild'):n.place==='cliff'?'wild':n.place==='market'?'shops':n.place==='county'?(n.id==='N08'?'shops':'square'):'square';
   w.people[id]={...w.people[id],id,legacyId:n.id,name:fillFate(n.name),role:n.title,realm,layer,root:n.root,birth:EPOCH-n.age*YEAR,life:n.life,place:n.place,room,faction:n.place==='temple'?'temple':null,sex:['N04','N09','N13','N17','N18'].includes(n.id)?'女':'男',goal:n.id==='N05'?'担心修炼太慢，想找到适合自己的修行方法':n.want,need:'herb',source:'原人物设定',alive:true,canTravel:['N03','N04','N15','N18'].includes(n.id)};
  }
  for(const [id,r]of Object.entries({an:{name:'阿安',realm:-1,life:70,sex:'男'},qiao:{name:'巧娘',realm:-1,life:70,sex:'女'},lin:{name:'林修',realm:0,life:100,sex:'男'},han:{name:'韩铸',realm:0,life:100,sex:'男'}})){
   w.people[id]={...r,id,root:r.realm<0?'无灵根':'五灵根',layer:4,birth:d.roster[id]?.born??EPOCH-20*YEAR,place:'county',room:'agency',source:'牙行招募名册',role:'求职者',goal:'寻找可靠的雇主',need:'herb',alive:true};
   d.roster[id]=d.roster[id]||{born:w.people[id].birth};
  }
  for(const [id,name,layer,years]of [['ridge_shi','石二',5,32],['ridge_luo','罗六',4,29]])w.people[id]={id,name,role:'山中散修',realm:0,layer,root:'五灵根',birth:EPOCH-years*YEAR,life:100,place:'ridge',room:'hunt',sex:'男',source:'山道劫修事件的既有人物组，正式登记',goal:'依附严九在黑风岭谋生',need:'herb',alive:true};
  if(G.hasMate){w.legacyPartner={root:G.mateRoot||null,reason:'旧档只有关系标记，没有可核定的人物ID，保留记录，不捏造配偶。'};G.hasMate=false;G.mateRoot=null;}
  // Existing acquaintances migrate to the same people; no one is created by social actions.
  for(const [id,v]of Object.entries(d.relations||{})){const key=npcKey(id);if(w.people[key])w.relations[key]={trust:Math.min(40,v*4),affinity:Math.min(30,v*3),respect:Math.min(30,v*3),met:S.now(),deeds:[],history:[],cd:{},bonds:[]};}
 }
 return G.world36;
}
function registerFamily(){
 const w=world();
 for(const f of G.family||[]){
  if(!f.alive||!Number.isFinite(f.age))continue;
  const id='family_'+w.playerId+'_'+f.id;
  if(!w.people[id]){
   const realm=f.realm==='凡人'?-1:REALM_NAMES.indexOf(f.realm);
   w.people[id]={id,name:personName(f),role:f.rel||'家人',realm,layer:({'初':1,'中':2,'后':3,'圆满':4}[f.stage]||1),root:'未录',birth:S.now()-f.age*YEAR,life:f.life,sex:f.sex,place:G.home,room:'residence36',source:'开局家人档案',goal:f.want,need:'herb',alive:true};
   w.relations[id]={trust:30,affinity:30,respect:20,met:S.now(),deeds:[],history:[{day:S.now(),text:'开局家人，与你有真实的亲属或养育关系。'}],cd:{},bonds:['亲属']};
  }
 }
}
function age(n){return Math.max(0,Math.floor((S.now()-n.birth)/YEAR));}
function alive(n){return !!n&&n.alive!==false&&(!Number.isFinite(n.birth)||!Number.isFinite(n.life)||age(n)<n.life);}
function get(id){return world()?.people[npcKey(id)];}
function relation(id,create=true){
 const w=world();id=npcKey(id);if(!w.people[id])return null;
 if(!w.relations[id]&&create)w.relations[id]={trust:0,affinity:0,respect:0,met:S.now(),deeds:[],history:[],cd:{},bonds:w.people[id].faction&&w.people[id].faction===S.state().faction?.id?['同门']:[]};
 return w.relations[id]||null;
}
function remember(id,text,deed){const r=relation(id);if(!r)return;r.history.unshift({day:S.now(),text});r.history=r.history.slice(0,24);if(deed&&!r.deeds.includes(deed))r.deeds.push(deed);log(get(id).name+'：'+text);}
function present(id){const n=get(id);return alive(n)&&n.id!==world().playerId&&n.place===G.place&&n.room===S.state().room;}
function sync(){
 if(!G)return;const w=world();registerFamily();
 // Restore an existing employee's recorded birth, never infer a missing age.
 for(const worker of S.state().staff){
  const n=w.people[worker.id];if(!n)continue;
  if(!Number.isFinite(n.birth)&&Number.isFinite(worker.born))n.birth=worker.born;
  if(Number.isFinite(n.birth))worker.born=n.birth;
 }
 for(const [id,n]of Object.entries(w.people)){
  if(n.alive!==false&&Number.isFinite(n.birth)&&Number.isFinite(n.life)&&age(n)>=n.life){n.alive=false;world().followers=w.followers.filter(k=>k!==id);if(w.relations[id])remember(id,'寿元已尽，往事留存。','');}
  const a=S.actors[id];if(!a)S.actors[id]={name:n.name,role:n.role||'当地人',place:n.place,room:n.room};
  Object.assign(S.actors[id],{name:n.name,role:n.role||'当地人',place:n.place,room:n.room});
 }
 const d=S.state();d.staff=d.staff.filter(worker=>alive(w.people[worker.id]));
 for(const id of ['an','qiao','lin','han']){const n=w.people[id];if(!n)continue;d.roster[id]={born:n.birth};const worker=d.staff.find(x=>x.id===id);if(worker){worker.life=n.life;n.place=d.property?.place||n.place;n.room='home';}else{n.place='county';n.room='agency';}Object.assign(S.actors[id],{place:n.place,room:n.room});}
 for(const [old,key]of Object.entries(aliases)){if(S.actors[old])delete S.actors[old];}
 const partner=w.partnerId&&w.people[w.partnerId];
 G.hasMate=alive(partner);G.mateRoot=G.hasMate?partner.root:null;
 // Wage labour pays over actual elapsed days, not on accepting a multi-year sentence.
 for(const c of w.contracts){
  if(c.playerId!==w.playerId)continue;const end=Math.min(S.now(),c.until),days=Math.max(0,end-c.last);
  if(days){stoneAccrue(G,days*c.annual,YEAR,'灵田看护工钱');c.last=end;}
 }
 if(w.birthPlan&&w.birthPlan.due<=S.now()){
  const p=w.people[w.birthPlan.partnerId];
  if(alive(p)){
   const id='child_'+w.playerId+'_'+w.nextChild++,root=rollHeirRoot(G.root,p.root).root||G.root;
   const surname=G.surname||splitName(G.name).surname||'林',childName=surname+pick(GIVEN_NAMES);
   w.people[id]={id,name:childName,sex:Math.random()<.5?'女':'男',realm:-1,root,layer:0,birth:w.birthPlan.due,life:70,place:w.birthPlan.place,room:'square',role:'家中晚辈',goal:'平安长大',alive:true,parents:[w.playerId,p.id],source:'玩家与已登记道侣共同安排的生育'};
   w.children.push(id);remember(p.id,'孩子'+childName+'出生，已登记父母与出生年月。','family');
  }else log('道侣已不在人世，家庭安排终止。');
  w.birthPlan=null;
 }
}
function seedStart(fresh=false){
 const w=world(),s=starts[G.origin];if(!s||w.startGranted)return;
 const deferred=window.XTOpening46?.deferGrant();const d=S.state();if(!deferred){d.books[s.book]=d.books[s.book]||{level:1};G.arts[s.book]=true;if(!d.mind)d.mind=s.book;}
 w.startGranted=true;w.start={origin:G.origin,method:s.book,from:s.method,residence:window.XTHome41?.specs[G.origin]?.name||({ '寒门散修':'乡中旧居','宗门外门弟子':'观中弟子住处','没落家族子弟':'城西家族旧宅','世家嫡系':'宗族大宅','妖血遗孤':'山间藏身处','魔道弃徒':'坊市暂居处'})[G.origin]};
 registerFamily();
 if(fresh){G.place=s.place;G.home=s.place;d.roomAt=s.place;d.room=s.room;}
 if(fresh&&G.origin==='宗门外门弟子'){
  d.faction={id:'temple',name:'青云观',rank:'外门弟子',contribution:0,cd:{}};G.sect={name:'青云观',rank:'外门弟子',contribution:0};
  const r=relation('mentor');r.bonds.push('同门');r.trust=10;
 }
 if(deferred){w.start.grantPending=true;log('身世、家处与亲友已经登记，基础心法尚待正式传授。');}else log('基础心法《'+s.book+'》已入门。'+s.method);
}
function saveRender(){sync();save();render();}
function act(days,kind,fn){
 if(!systemReady())return false;
 closeMainOverlay();const r=advanceDays(days,{act:kind,rate:0,incomeMul:0},{stopOnEvent:true});
 if(r.died){die('寿元耗尽');return false;}if(r.event){startEvent(r.event);return false;}if(r.days<days)return false;
 fn();saveRender();return true;
}
function toastReason(t){toast(t);}
function isKin(id){
 const w=world();if(id.startsWith('family_'))return true;
 const parentsOf=start=>{const out=new Set(),todo=[start];while(todo.length){const key=todo.pop();for(const p of w.people[key]?.parents||[])if(!out.has(p)){out.add(p);todo.push(p);}}return out;};
 const a=parentsOf(w.playerId),b=parentsOf(id);return a.has(id)||b.has(w.playerId)||[...a].some(p=>b.has(p));
}
function bondReasons(id,type){
 const n=get(id),r=relation(id),w=world();if(!n||!r)return '尚不相识。';
 if(!alive(n))return '对方已经不在人世。';
 if(!present(id))return '需要当面提出。';
 if(G.age<18||age(n)<18)return '双方成年后，才能作出这项终身约定。';
 if(isKin(id))return '亲属关系不适用这项约定。';
 if(S.state().staff.some(s=>s.id===id))return '先解除雇佣关系，不能以雇主身份要求私人终身承诺。';
 if(n.partnerId&&n.partnerId!==w.playerId&&alive(get(n.partnerId)))return '对方已有道侣，不能替对方决定另一段关系。';
 if(type==='court'){
  if(w.partnerId&&alive(get(w.partnerId)))return '已有道侣，不能另行追求。';
  if(r.bonds.includes('结义'))return '彼此已有结义关系。';
  if(r.trust<30||r.affinity<25||r.history.length<3)return '还不够了解彼此，先相处并建立信任。';
 }
 if(type==='partner'){
  if(!r.courting)return '尚未互相表明心意。';
  if(w.partnerId&&w.partnerId!==id&&alive(get(w.partnerId)))return '已有道侣。';
  if(S.now()-r.courting<180)return '表明心意后，还需要至少半年相处。';
  if(r.trust<70||r.affinity<60||r.respect<40||r.deeds.length<2)return '信任、相知和共同经历还不足，对方暂不愿作此承诺。';
 }
 if(type==='oath'){
  if(r.courting||r.bonds.includes('道侣'))return '彼此正在发展另一种关系，先把心意说清。';
  if(S.now()-r.met<180||r.trust<60||r.respect<60||r.deeds.length<2)return '结义需要经得起时日的信任、敬重和共同经历。';
 }
 return '';
}
function actorPanel(id){
 const n=get(id);if(!n)return C('未找到人物','这条记录不存在。');
 const r=relation(id,false),a=S.actors[id],view=r?`信任 ${r.trust} · 相知 ${r.affinity} · 敬重 ${r.respect}`:'尚未正式相识';
 let buttons=B('交谈 · 1日','r36:talk',id)+B('互助 · 3日','r36:help',id);
 if(n.realm>=0)buttons+=B(n.realm>realmOf()?'请教修行 · 7日':'论道 · 7日','r36:study',id);
 if(a?.stock)buttons+=B('交易','shop',id);
 if(id==='broker')buttons+=B('看宅院','propertyOffers')+B('招募','recruitOffers');
 if(a?.faction)buttons+=B('山门事务','faction',a.faction);
 if(id==='dan')buttons+=B('请教丹方','learnRecipes','alchemy');if(id==='smith')buttons+=B('请教器谱','learnRecipes','forge');
 if(n.canTravel)buttons+=B('结伴同行','r36:follow',id);
 if(['mentor','N01','taiyue'].includes(id)&&n.realm>realmOf())buttons+=B('拜师','r36:mentor',id);
 if(G.age>=18&&age(n)>=18&&r?.trust>=20&&!isKin(id)&&!r.bonds.includes('道侣')&&!r.bonds.includes('结义'))buttons+=r.courting?B('道侣之约','r36:partner',id):B('表达心意','r36:court',id)+B('结拜','r36:oath',id);
 if(r?.bonds.includes('道侣'))buttons+=B('安排家庭生活','r36:family',id)+B('解除道侣之约','r36:separate',id);
 const known=r?`<br>出身：${html(n.root)} · ${age(n)}岁 / 寿限${n.life}`:'';
 const realm=n.realm<0?'凡人':stat(n.realm)+(n.realm===0?' '+n.layer+'层':['','初','中','后','圆满'][n.layer]||'');
 const history=r?.history.slice(0,3).map(x=>'<br>· '+html(x.text)).join('')||'';
 return C(n.name,`${html(n.role||'当地人')} · ${realm}${known}<br>${html(n.goal||'各有自己的生活')}<br>${view}${r?.bonds.length?'<br>羁绊：'+r.bonds.join('、'):''}${history}`,buttons);
}
function relationsPanel(){
 const w=world();let out=w.legacyPartner?C('旧档关系待核',w.legacyPartner.reason):'';
 for(const [id,r]of Object.entries(w.relations)){
  const n=w.people[id];if(!n)continue;
  out+=C(n.name,`${alive(n)?stat(n.realm)+' · 所在'+html(base.placeName(n.place)):'已故'}<br>${r.bonds.join('、')||'相识'} · 信任${r.trust} · 相知${r.affinity} · 敬重${r.respect}`,B('查看往来','r36:history',id));
 }
 return out||'<p class="sb-note">尚未结识具体人物。到场景中当面交谈。</p>';
}
function panel(title,body,tabs=[]){
 document.body.classList.add('sb-screen');const el=document.getElementById('scene');
 el.innerHTML=`<section class="sb-shell"><header class="sb-head"><div><small>${html(base.placeName(G.place))} · ${eraLabel()}</small><h2>${title}</h2></div></header>${tabs.length?`<nav class="sb-tabs">${tabs.map(([id,label])=>B(label,'r36:tab',id)).join('')}</nav>`:''}<div class="sb-scroll">${body}</div></section>`;
 el.querySelectorAll('[data-sb]').forEach(b=>b.onclick=()=>S.dispatch(b.dataset.sb,b.dataset.arg));
}
function renderView(){
 if(V.tab==='world36'){
  const sub=V.sub||'states';let body='';
  if(sub==='states'){
   body=C('凡界 · 九州','九州是地理文化分区，国家是政权。你在大梁（暂名）·青州·云安府·青石县一带。府县属于国家，并非每州统一分配三十六府。',B('打开山河地图与行程','r36:travelMap'));
   body+=Object.entries(WORLD['凡界'].states).map(([id,s])=>C(s.name,html(s.note||'地志待补'),id==='青'?B('查看本地层次','r36:localRules'):B('查看州域概览','r36:state',id))).join('');
  }else if(sub==='countries'){
   body=C('诸国并立','原设为三朝、八至十个边地／山地／海岛国，以及二至三个政教合一的道国。这些政权与九州不一一对应，另有大量无主山野。');
   body+=C('大梁（原设暂名）','起始地区所在王朝。凡人官府负责户籍、田赋、道路和日常刑狱；修行家族、山门、书院另有资源与传承网络。起始身份不是所有地方的通行凭据。');
   body+=C('其余两朝与诸小国','原设尚未给全名称和国界。本版明确保留这些势力的位置，不编造已定国名或把九州直接当九国。后续逐国补政治、商路与事件。');
   body+=C('道国与无主山野','部分道统的山门兼掌地方治理。普通王朝边界不能代表其实际控制范围，跨国和离开官道的风险应分开。');
  }else if(sub==='tiers'){
   body=C('分布不是禁入规则','高阶修士可以来城中交易、任职或访友，但长期修炼要满足灵气与供给。区域统计不能直接当某个地点的固定人数配额。');
   body+=Object.entries(placeRules).map(([id,r])=>C(base.placeName(id)+' · '+r.label,`灵气参考 ${r.qi}<br>${r.usual}<br>${r.upper}`)).join('');
   body+=C('更高层次','上院：结丹主事，筑基骨干，炼气弟子。九灵眼／守关院：元婴核心据点。化神及以上正常修行主要在灵界。参照原设门槛，暂未把这些据点虚构成已开放地点。');
  }
  panel('九州诸国 · 天下地志',body,[['states','九州'],['countries','诸国'],['tiers','修士分布']]);return true;
 }
 if(V.tab==='history36'){
  const n=get(V.person36),r=relation(V.person36,false);panel(n?.name||'往来',r?r.history.map(x=>C(Math.floor(x.day/YEAR)+'载',html(x.text))).join(''):'尚无共同经历');return true;
 }
 return false;
}
function interact(type,id){
 if(!systemReady())return;id=npcKey(id);const n=get(id);if(!present(id))return toastReason('先找到这个人，当面互动。');
 const r=relation(id),w=world();
 const socialAct=(days,fn)=>act(days,'social',()=>{if(!present(id)){log('未能完成与'+n.name+'的相处，对方已不在原处或已寿尽。');return;}fn();});
 if(type==='mentor'){
  if(!['mentor','N01','taiyue'].includes(id)||n.realm<=realmOf())return toastReason('对方不具备与你建立这条师承的条件。');
  const faction=id==='taiyue'?'taiyue':'temple';if(S.state().faction?.id!==faction)return toastReason('先加入同一山门，再向这位前辈请师。');
  if(r.trust<30||r.respect<25)return toastReason('还需要更多相处、信任和敬重，对方才愿意收徒。');
  if(w.mentorId)return toastReason('已有师承，不可直接改拜他人。');
  socialAct(3,()=>{w.mentorId=id;G.master=n.name;r.bonds.push('师徒');remember(id,'当面拜师，师承有了具体来历。','mentor');});return;
 }
 if(['court','partner','oath'].includes(type)){
  const reason=bondReasons(id,type);if(reason)return toastReason(reason);
  if(type==='court'){if(r.courting)return toastReason('已经互相表明过心意。');socialAct(1,()=>{r.courting=S.now();remember(id,'彼此表明心意，决定继续相处。','court');});}
  if(type==='partner'){if(r.bonds.includes('道侣'))return toastReason('已经结为道侣。');socialAct(1,()=>{r.bonds.push('道侣');w.partnerId=id;n.partnerId=w.playerId;remember(id,'双方自愿立下道侣之约。','partner');});}
  if(type==='oath'){if(r.bonds.includes('结义'))return toastReason('已经结义。');socialAct(1,()=>{r.bonds.push('结义');remember(id,'以多年相处与共同经历为证，结为异姓手足。','oath');});}
  return;
 }
 if(type==='separate'){
  if(w.partnerId!==id)return;act(1,'social',()=>{r.bonds=r.bonds.filter(x=>x!=='道侣');r.bonds.push('旧侣');w.partnerId=null;n.partnerId=null;r.courting=null;remember(id,'当面解除道侣之约，旧日经历保留。','');});return;
 }
 if(type==='family'){
  if(w.partnerId!==id||!alive(n)||G.age<18||age(n)<18)return;
  if(w.birthPlan)return toastReason('已有家庭安排，尚未到期。');
  if(G.sex===n.sex)return toastReason('当前只实现有实际父母来源的生育；收养与其他家庭路径后续补充，不生成匿名孩子。');
  if(r.trust<75)return toastReason('对方希望关系更稳定之后，再共同安排家庭。');
  w.birthPlan={partnerId:id,place:G.place,due:S.now()+300};remember(id,'共同安排家庭生活，约十个月后查看家中消息。','');saveRender();return;
 }
 if(type==='follow'){
  if(!n.canTravel)return toastReason('对方有自己的职责，暂不能离开。');
  if(w.followers.includes(id)){w.followers=w.followers.filter(k=>k!==id);remember(id,'暂别同行，各自照看事务。','');saveRender();return;}
  if(r.trust<30)return toastReason('尚不足以放心结伴。');
  if(w.followers.length>=2)return toastReason('目前最多与两位熟人同行。');
  w.followers.push(id);remember(id,'约定结伴同行，仍保留各自身份。','travel');saveRender();return;
 }
 const days={talk:1,help:3,study:7}[type];if(!days)return;
 if((r.cd[type]||0)>S.now())return toastReason('这项往来刚进行过，给彼此一些时间。');
 if(type==='help'){
  const item=n.need||'herb';if((G.inventory[item]||0)<3)return toastReason('对方当前需要三份'+(BAG_ITEMS[item]?.name||item)+'，不是收任意礼物。');G.inventory[item]-=3;
 }
 if(type==='study'&&n.realm<0)return toastReason('对方并非修士，可以交谈生活与地方消息。');
 if(type==='study'&&n.realm>realmOf()&&r.respect<10)return toastReason('先相识并取得对方信任，再请教修行。');
 act(days,'social',()=>{
  if(!present(id)){log('对方已离场或寿尽，本次往来未完成。');return;}
  r.cd[type]=S.now()+({talk:7,help:30,study:30}[type]);
  if(type==='talk'){r.trust=Math.min(100,r.trust+4);r.affinity=Math.min(100,r.affinity+5);remember(id,'交谈了各自的处境与打算。','');}
  if(type==='help'){r.trust=Math.min(100,r.trust+12);r.affinity=Math.min(100,r.affinity+8);r.respect=Math.min(100,r.respect+8);remember(id,'依照实际所需相助，留下了这次交情。','help_'+Math.floor(S.now()/30));}
  if(type==='study'){r.trust=Math.min(100,r.trust+6);r.affinity=Math.min(100,r.affinity+6);r.respect=Math.min(100,r.respect+12);remember(id,'一起研讨修行中的疑难。','study_'+Math.floor(S.now()/30));}
  S.state().relations[id]=Math.floor(r.trust/10);
  if(r.trust>=30&&!r.bonds.includes('知交'))r.bonds.push('知交');
 });
}
function dispatch(action,arg){
 if(action==='map'){openMap();return true;}
 if(!action.startsWith('r36:'))return false;
 const type=action.slice(4);
 if(type==='tab'){V.sub=arg;render();return true;}
 if(type==='travelMap'){openMap();return true;}
 if(type==='localRules'){V.sub='tiers';render();return true;}
 if(type==='state'){mapNav={level:'state',world:'凡界',state:arg};showMap();return true;}
 if(type==='history'){V.tab='history36';V.person36=arg;render();return true;}
 if(type==='inherit'){inherit(arg);return true;}
 interact(type,arg);return true;
}
function inherit(id){
 if(G.mode!=='dead')return;const w=world(),n=w.people[id];if(!n||!alive(n)||age(n)<8||!w.children.includes(id))return;
 const oldG=G,estate=JSON.parse(JSON.stringify(w)),childAge=age(n),t=G.t,month=G.month,day=G.day;
 estate.people[w.playerId]={id:w.playerId,name:G.name,realm:realmOf(),layer:G.layer,root:G.root,birth:S.now()-G.age*YEAR,life:G.lifespan,alive:false,place:G.place,room:'square',source:'上一代玩家'};
 const ancestors=(G.ancestors||[]).concat([{name:G.name,root:G.root,realm:G.realm,layer:G.layer,age:G.age,origin:G.origin,arts:Object.keys(G.arts||{}),master:G.master,place:G.place}]);
 newGame(n.name,G.origin,n.sex,t);
 G.root=n.root;G.coef=(ROOTS[n.root]||ROOTS['五灵根']).coef;G.cap=(ROOTS[n.root]||ROOTS['五灵根']).cap;
 G.age=childAge;G.lifespan=n.realm<0?100:realmLife(n.realm);G.realm=Math.max(0,n.realm);G.layer=Math.max(1,n.layer||1);G.cult=0;G.month=month;G.day=day;
 G.difficulty={...oldG.difficulty};G.rescue40={generation:(oldG.generation||1)+1,used:false};G.generation=(oldG.generation||1)+1;G.ancestors=ancestors;stoneInherit(G,oldG);G.place=n.place;G.home=n.place;G.family=[];G.inventory={...(n.inventory||{})};
 G.world36={...estate,playerId:id,relations:{},partnerId:null,followers:[],children:[],contracts:[],birthPlan:null,startGranted:false};G.mode='idle';G.lastResult=null;
 seedStart(false);log('由已登记的晚辈'+n.name+'接续家业，年龄和世界日期均保留。');saveRender();
}
openInherit=function(){
 if(G.mode!=='dead')return;const w=world(),children=w.children.map(id=>w.people[id]).filter(n=>alive(n)&&age(n)>=8);
 const md=document.getElementById('modal');md.classList.remove('map-page');md.innerHTML='<h3>传承给具体后人</h3>'+children.map(n=>C(n.name,age(n)+'岁 · '+html(n.root)+' · 已登记的子女',B('接续这一生','r36:inherit',n.id))).join('')+(children.length?'':'<p>当前没有已出生、年满八岁的合格后人，暂时无法接续。</p>')+'<div class="modal-actions"><button class="act" id="inheritClose36">返回</button></div>';
 document.getElementById('overlay').classList.remove('hidden');md.querySelectorAll('[data-sb]').forEach(b=>b.onclick=()=>dispatch(b.dataset.sb,b.dataset.arg));document.getElementById('inheritClose36').onclick=closeMainOverlay;
};
// Retire the relationship-generating and identity-changing shortcuts.
const retired=['E005','E006','E013','E017','E018','E025','E033','E035','E043','E058','E059','E060','E061'];
for(const e of EVENTS){if(retired.includes(e.id)){e.retired36=true;e.cond=()=>false;}}
applyOption=function(ev,i){if(ev?.retired36){toastReason('此旧事件已停用。请找到具体人物，当面互动。');return null;}return base.applyOption(ev,i);};
startEvent=function(ev){if(ev?.retired36){G.mode='idle';G.curEvent=null;saveRender();return;}base.startEvent(ev);};
const labour=EVENTS.find(e=>e.id==='E002');
if(labour){
 labour.text='邻村灵田需要看护，每年报酬四十灵石。工钱按实际经过的日子结算，期间仍要安排自己的生活。';
 for(const [i,years]of [[0,3],[1,1]])labour.opts[i]={l:'承接'+years+'年看护',run:s=>{
  const w=world();if(w.contracts.some(c=>c.playerId===w.playerId&&c.until>S.now()))return {t:'你已有未完的差事，不能重复承接。'};
  w.contracts.push({playerId:w.playerId,last:S.now(),until:S.now()+years*YEAR,annual:40});return {t:'约定已经记下。工钱随你实际度过的时间结算，没有预支未来几年的收入。',log:'承接灵田看护，工钱按时间结算'};
 }};
}
const badRoot=NPCS.find(n=>n.id==='N05');if(badRoot)badRoot.want='担心自己修炼太慢，想找到适合自己的修行方法';
const robber=EVENTS.find(e=>e.id==='E003');
if(robber){const cond=robber.cond;robber.cond=s=>realmOf(s)===0&&alive(get('ridge_shi'))&&alive(get('ridge_luo'))&&(!cond||cond(s));robber.people36=['ridge_shi','ridge_luo'];robber.text='黑风岭上，炼气五层的石二与炼气四层的罗六拦住去路。筑基头领严九通常留在山中据点，不在此亲自截路。你需要判断逃脱、交涉或反抗的代价。';robber.opts[0].chance=s=>Math.max(.05,Math.min(.92,.45+(s.layer-5)*.05+(s.equipment?.weapon?.includes('Sword')?.1:0)));}
const warned=EVENTS.find(e=>e.id==='E020');if(warned)warned.cond=s=>s.age>=s.lifespan*.8&&!s.flag.warned;
for(const e of EVENTS){
 if(e.retired36)continue;
 const before=e.cond;
 const ids=(e.people36||specNPCs.filter(n=>n.name&&!n.name.includes('{')&&(e.text||'').includes(n.name)).map(n=>npcKey(n.id)));
 e.people36=ids;
 e.realmMax36=['E020','E021','E022','E014','E034'].includes(e.id)?8:1;
 e.cond=s=>realmOf(s)<=e.realmMax36&&ids.every(id=>alive(get(id)))&&(!before||before(s));
}
rel=function(s,id,value,note,name){
 const out=base.rel(s,id,value,note,name);
 if(!s||s===G){const n=get(id);if(n){const r=relation(n.id);r.trust=Math.max(0,Math.min(100,r.trust+value*4));if(value<0&&!r.bonds.includes('旧怨'))r.bonds.push('旧怨');if(value>0&&!r.bonds.includes('旧恩'))r.bonds.push('旧恩');remember(n.id,note||'一笔往来重新记入双方经历。','');}else{world().unresolved=world().unresolved||{};world().unresolved[id]={name:name||id,note};}}
 return out;
};
pendingRel=function(s,kind){return base.pendingRel(s,kind).filter(r=>alive(get(r.nid)));};
for(const id of ['prefecture','riverTown','spiritMarket','taiyueSect'])PLACES[id].needRealm=0;
for(const r of ROUTES)if(r.a!=='mistSecret'&&r.b!=='mistSecret')r.needRealm=0;
WORLD['凡界'].caption='九州 · 三朝与诸国 · 府县归各国治理';WORLD['凡界'].states['青'].note='大梁（暂名）·青州·云安府·青石县。九州是地理区，国家另有疆域与秩序。';
PLACES.temple.name='青云观';
for(const v of ORIGINS['世家嫡系'].variants)v.intro=v.intro.replace('两百年不出关的老祖','深居后山数十年的老祖');
FAMILY_OF['世家嫡系']['老祖亲传'][0].look='深居后山数十年，近年才收你在旁教导。';
ORIGINS['魔道弃徒'].birth=ORIGINS['魔道弃徒'].birth.replace('血河宗的辖地','血河道统凡界别院的辖地');
ORIGINS['魔道弃徒'].awaken=ORIGINS['魔道弃徒'].awaken.replace('血河宗一年一度的验灵','血河道统凡界别院一年一度的验灵');
function extraRooms(){return G.place===G.home&&Object.values(world().people).some(n=>n.source==='开局家人档案'&&alive(n)&&n.place===G.place)?[['residence36',world().start?.residence||'家中旧居']]:[];}
function locationLabel(){const p=G.place;if(['village','ridge','county','market','temple','cliff'].includes(p))return '大梁（暂名）·青州·云安府·青石县 · '+base.placeName(p);if(p==='prefecture')return '大梁（暂名）·青州·云安府城';return base.placeName(p)+' · 行政归属待核';}
chooseChild=function(i){const r=base.chooseChild(i);if(G.mode==='awaken')seedStart(true);save();render();return r;};
beginCultivation=function(){seedStart(false);return base.beginCultivation();};
newGame=function(...a){const r=base.newGame(...a);world();return r;};
restore=function(raw){const ok=base.restore(raw);if(ok){world();seedStart(false);sync();if(G.curEvent?.retired36){G.curEvent=null;G.mode='idle';log('旧关系捷径已停用，请寻访具体人物。');}for(const k of Object.keys(G.live||{}))G.live[k]=G.live[k].filter(x=>!EVENTS.find(e=>e.id===x.id)?.retired36);}return ok;};
worldTick=function(){base.worldTick();sync();};
advanceDays=function(n,ctx,opt){
 world();let active=ctx;
 const helper=world().followers.some(id=>alive(get(id))&&get(id).place===G.place&&(relation(id,false)?.trust||0)>=30);
 if(ctx?.retreat&&helper&&ctx.eventRate!==0)active={...ctx,eventRate:(ctx.eventRate??CFG.retreatEventRate)*.7};
 const r=base.advanceDays(n,active,opt);sync();return r;
};
arriveAt=function(from,to,days){base.arriveAt(from,to,days);if(G.place===to&&G.mode!=='dead'){for(const id of world().followers){const n=get(id);if(alive(n)){n.place=to;n.room=S.state().room;}}sync();}};
renderScene=function(){if(G){world();sync();}base.renderScene();if(G?.mode==='idle'&&V.tab==='cult'&&V.sub!=='arts')document.getElementById('scene').querySelectorAll('.calc').forEach(e=>e.remove());};
die=function(reason){const p=G.world36?.partnerId&&get(G.world36.partnerId);const away=alive(p)&&p.place!==G.place;if(away)G.hasMate=false;base.die(reason);if(away){G.deathText+='\n\n道侣'+p.name+'还在'+base.placeName(p.place)+'，此刻尚未得到消息。';sync();save();render();}};
window.XTWorld36={world,get,relation,age,alive,present,sync,starts,placeRules,actorPanel,relationsPanel,dispatch,renderView,bondReasons,seedStart,locationLabel,extraRooms};
if(G){world();seedStart(false);sync();render();}
})();
