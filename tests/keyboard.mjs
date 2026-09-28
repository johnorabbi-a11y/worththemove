import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_PATH||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_CHANNEL?{channel:process.env.BROWSER_CHANNEL}:{})});
try{
 const page=await browser.newPage({viewport:{width:375,height:812},reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:4173/mortgage/mortgage-overpayment/');
 await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').innerText(),'Skip to content');
 assert.equal(await page.locator(':focus').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
 await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>location.hash),'#main');
 let found=false;for(let i=0;i<30;i++){await page.keyboard.press('Tab');if(await page.locator('[name="balance"]').evaluate(e=>e===document.activeElement)){found=true;break;}}assert.ok(found,'keyboard reaches form');
 assert.equal(await page.locator('.input-wrap:focus-within').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
 await page.keyboard.press('Control+a');await page.keyboard.type('0');await page.keyboard.press('Tab');await page.waitForTimeout(500);
 assert.match(await page.locator('#result-status').innerText(),/effectively equal/);
 assert.equal(await page.locator('#result-status').getAttribute('aria-live'),'polite');
 await page.getByRole('button',{name:'Compare options',exact:true}).focus();await page.keyboard.press('Enter');
 assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 const summary=page.locator('details.assumptions summary');await summary.focus();await page.keyboard.press('Enter');assert.equal(await summary.evaluate(e=>e.parentElement.open),false);await page.keyboard.press('Enter');assert.equal(await summary.evaluate(e=>e.parentElement.open),true);
 assert.ok(await page.locator('nav[aria-label="Main navigation"] a').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().width>0&&e.getBoundingClientRect().right<=innerWidth)));
 assert.equal(await page.locator('table caption').count(),1);assert.ok(await page.locator('th[scope="row"]').count()>0);assert.equal(await page.locator('th[scope="col"]').count(),3);
 await page.goto('http://127.0.0.1:4173/moving/move-vs-extend/?cash=2000000');assert.match(await page.locator('#form-error').innerText(),/exceeds/);
 console.log('PASS: mobile keyboard navigation, skip link, visible focus, input editing, Enter submission, live equality status, disclosure toggles, reduced motion, table semantics and cross-field errors.');
}finally{await browser.close();}
