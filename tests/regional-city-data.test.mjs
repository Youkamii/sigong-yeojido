import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {contextAt} from '../services/host/app/chronicle.js';
import {planChronicleAssets} from '../services/host/app/chronicle-asset-plan.js';
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const approved=read('../data/research/regional-cities-163/approved.json');
const {scenes}=read('../services/host/app/historical-regions.json');
const claims=approved.sources.flatMap(source=>source.excerpts.flatMap(excerpt=>{
 const key=source.id.replace(/^src-/,'');
 const text=readFileSync(new URL(`../data/claims/${key}/${excerpt.id}.md`,import.meta.url),'utf8');
 return JSON.parse(text.match(/```claims-json\s*([\s\S]*?)```/)[1]);
}));
const data={entities:approved.entities,claims};
const plan=(year,filtered=data)=>planChronicleAssets(contextAt(filtered,year),filtered,[],[],scenes);
test('all 13 actual imported city packets appear only inside their reviewed intervals',()=>{
 assert.equal(scenes.length,13);assert.equal(claims.length,39);
 for(const scene of scenes){
  for(const year of [scene.startYear,scene.endYear]){
   const row=plan(year).events.find(row=>row.id===scene.id);assert.ok(row,scene.id+':'+year);
   assert.equal(row.scenePlace.label,scene.place.label);assert.ok(row.scenePlace.coordinates.every(Number.isFinite));
  }
  for(const year of [scene.startYear-1,scene.endYear+1])assert.ok(!plan(year).events.some(row=>row.id===scene.id));
 }
 assert.ok(plan(1593).events.filter(row=>row.id.startsWith('scene-regional163-')).length>=5);
});
test('native supported-claim checks remove a city when its source is deselected',()=>{
 for(const scene of scenes){
  const source=claims.find(c=>c.id===scene.dateClaimIds[0]).fromSource;
  const filtered={...data,claims:claims.filter(c=>c.fromSource!==source)};
  assert.ok(!plan(scene.startYear,filtered).events.some(row=>row.id===scene.id));
 }
 assert.equal(plan(1593,{...data,claims:[]}).events.length,0);
});
