const assert=require('node:assert/strict');
function compare(base,recoveryYears=4){assert(base>0&&base<1);return [0,.1,.15,.2].map(bonus=>{const chance=Math.min(.95,base+bonus),failures=(1-chance)/chance;return {bonus,chance,twoFailures:(1-chance)**2,expectedFailures:failures,expectedRecoveryYears:failures*recoveryYears};});}
module.exports={compare};
if(require.main===module){const fs=require('node:fs'),path=require('node:path');const r=JSON.parse(fs.readFileSync(path.join(__dirname,'../outputs/pill75-funding-results.json'),'utf8'));console.log(JSON.stringify({scope:'Fixed probability model only. Four-year recovery assumption; excludes pill procurement, aging, repeated purchase and mortality. Not a simulated lifetime.',rows:compare(r.rows[0].rateWithoutPill)},null,2));}

