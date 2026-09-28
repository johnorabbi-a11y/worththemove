import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const pages=JSON.parse(fs.readFileSync('data/pages.json','utf8')),titles=new Set(),headings=new Set();let links=0;
for(const page of pages){const filename=path.join('.',page.url,'index.html'),html=fs.readFileSync(filename,'utf8');
 assert.equal((html.match(/<h1\b/g)||[]).length,1,filename+' needs one H1');
 const title=html.match(/<title>(.*?)<\/title>/s)[1],h1=html.match(/<h1[^>]*>(.*?)<\/h1>/s)[1];assert.ok(!titles.has(title),'duplicate title '+title);titles.add(title);assert.ok(!headings.has(h1),'duplicate H1 '+h1);headings.add(h1);
 assert.ok(html.includes(`rel="canonical" href="https://worththemove.co.uk${page.url}"`),'canonical '+filename);assert.ok(html.includes('name="description"'),'description '+filename);assert.ok(!html.includes('noindex'),'noindex '+filename);
 assert.ok(!/lorem ipsum|TODO|AfterTaxTool|undefined|NaN/.test(html),'placeholder/nonfinite '+filename);
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){const url=match[1];if(!url.startsWith('/')||url.startsWith('//'))continue;let target=url.split(/[?#]/)[0];if(target.endsWith('/'))target+='index.html';assert.ok(fs.existsSync(path.join('.',target)),`${filename}: broken ${url}`);links++;}
 for(const match of html.matchAll(/<input ([^>]+)>/g)){const attrs=match[1],id=attrs.match(/id="([^"]+)"/)?.[1];assert.ok(id&&html.includes(`for="${id}"`),'unlabelled input '+filename);}
}
const sitemap=fs.readFileSync('sitemap.xml','utf8');assert.equal((sitemap.match(/<loc>/g)||[]).length,pages.length);for(const p of pages)assert.ok(sitemap.includes(`<loc>https://worththemove.co.uk${p.url}</loc>`));assert.equal(fs.readFileSync('CNAME','utf8').trim(),'worththemove.co.uk');assert.ok(fs.existsSync('.nojekyll'));assert.ok(fs.readFileSync('404.html','utf8').includes('noindex'));assert.ok(pages.length>=50&&pages.length<=80);
console.log(`PASS: ${pages.length} indexable pages; unique titles/H1s, canonicals, sitemap, ${links} internal asset/navigation links, labelled inputs, no placeholders. Root/CNAME/.nojekyll/404 checked.`);
