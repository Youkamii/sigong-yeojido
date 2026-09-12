import test from 'node:test';
import assert from 'node:assert/strict';
import {settlementLayout,settlementStyle,SETTLEMENT_RADIUS} from '../services/host/app/historical-regions.js';
const event={id:'scene-city-hanseong-capital-1394-1910',year:1593};
test('capital has many small houses, separate wards, market and peripheral hamlets',()=>{
 const layout=settlementLayout(event);
 assert.ok(layout.filter(r=>['house','courtyard_house','rural_store'].includes(r.archetype)).length>=50);
 assert.equal(new Set(layout.filter(r=>Number.isInteger(r.ward)).map(r=>r.ward)).size,12);
 assert.equal(layout.filter(r=>r.ward==='hamlet').length,8);
 assert.equal(layout.filter(r=>r.ward==='market').length,6);
 assert.equal(layout.filter(r=>r.primary).length,1);
 assert.ok(layout.every(r=>Math.hypot(r.x,r.z)<=SETTLEMENT_RADIUS));
 assert.ok(layout.filter(r=>r.archetype==='house').every(r=>r.scale<.7));
});
test('port, fortified, capital and town have distinct reproducible layouts',()=>{
 const styles=['port','fortified','capital','town'];
 const layouts=styles.map(cityStyle=>settlementLayout({...event,visualActions:{cityStyle}}));
 assert.equal(new Set(layouts.map(JSON.stringify)).size,4);
 for(let i=0;i<4;i++)assert.deepEqual(layouts[i],settlementLayout({...event,visualActions:{cityStyle:styles[i]}}));
 assert.equal(settlementStyle({id:'scene-city-busan-temporary-capital'}),'port');
});
test('compact scenes keep exactly one primary and layout never changes dates or evidence',()=>{
 const source={...event,startYear:1394,endYear:1910,claimIds:['a','b'],compact:true};
 const before=JSON.stringify(source),layout=settlementLayout(source);
 assert.equal(layout.length,1);assert.ok(layout[0].primary);assert.equal(JSON.stringify(source),before);
 assert.equal(settlementLayout({...event,year:1900})[0].archetype,'civic_hall');
});

test('capital role keeps evidence interval separate from city existence',async()=>{
 const {describeSettlements}=await import('../services/host/app/historical-regions.js');
 const scene={id:'scene-city-hanseong-capital-1394-1910',kind:'settlement',startYear:1394,endYear:1910,dateClaimIds:['start','end'],actionClaimIds:['capital'],place:{label:'Hanseong'}};
 const [result]=describeSettlements([scene]);
 assert.deepEqual(result.place.settlement,{scope:'capital-role',startYear:1394,endYear:1910,claimIds:['start','end','capital']});
 assert.equal(scene.place.settlement,undefined);
 assert.equal(result.startYear,1394);assert.equal(result.endYear,1910);
 assert.equal(result.place.settlement.existsSince,undefined);
});

test('scene identity reuses years inside an era and changes at building or dress boundaries',async()=>{
 const {sceneVisualKey}=await import('../services/host/app/chronicle-persistence.js');
 const scene={...event,archetype:'settlement',participants:[],effects:{},scenePlace:{coordinates:[127,37],label:'Hanseong'}};
 const key=year=>sceneVisualKey({...scene,year},{toArray:()=>[10,0,20]},false,100);
 assert.equal(key(1593),key(1594));
 for(const boundary of [918,1392,1876,1895,1945,1970])assert.notEqual(key(boundary-1),key(boundary));
});


test('modern role endings retain anonymous city without extending named roles or actors',async()=>{
 const {planContinuingCities}=await import('../services/host/app/chronicle-sites.js');
 for(const [id,endYear] of [['scene-regional163-jeju-1955',2005],['scene-city-busan-temporary-capital-1950-1953',1953],['scene-city-hanseong-capital-1394-1910',1910]]){
  const source={id,kind:'settlement',startYear:endYear-10,endYear,dateClaimIds:['date'],actionClaimIds:['role'],place:{lon:127,lat:37,claimIds:['place']},participants:[{id:'old-person'}]};
  const before=JSON.stringify(source);
  assert.equal(planContinuingCities([source],{year:endYear,events:[]}).length,0);
  const [background]=planContinuingCities([source],{year:endYear+1,events:[]});
  assert.equal(background.archetype,'settlement');assert.equal(background.label,'?? ?? ?? ?? ??');
  assert.deepEqual(background.participants,[]);assert.equal(background.endYear,undefined);
  assert.equal(background.siteBackground.recordedEndYear,endYear);assert.equal(JSON.stringify(source),before);
  assert.equal(planContinuingCities([source],{year:endYear+1,events:[]},new Map()).length,0);
  assert.equal(planContinuingCities([source],{year:endYear+1,events:[{archetype:'settlement',scenePlace:{coordinates:[127,37]}}]}).length,0);
 }
});
