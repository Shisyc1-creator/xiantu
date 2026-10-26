const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),vm=require('node:vm');
// Executes the actual storage/save functions in an isolated context with test-only keys.
const html=fs.readFileSync(path.join(__dirname,'../prototype/index.html'),'utf8');
const storage=html.slice(html.indexOf('const MEM = {}'),html.indexOf('const CN_NUM'));
const saving=html.slice(html.indexOf('const SLOT_KEY='),html.indexOf('function restore(str)'));
const slots=html.slice(html.indexOf('function readSlots()'),html.indexOf('function slotData('));
let count=0;
function fixture(){
 const disk=new Map(),messages=[],nodes=new Map();let fault='';
 const localStorage={setItem(k,v){if(fault==='quota')throw Object.assign(Error('full'),{name:'QuotaExceededError'});if(fault!=='drop')disk.set(k,String(v));},getItem(k){if(fault==='read')throw Error('denied');return disk.get(k)??null;}};
 const document={body:{prepend(n){nodes.set(n.id,n);}},getElementById(id){return nodes.get(id)||null;},createElement(){return {setAttribute(){},remove(){nodes.delete(this.id);}};}};
 const c=vm.createContext({window:{localStorage},document,console,Date,DEV_SESSION47:true,SAVE_KEY:'r1-test-auto',stoneAccount(){},readUIPrefs(){return {autosave:true};},toast(s){messages.push(s);}});
 vm.runInContext(storage+saving+slots+';G={name:"test",attr:{}};',c);
 return {disk,messages,nodes,run:s=>vm.runInContext(s,c),fault:s=>fault=s};
}
function check(name,f){f();count++;console.log('PASS '+name);}
check('quota failure reports false and keeps previous auto save',()=>{const f=fixture();f.disk.set('r1-test-auto','old');f.fault('quota');assert.equal(f.run('save()'),false);assert.equal(f.disk.get('r1-test-auto'),'old');});
check('silent dropped writes fail readback verification',()=>{const f=fixture();f.fault('drop');assert.equal(f.run('save()'),false);});
check('readback exceptions do not report success through memory fallback',()=>{const f=fixture();f.fault('read');assert.equal(f.run('save()'),false);});
check('manual quota failure preserves old slot and reports failure',()=>{const f=fixture();const old='{"s1":{"ts":1,"d":"old"}}';f.disk.set('xiantu_developer47_slots_v1',old);f.fault('quota');assert.equal(f.run('saveToSlot(1)'),false);assert.equal(f.disk.get('xiantu_developer47_slots_v1'),old);assert(f.messages.some(s=>s.includes('失败')));});
check('autosave failure warning persists once and clears after recovery',()=>{const f=fixture();f.fault('quota');f.run('save();save()');assert.equal(f.nodes.size,1);f.fault('');assert.equal(f.run('save()'),true);assert.equal(f.nodes.size,0);});
check('successful auto and manual writes survive a fresh storage read',()=>{const f=fixture();assert.equal(f.run('save()'),true);assert.equal(f.run('saveToSlot(2)'),true);assert.equal(JSON.parse(f.disk.get('r1-test-auto')).name,'test');assert.equal(JSON.parse(JSON.parse(f.disk.get('xiantu_developer47_slots_v1')).s2.d).name,'test');});
check('single read failure deleting a slot preserves every old slot',()=>{const f=fixture();const old='{"s1":{"d":"old1"},"s2":{"d":"old2"}}';f.disk.set('xiantu_developer47_slots_v1',old);f.fault('read');assert.equal(f.run('deleteSlot(1)'),false);assert.equal(f.disk.get('xiantu_developer47_slots_v1'),old);});
console.log(`${count} save checks passed`);
