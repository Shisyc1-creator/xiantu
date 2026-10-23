from pathlib import Path
import re

root=Path(__file__).resolve().parent.parent
entry=root/'prototype/index.html'
html=entry.read_text(encoding='utf-8')
assert '/* 第三十二批 · 青绿山水长卷 */' not in html
css=(root/'tools/visual32.css').read_text(encoding='utf-8')
html=html.replace('</style>','\n'+css+'\n</style>',1)
for name in ['stateMapSvg','localMapSvg','mortalMapSvg','spiritMapSvg','eyeNetSvg']:
    pattern=r'^function '+name+r'\([^\n]*\n[\s\S]*?(?=^function |^const CULTIVATOR_CENSUS|\Z)'
    html,count=re.subn(pattern,'',html,count=1,flags=re.M)
    assert count==1,name
atlas=(root/'tools/atlas32.js').read_text(encoding='utf-8')
html=html.replace('const MAP_POS = {',atlas+'\n\nconst MAP_POS = {',1)
# Main screen: a painted scene with real location text and a quiet header.
html=html.replace("'<div class=\"hud-left\">'+","'<div class=\"hud-brand\"><strong>仙途</strong><span class=\"vermilion-seal\">修行纪</span></div><div class=\"hud-left\">'+",1)
needle="  html+='<div class=\"scene-text\">'+body+'</div>';"
vista="""  html='<div class="scene-vista"><div class="vista-copy"><small>山河入卷 · 一念问道</small><h2>'+placeName(G.place||'village')+'</h2><p>'+curRealmTxt()+'　·　'+eraLabel()+'</p></div><span class="vista-chapter">仙途 · 修行纪</span></div>'+html;
"""
assert needle in html
html=html.replace(needle,vista+needle,1)
html=html.replace("  html='<div style=\"flex:1 1 0;min-height:0\"></div>'+html+'<div style=\"flex:1 1 0;min-height:0\"></div>';",'')
# App navigation replaces fallback symbols with legible brush-like characters.
html=html.replace('<span class="nav-icon">☯</span>','<span class="nav-icon">修</span>').replace('<span class="nav-icon">⌖</span>','<span class="nav-icon">山</span>')
# Opening cover and creation remain on the same page, preserving game creation events.
start="""    '<div class="start">'+
      '<h1>仙<em>途</em></h1>'+"""
cover="""    '<div class="start"><section class="start-cover"><div class="start-cover-copy"><div class="start-kicker">山 河 入 卷 · 一 念 问 道</div><h1>仙<em>途</em></h1><div class="epigraph">一缕灵气入尘世，<br>万里山河问长生。</div><p class="cover-intro">从一介凡人，到山海之外。<br>行走、修炼、遇见，写下属于你的一世仙途。</p><div class="cover-actions"><button class="act solid" id="coverBegin">踏 入 仙 途　›</button>'+(hasAuto?'<button class="act cover-link" id="coverResume">续 前 缘</button>':'')+(hasSlot?'<button class="act cover-link" id="coverSaves">寻 回 旧 卷</button>':'')+'</div></div><div class="cover-footer">仙途 · 修行纪　/　本地存档 · 山河长卷</div><div class="cover-scroll">向下展开 · 此生来处　↓</div></section><section class="creation-sheet" id="creationSheet"><div class="creation-header"><span class="vermilion-seal">此生来处</span><div><small>一切际遇，自此而始</small><h2>落笔此生</h2><p>取一个道号，选一段来处。灵根与际遇，将在入世后揭晓。</p></div></div>'+"""
assert start in html
html=html.replace(start,cover,1)
ending="""    '</div>';

  let cur=names[0];"""
assert ending in html
html=html.replace(ending,"""    '</section></div>';
  document.getElementById('coverBegin').onclick=()=>document.getElementById('creationSheet').scrollIntoView({behavior:readUIPrefs().motion===false?'instant':'smooth',block:'start'});
  const coverResume=document.getElementById('coverResume');if(coverResume)coverResume.onclick=()=>{if(restore(sGet(SAVE_KEY)))render();};
  const coverSaves=document.getElementById('coverSaves');if(coverSaves)coverSaves.onclick=openSaves;

  let cur=names[0];""",1)
# Map title, navigation layers, accessible controls and truthful breadcrumb names.
html=html.replace("('青州'))","((WORLD['凡界'].states[mapNav.state]||WORLD['凡界'].states['青']).name))",1)
html=html.replace("mapNav.world==='灵界' ? '灵界' : '凡界',","mapNav.world==='灵界' ? '灵界' : mapNav.world==='渡界' ? '九灵眼渡界网' : '凡界',",1)
html=html.replace("'<div class=\"map-page-head\"><div><h3>山 河 地 图</h3><p>道阻且长，行则将至。地图记录已知之地，脚程决定你何时抵达。</p></div>","'<div class=\"map-page-head\"><div class=\"map-heading\"><span class=\"vermilion-seal\">仙途图志</span><div><h3>山 河 图 志</h3><p>一县烟火，九州山河。行至何处，便识何处。</p></div></div>",1)
needle="    '<div class=\"mapcrumb\">'+crumbHtml+'</div>'+ "
replacement="""    '<div class="map-topline"><div class="mapcrumb">'+crumbHtml+'</div><div class="map-layers" aria-label="地图层级"><button data-map-level="local" class="'+(mapNav.level==='local'?'active':'')+'">县内</button><button data-map-level="state" class="'+(mapNav.level==='state'?'active':'')+'">州域</button><button data-map-level="界" class="'+(mapNav.level==='界'?'active':'')+'">世界</button></div></div>'+ """
assert needle in html
html=html.replace(needle,replacement,1)
needle='  renderMap();\n  md.querySelectorAll(\'[data-crumb]\')'
replacement="""  renderMap();
  bindAtlasControls();
  md.scrollTop=0;
  md.querySelectorAll('[data-map-level]').forEach(b=>b.onclick=()=>{const level=b.dataset.mapLevel;mapNav=level==='local'?{level:'local',world:'凡界',state:'青'}:level==='state'?{level:'state',world:mapNav.world==='灵界'?'灵界':'凡界',state:mapNav.world==='灵界'?(mapNav.state in WORLD['灵界'].states?mapNav.state:'中州'):(mapNav.state in WORLD['凡界'].states?mapNav.state:'青')}:{level:'界',world:mapNav.world,state:mapNav.state};showMap();});
  md.querySelectorAll('[data-crumb]')"""
assert needle in html
html=html.replace(needle,replacement,1)
entry.write_text(html,encoding='utf-8')
print('Applied batch 32 visual layer and illustrated maps.')
