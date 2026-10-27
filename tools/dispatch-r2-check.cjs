const path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'):'playwright'));
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true}),context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(pathToFileURL(path.resolve(__dirname,'../prototype/index.html')).href+'?developer=1');
 assert(await page.evaluate(()=>{newGame('未测灵测试','寒门散修','男');if(G.root)throw Error('fixture already measured');XTSandbox.dispatch('sub','settings');return !G.root&&XTSandbox.view.sub==='settings';}),'unmeasured dispatcher must terminate without measuring the character');
 console.log('PASS unmeasured dispatch terminates without changing latent root');
 assert(await page.evaluate(()=>{G=null;XTSandbox.dispatch('sub','settings');return G===null;}),'empty session dispatch must terminate');
 console.log('PASS empty session dispatch terminates');
 assert.deepEqual(errors,[]);console.log('2 dispatch checks passed; no page errors');
}finally{await context.close();await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
