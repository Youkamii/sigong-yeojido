import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {readFile} from 'node:fs/promises';
registerHooks({resolve(specifier,context,next){return specifier==='three'
  ?{url:new URL('../services/host/vendor/three.module.min.js',import.meta.url).href,shortCircuit:true,format:'module'}
  :{...next(specifier,context),...(specifier.endsWith('.js')?{format:'module'}:{})};}});
const THREE=await import('three');
const {ChronicleAssets}=await import('../services/host/app/chronicle-assets.js');
const {ChronicleScenery}=await import('../services/host/app/chronicle-scenery.js');
const {compileAssetCatalog}=await import('../services/host/app/assetcatalog.js');
const {extendBuildingCatalog}=await import('../services/host/app/period-buildings.js');
const {extendFigureCatalog}=await import('../services/host/app/period-figures.js');
// Real geometry and batching; canvas painting alone is replaced for Node.
const context=new Proxy({getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)}),
  createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),
  createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},
  {get:(target,key)=>target[key]||(()=>{})});
globalThis.document={createElement:()=>({getContext:()=>context})};
const catalog=compileAssetCatalog(extendBuildingCatalog(extendFigureCatalog(JSON.parse(await readFile(new URL('../services/host/app/history-asset-catalog.json',import.meta.url),'utf8')))));
const engine={scene:new THREE.Scene(),add(group){this.scene.add(group);},remove(group){this.scene.remove(group);},_tagShadows(){}};
const world={bounds:{minX:0,maxX:600,minZ:0,maxZ:600},rings:[[[0,0],[600,0],[600,600],[0,600]]],
  surfaceAt:()=>0,contains:(x,z)=>x>0&&x<600&&z>0&&z<600,coordinatesAt:()=>[127,35]};
const assets=new ChronicleAssets(engine,world,catalog);assets.buildForest=()=>{};
assets.forest=new THREE.Group();assets.forestOccupied=[];assets.forestScenes=[];
const scenery=new ChronicleScenery(assets);assets.scenery=scenery;
scenery.start([],1600);await scenery.ready;
assert.equal(scenery.stats.error,undefined);assert.equal(scenery.stats.villages,88);
assert.equal(new Set(scenery.sites.map(site=>site.layout)).size,6);
assert.ok(scenery.stats.houses>=352&&scenery.stats.houses<=792);
const cell=scenery.cells[0],detail=cell.detail,overview=cell.overview,builds=scenery.stats.modelBuilds;
assert.equal(overview.isMesh,true,'Distant villages use one merged mesh each');
scenery.setYear(1601);assert.equal(cell.detail,detail);assert.equal(scenery.stats.modelBuilds,builds);
scenery.update({position:new THREE.Vector3(300,1000,300)},0);
assert.equal(cell.detail.visible,false);assert.equal(cell.overview.visible,true);
scenery.sync([{x:cell.site.x,z:cell.site.z,radius:5}]);assert.equal(cell.group.visible,false);
scenery.sync([]);assert.equal(cell.group.visible,true);
let disposed=0;overview.geometry.addEventListener('dispose',()=>disposed++);
scenery.setYear(1200);await scenery.refreshPeriod();
assert.notEqual(cell.detail,detail);assert.equal(disposed,1);assert.equal(scenery.stats.modelBuilds,builds+88);
assert.ok(cell.models.some(model=>model.archetype.startsWith('era_goryeo_')));
const count={villages:scenery.stats.villages,houses:scenery.stats.houses,fields:scenery.stats.fields,
  layouts:6,distantVillageDraws:scenery.cells.filter(cell=>cell.overview).length,
  triangles:scenery.cells.reduce((sum,cell)=>sum+(cell.overview?.geometry.attributes.position.count||0)/3,0)};
console.log('PASS: actual village geometry, unchanged-year identity, period disposal, source clearings and one-draw LOD',JSON.stringify(count));
scenery.setYear(1944);scenery.setYear(1945);await scenery.refreshPeriod();
assert.ok(scenery.cells.every(cell=>cell.period==='modern-farming'));
assert.ok(cell.models.some(model=>model.archetype==='figure_modern_commoner'),
  'Rapid year changes finish with the current figure era');
const modernDetail=cell.detail,modernBuilds=scenery.stats.modelBuilds;
scenery.setYear(1946);
assert.equal(cell.detail,modernDetail);assert.equal(scenery.stats.modelBuilds,modernBuilds);
console.log('PASS: integrated figure-era boundary, latest-year async completion and same-era reuse');
