/* 身世资料合并：地域、家庭、族属与九条童年路径。 */
(()=>{'use strict';
const S=XTSandbox,W=XTWorld36,V=S.view,extra=XTBackground47Data;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
Object.assign(ORIGINS,extra.origins);Object.assign(FAMILY_OF,extra.family);
const ORIGIN_AXES = {
  '寒门散修': { social:'寒门与流动家庭', families:['采药农户','渡口船户','无亲属的乡野寄居者'], lineage:'人族', group:'由家境与地域共同决定' },
  '宗门外门弟子': { social:'宗门附属与役使家庭', families:['杂役家庭','药园役户','执事房寄居者'], lineage:'人族', group:'山门周边社群' },
  '没落家族子弟': { social:'衰败家族与旁支', families:['家族旁支','负债旧族','由老仆抚养的遗脉'], lineage:'人族', group:'县城家族与旧宅邻里' },
  '世家嫡系': { social:'地方名门与宗族', families:['长房嫡支','偏房支系','受长辈收徒的族中子弟'], lineage:'人族', group:'府县名门与姻亲网络' },
  '港口船户': { social:'港口船户与船行亲族', families:['船户长房','盐行旁支','失船遗孤寄居'], lineage:'人族', group:'港口船行、盐户与岛链商旅' },
  '湖泽水族寄养家庭': { social:'水族亲缘与渡口寄养家庭', families:['人族船家寄养','水府旁支避祸','两族合籍家庭'], lineageByVariant:['水族亲缘·人族寄养','水族旁支·鳞类支系','人族/水族混血'], group:'湖泽水族与渡口盟约' },
  '北地部族家庭': { social:'北地部族、军户与边市家庭', families:['关城军户','逐水牧民','边市中人家庭'], lineage:'人族（北地部族）', group:'北地诸部、军镇与驿商' },
  '妖血遗孤': { social:'异族血脉与寄养/失散家庭', families:['山林妖族亲缘','水族亲缘','被猎妖人收养的异族遗孤'], lineageByVariant:['山林妖族·狐类支系','水族·蛟裔支系','异族遗脉·具体支系待查'], group:'按籍贯匹配的异族聚落' },
  '魔道弃徒': { social:'魔道势力中的役使/旁支家庭', families:['丹房役户','宗门旁支','库房与商队从属家庭'], lineage:'人族（魔道经历）', group:'当地魔道势力及其依附者' }
};

/* 完整族属池底稿。特定族属分支通过妖血遗孤与湖泽水族路径进入开局；其余族属先有地点兼容和社会规则记录，待家庭线完成后再开放。 */
const LINEAGE_POOL = {
  '人族': { habitat:['全域'], identity:'王朝户籍、宗族、行会或门派关系决定日常身份。' },
  '山林妖族': { habitat:['北地关塞圈','山林共居圈','丘陵乡野'], identity:'依氏族、猎场与季节盟约生活；支系依生境命名，不预设敌对。' },
  '水族': { habitat:['湖泽水路圈','海港岛链圈','河口渡镇'], identity:'依水府、渡口盟约和禁航水域组织；不同支系保有各自航道与习俗。' },
  '草木灵/山灵': { habitat:['山林共居圈','灵脉古林'], identity:'常以小型聚落、守脉盟约或依附古树灵泉维持生活。' },
  '混血': { habitat:['多族群边镇、港口、商路'], identity:'亲缘可能连接不同社群；身份认定随地方习俗与本人关系而异。' },
  '身份未明': { habitat:['全域'], identity:'族属线索尚未确认，可由后续亲缘、旧物或地方传闻揭开。' }
};

/* 三个完整族群生活圈样例：居民、组织、资源、规则和冲突必须同时落在地点上。 */
const COMMUNITY_CIRCLES = {
  frontier: {
    name:'北地关塞圈', habitats:['beiyuan-yanmen'],
    residents:'军镇户、驿商、牧民与狐狼类妖族在关城、草场和山口之间往来；冬季部族迁徙会改变边市与巡防路线。',
    organization:'城门与关卡由军府掌握，草场和迁徙水源由部族盟约协调；修士宗门守山口，但须与军镇、部族议定通行。',
    resource:'边市贸易、驿道情报、兽皮药材、寒地灵脉和守关委托。',
    tension:'军镇征役、草场边界、冬季迁徙、关税和猎场越界会同时牵动军民与妖族关系。',
    origins:'军户、驿商、牧民家庭、山口小修士家族、被部族或军户收养的异族遗孤。',
    relation:'关城依赖部族预警和驿商补给；部族需要盐铁、药材与越冬粮，双方以季节盟约维系边贸。'
  },
  woodland: {
    name:'山林共居圈', habitats:['daliang-yu','beiyuan-yanmen','taiyue-daoguo','taiyue-yong'],
    residents:'山民、采药户、山林妖族支系与少量草木灵聚落；各有村寨、迁徙地和禁地，不组成单一妖国。',
    organization:'山民受县里保甲与山门约束；妖族以氏族、季节盟约和猎场议约维持秩序，跨界纠纷由边市中人调停。',
    resource:'灵药、木灵材、山泉灵眼、兽道情报与季节性猎场。',
    tension:'采药边界、猎场越界、山门开路与妖族迁徙相互冲突；同一条山道会随盟约和封山令改变通行条件。',
    origins:'寒门采药户、山门药园役户、山民旁支、异族寄养者。',
    relation:'山民为妖族提供盐铁和山外消息，妖族以药材、引路和守山盟约回报；猎妖与护林两种生计并存。'
  },
  wetland: {
    name:'湖泽水路圈', habitats:['daliang-yan','nanyue-canglan','nanyue-jing'],
    residents:'渔户、船户、圩田人家、水族支系、蛟裔与泽地妖族沿河港、洲渚和水府分布。',
    organization:'县衙管堤田与税契，行会管船期和渡价；水族聚落依水府、家族或渡口盟约自治，须事先约定航道与禁渊。',
    resource:'水府灵眼、潮汐/汛期灵材、沉木、鱼丹、河运与跨州消息。',
    tension:'堤坝改道、渔期、沉船打捞权、禁渊边界与汛灾救援常引发人族和水族的利益冲突。',
    origins:'渔户船户、河运商家、湖泽修士家族、水族寄养或混血家庭。',
    relation:'人族船行依赖水族识流与救援，水族聚落需要港市盐粮和铁器；往来靠水契，不以“敌对种族”预设。'
  },
  harbor: {
    name:'海港岛链圈', habitats:['donghai-hailing'],
    residents:'港民、盐户、远海岛民、水族商旅与海妖部族；外来者沿港口、补给岛和季风航线聚居。',
    organization:'港府收税并划泊位，船行、岛盟和海族水府共同维护航路；远岛效忠关系随季风贸易、护航约和补给而变化。',
    resource:'盐、海兽材料、潮汐灵脉、岛屿灵植、失事船货与跨海商路。',
    tension:'护航费用、季风误期、岛礁归属、沉船打捞和海族禁航水域会影响贸易与亲族安危。',
    origins:'港口船户、盐商/船行旁支、岛民迁居者、海族商旅的寄养或混血后代。',
    relation:'港口以水契和船籍承认异族商旅；海族提供航标、潮汐消息和护航，港民提供修船、盐粮与陆上中介。'
  },
  routes: {
    name:'州府商路圈', habitats:['daliang-qing'],
    residents:'县民、坊市手艺人、商旅、地方小家族与山野小部族。',
    organization:'县衙、坊市行会和周边宗门各管一段秩序，驿路与集市承担跨族群交易。',
    resource:'驿路消息、集市工作、丘陵药材、田产和小额灵石交易。',
    tension:'税契、坊市摊位、山货采集权和县城扩路造成的田界争议。',
    origins:'农户、工匠、商户、小吏家庭与地方修士家族。',
    relation:'在商路与县城中形成混居，但远郊仍按宗族、村约和山地盟约生活。'
  }
};

function communityFor(ctx){
  const id=ctx&&ctx.id;
  for(const key in COMMUNITY_CIRCLES) if(COMMUNITY_CIRCLES[key].habitats.includes(id)) return COMMUNITY_CIRCLES[key];
  return COMMUNITY_CIRCLES.routes;
}
function visibleOriginVariants(origin, ctx){
  const options=(ORIGINS[origin]&&ORIGINS[origin].variants||[]).map((v,i)=>({v,i}));
  if(origin!=='妖血遗孤') return options;
  const circle=Object.keys(COMMUNITY_CIRCLES).find(k=>COMMUNITY_CIRCLES[k].habitats.includes(ctx&&ctx.id))||'routes';
  return options.filter(({i})=>i===2 || (i===0&&(circle==='woodland'||circle==='frontier'||(ctx&&ctx.id==='daliang-qing')))
    || (i===1&&(circle==='wetland'||circle==='harbor')));
}
function backgroundFor(origin, variantIdx, ctx){
  const axes=ORIGIN_AXES[origin]||{social:origin,families:['地方家庭'],lineage:'人族',group:'当地聚落'};
  const community=communityFor(ctx);
  const variantFamily=axes.families[Math.max(0,Math.min(axes.families.length-1,variantIdx||0))];
  const lineage=axes.lineageByVariant?axes.lineageByVariant[Math.max(0,Math.min(axes.lineageByVariant.length-1,variantIdx||0))]:axes.lineage;
  return {social:axes.social,family:variantFamily,lineage,community:community.name,communityKey:Object.keys(COMMUNITY_CIRCLES).find(k=>COMMUNITY_CIRCLES[k]===community)||'routes',
    localGroups:community.residents,localRule:community.organization,localResource:community.resource,localTension:community.tension,localRelation:community.relation};
}

/* 开局地域池：每条记录是一套可玩县域的命名与地貌档案。
   权重按出身约束；同一套本地路线和地点机制会套用当地名称，随机结果写入存档。 */
const BIRTH_CONTEXTS = [
  { id:'daliang-qing', country:'大梁', state:'青州', stateKey:'青', prefecture:'云安府', county:'青石县',
    terrain:'丘陵、田地与驿河', culture:'县城商市与乡村宗族并存', peoples:'人族县民为主；山野有狐、蛇等妖族小部', bloodCult:'血河宗', sectName:'太岳宗',
    weights:{'寒门散修':3,'宗门外门弟子':3,'没落家族子弟':4,'世家嫡系':3,'妖血遗孤':2,'魔道弃徒':2,'港口船户':0,'湖泽水族寄养家庭':0,'北地部族家庭':0},
    places:{village:'落雁村',ridge:'黑风岭',county:'青石县',market:'城南坊市',temple:'青云观',cliff:'断云崖',prefecture:'云安府城',riverTown:'白水渡镇',spiritMarket:'落霞坊市',taiyueSect:'太岳宗外山',mistSecret:'玄雾古境',river:'白水河'} },
  { id:'daliang-yu', country:'大梁', state:'豫州', stateKey:'豫', prefecture:'丰陵府', county:'洛原县',
    terrain:'中原沃野、丘陵与粮道', culture:'屯田、书院和官仓沿驿路分布', peoples:'以人族农户与书院门生为主；古林有木灵与山妖聚落', bloodCult:'血河宗', sectName:'玄都道宫',
    weights:{'寒门散修':3,'宗门外门弟子':2,'没落家族子弟':3,'世家嫡系':4,'妖血遗孤':1,'魔道弃徒':2,'港口船户':0,'湖泽水族寄养家庭':0,'北地部族家庭':0},
    places:{village:'麦陵村',ridge:'伏牛岭',county:'洛原县',market:'丰陵南市',temple:'玄都观',cliff:'石门峡',prefecture:'丰陵府城',riverTown:'漕口镇',spiritMarket:'中原灵市',taiyueSect:'玄都道宫外院',mistSecret:'古柏遗境',river:'洛水'} },
  { id:'daliang-yan', country:'大梁', state:'兖州', stateKey:'兖', prefecture:'济川府', county:'东陵县',
    terrain:'河网、运渠与平原渡口', culture:'漕运、粮仓和行会控制水路节点', peoples:'人族漕户与商帮为主；运河水府和水族聚落沿河共存', bloodCult:'血河宗', sectName:'稷下学宫',
    weights:{'寒门散修':3,'宗门外门弟子':2,'没落家族子弟':3,'世家嫡系':4,'妖血遗孤':2,'魔道弃徒':1,'港口船户':2,'湖泽水族寄养家庭':8,'北地部族家庭':0},
    places:{village:'芦堤村',ridge:'断潮岗',county:'东陵县',market:'济川水市',temple:'稷下别院',cliff:'回澜峡',prefecture:'济川府城',riverTown:'三闸渡镇',spiritMarket:'通济坊市',taiyueSect:'河图书宫外院',mistSecret:'水府旧境',river:'通河'} },
  { id:'beiyuan-yanmen', country:'北曜国', state:'冀州', stateKey:'冀', prefecture:'雁门府', county:'镇朔县',
    terrain:'北地山口、草场与边城', culture:'军镇、驿商和山地村落相连', peoples:'人族军镇、北地诸部与狐狼类妖族混居', bloodCult:'赤骨门', sectName:'玄甲宗',
    weights:{'寒门散修':4,'宗门外门弟子':3,'没落家族子弟':2,'世家嫡系':1,'妖血遗孤':4,'魔道弃徒':4,'港口船户':0,'湖泽水族寄养家庭':0,'北地部族家庭':12},
    places:{village:'石烽村',ridge:'狼脊岭',county:'镇朔县',market:'北关集',temple:'寒松观',cliff:'落星峡',prefecture:'雁门府城',riverTown:'饮马渡',spiritMarket:'朔风坊市',taiyueSect:'玄甲宗外山',mistSecret:'古烽秘境',river:'黑水河'} },
  { id:'nanyue-canglan', country:'南越国', state:'扬州', stateKey:'扬', prefecture:'沧澜府', county:'柳津县',
    terrain:'江汊、湖泽与密林', culture:'船户、药户和水路商帮往来频繁', peoples:'船户与水族、蛟裔交往密切；湖泽妖部散居', bloodCult:'沉水教', sectName:'百川门',
    weights:{'寒门散修':3,'宗门外门弟子':2,'没落家族子弟':2,'世家嫡系':3,'妖血遗孤':4,'魔道弃徒':3,'港口船户':3,'湖泽水族寄养家庭':8,'北地部族家庭':0},
    places:{village:'芦花村',ridge:'青螺岭',county:'柳津县',market:'南埠坊市',temple:'听潮观',cliff:'回龙涧',prefecture:'沧澜府城',riverTown:'三汊渡镇',spiritMarket:'碧波坊市',taiyueSect:'百川门外山',mistSecret:'沉月泽境',river:'沧澜江'} },
  { id:'nanyue-jing', country:'南越国', state:'荆州', stateKey:'荆', prefecture:'洞庭府', county:'云梦县',
    terrain:'大湖、洲渚与湿地水网', culture:'圩田、渔市和水路宗门围绕湖汊兴起', peoples:'人族水乡聚落、水族渡口与泽地妖族交错', bloodCult:'沉水教', sectName:'百川门',
    weights:{'寒门散修':3,'宗门外门弟子':2,'没落家族子弟':2,'世家嫡系':3,'妖血遗孤':4,'魔道弃徒':3,'港口船户':0,'湖泽水族寄养家庭':10,'北地部族家庭':0},
    places:{village:'菱角村',ridge:'云梦岭',county:'云梦县',market:'洞庭水集',temple:'镇泽观',cliff:'落雁矶',prefecture:'洞庭府城',riverTown:'蒲帆渡镇',spiritMarket:'镜湖坊市',taiyueSect:'百川门西院',mistSecret:'泽国遗府',river:'云梦泽河'} },
  { id:'donghai-hailing', country:'海陵诸国', state:'徐州', stateKey:'徐', prefecture:'海陵府', county:'临潮县',
    terrain:'海湾、盐田与沿岸丘陵', culture:'渔户、盐商和海路行会聚居；近海连着岛链', peoples:'人族港民、岛民与海族聚居区相邻', bloodCult:'黑潮会', sectName:'沧溟宗',
    weights:{'寒门散修':2,'宗门外门弟子':1,'没落家族子弟':3,'世家嫡系':4,'妖血遗孤':2,'魔道弃徒':1,'港口船户':12,'湖泽水族寄养家庭':5,'北地部族家庭':0},
    places:{village:'潮生村',ridge:'鹤鸣岭',county:'临潮县',market:'盐桥坊市',temple:'观海院',cliff:'听涛崖',prefecture:'海陵府城',riverTown:'白帆渡镇',spiritMarket:'万潮坊市',taiyueSect:'沧溟宗外山',mistSecret:'归墟遗境',river:'玉带河'} },
  { id:'taiyue-daoguo', country:'太岳道国', state:'梁州', stateKey:'梁', prefecture:'云岫府', county:'玄溪县',
    terrain:'层峦、药谷与山间盆地', culture:'道观、山门和世代药户共同立足', peoples:'道门人族、山妖与草木灵聚落并存', bloodCult:'枯荣坛', sectName:'太岳道院',
    weights:{'寒门散修':2,'宗门外门弟子':4,'没落家族子弟':3,'世家嫡系':2,'妖血遗孤':3,'魔道弃徒':4,'港口船户':0,'湖泽水族寄养家庭':0,'北地部族家庭':2},
    places:{village:'药王坪',ridge:'千叠岭',county:'玄溪县',market:'松风坊市',temple:'栖云观',cliff:'问道崖',prefecture:'云岫府城',riverTown:'青篁渡镇',spiritMarket:'太素坊市',taiyueSect:'太岳道院外山',mistSecret:'云中洞天',river:'玉泉溪'} },
  { id:'taiyue-yong', country:'太岳道国', state:'雍州', stateKey:'雍', prefecture:'丹崖府', county:'终南县',
    terrain:'高山关隘、古林与灵脉支脉', culture:'山门辖地、关城和山民聚落交错', peoples:'山地部族、石灵与古林妖族聚居', bloodCult:'枯荣坛', sectName:'太岳道院',
    weights:{'寒门散修':2,'宗门外门弟子':4,'没落家族子弟':3,'世家嫡系':2,'妖血遗孤':4,'魔道弃徒':4,'港口船户':0,'湖泽水族寄养家庭':0,'北地部族家庭':2},
    places:{village:'青崖村',ridge:'万仞岭',county:'终南县',market:'丹崖集',temple:'玄真观',cliff:'问心壁',prefecture:'丹崖府城',riverTown:'石门渡镇',spiritMarket:'玄岳坊市',taiyueSect:'太岳道院西院',mistSecret:'断脉洞天',river:'玉泉河'} }
];
const START_BIRTH_CONTEXT=BIRTH_CONTEXTS[0];
const BIRTH_CONTEXT_CANON={
  '{乡}':'village','{观}':'temple','青石县':'county','青州':'state','云安府':'prefecture',
  '黑风岭':'ridge','城南坊市':'market','断云崖':'cliff',
  '白水渡镇':'riverTown','落霞坊市':'spiritMarket','太岳宗外山':'taiyueSect','玄雾古境':'mistSecret',
  '白水河':'river','血河宗':'bloodCult','云安府城':'prefectureCity'
};
function copyBirthContext(ctx){ return JSON.parse(JSON.stringify(ctx)); }
function rollBirthContext(origin, excludeId){
  let options=BIRTH_CONTEXTS.filter(c=>(c.weights[origin]||0)>0);
  if(excludeId && options.length>1) options=options.filter(c=>c.id!==excludeId);
  const total=options.reduce((n,c)=>n+c.weights[origin],0);
  let r=Math.random()*total;
  for(const c of options){ r-=c.weights[origin]; if(r<0) return copyBirthContext(c); }
  return copyBirthContext(options[options.length-1]||START_BIRTH_CONTEXT);
}
function normalizeBirthContext(ctx){
  const match=BIRTH_CONTEXTS.find(c=>c.id===ctx?.id)||BIRTH_CONTEXTS.find(c=>c.county===ctx?.county&&c.state===ctx?.state)||START_BIRTH_CONTEXT;
  const out=Object.assign(copyBirthContext(match),ctx||{}, {places:Object.assign({},match.places,ctx&&ctx.places||{})});
  if(!ctx||ctx.country==='大梁（暂名）') out.country=match.country;
  return out;
}
function rerollBirthContext(){
  if(!G||G.mode!=='child') return;
  G.birthContext=rollBirthContext(G.origin,G.birthContext&&G.birthContext.id);
  G.fate=genFate(); save(); render();
}

const additions={
 '港口船户':{home:'船行后院住处',book:'听潮调息诀',from:'家中船牌所附的调息抄诀',kind:'family',route:'船行后院 → 旧船牌 → 家船之约 → 听潮授法',duty:['work','到货街完成一次短工','riverTown'],scenes:[['舱中灯火','你的铺盖放在船行后院，旧船牌由自己保管。共用船货仍由掌船人和账房经手。',['清点随身物件','问清船货取用规矩']],['缆绳与潮声','潮水带着泊船微微晃动，一根磨薄的缆绳还在受力。',['循受力处找出磨损（悟性+1）','先提醒靠船歇脚的人（心性+1）']],['先办一件事','旧货账还没有结清，你想先做一件能帮上忙的事。',['到货街挣一次工钱','整理自己的旧船牌与家书']],['听潮调息','旧船工把听潮时辨息的次序讲给你听。潮声只是引子，气须自己一点点辨明。',['记住呼吸的次序','记下调息时如何收功']]]},
 '湖泽水族寄养家庭':{home:'渡口合籍家舍',book:'涵水养息篇',from:'岸上亲人与水族来客共同留下的基础养息篇',kind:'family',route:'渡口家舍 → 双面水契 → 两家约定 → 涵水授法',duty:['gather','到岸边药坡完成一次采集','village'],scenes:[['水契的两面','屋里留着你的物柜，水契两面各记着一个名字。家人的牵挂并不因住在岸上或水下而更轻。',['收好自己的一面水契','把两家约定抄在一处']],['认水色','浅湾里漂来的水草忽然转了方向。你想起长辈说过，水色与水面并不总讲同一件事。',['观察水草转向的原因（悟性+1）','先提醒准备下水的人（心性+1）']],['岸上水下','两边亲人都希望你记得来路，你先挑一件眼下能做的事。',['去岸边药坡采集一次','整理自己的水契与家书']],['涵水养息','你照着养息篇缓缓辨认气息。亲缘是来处，怎样修行仍须自己学。',['记下守息次序','记下气息失稳时的收功办法']]]},
 '北地部族家庭':{home:'边村家帐',book:'朔风定息法',from:'家中旧册与部族口传的基础定息法',kind:'family',route:'边村家帐 → 军报路标 → 家中约定 → 朔风授法',duty:['work','到边市货街完成一次短工','county'],scenes:[['帐门向着背风处','家帐里的铺盖和物柜各有归属。军籍、牧约与商货虽在同一屋檐下，却不能混作个人财物。',['认清自己的床位与物柜','抄下公用物件的归还规矩']],['一封迟来的信','旧军报夹着两种日期，落款比送达早了许久。路上的风雪可能挡信，也可能挡住一笔该到的钱。',['核对日期与落款（悟性+1）','先把消息讲给等信的人（心性+1）']],['出门前的打算','边市就在驿道旁，山口还有未解的旧约。先办眼前的小事，才有余力继续问。',['到边市做一回短工','整理自己的军报与路标']],['朔风定息','长辈留下的定息法教人先稳住呼吸。北风仍从帐外经过，修行不会替你忘掉回家的路。',['记住定息的次序','记住用功前应有的准备']]]}
};
for(const [origin,a]of Object.entries(additions)){
 HOME_OF[origin]='village';
 W.starts[origin]={book:a.book,place:HOME_OF[origin],room:'square',method:a.from,absorb:.03,tag:'家中传授，按约起步'};
 MANUALS[a.book]={kind:'心法',tier:'黄',from:a.from,desc:a.from+'，可研习并选作主修。',effect:{absorb:.03,bt:0,life:0}};
 XTHome41.specs[origin]={name:a.home,kind:a.kind,owner:'家中共同住用',description:'家中分给你的起居处和私人物柜，共用物件仍须先问过家人。',letter:'旧物与家书里记着'+ORIGINS[origin].variants.map(v=>v.mark).join('、')+'的来历。'};
 XTOpening46.stories[origin]={route:a.route,scenes:a.scenes,duties:[a.duty,['h41:letter','整理一次家中旧物与家书',HOME_OF[origin]]]};
}
function context(){return G?.birthContext||START_BIRTH_CONTEXT;}
function localize(text,ctx=context()){
 const replacements=Object.entries(BIRTH_CONTEXT_CANON).map(([old,k])=>[old,k==='state'?ctx.state:k==='prefecture'?ctx.prefecture:k==='prefectureCity'?ctx.places.prefecture:k==='county'?ctx.county:k==='bloodCult'?ctx.bloodCult:ctx.places[k]]).filter(([,v])=>v);
 replacements.push(['青石拍场',ctx.county.replace(/县$/,'')+'拍场']);const table=Object.fromEntries(replacements),pattern=replacements.map(([k])=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).sort((a,b)=>b.length-a.length).join('|');
 return String(text||'').replace(new RegExp(pattern,'g'),m=>table[m]).replace(/大梁（暂名）|大梁/g,ctx.country);
}
const old={newGame,chooseChild,genFate,fillFate,placeName,renderChild,renderScene,showStart,restore,locationLabel:W.locationLabel};
genFate=function(){const f=old.genFate();if(G?.birthContext){f['乡']=G.birthContext.places.village;f['观']=G.birthContext.places.temple;}return f;};
fillFate=function(t){return localize(old.fillFate(t));};
placeName=function(k){return G?.birthContext?.places[k||G.place]||old.placeName(k);};
W.locationLabel=function(){const c=context();return [c.country,c.state,c.prefecture,c.county,placeName(G.place)===c.county?'':placeName(G.place)].filter(Boolean).join(' · ');};
newGame=function(...args){const inherited=args.length>=4&&G?.mode==='dead',ctx=inherited&&G.birthContext?JSON.parse(JSON.stringify(G.birthContext)):null;const r=old.newGame(...args);G.birthContext=ctx||rollBirthContext(G.origin);G.fate=genFate();if(!inherited){save();render();}return r;};
chooseChild=function(i){if(G?.mode==='child'&&!visibleOriginVariants(G.origin,context()).some(x=>x.i===Number(i)))return false;const out=old.chooseChild(i);if(G&&G.variantIdx!=null){G.background=backgroundFor(G.origin,G.variantIdx,context());G.lifeEvents[0].place=placeName(G.home);G.lifeEvents[0].country=context().country;G.lifeEvents[0].state=context().state;G.lifeEvents[0].prefecture=context().prefecture;G.lifeEvents[0].county=context().county;save();render();}return out;};
renderChild=function(){old.renderChild();if(!G)return;const el=document.querySelector('#scene .prologue');if(!el)return;const c=context(),circle=communityFor(c),head=document.createElement('section');head.className='background47';head.innerHTML='<b>籍贯：'+esc(c.country+' · '+c.state+' · '+c.prefecture+' · '+c.county)+'</b><p>'+esc(c.terrain+'；'+c.peoples)+'</p><details><summary>'+esc(circle.name)+'</summary><p>'+esc(circle.residents)+'</p><p>'+esc(circle.organization)+'</p><p>'+esc(circle.resource)+'</p><p>'+esc(circle.tension)+'</p></details><button class="sb-btn" id="rerollBirth47">重抽相符籍贯</button>';el.prepend(head);const kicker=el.querySelector('.pro-kicker'),body=el.querySelector('.pro-body'),title=el.querySelector('.scene-head'),meta=el.querySelector('.pro-meta');if(kicker)kicker.textContent='0岁 · 出生家庭';if(body)body.textContent='你诞生于'+c.country+'的'+c.county+'。先确定养育你的家庭，再从婴幼年开始走过关键成长经历。';if(title)title.textContent='出生时，由怎样的家庭照料你';if(meta)meta.textContent='选择家庭后从0岁开始；经历推动年月，测灵机会在成长路线中出现。';for(const button of el.querySelectorAll('[data-v]')){const info=backgroundFor(G.origin,Number(button.dataset.v),c),body=button.querySelector('.body');if(body)body.textContent=info.family+' · '+info.lineage;}head.querySelector('button').onclick=rerollBirthContext;const allowed=visibleOriginVariants(G.origin,c).map(x=>x.i);el.querySelectorAll('[data-v]').forEach(b=>{if(!allowed.includes(Number(b.dataset.v)))b.remove();});};
function creation(){const row=document.querySelector('#inName')?.closest('.field');if(!row||document.getElementById('inSurname47'))return;const extra=document.createElement('div');extra.className='names47';extra.innerHTML='<label>姓<input id="inSurname47" maxlength="3" placeholder="例如：沈"></label><label>名<input id="inGiven47" maxlength="5" placeholder="例如：行舟"></label>';row.prepend(extra);const full=row.querySelector('#inName');full.placeholder='也可在此直接填写完整姓名';const b=document.getElementById('btnStart'),click=b.onclick;b.onclick=function(e){const sur=document.getElementById('inSurname47').value.trim(),given=document.getElementById('inGiven47').value.trim();if(sur||given)document.getElementById('inName').value=sur+given;return click.call(this,e);};}
showStart=function(){old.showStart();creation();};
function normalizeLegacy(){if(!G.birthContext){const c=copyBirthContext(START_BIRTH_CONTEXT);if(G.fate?.['乡'])c.places.village=G.fate['乡'];if(G.fate?.['观'])c.places.temple=G.fate['观'];G.birthContext=c;}else G.birthContext=normalizeBirthContext(G.birthContext);}
restore=function(raw){let legacy;try{legacy=JSON.parse(raw);}catch(_){}const ok=old.restore(raw);if(ok){if(!legacy?.birthContext&&legacy?.fate){if(legacy.fate['乡'])G.fate['乡']=legacy.fate['乡'];if(legacy.fate['观'])G.fate['观']=legacy.fate['观'];}normalizeLegacy();if(G.variantIdx!=null&&!G.background)G.background=backgroundFor(G.origin,G.variantIdx,G.birthContext);}return ok;};
renderScene=function(){old.renderScene();if(!G)return;const scene=document.getElementById('scene');if(G.mode==='idle'&&V.tab==='self'&&G.background){const p=document.createElement('section');p.className='background47';const b=G.background;p.innerHTML='<h3>身世与来处</h3><p>'+esc(context().country+' · '+context().state+' · '+context().prefecture+' · '+context().county)+'</p><p>'+esc(b.social+' · '+b.family+' · '+b.lineage)+'</p><p>'+esc(b.community+'：'+b.localRelation)+'</p>';scene.querySelector('.sb-scroll')?.prepend(p);}
 if(G.mode==='idle'){for(const node of scene.querySelectorAll('h2,h3,.map-node44 text,.sb-place>p,.opening-route46')){if(node.children.length===0)node.textContent=localize(node.textContent);}}
};

const originContacts={
 '港口船户':{id:'harbor47',name:'周闻潮',role:'船行核账人',age:41,room:'square',event:'B47H',title:'旧船牌上的账',flag:'harborOldAccount',text:'周闻潮摊开两张货单，说旧船牌上的编号在船行簿里出现了两次。“要查清是补记还是重记，得先把手里这页抄清。你家人的去处与钱款，我还不能凭这一页断言。”'},
 '湖泽水族寄养家庭':{id:'water47',name:'澜姑',role:'水契传信人',age:46,room:'square',event:'B47W',title:'双面水契的回信',flag:'waterPactAsked',text:'澜姑把双面水契递到你面前。“两家都想听你的话。替他们传信也好，只认自己的去处也好，须由你亲口说。今天没有哪一边能替你定下终身的约。”'},
 '北地部族家庭':{id:'north47',name:'岑老驿',role:'退役驿卒',age:53,room:'square',event:'B47N',title:'迟报上的日期',flag:'northDispatch',text:'岑老驿带来一页迟到的军报副本。封套上的日期与落款不同，他指着印记说：“认得这个印，不能就说整封报都是真的。先抄下疑点，再找关城旧簿核验。”'}
};
for(const [origin,c]of Object.entries(originContacts))EVENTS.push({id:c.event,name:c.title,place:'home',once:true,w:13,cond:s=>s.origin===origin&&!s.flag[c.flag]&&W.alive(W.get(c.id)),text:c.text,opts:[
 {l:'抄清疑点，说明愿意继续查问',run:s=>{s.flag[c.flag]='recorded';s.attr.wu=Math.min(12,s.attr.wu+1);const r=W.relation(c.id);if(r){r.trust+=3;r.history.unshift({day:S.now(),text:'把'+c.title+'的疑点逐条抄下，尚待后续核验。'});}return {t:c.name+'把副页留给你，记下你愿意查问的打算。眼前只是得到线索，旧账与争议仍须以后到实际地点核验。悟性+1。',log:'记录身世线索：'+c.title};}},
 {l:'先不承诺，收好自己的旧物',run:s=>{s.flag[c.flag]='deferred';s.attr.xin=Math.min(12,s.attr.xin+1);return {t:c.name+'点头应下，没有替你签约。你收好旧物，记下尚未核验的说法。心性+1。',log:'暂缓追查身世线索：'+c.title};}}
]});
const chooseWithBackground47=chooseChild;
chooseChild=function(...args){const out=chooseWithBackground47(...args),c=originContacts[G?.origin];if(c&&(G?.root||G?.opening46?.childhood)&&!W.get(c.id)){const w=W.world();w.people[c.id]={id:c.id,name:c.name,role:c.role,sex:c.id==='water47'?'女':'男',realm:-1,layer:0,root:'无灵根',birth:CFG.eraStart*360-c.age*360,life:75,place:G.home,room:c.room,alive:true,source:'暂存版专属身世事件的实名经办人',goal:'核对身世旧物，尊重当事人的决定'};W.sync();save();render();}return out;};
const oldBackgroundPanel47=W.actorPanel;
W.actorPanel=function(id){let html=oldBackgroundPanel47(id);const c=originContacts[G.origin];if(c?.id===id&&W.present(id)&&!G.flag[c.flag])html+='<section class="background47"><h4>'+esc(c.title)+'</h4><button class="sb-btn" data-sb="b47:clue" data-arg="'+c.event+'">问起家中旧物</button></section>';return html;};
function dispatch(a,id){if(a!=='b47:clue')return false;const c=originContacts[G?.origin];if(systemReady()&&c?.event===id&&W.present(c.id)&&!G.flag[c.flag])startEvent(EVENTS.find(e=>e.id===id));return true;}
window.XTBackground47={contexts:BIRTH_CONTEXTS,axes:ORIGIN_AXES,lineages:LINEAGE_POOL,circles:COMMUNITY_CIRCLES,context,localize,visibleOriginVariants,backgroundFor,dispatch,originContacts,roll:rollBirthContext};
if(G){normalizeLegacy();render();}else showStart();
})();
