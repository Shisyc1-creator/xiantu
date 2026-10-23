/* D1：明确选择、旧档升级、局中锁定及跨代规则版本。 */
(()=>{
'use strict';
const S=XTSandbox;
const definitions={standard:{id:'standard',name:'大众模式',hints:true},hardcore:{id:'hardcore',name:'硬核模式',hints:false}};
XTEconomy40.rules=Object.freeze({...XTEconomy40.rules,...Object.fromEntries(Object.values(definitions).map(m=>[m.id,Object.freeze({id:m.id,rulesVersion:1,incomeMultiplier:1,retreatCostMultiplier:1,showHints:m.hints})]))});
const old={newGame,restore,showStart,systemReady,renderScene,renderActions,openSettings,closeMainOverlay,save,saveToSlot};
let creationChoice=null,pendingRaw=null,choosing=false,creating=false;
const summary='当前两档共用成长、资源与生死结算；大众默认展开操作指引，硬核默认收起。本局选定后不可切换，后人沿用本局模式。';
function label(){return definitions[G?.difficulty?.id]?.name||'旧版规则';}
function setInitial(id,from){
 const m=definitions[id];if(!m)return false;
 G.difficulty={id,rulesVersion:1,selectedAt:S.now(),...(from?{migratedFrom:from}:{})};
 G.guidance41=m.hints;
 // 已有记录沿用，升级选择不重置救援次数或资源。
 if(!G.rescue40)G.rescue40={generation:G.generation||1,used:false};
 return true;
}
function isPending(){return !creating&&!!G&&(!definitions[G.difficulty?.id]||G.difficulty?.rulesVersion!==1);}
function choose(id){
 if(!definitions[id]||!isPending()||!pendingRaw)return false;
 try{stoneBackup(pendingRaw);}catch(e){choosing=false;toast('升级前原档无法备份，请检查本地存储空间后重试。原档未更改。');return false;}
 const prior=G.difficulty,guide=G.guidance41;
 setInitial(id,'legacy');
 try{
  const encoded=JSON.stringify(G);localStorage.setItem(SAVE_KEY,encoded);
  if(localStorage.getItem(SAVE_KEY)!==encoded)throw Error('写入未确认');
 }catch(e){G.difficulty=prior;G.guidance41=guide;choosing=false;toast('模式选择未能保存，本次升级尚未提交。请检查浏览器存储后重试，原档备份仍保留。');return false;}
 pendingRaw=null;choosing=false;old.closeMainOverlay();render();return true;
}
function openChoice(){
 if(!isPending()||choosing)return;
 pendingRaw=pendingRaw||sGet(SAVE_KEY)||JSON.stringify(G);
 const md=document.getElementById('modal'),overlay=document.getElementById('overlay');md.classList.remove('map-page');overlay.classList.remove('map-overlay');
 md.innerHTML='<h3>为旧档选择本局模式</h3><p>'+summary+'</p><p>确认前保留原档备份，余额、物品、合同与已用次数均沿用当前记录。</p><div class="modal-actions">'+Object.values(definitions).map(m=>'<button class="act" data-upgrade41="'+m.id+'">'+m.name+'</button>').join('')+'<button class="act ghost" id="modeReturn41">暂不升级，返回标题</button></div>';
 md.querySelectorAll('[data-upgrade41]').forEach(b=>b.onclick=()=>{choosing=false;choose(b.dataset.upgrade41);});
 md.querySelector('#modeReturn41').onclick=()=>{G=null;pendingRaw=null;choosing=false;old.closeMainOverlay();showStart();};
 overlay.classList.remove('hidden');choosing=true;
}
function attachCreation(){
 const start=document.getElementById('btnStart');if(!start||document.getElementById('modeChoice41'))return;
 const field=document.createElement('fieldset');field.className='mode-choice41';field.id='modeChoice41';
 field.innerHTML='<legend>本局模式</legend><p>'+summary+'</p><div class="mode-options41">'+Object.values(definitions).map(m=>`<label><input type="radio" name="difficulty41" value="${m.id}" ${m.id==='standard'?'checked':''}><b>${m.name}</b><span>${m.hints?'默认显示操作指引，适合初次修行。':'默认收起操作指引，可随时查阅帮助。'}</span></label>`).join('')+'</div>';
 start.parentElement.before(field);
 const click=start.onclick;start.onclick=function(e){creationChoice=field.querySelector('input:checked')?.value;if(!definitions[creationChoice])return;try{return click.call(this,e);}finally{creationChoice=null;}};
}
showStart=function(){old.showStart();attachCreation();};
newGame=function(...args){
 const inherited=args.length>=4&&G?.mode==='dead'?{...G.difficulty}:null;
 let out;creating=true;try{out=old.newGame(...args);}finally{creating=false;}
 if(inherited&&definitions[inherited.id]){G.difficulty=inherited;G.guidance41=definitions[inherited.id].hints;}
 else setInitial(creationChoice||'standard');
 pendingRaw=null;choosing=false;
 // 传承调用方还要装回具体人物与债权；等它完成后再统一保存和渲染。
 if(!inherited){save();render();}return out;
};
restore=function(raw){const priorPending=pendingRaw,priorChoosing=choosing;const ok=old.restore(raw);if(ok){choosing=false;pendingRaw=isPending()?raw:null;if(isPending())openChoice();}else{pendingRaw=priorPending;choosing=priorChoosing;}return ok;};
save=function(){if(isPending())return false;return old.save();};
saveToSlot=function(n){if(isPending()){choosing=false;openChoice();return false;}return old.saveToSlot(n);};
systemReady=function(){if(isPending()){choosing=false;openChoice();return false;}return old.systemReady();};
renderActions=function(){old.renderActions();if(isPending()){const actions=document.getElementById('actions');actions.innerHTML='<button class="act" id="pendingMode41">选择本局模式</button>';actions.querySelector('button').onclick=()=>{choosing=false;openChoice();};}};
renderScene=function(){
 old.renderScene();if(!G)return;
 const head=document.querySelector('#scene .sb-head');
 if(head&&!head.querySelector('.mode-badge41')){const text=document.createElement('small');text.className='mode-badge41';text.textContent=label()+' · 本局固定';head.append(text);}
 if(G.mode==='idle'&&definitions[G.difficulty?.id]?.hints&&S.view.tab==='scene'){
  const where=document.querySelector('#scene .sb-place');
  if(where&&!where.querySelector('.mode-hint41')){const p=document.createElement('p');p.className='mode-hint41';p.textContent='先选择所在房间，再点眼前的人。按钮上的天数和费用会在行动时结算；住处的取物需亲自到场。';where.append(p);}
 }
 if(isPending()&&(!choosing||document.getElementById('overlay').classList.contains('hidden'))){choosing=false;openChoice();}
};
openSettings=function(){old.openSettings();const panel=document.getElementById('settingsPanel');let row=panel.querySelector('#modeStatus41');if(!row){row=document.createElement('p');row.id='modeStatus41';panel.querySelector('.settings-foot').before(row);}row.textContent=label()+' · 规则版本 '+(G?.difficulty?.rulesVersion||0)+' · 本局固定。'+summary;};
window.XTMode41={definitions,label,isPending,choose,openChoice,summary,start(name,origin,sex,id){if(!definitions[id])return false;creationChoice=id;try{newGame(name,origin,sex);}finally{creationChoice=null;}return true;}};
if(G){if(isPending())pendingRaw=sGet(SAVE_KEY)||JSON.stringify(G);render();}else attachCreation();
})();
