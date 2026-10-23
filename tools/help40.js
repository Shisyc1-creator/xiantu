/* 帮助归位及账本查看。所有文字对应现有玩法。 */
(()=>{
'use strict';
const S=XTSandbox;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const topics=[
 ['travel','场景旅行','青石县街巷与回执委托','青石县有二十处公共地点，沿十字街、南门大街、东西横街通向衙前街、民巷、工坊、客栈、城门与河埠。点地图地点沿连线行走，小范围移动不耗日，跨区仍按真实行程。来安客栈杜娘可托你问河埠、查仓廪、核药铺、交回执；每次正式办理一日，三十日内完成付六枚灵石，人物会保留你的履约或失约记录。'],
 ['money','货币交易','府城会期与寄拍结款','沿实际路线到云安府，从商街到拍行柜台，再进云安会场和会后茶厅。每九十日开七日，一届只登记一次，入场5灵石；可候会推进真实日期，遇事件或寿尽会停止。柜台验看每批货收2灵石，凭据九十日有效；确认底价后才交出真实物品。成交佣金为成交价10%向上取整，净款须回柜台领取；流拍可取回未成交货物。不能竞拍自己的寄拍品。'],
 ['relations','人物关系','拍会后的具体往来','云安拍会结束后，与你实际交易或竞价过的人会在会后茶厅回应。礼貌致意增加信任2，坦然回应增加敬重1，同一段往来只结算一次；人物离场或死亡时不能远程交谈。只有旁观不会凭空产生恩怨。'],
 ['start','开始修行','事情进度与事件完成','场景的事情进度显示待处理、进行中、待领取和已结束。事件选项条件不足仍是待处理；真正处理后记下所选办法与结果，失利也明确标注。旧档已做事件只显示已有完成记录，不补造历史选项。上一条场景行动提示仅在它发生的页面与房间显示，行囊不再携带其他地点的互动卡片。'],
 ['money','货币交易','县城拍卖与押款','青石县商街通往青石拍场。免费入场，预览聚气散、引气篇和引灵剑；开场后逐件举牌。领先报价转为押款，被超价退回；无人加价才落槌，成交品进入行囊。等候听下一口，不再加价则旁观至落槌，但已举牌的承诺仍有效。竞买人用有限私款按自身需要出价，不随玩家身家补钱。离场退清未成交押款，拍场库存与人物私款不会刷新补满；流拍货隔三十日可再上拍。保存失败撤回本次钱物操作。云安府另有正式会期与寄拍柜台。'],
 ['travel','场景旅行','相连房间与眼前物件','本地地图用房间方框与道路连线显示通路。深色为当前位置，点击任一可达地点会沿已有连线逐段走过去。地图下方不再重复列移动按钮，再选择眼前人物或物件。院落内移动和阅读不推进日期，跨地区仍按真实路线旅行。地图可上下左右拖动查看；调查只说明所见，不会凭空发放物品。'],
 ['start','开始修行','修行录与行动反馈','场景底部保留修行录摘要，点击可展开最近记录。行动后查看实际经过时间、钱物和关系变化；条件不足、制作失败、事件中断都会说明，不把没有完成的事当作成功。'],
 ['relations','人物关系','话题对话与间隔','先当面选择交谈，再选近况、当地生计或往事。打开、阅读、结束对话不推进日期；正式交谈耗一日，话题共用交谈间隔。人物回应结合职责、药路与亲友状况，不因换话题重复发放奖励。'],
 ['money','货币交易','药讯、柜台与寄售结算','县城场景只展示简短药讯，点开查看详情。供药与运药找实际掌柜；百草铺往来账放在商街柜台及掌柜处，钱匣和交接记录默认收起；柳丹师处办理当面寄售垫款。商店先看商品，铺账放在商品列表后方。'],
 ['start','开始修行','本局模式','大众模式默认显示场景操作指引，硬核模式默认收起，二者都能查阅帮助。当前两档共用成长、资源和生死结算；选定后本局不可切换，后人沿用本局模式。旧档升级前先保存原档备份，不重发资产或重置已用次数。'],
 ['origin','出身与家','住处权限与私人物柜','家园首页分别显示出身住处和个人经营产业。家族旧居、宗族房间可住和使用自己的物柜，不授予整个家族的产权；弟子床位依赖本门身份，不能作为遗产转给没有资格的后人。暂居处有期限，可当面续住；期满或失去床位资格，仍可到门厅取回自己名下的寄存物。'],
 ['travel','场景旅行','九州、诸国与府县','九州是地理文化分区，国家另有疆界；府县归国家治理，各州并非各有相同数量的府县。起始一带为大梁·青州·云安府·青石县。地图中的远方地名不等于可以直接旅行的目的地，实际行程以相邻路线和已开放入口为准。'],
 ['travel','场景旅行','修士与地方','城镇以凡人生活和炼气交易为主，筑基修士可任职或往来；更高境界也可以访友交易，但长期修行另需合格灵气和供给。人物境界、当地人口与修炼环境分别判断，不把区域统计当作每处固定人数。'],
 ['relations','人物关系','请教修行与论道','向境界更高的修士请教修行，向同阶或较低境界的修士交流论道，耗时七日，并有再次交流的间隔。先相识并取得敬重才能请教。当前这类交流增进信任、相知与敬重，不会直接赠送修为或学会一部新功法。'],
 ['start','开始修行','起步与突破','在场景中选择房间，再点人物交谈或交易。修行至年末会推进日期；修为圆满后准备突破。灵根影响成长效率，不封锁境界。闭关前查看费用、效率和出关年龄。'],
 ['origin','出身与家','落脚处与产业','开局家人可在出生地寻访。租院、宅院和洞府通过青石县牙行签约；可住的家庭旧居不等于个人可出售的产业。产业页可查看租期，修建与取物须亲自到场。'],
 ['travel','场景旅行','找人与赶路','场景顶部打开地图或路线，选择已开放的目的地。路程按实际天数推进，途中事件可能中断；处理事件后继续剩余行程。交易和互动需要到本人所在房间，不能远程买卖。'],
 ['money','货币交易','整枚灵石与应计收益','可用灵石按整枚支付。营生和灵田看护按实际经过的日期累计，不足一枚的收益保留为应计权益，足额后自动到账。应计权益不能提前花费。年收入和费用先确定整数报价，物价变化不追改已签的灵田报酬。'],
 ['money','货币交易','买卖与铺账','不同商人经营不同货物，购买前查看单价与库存，出售受收购钱匣限制。药路供货、运药与垫款按约定结算。百草铺换掌柜后，库存、寄售欠款和已记名债权继续保留，领款需本人到场。'],
 ['arts','器物功法','取得与研习','书册须购得、获赠或向本门执事兑换。行囊阅读后，在修行的功法页入门与研习，再选择一门主修心法和最多两门术法。装备在行囊查看用途和使用条件。'],
 ['craft','制作经营','材料、设施与工时','制作需要已学配方、材料、灵石与可用设施。可在炉坊租炉、产业内建丹房器室，或在安全落脚处使用便携工具。开工消耗材料；失败、中断或寿尽不退还已消耗的费用，也不发成品。'],
 ['craft','制作经营','委派与月俸','雇员需产业容纳与安置费用。月俸随世界时间结算，欠薪会停工、离去；雇员也有寿元。每次安排一项工作，完成后产出进入产业仓库。关闭游戏不自动推进岁月。'],
 ['relations','人物关系','交情与亲属','交谈、互助和共同经历建立具体人物关系。道侣、结拜、师承需要真实人物及相应条件，不能靠一个称号生成新亲友。人物会老去，关系和旧事会留在档案。'],
 ['saves','传承存档','保存与接续','自动存档与三个手动卷宗保存在当前浏览器。换浏览器或入口路径前应保存备份。传承需要已出生、年满八岁的合格后人；后人继承规定范围内的资产，年龄与世界日期连续，不继承先人的修为。'],
 ['saves','传承存档','旧档备份','首次载入旧格式时先保存原始存档备份，再把整数余额与应计权益分开。重复载入不会重复发钱。可以下载迁移前原档留存；本地存储写入失败时不会进行旧档迁移。']
];
topics.push(['travel','场景旅行','九州地志',Object.values(WORLD['凡界'].states).map(s=>s.name+'：'+(s.note||'')).join('；')]);
topics.push(['travel','场景旅行','诸国与地方秩序','凡界有三朝，另有八至十个边地、山地或海岛国，以及二至三个道国。国家与九州不一一对应，亦有无主山野。大梁是起始王朝的工作名；官府管理户籍、田赋与道路，修行家族、山门和书院另有传承与资源网络。尚未确定的国名与疆界不视为已开放目的地。']);
topics.push(['travel','场景旅行','各地修士与灵气参考',Object.values(XTWorld36.placeRules).map(r=>r.label+'：灵气 '+r.qi+'；'+r.usual+'；'+r.upper).join('。')]);
function balance(){
 if(!G)return '';const w=stoneAccount(G);
 const fraction=w.pendingN==='0'?'0':esc(w.pendingN)+' / '+esc(w.pendingD);
 return `<article class="sb-card"><h4>灵石账本</h4><p>可用 ${G.stones} 枚 · 待结权益 ${fraction} 枚</p><p>待结权益不足一枚，不能用于支付。</p><details><summary>最近收支</summary>${w.entries.slice(-20).reverse().map(e=>`<p>第 ${e.at} 日 · ${esc(e.source)} · ${e.amount>0?'+':''}${e.amount} 枚 · 余额 ${e.balance}</p>`).join('')||'<p>暂无收支。</p>'}</details></article>`;
}
function render(){
 const category=S.view.sub||'start';
 const scene=document.getElementById('scene');document.body.classList.add('sb-screen');
 const categories=[...new Map(topics.map(t=>[t[0],t[1]])).entries()];
 scene.innerHTML=`<section class="sb-shell"><header class="sb-head"><h2>帮助</h2><button class="sb-btn" id="helpBack40">返回设置</button></header><nav class="sb-tabs">${categories.map(([id,title])=>`<button class="sb-btn ${id===category?'on':''}" data-help40="${id}">${title}</button>`).join('')}</nav><div class="sb-scroll"><label for="helpSearch40">搜索全部帮助</label><input id="helpSearch40" type="search" placeholder="输入灵石、租炉、传承等关键词" style="width:100%;box-sizing:border-box;margin:12px 0;padding:12px"><div id="helpResults40" style="overflow-wrap:anywhere"></div></div></section>`;
 const results=scene.querySelector('#helpResults40');
 function update(q=''){
  const found=topics.filter(t=>q?t.join(' ').includes(q):t[0]===category);
  results.innerHTML=found.map(t=>`<article class="sb-card"><h4>${esc(t[2])}</h4><p>${esc(t[3])}</p></article>`).join('')||'<p>没有匹配的帮助，可换个关键词。</p>';
  if(!q&&category==='money')results.innerHTML+=balance();
  if(!q&&category==='saves'){
   let backups=[];try{backups=JSON.parse(localStorage.getItem('xiantu_migration40_backups')||'[]');}catch(e){}
   results.innerHTML+=backups.map((b,i)=>`<button class="sb-btn" data-backup40="${i}">下载迁移前原档 · ${esc(b.at)}</button>`).join('');
   results.querySelectorAll('[data-backup40]').forEach(b=>b.onclick=()=>{
    const data=backups[Number(b.dataset.backup40)],url=URL.createObjectURL(new Blob([data.raw],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='仙途_迁移前原档_'+b.dataset.backup40+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
   });
  }
 }
 scene.querySelector('#helpSearch40').oninput=e=>update(e.target.value.trim());
 scene.querySelector('#helpBack40').onclick=()=>S.go('self','settings');
 scene.querySelectorAll('[data-help40]').forEach(b=>b.onclick=()=>S.go('guide',b.dataset.help40));update();
}
window.XTHelp40={render,topics};
const oldSettings=openSettings,oldScene=renderScene;
openSettings=function(){oldSettings();const panel=document.getElementById('settingsPanel'),foot=panel.querySelector('.settings-foot');
 if(!panel.querySelector('#openHelp40')){const b=document.createElement('button');b.id='openHelp40';b.className='act ghost';b.textContent='帮助';b.onclick=()=>{panel.hidden=true;S.go('guide','start');};foot.prepend(b);}
};
renderScene=function(){oldScene();if(G?.mode!=='idle'||S.view.tab==='guide')return;
 const head=document.querySelector('#scene .sb-head');if(!head||head.querySelector('#contextHelp40'))return;
 const cat=S.view.tab==='cult'&&S.view.sub==='arts'?'arts':({shop:'money',home:'origin',craft:'craft',scene:'travel',self:'relations'})[S.view.tab]||'start';
 const b=document.createElement('button');b.id='contextHelp40';b.className='sb-btn';b.textContent='?';b.setAttribute('aria-label','查看相关帮助');b.onclick=()=>S.go('guide',S.view.sub==='settings'?'saves':cat);head.append(b);
};
if(G)render();
})();
