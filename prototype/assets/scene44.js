/* 房间道路图、路线预览与可核对的事件状态。 */
(()=>{'use strict';
const S=XTSandbox,V=S.view,W=XTWorld36;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const B=(text,a,arg='')=>`<button class="sb-btn" data-sb="${a}" data-arg="${esc(arg)}">${esc(text)}</button>`;
function route(to,rooms=S.roomDefs()){
 const from=S.state().room,map=XTInteraction42.edges(rooms),queue=[[from]],seen=new Set([from]);
 while(queue.length){const path=queue.shift(),end=path.at(-1);if(end===to)return path;for(const next of map[end]||[])if(!seen.has(next)){seen.add(next);queue.push([...path,next]);}}
 return [];
}
function roomNav(rooms){
 const map=XTInteraction42.edges(rooms),here=S.state().room,names=Object.fromEntries(rooms),near=map[here]||[],parent={},depth={square:0},rows={},queue=['square'];
 for(let i=0;i<queue.length;i++){const id=queue[i];for(const child of map[id]||[])if(depth[child]==null){parent[child]=id;depth[child]=depth[id]+1;queue.push(child);}}
 let leaf=0;
 function place(id){const kids=queue.filter(x=>parent[x]===id);rows[id]=kids.length?kids.map(place).reduce((a,b)=>a+b,0)/kids.length:leaf++;return rows[id];}place('square');
 const width=40+(Math.max(...Object.values(depth))+1)*126,height=44+Math.max(1,leaf)*70;
 const point=id=>({x:20+(depth[id]||0)*126,y:22+(rows[id]||0)*70});
 const links=Object.entries(map).flatMap(([id,others])=>others.filter(other=>id<other).map(other=>{const p=point(id),q=point(other),a=p.x<=q.x?p:q,b=p.x<=q.x?q:p,mid=(a.x+b.x+100)/2;return `<path class="${id===here||other===here?'near44':''}" data-road="${id}|${other}" d="M${a.x+100} ${a.y+22} H${mid} V${b.y+22} H${b.x}"/>`;})).join('');
 const nodes=rooms.filter(([id])=>depth[id]!=null).map(([id,label])=>{const p=point(id),current=id===here,adjacent=near.includes(id);return `<g class="map-node44 ${current?'current44':adjacent?'reachable44':'distant44'}" data-sb="${adjacent?'room':'p44:route'}" data-arg="${id}" role="button" tabindex="0" aria-label="${esc(label)}${current?'，当前位置':adjacent?'，相邻可走':'，查看路线'}" transform="translate(${p.x} ${p.y})"><rect width="100" height="44" rx="2"/><text x="50" y="18" text-anchor="middle">${esc(label)}</text><text class="map-tag44" x="50" y="34" text-anchor="middle">${current?'● 你在这里':adjacent?'可直接走':'查看路线'}</text></g>`;}).join('');
 const target=V.route44,path=target&&route(target,rooms),routeText=path?.length?path.map(id=>names[id]).join(' → '):'';
 return `<section class="place-map44"><div class="room-current42"><small>当前位置</small><b>${esc(names[here]||here)}</b><span>连线表示通路 · 邻室可点入</span></div><div class="map-pan44" aria-label="本地房间道路图"><svg viewBox="0 0 ${width} ${height}" style="min-width:${width}px" role="group" aria-label="房间与道路">${links}${nodes}</svg></div><p class="map-key44">● 当前位置　浅底方框可走<br>点远处方框查看途经路线；图可左右拖动。</p>${routeText?`<div class="route-preview44"><b>去往${esc(names[target])}</b><p>${esc(routeText)}</p>${path.length>1?B('先走到 '+names[path[1]],'room',path[1]):'<span>已经到达</span>'}</div>`:''}<div class="room-exits42"><small>眼前出口</small>${near.map(id=>B('前往 '+names[id],'room',id)).join('')||'暂无出口'}</div></section>`;
}
function progress(){if(!G.progress44)G.progress44={events:[],serial:0};return G.progress44;}
function dispatch(a,arg){if(a!=='p44:route')return false;V.route44=arg;render();return true;}
function decorate(){
 if(!G?.root||!['idle','event','result'].includes(G.mode))return;
 const scene=document.getElementById('scene'),shell=scene.querySelector('.sb-shell'),p=G.progress44;
 if(G.mode==='idle'&&!['scene','quests'].includes(V.tab))return;
 const active=G.curEvent&&G.mode==='event',contract=G.local37?.contract;
 const rows=[];
 if(active)rows.push({status:'待处理',text:G.curEvent.name+'：选择一个处理办法',kind:'pending'});
 if(contract?.status==='active')rows.push({status:'进行中',text:'运药约定：'+(contract.cargo?'携货待交付':'待到渡口提货'),kind:'pending'});
 if(contract?.status==='done')rows.push({status:'已完成',text:'运药约定：已经交付并结清',kind:'done'});
 const county=G.auction43?.session;if(county?.status==='active')rows.push({status:'进行中',text:'青石拍场：第'+(county.index+1)+'件竞拍中',kind:'pending'});else if(county)rows.push({status:county.status==='finished'?'已结束':'已中止',text:'青石小拍：成交与退款已记账',kind:'done'});
 const a=G.auction44,s=a?.session;
 if(s?.status==='active')rows.push({status:'进行中',text:'云安会场：第'+(s.index+1)+'件竞拍中',kind:'pending'});
 if(s&&s.status!=='active')rows.push({status:s.status==='finished'?'已结束':'已中止',text:'云安会场：本届已结场',kind:'done'});
 const pendingAfters=a?.afters?.filter(e=>e.ownerId===G.world36?.playerId&&e.status==='pending').length||0;if(pendingAfters)rows.push({status:'待回应',text:'会后茶厅尚有'+pendingAfters+'段竞买往来',kind:'pending'});
 if(a?.contracts?.some(c=>c.ownerId===G.world36?.playerId&&c.status==='sold'&&!c.paid))rows.push({status:'待领取',text:'寄拍货款已结算，请到拍行柜台领取',kind:'pending'});
 const known=(p?.events||[]),legacy=Object.keys(G.eventsDone||{}).filter(id=>G.eventsDone[id]&&!known.some(e=>e.eventId===id)).map(id=>({eventId:id,title:EVENTS.concat(ROAD_EVENTS).find(e=>e.id===id)?.name||id,status:'已处理',choice:'旧记录未保留选项',outcome:''}));
 const recent=[...legacy,...known].slice(-5).reverse();
 const el=document.createElement('section');el.className='scene-progress44';
 el.innerHTML=`<div class="progress-head44"><b>事情进度</b><span>${rows.some(x=>x.kind==='pending')?'待办 '+rows.filter(x=>x.kind==='pending').length:'暂无待办'}</span></div>${rows.map(x=>`<p><strong class="state44 ${x.kind}">${esc(x.status)}</strong>${esc(x.text)}</p>`).join('')}${recent.length?`<details ${G.mode==='result'?'open':''}><summary>最近已结束 ${recent.length} 件 · ${esc(recent[0].title)}</summary>${recent.map(x=>`<p><strong class="state44 ${x.outcome==='失利'?'failed':'done'}">${esc(x.status)}</strong>${esc(x.title)} · ${esc(x.choice)}${x.outcome?' · '+esc(x.outcome):''}</p>`).join('')}</details>`:''}`;
 if(!rows.length&&!recent.length)el.classList.add('empty44');
 const scroll=shell?.querySelector('.sb-scroll');(scroll||scene).prepend(el);
 const pan=scene.querySelector('.map-pan44'),current=pan?.querySelector('.current44');if(pan&&current){const r=current.getBoundingClientRect(),p=pan.getBoundingClientRect();pan.scrollLeft=Math.max(0,r.left-p.left-(pan.clientWidth-r.width)/2);}
 scene.querySelectorAll('.map-node44').forEach(node=>node.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();S.dispatch(node.dataset.sb,node.dataset.arg);}});
}
const old={renderScene,applyOption,newGame,restore};
applyOption=function(ev,i){const result=old.applyOption(ev,i);if(result){const p=progress();p.events.push({id:++p.serial,eventId:ev.id,title:ev.name,choice:ev.opts[i].l,status:'已结束',outcome:result.succ===false?'失利':'已处理',at:S.now()});p.events=p.events.slice(-80);}return result;};
newGame=function(...args){V.route44=null;return old.newGame(...args);};
restore=function(raw){V.route44=null;return old.restore(raw);};
renderScene=function(){old.renderScene();decorate();};
window.XTScene44={roomNav,route,dispatch,progress,decorate};
if(G)render();
})();
