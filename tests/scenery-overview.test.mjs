import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {planSettlementSites,settlementLayout} from '../services/host/app/settlement-regions.js';
import {sceneryPeriod} from '../services/host/app/scenery-period.js';
import {compileAssetCatalog,normalizeAssetRecipe} from '../services/host/app/assetcatalog.js';
const source=(await readFile(new URL('../services/host/app/scenery-overview.js',import.meta.url),'utf8')).replace("'three'",JSON.stringify(new URL('../services/host/vendor/three.module.min.js',import.meta.url).href));
const {sceneryOverview,setOverviewDetails}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const world={rings:[[[-220,-450],[220,-450],[220,450],[-220,450]]],bounds:{minX:-220,maxX:220,minZ:-450,maxZ:450},seaLevel:7,surfaceAt:()=>8,coordinatesAt:(x,z)=>[127,38-z/100]};
world.toWorld=(lon,lat)=>[(lon-127)*100,(38-lat)*100];
// Explicit synthetic source zones stress geometry batching; the production
// planner no longer invents a national settlement grid.
world.settlementZones=Array.from({length:96},(_,i)=>({id:'fixture-zone:'+i,lon:125.1+(i%8)*.5,lat:34.2+Math.floor(i/8)*.65,startYear:-3000,endYear:2026,kind:'regional',contextType:'settlement',sourceIds:['fixture-source']}));
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
test('near selection hides and restores only matching coarse homes',()=>{
 const site=planSettlementSites(world)[0],period=sceneryPeriod(600),group=sceneryOverview(world,[{site,layout:settlementLayout(site,period)}],period),mesh=group.children.find(c=>c.name==='settlement-roofs'),original=mesh.geometry.attributes.position.array.slice();
 setOverviewDetails(group,[{site,indices:[0]}]);assert.notDeepEqual(mesh.geometry.attributes.position.array,original);
 setOverviewDetails(group,[]);assert.deepEqual(mesh.geometry.attributes.position.array,original);
});
test('asset recipes preserve planned house yaw and default existing recipes to zero',async()=>{
 const catalog=compileAssetCatalog(JSON.parse(await readFile(new URL('../services/host/app/history-asset-catalog.json',import.meta.url),'utf8'))),recipe={id:'house',archetype:'rural_cottage',anchor:'a',scale:.2};
 assert.equal(normalizeAssetRecipe(recipe,catalog,0).recipe.yaw,0);
 assert.equal(normalizeAssetRecipe({...recipe,yaw:Math.PI/2},catalog,0).recipe.yaw,Math.PI/2);
 assert.equal(normalizeAssetRecipe({...recipe,yaw:NaN},catalog,0).recipe.yaw,0);
});
test('early period has no fields and different roof palettes remain visible',()=>{
 const site=planSettlementSites(world)[0],period=sceneryPeriod(-2000),group=sceneryOverview(world,[{site,layout:settlementLayout(site,period)}],period);
 assert.equal(group.children.some(c=>c.name==='decorative-fields'),false);assert.ok(group.children.some(c=>c.name==='settlement-roofs'));
});
