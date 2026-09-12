import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,next){return specifier==='three'?{url:new URL('../services/host/vendor/three.module.min.js',import.meta.url).href,shortCircuit:true,format:'module'}:next(specifier,context);}});
const THREE=await import('three');
const {composeHistoricalEvent}=await import('../services/host/app/chronicle-event-scenes.js');
const {figureArchetype}=await import('../services/host/app/period-figures.js');
test('court scribes use era scholars in actual composition',()=>{
 for(const year of [600,1200,1500]){
  const scene=composeHistoricalEvent({id:'court',archetype:'court',label:'',summary:'',year,participants:[],effects:{}},new THREE.Vector3(),{contains:()=>true,surfaceAt:()=>0});
  assert.equal(scene.models.filter(row=>row.archetype===figureArchetype('scholar',year)).length,8);
  assert.equal(scene.models.filter(row=>row.archetype==='scribe').length,0);
 }
});

test('a coastal city keeps its primary on the unchanged land anchor',()=>{
 const position=new THREE.Vector3(100,0,100);
 const scene=composeHistoricalEvent({id:'coastal-city',archetype:'settlement',label:'',summary:'',year:1500,participants:[],effects:{}},position,{contains:(x,z)=>z>=100,surfaceAt:()=>0});
 const primary=scene.models.find(row=>row.primary);assert.ok(primary);
 assert.deepEqual(primary.position.toArray(),position.toArray());
 assert.ok(scene.models.every(row=>row.position.z>=100));
});


test('2010 city uses urban buildings and roads without fields; 1960 has no tower family',()=>{
 for(const year of [1960,2010]){
  const scene=composeHistoricalEvent({id:'city',archetype:'settlement',label:'',summary:'',year,participants:[],effects:{}},new THREE.Vector3(),{contains:()=>true,surfaceAt:()=>0});
  assert.equal(scene.group.getObjectByName('city-symbolic-fields'),undefined);
  assert.ok(scene.group.getObjectByName('city-local-lanes'));
  assert.ok(scene.models.some(row=>row.archetype.startsWith(year===2010?'urban_modern_apartment':'urban_postwar_lowrise')));
  if(year===1960)assert.ok(scene.models.every(row=>!row.archetype.includes('apartment')));
 }
});


test('Jeju keeps a full city district within the shared local urban extent',()=>{
 const event={id:'jeju',archetype:'settlement',label:'',summary:'',participants:[],effects:{},scenePlace:{coordinates:[126.52194444444,33.509722222222]}};
 const world={contains:()=>true,surfaceAt:()=>0};
 const a=composeHistoricalEvent({...event,year:2005},new THREE.Vector3(),world);
 const b=composeHistoricalEvent({...event,year:2006},new THREE.Vector3(),world);
 assert.equal(a.radius,9);assert.equal(b.radius,a.radius);assert.ok(a.models.length>50);
 assert.deepEqual(a.models.map(m=>[m.archetype,...m.position.toArray(),m.scale]),b.models.map(m=>[m.archetype,...m.position.toArray(),m.scale]));
 assert.ok(a.models.every(m=>Math.hypot(m.position.x,m.position.z)<9));
});
