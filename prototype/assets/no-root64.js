/* No spiritual root is a mortal state, not a weaker cultivation coefficient. */
(()=>{'use strict';
const S=XTSandbox,old={restore,scene:renderScene,actions:renderActions,dispatch:S.dispatch,go:S.go,auto:autoRun,step:stepYear,retreat:openRetreat,render};
const isNone=s=>s?.root==='无灵根';
function drawResult(){document.getElementById('scene').innerHTML='<section class="opening46"><h2>无灵根</h2><p>查验过后，来访者轻轻摇头：你无法感应灵气，不能引气入体。</p><p>家中的生活仍在继续。你可以谋生、行走各地，与亲友往来。</p><button class="choice" id="mortal64">收好旧物，回到日常生活</button></section>';document.getElementById('mortal64').onclick=enter;}
function enter(){if(!isNone(G)||G.mode!=='awaken'||!G.opening46?.timelineReady)return false;const ok=XTContent47.atomic(()=>{G.realm=-1;G.layer=0;G.cult=0;G.coef=0;G.cap=0;delete G.qiAge;delete G.cultivationAge;G.mode='idle';G.lastResult=null;G.noRoot64={version:1,measuredAt:XTSandbox.now()};});if(ok)S.go('scene');return ok;}
function migrate(x){if(!x||typeof x!=='object')return;for(const value of Object.values(x))if(value&&typeof value==='object')migrate(value);
 if(x.root==='绝灵根'){const cultivated=x.mode?x.entry47?.status==='complete'||['idle','result','event','dead'].includes(x.mode)&&x.layer>=1:(typeof x.realm==='number'?x.realm>=0:!!x.realm&&x.realm!=='凡人');x.root=cultivated?'五灵根':'无灵根';if(cultivated){if('coef'in x)x.coef=ROOTS['五灵根'].coef;if('cap'in x)x.cap=ROOTS['五灵根'].cap;}else if('coef'in x)x.coef=0;}
 for(const k of ['latentRoot','potentialRoot49','mateRoot'])if(x[k]==='绝灵根')x[k]='无灵根';
}
restore=function(raw){let x;try{x=JSON.parse(raw);migrate(x);if(isNone(x)&&!['child','awaken'].includes(x.mode)){x.realm=-1;x.layer=0;x.cult=0;x.coef=0;}}catch(_){return false;}return old.restore(JSON.stringify(x));};
autoRun=function(...a){if(isNone(G))return;return old.auto(...a);};
stepYear=function(...a){if(isNone(G))return;return old.step(...a);};
openRetreat=function(...a){if(isNone(G))return;return old.retreat(...a);};
function blocked(a){return /^(q51:|q52:|f57:|join$|promote$|practice$|learnArt$|r36:study$|r36:mentor$)/.test(a||'');}
S.dispatch=function(a,arg){if(isNone(G)&&blocked(a)){toast('你没有灵根，无法修炼或运用修士术法。');return;}return old.dispatch(a,arg);};
function panel(){document.getElementById('scene').innerHTML='<section class="opening46"><h2>凡人生活</h2><p>你无法吸纳灵气，但仍可安排生计、旅行和亲友往来。</p><p>到县城货街可承接短工；在乡野可以采集药材。行囊、家业与人物往来仍可使用。</p><button class="choice" id="mortalScene64">查看所在地方</button></section>';document.getElementById('mortalScene64').onclick=()=>S.go('scene');}
renderScene=function(...args){if(isNone(G)&&G.mode==='idle'&&['cult','shop51','hub51','routes52','faction'].includes(S.view.tab)){panel();return;}return old.scene(...args);};
renderActions=function(...args){if(isNone(G)){document.getElementById('actions').innerHTML='';return;}return old.actions(...args);};
render=function(...a){const out=old.render(...a);if(isNone(G)&&G.mode==='idle'&&['cult','shop51','hub51','routes52','faction'].includes(S.view.tab)){panel();document.getElementById('actions').innerHTML='';}return out;};
window.XTNoRoot64={isNone,drawResult,enter,migrate};
if(G)migrate(G);
})();
