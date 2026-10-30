"use strict";
// Reuse the normal-opening economic route; change only study and retreat choices.
const fs=require('node:fs'),Module=require('node:module');
let source=fs.readFileSync(__dirname+'/economy71-audit.cjs','utf8');
source=source.replace("stats.setup=data(", "g.run('globalThis.growthReset72='+strategy.includes('reset')+';globalThis.growthInterval72='+Number(strategy.match(/reset(\\d+)/)?.[1]||10));if(strategy.includes('study')){g.run(\"walk71('market');room71('shops');actWork();XTContent47.laborCommit(XTContent47.laborToken());resume71();walk71('county');for(let i=0;i<2;i++)XTQi51.dispatch('q51:practice','养锋诀');\");assert.equal(g.run(\"XTSandbox.state().books['养锋诀'].level\"),3);}stats.setup=data(");
source=source.replace("if(G.stones>=currentRetreatCost())doRetreat(1,retreatEfficiency());", "if(globalThis.growthReset72&&G.rtCount>=globalThis.growthInterval72){stepYear(false);}else if(G.stones>=currentRetreatCost())doRetreat(1,retreatEfficiency());");
source=source.replace("'balanced_temple'?'temple':'village'", "'balanced_temple'?'temple':'village'");
source=source.replace("['market','sunset','herb','timber','craft','balanced','balanced_temple']", "['balanced','balanced_study','balanced_reset','balanced_study_reset']");
source=source.replaceAll('economy71-results.json','growth72-results.json');
source=source.replace('21 controlled event-free routes;', '12 controlled event-free growth comparisons; reset means one real walking year after ten retreats; study means two actual study actions;');
const m=new Module(__filename,module);m.filename=__filename;m.paths=module.paths;m._compile(source,__filename);
