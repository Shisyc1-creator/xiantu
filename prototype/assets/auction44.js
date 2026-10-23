/* 云安府拍行：真实寄拍、有限竞买、佣金结款与会后回应。 */
(()=>{'use strict';
const S=XTSandbox,W=XTWorld36,V=S.view,YEAR=360;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const B=(text,a,arg='',off=false)=>`<button class="sb-btn" data-sb="a44:${a}" data-arg="${esc(arg)}" ${off?'disabled':''}>${esc(text)}</button>`;
const catalog=[{item:'clothArmor',qty:1,base:36,step:3},{item:'bloodQiPill',qty:3,base:60,step:4},{item:'spiritBlade',qty:1,base:108,step:6}];
const buyerSpecs={
 pan44:{name:'潘澄',sex:'男',realm:0,layer:9,age:51,life:100,root:'四灵根',role:'散修丹客',cash:520,likes:{herb:1.2,ironOre:1.2,qiPill:1.2,bloodQiPill:1.3,clothArmor:1.2,spiritBlade:1.3,qiManual:1.1}},
 cai44:{name:'蔡衡',sex:'男',realm:0,layer:8,age:43,life:100,root:'四灵根',role:'商队买手',cash:360,likes:{herb:1.6,ironOre:1.4,qiPill:1.5,bloodQiPill:1.5,clothArmor:1.4,spiritBlade:1.4}},
 lu44:{name:'陆青屏',sex:'女',realm:1,layer:1,age:67,life:200,root:'三灵根',role:'家族采买',cash:420,likes:{qiPill:1.4,bloodQiPill:1.4,clothArmor:1.6,spiritBlade:1.6,qiManual:1.5,alchemyPrimer:1.3,forgePrimer:1.3}}
};
let message='',locked=false;
const player=()=>G?.world36?.playerId;
const state=()=>G?.auction44||null;
const here=()=>G.place==='prefecture'&&['counter44','auction44','lounge44'].includes(S.state().room);
const alive=id=>{const n=W.get(id);return n&&W.alive(n)&&n.place==='prefecture';};
const operator=()=>alive('prefect');
const cycle=()=>Math.floor(S.now()/90);
const phase=()=>S.now()%90;
const nextIn=()=>phase()<7?0:90-phase();
const lot=()=>{const s=state()?.session;return s?.status==='active'?s.lots[s.index]:null;};
const token=()=>{const s=state()?.session;return s?s.id+'|'+s.index+'|'+s.revision:'';};
const min=l=>l.bid?l.bid+l.step:l.base;
function init(){
 if(state())return state();
 const w=W.world();
 for(const [id,n]of Object.entries(buyerSpecs))if(!w.people[id])w.people[id]={id,name:n.name,sex:n.sex,realm:n.realm,layer:n.layer,root:n.root,birth:CFG.eraStart*YEAR-n.age*YEAR,life:n.life,alive:true,place:'prefecture',room:'counter44',role:n.role,source:'云安拍行常客',goal:'为商队或家族采购合用物资'};
 G.auction44={version:1,serial:0,nextContract:1,nextQuote:1,house:{cash:0,stock:{clothArmor:1,bloodQiPill:3,spiritBlade:1}},buyers:Object.fromEntries(Object.entries(buyerSpecs).map(([id,p])=>[id,{cash:p.cash,inventory:{},likes:{...p.likes}}])),contracts:[],quote:null,session:null,lastCycle:null,history:[],afters:[]};
 return state();
}
function transact(fn){
 if(locked)return false;const before=JSON.stringify(G);locked=true;
 try{fn();const raw=JSON.stringify(G);localStorage.setItem(SAVE_KEY,raw);if(localStorage.getItem(SAVE_KEY)!==raw)throw Error('读回失败');return true;}
 catch(e){G=JSON.parse(before);try{localStorage.setItem(SAVE_KEY,before);}catch(_){}message='保存失败，本次办理已撤回，钱物和领取记录保持原状。';return false;}
 finally{locked=false;}
}
function resolveEstate(){const a=state();if(!a?.heirFrom||!player()||player()===a.heirFrom)return;for(const c of a.contracts)if(c.ownerId===a.heirFrom)c.ownerId=player();for(const e of a.afters)if(e.ownerId===a.heirFrom)e.ownerId=player();a.quote=null;a.heirFrom=null;}
function refund(l){if(l?.hold){stoneChange(G,l.hold,'府拍退回押款');l.hold=0;}}
function returnLot(l){const a=state();if(l.contract){const c=a.contracts.find(c=>c.id===l.contract);if(c)c.status='queued';}else a.house.stock[l.item]=(a.house.stock[l.item]||0)+l.qty;l.status='returned';}
function cancel(reason){const a=state(),s=a?.session;if(s?.status!=='active')return;refund(lot());for(const l of s.lots)if(l.status==='open')returnLot(l);s.status='cancelled';finishPeople();addLog('云安拍会中止：'+reason+'。未成交押款已退，余货退回待拍；已成交款仍可凭据领取。','mute');}
function finishPeople(){const a=state(),s=a.session;for(const id of s.participants)if(alive(id))W.get(id).room='lounge44';a.history.push({id:s.id,cycle:s.cycle,status:s.status,lots:s.lots.map(l=>({item:l.item,qty:l.qty,winner:l.winner,price:l.price,status:l.status}))});a.history=a.history.slice(-8);}
function raise(l,id,amount){if(l.leader==='player')refund(l);if(id==='player'){stoneChange(G,-amount,'府拍举牌押款');l.hold=amount;l.playerBid=true;}l.bid=amount;l.leader=id;l.records.push((id==='player'?G.name:W.get(id).name)+'：“'+amount+'灵石。”');}
function addAfter(l,kind,npc){const a=state();if(!npc)return;a.afters.push({id:a.afters.length+1,ownerId:player(),session:a.session.id,item:l.item,qty:l.qty,price:l.price,npc,kind,status:'pending'});}
function hammer(l){
 const a=state(),s=a.session,c=l.contract&&a.contracts.find(x=>x.id===l.contract);
 if(l.leader==='player'){a.house.cash+=l.hold;l.hold=0;G.inventory[l.item]=(G.inventory[l.item]||0)+l.qty;}
 else if(l.leader){const buyer=a.buyers[l.leader];buyer.cash-=l.bid;a.house.cash+=l.bid;buyer.inventory[l.item]=(buyer.inventory[l.item]||0)+l.qty;}
 l.winner=l.leader;l.price=l.bid;l.status=l.winner?'sold':'unsold';
 if(c){if(l.winner){c.status='sold';c.gross=l.price;c.commission=Math.ceil(l.price/10);c.net=c.gross-c.commission;c.paid=false;addAfter(l,'buyer',l.winner);}else c.status='queued';}
 else if(!l.winner)a.house.stock[l.item]=(a.house.stock[l.item]||0)+l.qty;
 if(!c&&l.playerBid&&l.winner&&l.winner!=='player')addAfter(l,'outbid',l.winner);
 if(!c&&l.winner==='player'){const rival=[...l.bidderIds].reverse().find(id=>id!=='player');if(rival)addAfter(l,'rival',rival);}
 const name=BAG_ITEMS[l.item].name,text=l.winner?(l.winner==='player'?G.name:W.get(l.winner).name)+'以'+l.price+'灵石拍得'+name+'×'+l.qty:name+'无人应价，退回待拍';
 l.records.push('执事落槌：'+text+'。');addLog('云安落槌：'+text+(c&&l.winner?'；佣金'+c.commission+'，待领净款'+c.net:'')+'。','up');
 s.index++;if(s.index>=s.lots.length){s.status='finished';finishPeople();addLog('云安拍会已结束。成交已记账，寄拍净款到柜台凭据领取，会后茶厅可与竞买人当面交谈。','mute');}
}
function round(l,all=false){
 const a=state(),s=a.session;
 if(l.leader&&l.leader!=='player'&&!alive(l.leader)){l.records.push('原举牌者已离场，撤回其报价。');l.leader=null;l.bid=0;}
 let turns=0;
 do{const need=min(l),id=s.participants.find(id=>id!==l.leader&&alive(id)&&a.buyers[id].cash>=need&&(s.ceilings[id][l.item]||0)*l.qty>=need);
  if(!id){hammer(l);return;}raise(l,id,need);l.bidderIds.push(id);turns++;
 }while(all&&turns<1000);
}
function begin(){
 const a=state();if(a?.session?.status==='active')return;
 if(!operator()){message='许掌柜不在府城或已经故去，拍会暂缓；旧款与未上拍货物仍可在柜台取回。';return;}
 if(nextIn()||a?.lastCycle===cycle()){message='尚未到下一届会期。每九十日开会，前七日可登记，每届只办一次。';return;}
 if(G.stones<5){message='登记入场需5灵石，当前余额不足。';return;}
 transact(()=>{
  const a=init(),lots=catalog.filter(x=>(a.house.stock[x.item]||0)>=x.qty).map(x=>({...x,contract:null}));
  for(const c of a.contracts.filter(c=>c.status==='queued')){lots.push({item:c.item,qty:c.qty,base:c.base,step:c.step,contract:c.id,ownerId:c.ownerId});c.status='listed';}
  if(!lots.length){message='本届暂无可上拍的货物，未收入场费。';return;}
  for(const l of lots)if(!l.contract)a.house.stock[l.item]-=l.qty;
  for(const l of lots)Object.assign(l,{status:'open',bid:0,leader:null,hold:0,winner:null,price:0,records:[],bidderIds:[],playerBid:false});
  stoneChange(G,-5,'府拍入场费');a.house.cash+=5;a.lastCycle=cycle();
  const participants=Object.keys(a.buyers).filter(alive),ceilings={};
  for(const id of participants){ceilings[id]=Object.fromEntries(Object.entries(a.buyers[id].likes).map(([item,mul])=>[item,Math.floor((BAG_ITEMS[item]?.price||0)*mul)]));W.get(id).room='auction44';}
  a.session={id:++a.serial,cycle:cycle(),opened:S.now(),index:0,revision:0,status:'active',participants,ceilings,lots};
  addLog('登记进入云安拍会，付入场费5灵石。拍品、竞买私款与承受价已锁定；本场同日逐件议价。','mute');
 });
}
function appraise(){
 const item=document.getElementById('consign-item44')?.value,qty=Number(document.getElementById('consign-qty44')?.value);
 if(window.XTContent47?.item(item)?.currency==='wen'){message='本会只收修仙物品，凡物请到当地凡物铺交易。';return;}
 if(!BAG_ITEMS[item]||!Number.isSafeInteger(qty)||qty<1||qty>99||(G.inventory[item]||0)<qty){message='请选实际持有物品，数量须为1至99的整数。';return;}
 const existing=state()?.quote;if(existing&&existing.ownerId===player()&&existing.item===item&&existing.qty===qty&&existing.expires>=S.now()){message='这批货已有有效鉴定凭据，未重复收取鉴定费。';return;}
 if(G.stones<2){message='鉴定费2灵石，当前余额不足。';return;}
 transact(()=>{const a=init();stoneChange(G,-2,'府拍鉴定费');a.house.cash+=2;const value=Math.max(1,Math.floor(BAG_ITEMS[item].price*qty*.75));a.quote={id:a.nextQuote++,ownerId:player(),item,qty,value,step:Math.max(1,Math.floor(value/15)),fee:2,rate:10,expires:S.now()+90};addLog('云安拍行验看'+BAG_ITEMS[item].name+'×'+qty+'：建议底价'+value+'灵石，鉴定费2；成交佣金10%向上取整。尚未交付货物。','mute');});
}
function consign(id){
 const a=state(),q=a?.quote,base=Number(document.getElementById('consign-base44')?.value);
 if(window.XTContent47?.item(q?.item)?.currency==='wen'){message='此件为凡物，不能以灵石新寄拍；已有旧凭据仍可取回。';return;}
 if(!q||q.id!==Number(id)||q.ownerId!==player()||q.expires<S.now()){message='此份鉴定凭据无效或已过九十日期限，请重新验看。';return;}
 if(!Number.isSafeInteger(base)||base<1||base>999999||(G.inventory[q.item]||0)<q.qty){message='底价须为1至999999的整数，并须仍持有足量货物。';return;}
 if(a.contracts.filter(c=>c.status==='queued'||c.status==='listed').length>=6){message='柜台暂只收六件未成交寄拍，请先取回余货。';return;}
 transact(()=>{G.inventory[q.item]-=q.qty;a.contracts.push({id:a.nextContract++,ownerId:player(),ownerName:G.name,item:q.item,qty:q.qty,base,step:q.step,status:'queued',gross:0,commission:0,net:0,paid:false,quoteId:q.id,rate:q.rate});a.quote=null;addLog('已将'+BAG_ITEMS[q.item].name+'×'+q.qty+'交入云安寄拍柜，底价'+base+'；等候下一届上拍。','mute');});
}
function claim(id){
 const a=state(),c=a?.contracts.find(c=>c.id===Number(id));if(!c||c.ownerId!==player()||c.status!=='sold'||c.paid){message='没有本人可领取的这笔货款，或已经领取。';return;}
 if(a.house.cash<c.net){message='拍行钱匣核对异常，请保留凭据。';return;}
 transact(()=>{a.house.cash-=c.net;stoneChange(G,c.net,'府拍寄售净款');c.paid=true;c.paidAt=S.now();addLog('寄拍凭据'+c.id+'：成交'+c.gross+'，佣金'+c.commission+'，净款'+c.net+'灵石已领取。','up');});
}
function withdraw(id){const a=state(),c=a?.contracts.find(c=>c.id===Number(id));if(!c||c.ownerId!==player()||c.status!=='queued'){message='这件货物正在上拍、已成交或已取回，不能重复领物。';return;}transact(()=>{G.inventory[c.item]=(G.inventory[c.item]||0)+c.qty;c.status='withdrawn';addLog('取回未成交寄拍品'+BAG_ITEMS[c.item].name+'×'+c.qty+'；已完成的鉴定费不退。','mute');});}
function afterReply(arg){
 const [raw,choice]=String(arg).split('|'),a=state(),e=a?.afters.find(e=>e.id===Number(raw));
 if(!e||e.ownerId!==player()||e.status!=='pending'||!['thanks','calm'].includes(choice)){message='这段会后往来已经处理，不能重复取得关系。';return;}
 const n=W.get(e.npc);if(!alive(e.npc)||n.room!=='lounge44'){message='当事人已离开茶厅或已经故去，这段话暂时无法当面说。';return;}
 transact(()=>{const r=W.relation(e.npc);if(choice==='thanks')r.trust=Math.min(100,r.trust+2);else r.respect=Math.min(100,r.respect+1);e.status='resolved';e.choice=choice;e.reply=e.kind==='buyer'?'货物已经点清，拍行按凭据给你结款。往后若还有合用的，可以再来。':e.kind==='outbid'?'各有各的承受价。今日我拍得此物，日后还会在商路上相见。':'既然落槌归你，我也尊重会场规矩。修行路长，下次再见。';if(!r.deeds.includes('auction44_'+e.id))r.deeds.push('auction44_'+e.id);addLog(n.name+'会后回应：“'+e.reply+'” '+(choice==='thanks'?'信任+2':'敬重+1')+'。','mute');message=n.name+'：“'+e.reply+'” '+(choice==='thanks'?'信任+2':'敬重+1');});
}
function dispatch(action,arg){
 const active=state()?.session?.status==='active';
 if(!action.startsWith('a44:')){if(active&&['room','routes','map','r36:travelMap','h41:visit'].includes(action)){message='竞拍尚未结束，请先办理离场、退清押款。';render();return true;}return false;}
 message='';if(!systemReady()||!here()||(window.XTScene46&&!XTScene46.isInside(S.state().room))){message='须沿真实路线到云安府拍行，当面办理。';return true;}
 resolveEstate();const type=action.slice(4),room=S.state().room;
 if(type==='leave'){if(active&&!transact(()=>cancel('你提前离场'))){render();return true;}S.state().room=window.XTScene46?'auction44':'counter44';V.facility46=null;V.tab='scene';render();return true;}
 if(type==='waitDate'){
  if(room!=='auction44'||active){message='请在开会前查看会期。';render();return true;}
  const days=nextIn()||(state()?.lastCycle===cycle()?90-phase():0);
  if(days){const r=advanceDays(days,{act:'候会',rate:0,incomeMul:0},{stopOnEvent:true});if(r.died)die('寿元耗尽');else if(r.event)startEvent(r.event);else message=r.days<days?'候会途中暂歇，尚未到会期；未收入场费。':'已到会期，请查看告示；尚未收入场费。';save();render();}return true;
 }
 if(['appraise','consign','withdraw','claim'].includes(type)){
  if(room!=='counter44'||active){message='请在拍行柜台办理；上拍期间不能撤回寄拍。';render();return true;}
  if(['appraise','consign'].includes(type)&&!operator()){message='许掌柜不在，暂不受理新寄拍；旧物与货款可以取回。';render();return true;}
  if(type==='appraise')appraise();if(type==='consign')consign(arg);if(type==='claim')claim(arg);if(type==='withdraw')withdraw(arg);render();return true;
 }
 if(type==='reply'){if(room!=='lounge44'){message='请到会后茶厅与本人交谈。';render();return true;}afterReply(arg);render();return true;}
 if(room!=='auction44'){message='请先到柜台相连的云安会场。';render();return true;}
 if(type==='open'){begin();render();return true;}
 const l=lot(),s=state()?.session;if(!l||String(arg)!==token()){message='报价已经过期，请按当前拍品重新操作。';render();return true;}
 if(type==='bid'||type==='custom'){
  if(l.contract&&l.ownerId===player()){message='自己的寄拍品不能举牌，避免虚抬成交。';render();return true;}
  const amount=type==='custom'?Number(document.getElementById('auction-price44')?.value):min(l);
  if(!Number.isSafeInteger(amount)||amount<min(l)||amount>G.stones+l.hold){message='出价须为有效整数、不低于最低价，也不能超过可用灵石加本件押款。';render();return true;}
  transact(()=>{raise(l,'player',amount);l.bidderIds.push('player');s.revision++;addLog('云安举牌'+amount+'灵石，已转押款。','mute');});
 }else if(type==='pass'||type==='wait'){transact(()=>{round(l,type==='pass');s.revision++;});}
 render();return true;
}
function contractsHtml(){const cs=state()?.contracts.filter(c=>c.ownerId===player())||[];return '<h3>我的寄拍凭据</h3>'+cs.slice().reverse().map(c=>`<section class="consign-record44"><b>凭据 ${c.id} · ${esc(BAG_ITEMS[c.item].name)} × ${c.qty}</b><p>${c.status==='queued'?'待上拍 / 流拍退回':c.status==='listed'?'正在上拍':c.status==='withdrawn'?'已取回货物':c.paid?'已领取净款':'成交 · 待领取净款'} · 底价 ${c.base}${window.XTContent47?.item(c.item)?.currency==='wen'?' · 旧版已签灵石约，沿原币种结清或取回':''}</p>${c.status==='sold'?`<p>成交 ${c.gross} − 佣金 ${c.commission} = 净款 ${c.net} 灵石</p>${!c.paid?B('领取净款 '+c.net,'claim',c.id):'<strong class="state44 done">已结清</strong>'}`:c.status==='queued'?B('取回未成交货物','withdraw',c.id):''}</section>`).join('')+(cs.length?'':'<p>尚无寄拍凭据。</p>');}
function counter(){
 const options=Object.entries(G.inventory||{}).filter(([id,n])=>n>0&&BAG_ITEMS[id]&&window.XTContent47?.item(id)?.currency!=='wen').map(([id,n])=>`<option value="${id}">${esc(BAG_ITEMS[id].name)} · 持有${n}</option>`).join('');
 let html='<h3>寄拍与鉴定</h3><p>验看每件收2灵石，不退；一次可交1至99份同物。成交收10%佣金，向上取整；净款凭据领取。流拍不收成交佣金，可取回货物。鉴定凭据有效九十日。</p>';
 html+=options?`<div class="consign-form44"><label>物品 <select id="consign-item44">${options}</select></label><label>数量 <input id="consign-qty44" type="number" min="1" max="99" step="1" value="1"></label>${B('验看估价 · 2灵石','appraise')}</div>`:'<p>行囊暂无可寄拍物品。</p>';
 const q=state()?.quote;if(q&&q.ownerId===player())html+=`<section class="quote44"><b>鉴定凭据 ${q.id} · ${esc(BAG_ITEMS[q.item].name)} × ${q.qty}</b><p>${esc(BAG_ITEMS[q.item].desc)}</p><p>建议底价 ${q.value} 灵石 / 最低加价 ${q.step}；佣金10%向上取整。估价不保证成交。</p><label>确认底价 <input id="consign-base44" type="number" value="${q.value}" min="1" max="999999" step="1"></label>${B('按此底价交付寄拍品','consign',q.id)}</section>`;
 return html+contractsHtml();
}
function meeting(){
 const a=state(),s=a?.session,l=lot();let html='<p>每九十日一届，会期七日内可登记；入场5灵石，每届一次。本场同日逐件议价。'+(nextIn()?'距下一会期 '+nextIn()+' 日。':'目前处于开会七日内。')+'</p>';
 if(l){html='<p>本届已登记 · 同日逐件竞价</p>';const own=l.contract&&l.ownerId===player(),t=token();html+=`<section class="auction-lot43"><small>本届第 ${s.index+1} / ${s.lots.length} 件${own?' · 你的寄拍品':''}</small><h3>${esc(BAG_ITEMS[l.item].name)} × ${l.qty}</h3><p>${esc(BAG_ITEMS[l.item].desc)}</p><p>底价 ${l.base} · 最低加价 ${l.step}</p><strong>当前 ${l.bid?l.bid+' 灵石 · '+esc(l.leader==='player'?G.name:W.get(l.leader)?.name):'尚无人应价'}</strong><p>可用 ${G.stones} · 本件押款 ${l.hold}</p><div class="sb-buttons">${B('举牌 '+min(l),'bid',t,own||min(l)>G.stones+l.hold)}${B('等候下一口 / 落槌','wait',t)}${B('不再加价 · 旁观到落槌','pass',t)}</div>${own?'<p>自己的寄拍品不能举牌，请旁观竞价。</p>':`<label class="auction-input43">自定义出价 <input id="auction-price44" type="number" min="${min(l)}" step="1" value="${min(l)}">${B('确认举牌','custom',t)}</label>`}<ol class="auction-history43">${l.records.map(t=>'<li>'+esc(t)+'</li>').join('')||'<li>执事：请诸位依次举牌。</li>'}</ol><p>领先时押款，被超价即退；旁观仍保留已举牌承诺，无人加价才落槌。</p></section>`;
  html+='<details><summary>本届竞买人</summary>'+s.participants.map(id=>'<p>'+esc(W.get(id)?.name)+' · '+(alive(id)?'在场':'已离场')+' · 可用私款 '+a.buyers[id].cash+'</p>').join('')+'<p>竞买私款独立登记，按需要和承受价报价，不按玩家身家补满。</p></details>'+B('办理离场 · 退清押款','leave');
 }else{
  if(s)html+='<p class="state44 done">本届'+(s.status==='finished'?'已结束':'已中止')+'，已成交结果可查凭据；会后茶厅可找当事人。</p>';
  html+='<h3>本届待拍目录</h3>';
  const available=catalog.filter(x=>(a?.house.stock[x.item]??x.qty)>=x.qty),cs=a?.contracts.filter(c=>c.status==='queued')||[];
  html+=[...available,...cs].map(x=>'<p><b>'+esc(BAG_ITEMS[x.item].name)+' × '+x.qty+'</b> · 底价 '+x.base+' / 加价 '+x.step+'<br>'+esc(BAG_ITEMS[x.item].desc)+'</p>').join('')||'<p>暂时没有待拍货物。</p>';
  html+=B('登记入场 · 5灵石','open','',!!nextIn()||a?.lastCycle===cycle()||!operator())+B('候会至下届开场 · 实际经过'+(nextIn()||(a?.lastCycle===cycle()?90-phase():0))+'日','waitDate');
 }
 return html;
}
function lounge(){const es=state()?.afters.filter(e=>e.ownerId===player())||[];return '<h3>会后往来</h3><p>对话依据本届的实际竞价与交易。只作当面短谈，不额外推进日期；每份往来只能取得一次关系变化。</p>'+es.slice().reverse().map(e=>{const n=W.get(e.npc),present=alive(e.npc)&&n.room==='lounge44';return `<section class="after-record44"><b>${esc(n?.name||e.npc)} · ${esc(BAG_ITEMS[e.item].name)} × ${e.qty}</b><p>${e.kind==='buyer'?'对方拍下了你的寄拍品':e.kind==='outbid'?'对方在你举牌后拍得此物':'你拍得了对方也曾举牌的物品'} · 成交 ${e.price} 灵石</p><p class="speech42">${esc(e.reply||(e.kind==='buyer'?'货品已交割，结款要拿寄拍凭据到柜台办。':e.kind==='outbid'?'方才会中出价，不过各取所需。道友莫要介怀。':'落槌已有定数，下次有缘再同场。'))}</p>${e.status==='resolved'?'<strong class="state44 done">已回应 · '+(e.choice==='thanks'?'信任+2':'敬重+1')+'</strong>':present?B('礼貌致意 · 信任+2','reply',e.id+'|thanks')+B('坦然回应 · 敬重+1','reply',e.id+'|calm'):'<span class="state44 pending">当事人不在茶厅，待重逢</span>'}</section>`;}).join('')+(es.length?'':'<p>本届尚无与你相关的竞买往来。只旁观不会凭空生成恩怨。</p>');}
function draw(){
 const room=S.state().room,title=room==='counter44'?'云安拍行 · 柜台':room==='auction44'?'云安府拍卖会':'会后茶厅';
 const rooms=S.roomDefs(),map=XTInteraction42.edges(rooms),names=Object.fromEntries(rooms);
 const exits=(map[room]||[]).map(id=>`<button class="sb-btn" data-sb="room" data-arg="${id}">前往 ${esc(names[id])}</button>`).join('');
 const html=(message?'<p class="auction-notice43" role="alert">'+esc(message)+'</p>':'')+(room==='counter44'?counter():room==='auction44'?meeting():lounge());
 document.body.classList.add('sb-screen');document.getElementById('scene').innerHTML=`<section class="sb-shell auction43 venue44"><header class="sb-head"><div><small>云安府 · 商街拍行</small><h2>${title}</h2></div><span class="sb-balance">${G.stones} 灵石</span></header><div class="sb-scroll"><nav class="venue-nav44"><b>所在：${esc(names[room])}</b><p>商街 ─ 拍行柜台 ─ 云安会场 ─ 会后茶厅</p>${state()?.session?.status==='active'?'':'<div class="sb-buttons">'+exits+'</div>'}</nav>${html}</div></section>`;
 document.querySelectorAll('.venue44 [data-sb]').forEach(b=>b.onclick=()=>S.dispatch(b.dataset.sb,b.dataset.arg));
}
const old={renderView:W.renderView,renderScene,newGame,die,restore,systemReady,stepYear,openRetreat,openBreak,autoRun};
const auctionBusy=()=>state()?.session?.status==='active'||G?.auction43?.session?.status==='active';
function holdTime(){if(!auctionBusy())return false;toast('拍会尚未结束，请先回场景完成竞拍或办理离场，再开始耗时行动。');return true;}
systemReady=function(){if(auctionBusy()&&V.tab!=='scene'){holdTime();return false;}return old.systemReady();};
stepYear=function(...args){if(holdTime())return;return old.stepYear(...args);};
openRetreat=function(...args){if(holdTime())return;return old.openRetreat(...args);};
openBreak=function(...args){if(holdTime())return;return old.openBreak(...args);};
autoRun=function(...args){if(holdTime())return;return old.autoRun(...args);};
W.renderView=function(){if(G.mode==='idle'&&V.tab==='scene'&&here()&&(!window.XTScene46||XTScene46.isInside(S.state().room))){draw();return true;}return old.renderView();};
renderScene=function(){if(state()){resolveEstate();if(state().session?.status==='active'&&(!here()||G.mode==='dead'))transact(()=>cancel('已离开会场'));}old.renderScene();};
die=function(...args){if(state()?.session?.status==='active'&&!transact(()=>cancel('已无法继续竞拍')))cancel('寿尽，存储暂不可用，先清理当前占款');return old.die(...args);};
newGame=function(...args){const estate=args.length>=4&&state()?JSON.parse(JSON.stringify(state())):null,from=player();const r=old.newGame(...args);if(estate){estate.heirFrom=from;G.auction44=estate;}return r;};
restore=function(raw){const ok=old.restore(raw);if(ok)resolveEstate();return ok;};
window.XTAuction44={state,lot,token,dispatch,nextIn,cycle,catalog,init};
if(G)render();
})();
