import test from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';
import {sceneBudget} from '../services/host/app/scene-quality.js';
import {planEstimatedSites,estimatedSiteThreshold} from '../services/host/app/settlement-regions.js';
const three=new URL('../services/host/vendor/three.module.min.js',import.meta.url).href;
register('data:text/javascript,'+encodeURIComponent(`export async function resolve(s,c,n){return s==='three'?{url:${JSON.stringify(three)},shortCircuit:true}:n(s,c);}`),import.meta.url);
const {selectEstimatedSites,ChronicleScenery}=await import('../services/host/app/chronicle-scenery.js');

test('low budget and shared medium/high object',()=>{
  assert.deepEqual(sceneBudget('low'),{treeTrials:18000,trees:1800,edgeTrees:4,groveTrees:24,estimatedScale:.25});
  assert.deepEqual(sceneBudget('medium'),{treeTrials:180000,trees:18000,edgeTrees:36,groveTrees:180,estimatedScale:1});
  assert.equal(sceneBudget('high'),sceneBudget('medium'));
  assert.equal(sceneBudget(undefined),sceneBudget('medium'));
});
test('scale defaults to the old threshold and low is one quarter',()=>{
  for(const [latitude,base] of [[36,.5],[33,.3],[39,.35],[undefined,.5]]){
    assert.equal(estimatedSiteThreshold('joseon',latitude),base);
    assert.equal(estimatedSiteThreshold('joseon',latitude,{scale:1}),base);
    assert.equal(estimatedSiteThreshold('joseon',latitude,{scale:.25}),base*.25);
  }
});
test('real planner/selector: deterministic subset, mixed layouts, island retained',()=>{
  const world={bounds:{minX:-180,maxX:220,minZ:-180,maxZ:220},seaLevel:7,surfaceAt:()=>8,
    rings:[[[-180,-180],[180,-180],[180,180],[-180,180]],[[200,200],[215,200],[215,210],[200,210]]]};
  const sites=planEstimatedSites(world),select=scale=>selectEstimatedSites(sites,[],[],'joseon',()=>true,{scale});
  const normal=select(1),low=select(.25);
  assert.ok(low.length>0&&low.length<normal.length);
  assert.ok(low.every(s=>normal.includes(s)));
  assert.deepEqual(select(.25),low);
  assert.deepEqual(selectEstimatedSites([...sites].reverse(),[],[],'joseon',()=>true,{scale:.25}).reverse(),low);
  assert.deepEqual([...new Set(low.map(s=>s.layout))].sort(),[0,1,2,3]);
  assert.ok(low.some(s=>s.ringIndex===1));
});
test('fallback and cell cap cannot introduce sites missing from medium',()=>{
  const site=(id,seed,ringIndex,x,islandArea=120)=>({id,seed,ringIndex,x,z:0,radius:1,islandArea});
  const sites=[site('fallback',99,0,0),site('normal-pass',130,0,10),
    ...[0,1,2].map(i=>site('large-'+i,20+i,i+1,20+i,600)),site('cell-overflow',104,4,30,20)];
  const normal=selectEstimatedSites(sites,[],[],'joseon');
  const low=selectEstimatedSites(sites,[],[],'joseon',()=>true,{scale:.25});
  assert.ok(low.every(s=>normal.includes(s)));
  for(const ring of new Set(normal.filter(s=>s.islandArea>=120).map(s=>s.ringIndex)))assert.ok(low.some(s=>s.ringIndex===ring));
});
test('medium/high and automatic downgrade skip rebuilds; low invalidates once',()=>{
  let refresh=0,forest=0;
  const candidates=[],scenery={quality:'medium',stats:{},initialized:true,
    assets:{engine:{quality:'high'},treeCandidates:candidates,forestKey:'existing'},
    requestRefresh(){refresh++;},rebuildForest(){forest++;}};
  for(const quality of ['high','medium','high','medium']){
    scenery.assets.engine.quality=quality;ChronicleScenery.prototype.setQuality.call(scenery);
  }
  assert.equal(refresh,0);assert.equal(forest,0);assert.equal(scenery.assets.treeCandidates,candidates);
  scenery.assets.engine.quality='low';ChronicleScenery.prototype.setQuality.call(scenery);
  assert.equal(refresh,1);assert.equal(forest,1);assert.equal(scenery.assets.treeCandidates,null);
  assert.equal(scenery.assets.forestKey,'existing');
});
