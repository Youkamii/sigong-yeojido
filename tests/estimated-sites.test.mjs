import test from 'node:test';
import assert from 'node:assert/strict';
import {planEstimatedSites,estimatedSiteThreshold,estimatedSitePasses,estimatedIslandSettings,settlementLayout,planSettlementSites,settlementSiteActive} from '../services/host/app/settlement-regions.js';
import {register} from 'node:module';
const three=new URL('../services/host/vendor/three.module.min.js',import.meta.url).href;
register('data:text/javascript,'+encodeURIComponent(`export async function resolve(s,c,n){return s==='three'?{url:${JSON.stringify(three)},shortCircuit:true}:n(s,c);}`),import.meta.url);
const {selectEstimatedSites,ChronicleScenery}=await import('../services/host/app/chronicle-scenery.js');
const {insideCoastline}=await import('../services/host/app/coastline-index.js');
const {planUrbanSites}=await import('../services/host/app/urban-regions.js');
const {createEstimatedWorld,estimatedIslandReport,estimatedDensityReport}=await import('../scripts/check_estimated_islands.mjs');

const world={bounds:{minX:-300,maxX:300,minZ:-500,maxZ:500},seaLevel:7,rings:[[[-300,-500],[300,-500],[300,500],[-300,500]]],surfaceAt:()=>8,
  toWorld:(lon,lat)=>[(lon-127)*100,(38-lat)*100],coordinatesAt:(x,z)=>[127+x/100,38-z/100]};

test('estimated sites are deterministic and marked as undocumented background',()=>{
  const a=planEstimatedSites(world),b=planEstimatedSites(world);
  assert.equal(a.length,261,'mainland baseline measured before the island change');assert.deepEqual(a,b);
  for(const s of a){
    assert.equal(s.estimated,true);assert.equal(s.documented,false);assert.ok(s.id.startsWith('estimated-region:'));
    assert.equal(s.startYear,-Infinity);assert.equal(s.endYear,Infinity);assert.ok(Number.isFinite(s.latitude));assert.equal(s.basis,'추정 배경 — 사료 없음');
  }
  assert.deepEqual(planSettlementSites(world),[],'documented planner still has no fallback');
});

test('medium island grids preserve mainland sites even when the largest ring is not first',()=>{
  const ring=[[311,511],[326,511],[326,521],[311,521]];
  const withIsland={...world,bounds:{...world.bounds,maxX:326,maxZ:521},rings:[ring,...world.rings]};
  const sites=planEstimatedSites(withIsland),island=sites.filter(s=>s.ringIndex===0);
  assert.ok(island.length>=1);assert.deepEqual(sites,planEstimatedSites(withIsland));
  assert.deepEqual(sites.filter(s=>s.ringIndex===1).map(s=>({...s,ringIndex:0})),planEstimatedSites(world));
  for(const s of island)assert.ok(insideCoastline(s.x,s.z,ring));
  assert.ok(selectEstimatedSites(sites,[],[],'joseon').some(s=>s.ringIndex===0));
});

test('island minimum does not override invalid elevation, nonfinite terrain or steep slopes',()=>{
  const ring=[[311,511],[326,511],[326,521],[311,521]];
  for(const surfaceAt of [()=>21,()=>NaN,(x,z)=>x+z-810]){
    const sites=planEstimatedSites({...world,rings:[...world.rings,ring],surfaceAt});
    assert.equal(sites.filter(s=>s.ringIndex===1).length,0);
  }
});

test('medium and large empty rings select their lowest eligible seed in prehistory and Joseon',()=>{
  const candidate=(id,seed,ringIndex,x)=>({id,seed,ringIndex,islandArea:ringIndex===1?120:600,x,z:0,radius:2,latitude:33.4});
  const low=candidate('low',199,1,0),high=candidate('high',299,1,20),other=candidate('other',399,2,40);
  const sites=[high,other,low];
  for(const period of ['early-settlement','joseon']){
    assert.ok(sites.every(s=>!estimatedSitePasses(s,period)));
    assert.deepEqual(selectEstimatedSites(sites,[],[],period),[other,low]);
    assert.deepEqual(selectEstimatedSites([...sites].reverse(),[],[],period).map(s=>s.id).sort(),['low','other']);
    assert.deepEqual(selectEstimatedSites(sites,[],[],period,s=>s!==low),[high,other]);
    assert.deepEqual(selectEstimatedSites(sites,[],[],period,()=>false),[]);
    for(const kind of ['documented','urban']){
      const blocker={x:0,z:0,radius:2};
      const selected=selectEstimatedSites(sites,kind==='documented'?[blocker]:[],kind==='urban'?[blocker]:[],period);
      assert.deepEqual(selected,[high,other],kind+' also excludes the fallback candidate');
      const covering={...blocker,radius:100};
      assert.deepEqual(selectEstimatedSites(sites,kind==='documented'?[covering]:[],kind==='urban'?[covering]:[],period),[]);
    }
  }
  const passing={...high,id:'passing',seed:0};
  assert.deepEqual(selectEstimatedSites([low,passing],[],[],'joseon'),[passing],'a passing site prevents a second fallback');
});

