// Monthly repayment approximation: interest at month start, payments at month end.
export function payment(principal, annualRate, years) {
  if (![principal,annualRate,years].every(Number.isFinite) || principal<0 || annualRate<0 || years<=0) throw new RangeError('Invalid mortgage inputs.');
  const n=Math.round(years*12), r=annualRate/1200;
  return principal===0?0:r===0?principal/n:principal*r/(-Math.expm1(-n*Math.log1p(r)));
}
export function mortgage({principal,rate,years,months=Math.round(years*12),extra=0,lump=0,changes=[]}) {
  if(![months,extra,lump].every(Number.isFinite)||months<0||months>600||extra<0||lump<0) throw new RangeError('Invalid payment period or overpayment.');
  let regular=payment(principal,rate,years), balance=Math.max(0,principal-lump), paid=Math.min(principal,lump), interest=0, fees=0, currentRate=rate;
  const initialPayment=regular, rows=[{month:0,balance,paid,interest,fees,payment:0}];
  let payoff=balance===0?0:null;
  for(let m=1;m<=Math.round(months);m++){
    const change=changes.find(c=>c.month===m);
    if(change && balance>0){currentRate=change.rate;fees+=change.fee||0;regular=payment(balance,currentRate,Math.max(1,Math.round(years*12)-m+1)/12);}
    const charge=balance*currentRate/1200;
    const actual=Math.min(balance+charge,regular+extra);
    balance=Math.max(0,balance+charge-actual); if(balance<1e-7)balance=0;
    interest+=charge;paid+=actual;
    if(balance===0&&payoff===null)payoff=m;
    rows.push({month:m,balance,paid,interest,fees,payment:actual});
  }
  return {initialPayment,balance,paid,interest,fees,rows,payoff};
}
export const growth=(amount,annual,months)=>amount*Math.pow(1+annual/100,months/12);
export function savings(initial,monthly,annual,months){
  const r=Math.pow(1+annual/100,1/12)-1;
  return Math.abs(r)<1e-12?initial+monthly*months:initial*Math.pow(1+r,months)+monthly*Math.expm1(months*Math.log1p(r))/r;
}
export function crossing(a,b,key='cost'){
  // First strictly cheaper month; reversal later is separately reported.
  const n=Math.min(a.length,b.length);let first=null,lastDiff=0,reverses=false;
  for(let i=0;i<n;i++){const d=a[i][key]-b[i][key];if(i>0&&first===null&&d>0.005)first=i;if(first!==null&&d<-.005)reverses=true;lastDiff=d;}
  return {first,reverses,lastDiff};
}
export function root(fn,lo,hi){let a=fn(lo),b=fn(hi);if(!Number.isFinite(a+b)||a*b>0||(Math.abs(a)<1e-9&&Math.abs(b)<1e-9))return null;for(let i=0;i<55;i++){const mid=(lo+hi)/2,v=fn(mid);if(a*v<=0){hi=mid;b=v;}else{lo=mid;a=v;}}return(lo+hi)/2;}
