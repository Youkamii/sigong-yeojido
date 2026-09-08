import {readFile,writeFile} from 'node:fs/promises';
import {contextAt,datedClaims,REFERENCE_GROUPS} from '../services/host/app/chronicle.js';
import {loadChronicle} from '../services/host/app/chronicle-load.js';
const base=process.argv[2]||'http://127.0.0.1:8870',out=process.argv[3];
if(!out)throw Error('Usage: node scripts/audit_chronicle_coverage.mjs BASE OUTPUT.json');
const request=(path,options)=>fetch(new URL(path,base),options);
const response=await request('/api/chronicle');
if(!response.ok)throw Error('Chronicle API returned '+response.status);
const all=await response.json();
const sourceResponse=await request('/api/sources');
if(!sourceResponse.ok)throw Error('Sources API returned '+sourceResponse.status);
const sources=(await sourceResponse.json()).sources;
const selected=sources.filter(s=>REFERENCE_GROUPS.some(g=>g.matches(s))).map(s=>s.id);
const data=await loadChronicle(selected,'all',undefined,request),claims=data.claims;
const sceneResponse=await request('/app/history-scenes.json');
if(!sceneResponse.ok)throw Error('Scene data returned '+sceneResponse.status);
data.scenePackets=(await sceneResponse.json()).scenes;
const periods=[-2333,-57,1,100,200,300,414,540,660,676,698,800,918,1000,1100,1200,1300,1392,1446,1500,1593,1636,1700,1800,1897,1919,1945,1950,1960,1980,2000];
const samples=periods.map(year=>{const c=contextAt(data,year);return {year,people:c.people.map(p=>p.label),currentEvents:c.events.filter(e=>e.current).map(e=>e.label),nearby:c.events.length};});
const dates=datedClaims(data),people=data.entities.filter(e=>e.type==='Person');
const datedPeople=people.filter(e=>dates.some(d=>d.claim.subject===e.id));
const undated=people.filter(e=>!datedPeople.includes(e)).map(p=>({id:p.id,label:p.label,predicates:[...new Set(claims.filter(c=>c.subject===p.id).map(c=>c.predicate))]}));
const original=JSON.parse(await readFile(new URL('../docs/research/history-coverage-96.json',import.meta.url),'utf8')).defaultPeopleWithoutDate;
const contexts=new Map();
const at=year=>{if(!contexts.has(year))contexts.set(year,contextAt(data,year));return contexts.get(year);};
const originalGapAudit=original.map(person=>{
  const eventIds=new Set(claims.filter(c=>c.object.kind==='entity'&&
    (c.object.id===person.id&&['syj:hasParticipant','syj:ledBy'].includes(c.predicate)||c.subject===person.id&&c.predicate==='syj:participatedIn'))
    .map(c=>c.subject===person.id?c.object.id:c.subject));
  const candidates=[...new Set(dates.filter(d=>d.claim.subject===person.id||eventIds.has(d.claim.subject)).flatMap(d=>[d.lo,d.hi]))];
  const year=candidates.find(year=>at(year).people.some(p=>p.id===person.id));
  return {id:person.id,label:person.label,displayable:year!==undefined,sampleYear:year??null};
});
const report={base,checkedAt:new Date().toISOString(),apiHasMore:all.hasMore,allEntitiesByType:Object.fromEntries([...new Set(all.entities.map(e=>e.type))].map(type=>[type,all.entities.filter(e=>e.type===type).length])),
  allClaims:all.claims.length,defaultClaims:claims.length,defaultEntitiesByType:Object.fromEntries([...new Set(data.entities.map(e=>e.type))].map(type=>[type,data.entities.filter(e=>e.type===type).length])),
  defaultPeopleWithAnyDate:datedPeople.length,defaultPeopleWithoutDate:undated,defaultApiHasMore:data.hasMore,
  originalGapAudit,originalGapResolved:originalGapAudit.filter(p=>p.displayable).length,samples};
await writeFile(out,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({out,hasMore:all.hasMore,defaultHasMore:data.hasMore,people:people.length,withDates:datedPeople.length,withoutDates:undated.length,
  originalResolved:report.originalGapResolved,originalRemaining:original.length-report.originalGapResolved}));
