/* 同一地点的场景重绘保留阅读与地图位置；不写入角色存档。 */
(()=>{'use strict';
const S=XTSandbox,baseRender=render;
function scope(){
 if(!G||G.mode!=='idle'||S.view.tab!=='scene'||S.view.facility46)return null;
 return JSON.stringify([G.world36?.playerId||G.name,G.place]);
}
let renderedScope=scope();
function position(el){return el?{top:el.scrollTop,left:el.scrollLeft}:null;}
function restorePosition(el,p){
 if(!el||!p)return;
 el.scrollTop=Math.max(0,Math.min(p.top,el.scrollHeight-el.clientHeight));
 el.scrollLeft=Math.max(0,Math.min(p.left,el.scrollWidth-el.clientWidth));
}
render=function(...args){
 const key=scope(),scene=document.getElementById('scene');
 const keep=key&&key===renderedScope&&scene?.querySelector('.sb-scroll');
 const saved=keep?{
  page:position(document.scrollingElement),scene:position(scene),
  content:position(scene.querySelector('.sb-scroll')),
  map:position(scene.querySelector('.map-pan44'))
 }:null;
 const result=baseRender(...args),next=scope();
 if(saved&&key===next){
  const current=document.getElementById('scene');
  restorePosition(current?.querySelector('.map-pan44'),saved.map);
  restorePosition(current?.querySelector('.sb-scroll'),saved.content);
  restorePosition(current,saved.scene);
  restorePosition(document.scrollingElement,saved.page);
 }
 renderedScope=next;
 return result;
};
})();
