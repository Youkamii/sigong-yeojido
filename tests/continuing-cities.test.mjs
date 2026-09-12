import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {registerHooks} from 'node:module';
import {describeSettlements,SETTLEMENT_RADIUS} from '../services/host/app/historical-regions.js';
import {planContinuingCities} from '../services/host/app/chronicle-sites.js';
import {buildSettlementZones} from '../services/host/app/inhabited-zones.js';
import {coordinateRegistry} from '../services/host/app/history-coordinates.js';
registerHooks({resolve(specifier,context,next){return specifier==='three'?{url:new URL('../services/host/vendor/three.module.min.js',import.meta.url).href,shortCircuit:true,format:'module'}:next(specifier,context);}});
const THREE=await import('three');
const {composeHistoricalEvent}=await import('../services/host/app/chronicle-event-scenes.js');
const json=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const scenes=json('../services/host/app/history-scenes.json'),regions=json('../services/host/app/historical-regions.json');
// Same composition as services/host/index.html (world.scenePackets).
const packets=describeSettlements([...scenes.scenes,...regions.scenes],regions.capitalCorrections);
const anchors=json('../services/host/app/history-place-anchors.json');
const registry=coordinateRegistry(anchors,json('../services/host/app/history-coordinates.json'));
// Catalog candidates inherit dates and provenance from their place in services/places.py load_places.
const catalogs=['places.json',...readdirSync(new URL('../data/',import.meta.url)).filter(name=>/^places-candidates.*\.json$/.test(name)).sort()];
const places=catalogs.flatMap(name=>json('../data/'+name).places).filter(place=>!place.notAPlace&&!place.variantOf)
  .map(place=>({...place,candidates:(place.candidates||[]).map(candidate=>({sourceId:place.sourceId,validFrom:place.validFrom,validTo:place.validTo,...candidate}))}));
const zones=buildSettlementZones(packets,registry,[...places,...anchors.places]);
const activeCities=year=>packets.filter(s=>s.kind==='settlement'&&s.startYear<=year&&year<=s.endYear)
  .map(s=>({id:s.id,archetype:'settlement',scenePlace:{coordinates:[s.place.lon,s.place.lat]}}));
const plan=year=>({year,events:activeCities(year)});
const near=(row,lon,lat)=>Math.hypot(row.scenePlace.coordinates[0]-lon,row.scenePlace.coordinates[1]-lat)<.03;
const rowsAt=year=>planContinuingCities(packets,plan(year),undefined,zones);
const at=(year,lon,lat)=>rowsAt(year).filter(row=>near(row,lon,lat));
const zonesAt=(year,lon,lat)=>zones.filter(zone=>zone.startYear<=year&&year<=zone.endYear&&Math.hypot(zone.lon-lon,zone.lat-lat)<.03);
const JEJU=[126.52194444444,33.509722222222],BUSAN=[129.07595621500008,35.169465885500045],SEOUL=[127,37.583333333333336];
const SABI=[126.89852042850003,36.31324435500005],GAEGYEONG=[126.52319263200002,38.021695409000046];

test('Jeju remains an anonymous town after the 1955–2005 record ends',()=>{
  for(const year of [2006,2020]){
    const rows=at(year,...JEJU);assert.equal(rows.length,1,String(year));
    const [row]=rows;
    assert.equal(row.visualActions.cityStyle,'town');
    assert.deepEqual(row.continuing,{sinceYear:2006,basis:'기록 종료 뒤 존속 추정',sourceSceneId:'scene-regional163-jeju-1955'});
  }
  assert.equal(at(2005,...JEJU).length,0,'active record year has no continuation');
});

test('1960 Busan yields to the modern urban profile',()=>{
  assert.equal(at(1960,...BUSAN).length,0);
  assert.equal(rowsAt(1960).some(row=>row.siteBackground.sourceSceneId.includes('busan')),false);
});

test('700 Sabi continues as a town, not a capital',()=>{
  const rows=at(700,...SABI);assert.equal(rows.length,1);
  assert.equal(rows[0].visualActions.cityStyle,'town');
  assert.equal(rows[0].siteBackground.sourceSceneId,'scene-city-sabi-capital-538-660');
});

test('Seoul: 1350 yields to the newer zone, Hanseong continues until urban Seoul starts in 1945',()=>{
  const zone=zonesAt(1350,...SEOUL).find(zone=>zone.id==='inhabited:place-goryeosa-039');
  assert.ok(zone);assert.equal(zone.startYear,1308);assert.equal(zone.endYear,2100);
  assert.equal(at(1350,...SEOUL).length,0);
  assert.equal(at(1400,...SEOUL).length,0);
  assert.equal(at(1000,...SEOUL).length,0,'nothing before the first record starts');
  for(const year of [1920,1925,1944]){
    assert.ok(zonesAt(year,...SEOUL).includes(zone));
    assert.deepEqual(at(year,...SEOUL).map(row=>row.id),['background-city-scene-city-hanseong-capital-1394-1910'],String(year));
  }
  for(const year of [1945,1950,2020])assert.equal(at(year,...SEOUL).length,0,`urban Seoul profile takes over from 1945: ${year}`);
});

