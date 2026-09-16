import test from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';
const three=new URL('../services/host/vendor/three.module.min.js',import.meta.url).href;
register('data:text/javascript,'+encodeURIComponent(`export async function resolve(s,c,n){return s==='three'?{url:${JSON.stringify(three)},shortCircuit:true}:n(s,c);}`),import.meta.url);
const THREE=await import('three');
const {KoreaWorld}=await import('../services/host/app/korea.js');

test('batched live state applies once and preserves selection scales',()=>{
  const world=Object.create(KoreaWorld.prototype),scales=[];let applies=0;
  const marker={userData:{head:{scale:{setScalar:s=>scales.push(s)}},ring:{scale:{setScalar:s=>scales.push(s)}}}};
  Object.assign(world,{history:{children:[]},byPlace:new Map([['p',[marker]]]),
    _applyLive(){applies++;}});
  world.setLiveState({year:1593,origin:'human',primary:new Set(['s']),on:new Set(['s']),selected:'p'});
  assert.equal(applies,1);assert.equal(world._year,1593);assert.equal(world._origin,'human');
  assert.deepEqual([...world._on],['s']);assert.deepEqual([...world._primary],['s']);assert.deepEqual(scales,[1.5,1.35]);
});

test('equal historical features retain geometry; coordinate and year changes replace it',()=>{
  const world=Object.create(KoreaWorld.prototype);
  Object.assign(world,{history:new THREE.Group(),historyTargets:[],toWorld:(x,y)=>[x,y],surfaceAt:()=>0});
  const features=[{id:'f',geometry:{type:'Point',coordinates:[127,37]},properties:{}}];
  world.setHistoricalFeatures(features,1593);const original=world.history.children[0];let disposed=0;
  original.geometry.addEventListener('dispose',()=>disposed++);
  world.setHistoricalFeatures(structuredClone(features),1593);
  assert.equal(world.history.children[0],original);assert.equal(disposed,0);
  const changed=structuredClone(features);changed[0].geometry.coordinates[0]=128;
  world.setHistoricalFeatures(changed,1593);assert.equal(disposed,1);assert.notEqual(world.history.children[0],original);
  const second=world.history.children[0];world.setHistoricalFeatures(changed,1594);assert.notEqual(world.history.children[0],second);
});