test('real ChronicleWorld islands reach their area minimum and preserve mainland counts',()=>{
  const actual=createEstimatedWorld(),report=estimatedIslandReport(actual),sites=planEstimatedSites(actual);
  assert.equal(report.mainlandCandidates,110,'real world baseline before changes');
  assert.deepEqual(report.years.map(r=>r.mainlandSelected),[10,21,43,57],'baseline with real documented and urban areas');
  assert.ok(report.jejuCandidates>=2);
  for(const row of report.years){
    assert.ok(row.jejuSelected>=1,JSON.stringify(row));
    assert.equal(row.jejuRenderedSites,row.jejuSelected,'selected Jeju sites produce actual house geometry');
    assert.ok(row.jejuHouses>=1);
  }
  assert.equal(report.years[0].jejuFields,0,'prehistoric scenery has no fields');
  assert.ok(report.years[2].jejuHouses>report.years[1].jejuHouses,'later Jeju grows within the same candidate sites');
  assert.ok(report.years.find(r=>r.year===1795).jejuSelected>=2);
  for(const island of report.islands){
    if(island.area<20)assert.equal(island.candidates,0,JSON.stringify(island));
    else if(island.area>=120)assert.ok(island.candidates>=(island.area>=600?Math.max(2,Math.ceil(island.area/576)):1),JSON.stringify(island));
  }
  for(const site of sites)assert.ok(insideCoastline(site.x,site.z,actual.rings[site.ringIndex]));
  assert.deepEqual(sites,planEstimatedSites(actual),'real terrain also produces deterministic sites');
  for(const period of ['early-settlement','joseon']){
    const selected=selectEstimatedSites(sites,[],[],period);
    for(const site of selected.filter(s=>s.islandArea<120))assert.ok(estimatedSitePasses(site,period));
    for(const island of report.islands.filter(i=>i.area>=120))assert.ok(selected.some(s=>s.ringIndex===island.ringIndex));
  }
  const jeju=planUrbanSites(actual).find(s=>s.profile.id==='jeju');assert.ok(jeju);
  const candidate={...sites.find(s=>s.ringIndex===report.jejuRing),x:jeju.x,z:jeju.z,seed:199};
  for(const year of [1954,1955,2020]){
    const selected=selectEstimatedSites([candidate],[],[jeju].filter(s=>settlementSiteActive(s,year)),'mechanized');
    assert.equal(selected.length,year<1955?1:0,'Jeju urban priority from '+year);
  }
});

test('area boundaries omit tiny rings and never guarantee small island candidates or selection',()=>{
  const ring=area=>[[311,511],[311+area/4,511],[311+area/4,515],[311,515]];
  for(const area of [0,19.99,20,80,119.99,120,599.99,600]){
    const rings=[...world.rings,ring(area)],sites=planEstimatedSites({...world,rings}).filter(s=>s.ringIndex===1);
    if(area<20){assert.equal(sites.length,0);continue;}
    assert.ok(sites.length>0,'flat stub produces candidates at area '+area);
    assert.ok(sites.every(s=>Math.abs(s.islandArea-area)<1e-6));
    const failing=sites.map(s=>({...s,seed:199}));
    for(const period of ['early-settlement','joseon','mechanized']){
      assert.ok(failing.every(s=>!estimatedSitePasses(s,period)));
      assert.equal(selectEstimatedSites(failing,[],[],period).length,area<120?0:1,'fallback at area '+area);
      assert.deepEqual(selectEstimatedSites(failing,[],[],()=>period),selectEstimatedSites(failing,[],[],period));
    }
    if(area<120){
      assert.ok(sites.every(s=>s.id.includes(':1:0:')),'no finer grids to guarantee a small island candidate');
      const passing=sites.map(s=>({...s,seed:0}));
      assert.ok(selectEstimatedSites(passing,[],[],'joseon').length>0);
      for(const site of sites)assert.equal(site.radius,6);
    }
  }
  let samples=0;
  const tinyWorld={...world,bounds:{minX:0,maxX:0,minZ:0,maxZ:0},rings:[world.rings[0],ring(19.99)],surfaceAt:()=>{samples++;return 8;}};
  assert.deepEqual(planEstimatedSites(tinyWorld),[]);assert.equal(samples,0,'tiny islands never sample terrain');
});

test('small island layouts have 2 to 4 full-size houses within radius 6 and no village roads or fields',()=>{
  const counts=new Set();
  for(const seed of [0,1,2,199])for(const year of [-2000,1795,2020]){
    const site={id:'estimated-region:island:test',estimated:true,islandArea:80,seed,radius:6,kind:'village',layout:seed%4};
    const layout=settlementLayout(site,year);counts.add(layout.houses.length);
    assert.deepEqual(layout,settlementLayout(site,year));
    assert.ok(layout.houses.length>=2&&layout.houses.length<=4);
    assert.deepEqual(layout.fields,[]);assert.deepEqual(layout.roads,[]);
    for(const h of layout.houses){assert.ok(Math.hypot(h.x,h.z)+Math.hypot(2.4*h.scale,1.9*h.scale)/2<=6);assert.ok(h.scale>=.42);}
  }
  assert.deepEqual([...counts].sort(),[2,3,4]);
});

