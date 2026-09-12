import test from 'node:test';
import assert from 'node:assert/strict';
import {yearSupport,inspectPlan,verifyEveryYear} from '../scripts/verify_every_year.mjs';
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
