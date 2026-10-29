/* 公共往来：只交真实材料、经过真实时日，寻妖由现有斗法结算。 */
(()=>{
'use strict';
const E=window.XTEvents60,W=window.XTWorld36,S=window.XTSandbox,C=window.XTContent47;
if(!E||!W||!S||!C)throw Error('公共事件须在世界、凡钱与事件核心之后加载');
const region=()=>G.currentRegion48?.stateKey||G.birthContext?.stateKey||'';
const owner=()=>W.world().playerId;
const adult=s=>Number.isFinite(s.age)&&s.age>=18;
const contact=place=>(place==='village'?['elder']:['broker','grocer']).find(id=>W.alive(W.get(id))&&W.get(id).place===place&&W.present(id));
const bound=id=>E.context(id)?.actorId;
const ready=(id,s)=>!adult(s)?'成年后再自行承接公共往来。':!W.present(bound(id))?'当事人已不在面前，本次不交物资。':'';
function note(id,text,material=0){const actorId=bound(id),n=W.get(actorId);if(!W.alive(n)||!W.present(actorId))throw Error('当事人已不在场');if(material){n.inventory=n.inventory||{};n.inventory.herb=(n.inventory.herb||0)+material;}E.touch(actorId,text,1);return {t:text,log:text};}
const decline={l:'暂不参与，继续自己的行程',run:()=>({t:'你说眼下还有自己的安排，向对方告辞，继续赶路。',log:'暂未参与，告辞离开'})};
function patch(id,name,place,text,opts,extra={}){E.patch(id,{name,place,spot:'当面往来',once:true,w:8,actorMode60:'present',cond:s=>adult(s)&&!!contact(place),bind60:()=>({actorId:contact(place),regionKey:region()}),text,opts:[...opts,decline],...extra},'公共事件核对成年身份、实际人物、真实物资与时日；拒绝无道德惩罚');}
patch('E009','疫村','village','村中长者正在收拢照护病人的物资，请你量力提供青叶草，或帮忙整理一日。病人的照护仍在继续。',[
 {l:'交青叶草2株，协助分送一日',days:1,items:{herb:2},check:s=>ready('E009',s),run:()=>note('E009','长者收好你带来的青叶草2株。你留下帮忙分送药材，忙了一日，天晚才告辞。',2)},
 {l:'帮忙整理照护物资一日',days:1,check:s=>ready('E009',s),run:()=>note('E009','你帮长者整理、分送照护物资一日；天晚后告别，病人的照护仍在继续。')}
]);
patch('E024','征丁','county','县里传来修堤征役的消息。面前的熟人正为送往堤上的物资忙碌，见到你便问：「今日缺人搬运，能否搭把手？帮完这一日便好。」',[
 {l:'自愿协助修堤物资搬运一日',days:1,check:s=>ready('E024',s),run:()=>note('E024','你与熟人整理、搬运修堤物资，忙了一日。最后一批物资安放妥当，对方向你道了谢，你活动着酸胀的肩膀告辞。')}
]);
patch('E027','县学失火','county','县学失火的消息传来，面前的熟人正帮忙转运抢救出的物件。几捆沾了烟灰的书册还堆在车旁，对方请你帮忙搬到干燥处，再清理余下的杂物，约需一日。',[
 {l:'协助转运与清理一日',days:1,check:s=>ready('E027',s),run:()=>note('E027','你与熟人将抢救出的物件转运妥当，又清理了一日火后杂物。对方接过最后一捆书册，道谢后继续归整，你洗去手上的烟灰告辞。')}
]);
patch('E047','村中义诊','village','村中长者正在整理义诊所需物资，请你帮忙分装药材、安排等候：「今日人多，能留一日最好。若带了青叶草，也可匀一株给这边。」',[
 {l:'帮忙分装与引导一日',days:1,check:s=>ready('E047',s),run:()=>note('E047','你帮长者分装物资、引导等候者一日，日落时整理好余下的物资，告辞离开。')},
 {l:'交青叶草1株，协助分装一日',days:1,items:{herb:1},check:s=>ready('E047',s),run:()=>note('E047','长者接过青叶草1株，小心包好。你留下帮忙分装药材，忙了一日，散场后与长者一同收拾好桌案。',1)}
],{once:false,cd:9});
patch('E048','河祭','village','村中长者正在安排河边祭仪与往来秩序。河边人多，散场后还有不少收拾的活计。你可协助一日布置和收拾，或继续自己的行程。',[
 {l:'协助河边秩序与收拾一日',days:1,check:s=>ready('E048',s),run:()=>note('E048','你与长者一起照看河边往来。人群散去后，你又帮忙搬回桌案、收拾场地，忙完时已过了一日。长者谢过你，沿河慢慢走回村里。')}
]);
const task=()=>{const t=E.state().tasks.E015;return t?.ownerId===owner()?t:null;};
const huntPlace=()=>Object.keys(PLACES).find(p=>p==='ridge'&&placeHas(PLACES[p],'hunt'))||Object.keys(PLACES).find(p=>placeHas(PLACES[p],'hunt'));
patch('E015','猎户除妖','village','村中长者转告山路上有岩甲獠兽出没：「若你有把握，可去山野深处寻它，击退之后回来告诉我，乡人走山路也好有个数。若有别的安排，也不必勉强。」接下后可在炼气行程中寻找岩甲獠兽，也可随时取消这桩往来。',[
 {l:'自愿接下寻妖，按自身实力准备',check:s=>ready('E015',s)||(s.realm!==0?'此事使用炼气实战，请按当前修行阶段选择其他行动。':'')||(!huntPlace()?'没有可用的真实猎妖地点。':'')||(window.XTQi51?.state()?.battle?'先完成当前斗法，再接取新的寻妖往来。':''),run:()=>{const sourceId=bound('E015');E.state().tasks.E015={ownerId:owner(),id:'E015',sourceId,place:huntPlace(),regionKey:region(),status:'active',acceptedAt:S.now()};return {t:'已接下寻妖往来。到'+(typeof placeName==='function'?placeName(huntPlace()):huntPlace())+'的山野深处，在炼气行程中寻找岩甲獠兽；实战胜利后回长者面前交代。',log:'自愿承接岩甲獠兽寻妖往来'};}}
],{cond:s=>adult(s)&&s.realm===0&&!!contact('village')&&!task(),once:true});
E.registerBattle('publicE015',(b,outcome)=>{const t=task();if(!t||t.status!=='active'||outcome!=='win'||b.training||b.target!=='boar'||G.place!==t.place||S.state().room!=='hunt'||(b.place&&b.place!==t.place)||region()!==t.regionKey||(b.region60!=null&&b.region60!==t.regionKey))return;t.status='won';t.battleId=b.id;t.wonAt=S.now();t.evidence={target:b.target,place:G.place,regionKey:region(),outcome};});
E.registerAction('publicReport15',()=>{const t=task();if(!t||t.status!=='won'||G.mode!=='idle'||region()!==t.regionKey||!W.present(t.sourceId))return;C.atomic(()=>{const current=task();if(!current||current.status!=='won'||!W.present(current.sourceId))return;current.status='done';current.reportedAt=S.now();E.touch(current.sourceId,'你当面讲清了寻到岩甲獠兽、将其击退的经过。长者仔细听完，向你道谢，说会转告走山路的乡人。',2);addLog('你向长者交代完岩甲獠兽的事，彼此道别。','mute');});render();});
E.registerAction('publicCancel15',()=>{const t=task();if(!t||!['active','won'].includes(t.status)||G.mode!=='idle')return;C.atomic(()=>{const current=task();if(!current||!['active','won'].includes(current.status))return;current.status='cancelled';current.cancelledAt=S.now();E.state().history.push({id:'E015',at:S.now(),text:'你决定不再继续这桩寻妖往来，收拾行装，另作安排。'});});render();});
E.registerActorPanel('publicE015',actorId=>{const t=task();if(!t||!['active','won'].includes(t.status))return '';let html='<p>寻妖往来：'+(t.status==='won'?'实战已胜，待回原长者面前交代。':'前往指定猎妖地点的山野深处，实战击退岩甲獠兽。')+'</p>';if(t.status==='won'&&actorId===t.sourceId&&W.present(actorId)&&region()===t.regionKey)html+=E.button('当面交代寻妖结果','publicReport15');return html+E.button('取消寻妖往来','publicCancel15');});
})();
