import {policy} from '../../data/assumptions.js';
export function commercialCard({label,url,disclosure}){
 if(!policy.commercialEnabled)return null;
 if(!label||!disclosure||!url?.startsWith('https://'))throw new Error('Commercial placement requires a label, HTTPS destination and disclosure.');
 const aside=document.createElement('aside');aside.setAttribute('aria-label','Commercial link');
 const p=document.createElement('p');p.textContent=disclosure;
 const a=document.createElement('a');a.textContent=label;a.href=url;a.rel='sponsored noopener';aside.append(p,a);return aside;
}
