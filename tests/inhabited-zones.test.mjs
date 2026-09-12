import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSettlementZones,settlementZoneKey} from '../services/host/app/inhabited-zones.js';
const scene={id:'city',kind:'settlement',startYear:100,endYear:200,dateClaimIds:['date'],actionClaimIds:['work'],summary:'Dated city activity',place:{label:'City',lon:127,lat:36,medium:'land',claimIds:['location'],coordinateSourceIds:['source-coordinate']}};
test('only dated settlements and explicitly selected livelihoods create zones',()=>{
  const zones=buildSettlementZones([scene,{...scene,id:'battle',kind:'battle'},{...scene,id:'excavation',kind:'excavation',startYear:1975,endYear:1987},{...scene,id:'province',kind:'court'}]);
  assert.equal(zones.length,1);assert.deepEqual(zones[0].claimIds,['date','work','location']);
  assert.equal(settlementZoneKey(zones,99),'');assert.equal(settlementZoneKey(zones,100),settlementZoneKey(zones,199));
  assert.equal(settlementZoneKey(zones,201),'');
});
test('missing dates, missing evidence and between-record estimates do not invent occupation',()=>{
  assert.deepEqual(buildSettlementZones([{...scene,startYear:null},{...scene,actionClaimIds:[]},{...scene,place:{...scene.place,settlement:{scope:'between-records'}}}]),[]);
});
test('institutional coordinates take priority but conflicting institutional points are not chosen arbitrarily',()=>{
  const candidate={lon:126,lat:35,grounded:true,claimId:'institution',fromSource:'institution-source',precision:'site-point-from-institution',validFrom:100,validTo:200};
  const place={id:'anchor',kind:'capital',candidates:[{lon:129,lat:39},candidate]};
  const packet={...scene,place:{...scene.place,anchorPlaceId:'anchor',coordinateSourceIds:[]}};
  assert.equal(buildSettlementZones([packet],{},[place])[0].lon,126);
  assert.deepEqual(buildSettlementZones([packet],{},[{...place,candidates:[candidate,{...candidate,lon:130,claimId:'conflict'}]}]),[]);
});
test('broad geographic places and undated candidates do not generate cities',()=>{
  const candidate={lon:127,lat:36,grounded:true,claimId:'claim',fromSource:'source',validFrom:100,validTo:200};
  assert.deepEqual(buildSettlementZones([],{},[{id:'country',kind:'country',candidates:[candidate]},{id:'city',kind:'city',candidates:[{...candidate,validTo:null}]}]),[]);
});
test('documented regional city points can support anonymous scenery without an archaeological grounded flag',()=>{
  const place={id:'city',kind:'city',labelKo:'City',candidates:[{lon:127,lat:36,grounded:false,sourceId:'record',sourceUrl:'https://example.org/city',basis:'Regional point',dateBasis:'Named city from 940',validFrom:940,validTo:null}]};
  const zones=buildSettlementZones([],{},[place]);
  assert.equal(zones.length,1);assert.equal(zones[0].localityType,'city');assert.equal(zones[0].openEnded,true);
  assert.deepEqual(zones[0].claimIds,[],'Do not invent claim identifiers for older curated evidence');
  assert.equal(buildSettlementZones([],{},[{...place,candidates:[...place.candidates,{...place.candidates[0],lon:130}]}]).length,0);
});
