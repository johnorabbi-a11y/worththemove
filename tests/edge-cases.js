import {fields} from '../data/calculators.js';
export function edgeCases(tool){
 const inputs=tool.inputs;
 const bounded=side=>Object.fromEntries(inputs.map(k=>[k,fields[k][side]]));
 const valid=v=>{v={...tool.defaults,...v};if(tool.kind==='lump')v.lump=Math.min(v.lump,v.balance);if(tool.kind==='extend')v.cash=Math.min(v.cash,Math.max(0,v.targetValue-v.currentValue+v.balance));return v;};
 const decimals=Object.fromEntries(inputs.filter(k=>fields[k][1]==='£'||fields[k][1]==='%').map(k=>[k,Math.min(fields[k][3],Math.max(fields[k][2],tool.defaults[k]+(fields[k][1]==='£'?.23:.037)))]));
 return [
  ['default',valid({})],['minimum',valid(bounded(2))],['maximum',valid(bounded(3))],
  ['zero rates',valid(Object.fromEntries(inputs.filter(k=>/rate/i.test(k)).map(k=>[k,0])))],
  ['short horizon',valid(inputs.includes('months')?{months:1}:{})],
  ['long horizon',valid(inputs.includes('months')?{months:480}:{})],
  ['decimals',valid(decimals)]
 ];
}
