import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {contextAt} from '../services/host/app/chronicle.js';
import {planChronicleAssets} from '../services/host/app/chronicle-asset-plan.js';
import {sceneryPeriod,sceneryRecipe} from '../services/host/app/scenery-period.js';
import {buildingArchetype,extendBuildingCatalog} from '../services/host/app/period-buildings.js';
import {extendFigureCatalog} from '../services/host/app/period-figures.js';
import {settlementLayout} from '../services/host/app/historical-regions.js';

export function yearSupport(year,currentYear){
  return year===0?'INVALID_YEAR':year>currentYear?'FUTURE_UNSUPPORTED':'SUPPORTED';
}

export function inspectPlan(year,context,plan,claims,packets){
  const errors=[];
  if(context.year!==year||plan.year!==year)errors.push('selected-year-mismatch');
  for(const person of context.people)if(!person.periods.some(p=>p.lo<=year&&year<=p.hi))errors.push('inactive-person:'+person.id);
  for(const row of [...plan.people,...plan.events]){
    if(row.year!=null&&row.year!==year)errors.push('stale-plan-row:'+row.id);
    if(!row.claimIds?.length||row.claimIds.some(id=>!claims.has(id)))errors.push('missing-claim:'+row.id);
    const packet=packets.get(row.id);
    if(packet&&(year<packet.startYear||year>packet.endYear))errors.push('inactive-packet:'+row.id);
    const coordinates=row.scenePlace?.coordinates;
    if(coordinates&&(!Array.isArray(coordinates)||coordinates.length<2||!coordinates.every(Number.isFinite)))errors.push('invalid-coordinate:'+row.id);
    for(const participant of row.participants||[])if((participant.startYear!=null&&year<participant.startYear)||(participant.endYear!=null&&year>participant.endYear))errors.push('inactive-participant:'+participant.entityId);
  }
  return errors;
}

export async function verifyEveryYear(snapshot,{currentYear=2026,onProgress=()=>{}}={}){
  if(!snapshot.data?.claims?.length||!snapshot.data?.entities?.length)throw new Error('A nonempty real chronicle snapshot is required');
  if(snapshot.data.hasMore)throw new Error('Snapshot is truncated (hasMore)');
  for(const key of ['scenePackets','places','features'])if(!Array.isArray(snapshot[key]))throw new Error('Missing snapshot array: '+key);
  const raw=JSON.parse(await readFile(new URL('../services/host/app/history-asset-catalog.json',import.meta.url),'utf8'));
  const catalog=extendFigureCatalog(extendBuildingCatalog(raw));
  const claims=new Set(snapshot.data.claims.map(c=>c.id)),packets=new Map(snapshot.scenePackets.map(p=>[p.id,p]));
  const data={...snapshot.data,scenePackets:snapshot.scenePackets},rows=[];
  for(let year=-2500;year<=2100;year++){
    const support=yearSupport(year,currentYear);
    if(support==='INVALID_YEAR'){rows.push({year,support,structural:'NOT_RUN',visual:'NOT_RUN',acceptance:'UNSUPPORTED'});continue;}
    const row={year,support,structural:'PASS',visual:'NOT_RUN',acceptance:'NOT_VERIFIED',errors:[],gaps:[]};
    try{
      const context=contextAt(data,year),plan=planChronicleAssets(context,data,snapshot.features,snapshot.places,snapshot.scenePackets,snapshot.coordinateRegistry||{});
      row.errors.push(...inspectPlan(year,context,plan,claims,packets));
      const period=sceneryPeriod(year);
      row.period=period.id;
      row.active={people:context.people.length,events:plan.events.length,locatedEvents:plan.events.filter(e=>e.scenePlace||e.locationReference||e.sites?.length).length};
      row.sceneIds=plan.events.map(e=>e.id);
      if(!row.active.people&&!row.active.events)row.gaps.push('no-collected-person-or-event');
      if(!row.active.locatedEvents)row.gaps.push('no-located-event');
      const scenery=[];
      for(const latitude of [35,39])for(let seed=0;seed<100;seed++)for(const archetype of ['rural_hut','rural_store','handcart']){
        const recipe=sceneryRecipe({id:'annual:'+seed,archetype},period,{latitude,seed});
        if(!recipe)continue;
        scenery.push({latitude,archetype:recipe.archetype});
        if(!catalog.blueprints[recipe.archetype])row.errors.push('unknown-scenery-model:'+recipe.archetype);
      }
      row.scenery={south:[...new Set(scenery.filter(s=>s.latitude===35).map(s=>s.archetype))],north:[...new Set(scenery.filter(s=>s.latitude===39).map(s=>s.archetype))]};
      if(year>=1980&&row.scenery.north.some(a=>a.startsWith('era_joseon_')))row.gaps.push('modern-north-uses-joseon-family');
      const city=settlementLayout({id:'annual-capital',year,visualActions:{cityStyle:'capital'}});
      row.cityModels=[...new Set(city.map(r=>buildingArchetype(r.archetype,year)))];
      for(const archetype of row.cityModels)if(archetype!=='human'&&!catalog.blueprints[archetype])row.errors.push('unknown-city-model:'+archetype);
      if(year>=1980&&city.some(r=>r.archetype==='handcart')&&!city.some(r=>/apartment|office|car|bus|tower/.test(r.archetype)&&r.archetype!=='handcart'))row.gaps.push('modern-city-has-no-urban-modern-models');
      row.evidence=row.gaps.length?'GAPS':'PRESENT_NOT_AUDITED';
      if(support==='FUTURE_UNSUPPORTED')row.acceptance='UNSUPPORTED';
    }catch(error){row.errors.push(error.stack||String(error));}
    row.errors=[...new Set(row.errors)];
    if(row.errors.length){row.structural='FAIL';row.acceptance='FAIL';}
    rows.push(row);
    if(year%100===0)onProgress(year);
  }
  return {generatedAt:new Date().toISOString(),metadata:snapshot.metadata||{},scope:{min:-2500,max:2100,currentYear,rows:4601,validYears:4600,renderer:'NOT_RUN',historicalAccuracy:'NOT_AUDITED',geography:'snapshot features only; no per-year API refresh',lifecycle:'packet display bounds only; physical survival NOT_AUDITED'},summary:{rows:rows.length,structuralPass:rows.filter(r=>r.structural==='PASS').length,structuralFail:rows.filter(r=>r.structural==='FAIL').length,unsupported:rows.filter(r=>r.support!=='SUPPORTED').length,evidenceGapYears:rows.filter(r=>r.gaps?.length).length},years:rows};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const args=process.argv.slice(2),get=name=>args[args.indexOf(name)+1];
  if(!args.includes('--snapshot')||!args.includes('--out'))throw new Error('Usage: node scripts/verify_every_year.mjs --snapshot real-world.json --out annual-results.json [--current-year 2026]');
  const snapshot=JSON.parse(await readFile(get('--snapshot'),'utf8'));
  const report=await verifyEveryYear(snapshot,{currentYear:args.includes('--current-year')?Number(get('--current-year')):2026,onProgress:year=>console.log('Checked through '+year)});
  await mkdir(dirname(resolve(get('--out'))),{recursive:true});
  await writeFile(get('--out'),JSON.stringify(report)+'\n');
  console.log(JSON.stringify(report.summary));
  if(report.summary.structuralFail)process.exitCode=1;
}
