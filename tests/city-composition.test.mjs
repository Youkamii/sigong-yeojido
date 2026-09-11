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
