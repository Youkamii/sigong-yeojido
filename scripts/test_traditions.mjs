import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {contextAt} from '../services/host/app/chronicle.js';
import {planChronicleAssets} from '../services/host/app/chronicle-asset-plan.js';
import {planTraditions} from '../services/host/app/chronicle-traditions.js';
const json=async p=>JSON.parse(await readFile(new URL('../'+p,import.meta.url),'utf8'));
const raw=await json('data/research/scenes-136/oral_traditions/result.json');
const packet=await json('services/host/app/history-traditions.json');
const scenes=(await json('services/host/app/history-scenes.json')).scenes.filter(s=>s.researchCollection==='scenes-136');
const claims=raw.claims.map(c=>({...c,id:'claim-scenes-136-oral_traditions-'+c.id.replace(/^claim-/,''),fromSource:c.sourceId}));
const data={entities:raw.entities,claims,scenePackets:scenes};
const narratives=new Set(raw.entities.filter(e=>e.type==='Narrative').map(e=>e.id));
assert.equal(narratives.size,9);assert.equal(packet.narratives.length,9);assert.equal(claims.length,67);assert.equal(scenes.length,7);
assert.ok(claims.filter(c=>narratives.has(c.subject)).every(c=>!['syj:occurredIn','syj:tookPlaceAt','syj:hasParticipant'].includes(c.predicate)));
for(const year of [42,550,1145,1281,1500,2025]){
  const context=contextAt(data,year);
  const plan=planChronicleAssets(context,data,[],[],scenes);
  assert.ok(plan.events.every(e=>!narratives.has(e.entityId)),'Stories are not rendered as current historical activities');
  assert.equal(planTraditions(data,packet.narratives,year).length,9,'Story layer is explicitly separate from event year');
  assert.ok(context.people.every(e=>!e.id.startsWith('person-syj136-')||e.id==='person-syj136-seong-hyeon'),'Characters are not dated by book publication');
}
assert.equal(planTraditions({entities:[],claims:[]},packet.narratives,1281).length,0,'Empty sources hide all stories');
for(const n of packet.narratives){
  assert.ok(n.claimIds.every(id=>claims.some(c=>c.id===id)),n.id);
  assert.ok(Number.isFinite(n.place.lon)&&Number.isFinite(n.place.lat)&&n.place.displayBasis,n.id);
}
assert.ok(!scenes.some(s=>s.narrativeId==='nar-syj136-ondal'),'Related book date cannot date the place-name legend');
for(const id of ['nar-syj136-ondal','nar-syj136-arang'])assert.equal(packet.narratives.find(n=>n.id===id).recordingTime.known,false);
console.log('PASS: nine typed narratives, seven document-date introductions, separate settings, unknown dates and source filtering');
