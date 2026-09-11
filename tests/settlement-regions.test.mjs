import test from 'node:test';
import assert from 'node:assert/strict';
import {planSettlementSites,settlementLayout} from '../services/host/app/settlement-regions.js';

function world(surfaceAt=()=>8){
  const rings=[[[-300,-500],[300,-500],[300,500],[-300,500]],[[-280,540],[-160,540],[-160,640],[-280,640]]];
  return {rings,bounds:{minX:-300,maxX:300,minZ:-500,maxZ:640},seaLevel:7,surfaceAt,coordinatesAt:(x,z)=>[127+x/100,38-z/100]};
}

test('deterministic regions span north, central, south and a separate island without overlaps',()=>{
  const w=world(),sites=planSettlementSites(w);
  assert.deepEqual(sites,planSettlementSites(w));
  for(const accepts of [s=>s.z< -200,s=>Math.abs(s.z)<100,s=>s.z>200&&s.z<500,s=>s.z>540])assert.ok(sites.some(accepts));
  assert.deepEqual(new Set(sites.map(s=>s.kind)),new Set(['village','town','regional']));
  assert.ok(sites.reduce((n,s)=>n+settlementLayout(s,1960).houses.length,0)>5000);
  for(let i=0;i<sites.length;i++)for(let j=0;j<i;j++)assert.ok(Math.hypot(sites[i].x-sites[j].x,sites[i].z-sites[j].z)>sites[i].radius+sites[j].radius);
});

test('peaks and steep slopes stay uninhabited',()=>{
  assert.equal(planSettlementSites(world(()=>40)).length,0);
  assert.equal(planSettlementSites(world((x,z)=>8+x*.5)).length,0);
});

test('layouts stay in checked land footprints with modest houses and fewer ancient homes',()=>{
  for(const site of planSettlementSites(world())){
    const layout=settlementLayout(site,1960),early=settlementLayout(site,-2000);
    assert.deepEqual(layout,settlementLayout(site,{year:1960,fields:true}));
    assert.ok(early.houses.length<layout.houses.length);
    assert.equal(early.fields.length,0);
    for(const house of layout.houses){assert.ok(house.scale<=.65);assert.ok(Math.hypot(house.x,house.z)<site.radius);}
    for(const field of layout.fields)for(const p of field.corners)assert.ok(Math.hypot(...p)<site.radius);
    for(const road of layout.roads)for(const p of road.points)assert.ok(Math.hypot(...p)<site.radius);
  }
});
