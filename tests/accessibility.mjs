import fs from 'node:fs';import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_PATH||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});
const page=await browser.newPage();const failures=[];
try{for(const url of ['/','/calculators/','/mortgage/mortgage-fee-vs-no-fee/','/buying/rent-vs-buy/','/moving/move-vs-extend/','/guides/understanding-loan-to-value/','/scenarios/999-mortgage-fee/']){
 await page.goto('http://127.0.0.1:4173'+url);await page.addScriptTag({path:process.env.AXE_PATH||'../work/axe.min.js'});
 const result=await page.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
 for(const v of result.violations)failures.push({url,id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))});
}
 fs.mkdirSync('test-results',{recursive:true});fs.writeFileSync('test-results/accessibility.json',JSON.stringify(failures,null,2));assert.deepEqual(failures,[]);console.log('PASS: axe WCAG 2 A/AA and 2.1 AA checks on seven representative page templates.');
}finally{await browser.close();}
