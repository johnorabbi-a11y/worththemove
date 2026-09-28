import {mortgage,growth,savings,crossing,root} from './engine.js';
function loan(v,{label,rate,years,fee=0,addFee=false,erc=0,other=0,extra=0,lump=0,changes=[]}){
  const principal=v.balance+(addFee?fee:0), up=(addFee?0:fee)+erc+other+lump;
  const m=mortgage({principal,rate,years,months:v.months,extra,lump,changes});
  const full=mortgage({principal,rate,years,months:Math.round(years*12),extra,lump,changes});
  return {label,monthly:m.rows[1]?.payment||0,budget:m.initialPayment+extra,upfront:up,cash:up+m.paid-Math.min(lump,principal)+m.fees,cost:m.interest+fee+erc+other+m.fees,interest:m.interest,balance:m.balance,fullCost:full.interest+fee+erc+other+full.fees,payoff:full.payoff,rows:m.rows.map(r=>({...r,cost:r.interest+fee+erc+other+r.fees})),full};
}
export function compareMortgage(tool,v,{sensitivity=true}={}){
  let a,b,notes=[];const kind=tool.kind;
  const common={years:v.termA,rate:v.rateA,label:tool.a,fee:v.feeA};
  if(kind==='overpay'||kind==='lump'){
    a=loan(v,{...common,extra:kind==='lump'?v.extra:0});
    b=loan(v,{...common,label:tool.b,extra:kind==='overpay'?v.extra:0,lump:kind==='lump'?v.lump:0});
    // Equal cash budgets each month, including after either mortgage pays off.
    const initial=Math.max(a.upfront,b.upfront),r=Math.pow(1+v.savingsRate/100,1/12)-1;
    let sa=initial-a.upfront,sb=initial-b.upfront;
    for(let i=1;i<=v.months;i++){const pa=a.rows[i].payment,pb=b.rows[i].payment,budget=Math.max(a.budget,b.budget);sa=sa*(1+r)+budget-pa;sb=sb*(1+r)+budget-pb;}
    a.savings=sa;b.savings=sb;
    const equalBudget=initial+Math.max(a.budget,b.budget)*v.months;
    a.cost=equalBudget-sa+a.balance-v.balance;b.cost=equalBudget-sb+b.balance-v.balance;
    notes.push('Both options receive the same starting cash and monthly budget. Unspent cash earns your after-tax savings rate, including payments freed after repayment. The comparison includes savings interest; the lifetime interest row does not.');
  }else if(kind==='fix'){
    a=loan(v,{...common,changes:[{month:25,rate:v.resetRate,fee:v.resetFee}]});
    b=loan(v,{label:tool.b,rate:v.rateB,years:v.termA,fee:v.feeB});
    notes.push('Option A resets once, at month 25, to the rate you enter for the rest of the five-year comparison. Its new fee is paid in cash. Option B holds its rate for five years. This is a scenario, not a forecast.');
  }else{
    a=loan(v,common);
    b=loan(v,{label:tool.b,rate:v.rateB,years:v.termB,fee:v.feeB,addFee:!!v.addFee,erc:v.erc,other:v.other});
  }
  let threshold=null;
  if(sensitivity&&['fee','switch','break','erc'].includes(kind)){
    threshold=root(p=>{const x=compareMortgage(tool,{...v,balance:p},{sensitivity:false});return x.a.cost-x.b.cost;},1000,2000000);
  }
  if(sensitivity&&kind==='fix')threshold=root(rate=>{const x=compareMortgage(tool,{...v,resetRate:rate},{sensitivity:false});return x.a.cost-x.b.cost;},0,20);
  const cross=['overpay','lump'].includes(kind)?null:crossing(a.rows,b.rows);
  return {a,b,notes,cross,threshold,thresholdType:kind==='fix'?'reset':'balance',metric:['overpay','lump'].includes(kind)?'Net financing cost after savings interest':'Interest and fees',months:v.months};
}
function home(v,deposit,rate,label){
  const principal=v.price*(1-deposit/100),fees=v.legal+v.survey+v.removals+v.tax;
  const m=mortgage({principal,rate,years:v.termA,months:v.months});
  const value=growth(v.price,v.houseGrowth,v.months),equity=value-m.balance;
  return {label,monthly:m.initialPayment+v.maintenance,upfront:v.price*deposit/100+fees,cash:v.price*deposit/100+fees+m.paid+v.maintenance*v.months,cost:fees+m.interest+v.maintenance*v.months-(value-v.price),interest:m.interest,balance:m.balance,equity,value,ltv:100-deposit,rows:m.rows.map(r=>({...r,cost:fees+r.interest+v.maintenance*r.month-(growth(v.price,v.houseGrowth,r.month)-v.price)}))};
}
export function compareBuying(tool,v){
  const a=home(v,v.depositA,v.rateA,tool.a);let b,notes=[];
  if(tool.kind==='rent'){
    let rent=0;for(let m=0;m<v.months;m++)rent+=v.rent*Math.pow(1+v.rentGrowth/100,Math.floor(m/12));
    b={label:tool.b,monthly:v.rent,upfront:0,cash:rent,cost:rent,interest:0,balance:0,equity:0};
    // Equal starting wealth and monthly contributions. Track differences as cash assets.
    let ownerCash=0,renterCash=a.upfront;const r=Math.pow(1+v.savingsRate/100,1/12)-1;
    for(let m=1;m<=v.months;m++){const ownerSpend=a.rows[m].payment+v.maintenance,rentSpend=v.rent*Math.pow(1+v.rentGrowth/100,Math.floor((m-1)/12)),budget=Math.max(ownerSpend,rentSpend);ownerCash=ownerCash*(1+r)+budget-ownerSpend;renterCash=renterCash*(1+r)+budget-rentSpend;}
    a.savings=ownerCash;b.savings=renterCash;a.wealth=a.equity+ownerCash;b.wealth=renterCash;
    // Common initial capital and common budget cancel: report costs on one baseline.
    let budget=a.upfront;for(let m=1;m<=v.months;m++)budget+=Math.max(a.rows[m].payment+v.maintenance,v.rent*Math.pow(1+v.rentGrowth/100,Math.floor((m-1)/12)));
    a.cost=budget-a.wealth;b.cost=budget-b.wealth;
    notes.push('Both options start with the buyer’s upfront cash and receive an equal monthly budget. Each saves the unused amount at your after-tax savings rate. Rent rises once each year. Refundable tenancy deposits are excluded. Final wealth includes unsold home equity; selling costs are excluded.');
  }else{
    b=home(tool.kind==='purchase'?{...v,price:v.priceB,tax:v.taxB,maintenance:v.maintenanceB}:v,v.depositB,v.rateB,tool.b);
    const extraDeposit=Math.abs(a.upfront-b.upfront),gain=growth(extraDeposit,v.savingsRate,v.months)-extraDeposit;
    if(a.upfront<b.upfront){a.cost-=gain;a.savings=extraDeposit+gain;}else{b.cost-=gain;b.savings=extraDeposit+gain;}
    notes.push('The option needing less upfront cash retains and earns interest on the difference. Monthly payment differences are not reinvested. Legal, survey and removal allowances are shared. Enter actual mortgage quotes for both options.');
  }
  notes.push('Property tax is your entered amount, not an automatically calculated liability. Add service charges, insurance and maintenance to monthly ownership costs. Property growth is an editable scenario and can be negative.');
  return {a,b,months:v.months,metric:'Net housing cost',notes,cross:null,threshold:null};
}
export function compareMoving(tool,v){
  const fees=v.legal+v.survey+v.removals+v.tax+v.currentValue*v.saleFee/100+v.erc;
  const equity=v.currentValue-v.balance;
  function option(label,value,principal,upfront,extraMonthly){
    const m=mortgage({principal,rate:v.rateA,years:v.termA,months:v.months});
    const endValue=growth(value,v.houseGrowth,v.months);
    return {label,monthly:m.initialPayment+extraMonthly,upfront,cash:upfront+m.paid+extraMonthly*v.months,interest:m.interest,balance:m.balance,equity:endValue-m.balance,value:endValue,wealth:endValue-m.balance,cost:0};
  }
  let a,b;const notes=['Existing equity is carried into the comparison. Buying and selling happen immediately. The same borrowing rate and term apply to both options; confirm actual finance and any permission requirements.'];
  if(tool.kind==='extend'){
    const work=v.works*(1+v.contingency/100);
    a=option(tool.a,v.currentValue+v.valueAdded,v.balance+work,0,v.currentRunning);
    const principal=Math.max(0,v.targetValue-equity-v.cash);
    b=option(tool.b,v.targetValue,principal,fees+v.cash,v.newRunning);
    b.released=Math.max(0,equity-v.targetValue);
    if(v.cash>Math.max(0,v.targetValue-equity))throw new RangeError('Extra moving deposit exceeds the amount needed.');
    notes.push('Building work, including contingency, is fully mortgage-financed in Option A. The value added is entered separately from its cost. Fees and any extra moving deposit are paid in cash. Any equity left after buying the replacement home remains in savings. No temporary accommodation costs are included unless added to the works budget.');
  }else{
    a=option(tool.a,v.currentValue,v.balance,0,v.currentRunning);
    b=option(tool.b,v.targetValue,Math.max(0,v.targetValue-equity),fees,v.newRunning);
    b.released=Math.max(0,equity-v.targetValue);
    notes.push('Released equity is sale value less the existing mortgage and replacement home price. Transaction costs are shown separately. Its interest is included using your after-tax savings rate.');
  }
  const initial=Math.max(a.upfront,b.upfront),r=Math.pow(1+v.savingsRate/100,1/12)-1;
  let sa=initial-a.upfront+(a.released||0),sb=initial-b.upfront+(b.released||0);
  const ma=mortgage({principal:tool.kind==='extend'?v.balance+v.works*(1+v.contingency/100):v.balance,rate:v.rateA,years:v.termA,months:v.months});
  const mb=mortgage({principal:Math.max(0,v.targetValue-equity-(tool.kind==='extend'?v.cash:0)),rate:v.rateA,years:v.termA,months:v.months});
  let contributions=initial;
  for(let m=1;m<=v.months;m++){const ca=ma.rows[m].payment+v.currentRunning,cb=mb.rows[m].payment+v.newRunning,budget=Math.max(ca,cb);sa=sa*(1+r)+budget-ca;sb=sb*(1+r)+budget-cb;contributions+=budget;}
  a.savings=sa;b.savings=sb;a.wealth=a.equity+sa;b.wealth=b.equity+sb;
  a.cost=equity+contributions-a.wealth;b.cost=equity+contributions-b.wealth;
  notes.push('Unspent cash and monthly budget differences earn the entered savings rate. Net cost is starting equity plus equal cash contributions minus ending equity and savings. Future sale costs and non-financial benefits are excluded.');
  return {a,b,months:v.months,metric:'Net housing cost',notes,cross:null,threshold:null};
}
export function calculate(tool,values,options){const v={...values};if(tool.kind==='term')v.rateB=v.rateA;return tool.group==='mortgage'?compareMortgage(tool,v,options):tool.group==='buying'?compareBuying(tool,v):compareMoving(tool,v);}
