import test from 'node:test';
import assert from 'node:assert/strict';
import {planEstimatedSites,estimatedSiteThreshold,estimatedSitePasses,planSettlementSites} from '../services/host/app/settlement-regions.js';
import {register} from 'node:module';
const three=new URL('../services/host/vendor/three.module.min.js',import.meta.url).href;
register('data:text/javascript,'+encodeURIComponent(`export async function resolve(s,c,n){return s==='three'?{url:${JSON.stringify(three)},shortCircuit:true}:n(s,c);}`),import.meta.url);
const {selectEstimatedSites}=await import('../services/host/app/chronicle-scenery.js');

const world={bounds:{minX:-300,maxX:300,minZ:-500,maxZ:500},seaLevel:7,rings:[[[-300,-500],[300,-500],[300,500],[-300,500]]],surfaceAt:()=>8,
  toWorld:(lon,lat)=>[(lon-127)*100,(38-lat)*100],coordinatesAt:(x,z)=>[127+x/100,38-z/100]};

test('estimated sites are deterministic and marked as undocumented background',()=>{
  const a=planEstimatedSites(world),b=planEstimatedSites(world);
  assert.ok(a.length>0);assert.deepEqual(a,b);
  for(const s of a){
    assert.equal(s.estimated,true);assert.equal(s.documented,false);assert.ok(s.id.startsWith('estimated-region:'));
    assert.equal(s.startYear,-Infinity);assert.equal(s.endYear,Infinity);assert.ok(Number.isFinite(s.latitude));assert.equal(s.basis,'추정 배경 — 사료 없음');
  }
  assert.deepEqual(planSettlementSites(world),[],'documented planner still has no fallback');
});

test('threshold grows with period and shrinks for Jeju and the north',()=>{
  assert.ok(estimatedSiteThreshold('joseon',37)>estimatedSiteThreshold('early-settlement',37));
  assert.ok(estimatedSiteThreshold('joseon',33.4)<estimatedSiteThreshold('joseon',36));
  assert.ok(estimatedSiteThreshold('joseon',39)<estimatedSiteThreshold('joseon',36));
  assert.equal(estimatedSiteThreshold('unknown-period',36),.45);
  const sites=planEstimatedSites(world);
  const count=id=>sites.filter(s=>estimatedSitePasses(s,id)).length;
  assert.ok(count('early-settlement')<count('joseon'));assert.ok(count('joseon')<=count('mechanized'));
});

test('estimated sites yield to documented, urban and occupied areas',()=>{
  const sites=planEstimatedSites(world),first=sites.find(s=>estimatedSitePasses(s,'mechanized'));
  assert.ok(first);
  const documented={x:first.x+first.radius+12+3,z:first.z,radius:12,documented:true};
  assert.ok(!selectEstimatedSites(sites,[documented],[],'mechanized').some(s=>s.id===first.id),'inside documented radius + own radius + 6');
  assert.ok(selectEstimatedSites(sites,[{...documented,x:first.x+first.radius+12+7}],[],'mechanized').some(s=>s.id===first.id),'just outside stays');
  assert.ok(!selectEstimatedSites(sites,[],[{x:first.x+5,z:first.z,radius:40}],'mechanized').some(s=>s.id===first.id),'inside urban radius');
  assert.ok(!selectEstimatedSites(sites,[],[],'mechanized',s=>s.id!==first.id).some(s=>s.id===first.id),'occupied by an event');
  for(const s of selectEstimatedSites(sites,[],[],'early-settlement'))assert.ok(estimatedSitePasses(s,'early-settlement'));
});
