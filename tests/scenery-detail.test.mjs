import test from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';
import {readFile} from 'node:fs/promises';
// Geometry is real; the texture-only canvas is inert in Node.
globalThis.document={createElement:()=>({getContext:()=>new Proxy({getImageData:()=>({data:new Uint8ClampedArray(512*512*4)}),createImageData:()=>({data:new Uint8ClampedArray(512*512*4)})},{get:(o,k)=>o[k]||(()=>({addColorStop(){}}))})})};
const three=new URL('../services/host/vendor/three.module.min.js',import.meta.url).href;
register('data:text/javascript,'+encodeURIComponent(`export async function resolve(s,c,n){return s==='three'?{url:${JSON.stringify(three)},shortCircuit:true}:n(s,c);}`),import.meta.url);
const THREE=await import('three'),{compileAssetCatalog}=await import('../services/host/app/assetcatalog.js'),{extendBuildingCatalog}=await import('../services/host/app/period-buildings.js'),{extendFigureCatalog}=await import('../services/host/app/period-figures.js'),{buildAssetField}=await import('../services/host/app/assetforge.js'),{ChronicleScenery}=await import('../services/host/app/chronicle-scenery.js'),{sceneryPeriod}=await import('../services/host/app/scenery-period.js');
const catalog=compileAssetCatalog(extendBuildingCatalog(extendFigureCatalog(JSON.parse(await readFile(new URL('../services/host/app/history-asset-catalog.json',import.meta.url),'utf8')))));
const world={ground:[],sky:[],anchorOf:()=>new THREE.Vector3(),surfaceAt:()=>0,time:null,cata:null};
const area=group=>{group.updateWorldMatrix(true,true);const box=new THREE.Box3();group.traverse(o=>{if(o.isMesh&&o.material.visible!==false)box.expandByObject(o);});const s=box.getSize(new THREE.Vector3());return s.x*s.z;};
test('near homes match coarse footprint area using measured era geometry, with cached measurements',()=>{
 for(const year of [-1000,600,1200,1500,1900,1960,2000])for(let seed=0;seed<3;seed++){
  let calls=0,last;
  const assets={engine:{_tagShadows(){}},release:g=>g.removeFromParent(),field:(recipes,anchors)=>{calls++;last=recipes;return buildAssetField({world:{...world,anchorOf:id=>anchors.get(id)},catalog,recipes,seed:'sigong-history'});}};
  const c=Object.create(ChronicleScenery.prototype);Object.assign(c,{assets,world,period:sceneryPeriod(year),houseScales:new Map(),detailCache:new Map(),group:new THREE.Group(),stats:{modelBuilds:0}});
  const site={id:'test',x:0,z:0,angle:0,latitude:35,seed},cell={site,layout:{houses:[{x:0,z:0,scale:.5,angle:0,archetype:'rural_cottage'}]}};
  c.buildDetail(cell);const recipe=last[0],field=buildAssetField({world,catalog,recipes:[recipe],seed:'sigong-history'});
  assert.ok(area(field.group)>2.4*1.9*.25*.78&&area(field.group)<=2.4*1.9*.25+.015,`${year}/${seed}: ${area(field.group)}`);
  const before=calls;c.buildDetail(cell);assert.equal(calls-before,1,'same archetype reuses measured scale');
 }
});

