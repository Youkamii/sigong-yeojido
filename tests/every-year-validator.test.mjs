import test from 'node:test';
import assert from 'node:assert/strict';
import {yearSupport,inspectPlan,verifyEveryYear,classifyYear,inspectUrbanLayout} from '../scripts/verify_every_year.mjs';
test('a known wrong world fails acceptance even when its structure is valid',()=>{
  const row=classifyYear({errors:[],semanticErrors:['modern-north-uses-joseon-family'],support:'SUPPORTED'});
  assert.equal(row.structural,'PASS');assert.equal(row.semantic,'FAIL');assert.equal(row.acceptance,'FAIL');
});
test('an active city cannot be empty or contain fields and invalid dimensions',()=>{
  const site={id:'urban-region:gangnam',profile:{startYear:1970}};
  assert.ok(inspectUrbanLayout(site,{houses:[],fields:[],roads:[]},2010).includes('missing-active-city:urban-region:gangnam'));
  const errors=inspectUrbanLayout(site,{houses:[{x:0,z:0,width:-1,depth:2,height:NaN,archetype:'rural_cottage'}],fields:[{}],roads:[]},2010);
  assert.ok(errors.includes('fields-in-urban-core:urban-region:gangnam'));
  assert.ok(errors.includes('invalid-urban-dimensions:urban-region:gangnam'));
  assert.ok(errors.includes('rural-model-in-urban-core:urban-region:gangnam'));
});
test('year zero and future never receive historical support',()=>{
  assert.equal(yearSupport(0,2026),'INVALID_YEAR');
  assert.equal(yearSupport(2027,2026),'FUTURE_UNSUPPORTED');
  assert.equal(yearSupport(-2500,2026),'SUPPORTED');
});
test('stale and unsupported plan rows fail even with no runtime errors',()=>{
  const errors=inspectPlan(2000,{year:2000,people:[]},{year:2000,people:[],events:[{id:'old',year:1999,claimIds:['missing'],scenePlace:{coordinates:[NaN,35]}}]},new Set(),new Map([['old',{startYear:1900,endYear:1901}]]));
  assert.ok(errors.includes('stale-plan-row:old'));
  assert.ok(errors.includes('missing-claim:old'));
  assert.ok(errors.includes('inactive-packet:old'));
  assert.ok(errors.includes('invalid-coordinate:old'));
});
test('empty and truncated snapshots cannot pass',async()=>{
  await assert.rejects(verifyEveryYear({data:{claims:[],entities:[]}}),/nonempty/);
  await assert.rejects(verifyEveryYear({data:{claims:[{}],entities:[{}],hasMore:true}}),/truncated/);
});
