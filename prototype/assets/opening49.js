/* 出身成长路线与家庭灵根分布：概率为用户确认的B方案，只影响新抽取。 */
(()=>{'use strict';
const S=XTSandbox,W=XTWorld36,V=S.view;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const order=['无灵根','五灵根','四灵根','三灵根','双灵根','变异灵根','天灵根'];
const profiles={ordinary:{id:'ordinary',name:'普通家庭',weights:[8,30,32,20,7,2.5,.5]},cultivator:{id:'cultivator',name:'修行家族',weights:[2,15,28,32,16,5,2]}};
function profile(origin,variant){
 // 已有资料明确记载这两类的家族传承；组织依附或族属不等于修士血亲。
 return profiles[['没落家族子弟','世家嫡系'].includes(origin)?'cultivator':'ordinary'];
}
function distribution(origin,variant){const p=profile(origin,variant);return order.map((k,i)=>[k,p.weights[i]]);}
function sample(origin,variant,random=Math.random()){
 if(!Number.isFinite(random)||random<0||random>=1)throw Error('随机数须在[0,1)内');
 let r=random*100;for(const [root,weight]of distribution(origin,variant)){r-=weight;if(r<0)return root;}return order.at(-1);
}
rollOrigin=function(origin){const p=profile(origin,G?.variantIdx),root=sample(origin,G?.variantIdx);if(G?.mode==='child'&&G.origin===origin)G.rootGeneration49={version:1,profile:p.id,weights:p.weights.slice(),source:'已确认B方案；按已有家庭传承资料分组'};return root;};
for(const origin of Object.keys(ORIGINS))ORIGINS[origin].dist=distribution(origin,0);
const route=(id,label,years,source,contact,action,place,followup)=>({id,label,years,source,contact,action,place,followup});
const paths={
 '寒门散修':{id:'rural',title:'薄墙内外',care:['家中留人照料，听养育者讲乡事','由养育者带着认熟田埂和邻里'],study:['跟着家里识药名、认药铺的收货字据','在家人陪伴下辨草木、学避开危险兽道'],studyYears:3,invites:[route('herb-referral','家人托药铺辨认药样，再请往来的修士查验',3,'药铺往来修士','grocer','gather','village','按药铺所需完成一次乡野采集'),route('neighbour-book','请乡中熟人寻访能讲清口诀的授业者',4,'乡人转请的授业者','family','work','county','到县城做一次实际短工，回来说明生计打算')]},
 '宗门外门弟子':{id:'temple',title:'山门下的养育者',care:['由杂役房照料，在共同住处长大','由养育者带着认清山门与药园边界'],study:['随教习认名册和经卷，学问清领还规矩','随养育者辨药苗，学看水渠和药畦'],studyYears:2,invites:[route('temple-register','由监院核对附属家庭名册，安排观中查验',1,'观中监院玄诚','mentor','sectTask','temple','完成本门交药差事（青叶草4株），再向监院交代'),route('temple-garden','由药园管事举荐，请传功处安排查验',2,'药园管事转请的授业者','mentor','gather','temple','在观外药坡完成一次采集，再向监院交代')]},
 '没落家族子弟':{id:'fallen',title:'旧宅中还有人守着',care:['由养育者守着旧宅照料你','跟着养育者认熟旧宅邻里，分清家物与借物'],study:['随长辈辨认残卷与家账，记下缺页','学修补旧物、辨认家中可用的材料'],studyYears:3,invites:[route('old-copy','整理能核验的残页，请家中旧识代为查验',2,'家中旧识请来的修士','family','h41:letter','county','到个人居室整理一次旧物和家书'),route('old-trade','随家中人寻找可靠商户，由药铺请人查验',3,'药铺引荐的修士','grocer','work','county','到县城实际做一回短工，说明修屋筹资打算')]},
 '世家嫡系':{id:'clan',title:'宗谱之外的日常',care:['由家中人照料，先认熟自己的起居处','由养育者带着认识各房长辈与共同院落'],study:['入族学识字，读领用簿与基础教本','跟着家中人练基本步法，学照看用物'],studyYears:2,invites:[route('clan-tutor','由族学教习安排族中查验，登记个人份额',1,'族中教习','family','h41:letter','county','在个人居室整理一次起居簿与家书'),route('clan-outside','经家中许可，请外来的修士独立查验',2,'家中请来的外来修士','grocer','work','county','做一次县城短工，再向引荐人说明见闻')]},
 '妖血遗孤':{id:'hidden',title:'养育者留下的庇护',care:['由养育者照料，先熟悉安全的藏身处','由养育者陪伴，辨认附近可求助的人家'],study:['听养育者解释血脉征兆，抄下藏息禁忌','随养育者辨路、看兽迹，记安全退路'],studyYears:3,invites:[route('kin-breath','请养育者循可靠亲缘寻找愿保密的查验者',2,'亲缘引荐的查验者','family','gather','ridge','在附近山间完成一次采集，回来交代退路'),route('hidden-copy','先核对旧笔记，托可信熟人寻找授业者',4,'熟人转请的授业者','family','h41:letter','ridge','到个人居室整理一次寻路记号与旧物')]},
 '魔道弃徒':{id:'escape',title:'役户屋檐下',care:['由役户中的照料者安置，先求平安长大','随照料者认清共用住处与不可进入的院门'],study:['随识字者读物签，分辨残页中的禁忌','学习照看炉具与包裹，记避开危险的方法'],studyYears:3,invites:[route('refuge-ledger','由照料者托坊市熟人查验，只核实基础调息',2,'坊市熟人转请的查验者','grocer','work','market','在坊市做一次实际短工，交代安顿打算'),route('refuge-copy','核对能用的残页，再经药铺寻访可靠授业者',3,'药铺转请的授业者','grocer','gather','ridge','到山间采集一次，再向引荐人交代用途')]},
 '港口船户':{id:'harbor',title:'船家屋檐与潮声',care:['在船行后院由家中人照料','在养育者陪伴下熟悉码头外沿和安全岸路'],study:['向船家学识船牌、货单和潮汛记号','随旧船工学认缆绳受力和浅湾险处'],studyYears:3,invites:[route('harbor-ledger','请周闻潮核对船籍引荐，等随船修士来访',2,'周闻潮引荐的随船修士','harbor47','work','riverTown','到渡镇货街做一次短工，回来核对船货往来'),route('harbor-oldship','请旧船工代为引荐，沿旧船牌寻访授业者',3,'旧船工引荐的授业者','harbor47','h41:letter','home','整理个人旧船牌与家书，再找周闻潮核对')]},
 '湖泽水族寄养家庭':{id:'water',title:'岸上与水下的家人',care:['由岸上亲人照料，在渡口家舍长大','由养育者陪伴，听两边亲人讲水边规矩'],study:['随岸上亲人识字，分清水契两面的约定','随水族亲缘辨水色，记浅湾和禁渊的边界'],studyYears:3,invites:[route('water-messenger','请澜姑经水契往来寻访查验者，两边亲人共同知情',2,'澜姑引荐的水路修士','water47','gather','village','在岸边药坡完成一次采集，再向澜姑交代'),route('water-twohomes','先整理两家的基础说法，再请中立授业者查验',3,'两家共同请来的授业者','water47','h41:letter','home','整理个人水契与家书，再请澜姑核对')]},
 '北地部族家庭':{id:'north',title:'背风处的家帐',care:['由家中人照料，在背风的住处长大','由养育者陪伴，听部族与军镇往来的旧事'],study:['随长辈认军报、驿站标记与不同日期','跟着家中人认风雪、山口路标和退路'],studyYears:3,invites:[route('north-dispatch','请岑老驿循军镇旧识转请查验者',3,'岑老驿转请的查验者','north47','h41:letter','home','整理个人军报与路标，再请岑老驿辨认'),route('north-market','经边市往来请授业者来访，等足一轮商队',4,'边市商队引荐的授业者','north47','work','county','到边市货街做一次实际短工，再找岑老驿交代')]}
};
function expand(text){const c=G.birthContext||{};return String(text).replace(/观中/g,(c.places?.temple||placeName('temple'))+'中').replace(/县城/g,c.county||placeName('county'));}
function currentPath(){return paths[G.origin];}
function scene(){const c=G.opening46.childhood,p=currentPath(),b=G.birthContext||{},r=c.route49||p.invites[c.route||0];return [
 {title:p.title,text:'你在'+b.county+'的'+(G.background?.family||'家庭')+'中出生。'+(b.terrain||'这里的生活')+'，是最早的环境。这一段由养育者安排，婴孩不会独自承担谋生与远行。',choices:p.care.map(x=>[x,3])},
 {title:'开始学会'+(p.id==='harbor'?'认船与潮':p.id==='north'?'认路与认信':p.id==='temple'?'山门里的规矩':'身边的事'),text:'这些年，养育者带你接触本地能学到的东西。学到的常识会留下不同的准备，也会影响你如何向引荐人说明来意。',choices:p.study.map(x=>[expand(x),p.studyYears])},
 {title:'循着自己的门路',text:'这些年的生计与交往，让家中人找到两条可求问的门路。两边都有要等的人和要办的事，你可以选择从哪一段往来开始。',choices:p.invites.map(x=>[expand(x.label),x.years,{...x,source:expand(x.source),followup:expand(x.followup),label:expand(x.label)}])},
 {title:'有人为你查验灵根',text:expand(r.source)+'愿意到家中查验。查验后还可以继续这段往来：'+expand(r.followup)+'。等入门安顿下来，还得亲自办妥，再回来把经过讲清楚。',choices:[['接受查验，听取结果',0],['继续随养育者学习，等下一次来访（悟性+1）',2]]}
 ][c.step];}
function contactFor(kind){if(kind!=='family')return kind;const w=W.world(),f=Object.values(w.people).find(n=>n.source==='开局家人档案'&&W.alive(n)&&n.place===G.home);return f?.id||'grocer';}
function onMeasured(){const o=G.opening46,c=o.childhood,r=c.route49;if(!r)return;o.followup49={id:r.id,label:r.followup,source:r.source,contactId:contactFor(r.contact),action:r.action,arg:r.action==='sectTask'?'herb':null,place:r.place==='home'?G.home:r.place,status:'pending',acceptedAt:S.now(),playerId:W.world().playerId};}
function followup(){const f=G?.opening46?.followup49;return f?.playerId===G.world36?.playerId?f:null;}
function statusText(f){return f.status==='complete'?'已当面交代':f.status==='performed'?'已完成实际行动，待当面交代':'待完成实际行动';}
function dispatch(a){if(a!=='c49:report')return false;const f=followup();if(!systemReady()||!f||f.status!=='performed'||!W.present(f.contactId))return true;const ok=XTContent47.atomic(()=>{const r=W.relation(f.contactId);f.status='complete';f.reportedAt=S.now();r.trust=Math.min(100,r.trust+2);r.deeds.push({day:S.now(),text:f.label});r.history.unshift({day:S.now(),text:'童年引荐后的约定已经当面交代：'+f.label});addLog('向'+W.get(f.contactId).name+'交代童年引荐后的约定。原行动报酬不重复发放。','up');});if(ok)render();return true;}
const old={scene:renderScene,actor:W.actorPanel,observe:XTInteraction42.observe,showStart,renderChild};
W.actorPanel=function(id){let html=old.actor(id),f=followup();if(f?.contactId===id)html+='<section class="background47"><h4>童年引荐后的约定</h4><p>'+esc(f.label)+' · '+statusText(f)+'</p>'+(f.status==='performed'&&W.present(id)?'<button class="sb-btn" data-sb="c49:report">当面交代已经做过的事</button>':'')+'</section>';return html;};
XTInteraction42.observe=function(action,arg,fn){const f=followup(),before=f?.status==='pending'?{id:f.id,time:S.now(),place:G.place,playerId:G.world36?.playerId}:null,out=old.observe(action,arg,fn),r=XTInteraction42.data()?.last,current=followup();if(before&&current?.id===before.id&&current.playerId===before.playerId&&current.status==='pending'&&action===current.action&&(!current.arg||arg===current.arg)&&before.place===current.place&&G.place===current.place&&S.now()>before.time&&r?.action===action&&r.status==='已完成'&&r.at===S.now()){current.status='performed';current.performedAt=S.now();current.evidence={action,at:r.at,place:G.place};save();render();}return out;};
renderScene=function(){old.scene();const f=followup();if(G?.mode==='idle'&&V.tab==='scene'&&f){const section=document.createElement('section'),n=W.get(f.contactId);section.className='background47';section.innerHTML='<h3>童年留下的往来</h3><p>'+esc(f.label)+' · '+statusText(f)+'</p><p>交代对象：'+esc(n?.name||'引荐人')+' · '+esc(n?placeName(n.place):'尚无可靠位置')+'</p>';document.querySelector('#scene .sb-scroll')?.prepend(section);}};
function probabilities(p){return order.map((k,i)=>k+' '+p.weights[i]+'%').join(' · ');}
function preview(){const el=document.getElementById('rootPrev');if(el)el.innerHTML='<b>按出生家庭确定概率</b><br>普通家庭：'+probabilities(profiles.ordinary)+'<br>修行家族：'+probabilities(profiles.cultivator)+'<br>已有资料明确记载家族传承的没落家族、世家分支使用修行组；其他家庭暂按普通组。组织依附、族属和童年选项不重抽灵根。';}
showStart=function(){old.showStart();preview();document.querySelectorAll('#originOpts [data-o]').forEach(b=>b.addEventListener('click',preview));};
renderChild=function(){old.renderChild();document.querySelectorAll('[data-v]').forEach(b=>{const p=profile(G.origin,Number(b.dataset.v)),hint=document.createElement('span');hint.className='hint';hint.textContent=p.name+'：'+probabilities(p);b.querySelector('.body')?.append(hint);});};
window.XTChildhood49={profiles,order,profile,distribution,sample,paths,scene,onMeasured,followup,dispatch};
if(!G){preview();document.querySelectorAll('#originOpts [data-o]').forEach(b=>b.addEventListener('click',preview));}else render();
})();
