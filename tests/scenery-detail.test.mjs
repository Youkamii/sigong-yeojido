import test from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';
import {readFile} from 'node:fs/promises';
// Geometry is real; the texture-only canvas is inert in Node.
globalThis.document={createElement:()=>({getContext:()=>new Proxy({getImageData:()=>({data:new Uint8ClampedArray(512*512*4)}),createImageData:()=>({data:new Uint8ClampedArray(512*512*4)})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))})})};
const three=new URL('../services/host/vendor/three.module.min.js',import.meta.url).href;
register('data:text/javascript,'+encodeURIComponent(`export async function resolve(s,c,n){return s==='three'?{url:${JSON.stringify(three)},shortCircuit:true}:n(s,c);}`),import.meta.url);
const THREE=await import('three'),{compileAssetCatalog}=await import('../services/host/app/assetcatalog.js'),{extendBuildingCatalog}=await import('../services/host/app/period-buildings.js'),{extendFigureCatalog}=await import('../services/host/app/period-figures.js'),{buildAssetField}=await import('../services/host/app/assetforge.js'),{ChronicleScenery}=await import('../services/host/app/chronicle-scenery.js'),{sceneryPeriod}=await import('../services/host/app/scenery-period.js');
const catalog=compileAssetCatalog(extendBuildingCatalog(extendFigureCatalog(JSON.parse(await readFile(new URL('../services/host/app/history-asset-catalog.json',import.meta.url),'utf8')))));
const {URBAN_REGIONS,urbanLayout}=await import('../services/host/app/urban-regions.js');
const {sceneryOverview,setOverviewDetails}=await import('../services/host/app/scenery-overview.js');
const world={ground:[],sky:[],anchorOf:()=>new THREE.Vector3(),surfaceAt:()=>0,time:null,cata:null};
const area=group=>{group.updateWorldMatrix(true,true);const box=new THREE.Box3();group.traverse(o=>{if(o.isMesh&&o.material.visible!==false)box.expandByObject(o);});const s=box.getSize(new THREE.Vector3());return s.x*s.z;};
test('near homes match coarse footprint area using measured era geometry, with cached measurements',()=>{
 for(const year of [-1000,600,1200,1500,1900,1960,2000])for(let seed=0;seed<3;seed++){
  let calls=0,last;
  const assets={engine:{_tagShadows(){}},release:g=>g.removeFromParent(),field:(recipes,anchors)=>{calls++;last=recipes;return buildAssetField({world:{...world,anchorOf:id=>anchors.get(id)},catalog,recipes,seed:'sigong-history'});}};
  const c=Object.create(ChronicleScenery.prototype);Object.assign(c,{assets,world,period:sceneryPeriod(year),houseScales:new Map(),detailCache:new Map(),group:new THREE.Group(),stats:{modelBuilds:0}});
  const site={id:'test',x:0,z:0,angle:0,latitude:35,seed},cell={site,layout:{houses:[{x:0,z:0,scale:.5,angle:0,archetype:'rural_cottage'}]}};
  c.buildDetail(cell);const recipe=last[0],field=buildAssetField({world,catalog,recipes:[recipe],seed:'sigong-history'});
  assert.ok(area(field.group)>2.4*1.9*.25*.78&&area(field.group)<=2.4*1.9*.25+.015,`${year}/${seed}: ${area(field.group)}`);
  const before=calls;c.buildDetail(cell);assert.equal(calls-before,1,'same archetype reuses measured scale');
 }
});

test('urban near facades preserve the same tall bodies and same-period scrubs reuse geometry',()=>{
  const site={id:'urban-region:seoul',kind:'urban',profile:URBAN_REGIONS[0],radius:20,seed:1822,x:0,z:0,angle:0,latitude:37.56};
  const layout=urbanLayout(site,2010),period=sceneryPeriod(2010),overview=sceneryOverview(world,[{site,layout}],period);
  const roofs=overview.children.find(m=>m.name==='settlement-roofs'),original=roofs.geometry.attributes.position.array.slice();
  roofs.geometry.computeBoundingBox();assert.ok(roofs.geometry.boundingBox.max.y>7,'far skyline keeps building heights');
  const c=Object.create(ChronicleScenery.prototype);
  Object.assign(c,{world,assets:{release:g=>g.removeFromParent()},group:new THREE.Group(),period,periodKey:period.id+'|'+site.id+':urban:'+period.id,sites:[site],detailCache:new Map(),stats:{modelBuilds:0,year:2010}});
  const detail=c.buildDetail({site,layout});assert.deepEqual(detail.indices,[]);assert.ok(detail.animated.length>0);
  setOverviewDetails(overview,[detail]);assert.deepEqual(roofs.geometry.attributes.position.array,original);
  c.setYear(2011);assert.equal(c.detailCache.get(site.id),detail);assert.equal(c.stats.modelBuilds,1);
});

