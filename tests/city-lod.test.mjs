import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {readFile} from 'node:fs/promises';
registerHooks({resolve(s,c,n){return s==='three'?{url:new URL('../services/host/vendor/three.module.min.js',import.meta.url).href,shortCircuit:true,format:'module'}:n(s,c);}});
globalThis.document={createElement:()=>({getContext:()=>new Proxy({getImageData:()=>({data:new Uint8ClampedArray(512*512*4)}),createImageData:()=>({data:new Uint8ClampedArray(512*512*4)})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))})})};
const THREE=await import('three');
const {createCityLOD}=await import('../services/host/app/city-lod.js');
const {ChronicleAssets}=await import('../services/host/app/chronicle-assets.js');
const {compileAssetCatalog}=await import('../services/host/app/assetcatalog.js');
const {extendBuildingCatalog}=await import('../services/host/app/period-buildings.js');
const catalog=compileAssetCatalog(extendBuildingCatalog(JSON.parse(await readFile(new URL('../services/host/app/history-asset-catalog.json',import.meta.url),'utf8'))));
const assets=Object.assign(Object.create(ChronicleAssets.prototype),{catalog});
function visibleBounds(group){
 group.updateWorldMatrix(true,true);const box=new THREE.Box3();
 group.traverse(o=>{if(o.isMesh&&o.material.visible!==false)box.expandByObject(o);});return box;
}
test('actual far instance matrices retain near apartment, commercial and lowrise height at Seoul and Jeju scales',()=>{
 for(const archetype of ['urban_modern_apartment_2','urban_modern_commercial_1','urban_postwar_lowrise_0','urban_transition_lowrise_1'])for(const scale of [.68*20/72,.68*9/72]){
  const point=new THREE.Vector3(12,3,20),recipe={id:'city',anchor:'city',archetype,scale,offset:[0,3,0]};
  const anchors=new Map([['city',point]]),rows=[{id:'city',kind:'event',year:2010,position:point,focusDistance:30}];
  const detail=assets.field([recipe],anchors),lod=createCityLOD([recipe],anchors,rows,detail);
  const near=visibleBounds(detail.group),far=visibleBounds(lod.group);
  assert.ok(Math.abs(near.max.y-far.max.y)<.015,`${archetype}/${scale}: near top ${near.max.y} far ${far.max.y}`);
  assert.ok(Math.abs(near.min.y-far.min.y)<.015);
  const body=lod.group.getObjectByName('city-distant-bodies'),matrix=new THREE.Matrix4(),size=new THREE.Vector3();
  body.getMatrixAt(0,matrix);size.setFromMatrixScale(matrix);
  if(archetype.includes('apartment'))assert.ok(size.y>scale*20,'tower height survives in the actual instance matrix');
  assert.equal(lod.group.getObjectByName('city-distant-roofs-traditional'),undefined);
  assert.ok(lod.group.getObjectByName(archetype.includes('transition')?'city-distant-roofs-gable':'city-distant-roofs-flat'));
  assert.equal(lod.group.children.length,2);
 }
});
test('LOD switches visibility without rebuilding or changing instance matrices',()=>{
 const recipe={id:'city',anchor:'city',archetype:'urban_modern_apartment_0',scale:.2,offset:[0,0,0]},point=new THREE.Vector3();
 const detail=assets.field([recipe],new Map([['city',point]]));
 const lod=createCityLOD([recipe],new Map([['city',point]]),[{id:'city',kind:'event',year:2010,position:point,focusDistance:10}],detail);
 const body=lod.group.children[0],before=Array.from(body.instanceMatrix.array);
 lod.update({position:new THREE.Vector3(0,0,160)});assert.equal(lod.group.visible,true);assert.equal(detail.group.visible,false);
 lod.update({position:new THREE.Vector3(0,0,1)});assert.equal(lod.group.visible,false);assert.equal(detail.group.visible,true);
 assert.deepEqual(Array.from(body.instanceMatrix.array),before);
});
