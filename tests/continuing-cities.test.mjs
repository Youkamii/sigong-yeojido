import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {describeSettlements} from '../services/host/app/historical-regions.js';
import {planContinuingCities} from '../services/host/app/chronicle-sites.js';
const json=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const scenes=json('../services/host/app/history-scenes.json'),regions=json('../services/host/app/historical-regions.json');
// Same composition as services/host/index.html (world.scenePackets).
const packets=describeSettlements([...scenes.scenes,...regions.scenes],regions.capitalCorrections);
const activeCities=year=>packets.filter(s=>s.kind==='settlement'&&s.startYear<=year&&year<=s.endYear)
  .map(s=>({id:s.id,archetype:'settlement',scenePlace:{coordinates:[s.place.lon,s.place.lat]}}));
const plan=year=>({year,events:activeCities(year)});
const near=(row,lon,lat)=>Math.hypot(row.scenePlace.coordinates[0]-lon,row.scenePlace.coordinates[1]-lat)<.03;
const at=(year,lon,lat)=>planContinuingCities(packets,plan(year)).filter(row=>near(row,lon,lat));
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
  assert.equal(planContinuingCities(packets,plan(1960)).some(row=>row.siteBackground.sourceSceneId.includes('busan')),false);
});

test('700 Sabi continues as a town, not a capital',()=>{
  const rows=at(700,...SABI);assert.equal(rows.length,1);
  assert.equal(rows[0].visualActions.cityStyle,'town');
  assert.equal(rows[0].siteBackground.sourceSceneId,'scene-city-sabi-capital-538-660');
});

test('Seoul: 1350 Namgyeong continues once, 1400 Hanseong record is active',()=>{
  const rows=at(1350,...SEOUL);assert.equal(rows.length,1);
  assert.equal(rows[0].siteBackground.sourceSceneId,'scene-regional163-namgyeong-1099');
  assert.equal(at(1400,...SEOUL).length,0);
  assert.equal(at(1000,...SEOUL).length,0,'nothing before the first record starts');
  const modern=at(1920,...SEOUL);assert.equal(modern.length,1,'several ended records leave the latest one');
  assert.equal(modern[0].siteBackground.recordedEndYear,1910);
  assert.equal(at(1950,...SEOUL).length,0,'urban Seoul profile takes over from 1945');
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
  const before=JSON.stringify(packets);planContinuingCities(packets,plan(700));assert.equal(JSON.stringify(packets),before);
});
