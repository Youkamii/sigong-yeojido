import {writeFile} from 'node:fs/promises';
import {contextAt,datedClaims,REFERENCE_GROUPS} from '../services/host/app/chronicle.js';
const base=process.argv[2]||'http://127.0.0.1:8870',out=process.argv[3];
if(!out)throw Error('Usage: node scripts/audit_chronicle_coverage.mjs BASE OUTPUT.json');
const response=await fetch(base.replace(/\/$/,'')+'/api/chronicle');
if(!response.ok)throw Error('Chronicle API returned '+response.status);
const all=await response.json();
const claims=all.claims.filter(c=>REFERENCE_GROUPS.some(g=>g.matches({id:c.fromSource})));
const refs=new Set(claims.flatMap(c=>[c.subject,c.object.id]).filter(Boolean));
const data={...all,claims,entities:all.entities.filter(e=>refs.has(e.id))};
const periods=[-2333,-57,1,100,200,300,414,540,660,676,698,800,918,1000,1100,1200,1300,1392,1446,1500,1593,1636,1700,1800,1897,1919,1945,1950,1960,1980,2000];
const samples=periods.map(year=>{const c=contextAt(data,year);return {year,people:c.people.map(p=>p.label),currentEvents:c.events.filter(e=>e.current).map(e=>e.label),nearby:c.events.length};});
const dates=datedClaims(data),people=data.entities.filter(e=>e.type==='Person');
const datedPeople=people.filter(e=>dates.some(d=>d.claim.subject===e.id));
const undated=people.filter(e=>!datedPeople.includes(e)).map(p=>({id:p.id,label:p.label,predicates:[...new Set(claims.filter(c=>c.subject===p.id).map(c=>c.predicate))]}));
const report={base,checkedAt:new Date().toISOString(),apiHasMore:all.hasMore,allEntitiesByType:Object.fromEntries([...new Set(all.entities.map(e=>e.type))].map(type=>[type,all.entities.filter(e=>e.type===type).length])),
  allClaims:all.claims.length,defaultClaims:claims.length,defaultEntitiesByType:Object.fromEntries([...new Set(data.entities.map(e=>e.type))].map(type=>[type,data.entities.filter(e=>e.type===type).length])),
  defaultPeopleWithAnyDate:datedPeople.length,defaultPeopleWithoutDate:undated,samples};
await writeFile(out,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({out,hasMore:all.hasMore,people:people.length,withDates:datedPeople.length,withoutDates:undated.length}));
