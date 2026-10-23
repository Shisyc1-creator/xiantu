/* 按地方布置街区，点击地点沿已有道路逐段行走。 */
(()=>{'use strict';
const S=XTSandbox,V=S.view;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const county={
 northgate45:[2,0,'北城门','城门外接北郊官道。守卒核验通行文书，进出县境仍须按行程赶路。'],
 academy45:[1,1,'县学门前','院内传来诵读声，门外贴着入学与助学告示。你可以查看告示，不能随意取用院中书物。'],
 yamen45:[2,1,'县衙前街','衙署坐北朝南。民人到照壁外等候办事，内堂并非任意出入的公用房间。'],
 granary45:[3,1,'仓廪外院','官粮与商货的交接各有登记。这里可找当值库吏核对回执，仓门以内不许擅入。'],
 well45:[1,2,'水井巷','井边邻里打水往来，巷子向西通旧居，向南接民居街。'],
 notice45:[2,2,'县衙照壁','告示分列徭役、失物与文书核对。向北是衙前街，东西分别接井巷和百工坊。'],
 workshop:[3,2,'百工坊','铁砧与炉火声从沿街作坊传出；租炉、请教与制作仍找实际工匠。'],
 medicine45:[4,2,'药铺后院','晒药竹匾靠墙排列，送药的回执须交前街掌柜核验，不能凭一张纸支走药材。'],
 residential45:[1,3,'西城民巷','民居沿窄巷相连，北通井巷，南接西城横街。租买宅院要去东南牙行立契。'],
 square:[2,3,'十字街','县城主街在此交会。北往县衙，东去商街，西通民巷，南接城门。'],
 shops:[3,3,'东市商街','药铺、杂货铺沿街开张；北去百工坊，东侧巷内是青石拍场，南接东门横街。'],
 auction43:[4,3,'青石拍场','拍场设在东市内院，从商街进出院门；入场后按拍品逐件竞价。'],
 inn45:[0,4,'来安客栈','往来商旅在此落脚。掌柜杜娘替送货客人保管文书，也有人托她寻访失物。'],
 weststreet45:[1,4,'西城横街','横街沿民巷南缘延伸，向东接南门大街，来安客栈开在西侧。'],
 eaststreet45:[3,4,'东门横街','东西贯通南门大街与东城门，北去商街，牙行门开在南侧。'],
 southstreet45:[2,4,'南门大街','大道北接十字街，南至城门，两旁分别是客栈与牙行。'],
 agency:[3,5,'牙行','牙行开在东门横街南侧，宅院、雇工和产权事项须当面核验。'],
 eastgate45:[4,4,'东城门','商货从东门去往河埠，门内横街接商街与南门大街。'],
 southgate45:[2,5,'南城门','进城沿南门大街直达十字街；县外路线与路程可在山河地图查看。'],
 river45:[4,5,'城东河埠','挑夫在石阶上点货，船工收好各家的单据。这是县城河埠，去白水渡镇仍需另走水陆行程。']
};
const roads=[['northgate45','yamen45'],['academy45','yamen45'],['yamen45','granary45'],['yamen45','notice45'],['well45','notice45'],['notice45','workshop'],['well45','residential45'],['notice45','square'],['workshop','shops'],['workshop','medicine45'],['residential45','square'],['square','shops'],['shops','auction43'],['residential45','weststreet45'],['square','southstreet45'],['weststreet45','inn45'],['weststreet45','southstreet45'],['southstreet45','eaststreet45'],['eaststreet45','agency'],['eaststreet45','shops'],['eaststreet45','eastgate45'],['southstreet45','southgate45'],['eastgate45','river45']];
const titles={village:{square:'村口',shops:'行脚摊',wild:'田野药坡'},temple:{square:'山门石阶',hall:'青云前院',wild:'观外药坡'},market:{square:'坊市牌楼',shops:'散修摊街'},ridge:{square:'山脚路口',wild:'采药坡',hunt:'林深兽径'},cliff:{square:'崖下营地',wild:'险径药地',hunt:'崖间兽道'},prefecture:{square:'府城广场',shops:'商会街',workshop:'府城工坊'},riverTown:{square:'渡镇街口',shops:'船行货街'},spiritMarket:{square:'落霞牌楼',shops:'器丹长街',workshop:'地火工坊'},taiyueSect:{square:'外山接引台',hall:'外门前院'},mistSecret:{square:'古境入口',wild:'外围遗地',hunt:'遗迹深处'}};
function rooms(base){const by=new Map(base);if(G.place==='county')for(const [id,v]of Object.entries(county))by.set(id,v[2]);else for(const [id,label]of Object.entries(titles[G.place]||{}))if(by.has(id))by.set(id,label);return [...by];}
function edges(rs){const map=Object.fromEntries(rs.map(([id])=>[id,[]]));const c=(a,b)=>{if(map[a]&&map[b]&&!map[a].includes(b)){map[a].push(b);map[b].push(a);}};
 if(G.place==='county'){for(const r of roads)c(...r);c('well45','residence36');c('weststreet45','home');c('southgate45','camp');}
 else{
  c('square','shops');c('square','hall');c('square','wild');c('wild','hunt');if(!map.wild)c('square','hunt');c('shops','workshop');if(!map.shops)c('square','workshop');c('shops','counter44');c('counter44','auction44');c('auction44','lounge44');
  c(map.hall?'hall':['village','riverTown','prefecture','ridge','cliff'].includes(G.place)?'square':map.shops?'shops':'square','residence36');c(map.shops?'shops':'square','home');c('square','camp');
 }
 c('residence36','h41_inner');c('residence36','h41_storage');c('home','alchemy');c('home','forge');
 for(const [id]of rs)if(id!=='square'&&!map[id].length)c('square',id);
 return map;
}
function positions(rs){const coords={};if(G.place==='county'){for(const [id,v]of Object.entries(county))coords[id]=v.slice(0,2);Object.assign(coords,{residence36:[0,2],h41_inner:[0,1],h41_storage:[0,3],home:[0,5],alchemy:[-1,5],forge:[0,6],camp:[3,6]});}
 else{
  const templates={
   village:{square:[1,2],shops:[2,2],wild:[3,2],residence36:[1,1],home:[0,2]},
   temple:{square:[2,4],hall:[2,3],residence36:[1,3],wild:[3,4]},
   market:{square:[1,3],shops:[1,2],residence36:[0,2],workshop:[2,2]},
   ridge:{square:[1,3],wild:[1,2],hunt:[2,1],residence36:[0,3]},
   cliff:{square:[0,3],wild:[1,2],hunt:[2,1]},
   prefecture:{square:[2,3],shops:[3,3],workshop:[3,2],counter44:[4,3],auction44:[5,3],lounge44:[5,2],residence36:[1,3],home:[1,4]},
   riverTown:{square:[1,2],shops:[2,2],wild:[1,1]},
   spiritMarket:{square:[2,3],shops:[2,2],workshop:[3,2]},
   taiyueSect:{square:[2,4],hall:[2,3],wild:[3,4],residence36:[1,3]},
   mistSecret:{square:[1,4],wild:[1,3],hunt:[2,2]}
  };Object.assign(coords,{square:[1,2],shops:[2,2],hall:[1,1],workshop:[3,2],wild:[2,3],hunt:[3,3],residence36:[0,2],home:[1,3],camp:[0,3]},templates[G.place]||{});
  if(coords.residence36){coords.h41_inner=[coords.residence36[0],coords.residence36[1]-1];coords.h41_storage=[coords.residence36[0]-1,coords.residence36[1]];}
  coords.alchemy=[coords.home[0],coords.home[1]+1];coords.forge=[coords.home[0]+1,coords.home[1]+1];
 }
 const used=new Set();for(const [id]of rs){let p=coords[id]||[5,used.size];while(used.has(p.join(',')))p=[p[0]+1,p[1]];coords[id]=p;used.add(p.join(','));}return coords;
}
function roomNav(rs){const map=edges(rs),here=S.state().room,coords=positions(rs),xs=rs.map(([id])=>coords[id][0]),ys=rs.map(([id])=>coords[id][1]),left=Math.min(...xs),top=Math.min(...ys),point=id=>({x:16+(coords[id][0]-left)*124,y:24+(coords[id][1]-top)*82});
 const width=(Math.max(...xs)-left)*124+132,height=(Math.max(...ys)-top)*82+94,names=Object.fromEntries(rs);
 const lines=Object.entries(map).flatMap(([a,others])=>others.filter(b=>a<b).map(b=>{const p=point(a),q=point(b),near=a===here||b===here;let d;if(p.x===q.x)d=`M${p.x+50} ${p.y+22} V${q.y+22}`;else if(p.y===q.y)d=`M${p.x+50} ${p.y+22} H${q.x+50}`;else d=`M${p.x+50} ${p.y+22} H${(p.x+q.x)/2+50} V${q.y+22} H${q.x+50}`;return `<path class="${near?'near44':''}" data-road="${a}|${b}" d="${d}"/>`;})).join('');
 const nodes=rs.map(([id,label])=>{const p=point(id),current=id===here,near=map[here]?.includes(id);return `<g class="map-node44 ${current?'current44':near?'reachable44':'distant44'}" data-sb="m45:walk" data-arg="${id}" role="button" tabindex="0" aria-label="${esc(label)}${current?'，当前位置':'，沿路前往'}" transform="translate(${p.x} ${p.y})"><rect width="100" height="44" rx="2"/><text x="50" y="18" text-anchor="middle">${esc(label.length>8?label.slice(0,8):label)}</text><text class="map-tag44" x="50" y="34" text-anchor="middle">${current?'● 你在这里':'点击前往'}</text><title>${esc(label)}</title></g>`;}).join('');
 return `<section class="place-map44 county-map45"><div class="room-current42"><small>当前位置</small><b>${esc(names[here]||here)}</b><span>点击地点沿连线前往 · 北↑</span></div><div class="map-pan44" aria-label="本地街巷地图"><svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="width:${width}px;min-width:${width}px;height:${height}px" role="group" aria-label="街巷与地点"><text class="north45" x="16" y="16">北 ↑</text>${lines}${nodes}</svg></div><p class="map-key44">按地图方位布置街巷；点地点沿道路走，可上下左右拖动。</p></section>`;
}
function dispatch(a,arg){if(a!=='m45:walk')return false;if(!systemReady()||V.tab!=='scene')return true;const rs=S.roomDefs(),path=XTScene44.route(arg,rs),names=Object.fromEntries(rs);if(!path.length)return true;
 if(G.auction43?.session?.status==='active'||G.auction44?.session?.status==='active'){toast('请先结束竞拍或办理离场，再沿街行走。');return true;}
 for(const id of path.slice(1)){const before=S.state().room;S.dispatch('room',id);if(S.state().room===before||S.state().room!==id)break;}
 if(path.length>1&&S.state().room===arg){const text='沿街行走：'+path.map(id=>names[id]).join(' → ')+'。',d=XTInteraction42.data();d.last={id:++d.sequence,at:S.now(),action:'room',title:'房间移动',status:'已完成',effects:['来到'+names[arg]],message:text,place:G.place,room:arg,tab:V.tab};addLog(text,'mute');save();render();}return true;
}
const oldScene=renderScene;XTScene44.roomNav=roomNav;
renderScene=function(){oldScene();if(!G||G.mode!=='idle'||V.tab!=='scene')return;const scene=document.getElementById('scene'),d=S.state(),text=G.place==='county'&&county[d.room]?.[3],desc=scene.querySelector('.sb-place>p');if(text&&desc)desc.textContent=text;const pan=scene.querySelector('.map-pan44'),current=pan?.querySelector('.current44');if(pan&&current){const r=current.getBoundingClientRect(),p=pan.getBoundingClientRect();pan.scrollTop+=r.top-p.top-(pan.clientHeight-r.height)/2;}};
window.XTMap45={rooms,edges,positions,roomNav,dispatch,county};if(G)render();
})();
