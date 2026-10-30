/* Small-stage attempts use the existing per-layer table; new major-realm balance remains a proposal. */
(()=>{'use strict';
const old={gain:gainCult,can:canBreak,rate:breakRate,open:openBreak,attempt:doBreak,actions:renderActions,scene:renderScene};
function ready(s=G){return !!s&&!XTNoRoot64.isNone(s)&&s.layer<realmLayerCount(realmOf(s))&&s.cult>=realmNeed(realmOf(s),s.layer);}
function allowed(){return ready()&&G.mode==='idle'&&G.age<G.lifespan&&!G.qi51?.battle;}
function rate(){let m=(G.coef-.95)*2+(G.attr.wu-5)*.02+artMindSum(G).bt;if(G.injured>0)m-=.05;if(G.karma>=30)m-=.05;if(G.age>G.lifespan*.8)m-=.05;return Math.max(.05,Math.min(.95,REALMS[realmOf()].bt[G.layer]*(1+m)));}
gainCult=function(s,amount){s=s||G;if(s!==G||s.layer>=realmLayerCount(realmOf(s)))return old.gain(s,amount);if(XTNoRoot64.isNone(s))return 0;s.cult=Math.min(realmNeed(realmOf(s),s.layer),s.cult+Math.max(0,Number(amount)||0));return 0;};
canBreak=function(){return allowed()||old.can();};
breakRate=function(...a){return ready()?rate():old.rate(...a);};
function attempt(){if(!allowed())return;const need=realmNeed(realmOf(),G.layer),p=rate(),passed=Math.random()<p;const ok=XTContent47.atomic(()=>{if(passed){G.layer++;G.cult=0;addLog('气机贯通，晋入'+realmLayerName(realmOf(),G.layer)+'。','up');G.lastResult={title:'小阶突破',text:'气机终于越过关口。你收功起身，新的周天已渐渐顺畅。'};G.mode='result';}else{G.cult=need*.95;const r=advanceDays(7,{act:'调息',rate:0,incomeMul:0,eventRate:0},{stopOnEvent:false});if(r.died){die('寿元耗尽');return;}G.lastResult={title:'冲关未成',text:'气机在关口散去。你停下运功，调息七日后，才重新稳住周天。\n\n修为损失 '+(need*.05).toFixed(2)+'；未额外损失寿元。'};G.mode='result';}});if(ok)render();}
doBreak=function(...a){if(ready())return attempt();return old.attempt(...a);};
openBreak=function(...a){if(!ready())return old.open(...a);if(!allowed())return;const r=realmOf(),l=G.layer,ov=document.getElementById('overlay'),md=document.getElementById('modal');md.innerHTML='<h3>冲击'+realmLayerName(r,l+1)+'</h3><p>当前成功率 <b id="smallRate65">'+Math.round(rate()*100)+'%</b></p><p>灵根、悟性、已练心法及当前伤势、年龄影响成算。</p><p>失败损失当前层需求的5%修为，调息7日，不额外扣寿元。调息仍经过真实年月，人物与事务照常变化。</p><div class="modal-actions"><button class="act ghost" id="smallCancel65">再等等</button><button class="act primary" id="smallGo65">尝试冲关</button></div>';ov.classList.remove('hidden');document.getElementById('smallCancel65').onclick=ovHide;document.getElementById('smallGo65').onclick=()=>{ovHide();if(realmOf()===r&&G.layer===l)attempt();};};
renderActions=function(...a){old.actions(...a);if(allowed()&&XTSandbox.view.tab==='cult'){const footer=document.getElementById('actions'),el=document.querySelector('.cult-primary-actions')||footer;footer.innerHTML='';el.innerHTML='<button class="act primary" id="smallOpen65">冲击'+realmLayerName(realmOf(),G.layer+1)+' · '+Math.round(rate()*100)+'%</button>';document.getElementById('smallOpen65').onclick=openBreak;}};
renderScene=function(...a){old.scene(...a);if(allowed()&&XTSandbox.view.tab==='cult'&&XTSandbox.view.sub!=='arts')document.getElementById('scene').insertAdjacentHTML('beforeend','<p class="preview">本层修为已满。可以先准备，再决定是否冲关；继续修炼不会自动尝试突破。</p>');};
window.XTBreakthrough65={ready,allowed,rate};
})();
