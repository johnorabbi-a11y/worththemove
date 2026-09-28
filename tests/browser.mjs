// Optional browser QA: npm install --no-save playwright; npx playwright install chromium
// Start npm run serve first. PLAYWRIGHT_PATH can point at a preinstalled module.
import assert from 'node:assert/strict';import fs from 'node:fs';
import {calculators,fields} from '../data/calculators.js';
import {edgeCases} from './edge-cases.js';
import {scenarios} from '../data/scenarios.js';
import {calculate} from '../assets/js/compare.js';
import {gbp} from '../assets/js/report.js';
const {chromium}=await import(process.env.PLAYWRIGHT_PATH||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',error=>errors.push(error.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const base=process.env.BASE_URL||'http://127.0.0.1:4173';fs.mkdirSync('test-results',{recursive:true});
try{
 for(const c of calculators){
  for(const [label,values] of edgeCases(c)){const query=new URLSearchParams(c.inputs.map(k=>[k,values[k]]));await page.goto(base+c.url+'?'+query);await page.waitForFunction(()=>document.querySelector('#results h2')?.textContent==='Here’s the difference');assert.equal(await page.locator('form').evaluate(f=>f.checkValidity()),true,c.slug+' '+label);const output=await page.locator('#results').innerText();assert.doesNotMatch(output,/NaN|Infinity|undefined|null months/);assert.equal(await page.locator('#results').getAttribute('data-stale'),null);await page.setViewportSize({width:375,height:812});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),c.slug+' '+label+' overflow');}await page.setViewportSize({width:1440,height:1000});
  await page.goto(base+c.url);await page.waitForSelector('#results .difference');
  assert.ok((await page.locator('#results').innerText()).includes('Here’s the difference'),c.slug+' did not initialise');
  const before=await page.locator('#results').innerText(),key=c.inputs.includes('balance')?'balance':'price',input=page.locator(`[name="${key}"]`);
  await input.fill(String(c.defaults[key]+10000.23));await page.waitForTimeout(650);assert.equal(await input.evaluate(el=>el.checkValidity()),true,'exact statement balance must be accepted');const after=await page.locator('#results').innerText();assert.notEqual(before,after,c.slug+' did not update');
  await input.fill('-100');await page.waitForTimeout(500);assert.equal(await input.evaluate(el=>el.checkValidity()),false);assert.equal(await page.locator('#results').innerText(),after,'invalid input changed output');assert.ok((await page.locator('#form-error').innerText()).length>0);
  await input.fill(String(fields[key][3]+1));await page.waitForTimeout(500);assert.equal(await input.evaluate(el=>el.checkValidity()),false);assert.equal(await page.locator('#results').getAttribute('data-stale'),'true');
  await input.fill('');await page.waitForTimeout(500);assert.equal(await input.evaluate(el=>el.checkValidity()),false);
  await page.getByRole('button',{name:'Reset',exact:true}).click();await page.waitForTimeout(100);assert.equal(await input.inputValue(),String(c.defaults[key]));
  for(const width of [320,375]){await page.setViewportSize({width,height:812});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),c.slug+' mobile overflow at '+width);}await page.setViewportSize({width:1440,height:1000});
 }
 await page.goto(base+'/mortgage/lump-sum-vs-monthly-overpayment/');await page.locator('[name="lump"]').fill('250000');await page.waitForTimeout(600);assert.match(await page.locator('#form-error').innerText(),/cannot exceed/);
 await page.goto(base+'/mortgage/mortgage-fee-vs-no-fee/?balance=150000&feeB=1499');assert.equal(await page.locator('[name="balance"]').inputValue(),'150000');assert.equal(await page.locator('[name="feeB"]').inputValue(),'1499');
 await page.goto(base+'/mortgage/mortgage-overpayment/?extra=0');await page.getByRole('button',{name:'Compare options',exact:true}).click();assert.match(await page.locator('#result-status').innerText(),/effectively equal/);assert.doesNotMatch(await page.locator('#result-status').innerText(),/lower/);
 for(const s of scenarios){await page.goto(base+s.url);const link=page.getByRole('link',{name:'Use these figures in the calculator'});const href=await link.getAttribute('href');assert.ok(href.includes('?'));const tool=calculators.find(c=>c.slug===s.calculator),expected=calculate(tool,{...tool.defaults,...s.values});assert.ok((await page.locator('.report').innerText()).includes(gbp(expected.a.cost)));await link.click();await page.waitForFunction(()=>document.querySelector('#results h2')?.textContent==='Here’s the difference');assert.ok((await page.locator('#results').innerText()).includes(gbp(expected.b.cost)));}
 const pages=JSON.parse(fs.readFileSync('data/pages.json','utf8'));for(const p of pages){const response=await page.goto(base+p.url);assert.equal(response.status(),200);assert.equal(await page.locator('h1').count(),1);await page.setViewportSize({width:375,height:812});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),p.url+' overflow');}
 await page.goto(base+'/');await page.screenshot({path:'test-results/home-desktop.png',fullPage:true});
 await page.setViewportSize({width:375,height:812});await page.screenshot({path:'test-results/home-mobile.png',fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.goto(base+'/mortgage/mortgage-fee-vs-no-fee/');await page.screenshot({path:'test-results/calculator-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'test-results/calculator-desktop.png',fullPage:true});
 const noJS=await browser.newContext({javaScriptEnabled:false});const staticPage=await noJS.newPage();for(const c of calculators){await staticPage.goto(base+c.url);assert.ok((await staticPage.locator('#results').innerText()).includes('The numbers, side by side'));assert.ok((await staticPage.locator('article').innerText()).includes('How this comparison works'));}await noJS.close();
 assert.deepEqual(errors,[]);console.log(`PASS: all ${calculators.length} calculators × 7 input profiles, updates/resets/3 invalid inputs, equality status, 8 scenario prefills, 54 routes at 375px, all 16 no-JS explanations, no console errors. Screenshots in test-results/.`);
}finally{await browser.close();}
