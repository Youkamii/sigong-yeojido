import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {planSettlementSites,settlementLayout} from '../services/host/app/settlement-regions.js';
import {sceneryPeriod} from '../services/host/app/scenery-period.js';
const source=(await readFile(new URL('../services/host/app/scenery-overview.js',import.meta.url),'utf8')).replace("'three'",JSON.stringify(new URL('../services/host/vendor/three.module.min.js',import.meta.url).href));
const {sceneryOverview}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const world={rings:[[[-220,-450],[220,-450],[220,450],[-220,450]]],bounds:{minX:-220,maxX:220,minZ:-450,maxZ:450},seaLevel:7,surfaceAt:()=>8,coordinatesAt:(x,z)=>[127,38-z/100]};
test('far scenery uses direct bounded geometry for thousands of homes in all periods',()=>{
 const sites=planSettlementSites(world);
 for(const year of [600,1500,1960]){
  const period=sceneryPeriod(year),cells=sites.map(site=>({site,layout:settlementLayout(site,period)})),homes=cells.reduce((n,c)=>n+c.layout.houses.length,0),group=sceneryOverview(world,cells,period);
  assert.ok(homes>2000);assert.ok(group.children.length<=30);
  const triangles=group.children.reduce((n,m)=>n+m.geometry.attributes.position.count/3,0);
  assert.ok(triangles<250000,`${year}: ${triangles}`);
  for(const mesh of group.children){assert.equal(mesh.castShadow,false);assert.equal(mesh.receiveShadow,false);assert.ok([...mesh.geometry.attributes.position.array].every(Number.isFinite));mesh.geometry.dispose();mesh.material.dispose();}
 }
});
test('early period has no fields and different roof palettes remain visible',()=>{
 const site=planSettlementSites(world)[0],period=sceneryPeriod(-2000),group=sceneryOverview(world,[{site,layout:settlementLayout(site,period)}],period);
 assert.equal(group.children.some(c=>c.name==='decorative-fields'),false);assert.ok(group.children.some(c=>c.name==='settlement-roofs'));
});
