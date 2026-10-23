/* 第三十二批：地图绘画层与交互层分离，所有行程仍由原 ROUTES 结算。 */
const ATLAS_ART={county:'assets/art/county-atlas-v1.webp',state:'assets/art/state-atlas-v1.webp',mortal:'assets/art/mortal-atlas-v1.webp',spirit:'assets/art/spirit-atlas-v1.webp'};
function atlasEscape(value){return String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function atlasGlyph(kind){
 const paths={town:'M-14 7V-3L0-13 14-3V7ZM-8 7V-1H8V7M-17 9H17',mountain:'M-17 9-4-13 3-2 8-9 20 9ZM-4-13 0-3 4-1',temple:'M-18 0 0-10 18 0M-14 1H14M-11 2V10M0 2V10M11 2V10M-15 11H15M-8-7 0-15 8-7',village:'M-15 10V-1L-6-9 3-1V10M2 10V1L10-6 18 1V10M-9 10V3H-3V10',gate:'M-13 11V-12H13V11M-6 11V-5H6V11M-17-12H17M-4-17H4',leaf:'M-14 10C-19-5-3-18 16-13 17 4 3 16-14 10ZM-14 10 9-7'};
 return '<path d="'+(paths[kind]||paths.town)+'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>';
}
function atlasMarker(x,y,label,sub,opts){
 opts=opts||{};const width=opts.width||154, attr=opts.attr||'', cls=opts.cls||'';
 return '<g class="atlas-node '+cls+'" '+attr+' transform="translate('+x+' '+y+')"'+(attr?' tabindex="0" role="button" aria-label="'+atlasEscape(label+(sub?'，'+sub:''))+'"':'')+'>'+
 '<title>'+atlasEscape(label+(sub?' · '+sub:''))+'</title><path d="M0 17V34" stroke="'+(opts.current?'#a65c48':'#7b976a')+'" stroke-width="1.5"/><circle cy="35" r="4" fill="'+(opts.current?'#a65c48':'#6b895d')+'" stroke="#fffbe8" stroke-width="2"/>'+
 '<rect class="atlas-plaque" x="'+(-width/2)+'" y="-35" width="'+width+'" height="53" rx="3"/>'+
 '<g transform="translate('+(-width/2+23)+' -9) scale(.65)" style="color:'+(opts.current?'#f8f8df':'#799168')+'">'+atlasGlyph(opts.kind)+'</g>'+
 '<text class="atlas-label" x="11" y="-11" text-anchor="middle">'+atlasEscape(label)+'</text><text class="atlas-sub" x="8" y="7" text-anchor="middle">'+atlasEscape(sub||'')+'</text></g>';
}
function atlasFrame(key,title,subtitle,content,height){
 height=height||680;
 return '<section class="atlas-art"><div class="atlas-title"><span class="vermilion-seal">仙途图志</span><div><h4>'+atlasEscape(title)+'</h4><p>'+atlasEscape(subtitle)+'</p></div></div>'+
 '<div class="atlas-toolbar" aria-label="地图缩放"><button type="button" data-atlas-zoom="-1" aria-label="缩小地图">−</button><output aria-live="polite">100%</output><button type="button" data-atlas-zoom="1" aria-label="放大地图">＋</button><button type="button" data-atlas-zoom="0" aria-label="重置地图">↺</button></div>'+
 '<div class="atlas-scroll" aria-label="山河地图，可横向滚动"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 '+height+'" role="img" aria-label="'+atlasEscape(title)+'"><title>'+atlasEscape(title)+'</title><image href="'+ATLAS_ART[key]+'" width="1000" height="'+height+'" preserveAspectRatio="xMidYMid slice"/>'+content+'</svg></div>'+
 '<div class="atlas-foot"><span><span class="current">● 当前所在</span>　<span class="visited">◇ 已知地名</span>　虚线 · 尚未开放</span><span>地形为方位示意 · 手机可左右滑动，双指缩放或使用＋/−</span></div></section>';
}
function bindAtlasControls(){
 const md=document.getElementById('modal'),scroll=md.querySelector('.atlas-scroll');if(!scroll)return;
 const svg=scroll.querySelector('svg'),out=md.querySelector('.atlas-toolbar output');let zoom=1;
 const fit=()=>Math.max(scroll.clientWidth,620);
 md.querySelectorAll('[data-atlas-zoom]').forEach(b=>b.onclick=()=>{const step=Number(b.dataset.atlasZoom);zoom=step===0?1:Math.max(1,Math.min(2.5,Math.round((zoom+step*.25)*100)/100));svg.style.width=zoom===1?'100%':Math.round(fit()*zoom)+'px';if(step===0)scroll.scrollLeft=0;out.textContent=Math.round(zoom*100)+'%';});
 md.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('.atlas-node[role="button"]')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}};
}
function atlasRegion(){ return G?.currentRegion48||G?.birthContext||{country:'大梁',state:'青州',stateKey:'青',prefecture:'云安府',county:'青石县'}; }
function localMapSvg(){
 const here=G.place||'village',gate=realmInfo(realmOf()).qiGate;
 const positions={village:[205,200],ridge:[520,190],temple:[855,177],cliff:[145,445],county:[535,475],market:[855,540]};
 let content='';
 ROUTES.forEach(r=>{const a=positions[r.a],b=positions[r.b];if(!a||!b)return;const d='M'+a[0]+' '+(a[1]+35)+' Q'+((a[0]+b[0])/2+15)+' '+((a[1]+b[1])/2+60)+' '+b[0]+' '+(b[1]+35);content+='<path d="'+d+'" class="atlas-route-shadow"/><path d="'+d+'" class="atlas-route'+(routeAvailable(r)?'':' locked')+'"/>';});
 Object.keys(positions).forEach(k=>{const p=PLACES[k],pos=positions[k],known=k===here||!!(G.been&&G.been[k]),available=placeAvailable(k);let sub=k===here?'当前所在':known?'曾至此地':'听闻之地';if(!available)sub=(REALM_NAMES[p.needRealm||0]||'更高境界')+'后开放';else if(known&&k!==here){const n=(G.live&&G.live[k]||[]).length;sub=n?'此地有事 ×'+n:(p.qi>=gate?'灵气充盈':'灵气偏薄');}content+=atlasMarker(pos[0],pos[1],placeName(k),sub,{attr:'data-to="'+k+'"',kind:k==='temple'?'temple':k==='ridge'||k==='cliff'?'mountain':k==='village'?'village':'town',current:k===here,cls:'mapnode '+(k===here?'is-current':!available?'is-locked':'')});});
 const beyond=Object.keys(MAP_POS).filter(k=>!positions[k]);
 return atlasFrame('county',atlasRegion().county,atlasRegion().country+' · '+atlasRegion().state+' · '+atlasRegion().prefecture,content,750)+
 '<div class="mapnote">点地名查看路况或前往。走过的地方才显露灵气与世事，旅途仍按路程消耗日程。</div>'+
 '<details class="map-details"><summary>县外方向 · '+beyond.length+' 处远地</summary><div class="mapswitch">'+beyond.map(k=>'<button class="mini mapnode" data-to="'+k+'">'+atlasEscape(placeName(k))+' · '+(placeAvailable(k)?'查看路线':(REALM_NAMES[PLACES[k].needRealm||0]||'更高境界')+'后')+'</button>').join('')+'</div><p>远地另列，跨县行程沿真实路网逐站结算。</p></details>'+
 '<details class="map-details"><summary>山河志 · 人口与修士分布</summary>'+worldScalePanel()+'</details>';
}
function mortalMapSvg(){
 const c=atlasRegion(),contexts=window.XTBackground47?.contexts||[],grid={'冀':[485,172],'兖':[610,288],'青':[797,245],'徐':[825,432],'扬':[670,550],'荆':[460,500],'豫':[445,365],'梁':[227,455],'雍':[230,245]};
 let content='';Object.keys(WORLD['凡界'].states).forEach(k=>{const s=WORLD['凡界'].states[k],p=grid[k],current=k===c.stateKey,sample=contexts.find(x=>x.stateKey===k),sub=current?'当前 · '+c.county:sample?sample.country+' · 出生点':'远方见闻';content+=atlasMarker(p[0],p[1],s.name,sub,{attr:'data-state="'+k+'"',cls:'mapstate '+(current?'is-current':''),current,width:144,kind:'town'});});
 const countries=[...new Set(contexts.map(x=>x.country))];
 return atlasFrame('mortal','凡界 · 九州',c.country+' · '+c.state+' · '+c.prefecture+' · '+placeName(G.place),content)+realmStrip()+'<div class="atlas-context"><div><h4>诸国与出生地点</h4><p>'+countries.map(country=>atlasEscape(country)+'：'+contexts.filter(x=>x.country===country).map(x=>atlasEscape(x.state+' '+x.county)).join('、')).join('<br>')+'</p><p>国名对应已登记出生地点；九州是地理分区，国界可跨州，完整疆域与争议地带仍待补全。</p></div></div><div class="mapnote">点州名展开州域图；当前位置随本地地域记录显示。远方概览不等于可旅行路线。</div>';
}
function stateMapSvg(world,stateKey){
 const w=WORLD[world],st=w&&w.states[stateKey];if(!st)return '';
 if(world==='灵界'){
  const coords={'北原':[500,175],'西漠':[200,345],'中州':[510,340],'东荒':[815,330],'南疆':[495,545]};let content='';
  Object.keys(w.states).forEach(k=>{const s=w.states[k],p=coords[k];content+=atlasMarker(p[0],p[1],s.name,s.terrain+' · 八宗',{attr:'data-state="'+k+'"',cls:'mapstate '+(k===stateKey?'is-current':''),current:k===stateKey,kind:'temple',width:168});});
  return atlasFrame('spirit','灵界 · '+st.name,st.terrain+' / '+st.extra,content)+'<div class="atlas-context"><div><h4>'+atlasEscape(st.name)+' · '+atlasEscape(st.terrain)+'</h4><p>'+atlasEscape(st.note)+'<br>'+atlasEscape(st.extra)+'。域内具体行程尚未开放。</p></div></div>';
 }
 const c=atlasRegion(),local=stateKey===c.stateKey;let content='';
 if(local){
  const grid={prefecture:[350,230],county:[530,460],temple:[800,235],cliff:[760,525]};
  content+='<path d="M350 270Q400 365 530 495Q680 380 800 270" class="atlas-route-shadow"/><path d="M350 270Q400 365 530 495Q680 380 800 270" class="atlas-route"/>';
  (WORLD['凡界'].states['青'].places||[]).forEach(p=>{const pos=grid[p.k]||[500,340];content+=atlasMarker(pos[0],pos[1],PLACES[p.k]?placeName(p.k):fillFate(p.name),p.k==='county'?'展开县内地图':p.locked||'州内地标',{attr:p.k==='county'?'data-county="true"':'',cls:(p.k==='county'?'maplocal is-current':p.locked?'is-locked':''),current:p.k==='county',kind:p.kind==='山'?'mountain':'town',width:174});});
 }else{
  content+=atlasMarker(500,330,st.name,'远方见闻 · 州内行程未开放',{width:250,kind:'mountain'});
 }
 return atlasFrame('state',st.name+' · 山河志',local?c.country+' · '+c.prefecture+' · '+c.county:'凡界九州 / '+st.note,content)+'<div class="atlas-context"><div><h4>'+atlasEscape(st.name)+'</h4><p>'+atlasEscape(st.note)+(local?' 点击'+atlasEscape(c.county)+'，展开当前县域。':' 州内具体地点与行程尚未开放。')+'</p></div>'+(local?'<button class="mini maplocal">展开'+atlasEscape(c.county)+'　›</button>':'')+'</div>';
}
function spiritMapSvg(){
 const coords={'北原':[500,165],'西漠':[200,340],'中州':[510,355],'东荒':[815,320],'南疆':[495,545]};let content='';
 Object.keys(WORLD['灵界'].states).forEach(k=>{const s=WORLD['灵界'].states[k],p=coords[k];content+=atlasMarker(p[0],p[1],s.name,s.terrain+' · 八大宗门',{attr:'data-state="'+k+'"',cls:'mapstate',kind:k==='中州'?'temple':k==='南疆'?'leaf':'mountain',width:176});});
 return atlasFrame('spirit','灵界 · 五域','须弥山为枢 / 四十宗门，四十七洞天',content)+realmStrip()+'<div class="mapnote">北原寒地、西漠沙海、中州须弥、东荒荒古、南疆密林。结丹后开放图册查阅；跨界与洞天行程仍须后续玩法接入。</div>';
}
function eyeNetSvg(){
 const cx=500,cy=360,R=213,ring=EYES.filter(e=>e.name!=='空关');let content='';
 content+='<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="#f7f8e4" fill-opacity=".55" stroke="#b9c89e" stroke-width="1" stroke-dasharray="3 7"/><circle cx="'+cx+'" cy="'+cy+'" r="150" fill="#f7f8e4" fill-opacity=".3" stroke="#c6d1ae" stroke-width="1"/>';
 ring.forEach((e,i)=>{const angle=(-90+i*45)*Math.PI/180,x=cx+R*Math.cos(angle),y=cy+R*Math.sin(angle);content+='<path d="M'+cx+' '+(cy+35)+' Q'+((x+cx)/2)+' '+((y+cy)/2)+' '+x+' '+(y+35)+'" class="atlas-route"/>';content+=atlasMarker(x,y,e.name,e.state+'州 · '+(e.own==='共管'?'万宝楼共管':'道统镇守'),{width:146,kind:'gate'});});
 content+=atlasMarker(cx,cy,'须弥山','三界枢纽',{width:150,kind:'temple',current:true,cls:'is-current'});
 content+=atlasMarker(800,118,'空关','无主 · 偷渡险途',{width:150,kind:'gate',cls:'is-locked'});
 return atlasFrame('spirit','九灵眼 · 渡界网','七道统镇守 / 一处共管，一处无主',content,750)+'<div class="mapnote">灵眼是渡界关隘，连线只示意关系。空关无主，是偷渡之门，也是杀局之地；具体跨界行程尚未开放。</div>';
}
