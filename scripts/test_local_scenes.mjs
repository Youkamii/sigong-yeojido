import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {contextAt} from '../services/host/app/chronicle.js';
import {planChronicleAssets} from '../services/host/app/chronicle-asset-plan.js';
const json=async path=>JSON.parse(await readFile(new URL('../'+path,import.meta.url),'utf8'));
const packets=(await json('services/host/app/history-scenes.json')).scenes.filter(s=>s.researchCollection==='scenes-135');
const claims=[],entities=new Map();
for(const job of ['forts_settlements','local_conflicts']){
  const d=await json('data/research/scenes-135/'+job+'/result.json');
  for(const e of d.entities)entities.set(e.id,e);
  for(const c of d.claims)claims.push({...c,id:'claim-scenes-135-'+job+'-'+c.id.replace(/^claim-/,''),fromSource:c.sourceId});
}
const data={entities:[...entities.values()],claims,scenePackets:packets};
const plan=y=>planChronicleAssets(contextAt(data,y),data,[],[],packets);
assert.equal(packets.length,20);assert.equal(claims.length,137);
for(const s of packets){
  assert.ok(plan(s.startYear).events.some(e=>e.id===s.id),s.id);
  assert.ok(!plan(s.startYear-1).events.some(e=>e.id===s.id),s.id);
  assert.ok(!plan(s.endYear+1).events.some(e=>e.id===s.id),s.id);
}
const scene=id=>packets.find(s=>s.id.includes(id));
for(const id of ['songgukri','geomdanri','amsadong'])assert.equal(scene(id).kind,'excavation');
assert.equal(scene('myeonghwalsanseong-bidam').effects.attack.enabled,false);
assert.equal(scene('baekjeok').effects.attack.enabled,false);
assert.deepEqual(scene('daeyaseong').visualActions.fireTargets,['rural_store']);
assert.equal(scene('gongsan').place.lat,36.01694);
for(const id of ['gwaneumpo','sherman'])assert.equal(plan(scene(id).startYear).events.find(e=>e.id===scene(id).id).scenePlace,null);
assert.ok(claims.every(c=>c.predicate!=='syj:occurredIn'||['year','time'].includes(c.object.kind)));
assert.equal(contextAt(data,1500).polities.length,0,'Museum organizations must not appear as states');
console.log('PASS: 20 local scenes, 137 claims, date boundaries, excavations, restricted effects and unknown water locations');
