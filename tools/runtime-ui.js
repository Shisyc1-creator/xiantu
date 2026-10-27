/* Shared live UI shell. All content/actions remain owned by the game engine. */
(()=>{'use strict';
const groups=[['scene','游历'],['cult','修行'],['bag','行囊'],['home','家业'],['self','人物']];
const labels=Object.fromEntries(groups);
const originalHUD=renderHUD;
const header=document.createElement('header');header.id='live-heading';
header.innerHTML='<a class="live-brand" href="#">仙途</a><span id="live-context"></span><div class="live-tools"><button data-live="saves">存档</button><button data-live="settings">设置</button><button data-live="history">修行录</button></div>';
document.body.prepend(header);
header.addEventListener('click',event=>{const a=event.target.closest('[data-live]');if(!a)return;if(a.dataset.live==='saves')openSaves();if(a.dataset.live==='settings')openSettings();if(a.dataset.live==='history')document.getElementById('logToggle')?.click();});
header.querySelector('a').onclick=e=>e.preventDefault();
function groupFor(tab){if(['bag','cult','home','self'].includes(tab))return tab;if(['guide','history36'].includes(tab))return 'self';return 'scene';}
renderHUD=function(...args){const result=originalHUD(...args);const tab=XTSandbox.view.tab,selected=groupFor(tab),nav=document.getElementById('primaryNav');
nav.innerHTML=groups.map(([id,label])=>`<button class="nav-tab ${id===selected?'active':''}" data-live-nav="${id}" aria-current="${id===selected?'page':'false'}"><span class="nav-label">${label}</span></button>`).join('');
nav.querySelectorAll('[data-live-nav]').forEach(b=>b.onclick=()=>{if(!G||G.mode!=='idle')return;XTSandbox.go(b.dataset.liveNav,b.dataset.liveNav==='bag'?'all':b.dataset.liveNav==='self'?'profile':'');});
document.getElementById('live-context').textContent=G?[PLACES[G.place]?.name||'',labels[selected]||''].filter(Boolean).join(' · '):'';
document.body.classList.toggle('live-game',!!G);return result;
};
window.XTLiveUI=Object.freeze({version:1,navigate(group){if(!groups.some(([id])=>id===group))throw Error('Unknown navigation group');if(!G||G.mode!=='idle')return false;XTSandbox.go(group,group==='bag'?'all':group==='self'?'profile':'');return true;}});
if(G)render();
})();
