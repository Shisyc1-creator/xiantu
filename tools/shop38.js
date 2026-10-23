/* 百草铺的资产、经营人、往来账与继任。人物身份独立于商铺编号。 */
(()=>{
'use strict';
const S=XTSandbox,W=XTWorld36,L=XTLocal37,YEAR=CFG.monthsPerYear*CFG.daysPerMonth;
const old={advanceDays,worldTick,restore,newGame,renderScene,sync:W.sync,actorPanel:W.actorPanel};
const HEIR='baicao_apprentice38',BUYER='baicao_trader38';
const baseStock={...S.actors.grocer.stock};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const button=(label,action,off=false)=>`<button class="sb-btn" data-sb="s38:${action}" ${off?'disabled':''}>${label}</button>`;
const money=n=>Math.round(n*economyFactor());
const alive=id=>W.alive(W.get(id));
function state(){
 if(!G||!['idle','event','dead'].includes(G.mode))return G?.shop38||null;
 if(!G.shop38){
  const now=S.now(),w=W.world(),known=alive('grocer');
  const s=G.shop38={version:1,ownerId:'grocer',status:known?'open':'closed',round:0,history:[],entries:[],loans:[],estate:0,
   debt:{creditorId:'dan',remaining:known?money(24):0,origin:known?'柳丹师寄售养脉散的未结货款':'旧档无可核定寄售账据'},buyerFunds:known?money(180):0,policy:{aid:true,markup:true},registeredAt:now,nextSupplierAt:now+30};
  if(known){
   w.people[HEIR]={id:HEIR,name:'王青禾',role:'百草铺药徒',realm:0,layer:3,root:'五灵根',birth:now-22*YEAR,life:100,sex:'女',place:'county',room:'shops',alive:true,source:'第三十八批预先登记的百草铺药徒',goal:'学会独立看铺，接续师父的生意',need:'herb',apprenticedAt:now-6*YEAR};
   w.people[BUYER]={id:BUYER,name:'孙芸',role:'本地药商',realm:0,layer:6,root:'四灵根',birth:now-34*YEAR,life:100,sex:'女',place:'county',room:'shops',alive:true,source:'第三十八批预先登记的县中药商',goal:'寻找能接手经营的药铺，先核清资产与旧账',need:'herb'};
   s.edges=[{from:'grocer',to:HEIR,type:'授业与看铺',since:now-6*YEAR},{from:'grocer',to:'dan',type:'丹药寄售欠款',account:'debt'},{from:'grocer',to:'ferry',type:'药材供货'},{from:BUYER,to:'grocer',type:'接盘意向，未成交'}];
   record(s,'百草铺由王掌柜经营，药徒王青禾随店学艺；柳丹师的寄售货款与白船主的供货往来记入铺账。');
  }else{s.edges=[];record(s,'旧掌柜已故，旧档没有可核定的接手人，百草铺保持关铺。');}
 }
 return G.shop38;
}
function record(s,text,at=S.now()){
 s.history.unshift({day:at,text});s.history=s.history.slice(0,40);
 const d=S.state();d.news.unshift({at,text});d.news=d.news.slice(0,40);addLog(text,'mute');
}
function entry(s,type,amount,text){s.entries.push({day:S.now(),type,amount,text});s.entries=s.entries.slice(-80);}
function debtTotal(s){return s.debt.remaining+s.loans.filter(l=>l.status==='due').reduce((n,l)=>n+l.amount,0);}
function stock(){return L.shopData('grocer');}
function cash(){return stock()?.wallet||0;}
function candidate(s){
 const n=W.get(HEIR);
 return s.ownerId==='grocer'&&alive(HEIR)&&W.age(n)>=18&&S.now()-n.apprenticedAt>=2*YEAR;
}
function canContinue(){
 const s=state();return !!s&&s.status!=='closed'&&(alive(s.ownerId)||candidate(s)||(s.ownerId!==BUYER&&alive(BUYER)));
}
function operator(){return state()?.ownerId||'grocer';}
function personId(id){return id==='grocer'?operator():id;}
function ownerName(){return W.get(operator())?.name||'百草铺掌柜';}
function shopId(id){return ['grocer',HEIR,BUYER].includes(id)?'grocer':id;}
function present(id){const s=state();return id==='grocer'?!!s&&s.status==='open'&&W.present(s.ownerId):W.present(id);}
function freezeRestock(id){const s=state();return id==='grocer'&&!!s&&s.status!=='open';}
function syncActors(){
 const s=G?.shop38;if(!s)return;
 for(const id of [HEIR,BUYER]){
  const n=W.get(id);
  if(!n){delete S.actors[id];continue;}
  S.actors[id]=S.actors[id]||{};
  Object.assign(S.actors[id],{name:n.name,role:n.role,place:n.place,room:n.room});
  if(s.status==='open'&&s.ownerId===id&&alive(id))S.actors[id].stock=baseStock;else delete S.actors[id].stock;
 }
}
function tick(){
 const s=state();if(!s)return;
 if(s.claimTransfer&&G.mode==='idle'&&G.generation>=s.claimTransfer.generation){
  const next=W.world().playerId,previous=s.claimTransfer.fromId;
  if(next!==previous){
   for(const l of s.loans)if(l.status==='due'&&l.playerId===previous){l.previousCreditorId=previous;l.playerId=next;}
   record(s,'前代未清的铺中债权随已确认的传承交接，原账据继续保留。');s.claimTransfer=null;
  }
 }
 if(s.status==='open'&&!alive(s.ownerId)){
  const person=W.get(s.ownerId),natural=person?person.birth+person.life*YEAR:S.now();
  s.status='settling';s.round++;s.formerId=s.ownerId;s.deathAt=Math.min(S.now(),natural);s.decideAt=s.deathAt+30;
  const c=L.state()?.contract;
  if(c?.status==='active'){
   c.due+=30;c.shopObligation38=true;
   record(s,'运药约定留在铺账中，因停业清账，交货期限顺延三十日。');
  }
  s.snapshot={cash:cash(),debt:debtTotal(s),stock:{...stock().stock}};
  record(s,(person?.name||'原掌柜')+'已故，百草铺停业清账三十日。库存、钱匣和未清债约留在铺中。',s.deathAt);
 }
 if(s.status==='settling'&&S.now()>=s.decideAt){
  if(candidate(s)&&cash()>=debtTotal(s)){
   s.ownerId=HEIR;s.status='open';s.policy={aid:true,markup:true};s.nextSupplierAt=s.decideAt+30;
   W.get(HEIR).role='百草铺掌柜';W.get(HEIR).goal='接续师父的药铺，维持供货并履行旧账';
   record(s,'王青禾核清铺账后接掌百草铺，接续库存、欠款、运药约定及未到期的供药折价。',s.decideAt);
  }else if(s.formerId!==BUYER&&alive(BUYER)&&s.buyerFunds>=money(96)+money(48)){
   const price=money(96),capital=money(48),pay=alive(s.debt.creditorId)?Math.min(price,s.debt.remaining):0;
   s.buyerFunds-=price+capital;s.estate+=price-pay;stock().wallet+=capital;
   if(pay){L.shopData('dan').wallet+=pay;s.debt.remaining-=pay;}
   s.ownerId=BUYER;s.status='open';s.policy={aid:L.state()?.contract?.status==='done',markup:false};s.nextSupplierAt=s.decideAt+30;W.get(BUYER).role='百草铺掌柜';W.get(BUYER).goal='经营接盘的百草铺，核清应付货款与书面承诺';
   entry(s,'transfer',price,'孙芸接盘款，先清寄售欠款，其余列入原店主遗产');entry(s,'capital',capital,'孙芸另投入店铺周转金');
   record(s,'孙芸按已登记的接盘意向买下百草铺，并投入周转金。实物库存与未清债约一并承接；只沿用已完成运药约定中的书面折价，旧日私交另算。',s.decideAt);
  }else{
   s.status='closed';record(s,'无人能够接续经营，百草铺关铺。原库存、遗产与未清债权仍保留。',s.decideAt);
   const c=L.state()?.contract;if(c?.status==='active'){c.status='cancelled';c.cargo=0;record(s,'关铺后无法继续承接运药，旧约撤销，不记玩家失约。');}
  }
 }
 if(s.status==='open'&&s.debt.remaining>0&&S.now()>=s.nextSupplierAt){
  s.nextSupplierAt+=30*(Math.floor((S.now()-s.nextSupplierAt)/30)+1);
  if(alive(s.debt.creditorId)&&cash()>=s.debt.remaining){
   const n=s.debt.remaining;stock().wallet-=n;L.shopData('dan').wallet+=n;s.debt.remaining=0;
   entry(s,'supplier',n,'按期向柳丹师结清寄售货款');record(s,ownerName()+'按铺账结清柳丹师的寄售货款'+n+'灵石。');
  }
 }
 syncActors();
}
function quote(id,item){
 if(shopId(id)!=='grocer')return null;
 const s=state(),l=L.state();if(!s||!l||!['herb','qiPill','healingPowder'].includes(item))return 1;
 if(s.ownerId==='grocer')return L.quote('grocer',item);
 return (l.phase==='shortage'?1.8:1)*((s.policy.markup||l.markupOwnerId===s.ownerId)&&l.markupUntil>S.now()?1.1:(s.policy.aid||l.benefitOwnerId===s.ownerId)&&l.benefitUntil>S.now()?.9:1);
}
function shopNote(id){
 if(shopId(id)!=='grocer')return '';
 const s=state(),l=L.state();if(!s)return '';
 return ownerName()+'经营百草铺。'+(l?.phase==='shortage'?'药路受阻，药材与丹药暂停每月补货。':'每月随商路补货。')+(s.ownerId==='grocer'?L.shopNote('grocer'):((s.policy.aid||l?.benefitOwnerId===s.ownerId)&&l?.benefitUntil>S.now()?'尚未到期的供药九折继续有效。':'原掌柜的口头交情不作为本次报价依据。'));
}
function remember(id,text){
 if(!alive(id))return;const r=W.relation(id);r.history.unshift({day:S.now(),text});r.history=r.history.slice(0,24);
 r.trust=Math.min(100,r.trust+4);if(!r.deeds.includes('shop38_accounts'))r.deeds.push('shop38_accounts');S.state().relations[id]=Math.floor(r.trust/10);
}
function atCounter(){return G.place==='county'&&S.state().room==='shops'&&[operator(),HEIR,BUYER].some(id=>W.present(id));}
function panel(kind){
 const s=state();if(!s)return '';
 const owner=W.get(s.ownerId),status={open:'营业',settling:'停业清账',closed:'关铺'}[s.status];
 let text=`百草铺 · ${status}<br>经营人：${esc(owner?.name||'未登记')}${alive(s.ownerId)?'':'（已故）'}。`;
 if(s.status==='settling')text+=` 还有 ${Math.max(0,s.decideAt-S.now())} 日核定交接。`;
 text+=`<br>铺中钱匣 ${cash()} 灵石；寄售未结 ${s.debt.remaining} 灵石；待还垫款 ${s.loans.filter(l=>l.status==='due').reduce((n,l)=>n+l.amount,0)} 灵石。`;
 const heir=W.get(HEIR),buyer=W.get(BUYER);
 if(heir)text+=`<br>${esc(heir.name)}：${alive(HEIR)?s.ownerId===HEIR?'已接掌药铺':'随店学艺的药徒':'已故'}；${esc(buyer?.name||'原意向药商')}：${alive(BUYER)?s.ownerId===BUYER?'已接盘':'有意接盘，须先核账':'已故'}。`;
 text+='<br>铺账来往：柳丹师'+(alive('dan')?'':'（已故）')+'的丹药寄售；白船主'+(alive('ferry')?'':'（已故）')+'的渡口供货。';
 if(s.ownerId!=='grocer'&&s.status==='open')text+='<br>'+(s.policy.aid?'接续有据可查的供药折价；人与人的交情另记。':'只承认已完成运药的书面折价；旧日私交另记。');
 const l=L.state();if(l?.contract?.status==='active')text+='<br>铺中尚有运药约定待交，余 '+Math.max(0,l.contract.due-S.now())+' 日。';
 text+='<br>'+s.history.slice(0,2).reverse().map(x=>esc(x.text)).join('<br>');
 let actions='';
 if(s.status!=='closed'&&atCounter()){
  actions+=button('赠资周转 · 1日 / '+money(12)+'灵石','support',G.stones<money(12));
  const due=s.loans.find(x=>x.status==='due'&&x.playerId===W.world().playerId);
  if(due&&s.status==='open'&&present('grocer'))actions+=button('凭账领回垫款 · 1日 / '+due.amount+'灵石','claim',cash()<due.amount);
 }
 if(s.status!=='closed'&&s.debt.remaining>0&&W.present('dan'))actions+=button('代铺垫付寄售欠款 · 1日 / '+s.debt.remaining+'灵石 · 铺中记欠','advance',G.stones<s.debt.remaining);
 if(kind==='supplier')return s.debt.remaining>0?`<article class="sb-card shop38"><h4>柳丹师 · 寄售结算</h4><p>百草铺尚欠寄售货款 ${s.debt.remaining} 灵石。代付后须凭记名账据向药铺领回。</p><div class="sb-buttons">${actions}</div></article>`:'';
 return `<article class="sb-card shop38"><h4>百草铺往来账</h4><p>${esc(owner?.name||'未登记')} · ${status}</p><details><summary>钱匣、往来与交接记录</summary><p>${text}</p></details><div class="sb-buttons">${actions}</div></article>`;
}
function act(fn){
 if(!systemReady())return;closeMainOverlay();const r=advanceDays(1,{act:'shop38',rate:0,incomeMul:0},{stopOnEvent:true});
 if(r.died){die('寿元耗尽');return;}if(r.event){startEvent(r.event);return;}if(r.days!==1){save();render();return;}
 fn();save();render();
}
function dispatch(action){
 if(!action?.startsWith('s38:'))return false;
 if(!systemReady())return true;tick();const s=state(),kind=action.slice(4);
 if(kind==='support'){
  if(s.status==='closed'||!atCounter()||G.stones<money(12))return true;
  act(()=>{if(s.status==='closed'||!atCounter()||G.stones<money(12))return;const n=money(12);stoneChange(G,-(n),'百草铺账款');stock().wallet+=n;entry(s,'gift',n,'玩家赠资，无偿周转');record(s,'收到赠资'+n+'灵石，记入百草铺钱匣。');remember(alive(s.ownerId)?s.ownerId:HEIR,'你在铺中困难时出资周转，账目如实记下。');});
 }else if(kind==='advance'){
  if(s.status==='closed'||!W.present('dan')||!s.debt.remaining||G.stones<s.debt.remaining)return true;
  act(()=>{
   if(s.status==='closed'||!W.present('dan')||!s.debt.remaining||G.stones<s.debt.remaining)return;
   const n=s.debt.remaining;stoneChange(G,-(n),'百草铺账款');L.shopData('dan').wallet+=n;s.debt.remaining=0;
   s.loans.push({id:s.loans.length+1,playerId:W.world().playerId,amount:n,status:'due',day:S.now()});
   entry(s,'advance',n,'玩家代付柳丹师寄售款，百草铺欠玩家同额垫款');record(s,'你向柳丹师垫清寄售款'+n+'灵石，百草铺记下同额欠款。');remember('dan','寄售货款当面结清，百草铺欠你的垫款另有账据。');
  });
 }else if(kind==='claim'){
  const loan=s.loans.find(x=>x.status==='due'&&x.playerId===W.world().playerId);
  if(s.status!=='open'||!present('grocer')||!loan||cash()<loan.amount)return true;
  act(()=>{if(s.status!=='open'||!present('grocer')||loan.status!=='due'||cash()<loan.amount)return;stock().wallet-=loan.amount;stoneChange(G,loan.amount,'百草铺账款');loan.status='paid';loan.paidAt=S.now();entry(s,'repay',loan.amount,'向登记债权人结清垫款');record(s,ownerName()+'按铺账偿还垫款'+loan.amount+'灵石。');remember(s.ownerId,'按原铺账结清垫款，旧账不因掌柜更替而抹去。');});
 }
 return true;
}
W.sync=function(){old.sync();tick();};
advanceDays=function(n,ctx,opt){state();tick();const r=old.advanceDays(n,ctx,opt);tick();return r;};
worldTick=function(){old.worldTick();tick();};
restore=function(raw){const ok=old.restore(raw);if(ok){state();tick();}return ok;};
newGame=function(...args){
 const inherited=args.length>=4&&G?.shop38?JSON.parse(JSON.stringify(G.shop38)):null;
 if(inherited&&G.mode==='dead')inherited.claimTransfer={fromId:W.world().playerId,generation:(G.generation||1)+1};
 const r=old.newGame(...args);
 if(inherited)G.shop38=inherited;else tick();
 return r;
};
W.actorPanel=function(id){return old.actorPanel(id)+(['grocer',HEIR,BUYER].includes(id)?panel():id==='dan'?panel('supplier'):'');};
renderScene=function(){if(G)tick();old.renderScene();};
window.XTShop38={panel,state,tick,operator,personId,ownerName,shopId,present,canContinue,freezeRestock,quote,shopNote,dispatch,HEIR,BUYER};
if(G){tick();render();}
})();
