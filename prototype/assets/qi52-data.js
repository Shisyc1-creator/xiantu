/* 炼气路线内容表：原创功法与试算数值，不把参考作品数值当作本项目规则。 */
(()=>{'use strict';
const library={},moves={};
const mind=(name,id,tier,stage,route,flow,focus,bonus,effect,desc,battle={})=>library[name]={id,kind:'心法',tier,stage,route52:route,flow,focus,bonus,effect,desc,battle,price:stage===1?18:stage===4?28:42};
const art=(name,id,tier,stage,route,move,desc)=>library[name]={id,kind:'术法',tier,stage,route52:route,route:'攻',move,desc,price:stage===1?8:stage===4?16:26};
const move=(id,label,cost,damage,style,extra={})=>moves[id]={label,cost,damage,style,desc:extra.desc||label,...extra};
mind('锋息剑诀','edgeMid52','玄',4,'edge','burst','edge','edge',{absorb:.055,bt:.004,life:0},'收束锋息，剑术破甲；无养生条目。',{pierce:1});
mind('凝锋归一诀','edgeLate52','玄',8,'edge','burst','edge','edge',{absorb:.075,bt:.006,life:0},'把散逸剑气收归一线，伤害稳定，真元消耗较高。',{pierce:2});
mind('石肤养脉功','bodyMid52','玄',4,'body','burst','body','body',{absorb:.04,bt:0,life:3},'温养筋骨，偏重气血与硬抗，不提高突破成算。',{hp:8,defense:1});
mind('龙虎炼形篇','bodyLate52','玄',8,'body','burst','body','body',{absorb:.055,bt:0,life:5},'筋骨与发力同练，守势更稳，近身反击更重。',{hp:16,defense:2});
mind('分念御物诀','spiritMid52','玄',4,'spirit','steady','spirit','spirit',{absorb:.045,bt:.005,life:0},'维持多次精细御器，真元上限略增。',{mp:5});
mind('回环控器诀','spiritLate52','玄',8,'spirit','steady','spirit','spirit',{absorb:.065,bt:.008,life:0},'器物回环而不散念，擅长连续牵制。',{mp:9});
for(const [route,rows]of Object.entries({edge:[['折锋剑势','edgeSkillMid52','swordMid52','破甲剑势，需兵器。'],['归一贯锋','edgeSkillLate52','swordLate52','集中剑气贯甲，需兵器。']],body:[['截脉崩劲','bodySkillMid52','palmMid52','近身发劲，打断蓄势并稍作护身。'],['龙虎震身','bodySkillLate52','palmLate52','以筋骨发劲，重击同时稳住身形。']],spirit:[['回环御器术','spiritSkillMid52','controlMid52','器物折返，削弱反击。'],['分光牵制术','spiritSkillLate52','controlLate52','分念牵制，延续两回合。']] }))rows.forEach(([n,id,m,desc],i)=>art(n,id,'玄',i?8:4,route,m,desc));
move('swordMid52','折锋剑势',5,14,'edge',{weapon:true,pierce:2,desc:'需兵器，部分穿甲'});move('swordLate52','归一贯锋',7,21,'edge',{weapon:true,pierce:4,desc:'需兵器，高消耗贯甲'});
move('palmMid52','截脉崩劲',4,11,'body',{interrupt:true,guard:3,desc:'打断蓄势，本回合护身'});move('palmLate52','龙虎震身',6,17,'body',{interrupt:true,guard:6,desc:'重击、打断并护身'});
move('controlMid52','回环御器术',5,12,'spirit',{artifact:true,weaken:5,desc:'需法器，削弱当回合反击'});move('controlLate52','分光牵制术',7,17,'spirit',{artifact:true,weaken:5,duration:2,desc:'需法器，削弱两回合反击'});
mind('五行吐纳诀','elementBase52','黄',1,'element','steady','element','element',{absorb:.035,bt:0,life:0},'依五行变化吐纳，术法各有用途，不依灵根名称锁死学习资格。');
mind('五气周流诀','elementMid52','玄',4,'element','steady','element','element',{absorb:.05,bt:.004,life:0},'五气周流，术法衔接较省真元。',{mp:3});
mind('五行归元诀','elementLate52','玄',8,'element','steady','element','element',{absorb:.07,bt:.006,life:1},'收束五行气机，灵气变化仍受真元和所备术法限制。',{mp:5});
const elements={metal:{name:'金',names:['金芒术','贯金术','百炼金芒'],damage:[8,13,19],pierce:[2,3,5]},wood:{name:'木',names:['青藤缚影','藤络绞缚','古木盘根'],damage:[5,9,14],weaken:[3,5,7]},water:{name:'水',names:['寒流术','寒潮凝息','玄水回澜'],damage:[6,10,16],guard:[3,5,7]},fire:{name:'火',names:['离火术','炎纹连焰','离火燎原'],damage:[8,12,18],burn:[2,3,4]},earth:{name:'土',names:['土垣术','岩垒镇护','磐石镇身'],damage:[3,7,12],shield:[8,12,16]}};
for(const [element,e]of Object.entries(elements))for(let i=0;i<3;i++){const id=element+i+'52',m='element_'+id;art(e.names[i],id,i?'玄':'黄',[1,4,8][i],'element',m,e.name+'行术法：'+({metal:'破甲',wood:'缠绕削弱',water:'缓冲攻势',fire:'持续灼伤',earth:'持续护盾'}[element])+'。');const x={element,desc:e.name+'行 '+({metal:'穿甲',wood:'削弱',water:'护身',fire:'灼伤两回合',earth:'保留护盾'}[element])};for(const k of ['pierce','weaken','guard','burn','shield'])if(e[k])x[k]=e[k][i];if(element==='wood')x.duration=2;move(m,e.names[i],[3,5,7][i],e.damage[i],'element',x);}
const support=[
 ['藏息行气篇','conceal52','黄',1,'support','slow','guard','conceal',{absorb:.015,bt:0,life:0},'收敛气息，战中身法与撤退得到辅助，不增寿。'],
 ['清心守窍诀','clear52','玄',4,'support','steady','spirit','focus',{absorb:0,bt:.004,life:0},'偏重心神稳定与精细运气，无修炼速度与寿元条目。'],
 ['回春养脉篇','nourish52','玄',8,'support','slow','body','restore',{absorb:.02,bt:0,life:4},'偏重续气与养生，不提高突破成算。'],
 ['符墨导气篇','talismanBase52','黄',1,'talisman','steady','spirit','talisman',{absorb:.02,bt:0,life:0},'温养符墨气机，符箓需实际制作和消耗。'],
 ['百纹定符诀','talismanMid52','玄',4,'talisman','steady','spirit','talisman',{absorb:.035,bt:.002,life:0},'稳住符纹，增强符箓发挥。'],
 ['灵纹归藏诀','talismanLate52','玄',8,'talisman','steady','spirit','talisman',{absorb:.05,bt:.003,life:1},'收束复杂符纹，不省去纸墨与制作时间。'],
 ['阵枢理气篇','arrayBase52','黄',1,'array','steady','spirit','array',{absorb:.02,bt:0,life:0},'辨阵眼与阵材，阵法有攻击、防护、困敌和辅助之分。'],
 ['六仪承阵诀','arrayMid52','玄',4,'array','steady','spirit','array',{absorb:.035,bt:.002,life:0},'承接阵枢，阵材仍有限。'],
 ['灵枢合阵篇','arrayLate52','玄',8,'array','steady','spirit','array',{absorb:.05,bt:.004,life:0},'稳固阵枢，不能凭低阶阵法抬高一地灵脉品阶。'],
 ['同息御兽篇','petBase52','黄',1,'pet','slow','body','pet',{absorb:.015,bt:0,life:1},'以实际相处建立信任，灵兽不是消耗品。'],
 ['灵契养息诀','petMid52','玄',4,'pet','slow','body','pet',{absorb:.03,bt:0,life:3},'以稳定照料与灵契协调行动。'],
 ['合息通灵篇','petLate52','玄',8,'pet','slow','body','pet',{absorb:.045,bt:.002,life:4},'灵契更稳，饥饿与伤病仍会影响协同。'],
 ['机枢分念篇','puppetBase52','黄',1,'puppet','steady','spirit','puppet',{absorb:.015,bt:.002,life:0},'以分念驱动木傀，须有实物与能量。'],
 ['双枢控机诀','puppetMid52','玄',4,'puppet','steady','spirit','puppet',{absorb:.03,bt:.004,life:0},'控制更稳，材料与维修不可省略。'],
 ['百机守一篇','puppetLate52','玄',8,'puppet','steady','spirit','puppet',{absorb:.045,bt:.006,life:0},'多枢归一，炼气仍只操纵一具随战傀儡。'],
 ['辨药温炉诀','alchemyBase52','黄',1,'alchemy','slow','body','alchemy',{absorb:.015,bt:0,life:1},'辨药与温炉，丹药须按方炼制。'],
 ['三候养炉篇','alchemyMid52','玄',4,'alchemy','slow','body','alchemy',{absorb:.025,bt:0,life:2},'以三候辨火力，偏恢复与温养。'],
 ['丹息归元篇','alchemyLate52','玄',8,'alchemy','slow','body','alchemy',{absorb:.04,bt:.003,life:3},'丹息收束，不凭空成丹。'],
 ['锻火运气篇','forgeBase52','黄',1,'forge','burst','body','forge',{absorb:.02,bt:0,life:0},'配合炉火锻打，偏器物与火候。'],
 ['器纹回火诀','forgeMid52','玄',4,'forge','burst','body','forge',{absorb:.035,bt:.002,life:0},'回火定纹，器物仍按材料与炉位制作。'],
 ['百锻凝纹篇','forgeLate52','玄',8,'forge','burst','body','forge',{absorb:.05,bt:.004,life:0},'凝练器纹，不越阶制造高阶法宝。']
];support.forEach(row=>mind(...row));
const routes={
 edge:{name:'剑术修行',minds:['养锋诀','锋息剑诀','凝锋归一诀'],arts:['点锋剑术','折锋剑势','归一贯锋'],style:'edge',materials:'ironOre',description:'兵器、剑诀与破甲剑势相配。'},
 body:{name:'筋骨近身',minds:['锻骨诀','石肤养脉功','龙虎炼形篇'],arts:['震脉掌','截脉崩劲','龙虎震身'],style:'body',materials:'herb',description:'气血、守势与近身打断相配，不要求持剑。'},
 spirit:{name:'分念御器',minds:['御器诀','分念御物诀','回环控器诀'],arts:['牵丝御器术','回环御器术','分光牵制术'],style:'spirit',materials:'spiritTimber47',description:'须有实际法器，以牵制与持续运气取胜。'},
 element:{name:'五行术修',minds:['五行吐纳诀','五气周流诀','五行归元诀'],arts:['金芒术','贯金术','百炼金芒'],style:'element',materials:'herb',description:'金破甲、木削弱、水缓冲、火灼伤、土护盾；五行都可学，仍受两术法槽限制。'},
 talisman:{name:'符箓修行',minds:['符墨导气篇','百纹定符诀','灵纹归藏诀'],style:'talisman',craft:'firePaper52',description:'先学符式、买纸墨、实际绘制，再在战中消耗符箓。'},
 array:{name:'阵法修行',minds:['阵枢理气篇','六仪承阵诀','灵枢合阵篇'],style:'array',craft:'attackArray52',description:'攻击、防护、困敌与聚灵、养脉、警戒六类阵法，各有条件。'},
 pet:{name:'灵兽相伴',minds:['同息御兽篇','灵契养息诀','合息通灵篇'],style:'pet',description:'从照料与救助开始，实际喂养、训练、养伤，再协同作战。'},
 puppet:{name:'傀儡操持',minds:['机枢分念篇','双枢控机诀','百机守一篇'],style:'puppet',craft:'woodPuppet52',description:'先制木傀，再驱动、维修和升级；与灵兽各占一个位。'},
 alchemy:{name:'炼丹养生',minds:['辨药温炉诀','三候养炉篇','丹息归元篇'],style:'alchemy',craft:'breathPill52',description:'采药、学方、租炉、炼丹、交货与自用形成循环。'},
 forge:{name:'炼器谋生',minds:['锻火运气篇','器纹回火诀','百锻凝纹篇'],style:'forge',craft:'edgeBlade52',description:'寻矿灵木、器谱炉位、制作装备和实际委托形成循环。'}
};
window.XTQi52Data={library,moves,routes,elements};
})();