test('one event occupancy clips individual city parcels without erasing its neighborhood',()=>{
  const site={id:'urban-region:seoul',kind:'urban',profile:URBAN_REGIONS[0],radius:20,seed:1822,x:0,z:0,angle:0,latitude:37.56};
  const terrain={...world,rings:[[[-100,-100],[100,-100],[100,100],[-100,100]]],contains:()=>true};
  const c=Object.create(ChronicleScenery.prototype);
  Object.assign(c,{world:terrain,assets:{release:g=>g.removeFromParent()},group:new THREE.Group(),period:sceneryPeriod(2010),sites:[site],urbanSites:[site],occupied:[],detailCache:new Map(),stats:{year:2010},showPaths:true});
  c.refreshPeriod();const before=c.stats.houses,first=c.landscapeCells[0].layout.houses[0];
  c.occupied=[{x:first.x,z:first.z,radius:1}];c.refreshPeriod();
  assert.ok(c.stats.houses<before);assert.ok(c.stats.houses>before*.8);assert.equal(c.landscapeCells.length,1);
  c.occupied=[{x:0,z:0,radius:0,urbanRegionId:'seoul'}];c.refreshPeriod();
  assert.equal(c.stats.houses,0,'explicit named city owns the shared district instead of duplicate geometry');
});

test('documented zone activation uses its actual year and reuses geometry between boundaries',()=>{
  const c=Object.create(ChronicleScenery.prototype),site={id:'settlement-region:dated',kind:'town',startYear:1234,endYear:1250};
  let builds=0;Object.assign(c,{sites:[site],stats:{},detailCache:new Map(),initialized:true,occupied:[],assets:{release(){}},refreshPeriod(){builds++;},sync(){}});
  c.setYear(1233);assert.equal(c.activeSites().length,0);
  c.setYear(1234);assert.equal(c.activeSites().length,1);const count=builds;
  c.setYear(1235);assert.equal(builds,count,'same era and same active zone retains geometry');
  c.setYear(1251);assert.equal(c.activeSites().length,0);assert.equal(builds,count+1);
});



