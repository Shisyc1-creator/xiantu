/* 整枚灵石、精确应计权益与共用收支。先于主程序加载。 */
'use strict';
function stoneGCD(a,b){while(b){const t=a%b;a=b;b=t;}return a;}
function stoneAccount(s){
 if(!s.wallet40){
  const v=Object.prototype.hasOwnProperty.call(s,'stones')?s.stones:0;
  if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>Number.MAX_SAFE_INTEGER)throw Error('灵石余额损坏，请恢复备份');
  const whole=Math.floor(v);
  // 按 JSON 数值的十进制表达精确保留权益，不把二进制浮点长尾再累计。
  const [mantissa,exponent='0']=String(v).toLowerCase().split('e');
  const digits=mantissa.replace('.',''),places=(mantissa.split('.')[1]||'').length-Number(exponent);
  let d=10n**BigInt(Math.max(0,places));
  let n=BigInt(digits)*10n**BigInt(Math.max(0,-places))-BigInt(whole)*d;
  const g=stoneGCD(n,d);n/=g;d/=g;
  s.stones=whole;
  s.wallet40={version:1,pendingN:String(n),pendingD:String(d),entries:[],sequence:0,migratedBalance:v};
 }
 const w=s.wallet40;
 if(w.version!==1||!Number.isSafeInteger(s.stones)||s.stones<0||!Array.isArray(w.entries)||!Number.isSafeInteger(w.sequence)||w.sequence<0)throw Error('灵石账本损坏，请恢复备份');
 const n=BigInt(w.pendingN),d=BigInt(w.pendingD);
 if(d<=0n||n<0n||n>=d)throw Error('应计权益损坏，请恢复备份');
 if(!s.difficulty)s.difficulty={id:'legacy',rulesVersion:0,selectedAt:null};
 if(!s.rescue40)s.rescue40={generation:s.generation||1,used:false};
 return w;
}
function stoneRecord(s,amount,source){
 if(!amount)return;
 const w=s.wallet40;
 w.entries.push({id:++w.sequence,at:(s.t||0)*30+(s.day||0),amount,balance:s.stones,source});
 w.entries=w.entries.slice(-120);
}
function stoneSet(s,value,source='资产结算'){
 const w=stoneAccount(s);
 if(!Number.isFinite(value)||Math.abs(value)>Number.MAX_SAFE_INTEGER)throw Error('收支超出安全范围');
 if(!Number.isInteger(value))throw Error('收支必须使用整数报价');
 const next=Math.max(0,value),delta=next-s.stones;s.stones=next;stoneRecord(s,delta,source);return delta;
}
function stoneChange(s,amount,source='行动收支'){stoneAccount(s);return stoneSet(s,s.stones+amount,source);}
function stoneAccrue(s,numerator,denominator,source){
 const w=stoneAccount(s);
 if(!Number.isSafeInteger(numerator)||numerator<0||!Number.isSafeInteger(denominator)||denominator<=0)throw Error('应计金额无效');
 let n=BigInt(w.pendingN)*BigInt(denominator)+BigInt(numerator)*BigInt(w.pendingD),d=BigInt(w.pendingD)*BigInt(denominator);
 const earned=n/d;n%=d;const g=stoneGCD(n,d);n/=g;d/=g;
 const amount=Number(earned);
 if(!Number.isSafeInteger(amount)||!Number.isSafeInteger(s.stones+amount))throw Error('应计收支超出安全范围');
 w.pendingN=String(n);w.pendingD=String(d);stoneChange(s,amount,source);return amount;
}
function stonePrepareSave(raw){
 const o=JSON.parse(raw);
 if(!o||!o.name||!o.attr)return false;
 stoneAccount(o);
 return o;
}
function stoneInherit(s,previous){
 const old=stoneAccount(previous);stoneAccount(s);
 // 沿用个人灵石四成的继承比例，连同该份额内未满一枚的权益一起保留。
 const d=BigInt(old.pendingD)*5n,n=(BigInt(previous.stones)*BigInt(old.pendingD)+BigInt(old.pendingN))*2n;
 stoneSet(s,Number(n/d),'个人资产继承');
 const remainder=n%d,g=stoneGCD(remainder,d);
 s.wallet40.pendingN=String(remainder/g);s.wallet40.pendingD=String(d/g);
}
function stoneBackup(raw){
 try{
 // 原文作为键值的一部分作幂等索引；先确认浏览器真正写入再允许迁移。
 const key='xiantu_migration40_backups';
 const list=JSON.parse(localStorage.getItem(key)||'[]');
 if(!list.some(x=>x.raw===raw)){
  list.push({at:new Date().toISOString(),raw});
  const text=JSON.stringify(list);localStorage.setItem(key,text);
  if(localStorage.getItem(key)!==text)throw Error('迁移前备份未能保存');
 }
 }catch(cause){const e=Error('迁移前备份未能保存');e.code='BACKUP40';throw e;}
}
window.XTEconomy40={account:stoneAccount,change:stoneChange,set:stoneSet,accrue:stoneAccrue,
 rules:Object.freeze({legacy:Object.freeze({id:'legacy',rulesVersion:0,incomeMultiplier:1,retreatCostMultiplier:1})}),
 rule:s=>window.XTEconomy40.rules[stoneAccount(s)&&s.difficulty.id]||window.XTEconomy40.rules.legacy};