test('1300 Gaegyeong is active in its second interval',()=>{
  assert.equal(at(1300,...GAEGYEONG).length,0);
  assert.equal(at(1250,...GAEGYEONG).length,1,'between the two intervals the town continues');
});

test('rows keep the anonymous-city format used by the scene and context panels',()=>{
  const [row]=at(700,...SABI);
  assert.equal(row.archetype,'settlement');assert.equal(row.setting,true);assert.equal(row.kind,'event');
  assert.equal(row.siteBackground.scope,'anonymous-city');assert.equal(row.scenePlace.settlement.scope,'anonymous-city');
  assert.equal(row.label,'이름 없는 도시 생활 배경');assert.deepEqual(row.participants,[]);assert.equal(row.endYear,undefined);
  assert.ok(row.claimIds.length>0);
  assert.equal(row.summary,'이 위치의 도시 기록을 바탕으로 이름 없는 생활 배경을 이어서 보여줍니다. 이전 도시 명칭과 행정 지위, 사건과 인물의 기간을 연장한 것이 아닙니다. 현재 건물과 거리 배치는 복원도가 아닙니다.\n규모는 축소 표현');
  const before=JSON.stringify([packets,zones]);rowsAt(700);assert.equal(JSON.stringify([packets,zones]),before);
});

test('1450 Gongju: the documented zone starts with the record (475), so the Ungjin continuation coexists instead of yielding',()=>{
  const gongju=[127.12,36.45],id='scene-city-ungjin-capital-475-538';
  const active=zonesAt(1450,...gongju);assert.ok(active.length>0);
  const packet=packets.find(scene=>scene.id===id);
  assert.equal(packet.endYear,538);
  assert.ok(active.every(zone=>zone.startYear<=packet.endYear),'no active Gongju zone starts after the record ends');
  const rows=rowsAt(1450).filter(row=>row.siteBackground.sourceSceneId===id);
  assert.equal(rows.length,1);assert.equal(rows[0].scenePlace.displayScale,0.5);
});

test('zone precedence depends on its start year relative to the record end, even when open-ended',()=>{
  for(const [endYear,startYear,expected] of [[1910,1308,1],[538,757,0]]){
    const scene={id:'stub-city',kind:'settlement',startYear:475,endYear,dateClaimIds:[],actionClaimIds:[],
      place:{lon:0,lat:0,claimIds:[]}};
    const zone={lon:0,lat:0,startYear,endYear:2100,openEnded:true};
    const rows=planContinuingCities([scene],{year:1925,events:[]},undefined,[zone]);
    assert.equal(rows.length,expected,`zone starts ${startYear}, record ends ${endYear}`);
    if(expected)assert.equal(rows[0].id,'background-city-stub-city');
  }
});

test('omitting zones preserves previous callers and latest-ended-record selection',()=>{
  for(const [year,id] of [[1350,'scene-regional163-namgyeong-1099'],[1920,'scene-city-hanseong-capital-1394-1910']]){
    const rows=planContinuingCities(packets,plan(year)).filter(row=>near(row,...SEOUL));
    assert.equal(rows.length,1);assert.equal(rows[0].siteBackground.sourceSceneId,id);
  }
});

test('continuing towns use half scale for composition, radius and occupied space',()=>{
  const flat={contains:()=>true,surfaceAt:()=>0,seaLevel:0};
  for(const year of [700,1350,1450,1795,2006,2020]){
    const rows=rowsAt(year);assert.ok(rows.length>0);
    for(const row of rows)assert.equal(row.scenePlace.displayScale,0.5,row.id);
  }
  const [row]=at(700,...SABI);
  const small=composeHistoricalEvent(row,new THREE.Vector3(),flat);
  const full=composeHistoricalEvent({...row,scenePlace:{...row.scenePlace,displayScale:1}},new THREE.Vector3(),flat);
  assert.equal(small.displayScale,0.5);assert.equal(small.radius,SETTLEMENT_RADIUS*0.5);
  assert.ok(small.models.length>0);assert.equal(small.models.length,full.models.length);
  for(let i=0;i<small.models.length;i++){
    assert.equal(small.models[i].scale,full.models[i].scale*0.5);
    assert.equal(small.models[i].position.x,full.models[i].position.x*0.5);
    assert.equal(small.models[i].position.z,full.models[i].position.z*0.5);
    assert.equal(small.occupied[i].radius,full.occupied[i].radius*0.5);
  }
});
