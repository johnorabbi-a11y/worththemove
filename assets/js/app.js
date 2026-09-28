import {bySlug,fields} from '../../data/calculators.js';
import {calculate} from './compare.js';
import {report} from './report.js';
const form=document.querySelector('[data-calculator]');
if(form){
 const tool=bySlug[form.dataset.calculator],result=document.getElementById('results'),status=document.getElementById('result-status'),error=document.getElementById('form-error');
 const params=new URLSearchParams(location.search);
 for(const key of tool.inputs){const input=form.elements.namedItem(key);if(params.has(key)&&Number.isFinite(Number(params.get(key))))input.value=params.get(key);}
 function run(announce=true){
   error.textContent='';result.removeAttribute('data-stale');
   if(!form.checkValidity()){result.dataset.stale='true';status.textContent='Check the highlighted fields to update your comparison.';return false;}
   try{
    const v={...tool.defaults};for(const key of tool.inputs)v[key]=Number(form.elements.namedItem(key).value);
    if(v.lump>v.balance&&tool.kind==='lump')throw new RangeError('The lump sum cannot exceed the mortgage balance.');
    const r=calculate(tool,v);result.innerHTML=report(r,tool);if(announce)status.textContent=`Comparison updated for ${v.months} months. ${r.a.cost>r.b.cost?'Option B':'Option A'} has the lower modelled cost${Math.abs(r.a.cost-r.b.cost)<.5?' (effectively equal)':''}.`;
    return true;
   }catch(e){result.dataset.stale='true';error.textContent=e.message;status.textContent='Results have not updated. Correct the input above.';return false;}
 }
 form.addEventListener('submit',e=>{e.preventDefault();if(run())result.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});});
 let timer;form.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>run(),400);});
 form.addEventListener('reset',()=>{clearTimeout(timer);setTimeout(()=>run(),0);});
 run(false);
}
// Optional future commercial placements must include a visible disclosure.
// No analytics, personal data collection, tracking IDs or affiliate links in V1.
