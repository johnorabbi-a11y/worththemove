import test from 'node:test';import assert from 'node:assert/strict';
import {calculate} from '../assets/js/compare.js';
import {mortgage,payment,savings} from '../assets/js/engine.js';
import {report} from '../assets/js/report.js';
import {calculators,bySlug} from '../data/calculators.js';
import {edgeCases} from './edge-cases.js';
const near=(a,b,t=.001)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
for(const tool of calculators)for(const [label,v] of edgeCases(tool))test(`${tool.slug}: ${label} bounds`,()=>{
 const r=calculate(tool,v);
 function finite(o){for(const [k,x] of Object.entries(o)){if(typeof x==='number'){assert.ok(Number.isFinite(x),k);if(k==='balance'||k==='interest'||k==='payment')assert.ok(x>=0,k);}else if(x&&typeof x==='object')finite(x);}}
 finite(r);assert.doesNotMatch(report(r,tool),/NaN|Infinity|undefined|null months/);
});
test('move vs extend preserves released equity for a cheaper replacement',()=>{
 const t=bySlug['move-vs-extend'],v={...t.defaults,currentValue:500000,balance:50000,targetValue:200000,works:0,valueAdded:0,houseGrowth:0,rateA:0,savingsRate:0,currentRunning:0,newRunning:0,saleFee:0,legal:0,survey:0,removals:0,tax:0,erc:0};
 const r=calculate(t,v);near(r.b.released,250000);near(r.a.cost,0);near(r.b.cost,0);near(r.a.wealth,r.b.wealth);
 const fee=calculate(t,{...v,tax:12345});near(fee.b.cost-fee.a.cost,12345);
});
test('early payoff monthly display is actual payment, budgets still save the surplus',()=>{
 const t=bySlug['mortgage-overpayment'],r=calculate(t,{...t.defaults,balance:100,rateA:0,extra:200,termA:1,months:24,savingsRate:0});
 near(r.b.monthly,100);near(r.a.cost,0);near(r.b.cost,0);near(r.a.savings,r.b.savings);
 const zero=calculate(t,{...t.defaults,balance:0});near(zero.a.monthly,0);near(zero.b.monthly,0);near(zero.a.cost,zero.b.cost);
});
test('a lump sum clearing the loan leaves no initial monthly payment',()=>{const t=bySlug['lump-sum-vs-monthly-overpayment'],r=calculate(t,{...t.defaults,lump:t.defaults.balance});near(r.b.monthly,0);near(r.b.balance,0);});
test('ERC, cash fee and other costs are each counted once',()=>{const t=bySlug['early-repayment-charge-vs-switching'],r=calculate(t,{...t.defaults,erc:1234.56,feeB:999.23,other:123.45});near(r.b.cost-r.b.interest,2357.24);near(r.b.cash-r.b.cost,t.defaults.balance-r.b.balance);});
test('reset fees are not charged after early repayment',()=>{const m=mortgage({principal:1000,rate:0,years:1,months:60,changes:[{month:25,rate:20,fee:20000}]});near(m.fees,0);near(m.balance,0);});
test('remaining balance independently matches discounted future instalments',()=>{for(const rate of [0,.037,4.37,20])for(const years of [1,25,40]){const n=years*12,m=Math.floor(n/2),p=payment(234567.23,rate,years);let pv=0;for(let i=1;i<=n-m;i++)pv+=p/(1+rate/1200)**i;near(mortgage({principal:234567.23,rate,years,months:m}).balance,pv,.01);}});
test('savings agrees with independent dated cash flows',()=>{const rate=3.037,n=480;let expected=12345.23*(1+rate/100)**(n/12);for(let i=1;i<=n;i++)expected+=123.23*(1+rate/100)**((n-i)/12);near(savings(12345.23,123.23,rate,n),expected);});
test('rent/buy fees reduce wealth once with 100% cash purchase',()=>{const t=bySlug['rent-vs-buy'],r=calculate(t,{...t.defaults,depositA:100,rateA:0,houseGrowth:0,savingsRate:0,maintenance:0,rent:100,rentGrowth:0,legal:1000,survey:200,removals:300,tax:400,months:12});near(r.a.cost,1900);near(r.b.cost,1200);near(r.a.balance,0);near(r.a.monthly,0);});
test('deposit opportunity cost uses only the retained upfront difference',()=>{const t=bySlug['five-vs-ten-percent-deposit'],r=calculate(t,{...t.defaults,rateA:0,rateB:0,houseGrowth:0,maintenance:0,legal:0,survey:0,removals:0,tax:0,savingsRate:5,months:12});near(r.a.cost,-625);near(r.b.cost,0);});
test('break-even is the first strictly cheaper monthly cumulative cost',()=>{const t=bySlug['remortgage-break-even'],r=calculate(t,t.defaults);assert.ok(r.cross.first>0);for(let i=1;i<r.cross.first;i++)assert.ok(r.a.rows[i].cost-r.b.rows[i].cost<=.005);assert.ok(r.a.rows[r.cross.first].cost-r.b.rows[r.cross.first].cost>.005);});
