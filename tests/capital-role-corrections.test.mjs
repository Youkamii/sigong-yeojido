import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {describeSettlements} from '../services/host/app/historical-regions.js';
import {contextAt} from '../services/host/app/chronicle.js';
import {planChronicleAssets} from '../services/host/app/chronicle-asset-plan.js';
import {activityGeography} from '../services/host/app/activity-geography.js';
const json=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const region=json('../services/host/app/historical-regions.json'),approved=json('../data/research/regional-cities-163/approved.json');
const original=json('../services/host/app/history-scenes.json').scenes.find(s=>s.id==='scene-city-hanseong-capital-1394-1910');
const dir=new URL('../data/claims/encykorea-hanseongbu/activity-96/',import.meta.url);
const claims=readdirSync(dir).filter(name=>name.endsWith('.md')).flatMap(name=>JSON.parse(readFileSync(new URL(name,dir),'utf8').match(/```claims-json\s*([\s\S]*?)```/)[1]));
claims.push(...approved.claims.filter(c=>c.id.startsWith('claim-regional163-hanseong-')));
const packets=describeSettlements([original],region.capitalCorrections);
const data={entities:[{type:'Event',id:original.eventId,label:original.title}],claims,scenePackets:packets};
test('Hanyang/Hanseong name and capital role follow checked 1394–1405 changes',()=>{
 for(const [year,label,capital] of [[1394,'한양부',true],[1395,'한성부',true],[1398,'한성부',true],[1399,'한성부',false],[1404,'한성부',false],[1405,'한성부',true]]){
  const context=contextAt(data,year);const plan=planChronicleAssets(context,data,[],[],packets);
  const row=plan.events.find(row=>row.entityId===original.eventId);assert.ok(row,year);
  assert.equal(row.scenePlace.label,label);assert.equal(row.scenePlace.settlement.scope==='capital-role',capital);
  assert.equal(Boolean(activityGeography(plan)[0].capital),capital);
  if(!capital){assert.match(row.label,/기록 사이 도시 배경/);assert.ok(!context.allEvents.some(event=>event.id===original.eventId&&event.lo<=year&&event.hi>=year),'background is not an annual event card');}
 }
 assert.equal(original.startYear,1394);assert.equal(original.endYear,1910);
});
