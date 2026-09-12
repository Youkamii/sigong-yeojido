import test from 'node:test';
import assert from 'node:assert/strict';
import {planSettlementSites,settlementLayout,settlementSiteActive,settlementSiteForYear} from '../services/host/app/settlement-regions.js';
const world={rings:[[[-300,-500],[300,-500],[300,500],[-300,500]]],surfaceAt:()=>8,toWorld:(lon,lat)=>[(lon-127)*100,(38-lat)*100]};
const zones=[
  {id:'documented-north',lon:126,lat:40,startYear:918,endYear:2026,kind:'regional',localityType:'city',contextType:'settlement',sourceIds:['source-north']},
  {id:'documented-south',lon:128,lat:35,startYear:300,endYear:1200,kind:'town',localityType:'city',contextType:'settlement',sourceIds:['source-south']},
  {id:'documented-village',lon:126,lat:36,startYear:-3000,endYear:-1500,kind:'village',localityType:'village',contextType:'settlement',sourceIds:['source-village']},
];
test('background settlements exist only at supplied documented locations, with provenance',()=>{
  assert.deepEqual(planSettlementSites(world),[],'no national random fallback');
  const sites=planSettlementSites(world,zones);assert.equal(sites.length,3);assert.deepEqual(sites,planSettlementSites(world,zones));
  for(const s of sites){const zone=zones.find(z=>'settlement-region:'+z.id===s.id);assert.deepEqual([s.x,s.z],world.toWorld(zone.lon,zone.lat));assert.deepEqual(s.sourceIds,zone.sourceIds);assert.equal(s.documented,true);}
  assert.deepEqual(planSettlementSites(world,[{...zones[0],lon:170}]),[]);
});
test('documented period boundaries control habitation without moving or inventing sites',()=>{
  const sites=planSettlementSites(world,zones),village=sites.find(s=>s.kind==='village');
  assert.equal(settlementSiteActive(village,-3001),false);assert.equal(settlementSiteActive(village,-3000),true);
  assert.equal(settlementSiteActive(village,-1500),true);assert.equal(settlementSiteActive(village,-1499),false);
  const city=sites.find(s=>s.kind==='regional');
  assert.equal(settlementSiteForYear(city,1700).kind,'regional');assert.equal(settlementSiteForYear(city,2010).kind,'urban');
  assert.equal(settlementSiteForYear(village,2010).kind,'village');
  const modern=settlementLayout(settlementSiteForYear(city,2010),2010);
  assert.equal(modern.fields.length,0);assert.ok(modern.houses.some(h=>h.type==='apartment'));
});
test('anonymous parcels vary inside source-backed zones while ancient settlements stay smaller',()=>{
  for(const site of planSettlementSites(world,zones)){
    const layout=settlementLayout(site,1700),early=settlementLayout(site,-2000);
    assert.ok(early.houses.length<layout.houses.length);assert.equal(early.fields.length,0);
    for(const h of layout.houses)assert.ok(Math.hypot(h.x,h.z)<site.radius);
    for(const f of layout.fields)for(const p of f.corners)assert.ok(Math.hypot(...p)<site.radius);
    for(let i=0;i<layout.houses.length;i++)for(let j=0;j<i;j++)assert.ok(Math.hypot(layout.houses[i].x-layout.houses[j].x,layout.houses[i].z-layout.houses[j].z)>2.1);
  }
});
