// Legacy regression suites must enter through the current childhood/entry flow.
module.exports=async function installOpeningFixture(page){await page.evaluate(()=>{
 globalThis.startCurrentOpening=origin=>{
  const random=Math.random;Math.random=()=>.4;
  try{
   newGame('沈行舟',origin,'男');
   chooseChild(XTBackground47.visibleOriginVariants(origin,G.birthContext)[0].i);
   if(!G.opening46?.childhood)throw Error('current childhood fixture missing');
   for(let i=0;i<4;i++)XTOpening46.chooseChildhood(XTOpening46.childhoodToken(),0);
   for(let i=0;i<4;i++)XTOpening46.dispatch(XTOpening46.token(),i%2);
   beginCultivation();
   if(G.entry47?.status!=='complete')throw Error('current entry did not complete');
   if(G.mode==='result')document.getElementById('contBtn').click();
   if(!G.root||G.mode!=='idle')throw Error('current opening did not reach measured idle state');
  }finally{Math.random=random;}
 };
});};
