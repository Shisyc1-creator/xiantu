/* Seventeen people events: actual identities, recorded dealings and voluntary choices. */
(()=>{
'use strict';
const E=window.XTEvents60,W=window.XTWorld36,S=window.XTSandbox;
if(!E||!W||!S)throw Error('events60-people requires events60 and world36');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const people=()=>Object.values(W.world()?.people||{}).filter(n=>n?.id&&n.name&&n.id!==W.world().playerId);
const at=n=>W.alive(n)&&W.present(n.id);
const relation=n=>W.relation(n.id,false);
function kin(n){const w=W.world();return n.id.startsWith('family_'+w.playerId+'_')||w.partnerId===n.id||(w.children||[]).includes(n.id)||(n.parents||[]).includes(w.playerId)||(relation(n)?.bonds||[]).some(x=>['亲属','父子','母子','养育','家人'].includes(x));}
const relatives=dead=>people().filter(n=>kin(n)&&(dead?!W.alive(n):at(n)));
function recordTexts(n){const r=relation(n);return [...(r?.bonds||[]),...(r?.deeds||[]),...(r?.history||[]).map(x=>typeof x==='string'?x:x.text)].filter(x=>typeof x==='string');}
function goodwill(n){const r=relation(n);return !!r&&((r.bonds||[]).includes('旧恩')||(r.deeds||[]).some(t=>/^help_/.test(t))||recordTexts(n).some(t=>/帮助本人|相助|收到你.*草药|你曾.*帮助|赠药|救助/.test(t)));}
function grudge(n){const r=relation(n);return !!r&&((r.bonds||[]).includes('旧怨')||r.trust<0);}
function noted(n,kind){const words=recordTexts(n),re=kind==='grudge'?/怨|争执|冲突|得罪|欠|不满/:/恩|帮助|相助|交付|赠|照料/;return words.find(x=>re.test(x))||words.find(x=>!/^\w+_\d+$/.test(x))||(kind==='grudge'?'彼此心里还留着嫌隙':'当初相助的情分');}
// Binding must never ask context() for a context: its fallback itself calls bind60().
function select(id,predicate){return people().find(predicate);}
function bound(id,dead=false){const c=E.context(id),n=c?.actorId&&W.get(c.actorId);if(!n||!n.id||!n.name)throw Error('原人物记录已不可核对');if(dead?W.alive(n):!at(n))throw Error('原人物已不在此处或已经离世');return n;}
function check(id,dead=false){try{bound(id,dead);return '';}catch(e){return e.message;}}
function context(id,selector,kind){const n=selector();return n?{actorId:n.id,actorPlace:n.place,actorRoom:n.room,record:kind?noted(n,kind):''}:null;}
function text(id,tail){const c=E.context(id),n=c?.actorId&&W.get(c.actorId);return n?esc(n.name)+'向你点了点头。'+(c.record?'说起从前，你记得：“'+esc(c.record)+'”。':'')+tail:'你四下看了看，对方已经不在这里。';}
function touch(id,message,delta=1){const n=bound(id);E.touch(n.id,message,delta);return {t:message,log:n.name+'：'+message};}
function task(id,kind,extra={}){const n=bound(id);const row={id,kind,actorId:n.id,place:n.place,room:n.room,at:S.now(),...extra};E.state().tasks[id]=row;return row;}
function defer(id,label='先不参与，日后再说'){return {l:label,check:()=>check(id),run:()=>({t:'你说眼下还有别的事，改日再谈。对方点点头，你便告辞了。',log:'暂缓'+id})};}
function common(id,selector,description,opts,extra={}){E.patch(id,{actorMode60:'present',cond:()=>!!selector(),bind60:()=>context(id,selector,extra.recordKind),dyn:()=>text(id,description),text:description,opts,...extra},'绑定真实人物与已记录往来；结算不产生永久属性奖励或拒绝惩罚');}
function friends(id){return ()=>select(id,n=>at(n)&&goodwill(n));}
function enemies(id){return ()=>select(id,n=>at(n)&&grudge(n));}
const family=id=>()=>select(id,n=>kin(n)&&at(n));
function addStock(n,key,qty=1){n.inventory||={};n.inventory[key]=(Number(n.inventory[key])||0)+qty;}
function giftCheck(id){const reason=check(id);if(reason)return reason;const n=bound(id);return (n.inventory?.herb||0)>=1?'':'对方没有可交付的草药，只能当面叙话。';}
function gift(id){return {l:'收下一份草药，当面道谢',check:()=>giftCheck(id),run:()=>{const reason=giftCheck(id);if(reason)throw Error(reason);const n=bound(id);n.inventory.herb--;G.inventory||={};G.inventory.herb=(G.inventory.herb||0)+1;return touch(id,esc(n.name)+'取出一份草药递给你。你接过收好，当面道了谢。');}};}
common('E050',friends('E050'),'对方提起那段旧事，问起你这些日子过得如何。',[
 {l:'坐下来叙一叙旧事',days:1,check:()=>check('E050'),run:()=>touch('E050','你们坐下来，从旧事说到近况。再抬头时，天色已经暗了。')},
 gift('E050'),defer('E050')
],{recordKind:'goodwill'});
common('E051',friends('E051'),'对方把身边的包裹往里挪了挪，请你坐下，说有些话想当面讲。',[
 gift('E051'),{l:'不收物品，只问近况',days:1,check:()=>check('E051'),run:()=>touch('E051','你谢过对方的心意，把话头转到近日的生活上。这一坐，便聊到了傍晚。')},defer('E051','婉谢物品，暂不叙话')
],{recordKind:'goodwill'});
for(const id of ['E052','E053'])common(id,enemies(id),'话才起了个头，旧日的嫌隙便横在中间。对方停下来，等你开口。',[
 {l:'核对旧事，说明自己的说法',days:1,check:()=>check(id),run:()=>{task(id,'dispute',{status:'discussed',record:E.context(id).record});return touch(id,'你把自己记得的经过慢慢说清，对方也说了自己的想法。争处仍在，至少这一次把话听完了。');}},
 {l:'记下分歧，保留各自说法',check:()=>check(id),run:()=>{task(id,'dispute',{status:'unresolved',record:E.context(id).record});return touch(id,'你把两边说不拢的地方记下，收好纸页。这桩事只好留待以后再谈。',0);}},defer(id,'暂不交涉，自行离开')
],{recordKind:'grudge'});
function famous(type,place){return typeof fameReach==='function'&&fameReach(G,type,place)>=1;}
function acquainted(n,type,place){return famous(type,place)||(relation(n)?.trust||0)>=3||goodwill(n);}
common('E054',()=>select('E054',n=>at(n)&&n.realm>=0&&acquainted(n,'修士','temple')),'对方提起近日用功时的一处疑难，问你是否愿意一同聊聊。',[
 {l:'相互交流修行见闻',days:1,check:()=>check('E054'),run:()=>touch('E054','你们从调息聊到平日用功的难处，各说了些心得，临别约好有空再谈。')},defer('E054','说明另有安排，暂不论道')
]);
common('E055',()=>select('E055',n=>at(n)&&n.realm<0&&acquainted(n,'凡人','village')),'对方招呼你坐一坐，说想谈谈乡里的事情，听听你的看法。',[
 {l:'听取说明，记下待问清的事情',days:1,check:()=>check('E055'),run:()=>{task('E055','localInquiry',{status:'unverified'});return touch('E055','你听对方把话说完，逐项记下还需问清的地方，收起纸页准备以后查问。');}},defer('E055','暂不承接，请其自行安排')
]);
common('E056',()=>select('E056',n=>n.id==='stall'&&at(n)&&acquainted(n,'本地','market')),'顾散人把摊上的货物归拢好，问你近来可有合用的草药或矿料，也想听听你行走各处的见闻。',[
 {l:'坐下来聊聊杂货生意',days:1,check:()=>check('E056'),run:()=>touch('E056','你在顾散人的摊边坐了一日，聊了草药、矿料和各自的生计。临走时，你们约好有合用的货再来商量。')},
 {l:'先问清货品与用途，改日再议',check:()=>check('E056'),run:()=>touch('E056','你向顾散人问了摊上货品的用途，说明自己还要考虑，改日再来。',0)},defer('E056','暂不商谈，先办自己的事')
],{name:'坊市商谈'});
common('E057',()=>select('E057',n=>at(n)&&/书办|县衙|主簿|官署/.test(n.role||'')&&acquainted(n,'本地','county')),'对方见你过来，问起你在县里的落脚处和近日营生。',[
 {l:'当面介绍自己，说明暂不任职',days:1,check:()=>check('E057'),run:()=>{task('E057','introduction',{status:'noAppointment'});return touch('E057','你说了自己的来处与近况，也说明眼下想照自己的打算过活。谈过一日，便告辞离开。');}},defer('E057','暂不介绍，日后再谈')
]);
common('H01',family('H01'),'对方说起家中储备，问你能否留下一份草药，平日有用时也方便些。',[
 {l:'留下一份草药',items:{herb:1},check:()=>check('H01'),run:()=>{addStock(bound('H01'),'herb');return touch('H01','你取出一份草药交过去。对方仔细包好，放进自己的药匣里。');}},
 {l:'如实说明手头紧，商量以后再备',check:()=>check('H01'),run:()=>touch('H01','你说手头草药也不宽裕，对方把药匣收好，说那就以后再备。',0)},defer('H01')
]);
common('H02',family('H02'),'对方指了指屋顶，说那几片旧瓦该挪一挪了，问你这次回来能否搭把手。',[
 {l:'花80文请人补瓦',wen:80,days:1,check:()=>check('H02'),run:()=>{task('H02','roof',{status:'patched',method:'paid',home:G.home});return touch('H02','你付了80文，请人把屋瓦修整好。家人帮着收拾梯子，你抬头看了看补齐的瓦面。');}},
 {l:'一起用现有屋瓦修整',days:1,check:()=>check('H02'),run:()=>{task('H02','roof',{status:'patched',method:'work',home:G.home});return touch('H02','你与家人忙了一日，把错开的瓦片归回原位。收好工具时，两人的衣袖都沾满了灰。');}},defer('H02','暂缓修整，继续自己的安排')
]);
common('H05',family('H05'),'对方问你这趟回来准备住多久，接下来又有什么打算。',[
 {l:'留下相处一日',days:1,check:()=>check('H05'),run:()=>touch('H05','你留了一日，陪家人做些日常杂事。饭桌上，彼此都说了说往后的打算。')},
 {l:'说明自己的打算',check:()=>check('H05'),run:()=>touch('H05','你把接下来的打算说清楚。家人听着，问了几句路上的事，叮嘱你有空回来。')},defer('H05','暂不谈，先行离开')
]);
E.patch('H06',{isDeceased60:true,actorMode60:'samePlace',cond:()=>relatives(true).length>0,bind60:()=>context('H06',()=>relatives(true)[0]),dyn:()=>{const n=W.get(E.context('H06')?.actorId);return n?'屋里有些地方还是从前的样子。你站了一会儿，想起已经离世的'+esc(n.name)+'。':'你在熟悉的屋里站了一会儿，往事慢慢浮上心头。';},text:'家中故人的回忆。',opts:[
 {l:'坐一会儿，记下对故人的回忆',days:1,check:()=>check('H06',true),run:()=>{const n=bound('H06',true);E.touch(n.id,'你在家中静坐追忆故人，留下自己的悼念记录。',0);return {t:'你坐下来，写了几件还记得的旧事。写到'+esc(n.name)+'从前的模样，笔停了许久。窗外的光慢慢移过桌沿，你把纸页收好。',log:'追忆故人'+n.name};}},
 {l:'暂时收起回忆，继续今日安排',check:()=>check('H06',true),run:()=>({t:'你轻轻带上门，把往事暂放在心里，继续今日的安排。',log:'暂缓追忆'})}
]},'追忆必须对应世界中确已离世的具体家人');
common('H07',family('H07'),'对方与你说起附近人家的往来，想听听你的意见。你听了个开头，还得把来龙去脉问清楚。',[
 {l:'听清对方的说法，记下待问的问题',days:1,check:()=>check('H07'),run:()=>{task('H07','neighborhood',{status:'unverified'});return touch('H07','你听家人从头说起，把不清楚的地方逐条记下，商量以后找当事人再问一问。');}},
 {l:'听取意见，让家人自己拿主意',check:()=>check('H07'),run:()=>touch('H07','你听完家人的想法，说自己愿意帮着问问，最终如何相处还由家人拿主意。',0)},defer('H07','暂不参与，让当事人自行安排')
]);
common('H08',family('H08'),'对方打开家里的药匣，数了数里面的药包：“有空替我备一份日常药吧，省得要用时再跑一趟。”',[
 {l:'花120文买一份普通备药，交家人保管',wen:120,days:1,check:()=>check('H08'),run:()=>{addStock(bound('H08'),'familyMedicine60');return touch('H08','你花120文买回一份普通备药，交给家人。对方理好药包，放进自己的药匣，仔细盖上了盖子。');}},
 {l:'先留一份草药作储备',items:{herb:1},check:()=>check('H08'),run:()=>{addStock(bound('H08'),'herb');return touch('H08','你取出一份草药递过去，说可以先收着。家人另包一层纸，把它放在匣边。');}},defer('H08','暂不备药，说明自己另有安排')
],{name:'家人备药'});
const backgrounds={
 B47H:{actor:'harbor47',origin:'港口船户',flag:'harborOldAccount',kind:'harborAccount',text:'周闻潮说起船牌上的编号：“我提过的那笔账，你还想问么？船簿和货单要对上，才好往下查。”',choices:[
 ['把周闻潮的说法记成待核账页','unverified','你与周闻潮把船牌、货单的说法逐项写下，在纸边记了个“待核”。旧账的眉目，还得等原簿来对。'],
 ['只询问所需证据，不承接旧账','evidenceRequested','你问原始船簿和货单该找谁核验，说自己这次只问来由，家人的旧账暂且不接。周闻潮听完，把你的问话记了下来。']
 ]},
 B47W:{actor:'water47',origin:'湖泽水族寄养家庭',flag:'waterPactAsked',kind:'waterReply',text:'澜姑把笔推到你面前：“两边都想听听你的意思。你愿意写，我便替你收好；不想写，咱们当面说也成。”',choices:[
 ['写明自己愿与两边往来，交给澜姑','personalReply','你写下愿继续与两边往来，今后的去处由自己决定，落上自己的名字。澜姑读过，将回信仔细折好，收进随身的信袋。'],
 ['当面说明去处自定，暂不托转信','selfDetermination','你向澜姑说明，今后的去处想由自己决定，信就先不写了。澜姑收回笔，点头说记下了。']
 ]},
 B47N:{actor:'north47',origin:'北地部族家庭',flag:'northDispatch',kind:'northDispatch',text:'岑老驿又提起那封迟报：“封套和落款的日期对不上。你想先问副本怎么来的，还是先把日期记住？”',choices:[
 ['请岑老驿当面交代副本来源','provenanceAsked','你请岑老驿从副本的来处说起，把问过的地方一一记下。至于原报如何流转，你们约定等查到原簿再说。'],
 ['记下两个日期的疑点，暂不评判军报','datesUnverified','你把封套与落款的日期疑点抄在一处，收好纸页：“先记着，往后找到原簿，再来对这一笔。”岑老驿应了一声。']
 ]}
};
for(const [id,b]of Object.entries(backgrounds)){
 const selector=()=>select(id,n=>n.id===b.actor&&at(n));
 common(id,selector,b.text,b.choices.map(([l,status,message])=>({l,days:1,check:()=>check(id),run:()=>{task(id,b.kind,{status,message});G.flag||={};G.flag[b.flag]=status;if(id==='B47W'&&status==='personalReply'){const n=bound(id);n.correspondence60||=[];n.correspondence60.push({from:W.world().playerId,at:S.now(),text:message});}return touch(id,message);}})).concat([defer(id,'先不参与，保留日后再谈的余地')]),{once:false,cond:()=>G.origin===b.origin&&!!selector()});
 E.registerActorPanel('people60:'+id,actorId=>{
  if(actorId!==b.actor||G.origin!==b.origin||!W.present(actorId))return '';
  const t=E.state().tasks[id];
  return '<section class="sb-card"><h4>身世旧事</h4><p>'+esc(t?.message||'此事可以暂缓，随时再与本人谈起。')+'</p>'+E.button('再谈这件旧事','people60:reopen',id)+'</section>';
 });
}
E.registerAction('people60:reopen',id=>{
 const b=backgrounds[id];if(!b||G.origin!==b.origin||!W.present(b.actor))return false;
 const event=EVENTS.find(e=>e.id===id);if(!event||!event.cond(G))return false;
 startEvent(event);return true;
});
})();