test('year scrubs rebuild only changed site layouts, details and affected far batches',()=>{
  const terrain={...world,rings:[[[-100,-100],[800,-100],[800,100],[-100,100]]],contains:()=>true};
  const sites=[['a',25,0],['b',34,60],['c',25,600]].map(([id,seed,x])=>({id:'settlement-region:'+id,seed,x,z:0,
    kind:'village',radius:12,angle:0,layout:0,latitude:35,documented:true,startYear:0,endYear:2026}));
  const assets={engine:{_tagShadows(){}},release:g=>{g.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});g.removeFromParent();},
    field:(recipes,anchors)=>buildAssetField({world:{...terrain,anchorOf:id=>anchors.get(id)},catalog,recipes,seed:'sigong-history'})};
  const c=Object.create(ChronicleScenery.prototype);
  Object.assign(c,{world:terrain,assets,group:new THREE.Group(),sites,urbanSites:[],occupied:[],detailCache:new Map(),houseScales:new Map(),
    stats:{modelBuilds:0},initialized:true,showPaths:true,sync(){}});
  c.setYear(1400);
  const before=new Map(c.landscapeCells.map(cell=>[cell.site.id,cell]));
  for(const cell of c.landscapeCells)c.buildDetail(cell);
  setOverviewDetails(c.overview,[...c.detailCache.values()]);
  const cached=c.detailCache.get(sites[0].id),far=c.overview.children.find(m=>m.userData.bucket==='1:0');
  let disposed=false;far.geometry.addEventListener('dispose',()=>{disposed=true;});
  c.setYear(1401);
  assert.equal(c.stats.refreshedSites,1);assert.equal(c.stats.reusedSites,2);
  assert.equal(c.landscapeCells.find(cell=>cell.site.id===sites[0].id),before.get(sites[0].id));
  assert.notEqual(c.landscapeCells.find(cell=>cell.site.id===sites[1].id),before.get(sites[1].id));
  assert.equal(c.detailCache.get(sites[0].id),cached);assert.equal(c.detailCache.has(sites[1].id),false);
  assert.ok(c.overview.children.includes(far));assert.equal(disposed,false);
  const mesh=c.overview.children.find(m=>m.userData.bucket==='0:0'&&m.userData.houseRanges);
  const range=mesh.userData.houseRanges.find(r=>r.id===sites[0].id&&r.index===cached.indices[0]);
  assert.ok(mesh.geometry.attributes.position.array.subarray(range.start,range.end).every(v=>v===0),'retained details stay hidden even in a rebuilt batch');
  const overview=c.overview;
  c.setYear(1402);assert.equal(c.overview,overview,'no site transition means no refresh');assert.equal(c.stats.modelBuilds,3);
  c.setYear(1400);assert.equal(c.landscapeCells.find(cell=>cell.site.id===sites[1].id).period.id,'goryeo','reverse scrubs restore the prior site period');
  c.setYear(1600);const stable=c.overview;c.setYear(1601);assert.equal(c.overview,stable,'outside transition windows yearly scrubs reuse geometry');
  sites[0].endYear=1601;c.setYear(1602);
  assert.equal(c.stats.refreshedSites,1);assert.equal(c.stats.reusedSites,2);
  assert.ok(c.overview.children.every(m=>!(m.userData.houseRanges||[]).some(r=>r.id===sites[0].id)),'expired sites leave no stale far geometry');
  sites.push({...sites[0],id:'settlement-region:new',x:-60,startYear:1603,endYear:2026});c.setYear(1603);
  assert.equal(c.stats.refreshedSites,1);assert.equal(c.stats.reusedSites,2,'new rural sites retain existing cells');
  const geometry=()=>c.overview.children.map(m=>[m.userData.bucket+':'+m.name,
    Array.from(m.userData.originalPositions||m.geometry.attributes.position.array)]).sort((a,b)=>a[0].localeCompare(b[0]));
  const incremental=geometry();c.refreshPeriod();assert.deepEqual(geometry(),incremental,'partial updates equal a fresh full rebuild');
});

test('filtered and distance-sorted detail houses keep their far variant, yaw and site-period people',async()=>{
  const {sceneryHouseRecipe,sitePeriod}=await import('../services/host/app/scenery-period.js');
  for(const seed of [0,50]){
    let last;
    const assets={engine:{_tagShadows(){}},release:g=>g.removeFromParent(),field:(recipes,anchors)=>{last=recipes;return buildAssetField({world:{...world,anchorOf:id=>anchors.get(id)},catalog,recipes,seed:'sigong-history'});}};
    const site={id:'test',x:0,z:0,angle:.3,latitude:39,seed},period=sitePeriod(site,1392);
    const houses=[{x:2,z:0,scale:.5,angle:.4,archetype:'rural_cottage',lotIndex:7},{x:0,z:0,scale:.5,angle:1.2,archetype:'korean_house',lotIndex:2}];
    const cell={site,period,layout:{houses}},c=Object.create(ChronicleScenery.prototype);
    Object.assign(c,{assets,world,period:sceneryPeriod(1392),houseScales:new Map(),detailCache:new Map(),group:new THREE.Group(),stats:{year:1392,modelBuilds:0}});
    const detail=c.buildDetail(cell);
    assert.deepEqual(detail.indices,[1,0]);
    for(const [i,index] of detail.indices.entries()){
      assert.equal(last[i].archetype,sceneryHouseRecipe(houses[index],period,site,index).archetype);
      assert.equal(last[i].yaw,houses[index].angle);
    }
    assert.equal(last[2].archetype,seed===0?'figure_joseon_commoner':'figure_goryeo_commoner');
    assert.equal(detail.group.rotation.y,site.angle);
  }
});
