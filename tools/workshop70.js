/* 落霞引灵剑工坊：实际销售、用料与补料订单，随世界保留。 */
(()=>{'use strict';
const S=XTSandbox,W=XTWorld36,C=XTContent47,V=S.view;
const old={shop:S.shopState,advance:advanceDays,view:W.renderView,scene:renderScene,restore};
const keys={spiritTimber47:'wood',ironOre:'ore',spiritBlade:'blades'};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function state(){return G?.world36?.workshop70;}
function ensure(){if(!G?.root||!G.world36)return null;if(!state()){
 const st=S.state().shops.sunset||old.shop('sunset');
 G.world36.workshop70={version:1,wood:st.stock.spiritTimber47??12,ore:st.stock.ironOre??80,blades:st.stock.spiritBlade??8,target:Math.max(1,st.stock.spiritBlade??8),cash:st.wallet,fuelSpent:0,completed:0,job:null};
 G.world36.people.artisan70={id:'artisan70',name:'杜衡',role:'落霞工坊炼器师',realm:0,layer:9,root:'四灵根',birth:S.now()-38*360,life:100,alive:true,sex:'男',place:'spiritMarket',room:'workshop',source:'落霞引灵剑工坊，已掌握引灵剑工艺，使用工坊炉位',goal:'按商会实售数量补制引灵剑',need:'spiritTimber47',craft70:'spiritBlade'};
 }return state();}
function aliveAt(n,at){const end=n?.birth+n?.life*360;return !!n&&at<end&&(n.alive!==false||S.now()>=end);}
function working(at=S.now()){const n=W.get('artisan70'),m=W.get('sunset');return aliveAt(n,at)&&n.place==='spiritMarket'&&n.room==='workshop'&&n.craft70==='spiritBlade'&&aliveAt(m,at);}
S.shopState=function(id){if(id!=='sunset'||!G?.world36)return old.shop(id);const m=ensure(),st=old.shop(id);if(!m)return st;
 for(const [key,field]of Object.entries(keys))Object.defineProperty(st.stock,key,{configurable:true,enumerable:true,get:()=>m[field],set:v=>{m[field]=v;}});
 Object.defineProperty(st,'wallet',{configurable:true,enumerable:true,get:()=>m.cash,set:v=>{m.cash=v;}});return st;};
function pending(){const m=ensure();return m?Math.max(0,m.target-m.blades-(m.job?1:0)):0;}
function demand(){const m=ensure();return m&&working()?Math.max(0,pending()*2-m.wood):0;}
function start(at=S.now()){const m=ensure();if(!m||m.job||!working(at)||pending()<1||m.wood<2||m.ore<4)return;
 const fuel=Math.round(12*economyFactor());if(m.cash<fuel)return;
 m.wood-=2;m.ore-=4;m.cash-=fuel;m.fuelSpent+=fuel;m.job={start:at,due:at+18,status:'working'};
}
function finish(){const m=state();if(!m?.job)return;const n=W.get('artisan70'),j=m.job;
 if(j.status==='stopped')return;
 if(!working(Math.min(S.now(),j.due))){j.status='stopped';return;}
 if(S.now()>=j.due){m.blades++;m.completed++;m.job=null;start(j.due);if(m.job&&m.job.due<=S.now())finish();}
}
advanceDays=function(n,ctx,opt){if(state()?.job&&(!W.alive(W.get('artisan70'))||!W.alive(W.get('sunset'))||!working()))state().job.status='stopped';const out=old.advance(n,ctx,opt);finish();return out;};
function allow(id,key,selling){if(selling&&key==='spiritTimber47')return id==='sunset'&&demand()>0?'':'当前没有木料缺口订单；请到落霞工坊查看排产。';return '';}
function afterTrade(id){if(id==='sunset')start();}
function summary(){const m=ensure();if(!m)return '';const n=W.get('artisan70');
 return '<p>炼器师：'+esc(n?.name)+' · '+(W.alive(n)?'在世':'已故')+'；经办人：陆执柜。</p><p>成品 '+m.blades+'把；补足现有货架 '+m.target+'把。已完工 '+m.completed+'把。</p><p>工坊木料 '+m.wood+'段，赤铁砂 '+m.ore+'份；钱匣 '+m.cash+'灵石，已耗炉火 '+m.fuelSpent+'灵石。</p><p>木料缺口订单：'+demand()+'段，当前收价 '+C.price('sunset','spiritTimber47',true)+'灵石/段。只按排产缺口收购；到陆执柜交易页出售青纹灵木交货。</p><p>'+(m.job?(m.job.status==='stopped'?'工序已停：投入材料与炉火不退，半成品留存。':'正在炼制一把引灵剑，剩余 '+Math.max(0,m.job.due-S.now())+'日。'):'当前未开炉。')+'</p><p>每把使用赤铁砂4份、灵木2段，工时18日，炉火12灵石按现行物价。实际售出后补做，缺材料或钱款就停工；不按月刷新这三种库存与钱匣。无需参与此订单也可正常修行、旅行。</p>';
}
function panel(){document.getElementById('scene').innerHTML='<section class="sb-shell"><header class="sb-head"><h2>落霞工坊与木料订单</h2></header><div class="sb-scroll">'+summary()+'<button class="sb-btn" id="return70">返回场景</button></div></section>';document.getElementById('return70').onclick=()=>{V.tab='scene';render();};return true;}
W.renderView=function(){if(G?.mode==='idle'&&V.tab==='workshop70')return panel();return old.view();};
renderScene=function(){old.scene();if(G?.mode!=='idle'||V.tab==='workshop70'||G.place!=='spiritMarket'||!['shops','workshop'].includes(S.state().room))return;
 const scene=document.getElementById('scene');if(scene.querySelector('#open70'))return;
 const box=scene.querySelector('.sb-head');if(box){box.insertAdjacentHTML('beforeend','<button class="sb-btn" id="open70">工坊订单</button>');document.getElementById('open70').onclick=()=>{ensure();V.tab='workshop70';render();};}
};
restore=function(raw){try{const x=JSON.parse(raw),m=x.world36?.workshop70;if(m){if(m.version!==1||!['wood','ore','blades','target','cash','fuelSpent','completed'].every(k=>Number.isSafeInteger(m[k])&&m[k]>=0)||!x.world36.people?.artisan70||m.job&&(!Number.isSafeInteger(m.job.start)||m.job.due!==m.job.start+18||!['working','stopped'].includes(m.job.status)))throw Error('invalid');}}catch(e){XTEconomy40.lastRestoreError='工坊记录无效，原档保留。';return false;}return old.restore(raw);};
window.XTWorkshop70={state,ensure,demand,start,finish,allow,afterTrade,summary};
})();