test('island cell cap is deterministic across rings and boundaries, with mainland unaffected',()=>{
  const {cellSize,cellLimit}=estimatedIslandSettings;
  const islands=[-cellSize,0,cellSize].flatMap((x,cell)=>Array.from({length:7},(_,i)=>({id:`island:${x}:${i}`,seed:i,
    x:x+i,z:-1,radius:2,ringIndex:cell*7+i+1,islandArea:i===6?600:120,latitude:35})));
  const mainland=Array.from({length:5},(_,i)=>({id:'mainland:'+i,seed:i,x:0,z:0,radius:12,ringIndex:0,latitude:35}));
  const sites=[...islands,...mainland],selected=selectEstimatedSites(sites,[],[],'joseon');
  assert.deepEqual(selected.filter(s=>s.islandArea===undefined),mainland);
  for(const x of [-cellSize,0,cellSize]){
    const cell=selected.filter(s=>s.islandArea&&Math.floor(s.x/cellSize)===x/cellSize);
    assert.equal(cell.length,cellLimit);assert.ok(cell.some(s=>s.islandArea===600),'large island takes priority');
  }
  const ids=items=>items.map(s=>s.id).sort();
  assert.deepEqual(ids(selected),ids(selectEstimatedSites([...sites].reverse(),[],[],'joseon')));
  const blocked=selected.find(s=>s.islandArea),next=selectEstimatedSites(sites,[],[],'joseon',s=>s!==blocked);
  assert.equal(next.length,selected.length);assert.ok(!next.includes(blocked),'blocked sites do not consume cap');
  const failing=islands.map(s=>({...s,seed:199}));
  assert.equal(selectEstimatedSites(failing,[],[],'early-settlement').length,cellLimit*3,'fallback cannot override cell cap');
});

test('real world Mokpo density is bounded, Jeju survives and mainland stays at 110',()=>{
  const report=estimatedDensityReport(createEstimatedWorld()),mokpo=report.rows.find(r=>r.name==='mokpo'),jeju=report.rows.find(r=>r.name==='jeju');
  assert.equal(report.mainlandCandidates,110);
  assert.ok(mokpo.islandSelected<=12,JSON.stringify(mokpo));assert.ok(mokpo.houses<=300,JSON.stringify(mokpo));
  assert.ok(jeju.selected>=2,JSON.stringify(jeju));assert.ok(jeju.estimatedRenderedSites>=2);
});

test('same-period year changes reuse candidates and do not refresh selection',()=>{
  const scenery=new ChronicleScenery({world:{...world,contains:(x,z)=>insideCoastline(x,z,world.rings[0])},engine:{add(){}},release:g=>g.removeFromParent()});
  const sites=scenery.sites;let refreshes=0;
  scenery.initialized=true;scenery.refreshPeriod=()=>{refreshes++;};
  scenery.setYear(1795);const first=refreshes;
  assert.ok(first>0);scenery.setYear(1796);assert.equal(refreshes,first);
  scenery.setYear(600);assert.ok(refreshes>first);assert.equal(scenery.sites,sites);
});

test('threshold grows with period and shrinks for Jeju and the north',()=>{
  assert.ok(estimatedSiteThreshold('joseon',37)>estimatedSiteThreshold('early-settlement',37));
  assert.ok(estimatedSiteThreshold('joseon',33.4)<estimatedSiteThreshold('joseon',36));
  assert.ok(estimatedSiteThreshold('joseon',39)<estimatedSiteThreshold('joseon',36));
  assert.equal(estimatedSiteThreshold('unknown-period',36),.45);
  const sites=planEstimatedSites(world);
  const count=id=>sites.filter(s=>estimatedSitePasses(s,id)).length;
  assert.ok(count('early-settlement')<count('joseon'));assert.ok(count('joseon')<=count('mechanized'));
});

test('estimated sites yield to documented, urban and occupied areas',()=>{
  const sites=planEstimatedSites(world),first=sites.find(s=>estimatedSitePasses(s,'mechanized'));
  assert.ok(first);
  const documented={x:first.x+first.radius+12+3,z:first.z,radius:12,documented:true};
  assert.ok(!selectEstimatedSites(sites,[documented],[],'mechanized').some(s=>s.id===first.id),'inside documented radius + own radius + 6');
  assert.ok(selectEstimatedSites(sites,[{...documented,x:first.x+first.radius+12+7}],[],'mechanized').some(s=>s.id===first.id),'just outside stays');
  assert.ok(!selectEstimatedSites(sites,[],[{x:first.x+5,z:first.z,radius:40}],'mechanized').some(s=>s.id===first.id),'inside urban radius');
  assert.ok(!selectEstimatedSites(sites,[],[],'mechanized',s=>s.id!==first.id).some(s=>s.id===first.id),'occupied by an event');
  for(const s of selectEstimatedSites(sites,[],[],'early-settlement'))assert.ok(estimatedSitePasses(s,'early-settlement'));
});
