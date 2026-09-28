// Optional browser QA: npm install --no-save playwright; npx playwright install chromium
// Start npm run serve first. PLAYWRIGHT_PATH can point at a preinstalled module.
import assert from 'node:assert/strict';import fs from 'node:fs';
import {calculators} from '../data/calculators.js';
const {chromium}=await import(process.env.PLAYWRIGHT_PATH||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
page.on('pageerror',error=>errors.push(error.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const base=process.env.BASE_URL||'http://127.0.0.1:4173';fs.mkdirSync('test-results',{recursive:true});
try{
 for(const c of calculators){
  await page.goto(base+c.url);await page.waitForSelector('#results .difference');
  assert.ok((await page.locator('#results').innerText()).includes('Here’s the difference'),c.slug+' did not initialise');
  const before=await page.locator('#results').innerText(),key=c.inputs.includes('balance')?'balance':'price',input=page.locator(`[name="${key}"]`);
  await input.fill(String(c.defaults[key]+10000.23));await page.waitForTimeout(650);assert.equal(await input.evaluate(el=>el.checkValidity()),true,'exact statement balance must be accepted');const after=await page.locator('#results').innerText();assert.notEqual(before,after,c.slug+' did not update');
  await input.fill('-100');await page.waitForTimeout(500);assert.equal(await input.evaluate(el=>el.checkValidity()),false);assert.equal(await page.locator('#results').innerText(),after,'invalid input changed output');
  await page.getByRole('button',{name:'Reset',exact:true}).click();await page.waitForTimeout(100);assert.equal(await input.inputValue(),String(c.defaults[key]));
  for(const width of [320,375]){await page.setViewportSize({width,height:812});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),c.slug+' mobile overflow at '+width);}await page.setViewportSize({width:1440,height:1000});
 }
 await page.goto(base+'/mortgage/lump-sum-vs-monthly-overpayment/');await page.locator('[name="lump"]').fill('250000');await page.waitForTimeout(600);assert.match(await page.locator('#form-error').innerText(),/cannot exceed/);
 await page.goto(base+'/mortgage/mortgage-fee-vs-no-fee/?balance=150000&feeB=1499');assert.equal(await page.locator('[name="balance"]').inputValue(),'150000');assert.equal(await page.locator('[name="feeB"]').inputValue(),'1499');
 const pages=JSON.parse(fs.readFileSync('data/pages.json','utf8'));for(const p of pages){const response=await page.goto(base+p.url);assert.equal(response.status(),200);assert.equal(await page.locator('h1').count(),1);}
 await page.goto(base+'/');await page.screenshot({path:'test-results/home-desktop.png',fullPage:true});
 await page.setViewportSize({width:375,height:812});await page.screenshot({path:'test-results/home-mobile.png',fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.goto(base+'/mortgage/mortgage-fee-vs-no-fee/');await page.screenshot({path:'test-results/calculator-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'test-results/calculator-desktop.png',fullPage:true});
 const noJS=await browser.newContext({javaScriptEnabled:false});const staticPage=await noJS.newPage();await staticPage.goto(base+'/mortgage/mortgage-fee-vs-no-fee/');assert.ok((await staticPage.locator('#results').innerText()).includes('The numbers, side by side'));await noJS.close();
 assert.deepEqual(errors,[]);console.log(`PASS: all ${calculators.length} calculator updates/resets/invalid inputs, mobile overflow, query examples, 54 routes, no-JS content, no console errors. Screenshots in test-results/.`);
}finally{await browser.close();}
